const User = require('../models/User');
const { getRoadmapDataAsync } = require('../services/contentDataLoader');

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

    // Load the matching roadmap asynchronously
    const roadmap = await getRoadmapDataAsync(user.profile.careerGoal);

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

    const currentUserId = user._id;
    const myFriends = user.profile.friends || [];
    const myRequests = user.profile.friendRequests || [];

    // Find profiles of pending incoming friend requests
    const pendingRequestUsers = students
      .filter(s => myRequests.includes(s._id))
      .map(s => s.toJSON());

    // Add mock social stats and friend status to each student
    const studentsWithStats = students.map(studentInstance => {
      const student = studentInstance.toJSON();
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

      let friendStatus = 'none';
      if (student._id === currentUserId) {
        friendStatus = 'self';
      } else if (myFriends.includes(student._id)) {
        friendStatus = 'friends';
      } else if (myRequests.includes(student._id)) {
        friendStatus = 'incoming_request';
      } else if ((student.profile.friendRequests || []).includes(currentUserId)) {
        friendStatus = 'sent_request';
      }

      return {
        ...student,
        friendStatus,
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
    const info = req.session.info;
    delete req.session.success;
    delete req.session.error;
    delete req.session.info;

    res.render('social', {
      user,
      students: studentsWithStats,
      pendingRequests: pendingRequestUsers,
      success,
      error,
      info,
      title: 'Community Connect - CampusCompass'
    });
  } catch (error) {
    console.error('Social Controller Error:', error);
    res.status(500).send('Internal Server Error');
  }
};
