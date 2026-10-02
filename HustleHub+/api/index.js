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

// 404 handler — must come after all real routes, before the error handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Central error handler 
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(400).json({ error: err.message });
});

const PORT = process.env.PORT || 4000;
const USE_HTTPS = process.env.USE_HTTPS === 'true';

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