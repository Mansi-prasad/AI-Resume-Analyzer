const express = require("express");
const { requireAuth } = require("../middleware/auth");

const  getInsights  = require("../controllers/insightsController.js");
const router = express.Router();
router.use(requireAuth);

router.get("/", getInsights);

module.exports = router;
