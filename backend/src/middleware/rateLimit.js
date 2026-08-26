const { rateLimit, ipkeyGenerator } = require("express-rate-limit");

const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 5, // max 5 req per window

  // Send rate-limit info in standard response headers
  standardHeaders: "draft-7",
  legacyHeaders: false,

  // Use user ID when logged in, otherwise use IP address
  keyGenerator: (req, res) =>
    req.user?._id?.toString() || ipkeyGenerator(req, res),

  // Message returned when the limit is exceeded
  message: {
    error: { message: "Too many analyses - please wait a minute and retry." },
  },
});

// Limit authentication attempts to 30 every 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30, // max 30 requests per window

  // Send rate-limit info in standard response headers
  standardHeaders: "draft-7",
  legacyHeaders: false,

  // Use IP address to identify the client
  keyGenerator: (req, res),

  // Message returned when the limit is exceeded
  message: {
    error: "Too many auth attempts - please wait and retry.",
  },
});

module.exports = { analyzeLimiter, authLimiter };
