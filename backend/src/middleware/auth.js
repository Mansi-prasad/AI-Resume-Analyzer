const env = require("../config/env.js");
const { verifyToken } = require("../utils/jwt.js");
const ApiError = require("../utils/ApiError.js");
const User = require("../modals/User.js");

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[env.cookieName];
    if (!token) throw ApiError.unauthorized;

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);

    if (!user) throw ApiError.unauthorized("Session no longer valid");

    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(ApiError.unauthorized("Invalid or expired session"));
    }
    next(error);
  }
}

module.exports = { requireAuth };
