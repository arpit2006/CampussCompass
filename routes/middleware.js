const User = require('../models/User');

// Middleware to ensure user is logged in
const ensureAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
};

// Middleware to prevent logged-in users from visiting login/register pages
const ensureGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
};

// Middleware to ensure user has completed their profile setup
const ensureProfileComplete = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.redirect('/login');
    }
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }
    if (!user.isProfileComplete) {
      return res.redirect('/profile/setup');
    }
    req.user = user; // Attach user document to request for controllers
    next();
  } catch (error) {
    console.error('Error in ensureProfileComplete middleware:', error);
    res.redirect('/login');
  }
};

// Middleware to ensure user has NOT completed their profile yet (only for setup page)
const ensureProfileIncomplete = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.redirect('/login');
    }
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }
    if (user.isProfileComplete) {
      return res.redirect('/dashboard');
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in ensureProfileIncomplete middleware:', error);
    res.redirect('/login');
  }
};

module.exports = {
  ensureAuth,
  ensureGuest,
  ensureProfileComplete,
  ensureProfileIncomplete
};
