// ============================================================
// controllers/report.controller.js
// ============================================================
// Three advanced report generators using MongoDB aggregation
// pipelines ($facet, $bucket, $unwind, $group, $lookup, $addFields).
// All endpoints are scoped to req.schoolId for multi-tenancy.
// ============================================================

const mongoose = require("mongoose");
const ExamResult = require("../models/ExamResult");
const Attendance = require("../models/Attendance");
const Fee = require("../models/Fee");
const Student = require("../models/Student");

// ── Helper: Convert string ObjectId safely ──────────────────
const toObjectId = (id) => new mongoose.Types.ObjectId(id);

// ============================================================
// GET /api/reports/academic
// Query params: class (optional), examType (optional), subject (optional)
// ============================================================
exports.getAcademicReport = async (req, res) => {
  try {
    const schoolId = toObjectId(req.schoolId);

    const matchStage = { school: schoolId };
    if (req.query.class) matchStage.class = req.query.class;
    if (req.query.examType) matchStage.examType = req.query.examType;
    if (req.query.subject) matchStage.subject = req.query.subject.toLowerCase();

    const [reportData] = await ExamResult.aggregate([
      { $match: matchStage },

      {
        $facet: {
          // ── 1. Subject-wise average percentage ─────────────
          subjectAverages: [
            {
              $group: {
                _id: "$subject",
                avgPercentage: { $avg: "$percentage" },
                totalStudents: { $sum: 1 },
                passCount: {
                  $sum: { $cond: [{ $gte: ["$percentage", 50] }, 1, 0] },
                },
              },
            },
            {
              $addFields: {
                passRate: {
                  $multiply: [
                    { $divide: ["$passCount", "$totalStudents"] },
                    100,
                  ],
                },
              },
            },
            { $sort: { avgPercentage: -1 } },
          ],

          // ── 2. Grade distribution bucket ───────────────────
          gradeDistribution: [
            {
              $bucket: {
                groupBy: "$percentage",
                boundaries: [0, 50, 60, 70, 80, 90, 101],
                default: "other",
                output: {
                  count: { $sum: 1 },
                },
              },
            },
            {
              $addFields: {
                gradeBand: {
                  $switch: {
                    branches: [
                      { case: { $eq: ["$_id", 0] }, then: "F (0–49%)" },
                      { case: { $eq: ["$_id", 50] }, then: "D (50–59%)" },
                      { case: { $eq: ["$_id", 60] }, then: "C (60–69%)" },
                      { case: { $eq: ["$_id", 70] }, then: "B (70–79%)" },
                      { case: { $eq: ["$_id", 80] }, then: "A (80–89%)" },
                      { case: { $eq: ["$_id", 90] }, then: "A+ (90–100%)" },
                    ],
                    default: "Other",
                  },
                },
              },
            },
          ],

          // ── 3. Top 10 students by average percentage ───────
          topStudents: [
            {
              $group: {
                _id: "$student",
                avgPercentage: { $avg: "$percentage" },
                examCount: { $sum: 1 },
              },
            },
            { $sort: { avgPercentage: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: "students",
                localField: "_id",
                foreignField: "_id",
                as: "info",
              },
            },
            { $unwind: { path: "$info", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                name: "$info.name",
                rollNo: "$info.rollNo",
                class: "$info.class",
                avgPercentage: { $round: ["$avgPercentage", 1] },
                examCount: 1,
              },
            },
          ],

          // ── 4. Bottom 10 (at-risk) students ────────────────
          atRiskStudents: [
            {
              $group: {
                _id: "$student",
                avgPercentage: { $avg: "$percentage" },
                failCount: {
                  $sum: { $cond: [{ $lt: ["$percentage", 50] }, 1, 0] },
                },
              },
            },
            { $match: { avgPercentage: { $lt: 60 } } },
            { $sort: { avgPercentage: 1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: "students",
                localField: "_id",
                foreignField: "_id",
                as: "info",
              },
            },
            { $unwind: { path: "$info", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                name: "$info.name",
                rollNo: "$info.rollNo",
                class: "$info.class",
                avgPercentage: { $round: ["$avgPercentage", 1] },
                failCount: 1,
              },
            },
          ],

          // ── 5. Class-wise summary ───────────────────────────
          classSummary: [
            {
              $group: {
                _id: "$class",
                avgPercentage: { $avg: "$percentage" },
                totalResults: { $sum: 1 },
                passCount: {
                  $sum: { $cond: [{ $gte: ["$percentage", 50] }, 1, 0] },
                },
              },
            },
            {
              $addFields: {
                passRate: {
                  $multiply: [
                    { $divide: ["$passCount", "$totalResults"] },
                    100,
                  ],
                },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    res.json({ success: true, data: reportData || {} });
  } catch (error) {
    console.error("Academic report error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET /api/reports/attendance
// Query params: class (optional), startDate, endDate, threshold (default 75)
// ============================================================
exports.getAttendanceReport = async (req, res) => {
  try {
    const schoolId = toObjectId(req.schoolId);

    // Default: current month
    const now = new Date();
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const threshold = Number(req.query.threshold) || 75;

    const matchStage = {
      school: schoolId,
      date: { $gte: startDate, $lte: endDate },
    };
    if (req.query.class) matchStage.class = req.query.class;

    const [reportData] = await Attendance.aggregate([
      { $match: matchStage },

      {
        $facet: {
          // ── 1. At-risk students (below threshold) ──────────
          atRiskStudents: [
            { $unwind: "$records" },
            {
              $group: {
                _id: "$records.student",
                totalDays: { $sum: 1 },
                presentDays: {
                  $sum: {
                    $cond: [
                      { $eq: ["$records.status", "present"] },
                      1,
                      0,
                    ],
                  },
                },
                absentDays: {
                  $sum: {
                    $cond: [{ $eq: ["$records.status", "absent"] }, 1, 0],
                  },
                },
                lateDays: {
                  $sum: {
                    $cond: [{ $eq: ["$records.status", "late"] }, 1, 0],
                  },
                },
              },
            },
            {
              $addFields: {
                attendancePct: {
                  $cond: [
                    { $eq: ["$totalDays", 0] },
                    0,
                    {
                      $multiply: [
                        { $divide: ["$presentDays", "$totalDays"] },
                        100,
                      ],
                    },
                  ],
                },
              },
            },
            { $match: { attendancePct: { $lt: threshold } } },
            { $sort: { attendancePct: 1 } },
            { $limit: 20 },
            {
              $lookup: {
                from: "students",
                localField: "_id",
                foreignField: "_id",
                as: "info",
              },
            },
            {
              $unwind: { path: "$info", preserveNullAndEmptyArrays: true },
            },
            {
              $project: {
                name: "$info.name",
                rollNo: "$info.rollNo",
                class: "$info.class",
                attendancePct: { $round: ["$attendancePct", 1] },
                presentDays: 1,
                absentDays: 1,
                lateDays: 1,
                totalDays: 1,
              },
            },
          ],

          // ── 2. Class-wise attendance overview ──────────────
          classSummary: [
            { $unwind: "$records" },
            {
              $group: {
                _id: "$class",
                totalEntries: { $sum: 1 },
                presentCount: {
                  $sum: {
                    $cond: [
                      { $eq: ["$records.status", "present"] },
                      1,
                      0,
                    ],
                  },
                },
                absentCount: {
                  $sum: {
                    $cond: [{ $eq: ["$records.status", "absent"] }, 1, 0],
                  },
                },
                lateCount: {
                  $sum: {
                    $cond: [{ $eq: ["$records.status", "late"] }, 1, 0],
                  },
                },
              },
            },
            {
              $addFields: {
                avgAttendancePct: {
                  $cond: [
                    { $eq: ["$totalEntries", 0] },
                    0,
                    {
                      $multiply: [
                        { $divide: ["$presentCount", "$totalEntries"] },
                        100,
                      ],
                    },
                  ],
                },
              },
            },
            { $sort: { avgAttendancePct: -1 } },
          ],

          // ── 3. Daily trend (count of present vs absent) ─────
          dailyTrend: [
            { $unwind: "$records" },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$date" },
                },
                present: {
                  $sum: {
                    $cond: [
                      { $eq: ["$records.status", "present"] },
                      1,
                      0,
                    ],
                  },
                },
                absent: {
                  $sum: {
                    $cond: [{ $eq: ["$records.status", "absent"] }, 1, 0],
                  },
                },
                late: {
                  $sum: {
                    $cond: [{ $eq: ["$records.status", "late"] }, 1, 0],
                  },
                },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    res.json({
      success: true,
      data: reportData || {},
      meta: { startDate, endDate, threshold },
    });
  } catch (error) {
    console.error("Attendance report error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET /api/reports/finance
// Query params: academicYear (optional, default "2024-2025")
// ============================================================
exports.getFinanceReport = async (req, res) => {
  try {
    const schoolId = toObjectId(req.schoolId);
    const academicYear = req.query.academicYear || "2024-2025";

    const matchStage = { school: schoolId, academicYear };

    const [reportData] = await Fee.aggregate([
      { $match: matchStage },

      {
        $facet: {
          // ── 1. Month-by-month collection trend ─────────────
          monthlyTrend: [
            {
              $group: {
                _id: "$month",
                totalBilled: { $sum: "$netAmount" },
                collected: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "paid"] }, "$netAmount", 0],
                  },
                },
                pending: {
                  $sum: {
                    $cond: [
                      { $eq: ["$status", "pending"] },
                      "$netAmount",
                      0,
                    ],
                  },
                },
                overdue: {
                  $sum: {
                    $cond: [
                      { $eq: ["$status", "overdue"] },
                      "$netAmount",
                      0,
                    ],
                  },
                },
                voucherCount: { $sum: 1 },
                paidCount: {
                  $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] },
                },
              },
            },
            {
              $addFields: {
                collectionRate: {
                  $cond: [
                    { $eq: ["$totalBilled", 0] },
                    0,
                    {
                      $multiply: [
                        { $divide: ["$collected", "$totalBilled"] },
                        100,
                      ],
                    },
                  ],
                },
              },
            },
            // Sort months chronologically by parsing "May 2025" → year*12+month
            { $sort: { _id: 1 } },
          ],

          // ── 2. Class-wise defaulters (pending + overdue) ───
          classWiseDefaulters: [
            {
              $match: { status: { $in: ["pending", "overdue"] } },
            },
            {
              $group: {
                _id: "$class",
                outstandingAmount: { $sum: "$netAmount" },
                defaulterCount: { $sum: 1 },
                overdueAmount: {
                  $sum: {
                    $cond: [
                      { $eq: ["$status", "overdue"] },
                      "$netAmount",
                      0,
                    ],
                  },
                },
              },
            },
            { $sort: { outstandingAmount: -1 } },
          ],

          // ── 3. Fee type breakdown (sum of each component) ──
          feeTypeBreakdown: [
            {
              $group: {
                _id: null,
                totalTuition: { $sum: "$tuitionFee" },
                totalExam: { $sum: "$examFee" },
                totalLibrary: { $sum: "$libraryFee" },
                totalMisc: { $sum: "$miscFee" },
                totalDiscount: { $sum: "$discount" },
                grandTotal: { $sum: "$netAmount" },
              },
            },
          ],

          // ── 4. Overall summary stats ────────────────────────
          overallSummary: [
            {
              $group: {
                _id: null,
                totalVouchers: { $sum: 1 },
                totalBilled: { $sum: "$netAmount" },
                totalCollected: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "paid"] }, "$netAmount", 0],
                  },
                },
                totalPending: {
                  $sum: {
                    $cond: [
                      { $eq: ["$status", "pending"] },
                      "$netAmount",
                      0,
                    ],
                  },
                },
                totalOverdue: {
                  $sum: {
                    $cond: [
                      { $eq: ["$status", "overdue"] },
                      "$netAmount",
                      0,
                    ],
                  },
                },
                paidVouchers: {
                  $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] },
                },
              },
            },
            {
              $addFields: {
                overallCollectionRate: {
                  $cond: [
                    { $eq: ["$totalBilled", 0] },
                    0,
                    {
                      $multiply: [
                        { $divide: ["$totalCollected", "$totalBilled"] },
                        100,
                      ],
                    },
                  ],
                },
              },
            },
          ],

          // ── 5. Top 10 individual defaulters ────────────────
          topDefaulters: [
            {
              $match: { status: { $in: ["pending", "overdue"] } },
            },
            {
              $group: {
                _id: "$student",
                studentName: { $first: "$studentName" },
                class: { $first: "$class" },
                totalOwed: { $sum: "$netAmount" },
                voucherCount: { $sum: 1 },
              },
            },
            { $sort: { totalOwed: -1 } },
            { $limit: 10 },
          ],
        },
      },
    ]);

    res.json({ success: true, data: reportData || {}, meta: { academicYear } });
  } catch (error) {
    console.error("Finance report error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
