const router = require('express').Router();
const Crop = require('../models/Crop');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const crops = await Crop.find({ owner: req.user._id, status: { $ne: 'harvested' } }).populate('farm', 'name');
    const events = [];
    const today = new Date();

    crops.forEach(crop => {
      // Plantation event
      events.push({ id: `plant-${crop._id}`, date: crop.plantationDate, type: 'plantation', title: `🌱 Plant ${crop.cropName}`, farm: crop.farm?.name, cropId: crop._id, status: 'done', color: '#10B981' });

      // Expected harvest
      if (crop.expectedHarvestDate) {
        const isPast = crop.expectedHarvestDate < today;
        events.push({ id: `harvest-${crop._id}`, date: crop.expectedHarvestDate, type: 'harvest', title: `🌾 Harvest ${crop.cropName}`, farm: crop.farm?.name, cropId: crop._id, status: isPast ? 'overdue' : 'upcoming', color: '#F59E0B' });
      }

      // Irrigation events
      (crop.irrigationSchedule || []).forEach((irr, i) => {
        events.push({ id: `irr-${crop._id}-${i}`, date: irr.date, type: 'irrigation', title: `💧 Irrigate ${crop.cropName} (${irr.duration}h)`, farm: crop.farm?.name, cropId: crop._id, done: irr.done, color: '#3B82F6' });
      });

      // Fertilizer events
      (crop.fertilizerSchedule || []).forEach((fert, i) => {
        events.push({ id: `fert-${crop._id}-${i}`, date: fert.date, type: 'fertilizer', title: `🌿 Apply ${fert.type} to ${crop.cropName}`, farm: crop.farm?.name, cropId: crop._id, done: fert.done, color: '#8B5CF6' });
      });

      // Disease check (every 30 days)
      let checkDate = new Date(crop.plantationDate);
      checkDate.setDate(checkDate.getDate() + 30);
      while (checkDate < (crop.expectedHarvestDate || today)) {
        events.push({ id: `check-${crop._id}-${checkDate.getTime()}`, date: new Date(checkDate), type: 'disease_check', title: `🔍 Disease check: ${crop.cropName}`, farm: crop.farm?.name, cropId: crop._id, color: '#EF4444' });
        checkDate.setDate(checkDate.getDate() + 30);
      }
    });

    // Sort by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Today's and upcoming 7 days tasks
    const todayStr = today.toDateString();
    const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const todayTasks = events.filter(e => new Date(e.date).toDateString() === todayStr);
    const upcoming7 = events.filter(e => new Date(e.date) > today && new Date(e.date) <= in7Days);

    res.json({ events, todayTasks, upcoming7 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
