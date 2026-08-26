const ApiError = require("../utils/ApiError.js");

// validate() creates a middleware for validating request data
// schema = Zod schema
// source = where the data comes from: body, params, query, etc.
const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    // Validate the requested data using the schema
    const result = schema.safeParse(req[source]);

    // If validation fails
    if (!result.success) {
      // Pass the validation error to our error-handling middleware
      return next(
        ApiError.badRequest("Validation failed", result.error.issues),
      );
    }

    // Replace the original data with the validated/parsed data,  safeParse() stores it in `data`
    req[source] = result.data;

    // If validation succeeded, continue to the next middleware
    next();
  };

module.exports = { validate };
