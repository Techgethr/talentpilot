// src/controllers/jobController.js
const tidbService = require('../services/tidbService');
const nlpService = require('../services/nlpService');

/**
 * Create a new job posting
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function createJob(req, res) {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    
    // Extract requirements from job description
    const requirements = await nlpService.extractRequirements(description);
    
    // Convert job description to vector
    const jobVector = await nlpService.textToVector(description);
    
    // Store job in database
    const sql = `
      INSERT INTO jobs (title, description, requirements, job_vector)
      VALUES (?, ?, ?, ?)
    `;
    
    const params = [
      title,
      description,
      JSON.stringify(requirements),
      JSON.stringify(jobVector)
    ];
    
    const result = await tidbService.executeQuery(sql, params);
    
    res.json({
      success: true,
      jobId: result.insertId,
      message: 'Job posting created successfully'
    });
  } catch (error) {
    console.error('Error in createJob:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get job by ID
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function getJob(req, res) {
  try {
    const { id } = req.params;
    
    const sql = 'SELECT * FROM jobs WHERE id = ?';
    const jobs = await tidbService.executeQuery(sql, [id]);
    
    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const job = jobs[0];
    job.requirements = JSON.parse(job.requirements);
    job.job_vector = JSON.parse(job.job_vector);
    
    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error in getJob:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Search candidates for a job
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function searchCandidates(req, res) {
  try {
    const { jobId } = req.params;
    
    // Get job details
    const jobSql = 'SELECT * FROM jobs WHERE id = ?';
    const jobs = await tidbService.executeQuery(jobSql, [jobId]);
    
    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const job = jobs[0];
    const jobVector = JSON.parse(job.job_vector);
    
    // Search for candidates
    const candidates = await tidbService.searchCandidates(jobVector, 10);
    
    res.json({
      success: true,
      jobId: jobId,
      jobTitle: job.title,
      candidates: candidates
    });
  } catch (error) {
    console.error('Error in searchCandidates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  createJob,
  getJob,
  searchCandidates
};