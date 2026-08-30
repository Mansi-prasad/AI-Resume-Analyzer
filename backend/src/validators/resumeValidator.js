const { z } = require("zod");
const mongoose = require("mongoose");

// Validate MongoDB ObjectId.
const objectIdSchema = z
  .string()
  .refine((v) => mongoose.isValidObjectId(v), {
    message: "Invalid id",
  });

// Validation for routes containing only :id.
const isParam = z.object({
  id: objectIdSchema,
});

// Validation for routes containing :id and :versionId.
const isVersionParam = z.object({
  id: objectIdSchema,
  versionId: objectIdSchema,
});

module.exports = {
  isParam,
  isVersionParam,
};

