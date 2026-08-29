const assert = require('assert');
const test = require('node:test');

const {
  generateSchedule,
  updateTaskStatus,
  shiftSprintForExams,
  resumeSprint,
  getRecentStreakRecord,
  buildGoogleCalendarUrl,
  generateGoogleCalendarUrlForTask
} = require('../services/studySprintService');

test('generates study schedule with 45-min micro-tasks for Web Developer track', () => {
  const result = generateSchedule({
    careerGoal: 'Web Developer',
    dailyStudyHours: 2,
    startDate: new Date('2026-09-01T09:00:00Z')
  });

  assert.ok(Array.isArray(result.schedule));
  assert.ok(result.schedule.length > 0);
  assert.strictEqual(result.sessionsPerDay, 2);

  const firstTask = result.schedule[0];
  assert.strictEqual(firstTask.durationMinutes, 45);
  assert.strictEqual(firstTask.completed, false);
  assert.ok(firstTask.dateStr);
  assert.ok(firstTask.topicName);
});

test('updates task status and increments streak', () => {
  const initial = generateSchedule({
    careerGoal: 'Web Developer',
    dailyStudyHours: 2
  });

  const sprintData = {
    schedule: initial.schedule,
    completedTasks: 0,
    totalTasks: initial.schedule.length,
    progressPercent: 0,
    streakCount: 0,
    lastActiveDate: null
  };

  const taskId = initial.schedule[0].id;
  const updated = updateTaskStatus(sprintData, taskId, true);

  assert.strictEqual(updated.completedTasks, 1);
  assert.ok(updated.progressPercent > 0);
  assert.strictEqual(updated.streakCount, 1);
  assert.strictEqual(updated.maxStreak, 1);
  assert.ok(Array.isArray(updated.streakHistory));
  assert.strictEqual(updated.streakHistory.length, 1);
  assert.ok(updated.lastActiveDate);
});

test('records maxStreak and past 7 days daily tracking streak record', () => {
  const initial = generateSchedule({
    careerGoal: 'Web Developer',
    dailyStudyHours: 2
  });

  const sprintData = {
    schedule: initial.schedule,
    completedTasks: 0,
    totalTasks: initial.schedule.length,
    progressPercent: 0,
    streakCount: 3,
    maxStreak: 3,
    streakHistory: [],
    lastActiveDate: null
  };

  const taskId = initial.schedule[0].id;
  const updated = updateTaskStatus(sprintData, taskId, true);

  assert.strictEqual(updated.maxStreak, 3);
  assert.strictEqual(updated.streakHistory.length, 1);

  const recentRecord = getRecentStreakRecord(updated, 7);
  assert.strictEqual(recentRecord.length, 7);
  const todayRecord = recentRecord.find(r => r.isToday);
  assert.ok(todayRecord);
  assert.strictEqual(todayRecord.completed, true);
});

test('shifts uncompleted future tasks when exam pause mode is activated', () => {
  const initial = generateSchedule({
    careerGoal: 'Software Engineer',
    dailyStudyHours: 2,
    startDate: new Date()
  });

  const sprintData = {
    schedule: initial.schedule,
    isPaused: false,
    pausedUntil: null
  };

  const paused = shiftSprintForExams(sprintData, 7);

  assert.strictEqual(paused.isPaused, true);
  assert.ok(paused.pausedUntil);
});

test('resumes a paused study sprint', () => {
  const pausedSprint = {
    isPaused: true,
    pausedUntil: '2026-09-10'
  };

  const resumed = resumeSprint(pausedSprint);
  assert.strictEqual(resumed.isPaused, false);
  assert.strictEqual(resumed.pausedUntil, null);
});



test('generates valid Google Calendar URL for custom events and sprint tasks', () => {
  const gcalUrl = buildGoogleCalendarUrl({
    title: 'Algorithms Exam Prep',
    details: 'Study tree algorithms',
    location: 'Library',
    startTime: '2026-09-01T10:00:00Z',
    endTime: '2026-09-01T11:00:00Z'
  });

  assert.ok(gcalUrl.includes('https://calendar.google.com/calendar/render?action=TEMPLATE'));
  assert.ok(gcalUrl.includes('text=Algorithms+Exam+Prep'));
  assert.ok(gcalUrl.includes('20260901T100000Z%2F20260901T110000Z'));

  const initial = generateSchedule({
    careerGoal: 'Web Developer',
    dailyStudyHours: 2
  });
  const firstTask = initial.schedule[0];
  const taskGCalUrl = generateGoogleCalendarUrlForTask(firstTask);

  assert.ok(taskGCalUrl.includes('https://calendar.google.com/calendar/render?action=TEMPLATE'));
  assert.ok(taskGCalUrl.includes('CampusCompass'));
  assert.ok(taskGCalUrl.includes(firstTask.topicName.split(' ')[0]));
});
