const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    // User's email address
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"],
      index: true,
    },

    // Hashed password (never return it by default)
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    // User's name
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
  },
  {
    timestamps: true,
  },
);

// Hash a plain-text password
userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 12);
};

// Compare a plain-text password with the stored hash
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Remove sensitive fields before returning user data
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

// Create and export the User model
module.exports = mongoose.model("User", userSchema);
