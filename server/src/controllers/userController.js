// src/controllers/userController.js
const tidbService = require('../services/tidbService');
const { authorize } = require('../middleware/auth');

/**
 * Create a new user
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function createUser(req, res) {
  try {
    // Only admins can create users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create users' });
    }
    
    const { name, email, role } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const sql = `
      INSERT INTO users (name, email, role)
      VALUES (?, ?, ?)
    `;
    
    const params = [name, email, role || 'user'];
    const result = await tidbService.executeQuery(sql, params);
    
    res.status(201).json({
      success: true,
      userId: result.insertId,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error in createUser:', error);
    
    // Check for duplicate email
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get user by ID
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function getUser(req, res) {
  try {
    const { id } = req.params;
    
    const sql = 'SELECT id, name, email, role, created_at FROM users WHERE id = ?';
    const users = await tidbService.executeQuery(sql, [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Error in getUser:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update user
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    // Users can only update their own profile, admins can update any
    if (req.user.id != id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Can only update your own profile' });
    }
    
    // Check if user exists
    const checkSql = 'SELECT id FROM users WHERE id = ?';
    const users = await tidbService.executeQuery(checkSql, [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const sql = `
      UPDATE users 
      SET name = ?, email = ?, role = ?
      WHERE id = ?
    `;
    
    const params = [name, email, role, id];
    await tidbService.executeQuery(sql, params);
    
    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    
    // Check for duplicate email
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete user
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    
    // Only admins can delete users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete users' });
    }
    
    // Check if user exists
    const checkSql = 'SELECT id FROM users WHERE id = ?';
    const users = await tidbService.executeQuery(checkSql, [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const sql = 'DELETE FROM users WHERE id = ?';
    await tidbService.executeQuery(sql, [id]);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  createUser,
  getUser,
  updateUser,
  deleteUser
};