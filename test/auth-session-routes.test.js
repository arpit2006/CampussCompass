const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.SQLITE_DATABASE_PATH = path.join(os.tmpdir(), `campuscompass-test-${process.pid}.sqlite`);

const app = require('../app');
const { sequelize } = require('../config/db');
const User = require('../models/User');

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.beforeEach(async () => {
  await sequelize.sync({ force: true });
});

test.after(async () => {
  await sequelize.close();

  if (server) {
    await new Promise(resolve => server.close(resolve));
  }

  if (fs.existsSync(process.env.SQLITE_DATABASE_PATH)) {
    fs.unlinkSync(process.env.SQLITE_DATABASE_PATH);
  }
});

const extractCsrfToken = html => {
  const match = html.match(/name="_csrf" value="([^"]+)"/);
  assert.ok(match, 'Expected response HTML to include a CSRF token');
  return match[1];
};

const extractSessionCookie = response => {
  const setCookie = response.headers.get('set-cookie');
  assert.ok(setCookie, 'Expected response to set a session cookie');
  return setCookie.split(';')[0];
};

const request = async (pathName, options = {}) => {
  return fetch(`${baseUrl}${pathName}`, {
    redirect: 'manual',
    ...options
  });
};

const createUser = async ({ isProfileComplete }) => {
  const idSuffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return User.create({
    _id: `user-${idSuffix}`,
    email: `student-${idSuffix}@example.com`,
    password: 'password123',
    isProfileComplete,
    profile: isProfileComplete
      ? {
        fullName: 'Test Student',
        collegeName: 'CampusCompass College',
        branch: 'Computer Science',
        currentYear: '3rd Year',
        cgpa: 8.5,
        careerGoal: 'Software Engineer',
        skills: ['JavaScript'],
        interests: ['Backend'],
        dailyStudyHours: 3,
        githubUsername: '',
        leetcodeUsername: ''
      }
      : {}
  });
};

const loginAs = async user => {
  const loginPage = await request('/login');
  const loginHtml = await loginPage.text();
  const csrfToken = extractCsrfToken(loginHtml);
  const preLoginCookie = extractSessionCookie(loginPage);

  const response = await request('/login', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      cookie: preLoginCookie
    },
    body: new URLSearchParams({
      _csrf: csrfToken,
      email: user.email,
      password: 'password123'
    })
  });

  assert.equal(response.status, 302);
  const postLoginCookie = response.headers.get('set-cookie')?.split(';')[0] ?? preLoginCookie;

  return {
    cookie: postLoginCookie,
    location: response.headers.get('location')
  };
};

test('logged-out users can access guest-only auth pages', async () => {
  const loginResponse = await request('/login');
  assert.equal(loginResponse.status, 200);
  assert.match(await loginResponse.text(), /Welcome Back/);

  const registerResponse = await request('/register');
  assert.equal(registerResponse.status, 200);
  assert.match(await registerResponse.text(), /Create Account/);
});

test('logged-in users are redirected away from guest-only auth pages', async () => {
  const user = await createUser({ isProfileComplete: true });
  const session = await loginAs(user);

  const loginResponse = await request('/login', {
    headers: { cookie: session.cookie }
  });
  assert.equal(loginResponse.status, 302);
  assert.equal(loginResponse.headers.get('location'), '/dashboard');

  const registerResponse = await request('/register', {
    headers: { cookie: session.cookie }
  });
  assert.equal(registerResponse.status, 302);
  assert.equal(registerResponse.headers.get('location'), '/dashboard');
});

test('logged-out users are redirected to login from protected routes', async () => {
  for (const route of ['/dashboard', '/profile', '/social', '/logout']) {
    const response = await request(route);

    assert.equal(response.status, 302, `${route} should redirect`);
    assert.equal(response.headers.get('location'), '/login');
  }
});

test('users with incomplete profiles are redirected to profile setup', async () => {
  const user = await createUser({ isProfileComplete: false });
  const session = await loginAs(user);

  assert.equal(session.location, '/profile/setup');

  for (const route of ['/dashboard', '/profile', '/social']) {
    const response = await request(route, {
      headers: { cookie: session.cookie }
    });

    assert.equal(response.status, 302, `${route} should redirect`);
    assert.equal(response.headers.get('location'), '/profile/setup');
  }
});

test('users with incomplete profiles can log out', async () => {
  const user = await createUser({ isProfileComplete: false });
  const session = await loginAs(user);

  const response = await request('/logout', {
    headers: { cookie: session.cookie }
  });

  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/');
});

test('users with complete profiles can access protected routes', async () => {
  const user = await createUser({ isProfileComplete: true });
  const session = await loginAs(user);

  assert.equal(session.location, '/dashboard');

  for (const route of ['/dashboard', '/profile', '/social']) {
    const response = await request(route, {
      headers: { cookie: session.cookie }
    });

    assert.equal(response.status, 200, `${route} should be accessible`);
  }
});
