// ============================================================
// models/FeeStructure.js - Fee Configuration Per Class
// ============================================================
// School admin defines the fee breakdown for each class once.
// When generating monthly fee vouchers, the system reads this
// structure to populate the fee amounts.
// ============================================================

const mongoose = require("mongoose");

const feeStructureSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    // Class identifier e.g. "1", "2", "10", "KG", "Nursery"
    class: {
      type: String,
      required: [true, "Class is required"],
      trim: true,
    },

    academicYear: {
      type: String,
      default: "2024-2025",
    },

    // The four fee components
    tuitionFee:  { type: Number, default: 0, min: 0 },
    examFee:     { type: Number, default: 0, min: 0 },
    libraryFee:  { type: Number, default: 0, min: 0 },
    miscFee:     { type: Number, default: 0, min: 0 },

    // Whether this structure is still active
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: compute total automatically
feeStructureSchema.virtual("totalFee").get(function () {
  return (
    (this.tuitionFee || 0) +
    (this.examFee || 0) +
    (this.libraryFee || 0) +
    (this.miscFee || 0)
  );
});

// One fee structure per class per academic year per school
feeStructureSchema.index(
  { school: 1, class: 1, academicYear: 1 },
  { unique: true }
);

module.exports = mongoose.model("FeeStructure", feeStructureSchema);
