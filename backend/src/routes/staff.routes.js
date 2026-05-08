// routes/staff.routes.js - Staff Management Routes

// POST /api/attendance          → Mark attendance for a class
// GET  /api/attendance          → Get attendance records (with filters)
// GET  /api/attendance/summary  → Class-wise summary for a date range

const express = require("express");
const router = express.Router();
const { protect, authorize, tenantGuard } = require("../middleware/auth");
const {
  getAllStaff,
  createStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} = require("../controllers/staff.controller");

router.use(protect, tenantGuard);

// ── GET all staff ─────────────────────────────────────────────
router.get("/", getAllStaff);

// ── POST add new staff member ─────────────────────────────────
router.post("/", authorize("superadmin", "schooladmin"), createStaff);

// ── GET single staff member ───────────────────────────────────
router.get("/:id", getStaffById);

// ── PUT update staff ──────────────────────────────────────────
router.put("/:id", authorize("superadmin", "schooladmin"), updateStaff);

// ── DELETE staff ──────────────────────────────────────────────
router.delete("/:id", authorize("superadmin", "schooladmin"), deleteStaff);

module.exports = router;
