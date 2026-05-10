// seed.js - Populate database with demo data
// Run: node src/seed.js

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const School = require("./models/School");
const Student = require("./models/Student");
const Staff = require("./models/Staff");
const FeeStructure = require("./models/FeeStructure");
const Fee = require("./models/Fee");
const Attendance = require("./models/Attendance");
const ExamResult = require("./models/ExamResult");
const AuditLog = require("./models/AuditLog");

const connectDB = require("./config/db");

const STUDENTS_DATA = [
  "Ali Hassan", "Fatima Khan", "Ahmad Raza", "Ayesha Malik", "Omar Farooq",
  "Zainab Ali", "Hassan Ahmed", "Maryam Shah", "Usman Tariq", "Sana Noor",
  "Bilal Hussain", "Hira Saeed", "Kamran Yousuf", "Rabia Anwar", "Imran Abbas",
  "Nadia Pervez", "Salman Haider", "Amna Riaz", "Faisal Iqbal", "Nimra Ashraf",
];

async function seed() {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    School.deleteMany({}),
    Student.deleteMany({}),
    Staff.deleteMany({}),
    FeeStructure.deleteMany({}),
    Fee.deleteMany({}),
    Attendance.deleteMany({}),
    ExamResult.deleteMany({}),
    AuditLog.deleteMany({})
  ]);

  console.log("🗑️  Cleared existing data");

  // Create schools
  const school1 = await School.create({
    name: "Green Valley Academy",
    code: "GVA",
    email: "info@greenvalley.edu",
    phone: "+92-300-1234567",
    address: { street: "123 Education Lane", city: "Islamabad", state: "ICT", country: "Pakistan" },
    plan: "premium",
    isActive: true,
    currentSession: "2024-2025",
    stats: { totalStudents: 40, totalStaff: 2, totalClasses: 10 }
  });

  const school2 = await School.create({
    name: "Sunrise International School",
    code: "SIS",
    email: "info@sunrise.edu",
    phone: "+92-321-7654321",
    address: { street: "456 Knowledge Rd", city: "Lahore", state: "Punjab", country: "Pakistan" },
    plan: "basic",
    isActive: true,
    currentSession: "2024-2025",
  });

  console.log("🏫 Created schools:", school1.name, school2.name);

  // Create users
  const superadmin = await User.create({
    name: "Platform Admin",
    email: "super@falsfa.com",
    password: "admin123",
    role: "superadmin",
    school: null,
  });

  const schooladmin = await User.create({
    name: "Dr. Ahmad Khan",
    email: "admin@greenvalley.edu",
    password: "admin123",
    role: "schooladmin",
    school: school1._id,
  });

  const teacherUser = await User.create({
    name: "Ms. Sarah Ali",
    email: "sarah@greenvalley.edu",
    password: "admin123",
    role: "teacher",
    school: school1._id,
  });

  const studentUser = await User.create({
    name: "Ali Hassan",
    email: "ali@greenvalley.edu",
    password: "admin123",
    role: "student",
    school: school1._id,
  });

  console.log("👤 Created users: superadmin, schooladmin, teacher, student");

  // Create Staff
  const teacherStaff = await Staff.create({
    user: teacherUser._id,
    school: school1._id,
    name: teacherUser.name,
    employeeId: "EMP-001",
    designation: "teacher",
    assignments: [
      { class: "Class 10", section: "A", subjects: ["Mathematics", "Physics"] },
      { class: "Class 9", section: "A", subjects: ["Mathematics"] }
    ],
    isActive: true
  });

  // Create students for school1
  const sections = ["A", "B", "C"];
  const classes = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];

  const studentDocs = [];
  for (let i = 0; i < 40; i++) {
    const name = STUDENTS_DATA[i % STUDENTS_DATA.length] + (i >= 20 ? " Jr" : "");
    const cls = classes[Math.floor(i / 4) % classes.length];
    const sec = sections[i % 3];
    studentDocs.push({
      school: school1._id,
      user: i === 0 ? studentUser._id : null, // Link first student to user
      name: name,
      rollNo: `RN-2024-${String(i + 1).padStart(3, "0")}`,
      gender: i % 2 === 0 ? "male" : "female",
      class: cls,
      section: sec,
      session: "2024-2025",
      admissionDate: new Date(2024, 0, 15),
      parentName: `Parent of ${name}`,
      parentPhone: `+92-3${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`,
      email: `student${i + 1}@greenvalley.edu`,
      isActive: true,
      feeStatus: ["paid", "pending", "partial"][i % 3],
    });
  }

  const insertedStudents = await Student.insertMany(studentDocs);
  console.log(`📚 Created ${insertedStudents.length} students`);

  // Create FeeStructures
  await FeeStructure.create([
    { school: school1._id, class: "Class 9", academicYear: "2024-2025", tuitionFee: 5000, examFee: 1000, libraryFee: 500, miscFee: 200 },
    { school: school1._id, class: "Class 10", academicYear: "2024-2025", tuitionFee: 6000, examFee: 1500, libraryFee: 500, miscFee: 300 }
  ]);

  // Create Fees (Vouchers)
  const feeDocs = [];
  const months = ["January 2025", "February 2025", "March 2025", "April 2025", "May 2025"];
  insertedStudents.forEach((student, i) => {
    months.forEach((month, mIndex) => {
      // Create some variation
      let status = "paid";
      if (mIndex === 4) status = ["paid", "pending", "overdue"][i % 3]; // May
      if (mIndex === 3 && i % 5 === 0) status = "overdue"; // Some April overdue

      const total = student.class === "Class 10" ? 8300 : 6700;
      
      feeDocs.push({
        school: school1._id,
        student: student._id,
        studentName: student.name,
        class: student.class,
        month: month,
        academicYear: "2024-2025",
        tuitionFee: student.class === "Class 10" ? 6000 : 5000,
        examFee: student.class === "Class 10" ? 1500 : 1000,
        libraryFee: 500,
        miscFee: student.class === "Class 10" ? 300 : 200,
        totalAmount: total,
        netAmount: total,
        status: status,
        dueDate: new Date(2025, mIndex, 10),
        paidDate: status === "paid" ? new Date(2025, mIndex, 5) : null
      });
    });
  });
  await Fee.insertMany(feeDocs);
  console.log(`💰 Created ${feeDocs.length} fee vouchers`);

  // Create Attendance
  const attendanceDocs = [];
  const class10Students = insertedStudents.filter(s => s.class === "Class 10");
  
  if (class10Students.length > 0) {
    // Generate for last 10 days
    for (let i = 0; i < 10; i++) {
      const date = new Date(2025, 4, i + 1); // May 1 to May 10
      const records = class10Students.map((s, index) => {
        let status = "present";
        // Make some students have poor attendance (e.g. index 0 and 1)
        if (index < 2 && i % 2 === 0) status = "absent";
        else if (index % 7 === 0) status = "late";
        else if (i === 5 && index % 3 === 0) status = "absent";
        return { student: s._id, status };
      });
      
      attendanceDocs.push({
        school: school1._id,
        class: "Class 10",
        section: "A",
        date: date,
        takenBy: teacherUser._id,
        records: records
      });
    }
    await Attendance.insertMany(attendanceDocs);
    console.log(`📅 Created ${attendanceDocs.length} attendance records for Class 10`);
  }

  // Create ExamResults
  const examDocs = [];
  const subjects = ["Mathematics", "Physics", "Chemistry", "English"];
  class10Students.forEach((student, index) => {
    subjects.forEach(subject => {
      // Make some students fail, some get high marks
      let marks = Math.floor(Math.random() * 41) + 60; // 60 to 100
      if (index < 2) marks = Math.floor(Math.random() * 30) + 20; // 20 to 50 (Fail)
      if (index === 2) marks = Math.floor(Math.random() * 10) + 90; // 90 to 100 (A+)

      const percentage = marks;
      let grade = "F";
      if (percentage >= 90) grade = "A+";
      else if (percentage >= 80) grade = "A";
      else if (percentage >= 70) grade = "B";
      else if (percentage >= 60) grade = "C";
      else if (percentage >= 50) grade = "D";

      examDocs.push({
        school: school1._id,
        student: student._id,
        class: student.class,
        section: student.section,
        examType: "midterm",
        subject: subject,
        marksObtained: marks,
        maxMarks: 100,
        percentage: percentage,
        grade: grade,
        date: new Date(2025, 3, 15) // April 15
      });
    });
  });
  if (examDocs.length > 0) {
    await ExamResult.insertMany(examDocs);
    console.log(`📝 Created ${examDocs.length} exam results for Class 10`);
  }

  // Create Audit Logs
  await AuditLog.create([
    {
      actor: schooladmin._id,
      actorName: schooladmin.name,
      actorRole: "schooladmin",
      school: school1._id,
      action: "STUDENT_ADDED",
      entity: "Student",
      description: "Added 40 new students to various classes"
    },
    {
      actor: schooladmin._id,
      actorName: schooladmin.name,
      actorRole: "schooladmin",
      school: school1._id,
      action: "FEE_GENERATED",
      entity: "Fee",
      description: "Generated fee vouchers for May 2025"
    },
    {
      actor: teacherUser._id,
      actorName: teacherUser.name,
      actorRole: "teacher",
      school: school1._id,
      action: "ATTENDANCE_TAKEN",
      entity: "Attendance",
      description: "Taken attendance for Class 10 Section A"
    }
  ]);
  console.log(`📋 Created audit logs`);

  console.log("\n✅ Seed complete! You can now login with:");
  console.log("   Super Admin:  super@falsfa.com / admin123");
  console.log("   School Admin: admin@greenvalley.edu / admin123");
  console.log("   Teacher:      sarah@greenvalley.edu / admin123");
  console.log("   Student:      ali@greenvalley.edu / admin123");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
