const { getPool } = require('../config/db');

class CartController {
  // Get user's cart
  async getUserCart(req, res) {
    try {
      const { user_id } = req.params;

      const pool = getPool();

      // Get cart items with item details
      const [cartItems] = await pool.execute(`
        SELECT
          c.id,
          c.quantity,
          i.id as item_id,
          i.name,
          i.category,
          i.price,
          i.image
        FROM cart c
        JOIN items i ON c.item_id = i.id
        WHERE c.user_id = ?
        ORDER BY c.id
      `, [user_id]);

      res.json({
        success: true,
        data: cartItems
      });

    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cart'
      });
    }
  }

  // Add item to cart
  async addToCart(req, res) {
    try {
      const { user_id, item_id, quantity } = req.body;

      // Validation
      if (!user_id || !item_id || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'User ID, item ID, and quantity are required'
        });
      }

      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be greater than 0'
        });
      }

      const pool = getPool();

      // Check if item exists
      const [items] = await pool.execute(
        'SELECT id FROM items WHERE id = ?',
        [item_id]
      );

      if (items.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      // Check if item already in cart
      const [existingCart] = await pool.execute(
        'SELECT id, quantity FROM cart WHERE user_id = ? AND item_id = ?',
        [user_id, item_id]
      );

      if (existingCart.length > 0) {
        // Update quantity
        const newQuantity = existingCart[0].quantity + quantity;
        await pool.execute(
          'UPDATE cart SET quantity = ? WHERE id = ?',
          [newQuantity, existingCart[0].id]
        );

        res.json({
          success: true,
          message: 'Cart updated successfully'
        });
      } else {
        // Add new item to cart
        await pool.execute(
          'INSERT INTO cart (user_id, item_id, quantity) VALUES (?, ?, ?)',
          [user_id, item_id, quantity]
        );

        res.status(201).json({
          success: true,
          message: 'Item added to cart successfully'
        });
      }

    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add item to cart'
      });
    }
  }

  // Update cart item
  async updateCartItem(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      // Validation
      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be greater than 0'
        });
      }

      const pool = getPool();

      // Check if cart item exists
      const [existingCart] = await pool.execute(
        'SELECT id FROM cart WHERE id = ?',
        [id]
      );

      if (existingCart.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      // Update cart item
      await pool.execute(
        'UPDATE cart SET quantity = ? WHERE id = ?',
        [quantity, id]
      );

      res.json({
        success: true,
        message: 'Cart item updated successfully'
      });

    } catch (error) {
      console.error('Update cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update cart item'
      });
    }
  }

  // Remove item from cart
  async removeFromCart(req, res) {
    try {
      const { id } = req.params;

      const pool = getPool();

      // Check if cart item exists
      const [existingCart] = await pool.execute(
        'SELECT id FROM cart WHERE id = ?',
        [id]
      );

      if (existingCart.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      // Delete cart item
      await pool.execute('DELETE FROM cart WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Item removed from cart successfully'
      });

    } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove item from cart'
      });
    }
  }
}

module.exports = new CartController();