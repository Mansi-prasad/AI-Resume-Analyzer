const express = require("express");
const { z } = require("zod");
const mongoose = require("mongoose");

const asyncHandler = require("../utils/AsyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const { requireAuth } = require("../middleware/auth.js");
const { validate } = require("../middleware/validate.js");
const { uploadPdf } = require("../middleware/upload.js");
const Resume = require("../modals/Resume.js");
const ResumeVersion = require("../modals/ResumeVersion.js");
const { extactText } = require("../services/pdfService.js");
const {
  parseResume: parseStructured,
} = require("../services/structuredParser.js");

const router = express.Router();
router.use(requireAuth);

const objectIdSchema = z
  .string()
  .refine((v) => mongoose.isValidObjectId(v), { message: "Invalid id" });

const isParam = z.object({ id: objectIdSchema });
