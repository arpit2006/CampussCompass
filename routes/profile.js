const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { ensureAuth, ensureProfileIncomplete, ensureProfileComplete } = require('./middleware');

// Profile Setup routes (Initial onboarding)
router.get('/setup', ensureAuth, ensureProfileIncomplete, profileController.getProfileSetup);
router.post('/setup', ensureAuth, ensureProfileIncomplete, profileController.postProfileSetup);

// Profile view & update routes
router.get('/', ensureAuth, ensureProfileComplete, profileController.getProfile);
router.post('/update', ensureAuth, ensureProfileComplete, profileController.postProfileUpdate);

// Connected Accounts
router.post('/connect', ensureAuth, ensureProfileComplete, profileController.connectAccount);
router.post('/disconnect', ensureAuth, ensureProfileComplete, profileController.disconnectAccount);

module.exports = router;
