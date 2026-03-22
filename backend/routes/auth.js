const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');
const authController = require('../controllers/authController');

const router = express.Router();

// User registration
router.post('/register', authController.registerUser);

// User login
router.post('/login', authController.loginUser);

// Admin registration
router.post('/admin/register', authController.registerAdmin);

// Admin login
router.post('/admin/login', authController.loginAdmin);

module.exports = router;