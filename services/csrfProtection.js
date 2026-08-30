const crypto = require('crypto');

const CSRF_FAILURE_MESSAGE = 'Forbidden: CSRF token validation failed.';
const CSRF_TOKEN_BYTES = 32;
const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

const generateCsrfToken = () => crypto.randomBytes(CSRF_TOKEN_BYTES).toString('hex');

const getRequestCsrfToken = (req) => (
  (req.body && req.body._csrf) ||
  (req.headers && req.headers['x-csrf-token']) ||
  (req.query && req.query._csrf)
);

const hashToken = (token) => crypto
  .createHash('sha256')
  .update(token)
  .digest();

const safelyCompareTokens = (requestToken, sessionToken) => {
  if (
    typeof requestToken !== 'string' ||
    !requestToken ||
    typeof sessionToken !== 'string' ||
    !sessionToken
  ) {
    return false;
  }

  return crypto.timingSafeEqual(hashToken(requestToken), hashToken(sessionToken));
};

const csrfProtection = (req, res, next) => {
  if (!req.session) {
    return res.status(500).send('Session middleware is required before CSRF protection.');
  }

  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }

  res.locals.csrfToken = req.session.csrfToken;

  if (STATE_CHANGING_METHODS.has(req.method)) {
    const requestToken = getRequestCsrfToken(req);
    if (!safelyCompareTokens(requestToken, req.session.csrfToken)) {
      return res.status(403).send(CSRF_FAILURE_MESSAGE);
    }
  }

  return next();
};

module.exports = {
  CSRF_FAILURE_MESSAGE,
  csrfProtection,
  generateCsrfToken,
  getRequestCsrfToken,
  safelyCompareTokens
};
