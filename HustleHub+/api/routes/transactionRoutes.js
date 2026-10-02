const express = require('express');
const { getMyTransactions, getMyIncome } = require('../controllers/transactionController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.get('/', verifyToken, getMyTransactions);
router.get('/income', verifyToken, getMyIncome);

module.exports = router;
