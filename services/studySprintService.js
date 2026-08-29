const { getRoadmapData } = require('./contentDataLoader');

/**
 * Generates a study schedule array based on the user's roadmap, dailyStudyHours, and target date.
 */
function generateSchedule({ careerGoal, dailyStudyHours = 2, _targetDate, startDate = new Date() }) {
  const roadmap = getRoadmapData(careerGoal);
  if (!roadmap || !roadmap.semesters) {
    return { schedule: [], totalTasks: 0, estimatedDays: 0 };
  }

  // Determine daily slots: each session is 45 mins.
  const hours = Math.max(1, Math.min(6, parseInt(dailyStudyHours, 10) || 2));
  const sessionsPerDay = Math.min(4, Math.max(1, Math.floor(hours * 60 / 45)));

  const allTasks = [];
  let topicIdCounter = 1;

  roadmap.semesters.forEach((sem, semIdx) => {
    sem.topics.forEach((topic, topicIdx) => {
      // Allocate 2 sessions (45 min each) per topic
      const sessionCount = 2;
      for (let s = 1; s <= sessionCount; s++) {
        allTasks.push({
          id: `task_${semIdx}_${topicIdx}_${s}_${topicIdCounter++}`,
          semester: sem.semester,
          topicName: topic.name,
          description: topic.description,
          sessionIndex: s,
          totalSessions: sessionCount,
          durationMinutes: 45,
          resources: topic.resources || [],
          completed: false,
          completedAt: null
        });
      }
    });
  });

  // Assign calendar dates to tasks
  const currentDate = new Date(startDate);
  currentDate.setHours(9, 0, 0, 0); // Start at 9:00 AM

  let dayTaskCount = 0;

  const scheduledTasks = allTasks.map((task) => {
    if (dayTaskCount >= sessionsPerDay) {
      dayTaskCount = 0;
      currentDate.setDate(currentDate.getDate() + 1);

      // Sunday rest day
      if (currentDate.getDay() === 0) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    const taskStartTime = new Date(currentDate);
    taskStartTime.setMinutes(taskStartTime.getMinutes() + (dayTaskCount * 60));

    const taskEndTime = new Date(taskStartTime);
    taskEndTime.setMinutes(taskEndTime.getMinutes() + 45);

    dayTaskCount++;

    return {
      ...task,
      dateStr: taskStartTime.toISOString().split('T')[0],
      startTime: taskStartTime.toISOString(),
      endTime: taskEndTime.toISOString()
    };
  });

  return {
    schedule: scheduledTasks,
    totalTasks: scheduledTasks.length,
    sessionsPerDay
  };
}

/**
 * Updates task completion status & streak metrics
 */
function updateTaskStatus(sprintData, taskId, isCompleted) {
  if (!sprintData || !Array.isArray(sprintData.schedule)) {
    return sprintData;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const updatedSchedule = sprintData.schedule.map((task) => {
    if (task.id === taskId) {
      return {
        ...task,
        completed: isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : null
      };
    }
    return task;
  });

  // Recalculate metrics
  const completedTasks = updatedSchedule.filter(t => t.completed).length;
  const totalTasks = updatedSchedule.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Streak calculation
  let streak = sprintData.streakCount || 0;
  let maxStreak = sprintData.maxStreak || sprintData.bestStreak || streak;
  let lastActiveDate = sprintData.lastActiveDate || null;
  const streakHistory = Array.isArray(sprintData.streakHistory) ? [...sprintData.streakHistory] : [];

  if (isCompleted && lastActiveDate !== todayStr) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActiveDate === yesterdayStr) {
      streak += 1;
    } else if (!lastActiveDate) {
      streak = 1;
    } else {
      streak = 1;
    }
    lastActiveDate = todayStr;
  }

  if (streak > maxStreak) {
    maxStreak = streak;
  }

  // Daily activity log in streakHistory
  const todayTasksCompleted = updatedSchedule.filter(
    t => t.completed && t.dateStr === todayStr
  ).length;

  const existingIdx = streakHistory.findIndex(entry => entry.date === todayStr);
  if (isCompleted || todayTasksCompleted > 0) {
    if (existingIdx >= 0) {
      streakHistory[existingIdx] = {
        ...streakHistory[existingIdx],
        tasksCompleted: todayTasksCompleted,
        streakCount: streak,
        lastUpdated: new Date().toISOString()
      };
    } else {
      streakHistory.push({
        date: todayStr,
        tasksCompleted: Math.max(1, todayTasksCompleted),
        streakCount: streak,
        lastUpdated: new Date().toISOString()
      });
    }
  } else if (existingIdx >= 0) {
    streakHistory[existingIdx] = {
      ...streakHistory[existingIdx],
      tasksCompleted: todayTasksCompleted,
      lastUpdated: new Date().toISOString()
    };
  }

  return {
    ...sprintData,
    schedule: updatedSchedule,
    completedTasks,
    totalTasks,
    progressPercent,
    streakCount: streak,
    maxStreak,
    streakHistory,
    lastActiveDate
  };
}

/**
 * Returns recent N days daily tracking streak record for UI display (LeetCode style grid)
 */
