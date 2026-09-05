const asyncHandler = require("../utils/AsyncHandler.js");

const {
  createAnalysis,
  getResumeAnalyses,
  getVersionAnalysis,
  looksEmpty,
  patchBulletsInSections,
  applyRewritesToText,
} = require("../services/analysisService.js");
const { diffText, summarize } = require("../services/diffService.js");

// POST /resumes/:id/analyze

const analyzeResumeController = asyncHandler(async (req, res) => {
  const analysis = await createAnalysis({
    req,
    versionId: req.body.versionId,
    targetRole: req.body.targetRole,
  });

  res.status(201).json({
    analysis,
  });
});

// GET /resumes/:id/analyses

const getAnalysesController = asyncHandler(async (req, res) => {
  const analyses = await getResumeAnalyses(req);

  res.json({
    analyses,
  });
});

// GET /resumes/:id/versions/:versionId/analysis

const getVersionAnalysisController = asyncHandler(async (req, res) => {
  const analysis = await getVersionAnalysis(req);

  res.json({
    analysis,
  });
});

const rewriteController = asyncHandler(async (req, res) => {
  const resume = await loadOwnResume(req);

  const analysis = await Analysis.findOne({
    _id: req.body.analysisId,
    resumeId: resume._id,
  });
  if (!analysis) throw ApiError.notFound("Analysis not found");

  const baseVersion = await loadVersion(resume._id, analysis.versionId);

  const selected = req.body.rewriteIds?.length
    ? analysis.bulletRewrites.filter((r) =>
        req.body.rewriteIds.includes(r._id.toString()),
      )
    : analysis.bulletRewrites;

  if (!selected.length) {
    throw ApiError.badRequest("No rewrites selected to apply");
  }

  const newRaw = applyRewritesToText(baseVersion, rawText, selected);

  // safety net: pre-build a structured copy from the base version with the choosen bullets swapped in, so v2 never lands with empty sections even if gemini's reparse fails

  const patchedFromBase = patchBulletsInSections(
    baseVersion.parsedSections,
    selected,
  );

  const reparsed = await parseStructured(newRaw);

  const finalParsed = looksEmpty(reparsed) ? patchedFromBase : reparsed;

  const nextNumber = resume.latestVersionNumber + 1;

  const newVersion = await ResumeVersion.create({
    resumeId: resume._id,
    versionNumber: nextNumber,
    label: req.body.label?.trim() || `V${nextNumber}`,
    rawText: newRaw,
    parsedSections: finalParsed,
    sourceType: "rewrite",
    parentVersionId: baseVersion._id,
  });

  resume.latestVersionNumber = nextNumber;
  resume.currentVersionId = newVersion._id;

  await resume.save();

  res.status(201).json({
    version: newVersion,
    appliedCount: selected.length,
  });
});

const diffController = asyncHandler(async (req, res) => {
  const resume = await loadOwnResume(req);
  const [fromV, toV] = await Promise.all([
    loadVersion(resume._id, req.query.from),
    loadVersion(resume._id, req.query.to),
  ]);

  const parts = diffText(fromV.rawText, toV.rawText, req.query.mode);

  res.json({
    from: {
      id: fromV._id,
      label: fromV.label,
      versionNumber: fromV.versionNumber,
    },
    to: {},
    parts,
    stats: summarize(parts),
  });
});
module.exports = {
  analyzeResumeController,
  getAnalysesController,
  getVersionAnalysisController,
  rewriteController,
  diffController,
};
