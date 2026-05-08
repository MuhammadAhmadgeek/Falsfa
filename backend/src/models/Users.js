// ============================================================
// models/User.js - User Account Model
// ============================================================
// Handles ALL user types in the system via the "role" field:
//   superadmin  → Manages all schools (platform owner)
//   schooladmin → Manages a single school
//   teacher     → Manages classes and attendance
//   student     → Can view their own data
//   parent      → Can view their child's data
// ============================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
            select: false, // Never return password in queries by default
        },

        // Role determines what the user can see and do
        role: {
            type: String,
            enum: ["superadmin", "schooladmin", "teacher", "student", "parent"],
            default: "teacher",
        },

        // Which school this user belongs to (null for superadmin)
        school: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            default: null,
        },

        // Profile picture URL
        avatar: { type: String, default: "" },

        // Contact info
        phone: { type: String },

        // Whether this account is active (admins can deactivate users)
        isActive: { type: Boolean, default: true },

        // For password reset functionality
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    {
        timestamps: true,
    }
);

// ── Pre-save Hook: Hash Password ──────────────────────────────
// Automatically hashes the password before saving to DB.
// This runs whenever a user document is saved/updated.
userSchema.pre("save", async function (next) {
    // Only hash if password was actually changed
    if (!this.isModified("password")) return next();

    // Hash with salt rounds = 10 (higher = more secure but slower)
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ── Instance Method: Generate JWT ────────────────────────────
// Called on a user instance to generate their auth token
// Example: const token = user.getSignedToken();
userSchema.methods.getSignedToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role, school: this.school },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );
};

// ── Instance Method: Compare Password ────────────────────────
// Compares a plain-text password with the hashed one in DB
// Example: const isMatch = await user.matchPassword(enteredPassword);
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);