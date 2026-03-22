const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Create new order (authenticated users only)
router.post('/orders', authenticateToken, orderController.createOrder);

// Get all orders (admin only)
router.get('/orders', authenticateToken, requireAdmin, orderController.getAllOrders);

// Get user's orders (authenticated users only)
router.get('/orders/user/:user_id', authenticateToken, orderController.getUserOrders);

// Update order status (admin only)
router.put('/orders/:id', authenticateToken, requireAdmin, orderController.updateOrderStatus);

module.exports = router;