const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const School = require("../models/School");

exports.getAllStudents = async (req, res) => {
  try {
    const filter = { school: req.schoolId || req.query.school };

    // Optional filters from query params
    if (req.query.class)    filter.class = req.query.class;
    if (req.query.section)  filter.section = req.query.section;
    if (req.query.search) {
      // Search by name or rollNo
      filter.$or = [
        { name:   { $regex: req.query.search, $options: "i" } },
        { rollNo: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const students = await Student.find(filter)
      .sort({ class: 1, rollNo: 1 })
      .populate("school", "name");

    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addStudent = async (req, res) => {
  try {
    // Automatically assign to the user's school
    const schoolId = req.schoolId || req.body.school;
    const student = await Student.create({ ...req.body, school: schoolId });

    // Increment student count in school stats
    await School.findByIdAndUpdate(schoolId, { $inc: { "stats.totalStudents": 1 } });

    res.status(201).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("school", "name");
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStudentById = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteStudentById = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    // Decrement count
    await School.findByIdAndUpdate(student.school, { $inc: { "stats.totalStudents": -1 } });

    res.json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttendanceSummary = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    // Find all attendance records that contain this student
    const records = await Attendance.find({
      school: student.school,
      class: student.class,
      "records.student": student._id,
    }).sort({ date: -1 });

    // Calculate summary stats
    let present = 0, absent = 0, late = 0;
    const history = records.map((rec) => {
      const entry = rec.records.find((r) => r.student.toString() === student._id.toString());
      if (entry?.status === "present") present++;
      else if (entry?.status === "absent") absent++;
      else if (entry?.status === "late") late++;
      return { date: rec.date, status: entry?.status, note: entry?.note };
    });

    const total = present + absent + late;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: { summary: { present, absent, late, total, percentage }, history },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};