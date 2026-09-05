const { PDFParse } = require("pdf-parse");
const ApiError = require("../utils/ApiError.js");

// Extract readable text from a PDF Buffer.
async function extractText(buffer) {
  let parse;

  // Make sure the caller actually provided a Buffer.
  if (!Buffer.isBuffer(buffer)) {
    throw ApiError.badRequest("Invalid PDF file");
  }

  // Reject empty files before passing them to the PDF parser.
  if (buffer.length === 0) {
    throw ApiError.badRequest("Uploaded PDF is empty");
  }

  try {
    // PDFParse expects the PDF data through the `data` option.
    parse = new PDFParse({ data: buffer });

    // Extract text from all pages.
    const result = await parse.getText();

    // Normalize the extracted text
    const text = (result.text || "").trim();

    // A very small data check
    if (!text || text.length < 50) {
      throw ApiError.badRequest(
        "Could not extract readable text - is this a scanned/image-only PDF?",
      );
    }

    // Return only the information needed by the resume service.
    return {
      text,
      meta: { numPages: result.pages?.length ?? result.numPages ?? null },
    };
  } catch (error) {
    if (error.isOperational) throw error;

    // Convert unexpected PDF parser errors into an API error.
    throw ApiError.badRequest("failed to parse PDF: " + error.message);
  } finally {
    try {
      await parse?.destroy?.();
    } catch {}
  }
}

module.exports = { extractText };
