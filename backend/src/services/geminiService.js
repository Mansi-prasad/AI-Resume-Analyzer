const { Type } = require("@google/genai");
const { z } = require("zod");

const env = require("../config/env.js");
const ApiError = require("../utils/ApiError.js");
const { ai, generateContent, isCapacityError } = require("./geminiClient.js");

const responseSchema = {
  type: Type.OBJECT,
  required: [
    "atsScore",
    "scoreBreakdown",
    "issues",
    "strengths",
    "bulletRewrites",
    "keywordsPresent",
    "keywordsMissing",
    "summary",
  ],
  properties: {
    atsScore: {
      type: Type.NUMBER,
      description: "ATS-readiness score from 0 to 100",
    },
    scoreBreakdown: {
      type: Type.OBJECT,
      required: ["keywords", "formatting", "impact", "clarity"],
      properties: {
        keywords: { type: Type.NUMBER, description: "0-25" },
        formatting: { type: Type.NUMBER, description: "0-25" },
        impact: { type: Type.NUMBER, description: "0-25" },
        clarity: { type: Type.NUMBER, description: "0-25" },
      },
    },
    issues: {
      type: Type.ARRAY,
      description: "Exactly 5 prioritized issues",
      items: {
        type: Type.OBJECT,
        required: ["title", "severity", "explanation", "fix"],
        properties: {
          title: { type: Type.STRING },
          severity: {
            type: Type.STRING,
            enum: ["low", "medium", "high"],
          },
          explanation: { type: Type.STRING },
          fix: { type: Type.STRING },
        },
      },
    },
    strengths: {
      type: Type.ARRAY,
      description: "Exactly 5 strengths",
      items: {
        type: Type.OBJECT,
        required: ["title", "evidence"],
        properties: {
          title: { type: Type.STRING },
          evidence: { type: Type.STRING },
        },
      },
    },
    bulletRewrites: {
      type: Type.ARRAY,
      description:
        "5-10 weak bullets rewritten to be stronger and ATS-friendly",
      items: {
        type: Type.OBJECT,
        required: ["section", "original", "rewritten", "rationale"],
        properties: {
          section: { type: Type.STRING },
          original: { type: Type.STRING },
          rewritten: { type: Type.STRING },
          rationale: { type: Type.STRING },
        },
      },
    },
    keywordsPresent: { type: Type.ARRAY, items: { type: Type.STRING } },
    keywordsMissing: { type: Type.ARRAY, items: { type: Type.STRING } },
    summary: {
      type: Type.STRING,
      description: "One short paragraph overall verdict",
    },
  },
};

const analysisValidator = z.object({
  atsScore: z.number().min(0).max(100),
  scoreBreakdown: z.object({
    keywords: z.number().min(0).max(25),
    formatting: z.number().min(0).max(25),
    impact: z.number().min(0).max(25),
    clarity: z.number().min(0).max(25),
  }),
  issues: z
    .array(
      z.object({
        title: z.string(),
        severity: z.enum(["low", "medium", "high"]),
        explanation: z.string(),
        fix: z.string(),
      }),
    )
    .min(1),
  strengths: z
    .array(z.object({ title: z.string(), evidence: z.string() }))
    .min(1),
  bulletRewrites: z
    .array(
      z.object({
        section: z.string(),
        original: z.string(),
        rewritten: z.string(),
        rationale: z.string(),
      }),
    )
    .default([]),
  keywordsMissing: z.array(z.string()).default([]),
  keywordsPresent: z.array(z.string()).default([]),
  summary: z.string(),
});

