// ============================================================
// models/Fee.js - Fee Voucher Per Student Per Month
// ============================================================
// Each document represents one monthly fee voucher for one
// student. Generated in bulk via the fee generation endpoint,
// or created individually (manual voucher with custom discount).
// ============================================================

const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    // Denormalized for fast display without population
    studentName: { type: String, default: "" },
    class:       { type: String, default: "" },

    // e.g. "May 2025" — used as a human-readable period label
    month:        { type: String, required: true },
    academicYear: { type: String, default: "2024-2025" },

    // Fee breakdown (copied from FeeStructure at time of generation)
    tuitionFee: { type: Number, default: 0 },
    examFee:    { type: Number, default: 0 },
    libraryFee: { type: Number, default: 0 },
    miscFee:    { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 }, // sum of all four

    // Discount (for manual vouchers or special cases)
    discount:       { type: Number, default: 0 },
    discountReason: { type: String, default: "" },

    // netAmount = totalAmount - discount
    netAmount: { type: Number, default: 0 },

    dueDate:  { type: Date },
    paidDate: { type: Date, default: null },

    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "bank", "online", ""],
      default: "",
    },

    receiptNo: { type: String, default: "" },
    remarks:   { type: String, default: "" },

    // true if this voucher was created manually (not bulk-generated)
    isManual: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate vouchers for same student + same month
feeSchema.index({ school: 1, student: 1, month: 1 }, { unique: true });
feeSchema.index({ school: 1, status: 1, month: 1 });

module.exports = mongoose.model("Fee", feeSchema);
