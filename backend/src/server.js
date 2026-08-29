const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const env = require("./config/env.js");
const { connectDB } = require("./config/db.js");
const { notFound, errorHandler } = require("./middleware/errorHandler.js");

const healthRouter = require("./routes/health.js");
const authRouter = require("./routes/auth.js");
const app = express(); // create express app

// Tell Express to trust the first proxy in front of the server,  Useful when deploying behind Nginx, Render, Railway, etc.
app.set("trust proxy", 1);

// Enable CORS so the frontend can communicate with this backend
app.use(
  cors({
    origin: true, // Allow requests from the requesting origin
    credentials: true, // Allow cookies/authentication credentials
  }),
);

// Limit the body size to 1 MB
app.use(express.json({ limit: "1mb" }));

// Parse form data from requests
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Read cookies sent by the browser
app.use(cookieParser());

// Show HTTP request logs during development only
if (!env.isProd) app.use(morgan("dev"));

// the health-check routes
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);

// If no route matched, return a 404 error
app.use(notFound);

// Handle all errors passed to next(error)
app.use(errorHandler);

async function start() {
  try {
    // Connect to MongoDB before starting the server
    await connectDB();

    // Start listening for incoming requests
    app.listen(env.port, () => {
      console.log(
        `Server listening on http://localhost:${env.port} (${env.nodeEnv})`,
      );
    });
  } catch (error) {
    console.error("Failed to start server: ", error.message);
    process.exit(1);
  }
}

// Handle promises that fail without being caught
process.on("unhandledRejection", (reason) => {
  console.log("Unhandled Rejection: ", reason);
});

// Start the application
start();

// Export app for testing or elsewhere
module.exports = app;
