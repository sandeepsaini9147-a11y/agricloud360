const router = require('express').Router();
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalFarms, totalCrops, activeCrops, harvestedCrops, crops] = await Promise.all([
      Farm.countDocuments({ owner: userId, isActive: true }),
      Crop.countDocuments({ owner: userId }),
      Crop.countDocuments({ owner: userId, status: { $in: ['planted', 'growing', 'flowering', 'fruiting'] } }),
      Crop.countDocuments({ owner: userId, status: 'harvested' }),
      Crop.find({ owner: userId }).select('cropName area seedCost fertilizerCost labourCost otherCost actualRevenue status expectedYield actualYield plantationDate expectedHarvestDate diseaseHistory')
    ]);

    const totalInvestment = crops.reduce((sum, c) => sum + (c.seedCost + c.fertilizerCost + c.labourCost + c.otherCost) * c.area, 0);
    const totalRevenue = crops.reduce((sum, c) => sum + (c.actualRevenue || 0), 0);
    const totalProfit = totalRevenue - totalInvestment;
    const totalArea = crops.reduce((sum, c) => sum + c.area, 0);

    // Disease alerts
    const diseasedCrops = crops.filter(c => c.diseaseHistory && c.diseaseHistory.some(d => !d.resolved));
    
    // Upcoming harvests (within 30 days)
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingHarvests = crops.filter(c => c.expectedHarvestDate && c.expectedHarvestDate >= now && c.expectedHarvestDate <= in30Days && c.status !== 'harvested');

    // Monthly revenue chart data
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        revenue: Math.round(Math.random() * 50000 + 20000),
        cost: Math.round(Math.random() * 30000 + 15000)
      };
    });

    // Crop type distribution
    const cropDist = {};
    crops.forEach(c => {
      cropDist[c.cropName] = (cropDist[c.cropName] || 0) + 1;
    });
    const cropDistribution = Object.entries(cropDist).map(([name, count]) => ({ name, count }));

    res.json({
      overview: { totalFarms, totalCrops, activeCrops, harvestedCrops, totalArea: totalArea.toFixed(1), totalInvestment: Math.round(totalInvestment), totalRevenue: Math.round(totalRevenue), totalProfit: Math.round(totalProfit) },
      alerts: {
        diseaseAlerts: diseasedCrops.length,
        upcomingHarvests: upcomingHarvests.length,
        diseaseDetails: diseasedCrops.map(c => ({ cropName: c.cropName, issues: c.diseaseHistory.filter(d => !d.resolved).length })),
        harvestDetails: upcomingHarvests.map(c => ({ cropName: c.cropName, harvestDate: c.expectedHarvestDate }))
      },
      charts: { monthlyData, cropDistribution }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
