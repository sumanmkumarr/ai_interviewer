// index.js
const express = require('express');
const mongoose = require('mongoose');
const interviewRoutes = require('./routes/routes');
const cors = require('cors'); // To allow cross-origin requests from your React frontend

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for your React frontend

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/interviewDB')
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.use('/', interviewRoutes);

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});