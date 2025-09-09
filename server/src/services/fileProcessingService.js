// src/services/fileProcessingService.js
// Service to process different file types

const pdf = require('pdf-parse');
const mammoth = require('mammoth');

class FileProcessingService {
  /**
   * Extract text from PDF file
   * @param {Buffer} buffer - PDF file buffer
   * @returns {Promise<string>} - Extracted text
   */
  async extractTextFromPDF(buffer) {
    try {
      const data = await pdf(buffer);
      return data.text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF file');
    }
  }

  /**
   * Extract text from Word document
   * @param {Buffer} buffer - Word document buffer
   * @returns {Promise<string>} - Extracted text
   */
  async extractTextFromWord(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      console.error('Error extracting text from Word document:', error);
      throw new Error('Failed to extract text from Word document');
    }
  }

  /**
   * Extract text from TXT file
   * @param {Buffer} buffer - TXT file buffer
   * @returns {Promise<string>} - Extracted text
   */
  async extractTextFromTXT(buffer) {
    try {
      return buffer.toString('utf8');
    } catch (error) {
      console.error('Error extracting text from TXT file:', error);
      throw new Error('Failed to extract text from TXT file');
    }
  }

  /**
   * Process file based on its type
   * @param {Buffer} buffer - File buffer
   * @param {string} mimeType - File MIME type
   * @returns {Promise<string>} - Extracted text
   */
  async processFile(buffer, mimeType) {
    switch (mimeType) {
      case 'application/pdf':
        return await this.extractTextFromPDF(buffer);
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await this.extractTextFromWord(buffer);
      case 'text/plain':
        return await this.extractTextFromTXT(buffer);
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  }
}

module.exports = new FileProcessingService();