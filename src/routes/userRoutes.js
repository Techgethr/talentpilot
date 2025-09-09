// src/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// POST /users - Create a new user
router.post('/', userController.createUser);

// GET /users/:id - Get user by ID
router.get('/:id', userController.getUser);

// PUT /users/:id - Update user
router.put('/:id', userController.updateUser);

// DELETE /users/:id - Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;