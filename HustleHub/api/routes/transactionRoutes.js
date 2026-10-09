const express = require('express');
const { getMyTransactions, getMyIncome } = require('../controllers/transactionController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

router.get('/', verifyToken, authorizeRoles('client', 'freelancer'), getMyTransactions);
router.get('/income', verifyToken, authorizeRoles('freelancer'), getMyIncome);

module.exports = router;
