require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const https = require('https');
const fs = require('fs');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiters');

const app = express();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const HTTPS_ENABLED = process.env.USE_HTTPS === 'true';

// This API only ever returns JSON, so its CSP denies every resource type instead of
// Helmet's website-oriented defaults (which allow inline styles and https: fonts).
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'none'"],
        // The three below don't fall back to default-src, so each is locked down explicitly.
        baseUri: ["'none'"],
        formAction: ["'none'"],
        frameAncestors: ["'none'"],
        ...(HTTPS_ENABLED ? { upgradeInsecureRequests: [] } : {})
      }
    },
    // HSTS only means something over HTTPS; sending it on plain HTTP would be misleading.
    strictTransportSecurity: HTTPS_ENABLED ? { maxAge: 31536000, includeSubDomains: true } : false,
    // Matches frame-ancestors 'none' for older browsers that ignore CSP.
    xFrameOptions: { action: 'deny' },
    referrerPolicy: { policy: 'no-referrer' }
  })
);
app.disable('x-powered-by');

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Before body parsing, so a flood of requests is rejected without reading their bodies.
app.use('/api', apiLimiter);

// The largest legitimate body (a gig with a 1000-character description) is well under 10kb,
// so anything bigger is refused before it can tie up the server.
app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => {
  res.send('API is running');
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/gigs', require('./routes/gigRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));

// Both must stay after every route: notFound catches unmatched paths, and errorHandler
// (registered last) turns every thrown error into a JSON response with the right status.
app.use(require('./middleware/notFound'));
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 4000;
const USE_HTTPS = process.env.USE_HTTPS === 'true';

// Checked up front so a missing secret stops the server at startup, instead of
// surfacing later as a failed login or an unsigned token.
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', ...(USE_HTTPS ? ['SSL_KEY_PATH', 'SSL_CERT_PATH'] : [])];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}. Copy .env.example to .env and fill them in.`);
  process.exit(1);
}

(async () => {
  await connectDB();

  if (USE_HTTPS) {
    const httpsOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH)
    };

    https.createServer(httpsOptions, app).listen(PORT, () => {
      console.log(`HTTPS server running on port ${PORT}`);
    });
  } else {  
    app.listen(PORT, () => {
      console.log(`HTTP server running on port ${PORT}`);
    });
  }
})();