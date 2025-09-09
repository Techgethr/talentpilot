// src/services/agents/jobAnalysisAgent.js
// Agent for analyzing job descriptions and extracting requirements

const aiAgentService = require('../aiAgentService');

class JobAnalysisAgent {
  /**
   * Analyze job description and extract key requirements
   * @param {string} jobDescription - Job description provided by user
   * @returns {Promise<Object>} - Structured job requirements
   */
  async analyzeJob(jobDescription) {
    const prompt = `
      Analyze the following job description and extract detailed requirements.
      Provide a structured analysis with the following information:
      
      1. Job Title/Role
      2. Key Responsibilities
      3. Required Skills (technical and soft skills)
      4. Experience Level
      5. Education Requirements
      6. Industry/Domain Knowledge
      7. Preferred Qualifications
      8. Work Environment/Type (remote, hybrid, on-site)
      9. Company Culture Fit
      10. Salary Range (if mentioned)
      
      Job Description:
      "${jobDescription}"
      
      Respond in JSON format with the following structure:
      {
        "jobTitle": "string",
        "responsibilities": ["string"],
        "requiredSkills": ["string"],
        "experienceLevel": "string",
        "education": "string",
        "industryKnowledge": ["string"],
        "preferredQualifications": ["string"],
        "workEnvironment": "string",
        "cultureFit": ["string"],
        "salaryRange": "string"
      }
    `;

    const messages = [
      {
        role: "system",
        content: "You are an expert HR analyst specializing in job description analysis. Extract comprehensive requirements from job descriptions."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    try {
      const response = await aiAgentService.generateResponse(messages);
      const parsedResponse = await aiAgentService.parseJSONResponse(response);
      
      return {
        ...parsedResponse,
        originalDescription: jobDescription
      };
    } catch (error) {
      console.error('Error in JobAnalysisAgent:', error);
      
      // Return a fallback response if AI fails
      return {
        jobTitle: "General Position",
        responsibilities: ["Not specified"],
        requiredSkills: ["Not specified"],
        experienceLevel: "Not specified",
        education: "Not specified",
        industryKnowledge: ["Not specified"],
        preferredQualifications: ["Not specified"],
        workEnvironment: "Not specified",
        cultureFit: ["Not specified"],
        salaryRange: "Not specified",
        originalDescription: jobDescription
      };
    }
  }
}

module.exports = new JobAnalysisAgent();