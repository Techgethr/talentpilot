// src/services/chatService.js
const nlpService = require('./nlpService');
const vectorDbService = require('./vectorDbService');

/**
 * Process user message and return relevant candidates
 * @param {string} message - User's job description message
 * @returns {Promise<Object>} - Candidates matching the job description
 */
async function processMessage(message) {
  try {
    // Extract requirements from job description
    const requirements = await nlpService.extractRequirements(message);
    
    // Convert job description to vector
    const queryVector = await nlpService.textToVector(message);
    
    // Search for candidates in vector database
    const candidates = await vectorDbService.searchCandidates(queryVector, 10);
    
    return {
      query: message,
      requirements,
      candidates
    };
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  }
}

module.exports = {
  processMessage
};