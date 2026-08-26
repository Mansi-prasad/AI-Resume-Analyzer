const dotenv = require("dotenv");

dotenv.config();

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];

const missing = requiredEnvVars.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  cookieName: process.env.COOKIE_NAME,
  clientOrigins: (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "",
  isProd: process.env.NODE_ENV === "production",
};
