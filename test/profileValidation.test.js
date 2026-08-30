const assert = require('node:assert/strict');
const test = require('node:test');
const { validateProfileInput } = require('../services/profileValidation');

const validInput = {
  fullName: '  Test   Student  ',
  collegeName: '  CampusCompass   College ',
  branch: '  Computer   Science ',
  currentYear: '3rd Year',
  cgpa: '8.567',
  careerGoal: 'Software Engineer',
  skills: ' JavaScript, node.js, javascript, Git ',
  interests: ' Backend, Open Source, backend ',
  dailyStudyHours: '4'
};

test('normalizes valid profile input before saving', () => {
  const result = validateProfileInput(validInput);

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.profile, {
    fullName: 'Test Student',
    collegeName: 'CampusCompass College',
    branch: 'Computer Science',
    currentYear: '3rd Year',
    cgpa: 8.57,
    careerGoal: 'Software Engineer',
    skills: ['JavaScript', 'node.js', 'Git'],
    interests: ['Backend', 'Open Source'],
    dailyStudyHours: 4
  });
});

test('normalizes skills and interests submitted as arrays', () => {
  const result = validateProfileInput({
    ...validInput,
    skills: [' JavaScript ', 'Node.js, Git', 'javascript'],
    interests: [' Backend ', 'Open Source, backend']
  });

  assert.equal(result.isValid, true);
  assert.deepEqual(result.profile.skills, ['JavaScript', 'Node.js, Git']);
  assert.deepEqual(result.profile.interests, ['Backend', 'Open Source, backend']);
});

test('rejects invalid profile numbers and unsupported dropdown values', () => {
  const result = validateProfileInput({
    ...validInput,
    currentYear: '5th Year',
    cgpa: '11',
    careerGoal: 'Astronaut',
    dailyStudyHours: '-1'
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.includes('Please select a valid current year.'));
  assert.ok(result.errors.includes('Please select a supported career goal.'));
  assert.ok(result.errors.includes('CGPA must be a number between 0 and 10.'));
  assert.ok(result.errors.includes('Daily study hours must be a whole number between 0 and 24.'));
});

test('rejects text fields that exceed configured length limits', () => {
  const result = validateProfileInput({
    ...validInput,
    fullName: 'A'.repeat(101)
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.includes('Full Name must be 100 characters or less.'));
});

test('accepts boundary values for optional numbers and list item lengths', () => {
  const exactLengthSkill = 'A'.repeat(50);
  const result = validateProfileInput({
    ...validInput,
    cgpa: '0',
    dailyStudyHours: '0',
    skills: exactLengthSkill
  });

  assert.equal(result.isValid, true);
  assert.equal(result.profile.cgpa, 0);
  assert.equal(result.profile.dailyStudyHours, 0);
  assert.deepEqual(result.profile.skills, [exactLengthSkill]);
});

test('strips HTML tags from text and list fields', () => {
  const result = validateProfileInput({
    ...validInput,
    fullName: '<script>alert(1)</script> Test Student',
    collegeName: '<b>CampusCompass</b> College',
    skills: '<img src=x onerror=alert(1)> JavaScript, <b>Git</b>'
  });

  assert.equal(result.isValid, true);
  assert.equal(result.profile.fullName, 'alert(1) Test Student');
  assert.equal(result.profile.collegeName, 'CampusCompass College');
  assert.deepEqual(result.profile.skills, ['JavaScript', 'Git']);
});

test('rejects missing required text after trimming whitespace', () => {
  const result = validateProfileInput({
    ...validInput,
    fullName: '   ',
    collegeName: '',
    branch: '\t'
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.includes('Full Name is required.'));
  assert.ok(result.errors.includes('College Name is required.'));
  assert.ok(result.errors.includes('Branch/Major is required.'));
});

test('keeps optional numeric fields as null when blank', () => {
  const result = validateProfileInput({
    ...validInput,
    cgpa: '',
    dailyStudyHours: ''
  });

  assert.equal(result.isValid, true);
  assert.equal(result.profile.cgpa, null);
  assert.equal(result.profile.dailyStudyHours, null);
});
