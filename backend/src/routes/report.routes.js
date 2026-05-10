// ============================================================
// routes/report.routes.js
// ============================================================

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getAcademicReport,
  getAttendanceReport,
  getFinanceReport,
} = require("../controllers/report.controller");

router.use(protect);

// Middleware to extract schoolId from req.user
router.use((req, res, next) => {
  req.schoolId = req.user?.school;
  next();
});

// Academic performance report — schooladmin only
router.get(
  "/academic",
  authorize("schooladmin"),
  getAcademicReport
);

// Attendance summary — schooladmin + teacher
router.get(
  "/attendance",
  authorize("schooladmin", "teacher"),
  getAttendanceReport
);

// Financial health report — schooladmin only
router.get(
  "/finance",
  authorize("schooladmin"),
  getFinanceReport
);

module.exports = router;
