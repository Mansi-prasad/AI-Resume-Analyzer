const express = require("express");

const { requireAuth } = require("../middleware/auth");
const  getEvents  = require("../controllers/historyController.js");
const router = express.Router();
router.use(requireAuth);

router.get("/", getEvents);

module.exports = router;
