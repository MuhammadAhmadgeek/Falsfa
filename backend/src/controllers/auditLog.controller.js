// ============================================================
// controllers/auditLog.controller.js
// ============================================================
// GET /api/audit-logs
//   - superadmin: sees ALL platform-level logs (school events)
//   - schooladmin/teacher: sees only their school's logs
// Supports optional query filters: entity, action, limit
// ============================================================

const AuditLog = require("../models/AuditLog");

exports.getAuditLogs = async (req, res) => {
  try {
    const { entity, action, limit = 50 } = req.query;
    const filter = {};

    if (req.user.role === "superadmin") {
      // SuperAdmin sees platform-level logs (school actions) and can optionally see all
      // Default: only show platform-level logs (school = null or any)
      // No school filter applied — they see everything
    } else {
      // School-scoped users only see logs for their own school
      filter.school = req.user.school;
    }

    if (entity) filter.entity = entity;
    if (action) filter.action = action;

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
