const jwt = require("jsonwebtoken");
const env = require("../config/env.js");

function signToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

const cookieOptions = {
  httpOnly: true, // browser cannot access this cookie.
  secure: env.isProd,
  sameSite: env.isProd ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,      // expires after 7 days
  path: "/",
};

module.exports = { signToken, verifyToken, cookieOptions };
