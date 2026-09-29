const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, default: '' },
  state: { type: String, default: '' },
  district: { type: String, default: '' },
  role: { type: String, enum: ['farmer', 'expert', 'admin'], default: 'farmer' },
  avatar: { type: String, default: '' },
  totalFarmArea: { type: Number, default: 0 },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(pwd) {
  return bcrypt.compare(pwd, this.password);
};

module.exports = mongoose.model('User', userSchema);
