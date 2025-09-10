// src/services/embeddingService.js
// Service to generate embeddings using OpenAI

const OpenAI = require('openai');
const dotenv = require('dotenv');
dotenv.config();

class EmbeddingService {
  constructor() {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    });
  }

  /**
   * Generate embedding vector for text using OpenAI
   * @param {string} text - Text to generate embedding for
   * @returns {Promise<Array>} - Embedding vector (1536 dimensions)
   */
  async generateEmbedding(text) {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Text is required to generate embedding');
      }

      // Limit text length to avoid token limits
      const trimmedText = text.trim().substring(0, 8000);
      
      const response = await this.openai.embeddings.create({
        model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
        input: trimmedText,
        encoding_format: 'float',
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      
      // If OpenAI fails, return a default vector of zeros
      // In a production environment, you might want to handle this differently
      console.warn('Using default embedding due to OpenAI error');
      return Array(1536).fill(0);
    }
  }
}

module.exports = new EmbeddingService();