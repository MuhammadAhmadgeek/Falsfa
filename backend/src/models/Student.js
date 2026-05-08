// ============================================================
// models/Student.js - Student Profile Model
// ============================================================
// Stores academic and personal info for each student.
// Each student belongs to ONE school (multi-tenancy via `school`).
// ============================================================

const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        // Link to the User account (for login if student has access)
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // ── Multi-tenancy key ─────────────────────────────────────
        // EVERY query MUST filter by this field to isolate school data
        school: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
        },

        // Basic Info
        name: { type: String, required: true, trim: true },
        rollNo: { type: String, required: true }, // Unique within a school
        gender: { type: String, enum: ["male", "female", "other"] },
        dob: { type: Date },
        bloodGroup: { type: String },
        photo: { type: String, default: "" },

        // Academic Info
        class: { type: String, required: true }, // e.g., "10-A", "Grade 5"
        section: { type: String },
        session: { type: String, default: "2024-2025" },
        admissionDate: { type: Date, default: Date.now },

        // Contact Info
        address: { type: String },
        phone: { type: String },
        email: { type: String },

        // Parent/Guardian Info
        parentName: { type: String },
        parentPhone: { type: String },
        parentEmail: { type: String },
        relationship: { type: String, default: "Father" },

        // Status
        isActive: { type: Boolean, default: true },
        feeStatus: { type: String, enum: ["paid", "pending", "partial"], default: "pending" },
    },
    {
        timestamps: true,
        // Virtual field: calculate attendance % from Attendance model
    }
);

// ── Compound Index ────────────────────────────────────────────
// Ensures rollNo is unique per school (not globally)
studentSchema.index({ school: 1, rollNo: 1 }, { unique: true });

module.exports = mongoose.model("Student", studentSchema);