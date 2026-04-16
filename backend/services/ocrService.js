// backend/services/ocrService.js
// OCR service using Tesseract.js for extracting text from images

const Tesseract = require('tesseract.js');
const path = require('path');

/**
 * Extract text from an uploaded image using Tesseract.js OCR
 * @param {Buffer|string} imageInput - Image buffer or absolute path
 * @returns {Promise<string>} - Extracted text from the image
 */
const extractTextFromImage = async (imageInput) => {
  let worker = null;

  try {
    const label = Buffer.isBuffer(imageInput) ? 'uploaded-buffer' : path.basename(imageInput);
    console.log(`🔍 Starting OCR on: ${label}`);

    const langPath = path.join(__dirname, '..');
    worker = await Tesseract.createWorker('eng', 1, {
      // Use /tmp as cache directory — the only writable path in serverless (Vercel)
      cachePath: '/tmp',
      // Local `eng.traineddata` is uncompressed, so disable `.gz` expectation.
      gzip: false,
      // Use the local traineddata file bundled in the repo (avoids CDN download on Vercel)
      langPath,
      logger: (info) => {
        if (info.status === 'recognizing text') {
          // Log progress at 25% intervals
          const progress = Math.round(info.progress * 100);
          if (progress % 25 === 0) {
            console.log(`   OCR Progress: ${progress}%`);
          }
        }
      },
      errorHandler: (err) => {
        // Capture worker/runtime failures (e.g. corrupted image decoding errors)
        console.error('✗ OCR Worker Error:', err?.message || err);
      },
    });

    const {
      data: { text, confidence },
    } = await worker.recognize(imageInput);

    const cleanedText = text
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
      .replace(/[^\S\n]+/g, ' ')  // Normalize whitespace (but keep newlines)
      .trim();

    console.log(`✅ OCR Complete — Confidence: ${Math.round(confidence)}%`);
    console.log(`   Extracted ${cleanedText.length} characters`);

    if (!cleanedText || cleanedText.length < 3) {
      throw new Error('OCR could not extract meaningful text from the image. Please try a clearer image.');
    }

    return cleanedText;
  } catch (error) {
    const errorMessage = error?.message || String(error);

    if (errorMessage.includes('OCR could not extract')) {
      throw error;
    }
    console.error('✗ OCR Error:', errorMessage);
    throw new Error(`Failed to process image: ${errorMessage}`);
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch (terminateError) {
        console.warn(`⚠ OCR worker termination warning: ${terminateError.message}`);
      }
    }
  }
};

module.exports = { extractTextFromImage };
