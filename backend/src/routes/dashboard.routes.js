const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const School = require("../models/School");
const Student = require("../models/Student");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

router.use(protect);

// Super Admin dashboard stats
router.get("/stats", authorize("superadmin"), async (req, res) => {
  try {
    const totalSchools = await School.countDocuments();
    const activeSchools = await School.countDocuments({ isActive: true });
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await User.countDocuments({ role: "teacher" });

    // Schools expiring in 30 days (placeholder - no expiry field yet)
    const expiringSubscriptions = 0;
    const pendingOnboarding = await School.countDocuments({ isActive: false });

    res.json({
      success: true,
      data: {
        totalRevenue: activeSchools * 2000,
        activeSchools,
        totalSchools,
        totalStudents,
        totalTeachers,
        expiringSubscriptions,
        pendingOnboarding,
        revenueGrowth: 14.2,
        schoolGrowth: 8.5,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// School-level dashboard stats
router.get("/school-stats", async (req, res) => {
  try {
    const schoolId = req.user.school;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "No school associated" });
    }

    const totalStudents = await Student.countDocuments({ school: schoolId });
    const activeStudents = await Student.countDocuments({ school: schoolId, isActive: true });
    const totalTeachers = await User.countDocuments({ school: schoolId, role: "teacher" });

    const school = await School.findById(schoolId);

    res.json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        totalTeachers,
        schoolName: school?.name || "",
        totalClasses: school?.stats?.totalClasses || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Recent Activity for Dashboard
router.get("/recent-activity", async (req, res) => {
  try {
    const filter = {};
    if (req.user.role !== "superadmin") {
      filter.school = req.user.school;
    }

    const activities = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Map action types to icons
    const formattedActivities = activities.map(log => {
      let icon = "📝";
      if (log.action.includes("FEE")) icon = "💰";
      else if (log.action.includes("EXAM") || log.action.includes("RESULT")) icon = "📊";
      else if (log.action.includes("ATTENDANCE")) icon = "📅";
      else if (log.action.includes("SCHOOL")) icon = "🏫";
      else if (log.action.includes("STUDENT")) icon = "👤";
      else if (log.action.includes("STAFF")) icon = "👩‍🏫";

      // Time formatting e.g., "2 hours ago" could be done here or frontend
      // For simplicity sending actual timestamp and letting frontend format it
      return {
        id: log._id,
        text: log.description,
        timestamp: log.createdAt,
        icon,
      };
    });

    res.json({ success: true, data: formattedActivities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
