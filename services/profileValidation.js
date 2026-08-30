const SUPPORTED_CAREER_GOALS = [
  'Software Engineer',
  'Web Developer',
  'AI Engineer',
  'Cyber Security',
  'Cloud Engineer',
  'Data Scientist'
];

const SUPPORTED_CURRENT_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year'
];

const TEXT_LIMITS = {
  fullName: 100,
  collegeName: 150,
  branch: 100
};

const normalizeText = value => String(value || '')
  .replace(/<[^>]*>/g, '')
  .trim()
  .replace(/\s+/g, ' ');

const parseOptionalNumber = value => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const parseOptionalWholeNumber = value => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const normalizedValue = String(value).trim();
  if (!/^\d+$/.test(normalizedValue)) {
    return Number.NaN;
  }

  return Number(normalizedValue);
};

const normalizeList = value => {
  if (!value) return [];

  const seen = new Set();
  const normalizedItems = [];
  const rawItems = Array.isArray(value)
    ? value
    : String(value).split(',');

  rawItems
    .map(item => normalizeText(item))
    .filter(Boolean)
    .forEach(item => {
      const key = item.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        normalizedItems.push(item);
      }
    });

  return normalizedItems;
};

const validateRequiredText = (profile, field, label, errors) => {
  if (!profile[field]) {
    errors.push(`${label} is required.`);
    return;
  }

  if (profile[field].length > TEXT_LIMITS[field]) {
    errors.push(`${label} must be ${TEXT_LIMITS[field]} characters or less.`);
  }
};

const validateProfileInput = input => {
  const errors = [];

  const profile = {
    fullName: normalizeText(input.fullName),
    collegeName: normalizeText(input.collegeName),
    branch: normalizeText(input.branch),
    currentYear: normalizeText(input.currentYear),
    careerGoal: normalizeText(input.careerGoal),
    cgpa: parseOptionalNumber(input.cgpa),
    dailyStudyHours: parseOptionalWholeNumber(input.dailyStudyHours),
    skills: normalizeList(input.skills),
    interests: normalizeList(input.interests)
  };

  validateRequiredText(profile, 'fullName', 'Full Name', errors);
  validateRequiredText(profile, 'collegeName', 'College Name', errors);
  validateRequiredText(profile, 'branch', 'Branch/Major', errors);

  if (!SUPPORTED_CURRENT_YEARS.includes(profile.currentYear)) {
    errors.push('Please select a valid current year.');
  }

  if (!SUPPORTED_CAREER_GOALS.includes(profile.careerGoal)) {
    errors.push('Please select a supported career goal.');
  }

  if (Number.isNaN(profile.cgpa) || (profile.cgpa !== null && (profile.cgpa < 0 || profile.cgpa > 10))) {
    errors.push('CGPA must be a number between 0 and 10.');
  }

  if (
    Number.isNaN(profile.dailyStudyHours) ||
    (
      profile.dailyStudyHours !== null &&
      (profile.dailyStudyHours < 0 || profile.dailyStudyHours > 24)
    )
  ) {
    errors.push('Daily study hours must be a whole number between 0 and 24.');
  }

  if (profile.skills.length > 25) {
    errors.push('Please enter 25 or fewer skills.');
  }

  if (profile.interests.length > 25) {
    errors.push('Please enter 25 or fewer interests.');
  }

  if ([...profile.skills, ...profile.interests].some(item => item.length > 50)) {
    errors.push('Each skill or interest must be 50 characters or less.');
  }

  if (profile.cgpa !== null) {
    profile.cgpa = Number(profile.cgpa.toFixed(2));
  }

  return {
    isValid: errors.length === 0,
    errors,
    profile
  };
};

module.exports = {
  SUPPORTED_CAREER_GOALS,
  SUPPORTED_CURRENT_YEARS,
  validateProfileInput
};
