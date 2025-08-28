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
  
  // All About Data (embedded)
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
taalSchema.index({ 'name.value': 'text' });
taalSchema.index({ createdBy: 1 });
taalSchema.index({ 'name.verified': 1 });
taalSchema.index({ 'numberOfBeats.value': 1 });
taalSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Taal', taalSchema);