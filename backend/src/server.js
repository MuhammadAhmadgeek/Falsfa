require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes will be imported here
// const exampleRoute = require('./routes/example.routes');
// app.use('/api/example', exampleRoute);

app.get('/', (req, res) => {
  res.send('SaaS API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
