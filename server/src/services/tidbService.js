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
    // Create candidates table
    const createCandidatesTable = `
      CREATE TABLE IF NOT EXISTS candidates (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        skills JSON,
        experience TEXT,
        education TEXT,
        cv_text TEXT,
        cv_vector VECTOR(128),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    // Create jobs table
    const createJobsTable = `
      CREATE TABLE IF NOT EXISTS jobs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        requirements JSON,
        job_vector VECTOR(128),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    // Create conversations table
    const createConversationsTable = `
      CREATE TABLE IF NOT EXISTS conversations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id VARCHAR(255),
        job_id INT,
        message TEXT,
        response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id)
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

    // Create feedback table
    const createFeedbackTable = `
      CREATE TABLE IF NOT EXISTS feedback (
        id INT PRIMARY KEY AUTO_INCREMENT,
        job_id INT NOT NULL,
        candidate_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    try {
      await this.executeQuery(createCandidatesTable);
      await this.executeQuery(createJobsTable);
      await this.executeQuery(createConversationsTable);
      await this.executeQuery(createUsersTable);
      await this.executeQuery(createFeedbackTable);
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
      INSERT INTO candidates (name, email, phone, skills, experience, education, cv_text, cv_vector)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      candidateData.name,
      candidateData.email,
      candidateData.phone,
      JSON.stringify(candidateData.skills),
      candidateData.experience,
      candidateData.education,
      candidateData.cvText,
      JSON.stringify(candidateData.cvVector)
    ];

    const result = await this.executeQuery(sql, params);
    return result.insertId;
  }

  /**
   * Search for candidates based on job description vector
   * @param {Array} queryVector - Vector representation of job description
   * @param {number} limit - Maximum number of candidates to return
   * @returns {Promise<Array>} - Array of matching candidates
   */
  async searchCandidates(queryVector, limit = 10) {
    // This is a simplified implementation
    // In a real scenario, you would use vector similarity functions
    const sql = `
      SELECT id, name, email, skills, experience, 
             VEC_COSINE_DISTANCE(cv_vector, ?) as similarity
      FROM candidates
      ORDER BY similarity DESC
      LIMIT ?
    `;

    const params = [JSON.stringify(queryVector), limit];
    const results = await this.executeQuery(sql, params);
    
    return results.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      skills: JSON.parse(candidate.skills),
      experience: candidate.experience,
      similarity: candidate.similarity
    }));
  }
}

module.exports = new TiDBService();