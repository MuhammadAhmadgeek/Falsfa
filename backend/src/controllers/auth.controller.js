const User = require("../models/User");
const School = require("../models/School");

// ── Register ──────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, schoolId } = req.body;

    // Only superadmin can create schooladmin accounts
    if (role === "schooladmin" && req.user.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Only superadmin can create school admins" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Use the requester's school if not superadmin
    const school = req.user.role === "superadmin" ? schoolId : req.user.school;

    const user = await User.create({ name, email, password, role, school });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Login ─────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    // Find user and explicitly select password (hidden by default)
    const user = await User.findOne({ email }).select("+password").populate("school", "name code logo");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: "Account is deactivated" });
    }

    // Compare entered password with hashed password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = user.getSignedToken();

    res.json({
      success: true,
      token,
      user: {
        id:     user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        school: user.school,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Current User ──────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("school", "name code logo plan");
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Change Password ───────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save(); // Pre-save hook will hash the new password

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update Profile ────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const allowedUpdates = {};
    if (name)   allowedUpdates.name   = name;
    if (phone)  allowedUpdates.phone  = phone;
    if (avatar) allowedUpdates.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      allowedUpdates,
      { new: true, runValidators: true }
    ).populate("school", "name code logo plan");

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};