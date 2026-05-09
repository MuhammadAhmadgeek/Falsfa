// controllers/register.controller.js - Public School Registration
// This handles the self-service school onboarding flow (no auth required)

const User = require("../models/User");
const School = require("../models/School");

exports.registerSchool = async (req, res) => {
  try {
    const {
      schoolName,
      city,
      approximateStudents,
      adminName,
      email,
      phone,
      password,
    } = req.body;

    // ── Validation ──────────────────────────────────────────────
    if (!schoolName || !city || !adminName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Check if school name already exists
    const existingSchool = await School.findOne({
      name: { $regex: new RegExp(`^${schoolName.trim()}$`, "i") },
    });
    if (existingSchool) {
      return res.status(400).json({
        success: false,
        message: "A school with this name is already registered",
      });
    }

    // ── Generate school code from name ──────────────────────────
    const code = schoolName
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 5) + Math.floor(Math.random() * 100);

    // ── Create School ───────────────────────────────────────────
    const school = await School.create({
      name: schoolName.trim(),
      code,
      email: email.toLowerCase(),
      phone: phone || "",
      address: { city, country: "Pakistan" },
      plan: "free",
      isActive: true,
      currentSession: "2024-2025",
      stats: {
        totalStudents: approximateStudents ? parseInt(approximateStudents) : 0,
        totalStaff: 1,
        totalClasses: 0,
      },
    });

    // ── Create School Admin User ────────────────────────────────
    const user = await User.create({
      name: adminName.trim(),
      email: email.toLowerCase(),
      password,
      role: "schooladmin",
      school: school._id,
      phone: phone || "",
    });

    // ── Generate JWT Token ──────────────────────────────────────
    const token = user.getSignedToken();

    // ── Populate school info for response ───────────────────────
    const populatedUser = await User.findById(user._id).populate(
      "school",
      "name code logo plan"
    );

    res.status(201).json({
      success: true,
      message: "School registered successfully!",
      token,
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        school: populatedUser.school,
        avatar: populatedUser.avatar,
      },
    });
  } catch (error) {
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `A record with this ${field} already exists`,
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
