const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, userController.getAllUsers);

// Get user by ID (admin only)
router.get('/users/:id', authenticateToken, requireAdmin, userController.getUserById);

// Update user (admin only)
router.put('/users/:id', authenticateToken, requireAdmin, userController.updateUser);

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, requireAdmin, userController.deleteUser);

// Get profile (authenticated user)
router.get('/profile', authenticateToken, userController.getProfile);

// Update profile (authenticated user)
router.put('/profile', authenticateToken, userController.updateProfile);

module.exports = router;