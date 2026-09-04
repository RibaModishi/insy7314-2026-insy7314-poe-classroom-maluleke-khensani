const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const users = require('../data/users.js');

const ALLOWED_ROLES = ['client', 'freelancer', 'admin'];
const SALT_ROUNDS = 10;

const register = async (req, res) => {
  const { name, email, password, role } = req.body || {};

  if (!name || !email || !password) {
    throw new Error('Name, email and password are required');
  }

  const normalizedEmail = email.toLowerCase();

  const assignedRole = role || 'client';
  if (!ALLOWED_ROLES.includes(assignedRole)) {
    throw new Error('Role must be one of: client, freelancer, admin');
  }

  const existing = users.find((user) => user.email === normalizedEmail);
  if (existing) {
    throw new Error('Email already registered');
  }

  // Hash so a dump of the user store cannot reveal plaintext passwords.
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = {
    id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
    name,
    email: normalizedEmail,
    passwordHash,
    role: assignedRole
  };

  users.push(user);

  // Never return passwordHash — the client has no need for the stored hash.
  res.status(201).json({
    id: user.id,
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
  const user = users.find((u) => u.email === normalizedEmail);
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
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.status(200).json({ token });
};

const getMe = async (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    throw new Error('User not found');
  }

  res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
};

module.exports = { register, login, getMe };
