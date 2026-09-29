const router = require('express').Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');

// Fallback rule-based recommendation if ML service is unavailable
function ruleBasedRecommendation({ soilType, temperature, humidity, rainfall, season, location }) {
  const recommendations = [];

  const soil = soilType?.toLowerCase() || 'loamy';
  const temp = parseFloat(temperature) || 25;
  const hum = parseFloat(humidity) || 60;
  const rain = parseFloat(rainfall) || 100;
  const seas = season?.toLowerCase() || 'kharif';

  // Fruit recommendations
  if (temp >= 25 && temp <= 38 && (soil === 'loamy' || soil === 'sandy')) {
    recommendations.push({ crop: 'Mango', type: 'fruit', confidence: 92, profit: 'High', water: 'Medium', duration: '365 days', reason: 'Ideal temperature and soil for mango cultivation' });
  }
  if (temp >= 20 && temp <= 30 && hum >= 60) {
    recommendations.push({ crop: 'Banana', type: 'fruit', confidence: 88, profit: 'High', water: 'High', duration: '270 days', reason: 'Suitable temperature and humidity' });
  }
  if (temp >= 22 && temp <= 32 && (soil === 'sandy' || soil === 'loamy')) {
    recommendations.push({ crop: 'Papaya', type: 'fruit', confidence: 85, profit: 'Medium-High', water: 'Medium', duration: '150 days', reason: 'Fast yield, ideal conditions' });
  }
  if (temp >= 15 && temp <= 28) {
    recommendations.push({ crop: 'Guava', type: 'fruit', confidence: 82, profit: 'Medium', water: 'Low-Medium', duration: '180 days', reason: 'Hardy crop, low maintenance' });
  }

  // Vegetable recommendations
  if (seas === 'rabi' || temp < 25) {
    recommendations.push({ crop: 'Tomato', type: 'vegetable', confidence: 90, profit: 'High', water: 'Medium', duration: '75 days', reason: 'High market demand and price' });
    recommendations.push({ crop: 'Potato', type: 'vegetable', confidence: 85, profit: 'Medium', water: 'Medium', duration: '90 days', reason: 'Good for Rabi season' });
  }

  // Grain recommendations
  if (seas === 'kharif' && rain >= 100) {
    recommendations.push({ crop: 'Rice', type: 'grain', confidence: 88, profit: 'Medium', water: 'Very High', duration: '120 days', reason: 'Good rainfall suitable for paddy' });
    recommendations.push({ crop: 'Soybean', type: 'oilseed', confidence: 80, profit: 'Medium', water: 'Medium', duration: '100 days', reason: 'Kharif season oilseed' });
  }
  if (seas === 'rabi') {
    recommendations.push({ crop: 'Wheat', type: 'grain', confidence: 92, profit: 'Medium', water: 'Low-Medium', duration: '110 days', reason: 'Ideal Rabi crop with MSP support' });
  }

  // Sort by confidence
  return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

router.post('/crop', protect, async (req, res) => {
  try {
    const { soilType, temperature, humidity, rainfall, nitrogen, phosphorus, potassium, ph, season, location } = req.body;

    let recommendations;

    // Try ML service first
    try {
      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/predict/crop`,
        { soilType, temperature, humidity, rainfall, nitrogen, phosphorus, potassium, ph, season },
        { timeout: 3000 }
      );
      recommendations = mlResponse.data.recommendations;
    } catch {
      // Fallback to rule-based
      recommendations = ruleBasedRecommendation({ soilType, temperature, humidity, rainfall, season, location });
    }

    // Irrigation advice based on inputs
    const irrigationAdvice = getIrrigationAdvice(rainfall, temperature, humidity);

    res.json({
      recommendations,
      irrigationAdvice,
      soilHealth: getSoilHealth({ nitrogen, phosphorus, potassium, ph, soilType }),
      inputSummary: { soilType, temperature, humidity, rainfall, season, location }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

function getIrrigationAdvice(rainfall, temp, humidity) {
  if (rainfall > 200) return { method: 'No irrigation needed', frequency: 'Rain-fed', duration: 'N/A' };
  if (temp > 35) return { method: 'Drip irrigation recommended', frequency: 'Daily', duration: '2-3 hours' };
  if (humidity < 40) return { method: 'Sprinkler irrigation', frequency: 'Every 2 days', duration: '2 hours' };
  return { method: 'Furrow or drip irrigation', frequency: 'Every 3-4 days', duration: '1.5 hours' };
}

function getSoilHealth({ nitrogen, phosphorus, potassium, ph, soilType }) {
  const n = parseFloat(nitrogen) || 50;
  const p = parseFloat(phosphorus) || 40;
  const k = parseFloat(potassium) || 40;
  const phVal = parseFloat(ph) || 6.5;

  let score = 0;
  if (n >= 50) score += 25; else score += Math.round(n / 2);
  if (p >= 40) score += 25; else score += Math.round(p * 0.6);
  if (k >= 40) score += 25; else score += Math.round(k * 0.6);
  if (phVal >= 6 && phVal <= 7.5) score += 25;
  else if (phVal >= 5.5 && phVal <= 8) score += 15;
  else score += 5;

  return {
    score: Math.min(100, score),
    status: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor',
    recommendations: getSoilRecommendations(n, p, k, phVal)
  };
}

function getSoilRecommendations(n, p, k, ph) {
  const recs = [];
  if (n < 50) recs.push('Add nitrogen fertilizer (Urea) to improve N levels');
  if (p < 40) recs.push('Apply DAP or superphosphate to improve phosphorus');
  if (k < 40) recs.push('Apply MOP (Muriate of Potash) to improve potassium');
  if (ph < 6) recs.push('Apply agricultural lime to raise soil pH');
  if (ph > 7.5) recs.push('Apply sulphur or organic matter to lower pH');
  if (recs.length === 0) recs.push('Soil nutrients are balanced — maintain with organic compost');
  return recs;
}

module.exports = router;
