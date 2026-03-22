const express = require('express');
const itemController = require('../controllers/itemController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all items (public)
router.get('/items', itemController.getAllItems);

// Create new item (admin only)
router.post('/items', authenticateToken, requireAdmin, itemController.createItem);

// Update item (admin only)
router.put('/items/:id', authenticateToken, requireAdmin, itemController.updateItem);

// Delete item (admin only)
router.delete('/items/:id', authenticateToken, requireAdmin, itemController.deleteItem);

module.exports = router;