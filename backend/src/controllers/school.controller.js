const School = require("../models/School");
const User = require("../models/User");
const { logAction } = require("../utils/auditLogger");

exports.getSchools = async (req, res) => {
  try {
    const schools = await School.find().sort({ createdAt: -1 });
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