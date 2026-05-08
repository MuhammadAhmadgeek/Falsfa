const mongoose = require("mongoose");

const examResultSchema = new mongoose.Schema(
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
    class: { type: String, required: true },
    section: { type: String },
    examType: {
      type: String,
      enum: ["midterm", "final", "quiz"],
      required: true,
    },
    subject: { type: String, required: true },
    marksObtained: { type: Number, required: true, min: 0 },
    maxMarks: { type: Number, required: true, min: 1 },
    percentage: { type: Number },
    grade: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

examResultSchema.pre("save", function (next) {
  this.percentage = Math.round((this.marksObtained / this.maxMarks) * 100 * 100) / 100;
  if (this.percentage >= 90) this.grade = "A+";
  else if (this.percentage >= 80) this.grade = "A";
  else if (this.percentage >= 70) this.grade = "B";
  else if (this.percentage >= 60) this.grade = "C";
  else if (this.percentage >= 50) this.grade = "D";
  else this.grade = "F";
  next();
});

examResultSchema.index({ school: 1, class: 1, examType: 1, subject: 1 });

module.exports = mongoose.model("ExamResult", examResultSchema);
