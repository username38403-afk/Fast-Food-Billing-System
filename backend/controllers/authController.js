const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');

class AuthController {
  // Admin registration
  async registerAdmin(req, res) {
    try {
      const { name, email, username, password, code } = req.body;

      // 1️⃣ Validate input
      if (!name || !email || !username || !password || !code) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required, including the admin code'
        });
      }

      // 2️⃣ Verify special code
      const ADMIN_SECRET_CODE = 'ADMIN123'; // your admin code
      if (code !== ADMIN_SECRET_CODE) {
        return res.status(403).json({
          success: false,
          message: 'Invalid admin code'
        });
      }

      const pool = getPool();

      // 3️⃣ Check if admin already exists
      const [existingAdmins] = await pool.execute(
        'SELECT id FROM admins WHERE username = ? OR email = ?',
        [username, email]
      );

      if (existingAdmins.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Username or email already exists'
        });
      }

      // 4️⃣ Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 5️⃣ Insert new admin
      const [result] = await pool.execute(
        'INSERT INTO admins (name, email, username, password) VALUES (?, ?, ?, ?)',
        [name, email, username, hashedPassword]
      );

      // 6️⃣ Send success response
      res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        admin: {
          id: result.insertId,
          name,
          email,
          username
        }
      });

    } catch (error) {
      console.error('Admin registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Admin registration failed'
      });
    }
  }
  
  // User registration
  async registerUser(req, res) {
    try {
      const { name, email, username, password } = req.body;

      // Validation
      if (!name || !email || !username || !password) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      const pool = getPool();

      // Check if user already exists
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Username or email already exists'
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert user
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)',
        [name, email, username, hashedPassword]
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: result.insertId,
          name,
          email,
          username
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  }

  // User login
  async loginUser(req, res) {
    try {
      const { credential, password } = req.body;

      if (!credential || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username/email and password are required'
        });
      }

      const pool = getPool();

      // Find user
      const [users] = await pool.execute(
        'SELECT id, name, email, username, password FROM users WHERE username = ? OR email = ?',
        [credential, credential]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }

  // Admin login
  async loginAdmin(req, res) {
    try {
      const { credential, password } = req.body;

      if (!credential || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username/email and password are required'
        });
      }

      const pool = getPool();

      // Find admin
      const [admins] = await pool.execute(
        'SELECT id, name, email, username, password FROM admins WHERE username = ? OR email = ?',
        [credential, credential]
      );

      if (admins.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const admin = admins[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: admin.id, username: admin.username, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Admin login successful',
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          username: admin.username
        }
      });

    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({
        success: false,
        message: 'Admin login failed'
      });
    }
  }
}

module.exports = new AuthController();