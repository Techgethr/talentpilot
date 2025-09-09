// src/controllers/chatController.js
const chatService = require('../services/chatService');

/**
 * Handle chat message
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function handleMessage(req, res) {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Process the message and get relevant candidates
    const result = await chatService.processMessage(message);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in handleMessage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  handleMessage
};