const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const { getDashboard, getLatestReport, getReports } = require("../controllers/user.controller");

const router = express.Router();

router.use(authMiddleware, requireRole("USER"));

router.get("/dashboard", getDashboard);
router.get("/latest-report", getLatestReport);
router.get("/reports", getReports);

module.exports = router;
