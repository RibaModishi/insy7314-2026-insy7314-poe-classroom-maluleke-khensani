const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.get('/me', verifyToken, getMe);

module.exports = router;
