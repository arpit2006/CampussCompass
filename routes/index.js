const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { ensureGuest, ensureProfileComplete } = require('./middleware');

// Landing Page (Only for guests, logged-in users get redirected to dashboard)
router.get('/', ensureGuest, (req, res) => {
  res.render('landing', { title: 'CampusCompass - Navigation for College Students' });
});

// Dashboard Page
router.get('/dashboard', ensureProfileComplete, dashboardController.getDashboard);

// Social Connect Page
router.get('/social', ensureProfileComplete, dashboardController.getSocial);

module.exports = router;
