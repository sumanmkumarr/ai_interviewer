// server.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const candidateRoutes = require('./routes/routes'); // Import the routes

const app = express();
const PORT = 4000; // Use a different port to avoid conflict with Python backend

// MongoDB connection URI
const mongoURI = 'mongodb://localhost:27017/ai-interview';

// Connect to MongoDB
mongoose.connect(mongoURI);  // Removed deprecated options
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use candidate routes
app.use('/api', candidateRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Node.js server running on http://localhost:${PORT}`);
});