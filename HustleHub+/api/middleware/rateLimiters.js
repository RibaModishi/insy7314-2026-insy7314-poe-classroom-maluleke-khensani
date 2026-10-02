const { rateLimit } = require('express-rate-limit');

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

function minutesUntil(resetTime) {
  return Math.max(1, Math.ceil((resetTime - Date.now()) / 60000));
}

// Builds a 429 response that tells the client what happened and how long to wait,
// instead of the library's plain-text default.
function limitHandler(describe) {
  return (req, res, next, options) => {
    const minutes = minutesUntil(req.rateLimit.resetTime);
    res.status(options.statusCode).json({
      error: `${describe(options.limit)} Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
      retryAfterSeconds: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  };
}

// Per IP, and only failed attempts count, so password guessing is capped without
// locking out someone who simply logs in successfully several times.
const loginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: limitHandler((limit) => `Too many failed login attempts (limit is ${limit} per 15 minutes).`)
});

// Per logged-in user rather than per IP, so one account can't spam bookings and
// users sharing a network (e.g. campus Wi-Fi) don't block each other. Must run after verifyToken.
const bookingLimiter = rateLimit({
  windowMs: ONE_HOUR,
  limit: 10,
  keyGenerator: (req) => req.user.id,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: limitHandler((limit) => `Too many bookings created (limit is ${limit} per hour).`)
});

module.exports = { loginLimiter, bookingLimiter };
