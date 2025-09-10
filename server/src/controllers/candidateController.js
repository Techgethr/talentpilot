// src/controllers/candidateController.js
const tidbService = require('../services/tidbService');
const nlpService = require('../services/nlpService');
const fileProcessingService = require('../services/fileProcessingService');

/**
 * Upload and process candidate CV file
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function uploadCV(req, res) {
  try {
    const { name, email, phone, linkedinUrl } = req.body;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'CV file is required' });
    }
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Process the uploaded file to extract text
    const cvText = await fileProcessingService.processFile(
      req.file.buffer, 
      req.file.mimetype
    );
    
    if (!cvText || cvText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from the uploaded file' });
    }
    
    // Convert CV text to vector
    const cvVector = await nlpService.textToVector(cvText);
    
    // Store candidate in database
    const candidateData = {
      name,
      email: email || null,
      phone: phone || null,
      linkedinUrl: linkedinUrl || null,
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
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}

/**
 * Update candidate information
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function updateCandidate(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone, linkedinUrl } = req.body;
    
    // Check if candidate exists
    const existingCandidate = await tidbService.getCandidateById(id);
    if (!existingCandidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    // Prepare update data - only include fields that are provided
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
    
    // Handle CV file update if provided
    if (req.file) {
      // Process the uploaded file to extract text
      const cvText = await fileProcessingService.processFile(
        req.file.buffer, 
        req.file.mimetype
      );
      
      if (cvText && cvText.trim().length > 0) {
        // Convert CV text to vector
        const cvVector = await nlpService.textToVector(cvText);
        
        updateData.cvText = cvText;
        updateData.cvVector = cvVector;
      }
    }
    
    // Update candidate in database
    await tidbService.updateCandidate(id, updateData);
    
    res.json({
      success: true,
      message: 'Candidate updated successfully'
    });
  } catch (error) {
    console.error('Error in updateCandidate:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
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
    
    const candidate = await tidbService.getCandidateById(id);
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    res.json({
      success: true,
      data: candidate
    });
  } catch (error) {
    console.error('Error in getCandidate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get all candidates
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function getAllCandidates(req, res) {
  try {
    const candidates = await tidbService.getAllCandidates();
    
    res.json({
      success: true,
      data: candidates
    });
  } catch (error) {
    console.error('Error in getAllCandidates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get similar candidates based on vector similarity
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function getSimilarCandidates(req, res) {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;
    
    // Validate limit parameter
    const validLimit = Math.min(Math.max(1, parseInt(limit)), 100);
    
    const similarCandidates = await tidbService.searchSimilarCandidates(id, validLimit);
    
    res.json({
      success: true,
      data: similarCandidates
    });
  } catch (error) {
    console.error('Error in getSimilarCandidates:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}

module.exports = {
  uploadCV,
  updateCandidate,
  getCandidate,
  getAllCandidates,
  getSimilarCandidates
};