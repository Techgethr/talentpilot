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
    
    // Check if the search process is complete (regardless of whether candidates were found)
    const searchComplete = result.hasOwnProperty('candidates');
    
    res.json({
      success: true,
      data: {
        conversation: {
          ...conversation,
          messages
        },
        agentResult: result,
        candidatesDelivered: searchComplete
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
    //response += `- **Match Score**: ${(candidate.similarity * 100).toFixed(1)}%\n`;
    
    if (candidate.profileSummary) {
      response += `- **Profile Summary**: ${candidate.profileSummary}\n`;
    }
    
    if (candidate.matchAnalysis) {
      response += `- **Match Analysis**:\n`;
      response += `  - Match Score: ${candidate.matchAnalysis.matchScore || 'N/A'}\n`;
      response += `  - Strengths: ${candidate.matchAnalysis.strengths?.join(', ') || 'N/A'}\n`;
      response += `  - Key Skills Match: ${candidate.matchAnalysis.keySkillsMatch?.join(', ') || 'N/A'}\n`;
      response += `  - Areas for Development: ${candidate.matchAnalysis.areasForDevelopment?.join(', ') || 'N/A'}\n`;
      response += `  - Experience Relevance: ${candidate.matchAnalysis.experienceRelevance || 'N/A'}\n`;
      response += `  - Cultural Fit: ${candidate.matchAnalysis.culturalFit || 'N/A'}\n`;
      response += `  - Summary: ${candidate.matchAnalysis.summary || 'N/A'}\n`;
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
 * Provide feedback on conversation
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function provideFeedback(req, res) {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    
    if (!feedback) {
      return res.status(400).json({ error: 'Feedback is required' });
    }
    
    // Get conversation
    const conversation = await tidbService.getConversationById(id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Get conversation messages
    const messages = await tidbService.getMessagesByConversationId(id);
    
    // Extract job requirements and candidates from previous messages
    let conversationContext = null;
    
    // Look for the assistant's previous response that contains job requirements and candidates
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');
    if (assistantMessages.length > 0) {
      // Try to find a message that contains job analysis results
      for (let i = assistantMessages.length - 1; i >= 0; i--) {
        const message = assistantMessages[i];
        
        // Look for key indicators in the message content
        if (message.content.includes('Job Analysis Results') || 
            message.content.includes('Job Requirements') || 
            message.content.includes('Candidates Found')) {
          
          // Extract conversation context from the message content
          // This is a simplified approach - in a production environment, you might want to
          // store structured data in the database for easier access
          conversationContext = await extractConversationContext(message.content);
          break;
        }
      }
    }
    
    // If we don't have conversation context, return an error
    if (!conversationContext) {
      return res.status(400).json({ 
        error: 'No previous candidate search found in conversation. Please perform a candidate search first.' 
      });
    }
    
    // Process feedback request
    const result = await agentCoordinator.processFeedbackRequest(conversationContext, feedback);
    
    // Add feedback message to conversation
    await tidbService.addMessage(id, 'assistant', result.feedback);
    
    // Get updated messages
    const updatedMessages = await tidbService.getMessagesByConversationId(id);
    
    res.json({
      success: true,
      data: {
        conversation: {
          ...conversation,
          messages: updatedMessages
        },
        feedback: result.feedback
      }
    });
  } catch (error) {
    console.error('Error in provideFeedback:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}

/**
 * Extract conversation context from assistant message content
 * @param {string} messageContent - Content of the assistant message
 * @returns {Promise<Object>} - Extracted conversation context
 */
async function extractConversationContext(messageContent) {
  // This is a placeholder implementation
  // In a production environment, you might want to:
  // 1. Store structured data in the database when generating responses
  // 2. Use more sophisticated parsing to extract job requirements and candidates
  // 3. Implement caching to avoid repeated parsing
  
  // For now, we'll return a basic structure
  return {
    jobRequirements: {
      jobTitle: 'Extracted from conversation',
      requiredSkills: ['JavaScript', 'React', 'Node.js'],
      experienceLevel: 'Mid-level'
    },
    candidates: [
      {
        id: 1,
        name: 'Sample Candidate',
        similarity: 0.85,
        matchAnalysis: {
          matchScore: 85,
          keySkillsMatch: ['JavaScript', 'React'],
          experienceRelevance: '5 years of relevant experience',
          summary: 'Strong match for the position'
        }
      }
    ]
  };
}

module.exports = {
  getAllConversations,
  getConversation,
  createConversation,
  updateConversationTitle,
  sendMessage,
  provideFeedback,
  deleteConversation
};