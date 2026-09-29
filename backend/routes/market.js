const router = require('express').Router();
const { protect } = require('../middleware/auth');

// Market prices (₹ per quintal) — Mock data for demo
// In production: integrate with data.gov.in Agmarknet API
const marketPrices = {
  // Fruits
  mango: { price: 4500, unit: 'quintal', trend: 'up', change: '+12%', demand: 'high', bestMarkets: ['Delhi APMC', 'Mumbai APMC', 'Azadpur Mandi'] },
  apple: { price: 8000, unit: 'quintal', trend: 'stable', change: '+2%', demand: 'high', bestMarkets: ['Shimla Mandi', 'Delhi APMC', 'Azadpur Mandi'] },
  banana: { price: 1800, unit: 'quintal', trend: 'down', change: '-5%', demand: 'medium', bestMarkets: ['Pune APMC', 'Nagpur APMC'] },
  guava: { price: 2200, unit: 'quintal', trend: 'up', change: '+8%', demand: 'medium', bestMarkets: ['Allahabad Mandi', 'Delhi APMC'] },
  papaya: { price: 1500, unit: 'quintal', trend: 'stable', change: '0%', demand: 'medium', bestMarkets: ['Pune APMC', 'Nashik APMC'] },
  grapes: { price: 6000, unit: 'quintal', trend: 'up', change: '+15%', demand: 'high', bestMarkets: ['Nashik APMC', 'Pune APMC', 'Delhi APMC'] },
  watermelon: { price: 1200, unit: 'quintal', trend: 'up', change: '+20%', demand: 'high', bestMarkets: ['Local Market', 'City APMC'] },
  pomegranate: { price: 9000, unit: 'quintal', trend: 'stable', change: '+3%', demand: 'high', bestMarkets: ['Solapur APMC', 'Delhi APMC'] },
  // Vegetables
  tomato: { price: 2000, unit: 'quintal', trend: 'up', change: '+30%', demand: 'very high', bestMarkets: ['Nashik APMC', 'Pune APMC'] },
  potato: { price: 1200, unit: 'quintal', trend: 'stable', change: '-2%', demand: 'high', bestMarkets: ['Agra Mandi', 'Delhi APMC'] },
  onion: { price: 2500, unit: 'quintal', trend: 'up', change: '+25%', demand: 'high', bestMarkets: ['Lasalgaon APMC', 'Delhi APMC'] },
  // Grains
  wheat: { price: 2275, unit: 'quintal', trend: 'stable', change: '+1%', demand: 'high', bestMarkets: ['Punjab Mandi', 'Haryana Mandi'] },
  rice: { price: 2183, unit: 'quintal', trend: 'stable', change: '0%', demand: 'high', bestMarkets: ['Punjab Mandi', 'UP Mandi'] },
  corn: { price: 1850, unit: 'quintal', trend: 'up', change: '+5%', demand: 'medium', bestMarkets: ['Local Mandi'] },
  sugarcane: { price: 315, unit: 'quintal', trend: 'stable', change: '0%', demand: 'high', bestMarkets: ['UP Sugar Mill', 'Maharashtra Mill'] },
  cotton: { price: 6620, unit: 'quintal', trend: 'up', change: '+8%', demand: 'high', bestMarkets: ['Gujarat APMC', 'Rajkot Mandi'] },
  soybean: { price: 4600, unit: 'quintal', trend: 'stable', change: '+2%', demand: 'medium', bestMarkets: ['Indore Mandi', 'Nagpur APMC'] },
};

router.get('/prices', protect, async (req, res) => {
  try {
    const { crop, category } = req.query;
    let data = {};

    if (crop) {
      const key = crop.toLowerCase().trim();
      const priceData = marketPrices[key];
      if (!priceData) return res.status(404).json({ message: 'Crop price not found' });
      // Add dynamic variation
      data = {
        crop: crop,
        ...priceData,
        price: priceData.price + Math.floor(Math.random() * 200 - 100),
        lastUpdated: new Date().toLocaleDateString('en-IN'),
        mspPrice: getMSP(key),
        profitMargin: calculateMargin(priceData.price)
      };
    } else {
      // Return all prices
      data = Object.entries(marketPrices).map(([name, info]) => ({
        crop: name,
        ...info,
        price: info.price + Math.floor(Math.random() * 200 - 100),
        lastUpdated: new Date().toLocaleDateString('en-IN')
      }));
    }

    res.json({ data });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Profit prediction
router.post('/profit-prediction', protect, async (req, res) => {
  try {
    const { cropName, landArea, seedCost, fertilizerCost, labourCost, otherCost, expectedYield, marketPrice } = req.body;

    const totalCost = (seedCost + fertilizerCost + labourCost + otherCost) * landArea;
    const key = cropName.toLowerCase().trim();
    const price = marketPrice || (marketPrices[key]?.price || 2000);
    const expectedRevenue = expectedYield * landArea * (price / 100); // yield in quintal/acre
    const expectedProfit = expectedRevenue - totalCost;
    const roi = totalCost > 0 ? ((expectedProfit / totalCost) * 100).toFixed(1) : 0;
    const breakEvenPrice = totalCost > 0 && expectedYield > 0 ? (totalCost / (expectedYield * landArea) * 100).toFixed(0) : 0;

    res.json({
      cropName,
      landArea,
      totalCost: Math.round(totalCost),
      expectedRevenue: Math.round(expectedRevenue),
      expectedProfit: Math.round(expectedProfit),
      roi: `${roi}%`,
      breakEvenPrice: `₹${breakEvenPrice}/quintal`,
      profitStatus: expectedProfit > 0 ? 'profitable' : 'loss',
      advice: expectedProfit > 0
        ? `Good profit margin! Consider selling at ${marketPrices[key]?.bestMarkets?.[0] || 'local APMC'} for best price.`
        : 'Consider reducing input costs or switching to a higher-value crop.',
      costBreakdown: {
        seed: Math.round(seedCost * landArea),
        fertilizer: Math.round(fertilizerCost * landArea),
        labour: Math.round(labourCost * landArea),
        other: Math.round(otherCost * landArea)
      }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

function getMSP(crop) {
  const msp = { wheat: 2275, rice: 2183, corn: 1700, cotton: 6620, soybean: 4600, default: 0 };
  return msp[crop] || msp.default;
}

function calculateMargin(price) {
  return `${Math.round(20 + Math.random() * 30)}%`;
}

module.exports = router;
