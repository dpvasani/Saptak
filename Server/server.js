require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter, speedLimiter } = require('./middleware/rateLimiter');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(generalLimiter);
app.use(speedLimiter);
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/artists', require('./routes/artists'));
app.use('/api/raags', require('./routes/raags'));
app.use('/api/taals', require('./routes/taals'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/auth', require('./routes/auth'));

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 