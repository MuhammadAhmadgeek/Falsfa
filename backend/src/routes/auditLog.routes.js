const express = require("express");
const router  = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { getAuditLogs } = require("../controllers/auditLog.controller");

router.use(protect);

// GET /api/audit-logs — superadmin sees all, school users see their school's logs
router.get("/", authorize("superadmin", "schooladmin", "teacher"), getAuditLogs);

module.exports = router;
