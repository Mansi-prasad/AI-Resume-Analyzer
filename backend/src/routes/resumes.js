const express = require("express");

const { requireAuth } = require("../middleware/auth.js");
const { validate } = require("../middleware/validate.js");
const { uploadPdf } = require("../middleware/upload.js");
const { isParam, isVersionParam } = require("../validators/resumeValidator.js");

const {
  createResume,
  getResume,
  getResumes,
  getResumeVersion,
  deleteResume,
} = require("../controllers/resumeController.js");

const router = express.Router();
router.use(requireAuth);

// Create a resume from an uploaded PDF. uploadPdf handles multipart/form-data  and puts the uploaded file in req.file.
router.post("/", uploadPdf("file"), createResume);

// Get all resumes for the current user.
router.get("/", getResumes);

// Get a single resume with its versions.
router.get("/:id", validate(isParam, "params"), getResume);

// Get a specific version of a resume.
router.get(
  "/:id/versions/:versionId",
  validate(isVersionParam, "params"),
  getResumeVersion,
);

// Delete a resume and all associated versions.
router.delete("/:id", validate(isParam, "params"), deleteResume);

module.exports = router;
