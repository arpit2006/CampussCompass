/**
 * Security & API Lag Protection Middleware for CampusCompass
 * Provides rate limiting, request latency monitoring, and essential security headers.
 */

// In-memory store for IP rate limiting
const requestCounts = new Map();

// Periodic cleanup of expired rate limit entries every 5 minutes
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000);
if (cleanupTimer && cleanupTimer.unref) {
  cleanupTimer.unref();
}

/**
 * Express Rate Limiting Middleware
 * Prevents API spamming, brute-force attacks, and server lag.
 */
function apiRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes window
  const maxRequests = options.maxRequests || 100;       // Max requests per window

  return (req, res, next) => {
    // Exclude static assets from rate limiting
    if (req.path.startsWith('/css') || req.path.startsWith('/js') || req.path.startsWith('/images') || req.path.startsWith('/favicon')) {
      return next();
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let clientData = requestCounts.get(ip);

    if (!clientData || now > clientData.resetTime) {
      clientData = {
        count: 1,
        resetTime: now + windowMs
      };
      requestCounts.set(ip, clientData);
    } else {
      clientData.count += 1;
    }

    // Set rate limit response headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - clientData.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(clientData.resetTime / 1000));

    if (clientData.count > maxRequests) {
      console.warn(`[SECURITY WARNING] Rate limit exceeded for IP: ${ip} on path: ${req.path}`);

      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(429).json({
          error: 'Security Rate Limit Exceeded',
          message: 'Too many requests from this IP. Please wait a moment before trying again.'
        });
      }

      req.session.error = 'Security rate limit reached. Please wait a few minutes before trying again.';
      return res.status(429).redirect(req.headers.referer || '/dashboard');
    }

    next();
  };
}

/**
 * Latency & Lag Watchdog Middleware
 * Measures server processing time and sets performance response headers.
 */
function latencyWatchdog(req, res, next) {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    // Log warning if API route processing exceeds 2000ms
    if (duration > 2000) {
      console.warn(`[LAG WARNING] High response latency detected: ${duration}ms for ${req.method} ${req.originalUrl}`);
    }
  });

  next();
}

/**
 * HTTP Security Headers Middleware
 * Mitigates XSS, MIME-sniffing, and clickjacking risks.
 */
function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
}

module.exports = {
  apiRateLimiter,
  latencyWatchdog,
  securityHeaders
};
