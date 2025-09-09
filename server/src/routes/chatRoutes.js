// src/routes/chatRoutes.js
const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

// POST /chat - Handle chat messages
router.post('/', chatController.handleMessage);

module.exports = router;