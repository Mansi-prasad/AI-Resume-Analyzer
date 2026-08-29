const express = require("express");

const { validate } = require("../middleware/validate.js");
const { requireAuth } = require("../middleware/auth.js");
const { authLimiter } = require("../middleware/rateLimit.js");
const {
  registerSchema,
  loginSchema,
  profileSchema,
  passwordSchema,
} = require("../schemas/authSchema.js");

const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
} = require("../controllers/authController.js");

const router = express.Router();

// Register a new user
router.post("/register", authLimiter, validate(registerSchema), register);

// Login user and create a session
router.post("/login", authLimiter, validate(loginSchema), login);

// Logout user and clear authentication cookie
router.post("/logout", logout);

// Get currently authenticated user
router.get("/me", requireAuth, getMe);

// update user profile
router.patch("/profile", requireAuth, validate(profileSchema), updateProfile);

// Change current user's password
router.patch(
  "/password",
  authLimiter,
  requireAuth,
  validate(passwordSchema),
  updatePassword,
);

module.exports = router;
