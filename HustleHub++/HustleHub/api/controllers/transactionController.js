const Transaction = require('../models/Transaction');
const { ownershipFilter } = require('../utils/ownership');

const getMyTransactions = async (req, res) => {
  // Only transactions the caller is part of, so nobody can see other users' payments.
  const transactions = await Transaction.find(ownershipFilter(req.user.id, ['client', 'freelancer'])).sort({ createdAt: -1 });

  res.status(200).json(transactions);
};

const getMyIncome = async (req, res) => {
  const transactions = await Transaction.find(ownershipFilter(req.user.id, ['freelancer'])).sort({ createdAt: -1 });

  let totalEarned = 0;
  let totalRefunded = 0;
  for (const t of transactions) {
    if (t.type === 'payment') totalEarned += t.amount;
    else if (t.type === 'refund') totalRefunded += t.amount;
  }

  res.status(200).json({
    totalEarned,
    totalRefunded,
    netIncome: totalEarned - totalRefunded,
    transactionCount: transactions.length,
    transactions
  });
};

module.exports = { getMyTransactions, getMyIncome };
