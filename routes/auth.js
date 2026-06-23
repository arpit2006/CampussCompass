const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureGuest, ensureAuth } = require('./middleware');

// GET & POST Registration
router.get('/register', ensureGuest, authController.getRegister);
router.post('/register', ensureGuest, authController.postRegister);

// GET & POST Login
router.get('/login', ensureGuest, authController.getLogin);
router.post('/login', ensureGuest, authController.postLogin);

// GET Logout
router.get('/logout', ensureAuth, authController.logout);

// Mock Social OAuth Logins
router.get('/auth/:platform', ensureGuest, authController.getMockOAuth);
router.post('/auth/:platform', ensureGuest, authController.postMockOAuth);

module.exports = router;
