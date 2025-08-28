const mongoose = require('mongoose');

const taalSchema = new mongoose.Schema({
  // Basic Information
  name: {
    value: { type: String, required: true },
    reference: { type: String, required: true },
    verified: { type: Boolean, default: false }
  },
  numberOfBeats: {
    value: { type: Number },
    reference: { type: String },
    verified: { type: Boolean, default: false }
  },
  divisions: {
    value: { type: String },
    reference: { type: String },
    verified: { type: Boolean, default: false }
  },
  taali: {
    count: {
      value: { type: Number },
      reference: { type: String },
      verified: { type: Boolean, default: false }
    },
    beatNumbers: {
      value: { type: String },
      reference: { type: String },
      verified: { type: Boolean, default: false }
    }
  },
  khaali: {
    count: {
      value: { type: Number },
      reference: { type: String },
      verified: { type: Boolean, default: false }
    },
    beatNumbers: {
      value: { type: String },
      reference: { type: String },
      verified: { type: Boolean, default: false }
    }
  },
  jaati: {
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
    images: { type: mongoose.Schema.Types.Mixed, default: [] },
    sources: { type: mongoose.Schema.Types.Mixed, default: [] },
    citations: { type: mongoose.Schema.Types.Mixed, default: [] },
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
taalSchema.index({ 'name.value': 'text' });
taalSchema.index({ createdBy: 1 });
taalSchema.index({ 'name.verified': 1 });
taalSchema.index({ 'numberOfBeats.value': 1 });
taalSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Taal', taalSchema);