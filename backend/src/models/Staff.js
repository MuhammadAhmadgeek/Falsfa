// ============================================================
// models/Staff.js - Staff/Employee Model
// ============================================================
// Covers all non-student employees: teachers, admin staff, etc.
// Also tied to a school for multi-tenancy isolation.
// ============================================================

const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
    {
        // Link to the User account (required for login)
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Multi-tenancy: which school this staff member belongs to
        school: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
        },

        // Personal Info
        name: { type: String, required: true },
        employeeId: { type: String, required: true }, // Unique within school
        gender: { type: String, enum: ["male", "female", "other"] },
        dob: { type: Date },
        photo: { type: String, default: "" },
        phone: { type: String },
        address: { type: String },

        // Job Details
        designation: {
            type: String,
            enum: ["teacher", "principal", "vice-principal", "librarian", "accountant", "peon", "guard", "other"],
            default: "teacher",
        },

        // Subjects taught (for teachers)
        subjects: [{ type: String }],

        // Classes assigned (for teachers)
        classes: [{ type: String }],

        // Employment Details
        joinDate: { type: Date, default: Date.now },
        salary: { type: Number },
        salaryType: { type: String, enum: ["monthly", "hourly"], default: "monthly" },
        qualification: { type: String },
        experience: { type: Number }, // in years

        // Status
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

// Ensure employeeId is unique within a school
staffSchema.index({ school: 1, employeeId: 1 }, { unique: true });

module.exports = mongoose.model("Staff", staffSchema);