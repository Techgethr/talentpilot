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
    let isNewConversation = false;
    if (conversationId) {
      conversation = await tidbService.getConversationById(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
    } else {
      // Create new conversation with default title
      const title = 'New Conversation';
      const newConversationId = await tidbService.createConversation(title);
      conversation = await tidbService.getConversationById(newConversationId);
      isNewConversation = true;
    }
    
    // Add user message to conversation
    await tidbService.addMessage(conversation.id, 'user', message);
    
    // Process the job description and find matching candidates
    // We'll use a progress callback to update the frontend
    const result = await agentCoordinator.processJobDescription(message);
    
    // Format the response with complete details
    const responseText = formatCompleteAgentResponse(result);
    
    // Add assistant message to conversation
    await tidbService.addMessage(conversation.id, 'assistant', responseText);
    
    // If this is a new conversation and we have a job title, update the conversation title
    if (isNewConversation && result.jobRequirements && result.jobRequirements.jobTitle) {
      const jobTitle = result.jobRequirements.jobTitle;
      // Limit title to 100 characters
      const newTitle = jobTitle.length > 100 ? jobTitle.substring(0, 100) + '...' : jobTitle;
      await tidbService.updateConversationTitle(conversation.id, newTitle);
      // Refresh conversation object with new title
      conversation = await tidbService.getConversationById(conversation.id);
    }
    
    // Get all messages for the conversation
    const messages = await tidbService.getMessagesByConversationId(conversation.id);
    
    res.json({
      success: true,
      data: {
        conversation: {
          ...conversation,
          messages
        },
        agentResult: result,
        candidatesDelivered: result.candidates && result.candidates.length > 0
      }
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}

/**
 * Format complete agent response with all details including contact recommendations
 * @param {Object} result - Agent result
 * @returns {string} - Formatted complete response
 */
function formatCompleteAgentResponse(result) {
  if (!result || !result.candidates) {
    return "I couldn't process your request. Please try again.";
  }
  
  let response = `# Job Analysis Results\n\n`;
  
  // Job Requirements
  response += `## Job Requirements\n`;
  response += `- **Title**: ${result.jobRequirements.jobTitle || 'Not specified'}\n`;
  response += `- **Experience Level**: ${result.jobRequirements.experienceLevel || 'Not specified'}\n`;
  response += `- **Key Skills**: ${result.jobRequirements.requiredSkills?.join(', ') || 'Not specified'}\n`;
  response += `- **Education**: ${result.jobRequirements.education || 'Not specified'}\n\n`;
  
  // Candidates Found
  response += `## Candidates Found (${result.candidates.length})\n\n`;
  
  result.candidates.slice(0, 10).forEach((candidate, index) => {
    response += `### ${index + 1}. ${candidate.name}\n`;
    response += `- **Email**: ${candidate.email || 'Not provided'}\n`;
    response += `- **Phone**: ${candidate.phone || 'Not provided'}\n`;
    response += `- **LinkedIn**: ${candidate.linkedinUrl || 'Not provided'}\n`;
    response += `- **Match Score**: ${(candidate.similarity * 100).toFixed(1)}%\n`;
    
    if (candidate.profileSummary) {
      response += `- **Profile Summary**: ${candidate.profileSummary}\n`;
    }
    
    if (candidate.matchAnalysis) {
      response += `- **Match Analysis**:\n`;
      response += `  - Match Score: ${candidate.matchAnalysis.matchScore || 'N/A'}\n`;
      response += `  - Strengths: ${candidate.matchAnalysis.strengths?.join(', ') || 'N/A'}\n`;
      response += `  - Key Skills Match: ${candidate.matchAnalysis.keySkillsMatch?.join(', ') || 'N/A'}\n`;
    }
    
    // Contact Recommendations
    if (candidate.communicationTemplates) {
      response += `- **Contact Recommendations**:\n`;
      
      // Email template
      if (candidate.communicationTemplates.email) {
        response += `  - **Email Subject**: ${candidate.communicationTemplates.email.subject}\n`;
        response += `  - **Email Body**: ${candidate.communicationTemplates.email.body}\n`;
      }
      
      // LinkedIn message
      if (candidate.communicationTemplates.linkedin) {
        response += `  - **LinkedIn Message**: ${candidate.communicationTemplates.linkedin.message}\n`;
      }
      
      // Phone script
      if (candidate.communicationTemplates.phone) {
        response += `  - **Phone Script**:\n`;
        response += `    - Opening: ${candidate.communicationTemplates.phone.opening}\n`;
        response += `    - Introduction: ${candidate.communicationTemplates.phone.introduction}\n`;
        response += `    - Value Proposition: ${candidate.communicationTemplates.phone.valueProposition}\n`;
        response += `    - Questions: ${candidate.communicationTemplates.phone.questions?.join(', ') || 'N/A'}\n`;
        response += `    - Next Steps: ${candidate.communicationTemplates.phone.nextSteps}\n`;
      }
    }
    
    response += `\n`;
  });
  
  return response;
}

/**
 * Update conversation title
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function updateConversationTitle(req, res) {
  try {
    const { id } = req.params;
    const { title } = req.body;
    
    const conversation = await tidbService.getConversationById(id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    await tidbService.updateConversationTitle(id, title);
    
    res.json({
      success: true,
      message: 'Conversation title updated successfully'
    });
  } catch (error) {
    console.error('Error in updateConversationTitle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
  updateConversationTitle,
  sendMessage,
  deleteConversation
};