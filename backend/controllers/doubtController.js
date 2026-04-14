// /home/pawankumar/Desktop/Doubtly/backend/controllers/doubtController.js
// Controller for handling doubt-related HTTP requests

const { extractTextFromImage } = require('../services/ocrService');
const { generateExplanation, generateFollowUp, generatePracticeQuestions } = require('../services/aiService');
const doubtRepository = require('../repositories/doubtRepository');
const fs = require('fs');
const path = require('path');

/**
 * POST /api/doubts/solve
 * Solve a doubt — accepts either text input or image upload
 */
const solveDoubt = async (req, res) => {
  try {
    const { questionText, eli5Mode = false, category = 'general' } = req.body;
    const imageFile = req.file;

    let finalQuestionText = questionText || '';
    let ocrText = null;
    let inputType = 'text';
    let imagePath = null;

    // If an image was uploaded, extract text via OCR
    if (imageFile) {
      inputType = 'image';
      imagePath = imageFile.filename;

      console.log(`📷 Processing uploaded image: ${imageFile.originalname}`);
      try {
        ocrText = await extractTextFromImage(imageFile.path);

        // Use OCR text if no text input was provided
        if (!finalQuestionText) {
          finalQuestionText = ocrText;
        } else {
          // Combine typed text with OCR text
          finalQuestionText = `${finalQuestionText}\n\n[Extracted from image:]\n${ocrText}`;
        }
      } catch (ocrError) {
        console.warn(`⚠ OCR failed: ${ocrError.message}`);

        // If the user typed a question, continue without OCR text.
        // Otherwise return a clear client error instead of a generic 500.
        if (!finalQuestionText || finalQuestionText.trim().length < 3) {
          return res.status(400).json({
            success: false,
            error: ocrError.message || 'Could not read text from image. Please upload a clearer image.',
          });
        }
      }
    }

    // Validate that we have a question
    if (!finalQuestionText || finalQuestionText.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a question (text or image).',
      });
    }

    // Generate AI explanation
    const isEli5 = eli5Mode === 'true' || eli5Mode === true;
    const { response, keyConcepts, finalAnswer, questionType, aiProvider, aiModel } =
      await generateExplanation(
      finalQuestionText,
      isEli5,
      category
      );

    // Save to database
    const doubt = await doubtRepository.createDoubt({
      questionText: finalQuestionText,
      inputType,
      imagePath,
      ocrText,
      category,
      questionType,
      aiProvider,
      aiModel,
      response,
      keyConcepts,
      finalAnswer,
      eli5Mode: isEli5,
    });

    console.log(`💾 Doubt saved: ${doubt._id}`);

    res.status(201).json({
      success: true,
      data: {
        _id: doubt._id,
        id: doubt._id,
        questionText: doubt.questionText,
        inputType: doubt.inputType,
        ocrText: doubt.ocrText,
        response: doubt.response,
        keyConcepts: doubt.keyConcepts,
        finalAnswer: doubt.finalAnswer,
        eli5Mode: doubt.eli5Mode,
        questionType: doubt.questionType,
        aiProvider: doubt.aiProvider,
        aiModel: doubt.aiModel,
        practiceQuestions: doubt.practiceQuestions,
        category: doubt.category,
        createdAt: doubt.createdAt,
      },
    });

    generatePracticeQuestions(finalQuestionText, questionType, aiProvider)
      .then(async (practiceQuestions) => {
        if (!practiceQuestions.length) return;
        await doubtRepository.updateDoubtById(doubt._id, { practiceQuestions });
        console.log(`📝 Practice questions saved for doubt: ${doubt._id}`);
      })
      .catch((practiceError) => {
        console.warn(`⚠ Practice question generation skipped: ${practiceError.message}`);
      });
  } catch (error) {
    console.error('✗ Solve Doubt Error:', error.message);

    const isClientError = /please provide|could not extract|failed to process image|invalid/i.test(
      error.message || ''
    );

    res.status(isClientError ? 400 : 500).json({
      success: false,
      error: error.message || 'Failed to solve doubt. Please try again.',
    });
  }
};

/**
 * GET /api/doubts/history
 * Get paginated history of past doubts
 */
const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const skip = (page - 1) * limit;

    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }

    const [doubts, total] = await Promise.all([
      doubtRepository.listDoubts({
        filter,
        skip,
        limit,
        select: '_id questionText inputType category questionType eli5Mode createdAt finalAnswer',
      }),
      doubtRepository.countDoubts(filter),
    ]);

    res.json({
      success: true,
      data: {
        doubts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('✗ History Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history.',
    });
  }
};

/**
 * GET /api/doubts/:id
 * Get a single doubt by ID
 */
const getDoubtById = async (req, res) => {
  try {
    const doubt = await doubtRepository.getDoubtById(req.params.id);

    if (!doubt) {
      return res.status(404).json({
        success: false,
        error: 'Doubt not found.',
      });
    }

    res.json({
      success: true,
      data: doubt,
    });
  } catch (error) {
    console.error('✗ Get Doubt Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch doubt.',
    });
  }
};

/**
 * POST /api/doubts/:id/followup
 * Ask a follow-up question on an existing doubt
 */
const askFollowUp = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a follow-up question.',
      });
    }

    const doubt = await doubtRepository.getDoubtById(req.params.id);

    if (!doubt) {
      return res.status(404).json({
        success: false,
        error: 'Doubt not found.',
      });
    }

    // Generate follow-up answer with full conversation context
    const answer = await generateFollowUp(
      doubt.questionText,
      doubt.response,
      doubt.followUps,
      question,
      doubt.questionType || doubt.category,
      doubt.aiProvider
    );

    // Add to follow-ups array
    const followUps = [...(doubt.followUps || []), {
      question,
      answer,
      timestamp: new Date(),
    }];

    await doubtRepository.updateDoubtById(req.params.id, { followUps });

    res.json({
      success: true,
      data: {
        question,
        answer,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('✗ Follow-up Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate follow-up answer.',
    });
  }
};

/**
 * DELETE /api/doubts/:id
 * Delete a doubt and its associated image
 */
const deleteDoubt = async (req, res) => {
  try {
    const doubt = await doubtRepository.getDoubtById(req.params.id);

    if (!doubt) {
      return res.status(404).json({
        success: false,
        error: 'Doubt not found.',
      });
    }

    // Delete associated image file if it exists
    if (doubt.imagePath) {
      const imgPath = path.join(__dirname, '..', 'uploads', doubt.imagePath);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await doubtRepository.deleteDoubtById(req.params.id);

    res.json({
      success: true,
      message: 'Doubt deleted successfully.',
    });
  } catch (error) {
    console.error('✗ Delete Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete doubt.',
    });
  }
};

module.exports = {
  solveDoubt,
  getHistory,
  getDoubtById,
  askFollowUp,
  deleteDoubt,
};
