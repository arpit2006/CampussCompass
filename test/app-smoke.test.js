const assert = require('assert');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const test = require('node:test');

process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'campus-compass-smoke-test-secret';

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'campuscompass-smoke-'));
process.env.SQLITE_DATABASE_PATH = path.join(tempDir, 'smoke.sqlite');

const app = require('../app');
const { sequelize } = require('../config/db');

const request = (baseUrl, pathname) => new Promise((resolve, reject) => {
  const req = http.get(`${baseUrl}${pathname}`, (res) => {
    res.resume();
    res.on('end', () => {
      resolve(res.statusCode);
    });
  });

  req.on('error', reject);
});

test('Express app starts and key public routes respond', async (t) => {
  const server = http.createServer(app);

  t.after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    await sequelize.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  const routes = ['/', '/login', '/register', '/privacy', '/terms', '/playlists'];

  for (const route of routes) {
    const statusCode = await request(baseUrl, route);
    assert.strictEqual(statusCode, 200, `${route} should respond with 200`);
  }
});
