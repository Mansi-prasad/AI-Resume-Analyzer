const Analysis = require("../models/Analysis.js");
const { analyzeResume } = require("./geminiService.js");
const { loadOwnResume, loadVersion } = require("./resumeService.js");
const { ApiError } = require("../utils/ApiError.js");
const { rewriteBody } = require("../validators/analysisValidator.js");

// Analyze a resume version and save the result.
const createAnalysis = async ({ req, versionId, targetRole }) => {
  const resume = await loadOwnResume(req.params.id, req.user._id);

  const selectedVersionId = versionId || resume.currentVersionId;

  if (!selectedVersionId) {
    throw ApiError.badRequest("No resume version available for analysis");
  }

  // Make sure the selected version belongs to this resume.
  const version = await loadVersion(resume._id, selectedVersionId);

  // Send the extracted resume text to Gemini.
  const { analysis, model, promptTokens, responseTokens } = await analyzeResume(
    {
      rawText: version.rawText,
      targetRole,
    },
  );

  // Save the AI analysis in MongoDB.
  const saved = await Analysis.create({
    userId: req.user._id,
    resumeId: resume._id,
    versionId: version._id,
    atsScore: analysis.atsScore,
    scoreBreakdown: analysis.scoreBreakdown,
    issues: analysis.issues,
    strengths: analysis.strengths,
    bulletRewrites: analysis.bulletRewrites,
    keywordsPresent: analysis.keywordsPresent,
    keywordsMissing: analysis.keywordsMissing,
    summary: analysis.summary,
    model,
    promptTokens,
    responseTokens,
  });

  // Store a reference to the latest analysis on the version.
  version.latestAnalysisId = saved._id;
  await version.save();

  return saved;
};

// Get all analyses belonging to a resume.
const getResumeAnalyses = async (req) => {
  const resume = await loadOwnResume(req.params.id, req.user._id);

  return Analysis.find({
    resumeId: resume._id,
  })
    .sort({ createdAt: -1 })
    .lean();
};

// Get the latest analysis for a particular resume version.
const getVersionAnalysis = async (req) => {
  const resume = await loadOwnResume(req.params.id, req.user._id);

  const version = await loadVersion(resume._id, req.params.versionId);

  const analysis = await Analysis.findOne({
    resumeId: resume._id,
    versionId: version._id,
  })
    .sort({ createdAt: -1 })
    .lean();

  return analysis || null;
};

function applyRewritesToText(rawText, rewrites) {
  let result = rawText;
  for (const r of rewrites) {
    if (!r.original || !r.rewritten) continue;
    const idx = result.indexOf(r.original);
    if (idx >= 0) {
      result =
        result.slice(0, idx) +
        r.rewritten +
        result.slice(idx + r.original.length);
    } else {
      result += `\n${r.rewritten}`;
    }
  }
  return result;
}

function patchBulletsInSections(sections, rewrites) {
  if (!sections) return null;
  const cloned = JSON.parse(JSON.stringify(sections));

  for (const r of rewrites) {
    if (!r?.original || !r?.rewritten) continue;

    for (const exp of cloned.experience || []) {
      if (!Array.isArray(exp.bullets)) continue;

      exp.bullets = exp.bullets.map((b) =>
        b === r.original ? r.rewritten : b,
      );
    }
  }
  return cloned;
}

function looksEmpty(sections) {
  if (!sections) return true;
  const b = sections.basics || {};
  const hasIdentity = b.name || b.email || b.title;
  const hasBody =
    sections.summary ||
    sections.experience?.length ||
    sections.education?.length ||
    sections.skills?.length;
  return !hasIdentity && !hasBody;
}

module.exports = {
  createAnalysis,
  getResumeAnalyses,
  getVersionAnalysis,
  looksEmpty,
  patchBulletsInSections,
  applyRewritesToText,
};
