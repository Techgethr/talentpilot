// src/routes/jobRoutes.js
const express = require('express');
const jobController = require('../controllers/jobController');

const router = express.Router();

// POST /jobs - Create a new job posting
router.post('/', jobController.createJob);

// GET /jobs/:id - Get job by ID
router.get('/:id', jobController.getJob);

// GET /jobs/:id/candidates - Search candidates for a job
router.get('/:id/candidates', jobController.searchCandidates);

module.exports = router;