function getRecentStreakRecord(sprintData, daysCount = 28) {
  const history = Array.isArray(sprintData?.streakHistory) ? sprintData.streakHistory : [];
  const schedule = Array.isArray(sprintData?.schedule) ? sprintData.schedule : [];

  const result = [];
  const today = new Date();

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const historyEntry = history.find(h => h.date === dateStr);
    const scheduledCount = schedule.filter(t => t.dateStr === dateStr).length;
    const completedCount = historyEntry
      ? historyEntry.tasksCompleted
      : schedule.filter(t => t.dateStr === dateStr && t.completed).length;

    result.push({
      dateStr,
      dayName,
      monthDay,
      dayOfWeek: d.getDay(),
      isToday: i === 0,
      completed: completedCount > 0,
      tasksCompleted: completedCount,
      scheduledTasks: scheduledCount
    });
  }

  return result;
}

/**
 * Pauses sprint and shifts future uncompleted tasks forward by N days
 */
function shiftSprintForExams(sprintData, pauseDays = 7) {
  if (!sprintData || !Array.isArray(sprintData.schedule)) {
    return sprintData;
  }

  const shiftMs = pauseDays * 24 * 60 * 60 * 1000;
  const todayStr = new Date().toISOString().split('T')[0];

  const updatedSchedule = sprintData.schedule.map((task) => {
    if (!task.completed && task.dateStr >= todayStr) {
      const origStart = new Date(task.startTime);
      const origEnd = new Date(task.endTime);

      const newStart = new Date(origStart.getTime() + shiftMs);
      const newEnd = new Date(origEnd.getTime() + shiftMs);

      return {
        ...task,
        dateStr: newStart.toISOString().split('T')[0],
        startTime: newStart.toISOString(),
        endTime: newEnd.toISOString()
      };
    }
    return task;
  });

  const resumeDate = new Date();
  resumeDate.setDate(resumeDate.getDate() + pauseDays);

  return {
    ...sprintData,
    schedule: updatedSchedule,
    isPaused: true,
    pausedUntil: resumeDate.toISOString().split('T')[0]
  };
}

/**
 * Resumes a paused sprint
 */
function resumeSprint(sprintData) {
  if (!sprintData) return sprintData;
  return {
    ...sprintData,
    isPaused: false,
    pausedUntil: null
  };
}

/**
 * Generates an RFC 5545 compliant iCalendar string (.ics)
 */
function generateICalendar(sprintData, userName = 'Student') {
  const schedule = (sprintData && sprintData.schedule) ? sprintData.schedule : [];

  const formatICalDate = (isoStr) => {
    const d = new Date(isoStr);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusCompass//StudySprint 1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:StudySprint Roadmap (${userName})`,
    'X-WR-TIMEZONE:UTC'
  ];

  schedule.forEach((task) => {
    if (!task.startTime || !task.endTime) return;

    const dtStart = formatICalDate(task.startTime);
    const dtEnd = formatICalDate(task.endTime);
    const summary = `[CampusCompass] ${task.topicName} (Part ${task.sessionIndex}/${task.totalSessions})`;
    const description = `Semester: ${task.semester}\\nTopic: ${task.topicName}\\nDetails: ${task.description}\\nResources: ${(task.resources || []).join(', ')}`;

    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`UID:${task.id}@campuscompass.local`);
    icsLines.push(`DTSTAMP:${formatICalDate(new Date().toISOString())}`);
    icsLines.push(`DTSTART:${dtStart}`);
    icsLines.push(`DTEND:${dtEnd}`);
    icsLines.push(`SUMMARY:${summary}`);
    icsLines.push(`DESCRIPTION:${description}`);
    icsLines.push(`STATUS:${task.completed ? 'COMPLETED' : 'CONFIRMED'}`);
    icsLines.push('END:VEVENT');
  });

  icsLines.push('END:VCALENDAR');
  return icsLines.join('\r\n');
}

/**
 * Builds a 1-click Google Calendar Web Event creation URL
 */
function buildGoogleCalendarUrl({ title, details = '', location = 'CampusCompass App', startTime, endTime }) {
  const formatGoogleCalendarDate = (dateInput) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startStr = formatGoogleCalendarDate(startTime || new Date());
  const endStr = formatGoogleCalendarDate(endTime || new Date(Date.now() + 45 * 60 * 1000));

  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const params = new URLSearchParams({
    text: title || 'CampusCompass Study Task',
    details: details || '',
    location: location || '',
    dates: `${startStr}/${endStr}`
  });

  return `${baseUrl}&${params.toString()}`;
}

/**
 * Generates a Google Calendar URL for a specific study sprint task
 */
function generateGoogleCalendarUrlForTask(task) {
  if (!task) return '#';
  const title = `[CampusCompass] ${task.topicName || 'Study Session'} (Part ${task.sessionIndex || 1}/${task.totalSessions || 1})`;
  const details = `Semester: ${task.semester || 'N/A'}\nTopic: ${task.topicName || ''}\nDescription: ${task.description || ''}\nResources: ${(task.resources || []).join(', ')}`;

  let start = task.startTime;
  let end = task.endTime;

  if (!start) {
    const d = task.dateStr ? new Date(task.dateStr + 'T09:00:00') : new Date();
    start = d.toISOString();
    d.setMinutes(d.getMinutes() + (task.durationMinutes || 45));
    end = d.toISOString();
  }

  return buildGoogleCalendarUrl({
    title,
    details,
    location: 'CampusCompass StudySprint',
    startTime: start,
    endTime: end
  });
}

module.exports = {
  generateSchedule,
  updateTaskStatus,
  shiftSprintForExams,
  resumeSprint,
  generateICalendar,
  getRecentStreakRecord,
  buildGoogleCalendarUrl,
  generateGoogleCalendarUrlForTask
};
