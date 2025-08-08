const mongoose = require('mongoose');

const dataActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['search', 'create', 'update', 'verify', 'delete', 'export'],
    required: true
  },
  category: {
    type: String,
    enum: ['artists', 'raags', 'taals'],
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  itemName: String,
  details: {
    searchQuery: String,
    aiProvider: String,
    aiModel: String,
    fieldsModified: [String],
    fieldsVerified: [String],
    exportFormat: String,
    previousValues: mongoose.Schema.Types.Mixed,
    newValues: mongoose.Schema.Types.Mixed
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    sessionId: String,
    duration: Number, // in milliseconds
    success: { type: Boolean, default: true },
    errorMessage: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
dataActivitySchema.index({ user: 1, createdAt: -1 });
dataActivitySchema.index({ category: 1, action: 1, createdAt: -1 });
dataActivitySchema.index({ itemId: 1, createdAt: -1 });

module.exports = mongoose.model('DataActivity', dataActivitySchema);