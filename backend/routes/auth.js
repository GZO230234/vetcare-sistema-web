const express = require('express');
const router = express.Router();
const { registerUser, loginUser, registerEmployee } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/register-employee
router.post('/register-employee', registerEmployee);

// POST /api/auth/login
router.post('/login', loginUser);

module.exports = router;
