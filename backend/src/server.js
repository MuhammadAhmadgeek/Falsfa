const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth.routes');
const schoolRoutes = require('./routes/school.routes');
const staffRoutes = require('./routes/staff.routes');
const studentRoutes = require('./routes/student.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const examRoutes = require('./routes/exam.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const auditLogRoutes = require('./routes/auditLog.routes');
const feeRoutes = require('./routes/fee.routes');
const notificationRoutes = require('./routes/notification.routes');
const classRoutes = require('./routes/class.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const reportRoutes = require('./routes/report.routes');

// Mount routes
app.use('/_/backend/auth', authRoutes);
app.use('/_/backend/schools', schoolRoutes);
app.use('/_/backend/staff', staffRoutes);
app.use('/_/backend/students', studentRoutes);
app.use('/_/backend/attendance', attendanceRoutes);
app.use('/_/backend/exams', examRoutes);
app.use('/_/backend/dashboard', dashboardRoutes);
app.use('/_/backend/audit-logs', auditLogRoutes);
app.use('/_/backend/fees', feeRoutes);
app.use('/_/backend/notifications', notificationRoutes);
app.use('/_/backend/classes', classRoutes);
app.use('/_/backend/analytics', analyticsRoutes);
app.use('/_/backend/reports', reportRoutes);

app.get('/', (req, res) => {
  res.send('SaaS API is running');
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
