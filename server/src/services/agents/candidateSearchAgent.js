// src/services/agents/candidateSearchAgent.js
// Agent for searching and ranking candidates based on job requirements

const aiAgentService = require('../aiAgentService');
const tidbService = require('../tidbService');
const nlpService = require('../nlpService');

class CandidateSearchAgent {
  /**
   * Search and rank candidates based on job requirements
   * @param {Object} jobRequirements - Structured job requirements
   * @param {number} limit - Maximum number of candidates to return
   * @returns {Promise<Array>} - Ranked list of candidates
   */
  async searchCandidates(jobRequirements, limit = 10) {
    try {
      // Validate limit parameter
      const validLimit = Math.min(Math.max(1, limit), 100);
      
      // Create a comprehensive job description for embedding
      const jobDescription = this.createJobDescriptionForEmbedding(jobRequirements);
      
      // Generate embedding for job description
      const jobVector = await nlpService.textToVector(jobDescription);
      
      // Search candidates in database
      const candidates = await tidbService.searchCandidates(jobVector, validLimit);
      
      // Enhance candidates with detailed matching information
      const enhancedCandidates = await this.enhanceCandidates(candidates, jobRequirements);
      
      return enhancedCandidates;
    } catch (error) {
      console.error('Error in CandidateSearchAgent:', error);
      throw new Error(`Failed to search candidates: ${error.message}`);
    }
  }

  /**
   * Create a comprehensive job description for embedding
   * @param {Object} jobRequirements - Structured job requirements
   * @returns {string} - Comprehensive job description
   */
  createJobDescriptionForEmbedding(jobRequirements) {
    return `
      Job Title: ${jobRequirements.jobTitle || 'Not specified'}
      
      Responsibilities:
      ${jobRequirements.responsibilities?.join(', ') || 'Not specified'}
      
      Required Skills:
      ${jobRequirements.requiredSkills?.join(', ') || 'Not specified'}
      
      Experience Level: ${jobRequirements.experienceLevel || 'Not specified'}
      
      Education: ${jobRequirements.education || 'Not specified'}
      
      Industry Knowledge:
      ${jobRequirements.industryKnowledge?.join(', ') || 'Not specified'}
      
      Preferred Qualifications:
      ${jobRequirements.preferredQualifications?.join(', ') || 'Not specified'}
      
      Work Environment: ${jobRequirements.workEnvironment || 'Not specified'}
      
      Culture Fit:
      ${jobRequirements.cultureFit?.join(', ') || 'Not specified'}
    `;
  }

  /**
   * Enhance candidates with detailed matching information
   * @param {Array} candidates - List of candidates from database
   * @param {Object} jobRequirements - Structured job requirements
   * @returns {Promise<Array>} - Enhanced candidates with matching details
   */
  async enhanceCandidates(candidates, jobRequirements) {
    const enhancedCandidates = [];
    
    for (const candidate of candidates) {
      try {
        // Get full candidate details
        const fullCandidate = await tidbService.getCandidateById(candidate.id);
        
        if (fullCandidate) {
          // Create candidate profile for analysis
          const candidateProfile = `
            Name: ${fullCandidate.name}
            Email: ${fullCandidate.email || 'Not provided'}
            Phone: ${fullCandidate.phone || 'Not provided'}
            CV Content:
            ${fullCandidate.cv_text || 'No CV content available'}
          `;
          
          // Analyze candidate match
          const matchAnalysis = await this.analyzeCandidateMatch(
            candidateProfile, 
            jobRequirements
          );
          
          enhancedCandidates.push({
            ...candidate,
            ...fullCandidate,
            matchAnalysis
          });
        }
      } catch (error) {
        console.error(`Error enhancing candidate ${candidate.id}:`, error);
        // Add candidate without enhancement if analysis fails
        enhancedCandidates.push(candidate);
      }
    }
    
    return enhancedCandidates;
  }

  /**
   * Analyze how well a candidate matches job requirements
   * @param {string} candidateProfile - Candidate profile text
   * @param {Object} jobRequirements - Structured job requirements
   * @returns {Promise<Object>} - Match analysis
   */
  async analyzeCandidateMatch(candidateProfile, jobRequirements) {
    const prompt = `
      Analyze how well the following candidate matches the job requirements.
      Provide a detailed analysis of the match.
      
      Candidate Profile:
      ${candidateProfile}
      
      Job Requirements:
      ${JSON.stringify(jobRequirements, null, 2)}
      
      Respond in JSON format with the following structure:
      {
        "matchScore": number (0-100),
        "strengths": ["string"],
        "areasForDevelopment": ["string"],
        "keySkillsMatch": ["string"],
        "experienceRelevance": "string",
        "culturalFit": "string",
        "summary": "string"
      }
    `;

    const messages = [
      {
        role: "system",
        content: "You are an expert HR recruiter analyzing candidate-job matches. Provide detailed, objective analysis."
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
      console.error('Error analyzing candidate match:', error);
      
      // Return a fallback response if AI fails
      return {
        matchScore: 0,
        strengths: ["Analysis unavailable"],
        areasForDevelopment: ["Analysis unavailable"],
        keySkillsMatch: ["Analysis unavailable"],
        experienceRelevance: "Analysis unavailable",
        culturalFit: "Analysis unavailable",
        summary: "Unable to generate match analysis"
      };
    }
  }
}

module.exports = new CandidateSearchAgent();