// src/controllers/candidateController.js
const tidbService = require('../services/tidbService');
const nlpService = require('../services/nlpService');

/**
 * Upload and process candidate CV
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function uploadCV(req, res) {
  try {
    const { name, email, phone, cvText } = req.body;
    
    if (!name || !cvText) {
      return res.status(400).json({ error: 'Name and CV text are required' });
    }
    
    // Process CV text to extract information
    const skills = await nlpService.extractSkills(cvText);
    const experience = await nlpService.extractExperience(cvText);
    const education = await nlpService.extractEducation(cvText);
    
    // Convert CV text to vector
    const cvVector = await nlpService.textToVector(cvText);
    
    // Store candidate in database
    const candidateData = {
      name,
      email: email || null,
      phone: phone || null,
      skills,
      experience,
      education,
      cvText,
      cvVector
    };
    
    const candidateId = await tidbService.storeCandidate(candidateData);
    
    res.json({
      success: true,
      candidateId,
      message: 'CV uploaded and processed successfully'
    });
  } catch (error) {
    console.error('Error in uploadCV:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get candidate by ID
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function getCandidate(req, res) {
  try {
    const { id } = req.params;
    
    const sql = 'SELECT * FROM candidates WHERE id = ?';
    const candidates = await tidbService.executeQuery(sql, [id]);
    
    if (candidates.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    const candidate = candidates[0];
    candidate.skills = JSON.parse(candidate.skills);
    candidate.cv_vector = JSON.parse(candidate.cv_vector);
    
    res.json({
      success: true,
      data: candidate
    });
  } catch (error) {
    console.error('Error in getCandidate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  uploadCV,
  getCandidate
};