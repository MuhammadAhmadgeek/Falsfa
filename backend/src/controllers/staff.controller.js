const Staff = require("../models/Staff");
const User = require("../models/User");
const School = require("../models/School");

// ── GET all staff ─────────────────────────────────────────────
exports.getAllStaff = async (req, res) => {
  try {
    const filter = { school: req.schoolId || req.query.school };

    if (req.query.designation) filter.designation = req.query.designation;
    if (req.query.search) {
      filter.$or = [
        { name:       { $regex: req.query.search, $options: "i" } },
        { employeeId: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const staff = await Staff.find(filter)
      .populate("user", "email avatar")
      .sort({ name: 1 });

    res.json({ success: true, count: staff.length, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST add new staff member ─────────────────────────────────
// Creates a User account AND a Staff profile together
exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, designation, employeeId, ...rest } = req.body;
    const schoolId = req.schoolId || req.body.school;

    // 1. Create user account for login
    const user = await User.create({
      name,
      email,
      password: password || "school@123", // Default password
      role: designation === "principal" ? "schooladmin" : "teacher",
      school: schoolId,
    });

    // 2. Create staff profile
    const staff = await Staff.create({
      user:        user._id,
      school:      schoolId,
      name,
      employeeId,
      designation,
      ...rest,
    });

    // 3. Update school staff count
    await School.findByIdAndUpdate(schoolId, { $inc: { "stats.totalStaff": 1 } });

    res.status(201).json({ success: true, data: staff });
  } catch (error) {
    // If staff creation fails, try to delete the user to avoid orphaned accounts
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── GET single staff member ───────────────────────────────────
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).populate("user", "email avatar isActive");
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── PUT update staff ──────────────────────────────────────────
exports.updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── DELETE staff ──────────────────────────────────────────────
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    // Also deactivate the linked user account
    await User.findByIdAndUpdate(staff.user, { isActive: false });
    await Staff.findByIdAndDelete(req.params.id);
    await School.findByIdAndUpdate(staff.school, { $inc: { "stats.totalStaff": -1 } });

    res.json({ success: true, message: "Staff member removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};