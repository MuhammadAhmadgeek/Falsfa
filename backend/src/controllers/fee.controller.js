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
    const filter = { isActive: true };
    if (req.schoolId) filter.school = req.schoolId;

    const structures = await FeeStructure.find(filter).sort({ class: 1 });

    res.json({ success: true, count: structures.length, data: structures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/fees/structures ───────────────────────────────
// Create or update fee structure for a class
exports.upsertFeeStructure = async (req, res) => {
  try {
    const { class: className, section, academicYear, tuitionFee, examFee, libraryFee, miscFee } = req.body;
    const structureId = req.params.id; // For updates, if provided
    const schoolId = req.schoolId;

    const School = require("../models/School");
    const schoolDoc = await School.findById(schoolId);
    const session = academicYear || schoolDoc?.currentSession || "2024-2025";

    let structure;
    
    if (structureId) {
      structure = await FeeStructure.findByIdAndUpdate(
        structureId,
        { section: section || "", tuitionFee, examFee, libraryFee, miscFee, isActive: true },
        { new: true, runValidators: true }
      );
    } else {
      structure = await FeeStructure.findOneAndUpdate(
        { school: schoolId, class: className, section: section || "", academicYear: session },
        { tuitionFee, examFee, libraryFee, miscFee, isActive: true },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );
    }

    res.status(201).json({ success: true, data: structure });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── DELETE /api/fees/structures/:id ─────────────────────────
exports.deleteFeeStructure = async (req, res) => {
  try {
    const structureId = req.params.id;
    const structure = await FeeStructure.findOneAndDelete({ _id: structureId, school: req.schoolId });
    if (!structure) {
      return res.status(404).json({ success: false, message: "Fee structure not found" });
    }
    res.json({ success: true, message: "Fee structure deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/fees/generate ─────────────────────────────────
// Bulk-generate fee vouchers for all classes or a specific class for a given month
exports.generateFees = async (req, res) => {
  try {
    const { class: className, section, month, academicYear, dueDate } = req.body;
    const schoolId = req.schoolId;

    // Get school's current session if academicYear is not provided
    const School = require("../models/School");
    const schoolDoc = await School.findById(schoolId);
    const session = academicYear || schoolDoc?.currentSession || "2024-2025";

    let targetClasses = [];
    if (className === "all") {
      const structures = await FeeStructure.find({ school: schoolId, isActive: true, academicYear: session });
      targetClasses = [...new Set(structures.map(s => s.class))];
    } else {
      targetClasses = [className];
    }

    if (targetClasses.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No active fee structures found for session ${session}. Please define fee structures first.`,
      });
    }

    let totalGenerated = 0;
    let totalExisted = 0;

    for (let currentClass of targetClasses) {
      // 1. Find the most specific fee structure for this class/section
      const actualSection = (section === "all" || !section) ? "" : section;
      
      let structure = await FeeStructure.findOne({
        school: schoolId,
        class: currentClass,
        section: actualSection === "" ? { $in: ["", null, undefined] } : actualSection,
        academicYear: session,
        isActive: true,
      });

      // Fallback to class-level structure if section-specific one not found
      if (!structure && actualSection !== "") {
        structure = await FeeStructure.findOne({
          school: schoolId,
          class: currentClass,
          section: { $in: ["", null, undefined] }, 
          academicYear: session,
          isActive: true,
        });
      }

      // ── SECOND CHANCE: Try alternative class naming (e.g. "10" instead of "Class 10") ──
      if (!structure) {
        const altClass = currentClass.replace(/class\s+/gi, "");
        if (altClass !== currentClass) {
          structure = await FeeStructure.findOne({
            school: schoolId,
            class: altClass,
            section: actualSection === "" ? { $in: ["", null, undefined] } : actualSection,
            academicYear: session,
            isActive: true,
          });
          if (!structure && actualSection !== "") {
            structure = await FeeStructure.findOne({
              school: schoolId,
              class: altClass,
              section: { $in: ["", null, undefined] }, 
              academicYear: session,
              isActive: true,
            });
          }
        }
      }

      if (!structure) {
         continue; // skip if no structure defined yet
      }

      const total = structure.tuitionFee + structure.examFee + structure.libraryFee + structure.miscFee;

      // 2. Get students in this class (+ section if specified)
      const studentFilter = {
        school: schoolId,
        class: currentClass,
        isActive: true,
      };
      if (section && section !== "all") {
        studentFilter.section = section;
      }

      const students = await Student.find(studentFilter).select("_id name section");

      if (students.length === 0) {
        continue;
      }

      // 3. Build voucher documents, skip if already exists
      const existingVouchers = await Fee.find({
        school: schoolId,
        month,
        student: { $in: students.map((s) => s._id) },
      }).select("student");

      const existingStudentIds = new Set(existingVouchers.map((v) => v.student.toString()));
      totalExisted += existingStudentIds.size;

      const newVouchers = students
        .filter((s) => !existingStudentIds.has(s._id.toString()))
        .map((s) => ({
          school:      schoolId,
          student:     s._id,
          studentName: s.name,
          class:       currentClass,
          section:     s.section || "",
          month,
          academicYear: session,
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

      if (newVouchers.length > 0) {
        await Fee.insertMany(newVouchers);
        totalGenerated += newVouchers.length;
      }
    }

    if (totalGenerated === 0) {
      return res.status(409).json({
        success: false,
        message: `No new fee vouchers generated. Vouchers might already exist or fee structures might be missing.`,
      });
    }

    await logAction(req.user, {
      action:      "FEE_GENERATED",
      entity:      "Fee",
      entityName:  className === "all" ? `All Classes — ${month}` : `Class ${className} — ${month}`,
      school:      schoolId,
      description: `Fee vouchers generated for ${totalGenerated} students in ${className === "all" ? 'All Classes' : `Class ${className}`} for ${month}`,
    });

    res.status(201).json({
      success: true,
      message: `${totalGenerated} fee vouchers generated (${totalExisted} already existed)`,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── GET /api/fees ────────────────────────────────────────────
// List vouchers with optional filters: class, month, status, studentId
exports.getFees = async (req, res) => {
  try {
    const filter = {};
    if (req.schoolId) filter.school = req.schoolId;

    if (req.query.class)     filter.class   = req.query.class;
    if (req.query.section)   filter.section = req.query.section;
    if (req.query.month)     filter.month   = req.query.month;
    if (req.query.status)    filter.status  = req.query.status;
    if (req.query.studentId) filter.student = req.query.studentId;

    const fees = await Fee.find(filter)
      .populate("student", "name rollNo class section")
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
    const mongoose = require('mongoose');
    const filter = {};
    if (req.schoolId) filter.school = new mongoose.Types.ObjectId(req.schoolId);
    if (req.query.month) filter.month = req.query.month;
    if (req.query.class) filter.class = req.query.class;
    if (req.query.section) filter.section = req.query.section;

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

// ── GET /api/fees/voucher/:id ──────────────────────────────
exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Fee.findById(req.params.id)
      .populate("student", "name rollNo class section")
      .populate("school", "name logo address phone");
    
    if (!voucher) return res.status(404).json({ success: false, message: "Voucher not found" });
    
    res.json({ success: true, data: voucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/fees/my-status ──────────────────────────────────
exports.getMyFeeStatus = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id, school: req.schoolId });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student record not found" });
    }

    const fees = await Fee.find({
      school: req.schoolId,
      student: student._id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: fees.length, data: fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
