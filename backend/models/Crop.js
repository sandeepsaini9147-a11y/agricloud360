const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropName: { type: String, required: true },
  cropType: { type: String, enum: ['fruit', 'vegetable', 'grain', 'pulse', 'oilseed', 'spice', 'fiber', 'other'], required: true },
  variety: { type: String, default: '' },
  area: { type: Number, required: true }, // acres
  plantationDate: { type: Date, required: true },
  expectedHarvestDate: { type: Date },
  actualHarvestDate: { type: Date },
  status: { type: String, enum: ['planted', 'growing', 'flowering', 'fruiting', 'harvested', 'failed'], default: 'planted' },
  seedCost: { type: Number, default: 0 },
  fertilizerCost: { type: Number, default: 0 },
  labourCost: { type: Number, default: 0 },
  otherCost: { type: Number, default: 0 },
  expectedYield: { type: Number, default: 0 }, // in quintal/ton
  actualYield: { type: Number, default: 0 },
  expectedPrice: { type: Number, default: 0 }, // per quintal
  actualRevenue: { type: Number, default: 0 },
  irrigationSchedule: [{
    date: Date,
    duration: Number, // hours
    method: String,
    done: { type: Boolean, default: false }
  }],
  fertilizerSchedule: [{
    date: Date,
    type: String,
    quantity: Number,
    done: { type: Boolean, default: false }
  }],
  diseaseHistory: [{
    date: { type: Date, default: Date.now },
    diseaseName: String,
    severity: { type: String, enum: ['low', 'medium', 'high'] },
    treatment: String,
    resolved: { type: Boolean, default: false }
  }],
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Crop', cropSchema);
