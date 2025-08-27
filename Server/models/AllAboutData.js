const mongoose = require('mongoose');

const allAboutDataSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['artists', 'raags', 'taals'],
    required: true
  },
  searchQuery: {
    type: String,
    required: true
  },
  name: {
    value: { type: String, required: true },
    reference: { type: String, required: true },
    verified: { type: Boolean, default: false }
  },
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
  metadata: {
    aiProvider: String,
    aiModel: String,
    searchQuery: String,
    timestamp: Date,
    responseTime: Number
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AllAboutData', allAboutDataSchema);