const assert = require('assert');
const test = require('node:test');

const {
  CSRF_FAILURE_MESSAGE,
  csrfProtection,
  generateCsrfToken,
  getRequestCsrfToken,
  safelyCompareTokens
} = require('../services/csrfProtection');

const createResponse = () => ({
  body: null,
  locals: {},
  statusCode: 200,
  status(code) {
    this.statusCode = code;
    return this;
  },
  send(body) {
    this.body = body;
    return this;
  }
});

const runCsrfMiddleware = (requestOverrides = {}) => {
  const req = {
    body: {},
    headers: {},
    method: 'GET',
    query: {},
    session: {},
    ...requestOverrides
  };
  const res = createResponse();
  let nextCalled = false;

  csrfProtection(req, res, () => {
    nextCalled = true;
  });

  return { nextCalled, req, res };
};

test('generates cryptographically strong CSRF tokens', () => {
  const firstToken = generateCsrfToken();
  const secondToken = generateCsrfToken();

  assert.match(firstToken, /^[a-f0-9]{64}$/);
  assert.match(secondToken, /^[a-f0-9]{64}$/);
  assert.notStrictEqual(firstToken, secondToken);
});

test('exposes an existing session token to templates', () => {
  const sessionToken = generateCsrfToken();
  const { nextCalled, res } = runCsrfMiddleware({
    session: { csrfToken: sessionToken }
  });

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(res.locals.csrfToken, sessionToken);
});

test('missing token returns 403 for POST requests', () => {
  const { nextCalled, res } = runCsrfMiddleware({
    method: 'POST',
    session: { csrfToken: generateCsrfToken() }
  });

  assert.strictEqual(nextCalled, false);
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(res.body, CSRF_FAILURE_MESSAGE);
});

test('invalid token returns 403 for POST requests', () => {
  const { nextCalled, res } = runCsrfMiddleware({
    body: { _csrf: 'invalid-token' },
    method: 'POST',
    session: { csrfToken: generateCsrfToken() }
  });

  assert.strictEqual(nextCalled, false);
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(res.body, CSRF_FAILURE_MESSAGE);
});

test('valid body token allows POST requests', () => {
  const sessionToken = generateCsrfToken();
  const { nextCalled, res } = runCsrfMiddleware({
    body: { _csrf: sessionToken },
    method: 'POST',
    session: { csrfToken: sessionToken }
  });

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(res.statusCode, 200);
});

test('valid header and query tokens remain supported', () => {
  const sessionToken = generateCsrfToken();

  assert.strictEqual(
    runCsrfMiddleware({
      headers: { 'x-csrf-token': sessionToken },
      method: 'POST',
      session: { csrfToken: sessionToken }
    }).nextCalled,
    true
  );

  assert.strictEqual(
    runCsrfMiddleware({
      method: 'POST',
      query: { _csrf: sessionToken },
      session: { csrfToken: sessionToken }
    }).nextCalled,
    true
  );
});

test('token helper reads body before header before query', () => {
  const token = getRequestCsrfToken({
    body: { _csrf: 'body-token' },
    headers: { 'x-csrf-token': 'header-token' },
    query: { _csrf: 'query-token' }
  });

  assert.strictEqual(token, 'body-token');
});

test('safe comparison rejects mismatches and accepts exact matches', () => {
  const token = generateCsrfToken();

  assert.strictEqual(safelyCompareTokens(token, token), true);
  assert.strictEqual(safelyCompareTokens('short', token), false);
  assert.strictEqual(safelyCompareTokens(null, token), false);
});
