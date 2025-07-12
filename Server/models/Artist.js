const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Artist', artistSchema); 