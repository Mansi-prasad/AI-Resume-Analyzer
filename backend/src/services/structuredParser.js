const { Type } = require("@google/genai");
const { z } = require("zod");

const { ai, generateContent } = require("./geminiClient.js");
const linkSchema = {
  type: Type.OBJECT,
  required: ["label", "url"],
  properties: {
    label: { type: Type.STRING },
    url: { type: Type.STRING },
  },
};

const responseSchema = {
  type: Type.OBJECT,
  required: [
    "basics",
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "languages",
    "interests",
  ],
  properties: {
    basics: {
      type: Type.OBJECT,
      required: ["name", "title", "location", "email", "phone", "links"],
      properties: {
        name: { type: Type.STRING },
        title: { type: Type.STRING },
        location: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        links: { type: Type.ARRAY, items: linkSchema },
      },
    },
    summary: { type: Type.STRING },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["company", "role", "period", "bullets"],
        properties: {
          company: { type: Type.STRING },
          role: { type: Type.STRING },
          location: { type: Type.STRING },
          period: { type: Type.STRING },
          bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["degree", "school", "period"],
        properties: {
          degree: { type: Type.STRING },
          school: { type: Type.STRING },
          period: { type: Type.STRING },
          location: { type: Type.STRING },
          details: { type: Type.STRING },
        },
      },
    },
    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["name", "description"],
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          tech: { type: Type.ARRAY, items: { type: Type.STRING } },
          links: { type: Type.ARRAY, items: linkSchema },
        },
      },
    },
    certifications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["name"],
        properties: {
          name: { type: Type.STRING },
          issuer: { type: Type.STRING },
          year: { type: Type.STRING },
        },
      },
    },
    languages: { type: Type.ARRAY, items: { type: Type.STRING } },
    interests: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
};

const validator = z.object({
  basics: z.object({
    name: z.string().default(""),
    title: z.string().default(""),
    location: z.string().default(""),
    email: z.string().default(""),
    phone: z.string().default(""),
    links: z
      .array(z.object({ label: z.string(), url: z.string() }))
      .default([]),
  }),
  summary: z.string().default(""),
  experience: z
    .array(
      z.object({
        company: z.string().default(""),
        role: z.string().default(""),
        location: z.string().default(""),
        period: z.string().default(""),
        bullets: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  education: z
    .array(
      z.object({
        degree: z.string().default(""),
        school: z.string().default(""),
        location: z.string().default(""),
        period: z.string().default(""),
        details: z.string().default(""),
      }),
    )
    .default([]),
  skills: z.array(z.string()).default([]),
  projects: z
    .array(
      z.object({
        name: z.string().default(""),
        description: z.string().default(""),
        tech: z.array(z.string()).default([]),
        links: z
          .array(z.object({ label: z.string(), url: z.string() }))
          .default([]),
      }),
    )
    .default([]),
  certifications: z
    .array(
      z.object({
        name: z.string().default(""),
        issuer: z.string().default(""),
        year: z.string().default(""),
      }),
    )
    .default([]),
  languages: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
});

// function buildPrompt(rawText) {
//   return [
//     "You are a resume parser. The input is text extracted from a PDF - the lines may be scrambled, duplicated, or out of order due to PDF layout complexity.",
//     "",
//     "CRITICAL: Reconstruct the resume in standard top-to-bottom hierarchy:",
//     '- basics: name, professional title, location, email, phone, social links (LinkedIn / GitHub / portfolio etc.; label like "LinkedIn", full URL)',
//     "- summary: the professional summary paragraph (rejoin if split across lines)",
//     "- experience: jobs most recent first, with company, role, period (preserve original date format), location if available, and bullet points",
//     "- education: degree, school, period, location, optional details",
//     "- skills: flat array of technical skills",
//     "- projects: name, one-sentence description, optional tech tags, optional links",
//     "- certifications: name, issuer, year",
//     "- languages: flat array",
//     "- interests: flat array",
//     "",
//     "Rules:",
//     "- Be conservative: omit fields that are not clearly present. Use empty strings/arrays where missing.",
//     "- Do not invent or paraphrase - extract verbatim where possible.",
//     "- Each experience bullet should read as a complete sentence.",
//     "- Preserve original date formats (e.g. 'jan 2022 - Dec 2023').",
//     "",
//     "RESUME TEXT:",
//     "------------",
//     rawText,
//     "------------",
//   ].join("\n");
// }

function buildPrompt(rawText) {
  return [
    "You are an expert resume parser. The PDF text may be scrambled, duplicated, or out of order, so reconstruct the resume logically.",
    "",
    "Extract the following sections in this order:",
    "1. basics: candidate name, professional title, location, email, phone, and social links.",
    "2. summary: professional summary or objective.",
    "3. experience: jobs from most recent to oldest, including company, role, dates, location, and bullet points.",
    "4. education: degree, school, dates, location, and details.",
    "5. skills: individual technical and professional skills.",
    "6. projects: project name, description, technologies, and links.",
    "7. certifications: name, issuer, and year.",
    "8. languages and interests: individual items.",
    "",
    "Rules:",
    "- Contact information belongs only in basics, regardless of where it appears in the extracted text.",
    "- Use standard resume hierarchy: basics, summary, experience, education, skills, projects, certifications, languages, interests.",
    "- Remove section headings from the extracted values.",
    "- Do not duplicate information or include page headers, footers, or PDF artifacts.",
    "- Do not invent or paraphrase. Extract information verbatim where possible.",
    "- Use empty strings or arrays when information is missing.",
    "- Preserve the original date format.",
    "",
    "Return valid JSON matching the provided response schema.",
    "",
    "RESUME TEXT:",
    "------------",
    rawText,
    "------------",
  ].join("\\n");
}

const EMPTY = {
  basics: {
    name: "",
    title: "",
    location: "",
    email: "",
    phone: "",
    links: [],
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  interests: [],
};

async function parseResume(rawText) {
  if (!ai || !rawText?.trim()) return EMPTY;

  const prompt = buildPrompt(rawText);

  try {
    const { text } = await generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.1,
      },
    });
    const parsed = JSON.parse(text);
    return validator.parse(parsed);
  } catch (error) {
    console.error("Structured parse failed: ", error.message);
    return EMPTY;
  }
}

module.exports = { parseResume };
