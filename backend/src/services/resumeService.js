const ApiError = require("../utils/ApiError.js");

const Resume = require("../models/Resume.js");
const ResumeVersion = require("../models/ResumeVersion.js");

const { extractText } = require("./pdfService.js");
const { parseResume: parseStructured } = require("./structuredParser.js");
const Analysis = require("../models/Analysis.js");

// Load a resume only if it belongs to the current user.
// This is important for authorization: a user should never be able to access another user's resume just by changing the resume ID.

async function loadOwnResume(resumeId, userId) {
  const resume = await Resume.findOne({
    _id: resumeId,
    userId,
  });

  if (!resume) {
    throw ApiError.notFound("Resume not found");
  }

  return resume;
}

// Load a version belonging to a specific resume.
// Checking both versionId and resumeId prevents someone from requesting a version that belongs to another resume.
async function loadVersion(resumeId, versionId) {
  const version = await ResumeVersion.findOne({
    _id: versionId,
    resumeId,
  });

  if (!version) {
    throw ApiError.notFound("Version not found");
  }

  return version;
}

//  Create a new resume from an uploaded PDF.

async function createResume({ file, title, userId }) {
  // Extract readable text from the uploaded PDF.
  const { text, meta } = await extractText(file.buffer);

  // Convert raw text into structured resume sections.
  const parsedSection = await parseStructured(text);

  // Use the provided title if available.
  // Otherwise use the PDF filename.
  // Finally fall back to "Untitled Resume".
  const resumeTitle =
    (title || "").trim() ||
    file.originalname.replace(/\.pdf$/i, "") ||
    "Untitled Resume";

  // Create the main resume document.
  const resume = await Resume.create({
    userId,
    title: resumeTitle,
    latestVersionNumber: 1,
  });

  // Create the first version of the resume.
  const version = await ResumeVersion.create({
    resumeId: resume._id,
    versionNumber: 1,
    label: "V1",
    rawText: text,
    parsedSection,
    sourceType: "upload",
    parentVersionId: null,
  });

  // Point the resume to its current/latest version.
  resume.currentVersionId = version._id;

  await resume.save();

  return {
    resume,
    version,
    meta,
  };
}

// Get all resumes belonging to a user.
async function getResumes(userId) {
  return Resume.find({
    userId,
  })
    .sort({ updatedAt: -1 })
    .lean();
}

// Get a resume and all its versions.
//  rawText is excluded from the version list because it can be large and isn't required for the listing page.

async function getResumeWithVersions(resumeId, userId) {
  const resume = await loadOwnResume(resumeId, userId);

  const versions = await ResumeVersion.find({
    resumeId: resume._id,
  })
    .sort({ versionNumber: 1 })
    .select("-rawText")
    .lean();

  return {
    resume,
    versions,
  };
}

// Get a specific version of a user's resume.
async function getResumeVersion(resumeId, versionId, userId) {
  // First make sure the resume belongs to the user.
  const resume = await loadOwnResume(resumeId, userId);

  // Then make sure the version belongs to that resume.
  const version = await loadVersion(resume._id, versionId);

  return version;
}

// Delete a resume and all of its versions.
async function deleteResume(resumeId, userId) {
  const resume = await loadOwnResume(resumeId, userId);

  // Delete all child versions first.
  await ResumeVersion.deleteMany({
    resumeId: resume._id,
  });
  await Analysis.deleteMany({
    resumeId: resume._id,
  });

  // Delete the parent resume.
  await resume.deleteOne();
}

module.exports = {
  loadOwnResume,
  loadVersion,
  createResume,
  getResumes,
  getResumeWithVersions,
  getResumeVersion,
  deleteResume,
};
