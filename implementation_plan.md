# Reports & Advanced Analytics Feature — Implementation Plan

## Background

The **Falsfa SaaS** is a multi-tenant school management platform built on:
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Frontend**: React + Vite + Shadcn/UI + Recharts

**Existing Models**: `School`, `Student`, `Staff`, `Attendance`, `ExamResult`, `Fee`, `FeeStructure`, `AuditLog`, `Notification`, `User`

### Current Pain Points
| Area | Gap |
|---|---|
| `analytics.controller.js` | Revenue is hardcoded to `0`; no real aggregations |
| `dashboard.routes.js` | `totalRevenue = activeSchools * 2000` — a placeholder |
| `AnalyticsPage.jsx` | Basic counters only, no drilldowns |
| No Report generation | Zero PDF/downloadable reporting |
| `ExamResult` | No cross-class or subject-wise aggregation |
| `Attendance` | No monthly summary or at-risk student detection |
| `Fee` | No class-wise or month-wise collection rate |

---

## Proposed Features (3 Modules)

### 🟢 Feature 1 — Academic Performance Report (School Admin)
**Route**: `/reports/academic`  
**Who uses it**: School Admin  
**Value**: See class-by-class exam performance, subject pass/fail rates, top performers, and at-risk students in one view.

**Backend aggregation pipelines used**:
- `$group` by `class` + `subject` → avg marks, pass rate, grade distribution
- `$lookup` Student → get student names
- `$facet` → run multiple sub-aggregations in one query
- `$bucket` → group percentage scores into grade bands (A+, A, B, C, D, F)

---

### 🟡 Feature 2 — Attendance Summary Report (School Admin + Teacher)
**Route**: `/reports/attendance`  
**Who uses it**: School Admin, Teacher  
**Value**: Monthly attendance heatmap per class, students below 75% threshold (at-risk), daily trends.

**Backend aggregation pipelines used**:
- `$unwind` on `records[]` → flatten each student-day pair
- `$group` by `student` + month → count present/absent/late
- `$project` to calculate `attendancePercentage`
- `$match` to filter students below threshold
- `$sort` + `$limit` for top absentees list

---

### 🔴 Feature 3 — Financial Health Report (School Admin)
**Route**: `/reports/finance`  
**Who uses it**: School Admin  
**Value**: Month-by-month fee collection rate, class-wise defaulters, revenue breakdown by fee type, overdue trend.

**Backend aggregation pipelines used**:
- `$group` by `month` → collected vs pending vs overdue totals
- `$group` by `class` → defaulter count and outstanding amount
- `$project` with `$subtract` → compute deficit per class
- `$addFields` + `$divide` → collection rate as percentage
- `$sort` by overdue descending → worst defaulters first

---

## Files to Create / Modify

### Backend

---

#### [NEW] `backend/src/controllers/report.controller.js`
Three async functions:
1. `getAcademicReport` — ExamResult aggregation with `$facet` + `$bucket`
2. `getAttendanceReport` — Attendance `$unwind` + `$group` + threshold filter
3. `getFinanceReport` — Fee multi-stage pipeline (monthly + class-wise)

#### [NEW] `backend/src/routes/report.routes.js`
```
GET /api/reports/academic   → schooladmin
GET /api/reports/attendance → schooladmin, teacher
GET /api/reports/finance    → schooladmin
```

#### [MODIFY] `backend/src/server.js`
Mount `/api/reports` route.

---

### Frontend

---

#### [NEW] `frontend/src/features/reports/ReportsPage.jsx`
A tabbed reports hub with three tabs:
- **Academic** — grade distribution pie + subject avg bar chart + top/bottom students table
- **Attendance** — class-wise attendance bar chart + at-risk students list
- **Finance** — monthly collection trend + class-wise defaulters table

#### [MODIFY] `frontend/src/routes/AppRoutes.jsx`
Add `/reports` route restricted to `schooladmin` and `teacher`.

#### [MODIFY] `frontend/src/layouts/MainLayout.jsx`  
Add "Reports" nav item (with `FileText` icon) for schooladmin/teacher.

