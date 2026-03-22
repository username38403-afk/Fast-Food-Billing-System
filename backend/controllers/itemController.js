const { getPool } = require('../config/db');

class ItemController {
  // Get all items
  async getAllItems(req, res) {
    try {
      const pool = getPool();
      const [items] = await pool.execute(
        'SELECT id, name, category, price, image FROM items ORDER BY category, name'
      );

      res.json({
        success: true,
        data: items
      });

    } catch (error) {
      console.error('Get items error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch items'
      });
    }
  }

  // Create new item
  async createItem(req, res) {
    try {
      const { name, category, price, image } = req.body;

      // Validation
      if (!name || !category || !price) {
        return res.status(400).json({
          success: false,
          message: 'Name, category, and price are required'
        });
      }

      if (price <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be greater than 0'
        });
      }

      const pool = getPool();

      // Insert item
      const [result] = await pool.execute(
        'INSERT INTO items (name, category, price, image) VALUES (?, ?, ?, ?)',
        [name, category, price, image || '']
      );

      res.status(201).json({
        success: true,
        message: 'Item created successfully',
        data: {
          id: result.insertId,
          name,
          category,
          price,
          image: image || ''
        }
      });

    } catch (error) {
      console.error('Create item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create item'
      });
    }
  }

  // Update item
  async updateItem(req, res) {
    try {
      const { id } = req.params;
      const { name, category, price, image } = req.body;

      // Validation
      if (!name || !category || !price) {
        return res.status(400).json({
          success: false,
          message: 'Name, category, and price are required'
        });
      }

      if (price <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be greater than 0'
        });
      }

      const pool = getPool();

      // Check if item exists
      const [existingItems] = await pool.execute(
        'SELECT id FROM items WHERE id = ?',
        [id]
      );

      if (existingItems.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      // Update item
      await pool.execute(
        'UPDATE items SET name = ?, category = ?, price = ?, image = ? WHERE id = ?',
        [name, category, price, image || '', id]
      );

      res.json({
        success: true,
        message: 'Item updated successfully',
        data: {
          id: parseInt(id),
          name,
          category,
          price,
          image: image || ''
        }
      });

    } catch (error) {
      console.error('Update item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update item'
      });
    }
  }

  // Delete item
  async deleteItem(req, res) {
    try {
      const { id } = req.params;

      const pool = getPool();

      // Check if item exists
      const [existingItems] = await pool.execute(
        'SELECT id FROM items WHERE id = ?',
        [id]
      );

      if (existingItems.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      // Delete item
      await pool.execute('DELETE FROM items WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Item deleted successfully'
      });

    } catch (error) {
      console.error('Delete item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete item'
      });
    }
  }
}

module.exports = new ItemController();