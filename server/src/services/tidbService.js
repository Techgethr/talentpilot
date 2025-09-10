// src/services/tidbService.js
// Service to interact with TiDB Cloud

const mysql = require('mysql2/promise');
const config = require('../config/tidb');

class TiDBService {
  constructor() {
    this.pool = null;
  }

  /**
   * Initialize connection pool to TiDB Cloud
   */
  async initialize() {
    try {
      this.pool = mysql.createPool({
        host: config.tidb.host,
        port: config.tidb.port,
        user: config.tidb.user,
        password: config.tidb.password,
        database: config.tidb.database,
        ssl: config.tidb.ssl ? { rejectUnauthorized: true } : false,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Test connection
      const connection = await this.pool.getConnection();
      console.log('Successfully connected to TiDB Cloud');
      connection.release();
    } catch (error) {
      console.error('Failed to connect to TiDB Cloud:', error);
      throw error;
    }
  }

  /**
   * Execute a query
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} - Query results
   */
  async executeQuery(sql, params = []) {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    const connection = await this.pool.getConnection();
    try {
      const [results] = await connection.execute(sql, params);
      return results;
    } finally {
      connection.release();
    }
  }

  /**
   * Create tables if they don't exist
   */
  async createTables() {
    // Create candidates table with simplified structure including LinkedIn field
    const createCandidatesTable = `
      CREATE TABLE IF NOT EXISTS candidates (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        linkedin_url TEXT,
        cv_text TEXT,
        cv_vector VECTOR(1536),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    // Create conversations table
    const createConversationsTable = `
      CREATE TABLE IF NOT EXISTS conversations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255),
        user_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    // Create messages table
    const createMessagesTable = `
      CREATE TABLE IF NOT EXISTS messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        conversation_id INT NOT NULL,
        role ENUM('user', 'assistant') NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      )
    `;

    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role ENUM('admin', 'recruiter', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    try {
      await this.executeQuery(createCandidatesTable);
      await this.executeQuery(createConversationsTable);
      await this.executeQuery(createMessagesTable);
      await this.executeQuery(createUsersTable);
      console.log('Tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  /**
   * Store candidate CV in database
   * @param {Object} candidateData - Candidate information
   * @returns {Promise<number>} - Inserted candidate ID
   */
  async storeCandidate(candidateData) {
    const sql = `
      INSERT INTO candidates (name, email, phone, linkedin_url, cv_text, cv_vector)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      candidateData.name,
      candidateData.email,
      candidateData.phone,
      candidateData.linkedinUrl || null,
      candidateData.cvText,
      JSON.stringify(candidateData.cvVector)
    ];

    const result = await this.executeQuery(sql, params);
    return result.insertId;
  }

  /**
   * Update candidate information
   * @param {number} candidateId - Candidate ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<boolean>} - Success status
   */
  async updateCandidate(candidateId, updateData) {
    try {
      // Build dynamic update query based on provided fields
      const fields = [];
      const params = [];
      
      // Add fields to update if they exist in updateData
      if (updateData.name !== undefined) {
        fields.push('name = ?');
        params.push(updateData.name);
      }
      
      if (updateData.email !== undefined) {
        fields.push('email = ?');
        params.push(updateData.email);
      }
      
      if (updateData.phone !== undefined) {
        fields.push('phone = ?');
        params.push(updateData.phone);
      }
      
      if (updateData.linkedinUrl !== undefined) {
        fields.push('linkedin_url = ?');
        params.push(updateData.linkedinUrl);
      }
      
      // Only update CV fields if new CV data is provided
      if (updateData.cvText !== undefined && updateData.cvVector !== undefined) {
        fields.push('cv_text = ?');
        params.push(updateData.cvText);
        fields.push('cv_vector = ?');
        params.push(JSON.stringify(updateData.cvVector));
      }
      
      // If no fields to update, return early
      if (fields.length === 0) {
        return true;
      }
      
      // Add candidate ID to params
      params.push(candidateId);
      
      const sql = `
        UPDATE candidates 
        SET ${fields.join(', ')}
        WHERE id = ?
      `;
      
      await this.executeQuery(sql, params);
      return true;
    } catch (error) {
      console.error('Error updating candidate:', error);
      throw error;
    }
  }

  /**
   * Get all candidates
   * @returns {Promise<Array>} - Array of candidates
   */
  async getAllCandidates() {
    const sql = `
      SELECT id, name, email, phone, linkedin_url, created_at
      FROM candidates
      ORDER BY created_at DESC
    `;
    
    const results = await this.executeQuery(sql);
    return results;
  }

  /**
   * Get candidate by ID
   * @param {number} id - Candidate ID
   * @returns {Promise<Object>} - Candidate data
   */
  async getCandidateById(id) {
    const sql = `
      SELECT id, name, email, phone, linkedin_url, cv_text, cv_vector, created_at, updated_at
      FROM candidates
      WHERE id = ?
    `;
    
    const results = await this.executeQuery(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Search for candidates based on job description vector using cosine similarity
   * @param {Array} queryVector - Vector representation of job description
   * @param {number} limit - Maximum number of candidates to return
   * @returns {Promise<Array>} - Array of matching candidates
   */
  async searchCandidates(queryVector, limit = 10) {
    try {
      // Validate and ensure limit is a proper integer
      const validLimit = Math.min(Math.max(1, Math.floor(limit)), 100);
      
      // Convert query vector to JSON string
      const queryVectorJson = JSON.stringify(queryVector);
      
      // Use VEC_COSINE_DISTANCE function for vector similarity search
      const sql = `
        SELECT id, name, email, phone, linkedin_url,
               VEC_COSINE_DISTANCE(cv_vector, CAST(? AS VECTOR(1536))) as similarity
        FROM candidates
        ORDER BY similarity ASC
        LIMIT 10
      `;

      const params = [queryVectorJson];
      //console.log('Executing query with params:', params);
      const results = await this.executeQuery(sql, params);
      
      return results.map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        linkedinUrl: candidate.linkedin_url,
        similarity: candidate.similarity
      }));
    } catch (error) {
      console.error('Error in searchCandidates:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Fallback to simple search if vector functions are not available
      return await this.fallbackSearch(limit);
    }
  }

  /**
   * Search for candidates similar to a given candidate using vector similarity
   * @param {number} candidateId - ID of the candidate to find similar candidates for
   * @param {number} limit - Maximum number of candidates to return
   * @returns {Promise<Array>} - Array of similar candidates
   */
  async searchSimilarCandidates(candidateId, limit = 10) {
    try {
      // Validate and ensure limit is a proper integer
      const validLimit = Math.min(Math.max(1, Math.floor(limit)), 100);
      
      // First get the candidate vector
      const baseCandidate = await this.getCandidateById(candidateId);
      if (!baseCandidate || !baseCandidate.cv_vector) {
        throw new Error('Candidate not found or has no vector data');
      }
      
      // Parse the vector from JSON
      const candidateVector = JSON.parse(baseCandidate.cv_vector);
      const candidateVectorJson = JSON.stringify(candidateVector);
      
      // Use VEC_COSINE_DISTANCE function for vector similarity search
      const sql = `
        SELECT id, name, email, phone, linkedin_url,
               VEC_COSINE_DISTANCE(cv_vector, CAST(? AS VECTOR(1536))) as similarity
        FROM candidates
        WHERE id != ?
        ORDER BY similarity ASC
        LIMIT 10
      `;

      const params = [candidateVectorJson, candidateId];
      const results = await this.executeQuery(sql, params);
      
      return results.map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        linkedinUrl: candidate.linkedin_url,
        similarity: candidate.similarity
      }));
    } catch (error) {
      console.error('Error in searchSimilarCandidates:', error);
      throw error;
    }
  }
  
  /**
   * Fallback search method if vector functions are not available
   * @param {number} limit - Maximum number of candidates to return
   * @returns {Promise<Array>} - Array of candidates
   */
  async fallbackSearch(limit = 10) {
    // Validate and ensure limit is a proper integer
    const validLimit = Math.min(Math.max(1, Math.floor(limit)), 100);
    
    const sql = `
      SELECT id, name, email, phone, linkedin_url
      FROM candidates
      LIMIT ?
    `;

    const params = [validLimit];
    const results = await this.executeQuery(sql, params);
    
    // Add default similarity score
    return results.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      linkedinUrl: candidate.linkedin_url,
      similarity: 0.5 // Default similarity score
    }));
  }
  
  /**
   * Create a new conversation
   * @param {string} title - Conversation title
   * @param {string} userId - User ID (optional)
   * @returns {Promise<number>} - Created conversation ID
   */
  async createConversation(title, userId = null) {
    const sql = `
      INSERT INTO conversations (title, user_id)
      VALUES (?, ?)
    `;
    
    const params = [title, userId];
    const result = await this.executeQuery(sql, params);
    return result.insertId;
  }
  
  /**
   * Get all conversations
   * @returns {Promise<Array>} - Array of conversations
   */
  async getAllConversations() {
    const sql = `
      SELECT id, title, user_id, created_at, updated_at
      FROM conversations
      ORDER BY updated_at DESC
    `;
    
    const results = await this.executeQuery(sql);
    return results;
  }
  
  /**
   * Get conversation by ID
   * @param {number} id - Conversation ID
   * @returns {Promise<Object>} - Conversation data
   */
  async getConversationById(id) {
    const sql = `
      SELECT id, title, user_id, created_at, updated_at
      FROM conversations
      WHERE id = ?
    `;
    
    const results = await this.executeQuery(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }
  
  /**
   * Update conversation title
   * @param {number} id - Conversation ID
   * @param {string} title - New title
   * @returns {Promise<boolean>} - Success status
   */
  async updateConversationTitle(id, title) {
    const sql = `
      UPDATE conversations
      SET title = ?
      WHERE id = ?
    `;
    
    const params = [title, id];
    await this.executeQuery(sql, params);
    return true;
  }
  
  /**
   * Add message to conversation
   * @param {number} conversationId - Conversation ID
   * @param {string} role - Message role (user/assistant)
   * @param {string} content - Message content
   * @returns {Promise<number>} - Created message ID
   */
  async addMessage(conversationId, role, content) {
    const sql = `
      INSERT INTO messages (conversation_id, role, content)
      VALUES (?, ?, ?)
    `;
    
    const params = [conversationId, role, content];
    const result = await this.executeQuery(sql, params);
    return result.insertId;
  }
  
  /**
   * Get messages for conversation
   * @param {number} conversationId - Conversation ID
   * @returns {Promise<Array>} - Array of messages
   */
  async getMessagesByConversationId(conversationId) {
    const sql = `
      SELECT id, conversation_id, role, content, created_at
      FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC
    `;
    
    const params = [conversationId];
    const results = await this.executeQuery(sql, params);
    return results;
  }
  
  /**
   * Delete conversation
   * @param {number} id - Conversation ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteConversation(id) {
    const sql = `
      DELETE FROM conversations
      WHERE id = ?
    `;
    
    const params = [id];
    await this.executeQuery(sql, params);
    return true;
  }
}

module.exports = new TiDBService();