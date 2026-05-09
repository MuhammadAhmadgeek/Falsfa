// routes/auth.routes.js - Authentication Routes

// POST /api/auth/register  → Register a new user
// POST /api/auth/login     → Login and get JWT token
// GET  /api/auth/me        → Get current logged-in user
// PUT  /api/auth/password  → Change password


const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  register,
  login,
  getMe,
  changePassword,
  updateProfile,
} = require("../controllers/auth.controller");

// ── Register ──────────────────────────────────────────────────
// Creates a new user account. School admins can register teachers.
router.post("/register", protect, register);

// ── Login ─────────────────────────────────────────────────────
// Verifies credentials and returns a JWT token
router.post("/login", login);

// ── Get Current User ──────────────────────────────────────────
// Returns the profile of the currently logged-in user
router.get("/me", protect, getMe);

// ── Change Password ───────────────────────────────────────────
router.put("/password", protect, changePassword);

// ── Update Profile ────────────────────────────────────────────
router.put("/profile", protect, updateProfile);

module.exports = router;