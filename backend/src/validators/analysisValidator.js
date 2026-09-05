const { z } = require("zod");
const { objectIdSchema } = require("./commonValidator.js");

const idParam = z.object({
  id: objectIdSchema,
});

const analysisBody = z.object({
  versionId: objectIdSchema.optional(),

  targetRole: z.string().trim().max(120).optional(),
});

const versionAnalysisParams = z.object({
  id: objectIdSchema,
  versionId: objectIdSchema,
});

const diffQuery = z.object({
  from: objectIdSchema,
  to: objectIdSchema,
  model: z.enum(["words", "lines"]).optional(),
});

const rewriteBody = z.object({
  analysisId: objectIdSchema,
  rewriteIds: z.array(objectIdSchema).optional(), // omit/empty = apply all
  label: z.string().trim().max(40).optional(),
});

module.exports = {
  idParam,
  analysisBody,
  versionAnalysisParams,
  diffQuery,
  rewriteBody,
};
