const User = require('../models/User');

// Render Register Page
exports.getRegister = (req, res) => {
  const error = req.session.error;
  delete req.session.error;
  res.render('register', { error, title: 'Register - CampusCompass' });
};

// Handle Registration POST
exports.postRegister = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  // Simple validation
  if (!email || !password || !confirmPassword) {
    req.session.error = 'All fields are required';
    return res.redirect('/register');
  }

  if (password.length < 6) {
    req.session.error = 'Password must be at least 6 characters long';
    return res.redirect('/register');
  }

  if (password !== confirmPassword) {
    req.session.error = 'Passwords do not match';
    return res.redirect('/register');
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      req.session.error = 'An account with this email already exists';
      return res.redirect('/register');
    }

    // Create new user
    const user = new User({ email, password });
    await user.save();

    // Log the user in by setting the session ID
    req.session.userId = user._id;
    
    // Redirect to profile setup
    res.redirect('/profile/setup');
  } catch (error) {
    console.error('Registration Error:', error);
    req.session.error = 'An error occurred during registration. Please try again.';
    res.redirect('/register');
  }
};

// Render Login Page
exports.getLogin = (req, res) => {
  const error = req.session.error;
  const success = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.render('login', { error, success, title: 'Login - CampusCompass' });
};

// Handle Login POST
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.session.error = 'All fields are required';
    return res.redirect('/login');
  }

  try {
    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      req.session.error = 'Invalid email or password';
      return res.redirect('/login');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      req.session.error = 'Invalid email or password';
      return res.redirect('/login');
    }

    // Set session
    req.session.userId = user._id;

    // Check if profile is complete to determine where to redirect
    if (user.isProfileComplete) {
      res.redirect('/dashboard');
    } else {
      res.redirect('/profile/setup');
    }
  } catch (error) {
    console.error('Login Error:', error);
    req.session.error = 'An error occurred during login. Please try again.';
    res.redirect('/login');
  }
};

// Handle Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout Session Destroy Error:', err);
    }
    res.redirect('/');
  });
};

// Render Mock OAuth Consent Page
exports.getMockOAuth = (req, res) => {
  const { platform } = req.params;
  
  if (platform !== 'github' && platform !== 'leetcode') {
    req.session.error = 'Invalid authentication provider';
    return res.redirect('/login');
  }

  // Generate a mock suggested username
  const randNum = Math.floor(Math.random() * 900) + 100;
  const suggestedUsername = platform === 'github' 
    ? `github_dev_${randNum}` 
    : `leetcode_coder_${randNum}`;

  res.render('mock-oauth', {
    platform,
    suggestedUsername,
    title: `Authorize CampusCompass - ${platform.toUpperCase()}`
  });
};

// Handle Mock OAuth POST (simulates authorization response)
exports.postMockOAuth = async (req, res) => {
  const { platform } = req.params;
  const { username } = req.body;

  if (!username || username.trim().length === 0) {
    req.session.error = 'Username is required to mock authorize';
    return res.redirect(`/auth/${platform}`);
  }

  const cleanUsername = username.trim();
  const simulatedEmail = `${cleanUsername.toLowerCase()}@${platform}.com`;

  try {
    // Check if a user with this simulated social email already exists
    let user = await User.findOne({ email: simulatedEmail });
    
    if (!user) {
      // If not, create a new user automatically
      user = new User({
        email: simulatedEmail,
        password: 'mock_oauth_password_never_matches_plain' // safe hashed placeholder
      });
      
      // Auto populate social connection field
      if (platform === 'github') {
        user.profile = { ...user.profile, githubUsername: cleanUsername };
      } else if (platform === 'leetcode') {
        user.profile = { ...user.profile, leetcodeUsername: cleanUsername };
      }
      
      await user.save();
    } else {
      // If user exists, make sure connection is populated
      if (platform === 'github' && !user.profile.githubUsername) {
        user.profile = { ...user.profile, githubUsername: cleanUsername };
        await user.save();
      } else if (platform === 'leetcode' && !user.profile.leetcodeUsername) {
        user.profile = { ...user.profile, leetcodeUsername: cleanUsername };
        await user.save();
      }
    }

    // Sign the user in
    req.session.userId = user._id;

    if (user.isProfileComplete) {
      req.session.success = `Welcome back! Authenticated via ${platform === 'github' ? 'GitHub' : 'LeetCode'}`;
      res.redirect('/dashboard');
    } else {
      req.session.success = `Successfully authenticated via ${platform === 'github' ? 'GitHub' : 'LeetCode'}! Please complete your student profile.`;
      res.redirect('/profile/setup');
    }
  } catch (error) {
    console.error('Mock OAuth POST Error:', error);
    req.session.error = 'An error occurred during authentication. Please try again.';
    res.redirect('/login');
  }
};
