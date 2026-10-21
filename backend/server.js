const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Basic middlewares
app.use(cors());
app.use(express.json());

// Root test route
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Energy Consumption & Bill Management API is running',
    status: 'online'
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
