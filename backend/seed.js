const mongoose = require('mongoose');
const User = require('./models/User');
const Farm = require('./models/Farm');
const Crop = require('./models/Crop');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agricloud360');
  console.log('✅ Connected to MongoDB');

  // Create demo users
  const users = [
    { name: 'Ramesh Kumar', email: 'farmer@agri.com', password: 'farmer123', phone: '9876543210', state: 'Uttar Pradesh', district: 'Lucknow' },
    { name: 'Admin User', email: 'admin@agri.com', password: 'admin123', state: 'Maharashtra', role: 'admin' }
  ];

  let farmer;
  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      const user = await User.create(u);
      if (u.role !== 'admin') farmer = user;
      console.log(`✅ User created: ${u.email}`);
    } else {
      if (u.role !== 'admin') farmer = exists;
      console.log(`⚠️  User exists: ${u.email}`);
    }
  }

  if (!farmer) { console.log('Farmer user not found'); process.exit(1); }

  // Create demo farm
  let farm = await Farm.findOne({ owner: farmer._id });
  if (!farm) {
    farm = await Farm.create({
      owner: farmer._id,
      name: 'Ramesh\'s Green Farm',
      location: 'Village Sitapur, Lucknow',
      state: 'Uttar Pradesh',
      district: 'Lucknow',
      totalArea: 10,
      soilType: 'loamy',
      irrigationSource: 'canal',
      latitude: 26.85,
      longitude: 80.95,
      description: 'Main family farm with fruit orchards and vegetables'
    });
    console.log('✅ Farm created');
  }

  // Create demo crops
  const crops = await Crop.countDocuments({ owner: farmer._id });
  if (crops === 0) {
    const plantDate1 = new Date(); plantDate1.setDate(plantDate1.getDate() - 45);
    const plantDate2 = new Date(); plantDate2.setDate(plantDate2.getDate() - 20);
    const plantDate3 = new Date(); plantDate3.setDate(plantDate3.getDate() - 10);

    const harvestDate1 = new Date(); harvestDate1.setDate(harvestDate1.getDate() + 75);
    const harvestDate2 = new Date(); harvestDate2.setDate(harvestDate2.getDate() + 100);
    const harvestDate3 = new Date(); harvestDate3.setDate(harvestDate3.getDate() + 155);

    await Crop.insertMany([
      { farm: farm._id, owner: farmer._id, cropName: 'Mango', cropType: 'fruit', variety: 'Dasheri', area: 3, plantationDate: plantDate1, expectedHarvestDate: harvestDate1, status: 'growing', seedCost: 5000, fertilizerCost: 3000, labourCost: 4000, otherCost: 1000, expectedYield: 30, expectedPrice: 4500 },
      { farm: farm._id, owner: farmer._id, cropName: 'Tomato', cropType: 'vegetable', variety: 'Hybrid', area: 2, plantationDate: plantDate2, expectedHarvestDate: harvestDate2, status: 'growing', seedCost: 800, fertilizerCost: 2000, labourCost: 3000, otherCost: 500, expectedYield: 40, expectedPrice: 2000 },
      { farm: farm._id, owner: farmer._id, cropName: 'Banana', cropType: 'fruit', variety: 'G9', area: 2, plantationDate: plantDate3, expectedHarvestDate: harvestDate3, status: 'planted', seedCost: 3000, fertilizerCost: 4000, labourCost: 5000, otherCost: 1500, expectedYield: 50, expectedPrice: 1800 },
    ]);
    console.log('✅ Demo crops created');
  }

  console.log('\n🎉 Seed complete!');
  console.log('┌─────────────────────────────────────────┐');
  console.log('│  Demo Accounts:                         │');
  console.log('│  Farmer: farmer@agri.com / farmer123    │');
  console.log('│  Admin:  admin@agri.com  / admin123     │');
  console.log('└─────────────────────────────────────────┘');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
