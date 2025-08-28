const mongoose = require('mongoose');

const raagSchema = new mongoose.Schema({
  // Basic Information
  name: {
    value: { type: String, required: true },
    reference: { type: String, required: true },
    verified: { type: Boolean, default: false }
  },
  aroha: {
    value: { type: String },
    reference: { type: String },
    verified: { type: Boolean, default: false }
  },
  avroha: {
    value: { type: String },
    reference: { type: String },
    verified: { type: Boolean, default: false }
  },
  chalan: {
    value: { type: String },
    reference: { type: String },
    verified: { type: Boolean, default: false }
  },
  vadi: {
    value: { type: String },
    reference: { type: String },
    verified: { type: Boolean, default: false }
  },
  samvadi: {
    value: { type: String },
    reference: { type: String },
    verified: { type: Boolean, default: false }
  },
  thaat: {
    value: { type: String },
    reference: { type: String },
    verified: { type: Boolean, default: false }
  },
  rasBhaav: {
    value: { type: String },
    reference: { type: String },
    verified: { type: Boolean, default: false }
  },
  tanpuraTuning: {
    value: { type: String },
    reference: { type: String },
    verified: { type: Boolean, default: false }
  },
  timeOfRendition: {
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
raagSchema.index({ 'name.value': 'text' });
raagSchema.index({ createdBy: 1 });
raagSchema.index({ 'name.verified': 1 });
raagSchema.index({ 'thaat.value': 1 });
raagSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Raag', raagSchema);