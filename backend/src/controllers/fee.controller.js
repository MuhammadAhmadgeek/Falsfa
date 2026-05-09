// ============================================================
// controllers/fee.controller.js
// ============================================================

const Fee          = require("../models/Fee");
const FeeStructure = require("../models/FeeStructure");
const Student      = require("../models/Student");
const { logAction } = require("../utils/auditLogger");

// ── GET /api/fees/structures ────────────────────────────────
exports.getFeeStructures = async (req, res) => {
  try {
    const structures = await FeeStructure.find({
      school: req.schoolId,
      isActive: true,
    }).sort({ class: 1 });

    res.json({ success: true, count: structures.length, data: structures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/fees/structures ───────────────────────────────
// Create or update fee structure for a class
exports.upsertFeeStructure = async (req, res) => {
  try {
    const { class: className, academicYear, tuitionFee, examFee, libraryFee, miscFee } = req.body;
    const schoolId = req.schoolId;

    const structure = await FeeStructure.findOneAndUpdate(
      { school: schoolId, class: className, academicYear: academicYear || "2024-2025" },
      { tuitionFee, examFee, libraryFee, miscFee, isActive: true },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, data: structure });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── POST /api/fees/generate ─────────────────────────────────
// Bulk-generate fee vouchers for all students in a class for a given month
exports.generateFees = async (req, res) => {
  try {
    const { class: className, month, academicYear, dueDate } = req.body;
    const schoolId = req.schoolId;

    // 1. Find the fee structure for this class
    const structure = await FeeStructure.findOne({
      school: schoolId,
      class: className,
      academicYear: academicYear || "2024-2025",
      isActive: true,
    });

    if (!structure) {
      return res.status(404).json({
        success: false,
        message: `No fee structure found for Class ${className}. Please set it up first.`,
      });
    }

    const total = structure.tuitionFee + structure.examFee + structure.libraryFee + structure.miscFee;

    // 2. Get all active students in this class
    const students = await Student.find({
      school: schoolId,
      class: className,
      isActive: true,
    }).select("_id name");

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: `No active students found in Class ${className}` });
    }

    // 3. Build voucher documents, skip if already exists
    const existingVouchers = await Fee.find({
      school: schoolId,
      month,
      student: { $in: students.map((s) => s._id) },
    }).select("student");

    const existingStudentIds = new Set(existingVouchers.map((v) => v.student.toString()));

    const newVouchers = students
      .filter((s) => !existingStudentIds.has(s._id.toString()))
      .map((s) => ({
        school:      schoolId,
        student:     s._id,
        studentName: s.name,
        class:       className,
        month,
        academicYear: academicYear || "2024-2025",
        tuitionFee:  structure.tuitionFee,
        examFee:     structure.examFee,
        libraryFee:  structure.libraryFee,
        miscFee:     structure.miscFee,
        totalAmount: total,
        discount:    0,
        netAmount:   total,
        dueDate:     dueDate ? new Date(dueDate) : null,
        status:      "pending",
      }));

    if (newVouchers.length === 0) {
      return res.status(409).json({
        success: false,
        message: `Fee vouchers for Class ${className} — ${month} already exist for all students.`,
      });
    }

    await Fee.insertMany(newVouchers);

    await logAction(req.user, {
      action:      "FEE_GENERATED",
      entity:      "Fee",
      entityName:  `Class ${className} — ${month}`,
      school:      schoolId,
      description: `Fee vouchers generated for ${newVouchers.length} students in Class ${className} for ${month}`,
    });

    res.status(201).json({
      success: true,
      message: `${newVouchers.length} fee vouchers generated (${existingStudentIds.size} already existed)`,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── GET /api/fees ────────────────────────────────────────────
// List vouchers with optional filters: class, month, status, studentId
exports.getFees = async (req, res) => {
  try {
    const filter = { school: req.schoolId };

    if (req.query.class)     filter.class   = req.query.class;
    if (req.query.month)     filter.month   = req.query.month;
    if (req.query.status)    filter.status  = req.query.status;
    if (req.query.studentId) filter.student = req.query.studentId;

    const fees = await Fee.find(filter)
      .populate("student", "name rollNo class")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: fees.length, data: fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/fees ───────────────────────────────────────────
// Create a manual voucher (with optional discount)
exports.createManualFee = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const {
      studentId, class: className, month, academicYear,
      tuitionFee = 0, examFee = 0, libraryFee = 0, miscFee = 0,
      discount = 0, discountReason, dueDate, remarks,
    } = req.body;

    const student = await Student.findById(studentId).select("name");
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const totalAmount = tuitionFee + examFee + libraryFee + miscFee;
    const netAmount   = totalAmount - discount;

    const fee = await Fee.create({
      school: schoolId,
      student: studentId,
      studentName: student.name,
      class: className,
      month,
      academicYear: academicYear || "2024-2025",
      tuitionFee, examFee, libraryFee, miscFee,
      totalAmount,
      discount,
      discountReason: discountReason || "",
      netAmount,
      dueDate: dueDate ? new Date(dueDate) : null,
      remarks: remarks || "",
      isManual: true,
    });

    await logAction(req.user, {
      action:      "FEE_VOUCHER_CREATED",
      entity:      "Fee",
      entityId:    fee._id,
      entityName:  student.name,
      school:      schoolId,
      description: `Manual fee voucher created for ${student.name} — ${month} (Net: PKR ${netAmount}${discount > 0 ? `, Discount: PKR ${discount}` : ""})`,
    });

    res.status(201).json({ success: true, data: fee });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── PUT /api/fees/:id ────────────────────────────────────────
// Update a voucher — mark as paid, add discount, etc.
exports.updateFee = async (req, res) => {
  try {
    const { status, paidDate, paymentMethod, receiptNo, discount, discountReason, remarks } = req.body;

    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ success: false, message: "Fee record not found" });

    if (status)         fee.status = status;
    if (paidDate)       fee.paidDate = new Date(paidDate);
    if (paymentMethod)  fee.paymentMethod = paymentMethod;
    if (receiptNo)      fee.receiptNo = receiptNo;
    if (remarks)        fee.remarks = remarks;

    // Recalculate net if discount changes
    if (discount !== undefined) {
      fee.discount       = discount;
      fee.discountReason = discountReason || fee.discountReason;
      fee.netAmount      = fee.totalAmount - discount;
    }

    await fee.save();

    if (status === "paid") {
      await logAction(req.user, {
        action:      "FEE_PAID",
        entity:      "Fee",
        entityId:    fee._id,
        entityName:  fee.studentName,
        school:      fee.school,
        description: `Fee payment of PKR ${fee.netAmount} received from ${fee.studentName} for ${fee.month}`,
      });
    }

    res.json({ success: true, data: fee });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── GET /api/fees/summary ────────────────────────────────────
exports.getFeeSummary = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const filter   = { school: schoolId };
    if (req.query.month) filter.month = req.query.month;

    const [totalCollected, totalPending, totalOverdue] = await Promise.all([
      Fee.aggregate([{ $match: { ...filter, status: "paid" } },   { $group: { _id: null, total: { $sum: "$netAmount" } } }]),
      Fee.aggregate([{ $match: { ...filter, status: "pending" } }, { $group: { _id: null, total: { $sum: "$netAmount" } } }]),
      Fee.aggregate([{ $match: { ...filter, status: "overdue" } }, { $group: { _id: null, total: { $sum: "$netAmount" } } }]),
    ]);

    res.json({
      success: true,
      data: {
        collected: totalCollected[0]?.total || 0,
        pending:   totalPending[0]?.total   || 0,
        overdue:   totalOverdue[0]?.total   || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/fees/student/:studentId ────────────────────────
exports.getStudentFees = async (req, res) => {
  try {
    const fees = await Fee.find({
      school:  req.schoolId,
      student: req.params.studentId,
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: fees.length, data: fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
