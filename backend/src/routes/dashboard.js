const express = require("express");

const { requireAuth } = require("../middleware/auth.js");
const getDashboard = require("../controllers/dashboardController.js");

const router = express.Router();
router.use(requireAuth);

router.get("/", getDashboard);

module.exports = router;
