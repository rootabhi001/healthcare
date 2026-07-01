const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const {
  getUsers,
  getUserById,
  getUserReports,
  uploadExcel,
  uploadHealthReports,
} = require("../controllers/admin.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware, requireRole("ADMIN"));

router.get("/users", getUsers);
router.get("/users/:clientId/reports", getUserReports);
router.get("/users/:clientId", getUserById);
router.post("/upload-excel", upload.single("file"), uploadExcel);
router.post(
  "/upload-health-reports",
  upload.single("file"),
  uploadHealthReports
);

module.exports = router;
