// ============================================================
// models/School.js - School (Tenant) Model
// ============================================================
// Each school is a "tenant" in our multi-tenant system.
// Every other resource (students, staff, attendance) references
// a school document via schoolId for data isolation.
// ============================================================

const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema(
    {
        // School's unique name (must be unique across all tenants)
        name: {
            type: String,
            required: [true, "School name is required"],
            unique: true,
            trim: true,
        },

        // Short code used in URLs or references (e.g., "GHS", "CITY-HIGH")
        code: {
            type: String,
            required: [true, "School code is required"],
            unique: true,
            uppercase: true,
            trim: true,
        },

        // Contact details
        email: { type: String, required: true, lowercase: true },
        phone: { type: String },
        website: { type: String },

        // Physical address
        address: {
            street: String,
            city: String,
            state: String,
            zip: String,
            country: { type: String, default: "Pakistan" },
        },

        // School logo URL (store path or cloud URL)
        logo: { type: String, default: "" },

        // Subscription/plan status for SaaS billing
        plan: {
            type: String,
            enum: ["free", "basic", "premium"],
            default: "free",
        },

        // Whether this school account is active
        isActive: { type: Boolean, default: true },

        // Academic year info
        currentSession: { type: String, default: "2024-2025" },

        // Total counts (updated as records are added)
        stats: {
            totalStudents: { type: Number, default: 0 },
            totalStaff: { type: Number, default: 0 },
            totalClasses: { type: Number, default: 0 },
        },
    },
    {
        timestamps: true, // Auto-adds createdAt and updatedAt fields
    }
);

module.exports = mongoose.model("School", schoolSchema);