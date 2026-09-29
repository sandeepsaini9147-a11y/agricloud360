const router = require('express').Router();
const Crop = require('../models/Crop');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { farmId, status } = req.query;
    const query = { owner: req.user._id };
    if (farmId) query.farm = farmId;
    if (status) query.status = status;
    const crops = await Crop.find(query).populate('farm', 'name location').sort({ createdAt: -1 });
    res.json({ crops });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const cropData = { ...req.body, owner: req.user._id };
    // Auto-generate farming calendar
    const plantDate = new Date(req.body.plantationDate);
    const cropDays = getCropDays(req.body.cropName);
    cropData.expectedHarvestDate = new Date(plantDate.getTime() + cropDays * 24 * 60 * 60 * 1000);
    cropData.irrigationSchedule = generateIrrigationSchedule(plantDate, cropDays);
    cropData.fertilizerSchedule = generateFertilizerSchedule(plantDate, cropDays);
    const crop = await Crop.create(cropData);
    await crop.populate('farm', 'name location');
    res.status(201).json({ crop });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const crop = await Crop.findOne({ _id: req.params.id, owner: req.user._id }).populate('farm');
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.json({ crop });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const crop = await Crop.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, req.body, { new: true }).populate('farm', 'name');
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.json({ crop });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Crop.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    res.json({ message: 'Crop deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add disease to crop history
router.post('/:id/disease', protect, async (req, res) => {
  try {
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $push: { diseaseHistory: req.body } },
      { new: true }
    );
    res.json({ crop });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Helper: crop growth days
function getCropDays(cropName) {
  const days = {
    rice: 120, wheat: 110, mango: 365, apple: 180, banana: 270,
    tomato: 75, potato: 90, onion: 120, sugarcane: 365, cotton: 180,
    corn: 90, soybean: 100, guava: 180, papaya: 150, grapes: 180,
    watermelon: 80, pumpkin: 90, default: 120
  };
  const key = cropName.toLowerCase().trim();
  return days[key] || days.default;
}

// Generate smart irrigation schedule
function generateIrrigationSchedule(plantDate, totalDays) {
  const schedule = [];
  const interval = Math.max(7, Math.floor(totalDays / 15));
  for (let day = interval; day < totalDays; day += interval) {
    const date = new Date(plantDate.getTime() + day * 24 * 60 * 60 * 1000);
    schedule.push({ date, duration: 2, method: 'drip', done: false });
  }
  return schedule.slice(0, 20);
}

// Generate fertilizer schedule
function generateFertilizerSchedule(plantDate, totalDays) {
  const schedule = [];
  const milestones = [
    { day: 15, type: 'Urea (Nitrogen)', qty: 25 },
    { day: 30, type: 'DAP (Phosphorus)', qty: 20 },
    { day: Math.floor(totalDays * 0.4), type: 'Potash (K)', qty: 15 },
    { day: Math.floor(totalDays * 0.6), type: 'Urea Top Dressing', qty: 25 },
    { day: Math.floor(totalDays * 0.8), type: 'Micronutrient Mix', qty: 10 },
  ];
  milestones.forEach(m => {
    if (m.day < totalDays) {
      const date = new Date(plantDate.getTime() + m.day * 24 * 60 * 60 * 1000);
      schedule.push({ date, type: m.type, quantity: m.qty, done: false });
    }
  });
  return schedule;
}

module.exports = router;
