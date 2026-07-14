const express = require('express');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
const crypto = require('crypto');
const { connectDB, sequelize } = require('./config/db');

// Load environment variables from .env file
dotenv.config();



// Initialize Express App
const app = express();

// Trust proxy (essential for secure session cookies to work behind Vercel/reverse proxies)
app.set('trust proxy', 1);

// Set up Template Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
// Parse incoming JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lazy Database Connection & Synchronization Middleware
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await connectDB();
      await sequelize.sync();
      dbInitialized = true;
      console.log('Database connected and models synchronized successfully.');
    } catch (error) {
      console.error('Database initialization failed:', error);
      return res.status(500).send('Database initialization failed. Please check server logs.');
    }
  }
  next();
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure Express Session
let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  if (process.env.NODE_ENV === 'production') {
    console.warn('WARNING: SESSION_SECRET is not set in production. Generating a random fallback secret.');
    sessionSecret = crypto.randomBytes(32).toString('hex');
  } else {
    sessionSecret = 'campus_compass_secret_key_12345';
  }
}

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Session active for 1 day
      secure: process.env.NODE_ENV === 'production', // Set to true in production if running over HTTPS
      httpOnly: true // Mitigates XSS security risks
    }
  })
);

// CSRF Protection Middleware
app.use((req, res, next) => {
  // Ensure token exists in session
  if (!req.session.csrfToken) {
    req.session.csrfToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Expose to templates
  res.locals.csrfToken = req.session.csrfToken;

  // Verify token on state-changing requests
  const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (stateChangingMethods.includes(req.method)) {
    const requestToken = req.body._csrf || req.headers['x-csrf-token'] || req.query._csrf;
    if (!requestToken || requestToken !== req.session.csrfToken) {
      return res.status(403).send('Forbidden: CSRF token validation failed.');
    }
  }
  next();
});

// Global view variables middleware
// Exposes session status to all EJS templates automatically
app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.session.userId;
  res.locals.userId = req.session.userId || null;
  next();
});

// Import Route Handlers
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

// Mount Routers
app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/profile', profileRoutes);

// 404 Error Handler for undefined routes
app.use((req, res, _next) => {
  res.status(404).render('landing', {
    title: '404 - Page Not Found',
    error: 'The page you are looking for does not exist.'
  });
});

// Start the Express Server (only if not running on Vercel serverless)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
  });
}

module.exports = app;
