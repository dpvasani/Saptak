const mongoose = require('mongoose');

const allAboutDataSchema = new mongoose.Schema({
  // Link to the main entity
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'entityType'
  },
  entityType: {
    type: String,
    required: true,
    enum: ['Artist', 'Raag', 'Taal']
  },
  entityName: {
    type: String,
    required: true
  },
  
  // AI Response Data
  answer: {
    value: { type: String },
    reference: { type: String },
    verified: { type: Boolean, default: false }
  },
  
  // Media and Sources
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
  
  // Search Metadata
  searchQuery: String,
  aiProvider: String,
  aiModel: String,
  
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
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for better performance
allAboutDataSchema.index({ entityId: 1, entityType: 1 });
allAboutDataSchema.index({ entityName: 1 });
allAboutDataSchema.index({ createdBy: 1 });
allAboutDataSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AllAboutData', allAboutDataSchema);