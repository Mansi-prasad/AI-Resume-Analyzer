const { PDFParse } = require("pdf-parser");
const ApiError = require("../utils/ApiError.js");

async function extractText(buffer) {
  let parse;

  try {
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();

    const text = (result.text || "").trim();
    if (!text || text.length < 50) {
      throw ApiError.badRequest(
        "Could not extract readable text - is this a scanned/image-only PDF?",
      );
    }

    return {
      text,
      meta: { numPages: result.pages?.length ?? result.numPages ?? null },
    };
  } catch (error) {
    if (error.isOperational) throw error;
    throw ApiError.badRequest("failed to parse PDF: " + error.message);
  } finally {
    try {
      await parser?.destroy?.();
    } catch {}
  }
}

module.exports = { extractText };
