const User = require('../models/User');

// Render Profile Setup Page (Initial)
exports.getProfileSetup = (req, res) => {
  const error = req.session.error;
  delete req.session.error;
  
  res.render('profile-setup', {
    error,
    title: 'Setup Profile - CampusCompass',
    user: req.user // Attached in ensureProfileIncomplete middleware
  });
};

// Handle Profile Setup POST
exports.postProfileSetup = async (req, res) => {
  const {
    fullName,
    collegeName,
    branch,
    currentYear,
    cgpa,
    careerGoal,
    skills,
    interests,
    dailyStudyHours
  } = req.body;

  // Basic validation
  if (!fullName || !collegeName || !branch || !currentYear || !careerGoal) {
    req.session.error = 'Full Name, College, Branch, Year, and Career Goal are required';
    return res.redirect('/profile/setup');
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.error = 'User not found. Please log in again.';
      return res.redirect('/login');
    }

    // Process lists (skills & interests) from comma-separated values
    const skillsArray = skills
      ? skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];
    const interestsArray = interests
      ? interests.split(',').map(i => i.trim()).filter(i => i.length > 0)
      : [];

    user.profile = {
      fullName,
      collegeName,
      branch,
      currentYear,
      cgpa: cgpa ? parseFloat(cgpa) : null,
      careerGoal,
      skills: skillsArray,
      interests: interestsArray,
      dailyStudyHours: dailyStudyHours ? parseInt(dailyStudyHours, 10) : null,
      githubUsername: user.profile.githubUsername || '',
      leetcodeUsername: user.profile.leetcodeUsername || ''
    };
    user.isProfileComplete = true;

    await user.save();

    req.session.success = 'Profile completed successfully! Welcome to your dashboard.';
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Profile Setup Error:', error);
    req.session.error = 'An error occurred while saving your profile. Please try again.';
    res.redirect('/profile/setup');
  }
};

// Render Profile View/Edit Page
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const error = req.session.error;
    const success = req.session.success;
    delete req.session.error;
    delete req.session.success;

    res.render('profile', {
      user,
      error,
      success,
      title: 'My Profile - CampusCompass'
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.redirect('/dashboard');
  }
};

// Handle Profile Update POST
exports.postProfileUpdate = async (req, res) => {
  const {
    fullName,
    collegeName,
    branch,
    currentYear,
    cgpa,
    careerGoal,
    skills,
    interests,
    dailyStudyHours
  } = req.body;

  if (!fullName || !collegeName || !branch || !currentYear || !careerGoal) {
    req.session.error = 'Full Name, College, Branch, Year, and Career Goal are required';
    return res.redirect('/profile');
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.error = 'User not found. Please log in again.';
      return res.redirect('/login');
    }

    const skillsArray = skills
      ? skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];
    const interestsArray = interests
      ? interests.split(',').map(i => i.trim()).filter(i => i.length > 0)
      : [];

    user.profile = {
      fullName,
      collegeName,
      branch,
      currentYear,
      cgpa: cgpa ? parseFloat(cgpa) : null,
      careerGoal,
      skills: skillsArray,
      interests: interestsArray,
      dailyStudyHours: dailyStudyHours ? parseInt(dailyStudyHours, 10) : null,
      githubUsername: user.profile.githubUsername || '',
      leetcodeUsername: user.profile.leetcodeUsername || ''
    };

    await user.save();

    req.session.success = 'Profile updated successfully!';
    res.redirect('/profile');
  } catch (error) {
    console.error('Profile Update Error:', error);
    req.session.error = 'An error occurred while updating your profile. Please try again.';
    res.redirect('/profile');
  }
};

// Connect GitHub or LeetCode Account
exports.connectAccount = async (req, res) => {
  const { platform, username } = req.body;

  if (!platform || !username) {
    req.session.error = 'Username is required to connect';
    return res.redirect('/social');
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.error = 'User not found. Please log in again.';
      return res.redirect('/login');
    }

    if (platform === 'github') {
      user.profile.githubUsername = username.trim();
      req.session.success = 'GitHub account connected successfully!';
    } else if (platform === 'leetcode') {
      user.profile.leetcodeUsername = username.trim();
      req.session.success = 'LeetCode account connected successfully!';
    } else {
      req.session.error = 'Invalid platform';
    }

    await user.save();
    res.redirect('/social');
  } catch (error) {
    console.error('Connect Account Error:', error);
    req.session.error = 'An error occurred. Please try again.';
    res.redirect('/social');
  }
};

// Disconnect GitHub or LeetCode Account
exports.disconnectAccount = async (req, res) => {
  const { platform } = req.body;

  if (!platform) {
    req.session.error = 'Platform is required to disconnect';
    return res.redirect('/social');
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.error = 'User not found. Please log in again.';
      return res.redirect('/login');
    }

    if (platform === 'github') {
      user.profile.githubUsername = '';
      req.session.success = 'GitHub account disconnected.';
    } else if (platform === 'leetcode') {
      user.profile.leetcodeUsername = '';
      req.session.success = 'LeetCode account disconnected.';
    } else {
      req.session.error = 'Invalid platform';
    }

    await user.save();
    res.redirect('/social');
  } catch (error) {
    console.error('Disconnect Account Error:', error);
    req.session.error = 'An error occurred. Please try again.';
    res.redirect('/social');
  }
};
