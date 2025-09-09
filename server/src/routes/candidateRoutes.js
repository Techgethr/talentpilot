// src/routes/candidateRoutes.js
const express = require('express');
const candidateController = require('../controllers/candidateController');

const router = express.Router();

// POST /candidates/upload - Upload and process candidate CV
router.post('/upload', candidateController.uploadCV);

// GET /candidates/:id - Get candidate by ID
router.get('/:id', candidateController.getCandidate);

module.exports = router;