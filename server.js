// fe/server.js
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { join } = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = process.env.SERVER_PORT || 3001;

// Import session configuration and API routes
let sessionConfig;
let sessionRoutes;

try {
  sessionConfig = require("./src/config/session");
  console.log('✅ Session config loaded successfully');
} catch (error) {
  console.error('❌ Failed to load session config:', error.message);
  // Fallback session config
  sessionConfig = {
    secret: process.env.SESSION_SECRET || 'fallback-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    },
    name: 'spopa.session.id'
  };
}

try {
  const sessionModule = require("./src/api/session");
  sessionRoutes = sessionModule.router;
  console.log('✅ Session routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load session routes:', error.message);
  console.error('Please ensure the file fe/src/api/session.js exists');
  process.exit(1);
}

// Trust proxy for production deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.auth0.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://stackpath.bootstrapcdn.com", "https://cdn.auth0.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'",
        "https://localhost:3443",
        "https://dev-csthezp5ifz25yr6.us.auth0.com",
        "http://localhost:8000",
        "http://localhost:8010",
        "http://localhost:4000",
        "http://localhost:3010",
      ],
      frameSrc: [
        "'self'",
        "https://dev-csthezp5ifz25yr6.us.auth0.com"
      ]
    }
  }
}));

// CORS configuration for development
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:3000', 'http://localhost:3001', 'https://localhost:3443', 'http://localhost:3443', 'http://localhost:8000', 'http://localhost:8010', 'http://localhost:4000', 'http://localhost:3010'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logging middleware
app.use(morgan("dev"));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware
app.use(cookieParser());

// Session middleware
app.use(session(sessionConfig));

// Session debugging middleware (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    if (req.url.startsWith('/api/session')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      console.log('Session ID:', req.sessionID);
      console.log('Session Data:', req.session);
    }
    next();
  });
}

// API routes for session management
app.use('/api', sessionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    session: {
      configured: !!sessionConfig,
      hasSessionId: !!req.sessionID,
      authenticated: !!req.session?.user
    }
  });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working',
    timestamp: new Date().toISOString(),
    sessionId: req.sessionID,
    session: req.session,
    headers: req.headers
  });
});

// Protected API endpoint example
app.get('/api/protected', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  res.json({
    message: 'This is a protected endpoint',
    user: req.session.user,
    userType: req.session.userType
  });
});

// Serve static files from the React app build
app.use(express.static(join(__dirname, "build")));

// API proxy middleware for development
if (process.env.NODE_ENV !== 'production') {
  try {
    const { createProxyMiddleware } = require('http-proxy-middleware');

    // Proxy requests to backend services
    app.use('/proxy/admin', createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      pathRewrite: { '^/proxy/admin': '' },
      onError: (err, req, res) => {
        console.error('Admin service proxy error:', err.message);
        res.status(502).json({ error: 'Admin service unavailable' });
      }
    }));

    app.use('/proxy/business', createProxyMiddleware({
      target: 'http://localhost:8010',
      changeOrigin: true,
      pathRewrite: { '^/proxy/business': '' },
      onError: (err, req, res) => {
        console.error('Business service proxy error:', err.message);
        res.status(502).json({ error: 'Business service unavailable' });
      }
    }));

    app.use('/proxy/process', createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
      pathRewrite: { '^/proxy/process': '' },
      onError: (err, req, res) => {
        console.error('Process service proxy error:', err.message);
        res.status(502).json({ error: 'Process service unavailable' });
      }
    }));

    console.log('✅ Proxy middleware configured successfully');
  } catch (error) {
    console.warn('⚠️  Proxy middleware not available:', error.message);
    console.warn('Install http-proxy-middleware if you need proxy functionality');
  }
}

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  // Add session data to the initial HTML for SSR preparation
  const sessionData = {
    authenticated: !!req.session.user,
    user: req.session.user || null,
    userType: req.session.userType || null
  };

  // Read the index.html file
  const path = join(__dirname, 'build', 'index.html');

  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Internal Server Error');
    }

    // Inject session data into the HTML
    const injectedData = data.replace(
      '<div id="root"',
      `<script>window.__INITIAL_SESSION__ = ${JSON.stringify(sessionData)};</script>
       <div id="root"`
    );

    res.send(injectedData);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

const https = require('https');

const sslOptions = {
  key: fs.readFileSync(join(__dirname, 'ssl', 'key.pem')),
  cert: fs.readFileSync(join(__dirname, 'ssl', 'cert.pem'))
};

const httpsPort = 3443;

const server = https.createServer(sslOptions, app).listen(httpsPort, () => {
  console.log(`🚀 SPOPA HTTPS Server listening on https://localhost:${httpsPort}`);
  console.log(`🔒 Session management enabled`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - GET  /api/test`);
  console.log(`   - GET  /api/session`);
  console.log(`   - POST /api/session/init`);
  console.log(`   - PUT  /api/session/usertype`);
  console.log(`   - DELETE /api/session`);
  console.log(`   - GET  /api/session/test`);
});


module.exports = app;