---

## Aggregation Pipeline Highlights

### Academic Report — Grade Distribution per Subject
```js
ExamResult.aggregate([
  { $match: { school: schoolId, ...(class && { class }) } },
  { $facet: {
    subjectAverages: [
      { $group: { _id: "$subject", avgMarks: { $avg: "$percentage" }, count: { $sum: 1 } } },
      { $sort: { avgMarks: -1 } }
    ],
    gradeDistribution: [
      { $bucket: {
          groupBy: "$percentage",
          boundaries: [0, 50, 60, 70, 80, 90, 101],
          default: "Other",
          output: { count: { $sum: 1 }, label: { $first: "$grade" } }
      }}
    ],
    topStudents: [
      { $group: { _id: "$student", avgPct: { $avg: "$percentage" } } },
      { $sort: { avgPct: -1 } },
      { $limit: 10 },
      { $lookup: { from: "students", localField: "_id", foreignField: "_id", as: "studentInfo" } },
      { $unwind: "$studentInfo" },
      { $project: { name: "$studentInfo.name", rollNo: "$studentInfo.rollNo", avgPct: 1 } }
    ]
  }}
])
```

### Attendance Report — At-Risk Students
```js
Attendance.aggregate([
  { $match: { school: schoolId, date: { $gte: startDate, $lte: endDate } } },
  { $unwind: "$records" },
  { $group: {
      _id: "$records.student",
      totalDays: { $sum: 1 },
      presentDays: { $sum: { $cond: [{ $eq: ["$records.status", "present"] }, 1, 0] } }
  }},
  { $addFields: { attendancePct: { $multiply: [{ $divide: ["$presentDays", "$totalDays"] }, 100] } } },
  { $match: { attendancePct: { $lt: 75 } } },
  { $sort: { attendancePct: 1 } },
  { $lookup: { from: "students", localField: "_id", foreignField: "_id", as: "student" } },
  { $unwind: "$student" },
  { $project: { name: "$student.name", class: "$student.class", rollNo: "$student.rollNo", attendancePct: 1 } }
])
```

### Finance Report — Monthly Collection Rate
```js
Fee.aggregate([
  { $match: { school: schoolId } },
  { $group: {
      _id: "$month",
      totalBilled: { $sum: "$netAmount" },
      collected: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$netAmount", 0] } },
      pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$netAmount", 0] } },
      overdue: { $sum: { $cond: [{ $eq: ["$status", "overdue"] }, "$netAmount", 0] } },
      voucherCount: { $sum: 1 }
  }},
  { $addFields: { collectionRate: { $multiply: [{ $divide: ["$collected", "$totalBilled"] }, 100] } } },
  { $sort: { _id: 1 } }
])
```

---

## Verification Plan

### Backend
- Run `GET /api/reports/academic?class=10` with test data and verify `$facet` returns all three sub-results
- Run `GET /api/reports/attendance?month=May 2025` and confirm at-risk list only includes students < 75%
- Run `GET /api/reports/finance` and confirm `collectionRate` math is correct

### Frontend
- Visit `/reports`, confirm tabs switch correctly
- Confirm charts render with real API data
- Confirm empty states are shown when no data exists

---

## Open Questions

> [!IMPORTANT]
> **Q1: Which month format does the `Fee.month` field use?** (e.g., `"May 2025"` or `"2025-05"`). This affects the finance pipeline's `$sort` key. Looking at the Fee model, it appears to be `"May 2025"` — a human-readable string. The pipeline will sort lexicographically, which may not sort correctly across year boundaries. Should we add a `monthIndex` numeric field, or sort by `dueDate` instead?

> [!NOTE]  
> **Q2: Export to PDF / CSV?** The current plan shows data in the UI. Should I also add a "Download CSV" or "Print Report" button? This can be done purely on the frontend with `jspdf` or `react-to-print` without any backend changes.

> [!NOTE]
> **Q3: Date range filters?** The attendance report needs a date range (e.g., "this month", "last 30 days", "custom range"). The plan includes a `month` query param defaulting to the current month. Should the UI have a full date-range picker?
