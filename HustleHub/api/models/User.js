const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    // unique + lowercase blocks duplicate accounts that differ only by letter case.
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    // Only the bcrypt hash is stored; plaintext passwords never reach the database.
    passwordHash: {
      type: String,
      required: true
    },
    // Enum stops arbitrary role values from being saved and bypassing access checks.
    role: {
      type: String,
      enum: ['client', 'freelancer', 'admin'],
      default: 'client',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
