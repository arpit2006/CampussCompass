const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.SQLITE_DATABASE_PATH = path.join(os.tmpdir(), `campuscompass-google-test-${process.pid}.sqlite`);

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

test('Google Auth rejects requests missing token credential', async () => {
  const loginPage = await request('/login');
  const loginHtml = await loginPage.text();
  const csrfToken = extractCsrfToken(loginHtml);
  const cookie = extractSessionCookie(loginPage);

  const response = await request('/auth/google', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      cookie
    },
    body: new URLSearchParams({
      _csrf: csrfToken
    })
  });

  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/login');
});

test('Google Auth authenticates verified email and creates new user redirecting to profile setup', async () => {
  const loginPage = await request('/login');
  const loginHtml = await loginPage.text();
  const csrfToken = extractCsrfToken(loginHtml);
  const cookie = extractSessionCookie(loginPage);

  const testEmail = 'verified.student@gmail.com';
  const mockPayload = {
    email: testEmail,
    name: 'Verified Student',
    email_verified: true
  };
  const token = Buffer.from(JSON.stringify(mockPayload)).toString('base64');

  const response = await request('/auth/google', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      cookie
    },
    body: new URLSearchParams({
      _csrf: csrfToken,
      credential: token
    })
  });

  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/profile/setup');

  // Verify user was persisted in database
  const user = await User.findOne({ email: testEmail });
  assert.ok(user, 'User should be created in database');
  assert.equal(user.email, testEmail);
  assert.equal(user.profile.fullName, 'Verified Student');
});

test('Google Auth rejects token if email_verified is false', async () => {
  const loginPage = await request('/login');
  const loginHtml = await loginPage.text();
  const csrfToken = extractCsrfToken(loginHtml);
  const cookie = extractSessionCookie(loginPage);

  const testEmail = 'unverified.user@gmail.com';
  const mockPayload = {
    email: testEmail,
    name: 'Unverified User',
    email_verified: false
  };
  const token = Buffer.from(JSON.stringify(mockPayload)).toString('base64');

  const response = await request('/auth/google', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      cookie
    },
    body: new URLSearchParams({
      _csrf: csrfToken,
      credential: token
    })
  });

  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/login');

  // Ensure user was not created
  const user = await User.findOne({ email: testEmail });
  assert.equal(user, null, 'Unverified user should not be created');
});
