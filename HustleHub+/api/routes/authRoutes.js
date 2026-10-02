const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');
const { loginLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.get('/me', verifyToken, getMe);

module.exports = router;
