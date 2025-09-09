// src/services/agents/profileSummaryAgent.js
// Agent for generating candidate profile summaries tailored to specific jobs

const aiAgentService = require('../aiAgentService');

class ProfileSummaryAgent {
  /**
   * Generate a tailored profile summary for a candidate based on job requirements
   * @param {Object} candidate - Candidate data
   * @param {Object} jobRequirements - Structured job requirements
   * @returns {Promise<string>} - Tailored profile summary
   */
  async generateProfileSummary(candidate, jobRequirements) {
    const prompt = `
      Create a concise, tailored profile summary for the following candidate 
      that highlights their relevance to the specific job requirements.
      
      Candidate Information:
      Name: ${candidate.name}
      Email: ${candidate.email || 'Not provided'}
      Phone: ${candidate.phone || 'Not provided'}
      CV Content:
      ${candidate.cv_text || 'No CV content available'}
      
      Job Requirements:
      ${JSON.stringify(jobRequirements, null, 2)}
      
      Create a 3-4 sentence summary that:
      1. Highlights the candidate's most relevant experience
      2. Emphasizes skills that match the job requirements
      3. Notes any unique qualifications or achievements
      4. Explains why this candidate is a good fit for this specific role
    `;

    const messages = [
      {
        role: "system",
        content: "You are an expert recruiter creating compelling candidate profile summaries tailored to specific job requirements."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    try {
      return await aiAgentService.generateResponse(messages);
    } catch (error) {
      console.error('Error generating profile summary:', error);
      
      // Return a fallback summary if AI fails
      return `Unable to generate detailed summary for ${candidate.name}. Please review CV content directly.`;
    }
  }
}

module.exports = new ProfileSummaryAgent();