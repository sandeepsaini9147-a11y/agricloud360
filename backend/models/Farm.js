const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, default: '' },
  totalArea: { type: Number, required: true }, // in acres
  soilType: { type: String, enum: ['clay', 'sandy', 'loamy', 'silt', 'peaty', 'chalky', 'black'], default: 'loamy' },
  irrigationSource: { type: String, enum: ['rain', 'canal', 'borewell', 'river', 'pond', 'mixed'], default: 'rain' },
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Farm', farmSchema);
