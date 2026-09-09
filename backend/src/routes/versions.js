const express = require("express");

const { requireAuth } = require("../middleware/auth.js");
const  getVersions = require("../controllers/versionsController.js");

const router = express.Router();
router.use(requireAuth);

router.get("/", getVersions);
module.exports = router;
