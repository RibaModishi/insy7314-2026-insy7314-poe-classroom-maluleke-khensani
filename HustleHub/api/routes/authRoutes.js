const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiters');
const { validateRegister, validateLogin } = require('../middleware/validation');

const router = express.Router();

// Limiters run before validation, so a request rejected as junk still counts as an attempt
// and an attacker can't get unlimited tries by sending malformed bodies.
router.post('/register', registerLimiter, validateRegister, register);
router.post('/login', loginLimiter, validateLogin, login);
router.get('/me', verifyToken, getMe);

module.exports = router;
