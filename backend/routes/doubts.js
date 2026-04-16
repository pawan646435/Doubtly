// backend/routes/doubts.js
// Express routes for doubt-related API endpoints

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  solveDoubt,
  getHistory,
  getDoubtById,
  askFollowUp,
  deleteDoubt,
} = require('../controllers/doubtController');

// POST /api/doubts/solve — Solve a doubt (text or image)
router.post('/solve', upload.single('image'), solveDoubt);

// GET /api/doubts/history — Get past doubts
router.get('/history', getHistory);

// GET /api/doubts/:id — Get a single doubt
router.get('/:id', getDoubtById);

// POST /api/doubts/:id/followup — Ask a follow-up question
router.post('/:id/followup', askFollowUp);

// DELETE /api/doubts/:id — Delete a doubt
router.delete('/:id', deleteDoubt);

module.exports = router;
