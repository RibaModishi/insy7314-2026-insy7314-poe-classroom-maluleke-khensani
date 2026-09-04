const bcrypt = require('bcrypt');
const users = require('../data/users.js');

const ALLOWED_ROLES = ['client', 'freelancer', 'admin'];
const SALT_ROUNDS = 10;

const register = async (req, res) => {
  const { name, email, password, role } = req.body || {};

  if (!name || !email || !password) {
    throw new Error('Name, email and password are required');
  }

  const assignedRole = role || 'client';
  if (!ALLOWED_ROLES.includes(assignedRole)) {
    throw new Error('Role must be one of: client, freelancer, admin');
  }

  const existing = users.find((user) => user.email === email);
  if (existing) {
    throw new Error('Email already registered');
  }

  // Hash so a dump of the user store cannot reveal plaintext passwords.
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = {
    id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
    name,
    email,
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

module.exports = { register };
