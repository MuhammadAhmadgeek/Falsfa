// ============================================================
// models/Attendance.js - Daily Attendance Record Model
// ============================================================
// Records who was present/absent on a specific date.
// One document = one class's attendance for one day.
// ============================================================

const mongoose = require("mongoose");

// Sub-schema for each student's attendance entry
const attendanceRecordSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
    // Attendance status options
    status: {
        type: String,
        enum: ["present", "absent", "late", "excused"],
        default: "present",
    },
    // Optional note (e.g., "sick leave", "doctor appointment")
    note: { type: String, default: "" },
});

const attendanceSchema = new mongoose.Schema(
    {
        // Multi-tenancy: which school
        school: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
        },

        // Which class this attendance is for
        class: { type: String, required: true },
        section: { type: String },

        // The date of attendance (stored without time for easy querying)
        date: {
            type: Date,
            required: true,
        },

        // Teacher who took this attendance
        takenBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        // Array of all students and their status for this day
        records: [attendanceRecordSchema],

        // Subject (optional - for subject-wise attendance)
        subject: { type: String },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate attendance for same class/date
attendanceSchema.index({ school: 1, class: 1, date: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);