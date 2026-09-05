const asyncHandler = require("../utils/AsyncHandler.js");

const resumeService = require("../services/resumeService.js");

// POST / Upload a PDF and create a new resume.

const createResume = asyncHandler(async (req, res) => {
  const result = await resumeService.createResume({
    file: req.file,
    title: req.body.title,
    userId: req.user._id,
  });

  res.status(201).json(result);
});

// GET / Get all resumes belonging to the logged-in user.

const getResumes = asyncHandler(async (req, res) => {
  const resumes = await resumeService.getResumes(req.user._id);

  res.json({
    resumes,
  });
});

// GET /:id Get one resume with its versions.

const getResume = asyncHandler(async (req, res) => {
  const result = await resumeService.getResumeWithVersions(
    req.params.id,
    req.user._id,
  );

  res.json(result);
});

//GET /:id/versions/:versionId - Get one specific resume version.

const getResumeVersion = asyncHandler(async (req, res) => {
  const version = await resumeService.getResumeVersion(
    req.params.id,
    req.params.versionId,
    req.user._id,
  );

  res.json({
    version,
  });
});

// DELETE /:id Delete a resume and all of its versions.

const deleteResume = asyncHandler(async (req, res) => {
  await resumeService.deleteResume(req.params.id, req.user._id);

  res.json({
    ok: true,
  });
});

module.exports = {
  createResume,
  getResumes,
  getResume,
  getResumeVersion,
  deleteResume,
};
