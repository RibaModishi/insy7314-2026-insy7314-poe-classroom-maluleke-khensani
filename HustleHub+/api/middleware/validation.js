// Input validation for the auth routes. Runs ahead of the register/login controllers
// (wired in index.js, not authRoutes.js — see index.js for why) so authController.js
// only ever sees input that has already passed these checks.
//
// Matches the existing codebase convention: plain `throw new Error(...)` on bad
// input, no try/catch here. Express auto-catches synchronous throws in middleware
// and forwards them to middleware/errorHandler.js.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Chosen policy: 8+ characters, at least one uppercase letter, one lowercase letter,
// one digit, and one special character. This is a standard "strong password" baseline
// (NIST/OWASP-style) appropriate for a security-focused submission — strict enough to
// reject trivial passwords like "password1" without requiring an external library.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// Kept in sync with authController.js's ALLOWED_ROLES by hand — authController.js is
// on the do-not-modify list, so it doesn't export this list for us to import.
const ALLOWED_ROLES = ['client', 'freelancer', 'admin'];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateRegister(req, res, next) {
  const { name, email, password, role } = req.body || {};

  if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
    throw new Error('Name, email and password are required');
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new Error('Email must be a valid email address');
  }

  if (!PASSWORD_REGEX.test(password)) {
    throw new Error(
      'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character'
    );
  }

  // Mirrors authController.js: an omitted/falsy role defaults to 'client' there, so
  // only reject a role that was actually provided and isn't in the allowed set.
  if (role && !ALLOWED_ROLES.includes(role)) {
    throw new Error('Role must be one of: client, freelancer, admin');
  }

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body || {};

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    throw new Error('Email and password are required');
  }

  next();
}

module.exports = { validateRegister, validateLogin };
