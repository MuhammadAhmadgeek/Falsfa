// ============================================================
// models/Notification.js - User Notifications
// ============================================================
// Auto-generated notifications triggered by system actions.
// Each notification targets a specific user (school admin or
// super admin depending on the action).
// ============================================================

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // The user who receives this notification
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // School context (null for superadmin platform notifications)
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      default: null,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    // Visual type for icon/color rendering in the UI
    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },

    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Index for efficient per-user queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
