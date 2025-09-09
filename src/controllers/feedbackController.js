// src/controllers/feedbackController.js
const tidbService = require('../services/tidbService');

/**
 * Submit feedback on candidate matches
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function submitFeedback(req, res) {
  try {
    const { jobId, candidateId, rating, comment } = req.body;
    const userId = req.user.id;
    
    if (!jobId || !candidateId || !rating) {
      return res.status(400).json({ error: 'Job ID, candidate ID, and rating are required' });
    }
    
    // Check if job exists
    const jobCheckSql = 'SELECT id FROM jobs WHERE id = ?';
    const jobs = await tidbService.executeQuery(jobCheckSql, [jobId]);
    
    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Check if candidate exists
    const candidateCheckSql = 'SELECT id FROM candidates WHERE id = ?';
    const candidates = await tidbService.executeQuery(candidateCheckSql, [candidateId]);
    
    if (candidates.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    // Insert feedback
    const sql = `
      INSERT INTO feedback (job_id, candidate_id, user_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const params = [jobId, candidateId, userId, rating, comment || null];
    const result = await tidbService.executeQuery(sql, params);
    
    res.status(201).json({
      success: true,
      feedbackId: result.insertId,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error in submitFeedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get feedback for a specific job
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function getFeedback(req, res) {
  try {
    const { jobId } = req.params;
    
    // Check if job exists
    const jobCheckSql = 'SELECT id FROM jobs WHERE id = ?';
    const jobs = await tidbService.executeQuery(jobCheckSql, [jobId]);
    
    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const sql = `
      SELECT f.*, u.name as user_name, c.name as candidate_name
      FROM feedback f
      JOIN users u ON f.user_id = u.id
      JOIN candidates c ON f.candidate_id = c.id
      WHERE f.job_id = ?
      ORDER BY f.created_at DESC
    `;
    
    const feedback = await tidbService.executeQuery(sql, [jobId]);
    
    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error in getFeedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  submitFeedback,
  getFeedback
};