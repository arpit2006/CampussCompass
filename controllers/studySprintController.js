const studySprintService = require('../services/studySprintService');

exports.getPlanner = async (req, res) => {
  try {
    const user = req.user;
    const todayStr = new Date().toISOString().split('T')[0];

    let studySprint = user.profile.studySprint;

    // If studySprint hasn't been generated yet, auto-initialize it
    if (!studySprint || !studySprint.schedule || studySprint.schedule.length === 0) {
      const generated = studySprintService.generateSchedule({
        careerGoal: user.profile.careerGoal || 'Web Developer',
        dailyStudyHours: user.profile.dailyStudyHours || 2,
        startDate: new Date()
      });

      studySprint = {
        careerGoal: user.profile.careerGoal || 'Web Developer',
        dailyStudyHours: user.profile.dailyStudyHours || 2,
        schedule: generated.schedule,
        totalTasks: generated.totalTasks,
        completedTasks: 0,
        progressPercent: 0,
        streakCount: 0,
        maxStreak: 0,
        streakHistory: [],
        isPaused: false,
        pausedUntil: null,
        lastActiveDate: null
      };

      // Persist generated sprint to profile
      const updatedProfile = {
        ...user.profile,
        studySprint
      };
      user.profile = updatedProfile;
      await user.save();
    }

    const schedule = studySprint.schedule || [];

    const augmentTaskWithGCal = (t) => ({
      ...t,
      googleCalendarUrl: studySprintService.generateGoogleCalendarUrlForTask(t)
    });

    const todayTasks = schedule.filter(t => t.dateStr === todayStr).map(augmentTaskWithGCal);
    const upcomingTasks = schedule.filter(t => t.dateStr > todayStr).slice(0, 10).map(augmentTaskWithGCal);
    const pastTasks = schedule.filter(t => t.dateStr < todayStr && !t.completed).slice(0, 5).map(augmentTaskWithGCal);

    const success = req.session.success;
    const error = req.session.error;
    delete req.session.success;
    delete req.session.error;

    const recentStreakRecord = studySprintService.getRecentStreakRecord(studySprint, 28);

    res.render('studysprint', {
      title: 'StudySprint Planner - CampusCompass',
      user,
      sprint: studySprint,
      todayTasks,
      upcomingTasks,
      pastTasks,
      todayStr,
      recentStreakRecord,
      success,
      error
    });
  } catch (error) {
    console.error('StudySprint Controller Error:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.setupSprint = async (req, res) => {
  try {
    const user = req.user;
    const { dailyStudyHours } = req.body;

    const hours = parseInt(dailyStudyHours, 10) || user.profile.dailyStudyHours || 2;

    const generated = studySprintService.generateSchedule({
      careerGoal: user.profile.careerGoal || 'Web Developer',
      dailyStudyHours: hours,
      startDate: new Date()
    });

    const studySprint = {
      careerGoal: user.profile.careerGoal || 'Web Developer',
      dailyStudyHours: hours,
      schedule: generated.schedule,
      totalTasks: generated.totalTasks,
      completedTasks: 0,
      progressPercent: 0,
      streakCount: user.profile.studySprint ? (user.profile.studySprint.streakCount || 0) : 0,
      maxStreak: user.profile.studySprint ? (user.profile.studySprint.maxStreak || user.profile.studySprint.streakCount || 0) : 0,
      streakHistory: user.profile.studySprint ? (user.profile.studySprint.streakHistory || []) : [],
      isPaused: false,
      pausedUntil: null,
      lastActiveDate: user.profile.studySprint ? user.profile.studySprint.lastActiveDate : null
    };

    user.profile = {
      ...user.profile,
      dailyStudyHours: hours,
      studySprint
    };
    await user.save();

    req.session.success = 'StudySprint schedule regenerated successfully!';
    res.redirect('/studysprint');
  } catch (error) {
    console.error('Setup StudySprint Error:', error);
    req.session.error = 'Failed to update StudySprint schedule.';
    res.redirect('/studysprint');
  }
};

exports.toggleTask = async (req, res) => {
  try {
    const user = req.user;
    const { taskId, completed } = req.body;

    if (!taskId) {
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(400).json({ error: 'Task ID is required' });
      }
      req.session.error = 'Task ID is required';
      return res.redirect('/studysprint');
    }

    const isCompleted = completed === true || completed === 'true' || completed === 'on';

    const currentSprint = user.profile.studySprint || {};
    const updatedSprint = studySprintService.updateTaskStatus(currentSprint, taskId, isCompleted);

    user.profile = {
      ...user.profile,
      studySprint: updatedSprint
    };
    await user.save();

    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.json({
        success: true,
        sprint: updatedSprint
      });
    }

    req.session.success = isCompleted ? 'Task marked complete! Keep going! 🎉' : 'Task updated.';
    res.redirect('/studysprint');
  } catch (error) {
    console.error('Toggle Task Error:', error);
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(500).json({ error: 'Failed to update task' });
    }
    req.session.error = 'Failed to update task status.';
    res.redirect('/studysprint');
  }
};

exports.pauseSprint = async (req, res) => {
  try {
    const user = req.user;
    const pauseDays = parseInt(req.body.pauseDays, 10) || 7;

    const currentSprint = user.profile.studySprint || {};
    const updatedSprint = studySprintService.shiftSprintForExams(currentSprint, pauseDays);

    user.profile = {
      ...user.profile,
      studySprint: updatedSprint
    };
    await user.save();

    req.session.success = `Exam mode activated! Your study schedule has been paused for ${pauseDays} days. 📚`;
    res.redirect('/studysprint');
  } catch (error) {
    console.error('Pause Sprint Error:', error);
    req.session.error = 'Failed to pause study schedule.';
    res.redirect('/studysprint');
  }
};

exports.resumeSprint = async (req, res) => {
  try {
    const user = req.user;
    const currentSprint = user.profile.studySprint || {};
    const updatedSprint = studySprintService.resumeSprint(currentSprint);

    user.profile = {
      ...user.profile,
      studySprint: updatedSprint
    };
    await user.save();

    req.session.success = 'Welcome back! StudySprint schedule resumed. 🔥';
    res.redirect('/studysprint');
  } catch (error) {
    console.error('Resume Sprint Error:', error);
    req.session.error = 'Failed to resume study schedule.';
    res.redirect('/studysprint');
  }
};

exports.exportCalendar = async (req, res) => {
  try {
    const user = req.user;
    const sprintData = user.profile.studySprint;

    const icsContent = studySprintService.generateICalendar(sprintData, user.profile.fullName || 'Student');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="studysprint-schedule.ics"');
    res.send(icsContent);
  } catch (error) {
    console.error('Export Calendar Error:', error);
    res.status(500).send('Failed to export calendar');
  }
};