function formatStructuredResume(sections) {
  const parts = [];

  // Contact Information (at the top)
  if (sections.basics) {
    parts.push("CONTACT & BASICS");
    if (sections.basics.name) parts.push(`Name: ${sections.basics.name}`);
    if (sections.basics.title) parts.push(`Title: ${sections.basics.title}`);
    if (sections.basics.email) parts.push(`Email: ${sections.basics.email}`);
    if (sections.basics.phone) parts.push(`Phone: ${sections.basics.phone}`);
    if (sections.basics.location)
      parts.push(`Location: ${sections.basics.location}`);
    if (sections.basics.links && sections.basics.links.length > 0) {
      sections.basics.links.forEach((link) => {
        parts.push(`${link.label}: ${link.url}`);
      });
    }
    parts.push("");
  }

  // Professional Summary
  if (sections.summary && sections.summary.trim()) {
    parts.push("PROFESSIONAL SUMMARY");
    parts.push(sections.summary);
    parts.push("");
  }

  // Experience
  if (sections.experience && sections.experience.length > 0) {
    parts.push("EXPERIENCE");
    sections.experience.forEach((exp) => {
      if (exp.company) parts.push(`${exp.company} - ${exp.role || ""}`);
      if (exp.period) parts.push(`Period: ${exp.period}`);
      if (exp.location) parts.push(`Location: ${exp.location}`);
      if (exp.bullets && exp.bullets.length > 0) {
        exp.bullets.forEach((bullet) => {
          parts.push(`• ${bullet}`);
        });
      }
      parts.push("");
    });
  }

  // Education
  if (sections.education && sections.education.length > 0) {
    parts.push("EDUCATION");
    sections.education.forEach((edu) => {
      if (edu.degree) parts.push(`${edu.degree}`);
      if (edu.school) parts.push(`${edu.school}`);
      if (edu.period) parts.push(`Period: ${edu.period}`);
      if (edu.location) parts.push(`Location: ${edu.location}`);
      if (edu.details) parts.push(`Details: ${edu.details}`);
      parts.push("");
    });
  }

  // Skills
  if (sections.skills && sections.skills.length > 0) {
    parts.push("SKILLS");
    parts.push(sections.skills.join(", "));
    parts.push("");
  }

  // Projects
  if (sections.projects && sections.projects.length > 0) {
    parts.push("PROJECTS");
    sections.projects.forEach((proj) => {
      if (proj.name) parts.push(`${proj.name}`);
      if (proj.description) parts.push(`Description: ${proj.description}`);
      if (proj.tech && proj.tech.length > 0) {
        parts.push(`Tech: ${proj.tech.join(", ")}`);
      }
      if (proj.links && proj.links.length > 0) {
        proj.links.forEach((link) => {
          parts.push(`${link.label}: ${link.url}`);
        });
      }
      parts.push("");
    });
  }

  // Certifications
  if (sections.certifications && sections.certifications.length > 0) {
    parts.push("CERTIFICATIONS");
    sections.certifications.forEach((cert) => {
      if (cert.name) {
        let certLine = cert.name;
        if (cert.issuer) certLine += ` - ${cert.issuer}`;
        if (cert.year) certLine += ` (${cert.year})`;
        parts.push(certLine);
      }
    });
    parts.push("");
  }

  // Languages
  if (sections.languages && sections.languages.length > 0) {
    parts.push("LANGUAGES");
    parts.push(sections.languages.join(", "));
    parts.push("");
  }

  // Interests
  if (sections.interests && sections.interests.length > 0) {
    parts.push("INTERESTS");
    parts.push(sections.interests.join(", "));
    parts.push("");
  }

  return parts.join("\n");
}

function buildPrompt({parsedSections, rawText, targetRole }) {
  // Use formatted structured data if available, otherwise fall back to raw text
  const textToAnalyze = parsedSections
    ? formatStructuredResume(parsedSections)
    : rawText;

  return [
    "You are a senior technical recruiter and ATS expert reviewing a resume.",
    targetRole
      ? `Target role: ${targetRole}.`
      : "No specific target role was provided — assess what role the candidate appears to be aiming for.",
    "",
    "Score the resume from 0-100 based on ATS readiness, including keyword match, parseable formatting, quantified impact, and clarity.",
    "Return exactly 5 prioritized issues, 5 standout strengths, and 5-10 weak bullets rewritten to be stronger, quantified, and ATS-friendly.",
    "Rewrites must preserve the original meaning. Each rewrite must include a one-line rationale.",
    "Identify keywords that are clearly present and notable keywords that are missing for the apparent target role.",
    "Be specific and evidence-based. Cite exact phrasing from the resume when explaining issues or strengths.",
    "",
    "RESUME TEXT:",
    "----------",
    textToAnalyze,
    "----------",
  ].join("\n");
}

async function analyzeResume({ rawText, targetRole }) {
  if (!ai) {
    throw ApiError.internal("GEMINI_API_KEY is not configured on the server.");
  }
  const prompt = buildPrompt({ rawText, targetRole });

  try {
    const { text, usage, model } = await generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.4,
      },
    });
    const parsed = JSON.parse(text);
    const validated = analysisValidator.parse(parsed);

    return {
      analysis: validated,
      model,
      promptTokens: usage.promptTokenCount,
      responseTokens: usage.candidatesTokenCount,
    };
  } catch (error) {
    if (isCapacityError(error) || error.isCapacity) {
      throw new ApiError(
        503,
        "Gemini is busy right now. Wait a few seconds and try Analyze again.",
      );
    }
    throw ApiError.internal(
      `Gemini analysis failed: ${error?.message || "unknown error"}`,
    );
  }
}

module.exports = { analyzeResume };
