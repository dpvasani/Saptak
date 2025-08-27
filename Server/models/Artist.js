const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  // Basic Information
  name: {
    value: { type: String, required: true },
    reference: { type: String, required: true },
    verified: { type: Boolean, default: false }
  },
  guru: {
    value: { type: String },
    reference: { type: String },
    verified: { type: Boolean, default: false }
  },
  gharana: {
    value: { type: String },
    reference: { type: String },
    verified: { type: Boolean, default: false }
  },
  notableAchievements: {
    value: { type: String },
    reference: { type: String },
    verified: { type: Boolean, default: false }
  },
  disciples: {
    value: { type: String },
    reference: { type: String },
    verified: { type: Boolean, default: false }
  },
  summary: {
    value: { type: String },
    reference: { type: String },
    verified: { type: Boolean, default: false }
  },
  
  // All About Data (merged from separate collection)
  allAboutData: {
    answer: {
      value: { type: String },
      reference: { type: String },
      verified: { type: Boolean, default: false }
    },
    images: [{
      url: String,
      title: String,
      description: String,
      source: String,
      verified: { type: Boolean, default: false }
    }],
    sources: [{
      title: String,
      url: String,
      snippet: String,
      domain: String,
      type: String,
      verified: { type: Boolean, default: false }
    }],
    citations: [{
      title: String,
      url: String,
      snippet: String,
      verified: { type: Boolean, default: false }
    }],
    relatedQuestions: [String],
    searchQuery: String,
    aiProvider: String,
    aiModel: String
  },
  
  // User Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Search Metadata
  searchMetadata: {
    searchMethod: { type: String, enum: ['web', 'ai'], required: true },
    aiProvider: String,
    aiModel: String,
    searchQuery: String,
    searchTimestamp: { type: Date, default: Date.now },
    responseTime: Number
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for better performance
artistSchema.index({ 'name.value': 'text' });
artistSchema.index({ createdBy: 1 });
artistSchema.index({ 'name.verified': 1 });
artistSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Artist', artistSchema);