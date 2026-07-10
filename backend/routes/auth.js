const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { registerUser, loginUser, registerEmployee, getUserData, updateUser, verifyEmail } = require('../controllers/authController');

// GET /api/auth/verify/:token
router.get('/verify/:token', verifyEmail);

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/register-employee
router.post('/register-employee', registerEmployee);

// POST /api/auth/login
router.post('/login', loginUser);

// GET /api/auth/user/:id
router.get('/user/:id', authMiddleware, getUserData);

// PUT /api/auth/user/:id
router.put('/user/:id', authMiddleware, updateUser);

module.exports = router;
