// ============================================================
// utils/auditLogger.js - Reusable Audit Log + Notification Helper
// ============================================================
// Call logAction() from any controller to:
//   1. Write an entry to the AuditLog collection
//   2. Auto-create a Notification for the relevant admin
//
// Usage:
//   await logAction(req.user, {
//     action:     'STUDENT_ADDED',
//     entity:     'Student',
//     entityId:   student._id,
//     entityName: student.name,
//     school:     req.schoolId,
//     description: `Student "${student.name}" was added to Class ${student.class}`,
//   });
// ============================================================

const AuditLog    = require("../models/AuditLog");
const Notification = require("../models/Notification");
const User        = require("../models/User");

// Map action types to notification config
const ACTION_NOTIFICATION_MAP = {
  // School-level events → notify superadmin
  SCHOOL_CREATED:  { title: "New School Registered", type: "success", notifyRole: "superadmin" },
  SCHOOL_DELETED:  { title: "School Removed",         type: "warning", notifyRole: "superadmin" },
  SCHOOL_TOGGLED:  { title: "School Status Changed",  type: "info",    notifyRole: "superadmin" },
  // Student events → notify schooladmin of that school
  STUDENT_ADDED:   { title: "New Student Enrolled",   type: "success", notifyRole: "schooladmin" },
  STUDENT_REMOVED: { title: "Student Removed",        type: "warning", notifyRole: "schooladmin" },
  STUDENT_UPDATED: { title: "Student Record Updated", type: "info",    notifyRole: "schooladmin" },
  // Staff events → notify schooladmin of that school
  STAFF_ADDED:     { title: "New Staff Member Added", type: "success", notifyRole: "schooladmin" },
  STAFF_REMOVED:   { title: "Staff Member Removed",   type: "warning", notifyRole: "schooladmin" },
  STAFF_UPDATED:   { title: "Staff Record Updated",   type: "info",    notifyRole: "schooladmin" },
  // Fee events → notify schooladmin
  FEE_GENERATED:   { title: "Fee Vouchers Generated", type: "info",    notifyRole: "schooladmin" },
  FEE_PAID:        { title: "Fee Payment Received",   type: "success", notifyRole: "schooladmin" },
  FEE_VOUCHER_CREATED: { title: "Manual Voucher Created", type: "info", notifyRole: "schooladmin" },
};

/**
 * logAction - Creates an AuditLog entry and auto-notifies the relevant admin.
 *
 * @param {Object} actor     - req.user (the logged-in user performing the action)
 * @param {Object} options
 * @param {string} options.action       - Action constant e.g. 'STUDENT_ADDED'
 * @param {string} options.entity       - Entity type e.g. 'Student'
 * @param {ObjectId} options.entityId   - ID of affected document
 * @param {string} options.entityName   - Display name of affected document
 * @param {ObjectId} options.school     - School ObjectId (null for superadmin actions)
 * @param {string} options.description  - Human-readable log message
 */
const logAction = async (actor, { action, entity, entityId, entityName, school, description }) => {
  try {
    // 1. Write audit log
    await AuditLog.create({
      actor:       actor._id,
      actorName:   actor.name,
      actorRole:   actor.role,
      school:      school || null,
      action,
      entity,
      entityId:    entityId || null,
      entityName:  entityName || "",
      description,
    });

    // 2. Determine who to notify
    const notifConfig = ACTION_NOTIFICATION_MAP[action];
    if (!notifConfig) return; // No notification configured for this action

    let recipientQuery = { role: notifConfig.notifyRole, isActive: true };

    // Don't notify the actor themselves
    // For school-level actions, only notify admins of that school
    if (notifConfig.notifyRole === "schooladmin" && school) {
      recipientQuery.school = school;
    }

    const recipients = await User.find(recipientQuery).select("_id");

    if (recipients.length === 0) return;

    // 3. Create notification for each recipient (usually just one admin)
    const notifications = recipients.map((r) => ({
      user:    r._id,
      school:  school || null,
      title:   notifConfig.title,
      message: description,
      type:    notifConfig.type,
    }));

    await Notification.insertMany(notifications);
  } catch (err) {
    // Never let logging errors crash the main request
    console.error("[auditLogger] Error:", err.message);
  }
};

module.exports = { logAction };
