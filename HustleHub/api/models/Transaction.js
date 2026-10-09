const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // min: 0 rejects negative amounts that could fake refunds or inflate income totals.
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    // Cancellations add a refund instead of editing the payment, so the money trail stays complete.
    type: {
      type: String,
      enum: ['payment', 'refund'],
      default: 'payment'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
