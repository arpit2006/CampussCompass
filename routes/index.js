const express = require('express');
const router = express.Router();
const User = require('../models/User');
const dashboardController = require('../controllers/dashboardController');
const { ensureGuest, ensureProfileComplete } = require('./middleware');
const {
  DEFAULT_PLAYLIST_TRACK,
  getAvailablePlaylistTracks,
  getPlaylistData,
  resolvePlaylistTrackKeyFromCareerGoal
} = require('../services/contentDataLoader');

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
    let user = null;
    let requestedTrackKey = req.query.track || DEFAULT_PLAYLIST_TRACK;
    const isLoggedIn = !!(req.session && req.session.userId);

    if (isLoggedIn) {
      user = await User.findById(req.session.userId);
      if (user && user.profile && user.profile.careerGoal) {
        requestedTrackKey = resolvePlaylistTrackKeyFromCareerGoal(user.profile.careerGoal) || requestedTrackKey;
      }
    }

    const allTracks = getAvailablePlaylistTracks();
    const { trackKey, trackData } = getPlaylistData(requestedTrackKey);

    res.render('playlists', {
      title: 'Vetted Video Playlists - CampusCompass',
      isLoggedIn,
      user,
      trackKey,
      allTracks,
      trackData
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
