const { ErrorResponse } = require('./error');

// Simple in-memory store for rate limiting
const requestStore = new Map();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestStore.entries()) {
    if (now > data.resetTime) {
      requestStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Rate limiting middleware using in-memory storage
 * @param {Object} options Rate limiting options
 * @param {number} options.windowMs Time window in milliseconds
 * @param {number} options.max Maximum number of requests within the window
 */
exports.rateLimit = ({
  windowMs = 15 * 60 * 1000, // 15 minutes
  max = 100 // 100 requests per window
} = {}) => {
  return (req, res, next) => {
    const key = req.user ? req.user.id : req.ip;
    const now = Date.now();

    if (!requestStore.has(key)) {
      requestStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      res.setHeader('X-RateLimit-Reset', now + windowMs);

      return next();
    }

    const data = requestStore.get(key);

    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      res.setHeader('X-RateLimit-Reset', data.resetTime);

      return next();
    }

    if (data.count >= max) {
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', data.resetTime);
      res.setHeader('Retry-After', Math.ceil((data.resetTime - now) / 1000));

      return next(new ErrorResponse('Too many requests', 429));
    }

    data.count++;
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', max - data.count);
    res.setHeader('X-RateLimit-Reset', data.resetTime);

    next();
  };
};

/**
 * Stricter rate limiting for sensitive endpoints
 */
exports.strictRateLimit = exports.rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5
});

/**
 * More lenient rate limiting for public endpoints
 */
exports.publicRateLimit = exports.rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
}); 