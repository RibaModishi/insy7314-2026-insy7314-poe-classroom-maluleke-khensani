const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const SALT_ROUNDS = 10;

const register = async (req, res) => {
  // `role` is deliberately not read from the body: public registration only ever
  // creates clients, so nobody can self-assign freelancer or admin.
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    throw new Error('Name, email and password are required');
  }

  const normalizedEmail = email.toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new Error('Email already registered');
  }

  // Hash so a dump of the user store cannot reveal plaintext passwords.
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // The unique index still rejects a duplicate if two registrations race past findOne.
  const user = await User.create({ name, email: normalizedEmail, passwordHash }).catch((err) => {
    if (err.code === 11000) {
      throw new Error('Email already registered');
    }
    throw err;
  });

  // Never return passwordHash — the client has no need for the stored hash.
  res.status(201).json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  });
};

const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new Error('Invalid email or password');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT secret is not configured');
  }

  // Payload is only id and role so a stolen token does not expose name/email.
  const token = jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h'}
  );

  res.status(200).json({ token });
};

const getMe = async (req, res) => {
  // Tokens issued before the move to MongoDB carry numeric ids; treat them as unknown
  // users instead of letting a CastError message reach the client.
  const user = mongoose.isObjectIdOrHexString(req.user.id) ? await User.findById(req.user.id) : null;
  if (!user) {
    throw new Error('User not found');
  }

  res.status(200).json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  });
};

module.exports = { register, login, getMe };
