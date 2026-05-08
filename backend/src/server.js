require('dotenv').config();
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

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.send('SaaS API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
