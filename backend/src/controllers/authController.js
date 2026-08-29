const asyncHandler = require("../utils/AsyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const env = require("../config/env.js");
const { signToken, cookieOptions } = require("../utils/jwt.js");
const User = require("../modals/User.js");

function issueSession(res, user) {
  const token = signToken({
    sub: user._id.toString(),
  });
  res.cookie(env.cookieName, token, cookieOptions);
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Prevent duplicate accounts with the same email.
  const existing = await User.findOne({ email });

  if (existing) {
    throw ApiError.conflict("Email already registered!");
  }

  // Never store the plain-text password in the database.
  const passwordHash = await User.passwordHash(password);

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  // Automatically authenticate the newly registered user.
  issueSession(res, user);

  res.status(201).json({
    user,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Only select passwordHash here because it may be excluded from the User schema by default.
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    throw ApiError.unauthorized("Invalid credentials.");
  }

  const passwordValid = await user.comparePassword(password);

  if (!passwordValid) {
    throw ApiError.unauthorized("Invalid credentials.");
  }

  issueSession(res, user);

  res.status(200).json({
    user,
  });
});

const logout = asyncHandler(async (req, res) => {
  // Clearing the cookie effectively ends the client-side session.
  res.clearCookie(env.cookieName, {
    ...cookieOptions,
    maxAge: 0,
  });

  res.json({
    ok: true,
  });
});

const getMe = asyncHandler(async (req, res) => {
  // requireAuth middleware has already request and req.user.
  res.json({
    user: req.user,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  req.user.name = req.body.name;

  await req.user.save();

  res.json({
    user: req.user,
  });
});

const updatePassword = asyncHandler(async (req, res) => {
  // Fetch the password hash explicitly because passwordHash  have select: false in the User model.
  const user = await User.findById(req.user._id).select("+passwordHash");

  if (!user) {
    throw ApiError.unauthorized("Session no longer valid");
  }

  // Verify the old password before allowing a password change.
  const passwordValid = await user.comparePassword(req.body.currentPassword);

  if (!passwordValid) {
    throw ApiError.unauthorized("Current password is incorrect");
  }

  // Hash the new password before saving it.
  user.passwordHash = await User.passwordHash(req.body.newPassword);

  await user.save();

  res.json({
    ok: true,
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
};
