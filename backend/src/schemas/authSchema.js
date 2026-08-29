const { z } = require("zod");

// when creating a new a/c
const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
});

// min(1) - don't want validation to reveal our password policy before authentication.

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});

const profileSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(120),
  newPassword: z.string().min(8).max(128),
});

module.exports = {
  registerSchema,
  loginSchema,
  profileSchema,
  passwordSchema,
};
