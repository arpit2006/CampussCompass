const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// Map career goals to roadmap JSON files
const ROADMAP_FILES = {
  'Data Scientist': 'data-scientist.json',
  'Software Engineer': 'software-engineer.json',
  'Web Developer': 'web-developer.json',
  'AI Engineer': 'ai-engineer.json',
  'Cyber Security': 'cyber-security.json',
  'Cloud Engineer': 'cloud-engineer.json'
};

// Helper function to read roadmap JSON data
const getRoadmapData = (careerGoal) => {
  const filename = ROADMAP_FILES[careerGoal];
  if (!filename) return null;

  try {
    const filePath = path.join(__dirname, '../data/roadmaps', filename);
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(rawData);
    }
  } catch (error) {
    console.error(`Error loading roadmap for ${careerGoal}:`, error);
  }
  return null;
};

// Helper to calculate progress dynamically based on matching user skills to roadmap topics
const calculateProgress = (userSkills, roadmap) => {
  if (!roadmap || !roadmap.semesters || !userSkills || userSkills.length === 0) {
    return { percent: 0, completedCount: 0, totalCount: 0 };
  }

  let totalTopicsCount = 0;
  let completedTopicsCount = 0;
  const userSkillsLower = userSkills.map(skill => skill.toLowerCase().trim());

  roadmap.semesters.forEach(sem => {
    sem.topics.forEach(topic => {
      totalTopicsCount++;
      const topicNameLower = topic.name.toLowerCase();
      const topicDescLower = topic.description.toLowerCase();

      // Check if any of user's skills are mentioned in the topic's name or description
      const hasSkill = userSkillsLower.some(skill =>
        topicNameLower.includes(skill) ||
        topicDescLower.includes(skill) ||
        skill.includes(topicNameLower)
      );

      if (hasSkill) {
        completedTopicsCount++;
        // Add a temporary flag to display this topic as "completed" in the view
        topic.isCompleted = true;
      } else {
        topic.isCompleted = false;
      }
    });
  });

  const percent = totalTopicsCount > 0
    ? Math.round((completedTopicsCount / totalTopicsCount) * 100)
    : 0;

  return {
    percent: Math.min(percent, 100),
    completedCount: completedTopicsCount,
    totalCount: totalTopicsCount
  };
};

exports.getDashboard = async (req, res) => {
  try {
    // req.user is already populated by the ensureProfileComplete middleware
    const user = req.user;

    // Load the matching roadmap
    const roadmap = getRoadmapData(user.profile.careerGoal);

    // Calculate progress
    const progress = calculateProgress(user.profile.skills, roadmap);

    const success = req.session.success;
    delete req.session.success;

    res.render('dashboard', {
      user,
      roadmap,
      progress,
      success,
      title: 'Dashboard - CampusCompass'
    });
  } catch (error) {
    console.error('Dashboard Controller Error:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getSocial = async (req, res) => {
  try {
    const user = req.user;

    // Fetch all users with completed profiles
    const students = await User.findAll({
      where: {
        isProfileComplete: true
      }
    });

    // Add mock social stats to each student to display in the UI
    const studentsWithStats = students.map(studentInstance => {
      const student = studentInstance.toJSON();
      // Create seed from username length or ID to keep values stable per render
      const seedVal = student._id ? (student._id.charCodeAt(student._id.length - 1) || 42) : 42;

      const githubRepos = student.profile.githubUsername
        ? (seedVal % 40) + 12
        : 0;
      const githubStars = student.profile.githubUsername
        ? Math.round((seedVal * 1.5) % 150)
        : 0;

      const leetcodeSolved = student.profile.leetcodeUsername
        ? (seedVal * 4) % 400 + 45
        : 0;
      const leetcodeRank = student.profile.leetcodeUsername
        ? Math.round(150000 + (seedVal * 2432) % 350000)
        : 0;

      return {
        ...student,
        socialStats: {
          githubRepos,
          githubStars,
          leetcodeSolved,
          leetcodeRank
        }
      };
    });

    const success = req.session.success;
    const error = req.session.error;
    delete req.session.success;
    delete req.session.error;

    res.render('social', {
      user,
      students: studentsWithStats,
      success,
      error,
      title: 'Community Connect - CampusCompass'
    });
  } catch (error) {
    console.error('Social Controller Error:', error);
    res.status(500).send('Internal Server Error');
  }
};
