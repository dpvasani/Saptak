const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'viewer'],
    default: 'editor'
  },
  profile: {
    firstName: String,
    lastName: String,
    organization: String,
    expertise: [String] // e.g., ['Hindustani', 'Carnatic', 'Tabla', 'Sitar']
  },
  activity: {
    lastLogin: Date,
    searchCount: { type: Number, default: 0 },
    verificationCount: { type: Number, default: 0 },
    contributionScore: { type: Number, default: 0 }
  },
  preferences: {
    defaultAIProvider: {
      type: String,
      enum: ['openai', 'gemini', 'perplexity'],
      default: 'openai'
    },
    notifications: {
      email: { type: Boolean, default: true },
      browser: { type: Boolean, default: true }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.activity.lastLogin = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);