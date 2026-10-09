const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema(
  {
    // maxlength caps stored input size so oversized payloads can't bloat the database.
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    // min: 0 rejects negative prices, which would corrupt booking and income totals.
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    // The frontend serves these known local category paths as default artwork.
    image: {
      type: String,
      trim: true,
      maxlength: 300
    },
    // Required owner reference lets ownership checks decide who may edit or delete a gig.
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gig', gigSchema);
