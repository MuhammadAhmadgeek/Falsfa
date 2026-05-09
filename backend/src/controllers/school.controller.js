const School = require("../models/School");
const User = require("../models/User");
const { logAction } = require("../utils/auditLogger");

exports.getSchools = async (req, res) => {
  try {
    // Populate dynamic counts
    const schools = await School.find().sort({ createdAt: -1 }).lean();
    
    // We can count students per school if needed. 
    // This is optional if a cron/post-save hook handles it.
    // For now, let's keep it simple and just return what's in the DB
    // since the user's SuperAdminDashboard expects `stats.totalStudents`.
    // Let's populate the stats dynamically here:
    const Student = require("../models/Student");
    for (let school of schools) {
      if (!school.stats) school.stats = {};
      school.stats.totalStudents = await Student.countDocuments({ school: school._id, isActive: true });
    }

    res.json({ success: true, count: schools.length, data: schools });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSchool = async (req, res) => {
  try {
    const school = await School.create(req.body);

    await logAction(req.user, {
      action:      "SCHOOL_CREATED",
      entity:      "School",
      entityId:    school._id,
      entityName:  school.name,
      school:      null, // platform-level action
      description: `New school "${school.name}" (${school.code}) was registered on the platform`,
    });

    res.status(201).json({ success: true, data: school });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getSchoolById = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ success: false, message: "School not found" });

    // Non-superadmin can only view their own school
    if (req.user.role !== "superadmin" && school._id.toString() !== req.user.school.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, data: school });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSchool = async (req, res) => {
  try {
    const school = await School.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!school) return res.status(404).json({ success: false, message: "School not found" });

    // Log status toggle specifically
    if (req.body.isActive !== undefined) {
      await logAction(req.user, {
        action:      "SCHOOL_TOGGLED",
        entity:      "School",
        entityId:    school._id,
        entityName:  school.name,
        school:      null,
        description: `School "${school.name}" was ${school.isActive ? "activated" : "deactivated"}`,
      });
    }

    res.json({ success: true, data: school });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSchoolById = async (req, res) => {
  try {
    const school = await School.findByIdAndDelete(req.params.id);
    if (!school) return res.status(404).json({ success: false, message: "School not found" });

    await logAction(req.user, {
      action:      "SCHOOL_DELETED",
      entity:      "School",
      entityId:    school._id,
      entityName:  school.name,
      school:      null,
      description: `School "${school.name}" (${school.code}) was permanently deleted from the platform`,
    });

    res.json({ success: true, message: "School deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/schools/settings/my ──────────────────────────────
exports.getMySchoolSettings = async (req, res) => {
  try {
    const schoolId = req.schoolId || (req.user && req.user.school) || req.query.schoolId;
    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ success: false, message: "School not found" });

    res.json({ success: true, data: school });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── PUT /api/schools/settings/my ──────────────────────────────
exports.updateMySchoolSettings = async (req, res) => {
  try {
    const schoolId = req.schoolId || (req.user && req.user.school) || req.body.schoolId;
    const school = await School.findByIdAndUpdate(schoolId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!school) return res.status(404).json({ success: false, message: "School not found" });

    res.json({ success: true, data: school });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── GET /api/schools/subscriptions ────────────────────────────
exports.getSubscriptions = async (req, res) => {
  try {
    const schools = await School.find().select("name plan createdAt isActive");
    res.json({ success: true, count: schools.length, data: schools });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── PUT /api/schools/subscriptions/:id ────────────────────────
exports.updateSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    const school = await School.findByIdAndUpdate(req.params.id, { plan }, { new: true });
    
    if (!school) return res.status(404).json({ success: false, message: "School not found" });

    await logAction(req.user, {
      action:      "SUBSCRIPTION_UPDATED",
      entity:      "School",
      entityId:    school._id,
      entityName:  school.name,
      school:      null,
      description: `Subscription plan for "${school.name}" updated to ${plan}`,
    });

    res.json({ success: true, data: school });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};