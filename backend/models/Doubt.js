// /home/pawankumar/Desktop/Doubtly/backend/models/Doubt.js
// Mongoose schema/model for storing user doubts and AI responses

const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const doubtSchema = new mongoose.Schema(
  {
    // The original question text (typed or extracted via OCR)
    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    // Type of input: 'text' or 'image'
    inputType: {
      type: String,
      enum: ['text', 'image'],
      default: 'text',
    },

    // Original image filename (if uploaded)
    imagePath: {
      type: String,
      default: null,
    },

    // OCR extracted text (if image was uploaded)
    ocrText: {
      type: String,
      default: null,
    },

    // Category of the doubt
    category: {
      type: String,
      enum: ['math', 'coding', 'reasoning', 'theory', 'science', 'general'],
      default: 'general',
    },

    // Detected answer mode used to format the response
    questionType: {
      type: String,
      enum: ['math', 'coding', 'reasoning', 'theory', 'science', 'general'],
      default: 'general',
    },

    // Provider/model used for this doubt
    aiProvider: {
      type: String,
      default: 'nvidia-gemma',
    },
    aiModel: {
      type: String,
      default: 'google/gemma-4-31b-it',
    },

    // AI-generated response with step-by-step explanation
    response: {
      type: String,
      required: true,
    },

    // Key concepts extracted from the response
    keyConcepts: {
      type: [String],
      default: [],
    },

    // Final answer summary
    finalAnswer: {
      type: String,
      default: '',
    },

    // Whether ELI5 mode was used
    eli5Mode: {
      type: Boolean,
      default: false,
    },

    // Follow-up conversation
    followUps: [followUpSchema],

    // Similar practice questions generated
    practiceQuestions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Index for efficient history queries
doubtSchema.index({ createdAt: -1 });
doubtSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Doubt', doubtSchema);
