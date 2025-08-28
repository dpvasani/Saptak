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

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(generalLimiter);
app.use(speedLimiter);
app.use(express.json());

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/indian-classical-music';
console.log('Connecting to MongoDB:', mongoUri);

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Health check endpoint (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth')); // Auth routes don't require authentication
app.use('/api/artists', require('./routes/artists'));
app.use('/api/raags', require('./routes/raags'));
app.use('/api/taals', require('./routes/taals'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`JWT Secret configured: ${!!process.env.JWT_SECRET}`);
}); 