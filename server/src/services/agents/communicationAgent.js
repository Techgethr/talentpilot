// src/services/agents/communicationAgent.js
// Agent for generating personalized communication templates for candidates

const aiAgentService = require('../aiAgentService');

class CommunicationAgent {
  /**
   * Generate personalized communication templates for candidates
   * @param {Object} candidate - Candidate data
   * @param {Object} jobRequirements - Structured job requirements
   * @param {Object} matchAnalysis - Candidate match analysis
   * @returns {Promise<Object>} - Communication templates
   */
  async generateCommunicationTemplates(candidate, jobRequirements, matchAnalysis) {
    const prompt = `
      Create personalized communication templates for reaching out to this candidate 
      about the job opportunity. Tailor the messaging based on their profile match.
      
      Candidate Information:
      Name: ${candidate.name}
      Email: ${candidate.email || 'Not provided'}
      Phone: ${candidate.phone || 'Not provided'}
      
      Job Requirements:
      ${JSON.stringify(jobRequirements, null, 2)}
      
      Match Analysis:
      ${JSON.stringify(matchAnalysis, null, 2)}
      
      Create the following communication templates:
      
      1. Email Template:
         - Professional and engaging subject line
         - Personalized greeting
         - Brief introduction to the opportunity
         - Specific reasons why they're a good fit
         - Clear call-to-action for next steps
         - Professional sign-off
         
      2. LinkedIn Message Template:
         - Concise and attention-grabbing
         - Personalized based on their background
         - Brief value proposition
         - Request for conversation
         
      3. Phone Script:
         - Opening line to grab attention
         - Brief introduction
         - Key value propositions
         - Questions to engage the candidate
         - Next steps
      
      Respond in JSON format with the following structure:
      {
        "email": {
          "subject": "string",
          "body": "string"
        },
        "linkedin": {
          "message": "string"
        },
        "phone": {
          "opening": "string",
          "introduction": "string",
          "valueProposition": "string",
          "questions": ["string"],
          "nextSteps": "string"
        }
      }
    `;

    const messages = [
      {
        role: "system",
        content: "You are an expert recruiter crafting personalized, compelling communication templates to engage potential candidates."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    try {
      const response = await aiAgentService.generateResponse(messages);
      return await aiAgentService.parseJSONResponse(response);
    } catch (error) {
      console.error('Error generating communication templates:', error);
      
      // Return fallback templates if AI fails
      return {
        email: {
          "subject": `Opportunity for ${candidate.name} - ${jobRequirements.jobTitle}`,
          "body": `Dear ${candidate.name},

I'm reaching out because I believe you might be interested in a ${jobRequirements.jobTitle} opportunity that aligns with your background.

Please let me know if you'd like to discuss this further.

Best regards`
        },
        linkedin: {
          "message": `Hi ${candidate.name}, I noticed your background and thought you might be interested in a ${jobRequirements.jobTitle} opportunity. Would you be open to a brief conversation?`
        },
        phone: {
          "opening": `Hi ${candidate.name}, this is [Your Name] from [Company].`,
          "introduction": `I'm calling about a ${jobRequirements.jobTitle} opportunity that I think aligns well with your background.`,
          "valueProposition": "This role offers [brief value proposition].",
          "questions": ["What aspects of your current role are you looking to develop?", "What type of work environment do you thrive in?"],
          "nextSteps": "Would you be interested in a brief conversation to learn more?"
        }
      };
    }
  }
}

module.exports = new CommunicationAgent();