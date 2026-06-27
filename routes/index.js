const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
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

// Community Discussion Page
router.get('/discussion', ensureProfileComplete, (req, res) => {
  res.render('discussion', {
    title: 'Community Discussion - CampusCompass',
    user: req.user,
    isLoggedIn: true
  });
});

// Privacy & Cookies Policy Page
router.get('/privacy', (req, res) => {
  res.render('privacy', { title: 'Privacy & Cookies Policy - CampusCompass' });
});

// Terms of Service Page
router.get('/terms', (req, res) => {
  res.render('terms', { title: 'Terms & Conditions - CampusCompass' });
});

// Curated Resources Page
router.get('/resources', async (req, res, next) => {
  try {
    if (req.session && req.session.userId) {
      return res.redirect('/dashboard?tab=resources');
    }
    res.render('resources', {
      title: 'Curated Resources - CampusCompass',
      user: null,
      isLoggedIn: false
    });
  } catch (err) {
    next(err);
  }
});

// Curated Playlists Page
router.get('/playlists', async (req, res, next) => {
  try {
    // Load playlist data
    const playlistsPath = path.join(__dirname, '../data/curatedPlaylists.json');
    const playlistsRaw = fs.readFileSync(playlistsPath, 'utf8');
    const playlistsData = JSON.parse(playlistsRaw);

    const allTracks = [
      { key: 'web-developer', label: 'Web Developer' },
      { key: 'data-scientist', label: 'Data Scientist' },
      { key: 'software-engineer', label: 'Software Engineer' },
      { key: 'ai-engineer', label: 'AI Engineer' },
      { key: 'cloud-engineer', label: 'Cloud Engineer' },
      { key: 'cyber-security', label: 'Cybersecurity Specialist' }
    ];

    let user = null;
    let trackKey = req.query.track || 'web-developer';
    const isLoggedIn = !!(req.session && req.session.userId);

    if (isLoggedIn) {
      user = await User.findById(req.session.userId);
      if (user && user.profile && user.profile.careerGoal) {
        // Map user's careerGoal to playlist key
        const goal = user.profile.careerGoal.toLowerCase();
        if (goal.includes('ai') || goal.includes('artificial')) trackKey = 'ai-engineer';
        else if (goal.includes('cloud')) trackKey = 'cloud-engineer';
        else if (goal.includes('cyber')) trackKey = 'cyber-security';
        else if (goal.includes('data')) trackKey = 'data-scientist';
        else if (goal.includes('software') || goal.includes('sde')) trackKey = 'software-engineer';
        else if (goal.includes('web')) trackKey = 'web-developer';
      }
    }

    const currentTrackData = playlistsData[trackKey] || playlistsData['web-developer'];

    res.render('playlists', {
      title: 'Vetted Video Playlists - CampusCompass',
      isLoggedIn,
      user,
      trackKey,
      allTracks,
      trackData: currentTrackData
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
