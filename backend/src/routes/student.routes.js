
// routes/student.routes.js - Student CRUD Routes

// GET    /api/students          → Get all students (scoped to school)
// POST   /api/students          → Add a new student
// GET    /api/students/:id      → Get single student details
// PUT    /api/students/:id      → Update student info
// DELETE /api/students/:id      → Remove a student
// GET    /api/students/:id/attendance → Get student attendance summary


const express = require("express");
const router = express.Router();
const { protect, authorize, tenantGuard } = require("../middleware/auth");
const {getAllStudents,
    addStudent,
    getStudentById,
    updateStudentById,
    deleteStudentById,
    getAttendanceSummary
} = require("../controllers/student.controller");

router.use(protect, tenantGuard);

// ── GET all students (filtered by school automatically) ───────
router.get("/", getAllStudents);

// ── POST add new student ──────────────────────────────────────
router.post("/", authorize("superadmin", "schooladmin"), addStudent);

// ── GET single student ────────────────────────────────────────
router.get("/:id", getStudentById);

// ── PUT update student ────────────────────────────────────────
router.put("/:id", authorize("superadmin", "schooladmin"), updateStudentById);

// ── DELETE student ────────────────────────────────────────────
router.delete("/:id", authorize("superadmin", "schooladmin"), );

// ── GET student attendance summary ───────────────────────────
router.get("/:id/attendance", getAttendanceSummary);

module.exports = router;