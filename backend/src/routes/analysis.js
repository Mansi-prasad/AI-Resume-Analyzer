const express = require("express");

const { requireAuth } = require("../middleware/auth.js");
const { validate } = require("../middleware/validate.js");
const { analyzeLimiter } = require("../middleware/rateLimit.js");

const {
  idParam,
  analysisBody,
  versionAnalysisParams,
} = require("../validators/analysisValidator.js");

const {
  analyzeResumeController,
  getAnalysesController,
  getVersionAnalysisController,
} = require("../controllers/analysisController.js");

const router = express.Router();

router.use(requireAuth);

// Analyze a resume- POST /resumes/:id/analyze

router.post(
  "/:id/analyze",
  analyzeLimiter,
  validate(idParam, "params"),
  validate(analysisBody, "body"),
  analyzeResumeController,
);

// Get all analyses for a resume - GET /resumes/:id/analyses

router.get("/:id/analyses", validate(idParam, "params"), getAnalysesController);

// Get latest analysis for a resume version - GET /resumes/:id/versions/:versionId/analysis

router.get(
  "/:id/versions/:versionId/analysis",
  validate(versionAnalysisParams, "params"),
  getVersionAnalysisController,
);

module.exports = router;
