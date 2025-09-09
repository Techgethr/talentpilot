// src/routes/candidateRoutes.js
const express = require('express');
const multer = require('multer');
const candidateController = require('../controllers/candidateController');

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory as buffer
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF, Word documents, and TXT files
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'text/plain'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Word documents, and TXT files are allowed'));
    }
  }
});

const router = express.Router();

// POST /candidates/upload - Upload and process candidate CV
router.post('/upload', upload.single('cvFile'), candidateController.uploadCV);

// GET /candidates/:id - Get candidate by ID
router.get('/:id', candidateController.getCandidate);

module.exports = router;