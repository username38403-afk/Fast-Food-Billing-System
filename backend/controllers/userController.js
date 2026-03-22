const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');

class UserController {
  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const pool = getPool();

      const [users] = await pool.execute(
        'SELECT id, name, email, username, created_at FROM users ORDER BY created_at DESC'
      );

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const pool = getPool();

      const [users] = await pool.execute(
        'SELECT id, name, email, username, created_at FROM users WHERE id = ?',
        [id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: users[0]
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user'
      });
    }
  }

  // Update user (admin or self)
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, username, password } = req.body;
      const pool = getPool();

      // Check if user exists
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE id = ?',
        [id]
      );

      if (existingUsers.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check for duplicate email/username (excluding current user)
      const [conflicts] = await pool.execute(
        'SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?',
        [email, username, id]
      );

      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email or username already exists'
        });
      }

      let updateQuery = 'UPDATE users SET name = ?, email = ?, username = ?';
      let updateParams = [name, email, username];

      // If password is provided, hash it
      if (password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        updateQuery += ', password = ?';
        updateParams.push(hashedPassword);
      }

      updateQuery += ' WHERE id = ?';
      updateParams.push(id);

      await pool.execute(updateQuery, updateParams);

      res.json({
        success: true,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }

  // Delete user (admin only)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const pool = getPool();

      // Check if user exists
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE id = ?',
        [id]
      );

      if (existingUsers.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Delete user (cart and orders will be deleted via CASCADE)
      await pool.execute('DELETE FROM users WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }

  // Get user profile (self)
  async getProfile(req, res) {
    try {
      const userId = req.user.id; // From auth middleware
      const pool = getPool();

      const [users] = await pool.execute(
        'SELECT id, name, email, username, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: users[0]
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }
  }

  // Update profile (self)
  async updateProfile(req, res) {
    try {
      const userId = req.user.id; // From auth middleware
      const { name, email, username, password } = req.body;
      const pool = getPool();

      // Check for duplicate email/username (excluding current user)
      const [conflicts] = await pool.execute(
        'SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?',
        [email, username, userId]
      );

      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email or username already exists'
        });
      }

      let updateQuery = 'UPDATE users SET name = ?, email = ?, username = ?';
      let updateParams = [name, email, username];

      // If password is provided, hash it
      if (password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        updateQuery += ', password = ?';
        updateParams.push(hashedPassword);
      }

      updateQuery += ' WHERE id = ?';
      updateParams.push(userId);

      await pool.execute(updateQuery, updateParams);

      res.json({
        success: true,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }
}

module.exports = new UserController();