const ExamResult = require("../models/ExamResult");
const Student = require("../models/Student");

// Get exam results filtered by class/section/examType/subject
exports.getResults = async (req, res) => {
  try {
    const filter = { school: req.schoolId || req.query.school };
    if (req.query.class) filter.class = req.query.class;
    if (req.query.section) filter.section = req.query.section;
    if (req.query.examType) filter.examType = req.query.examType;
    if (req.query.subject) filter.subject = req.query.subject;

    const results = await ExamResult.find(filter)
      .populate("student", "name rollNo")
      .sort({ "student.rollNo": 1 });

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk save/update exam results
exports.saveResults = async (req, res) => {
  try {
    const { results, examType, subject, class: className, section, maxMarks } = req.body;
    const schoolId = req.schoolId || req.body.school;

    const operations = results.map((r) => ({
      updateOne: {
        filter: {
          school: schoolId,
          student: r.studentId,
          examType,
          subject,
        },
        update: {
          $set: {
            marksObtained: r.marksObtained,
            maxMarks,
            class: className,
            section,
            percentage: Math.round((r.marksObtained / maxMarks) * 100 * 100) / 100,
            grade: calcGrade(Math.round((r.marksObtained / maxMarks) * 100)),
          },
        },
        upsert: true,
      },
    }));

    await ExamResult.bulkWrite(operations);
    res.json({ success: true, message: `${results.length} results saved` });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get students for exam entry (returns student list for a class/section)
exports.getStudentsForExam = async (req, res) => {
  try {
    const filter = { school: req.schoolId || req.query.school, isActive: true };
    if (req.query.class) filter.class = req.query.class;
    if (req.query.section) filter.section = req.query.section;

    const students = await Student.find(filter)
      .select("name rollNo class section")
      .sort({ rollNo: 1 });

    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

function calcGrade(percentage) {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
}
