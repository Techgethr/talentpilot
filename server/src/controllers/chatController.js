// src/controllers/chatController.js
const agentCoordinator = require('../services/agents/agentCoordinator');

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
    
    // Process the job description and find matching candidates
    const result = await agentCoordinator.processJobDescription(message);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in handleMessage:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error: ' + error.message 
    });
  }
}

module.exports = {
  handleMessage
};