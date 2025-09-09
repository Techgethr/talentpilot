// src/controllers/conversationController.js
const tidbService = require('../services/tidbService');
const agentCoordinator = require('../services/agents/agentCoordinator');

/**
 * Get all conversations
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function getAllConversations(req, res) {
  try {
    const conversations = await tidbService.getAllConversations();
    
    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error in getAllConversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get conversation by ID
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function getConversation(req, res) {
  try {
    const { id } = req.params;
    
    const conversation = await tidbService.getConversationById(id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    const messages = await tidbService.getMessagesByConversationId(id);
    
    res.json({
      success: true,
      data: {
        ...conversation,
        messages
      }
    });
  } catch (error) {
    console.error('Error in getConversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Create a new conversation
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function createConversation(req, res) {
  try {
    const { title } = req.body;
    
    const conversationId = await tidbService.createConversation(title || 'New Conversation');
    
    res.status(201).json({
      success: true,
      data: {
        id: conversationId,
        title: title || 'New Conversation'
      }
    });
  } catch (error) {
    console.error('Error in createConversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Send message in conversation
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function sendMessage(req, res) {
  try {
    const { conversationId, message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await tidbService.getConversationById(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
    } else {
      // Create new conversation with first 50 characters of message as title
      const title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
      const newConversationId = await tidbService.createConversation(title);
      conversation = await tidbService.getConversationById(newConversationId);
    }
    
    // Add user message to conversation
    await tidbService.addMessage(conversation.id, 'user', message);
    
    // Process the job description and find matching candidates
    const result = await agentCoordinator.processJobDescription(message);
    
    // Format the response with complete details
    const responseText = formatDetailedAgentResponse(result);
    
    // Add assistant message to conversation
    await tidbService.addMessage(conversation.id, 'assistant', responseText);
    
    // Get all messages for the conversation
    const messages = await tidbService.getMessagesByConversationId(conversation.id);
    
    res.json({
      success: true,
      data: {
        conversation: {
          ...conversation,
          messages
        },
        agentResult: result
      }
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}

/**
 * Format detailed agent response with complete information
 * @param {Object} result - Agent result
 * @returns {string} - Formatted detailed response
 */
function formatDetailedAgentResponse(result) {
  if (!result || !result.candidates) {
    return "I couldn't process your request. Please try again.";
  }
  
  let response = `# Job Analysis Results

`;
  
  // Job Requirements
  response += `## Job Requirements
`;
  response += `- **Title**: ${result.jobRequirements.jobTitle || 'Not specified'}
`;
  response += `- **Experience Level**: ${result.jobRequirements.experienceLevel || 'Not specified'}
`;
  response += `- **Key Skills**: ${result.jobRequirements.requiredSkills?.join(', ') || 'Not specified'}
`;
  response += `- **Education**: ${result.jobRequirements.education || 'Not specified'}

`;
  
  // Candidates Found
  response += `## Candidates Found (${result.candidates.length})

`;
  
  result.candidates.slice(0, 10).forEach((candidate, index) => {
    response += `### ${index + 1}. ${candidate.name}
`;
    response += `- **Email**: ${candidate.email || 'Not provided'}
`;
    response += `- **Phone**: ${candidate.phone || 'Not provided'}
`;
    response += `- **LinkedIn**: ${candidate.linkedinUrl || 'Not provided'}
`;
    response += `- **Match Score**: ${(candidate.similarity * 100).toFixed(1)}%
`;
    
    if (candidate.profileSummary) {
      response += `- **Profile Summary**: ${candidate.profileSummary}
`;
    }
    
    if (candidate.matchAnalysis) {
      response += `- **Match Analysis**:
`;
      response += `  - Match Score: ${candidate.matchAnalysis.matchScore || 'N/A'}
`;
      response += `  - Strengths: ${candidate.matchAnalysis.strengths?.join(', ') || 'N/A'}
`;
      response += `  - Key Skills Match: ${candidate.matchAnalysis.keySkillsMatch?.join(', ') || 'N/A'}
`;
    }
    
    response += `
`;
  });
  
  return response;
}

/**
 * Delete conversation
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function deleteConversation(req, res) {
  try {
    const { id } = req.params;
    
    const conversation = await tidbService.getConversationById(id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    await tidbService.deleteConversation(id);
    
    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteConversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAllConversations,
  getConversation,
  createConversation,
  sendMessage,
  deleteConversation
};