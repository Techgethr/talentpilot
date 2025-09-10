// src/services/aiAgentService.js
// Base service for AI agents using OpenAI SDK

const OpenAI = require('openai');
const dotenv = require('dotenv');
dotenv.config();

class AIAgentService {
  constructor() {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    });
  }

  /**
   * Generate response using OpenAI GPT model
   * @param {Array} messages - Array of message objects
   * @param {Object} options - Additional options for the API call
   * @returns {Promise<string>} - Generated response
   */
  async generateResponse(messages, options = {}) {
    try {
      const defaultOptions = {
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 1000,
        ...options
      };

      const response = await this.openai.chat.completions.create({
        messages: messages,
        ...defaultOptions
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response: ' + error.message);
    }
  }

  /**
   * Parse JSON response from AI
   * @param {string} response - AI response string
   * @returns {Object} - Parsed JSON object
   */
  async parseJSONResponse(response) {
    try {
      // Clean the response to extract JSON
      let cleanResponse = response.trim();
      
      // Remove markdown code blocks if present
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.substring(7);
      }
      if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.substring(3);
      }
      if (cleanResponse.endsWith('```')) {
        cleanResponse = cleanResponse.substring(0, cleanResponse.length - 3);
      }
      
      // Parse JSON
      return JSON.parse(cleanResponse.trim());
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      console.error('Response was:', response);
      throw new Error('Failed to parse AI response as JSON');
    }
  }
}

module.exports = new AIAgentService();