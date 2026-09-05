const { z } = require("zod");
const mongoose = require("mongoose");

const objectIdSchema = z
  .string()
  .refine(
    (value) => mongoose.Types.ObjectId.isValid(value),
    "Invalid ObjectId",
  );

module.exports = {
  objectIdSchema,
};
