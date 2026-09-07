// Standard Express error-handling middleware (4 args -> Express treats this as an
// error handler, not regular middleware). Must be registered LAST via app.use(), and
// its signature must keep all four params even though `next` is unused, or Express
// will treat it as regular middleware instead of an error handler.
//
// Express 5 auto-forwards errors thrown (or rejected) from async route handlers here,
// so every plain `throw new Error(...)` in the controllers/middleware ends up in this
// one place instead of leaking a raw stack trace to the client.

// Ordered list of { test, status } rules, checked against err.message. First match
// wins. Add new rules here (rather than scattering status codes through controllers)
// as new error messages are introduced.
const STATUS_RULES = [
  { test: /required/i, status: 400 },
  // Covers "Role must be one of: ...", "Email must be a valid email address", and
  // "Password must be at least 8 characters ..." from middleware/validation.js.
  { test: /must be/i, status: 400 },
  { test: /already registered|already exists/i, status: 409 },
  { test: /invalid email or password/i, status: 401 },
  { test: /no token provided/i, status: 401 },
  { test: /invalid or expired token/i, status: 401 },
  { test: /not found/i, status: 404 },
  { test: /not configured/i, status: 500 }
];

function statusForError(err) {
  // This app currently stores users in the in-memory data/users.js array, not
  // Mongoose — there is no ValidationError/CastError to special-case yet. If/when
  // this moves to Mongoose models, add here (checked before the message rules below):
  //   if (err.name === 'ValidationError' || err.name === 'CastError') return 400;

  const message = err && err.message ? err.message : '';
  const rule = STATUS_RULES.find(({ test }) => test.test(message));
  return rule ? rule.status : 500;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Full detail server-side only — never sent to the client.
  console.error(err);

  const status = statusForError(err);
  res.status(status).json({ error: err.message });
}

module.exports = errorHandler;
