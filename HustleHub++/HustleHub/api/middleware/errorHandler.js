// Central error handler. Every route and middleware throws a plain Error on bad input and
// Express 5 forwards it here, so this is the only place that turns an error into a response.
// It must be registered last in index.js and keep all four parameters, or Express will not
// treat it as an error handler.

// Ordered { test, status } rules matched against err.message; first match wins. The more
// specific rules come first so a broad pattern like /required/ can't claim them.
const STATUS_RULES = [
  { test: /no token provided|invalid or expired token|account no longer exists/i, status: 401 },
  { test: /invalid email or password/i, status: 401 },
  { test: /access denied|do not own|not part of this booking/i, status: 403 },
  { test: /already registered/i, status: 409 },
  { test: /^cannot (change booking|delete a gig)/i, status: 409 },
  { test: /not found/i, status: 404 },
  { test: /not configured/i, status: 500 },
  { test: /invalid (gig|booking) id/i, status: 400 },
  { test: /cannot book your own gig/i, status: 400 },
  { test: /required/i, status: 400 },
  { test: /\bmust\b/i, status: 400 }
];

function statusForError(err) {
  // Errors raised by express.json() carry a `type` and their own 4xx status
  // (400 for broken JSON, 413 for a body over the 10kb limit).
  if (err.type && Number.isInteger(err.status) && err.status >= 400 && err.status < 500) {
    return err.status;
  }
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return 400;
  }

  const message = typeof err.message === 'string' ? err.message : '';
  const rule = STATUS_RULES.find(({ test }) => test.test(message));
  return rule ? rule.status : 500;
}

// Replaces messages that are technical or that come from a library rather than our own code.
function clientMessage(err, status) {
  // A 500 means something unexpected broke; its real message can expose internals.
  if (status === 500) return 'Internal server error';
  if (err.type === 'entity.parse.failed') return 'Request body is not valid JSON';
  if (err.type === 'entity.too.large') return 'Request body is too large (limit is 10kb)';
  if (err.name === 'ValidationError') return `Invalid value for: ${Object.keys(err.errors || {}).join(', ')}`;
  if (err.name === 'CastError') return `Invalid value for: ${err.path}`;
  return err.message;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Full detail (including the stack) stays in the server log only.
  console.error(err);

  const status = statusForError(err);
  res.status(status).json({ error: clientMessage(err, status) });
}

module.exports = errorHandler;
