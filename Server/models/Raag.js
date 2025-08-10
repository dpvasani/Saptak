const mongoose = require('mongoose');

const raagSchema = new mongoose.Schema({
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
  summary: {
    value: { type: String },
    reference: { type: String },
    verified: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Raag', raagSchema); 