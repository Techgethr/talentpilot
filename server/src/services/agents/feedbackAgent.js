// src/services/agents/feedbackAgent.js
// Agent for providing HR feedback based on conversation context and candidate matches

const aiAgentService = require('../aiAgentService');
const tidbService = require('../tidbService');

class FeedbackAgent {
  /**
   * Provide HR feedback based on conversation context and candidate matches
   * @param {Object} conversationContext - Context from the conversation including job requirements and candidates
   * @param {string} userFeedback - User's specific feedback request
   * @returns {Promise<Object>} - Detailed HR feedback and recommendations
   */
  async provideFeedback(conversationContext, userFeedback) {
    try {
      // Create a comprehensive prompt for the AI
      const prompt = this.createFeedbackPrompt(conversationContext, userFeedback);
      
      const messages = [
        {
          role: "system",
          content: "You are an expert HR consultant providing professional feedback and recommendations. Focus on recruitment best practices, candidate evaluation, and strategic hiring advice. Always maintain a professional tone and provide actionable insights."
        },
        {
          role: "user",
          content: prompt
        }
      ];

      const response = await aiAgentService.generateResponse(messages);
      
      return {
        success: true,
        feedback: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in FeedbackAgent:', error);
      
      // Return a fallback response if AI fails
      return {
        success: false,
        feedback: "I apologize, but I'm unable to provide detailed feedback at the moment. Please try rephrasing your request or provide more specific information about what kind of feedback you're looking for.",
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Create a comprehensive prompt for feedback generation
   * @param {Object} conversationContext - Context from the conversation
   * @param {string} userFeedback - User's specific feedback request
   * @returns {string} - Comprehensive prompt
   */
  createFeedbackPrompt(conversationContext, userFeedback) {
    return `
      You are an HR expert providing feedback on a recruitment process. Here's the context:

      Job Requirements:
      ${JSON.stringify(conversationContext.jobRequirements, null, 2)}

      Candidate Matches Found: ${conversationContext.candidates.length}
      
      Candidate Details:
      ${conversationContext.candidates.map((candidate, index) => `
      ${index + 1}. ${candidate.name}
         - Match Score: ${candidate.similarity ? (candidate.similarity * 100).toFixed(1) : 'N/A'}%
         - Key Skills: ${candidate.matchAnalysis?.keySkillsMatch?.join(', ') || 'Not analyzed'}
         - Experience: ${candidate.matchAnalysis?.experienceRelevance || 'Not analyzed'}
         - Summary: ${candidate.matchAnalysis?.summary || 'Not analyzed'}
      `).join('')}

      User's Specific Feedback Request:
      "${userFeedback}"

      Please provide professional HR feedback that addresses the user's request. Consider:
      1. The alignment between job requirements and candidate profiles
      2. Recruitment strategy recommendations
      3. Next steps in the hiring process
      4. Best practices for candidate evaluation
      5. Any potential concerns or red flags
      6. Suggestions for improving the job description or search criteria

      Provide your response in a clear, professional format with actionable insights.
    `;
  }

  /**
   * Provide feedback on candidate selection and ranking
   * @param {Object} conversationContext - Context from the conversation
   * @returns {Promise<Object>} - Candidate selection feedback
   */
  async provideCandidateSelectionFeedback(conversationContext) {
    try {
      const prompt = `
        As an HR expert, analyze the candidate matches for this job position and provide feedback on:
        
        Job Requirements:
        ${JSON.stringify(conversationContext.jobRequirements, null, 2)}
        
        Candidates:
        ${conversationContext.candidates.map((candidate, index) => `
        ${index + 1}. ${candidate.name} (Match Score: ${candidate.similarity ? (candidate.similarity * 100).toFixed(1) : 'N/A'}%)
           Skills: ${candidate.matchAnalysis?.keySkillsMatch?.join(', ') || 'Not available'}
           Experience: ${candidate.matchAnalysis?.experienceRelevance || 'Not available'}
        `).join('')}
        
        Please provide:
        1. An assessment of which candidates are the strongest matches
        2. Recommendations for which candidates to prioritize for interviews
        3. Suggestions for improving the candidate search if needed
        4. Any concerns about the quality or quantity of matches
        5. Best practices for the next steps in the recruitment process
      `;

      const messages = [
        {
          role: "system",
          content: "You are an expert HR consultant providing professional candidate selection feedback. Focus on recruitment best practices and strategic hiring advice."
        },
        {
          role: "user",
          content: prompt
        }
      ];

      const response = await aiAgentService.generateResponse(messages);
      
      return {
        success: true,
        feedback: response,
        type: "candidate_selection",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in candidate selection feedback:', error);
      return {
        success: false,
        feedback: "Unable to provide candidate selection feedback at this time.",
        error: error.message,
        type: "candidate_selection",
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Provide feedback on job description effectiveness
   * @param {Object} conversationContext - Context from the conversation
   * @returns {Promise<Object>} - Job description feedback
   */
  async provideJobDescriptionFeedback(conversationContext) {
    try {
      const prompt = `
        As an HR expert, analyze the job requirements and candidate matches to provide feedback on the job description:
        
        Job Requirements:
        ${JSON.stringify(conversationContext.jobRequirements, null, 2)}
        
        Number of Candidates Found: ${conversationContext.candidates.length}
        
        Please provide:
        1. Assessment of how well the job requirements align with available candidates
        2. Suggestions for improving the job description to attract better matches
        3. Recommendations for adjusting requirements if too restrictive or too broad
        4. Industry benchmarks for similar positions
        5. Best practices for writing effective job descriptions
      `;

      const messages = [
        {
          role: "system",
          content: "You are an expert HR consultant providing professional job description feedback. Focus on recruitment marketing and job description optimization."
        },
        {
          role: "user",
          content: prompt
        }
      ];

      const response = await aiAgentService.generateResponse(messages);
      
      return {
        success: true,
        feedback: response,
        type: "job_description",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in job description feedback:', error);
      return {
        success: false,
        feedback: "Unable to provide job description feedback at this time.",
        error: error.message,
        type: "job_description",
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new FeedbackAgent();