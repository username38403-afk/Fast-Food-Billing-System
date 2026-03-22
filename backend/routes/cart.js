const express = require('express');
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's cart (authenticated users only)
router.get('/cart/:user_id', authenticateToken, cartController.getUserCart);

// Add item to cart (authenticated users only)
router.post('/cart', authenticateToken, cartController.addToCart);

// Update cart item (authenticated users only)
router.put('/cart/:id', authenticateToken, cartController.updateCartItem);

// Remove item from cart (authenticated users only)
router.delete('/cart/:id', authenticateToken, cartController.removeFromCart);

module.exports = router;