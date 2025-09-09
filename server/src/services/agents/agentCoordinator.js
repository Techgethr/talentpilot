// src/services/agents/agentCoordinator.js
// Coordinator that orchestrates multiple AI agents to process job descriptions and find candidates

const jobAnalysisAgent = require('./jobAnalysisAgent');
const candidateSearchAgent = require('./candidateSearchAgent');
const profileSummaryAgent = require('./profileSummaryAgent');
const communicationAgent = require('./communicationAgent');

class AgentCoordinator {
  /**
   * Process job description and find matching candidates
   * @param {string} jobDescription - Job description provided by user
   * @param {Function} progressCallback - Callback function to report progress (optional)
   * @returns {Promise<Object>} - Complete analysis with candidates and communication templates
   */
  async processJobDescription(jobDescription, progressCallback = null) {
    try {
      // Report progress if callback provided
      if (progressCallback) progressCallback('Analyzing job requirements...');
      
      // Step 1: Analyze job description
      console.log('Step 1: Analyzing job description...');
      const jobRequirements = await jobAnalysisAgent.analyzeJob(jobDescription);
      
      // Report progress
      if (progressCallback) progressCallback('Searching for candidates...');
      
      // Step 2: Search for candidates
      console.log('Step 2: Searching for candidates...');
      const candidates = await candidateSearchAgent.searchCandidates(jobRequirements, 10);
      
      // Report progress
      if (progressCallback) progressCallback(`Generating profiles for ${candidates.length} candidates...`);
      
      // Step 3: Generate profile summaries and communication templates for each candidate
      console.log('Step 3: Generating profile summaries and communication templates...');
      const enhancedCandidates = [];
      
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        
        // Report progress for each candidate
        if (progressCallback) {
          progressCallback(`Generating profile for candidate ${i + 1} of ${candidates.length}: ${candidate.name || 'Unknown'}...`);
        }
        
        try {
          // Generate profile summary
          const profileSummary = await profileSummaryAgent.generateProfileSummary(
            candidate, 
            jobRequirements
          );
          
          // Generate communication templates
          const communicationTemplates = await communicationAgent.generateCommunicationTemplates(
            candidate, 
            jobRequirements,
            candidate.matchAnalysis
          );
          
          enhancedCandidates.push({
            ...candidate,
            profileSummary,
            communicationTemplates
          });
        } catch (error) {
          console.error(`Error processing candidate ${candidate.id}:`, error);
          
          // Add candidate with basic information if enhancement fails
          enhancedCandidates.push({
            ...candidate,
            profileSummary: "Unable to generate profile summary",
            communicationTemplates: {
              email: {
                subject: `Opportunity for ${candidate.name}`,
                body: `Dear ${candidate.name},

We have an opportunity that might interest you.`
              },
              linkedin: {
                message: `Hi ${candidate.name}, I have an opportunity that might interest you.`
              },
              phone: {
                opening: `Hi ${candidate.name}`,
                introduction: "I'm calling about a potential opportunity.",
                valueProposition: "This role offers great potential.",
                questions: ["What are you looking for in your next role?"],
                nextSteps: "Would you like to learn more?"
              }
            }
          });
        }
      }
      
      // Report progress
      if (progressCallback) progressCallback('Generating final summary...');
      
      // Step 4: Generate overall summary
      console.log('Step 4: Generating overall summary...');
      const overallSummary = await this.generateOverallSummary(
        jobRequirements, 
        enhancedCandidates
      );
      
      // Report completion
      if (progressCallback) progressCallback('Complete!');
      
      return {
        success: true,
        jobRequirements,
        candidates: enhancedCandidates,
        overallSummary
      };
    } catch (error) {
      console.error('Error in AgentCoordinator:', error);
      throw new Error('Failed to process job description: ' + error.message);
    }
  }

  /**
   * Generate overall summary of the job and candidate matches
   * @param {Object} jobRequirements - Structured job requirements
   * @param {Array} candidates - Enhanced candidates
   * @returns {Promise<string>} - Overall summary
   */
  async generateOverallSummary(jobRequirements, candidates) {
    // For now, we'll return a simple summary
    // In a production environment, you might want to use AI to generate this
    return `
      Job Analysis Complete:
      
      Position: ${jobRequirements.jobTitle}
      Candidates Found: ${candidates.length}
      
      Top candidates have been identified and personalized communication templates
      have been generated for each. Review the candidate matches and use the
      provided communication templates to reach out.
    `;
  }
}

module.exports = new AgentCoordinator();