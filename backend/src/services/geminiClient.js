const { GoogleGenAI } = require("@google/genai");
const env = require("../config/env.js");

const ai = env.geminiApiKey
  ? new GoogleGenAI({ apiKey: env.geminiApiKey })
  : null;

const fallbackModels = [
  env.geminiModel,
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
].filter((model, index, list) => model && list.indexOf(model) === index);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isCapacityError(error) {
  const raw = `${error?.message || ""} ${error?.status || ""} ${error?.code || ""}`;
  return /UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|try again later|"code":503|"code":429/i.test(
    raw,
  );
}

async function generateContent({ contents, config }) {
  if (!ai) return null;

  let lastErr;

  for (const model of fallbackModels) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await ai.models.generateContent({
          model,
          contents,
          config,
        });
        const text =
          typeof result.text === "function" ? result.text() : result.text;
        if (!text) throw new Error("Empty response from Gemini");
        return { text, usage: result.usageMetadata || {}, model };
      } catch (error) {
        lastErr = error;
        if (isCapacityError(error) && attempt < 3) {
          await sleep(800 * attempt);
          continue;
        }
        if (isCapacityError(error)) break;
        throw error;
      }
    }
  }

  const error = lastErr || new Error("Gemini request failed");
  error.isCapacity = isCapacityError(lastErr);
  throw error;
}

module.exports = { ai, generateContent, isCapacityError };
