const { getPool } = require('../config/db');

class OrderController {
  // Create new order
  async createOrder(req, res) {
    try {
      const { user_id, items, total, tax, discount, grand_total } = req.body;

      // Validation
      if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User ID and items array are required'
        });
      }

      const pool = getPool();

      // Start transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Insert order
        const [orderResult] = await connection.execute(
          'INSERT INTO orders (user_id, total, tax, discount, grand_total, status) VALUES (?, ?, ?, ?, ?, ?)',
          [user_id, total || 0, tax || 0, discount || 0, grand_total || 0, 'pending']
        );

        const orderId = orderResult.insertId;

        // Insert order items
        for (const item of items) {
          await connection.execute(
            'INSERT INTO order_items (order_id, item_id, quantity, price) VALUES (?, ?, ?, ?)',
            [orderId, item.item_id, item.quantity, item.price]
          );
        }

        // Clear user's cart
        await connection.execute('DELETE FROM cart WHERE user_id = ?', [user_id]);

        // Commit transaction
        await connection.commit();

        res.status(201).json({
          success: true,
          message: 'Order created successfully',
          data: {
            order_id: orderId,
            status: 'pending'
          }
        });

      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }

    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order'
      });
    }
  }

  // Get all orders (admin)
  async getAllOrders(req, res) {
    try {
      const pool = getPool();

      const [orders] = await pool.execute(`
        SELECT
          o.id,
          o.user_id,
          o.total,
          o.tax,
          o.discount,
          o.grand_total,
          o.status,
          o.created_at,
          u.name as user_name,
          u.username as user_username
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `);

      // Get order items for each order
      for (const order of orders) {
        const [orderItems] = await pool.execute(`
          SELECT
            oi.quantity,
            oi.price,
            i.name,
            i.category,
            i.image
          FROM order_items oi
          JOIN items i ON oi.item_id = i.id
          WHERE oi.order_id = ?
        `, [order.id]);

        order.items = orderItems;
      }

      res.json({
        success: true,
        data: orders
      });

    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders'
      });
    }
  }

  // Get user's orders
  async getUserOrders(req, res) {
    try {
      const { user_id } = req.params;

      const pool = getPool();

      const [orders] = await pool.execute(`
        SELECT
          id,
          total,
          tax,
          discount,
          grand_total,
          status,
          created_at
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
      `, [user_id]);

      // Get order items for each order
      for (const order of orders) {
        const [orderItems] = await pool.execute(`
          SELECT
            oi.quantity,
            oi.price,
            i.name,
            i.category,
            i.image
          FROM order_items oi
          JOIN items i ON oi.item_id = i.id
          WHERE oi.order_id = ?
        `, [order.id]);

        order.items = orderItems;
      }

      res.json({
        success: true,
        data: orders
      });

    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user orders'
      });
    }
  }

  // Update order status
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validation
      const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Valid status is required (pending, processing, completed, cancelled)'
        });
      }

      const pool = getPool();

      // Check if order exists
      const [existingOrders] = await pool.execute(
        'SELECT id FROM orders WHERE id = ?',
        [id]
      );

      if (existingOrders.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Update order status
      await pool.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id]
      );

      res.json({
        success: true,
        message: 'Order status updated successfully'
      });

    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order status'
      });
    }
  }
}

module.exports = new OrderController();