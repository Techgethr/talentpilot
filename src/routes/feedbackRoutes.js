// src/routes/feedbackRoutes.js
const express = require('express');
const feedbackController = require('../controllers/feedbackController');

const router = express.Router();

// POST /feedback - Submit feedback on candidate matches
router.post('/', feedbackController.submitFeedback);

// GET /feedback/:jobId - Get feedback for a specific job
router.get('/:jobId', feedbackController.getFeedback);

module.exports = router;