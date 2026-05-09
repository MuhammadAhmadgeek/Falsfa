// ============================================================
// models/AuditLog.js - Audit Trail for Admin Actions
// ============================================================
// Tracks every meaningful action performed by superadmin and
// schooladmin. Used for the "Recent Activity" dashboard feed
// and dedicated audit log views.
// ============================================================

const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    // Who performed the action
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actorName: { type: String, required: true },
    actorRole: {
      type: String,
      enum: ["superadmin", "schooladmin", "teacher"],
      required: true,
    },

    // Which school this action belongs to (null for platform-level superadmin actions)
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      default: null,
    },

    // Action type — used for icon mapping and filtering
    action: {
      type: String,
      required: true,
      // e.g. SCHOOL_CREATED, SCHOOL_DELETED, SCHOOL_TOGGLED,
      //       STUDENT_ADDED, STUDENT_REMOVED, STUDENT_UPDATED,
      //       STAFF_ADDED, STAFF_REMOVED, STAFF_UPDATED,
      //       FEE_GENERATED, FEE_PAID, FEE_VOUCHER_CREATED
    },

    // What kind of resource was affected
    entity: {
      type: String,
      enum: ["School", "Student", "Staff", "Fee", "Exam", "Attendance"],
      required: true,
    },

    // ID of the affected document (for linking if needed)
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },

    // Human-readable name of the affected resource
    entityName: { type: String, default: "" },

    // Full human-readable description of the action
    description: { type: String, required: true },
  },
  {
    timestamps: true, // createdAt used as the log timestamp
  }
);

// Index for efficient querying by school and time
auditLogSchema.index({ school: 1, createdAt: -1 });
auditLogSchema.index({ actorRole: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
