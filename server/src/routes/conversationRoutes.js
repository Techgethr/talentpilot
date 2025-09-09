// src/routes/conversationRoutes.js
const express = require('express');
const conversationController = require('../controllers/conversationController');

const router = express.Router();

// GET /conversations - Get all conversations
router.get('/', conversationController.getAllConversations);

// POST /conversations - Create a new conversation
router.post('/', conversationController.createConversation);

// GET /conversations/:id - Get conversation by ID
router.get('/:id', conversationController.getConversation);

// PUT /conversations/:id/title - Update conversation title
router.put('/:id/title', conversationController.updateConversationTitle);

// POST /conversations/message - Send message in conversation
router.post('/message', conversationController.sendMessage);

// DELETE /conversations/:id - Delete conversation
router.delete('/:id', conversationController.deleteConversation);

module.exports = router;