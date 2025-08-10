const mongoose = require('mongoose');

const taalSchema = new mongoose.Schema({
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
  summary: {
    value: { type: String },
    reference: { type: String },
    verified: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Taal', taalSchema); 