const router = require('express').Router();
const Farm = require('../models/Farm');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const farms = await Farm.find({ owner: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.json({ farms });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const farm = await Farm.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ farm });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, owner: req.user._id });
    if (!farm) return res.status(404).json({ message: 'Farm not found' });
    res.json({ farm });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const farm = await Farm.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, req.body, { new: true });
    if (!farm) return res.status(404).json({ message: 'Farm not found' });
    res.json({ farm });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Farm.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { isActive: false });
    res.json({ message: 'Farm deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
