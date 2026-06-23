const express = require('express');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB Database
connectDB();

// Initialize Express App
const app = express();

// Set up Template Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
// Parse incoming JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure Express Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'campus_compass_secret_key_12345',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Session active for 1 day
      secure: false, // Set to true in production if running over HTTPS
      httpOnly: true // Mitigates XSS security risks
    }
  })
);

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
app.use((req, res, next) => {
  res.status(404).render('landing', {
    title: '404 - Page Not Found',
    error: 'The page you are looking for does not exist.'
  });
});

// Start the Express Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});
