const router = require('express').Router();
const { protect } = require('../middleware/auth');

// Mock weather data for Indian states (demo - in production use OpenWeatherMap API)
const weatherData = {
  'Uttar Pradesh': { temp: 32, humidity: 70, rainfall: 8, windSpeed: 12, condition: 'Partly Cloudy', forecast: 'Rain expected in 2 days' },
  'Maharashtra': { temp: 29, humidity: 75, rainfall: 15, windSpeed: 18, condition: 'Cloudy', forecast: 'Heavy rain expected tomorrow' },
  'Punjab': { temp: 28, humidity: 60, rainfall: 5, windSpeed: 10, condition: 'Clear', forecast: 'Dry weather for next 5 days' },
  'Rajasthan': { temp: 38, humidity: 35, rainfall: 2, windSpeed: 22, condition: 'Hot & Dry', forecast: 'Extreme heat alert' },
  'Bihar': { temp: 33, humidity: 80, rainfall: 20, windSpeed: 8, condition: 'Rainy', forecast: 'Heavy monsoon continues' },
  'Gujarat': { temp: 34, humidity: 65, rainfall: 10, windSpeed: 15, condition: 'Partly Cloudy', forecast: 'Light rain in 3 days' },
  'Madhya Pradesh': { temp: 30, humidity: 72, rainfall: 12, windSpeed: 14, condition: 'Cloudy', forecast: 'Moderate rain expected' },
  'Karnataka': { temp: 26, humidity: 80, rainfall: 25, windSpeed: 10, condition: 'Rainy', forecast: 'Monsoon season active' },
  'Haryana': { temp: 31, humidity: 58, rainfall: 4, windSpeed: 16, condition: 'Partly Cloudy', forecast: 'Dry for next 4 days' },
  'default': { temp: 30, humidity: 65, rainfall: 8, windSpeed: 12, condition: 'Partly Cloudy', forecast: 'Normal weather expected' }
};

function getIrrigationAdvice(weather) {
  const { temp, humidity, rainfall } = weather;
  if (rainfall > 20) return { advice: 'No irrigation needed — sufficient rainfall', level: 'low', color: 'green' };
  if (rainfall > 10) return { advice: 'Light irrigation may be needed in 2-3 days', level: 'medium', color: 'yellow' };
  if (temp > 35 && humidity < 40) return { advice: '⚠️ Urgent: High temperature + low humidity — irrigate immediately', level: 'high', color: 'red' };
  if (temp > 30) return { advice: 'Irrigate today — warm weather and moderate humidity', level: 'medium', color: 'orange' };
  return { advice: 'Standard irrigation schedule recommended', level: 'normal', color: 'blue' };
}

function getFarmingAlerts(weather) {
  const alerts = [];
  if (weather.temp > 38) alerts.push({ type: 'heat', message: '🌡️ Extreme heat alert — protect crops with shade nets', severity: 'high' });
  if (weather.rainfall > 30) alerts.push({ type: 'flood', message: '🌧️ Heavy rain alert — ensure proper drainage in fields', severity: 'high' });
  if (weather.windSpeed > 25) alerts.push({ type: 'wind', message: '💨 Strong wind warning — secure young plants and fruit trees', severity: 'medium' });
  if (weather.humidity > 85) alerts.push({ type: 'disease', message: '🍄 High humidity increases fungal disease risk — apply preventive fungicide', severity: 'medium' });
  if (weather.temp < 15) alerts.push({ type: 'frost', message: '❄️ Cold temperature alert — protect frost-sensitive crops', severity: 'medium' });
  if (alerts.length === 0) alerts.push({ type: 'normal', message: '✅ Weather conditions normal — no special action needed', severity: 'low' });
  return alerts;
}

router.get('/current', protect, async (req, res) => {
  try {
    const { state, location } = req.query;
    const stateKey = state || req.user.state || 'default';
    const weather = weatherData[stateKey] || weatherData['default'];

    // Add dynamic slight variations
    const dynamicWeather = {
      ...weather,
      temp: weather.temp + (Math.random() * 4 - 2),
      humidity: Math.min(100, weather.humidity + (Math.random() * 10 - 5)),
      rainfall: Math.max(0, weather.rainfall + (Math.random() * 6 - 3)),
      location: location || state || 'Your Location',
      date: new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      timestamp: new Date().toISOString()
    };

    const irrigationAdvice = getIrrigationAdvice(dynamicWeather);
    const alerts = getFarmingAlerts(dynamicWeather);

    // 7-day forecast (mock)
    const forecast7Day = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      return {
        date: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        maxTemp: Math.round(weather.temp + Math.random() * 5),
        minTemp: Math.round(weather.temp - Math.random() * 8),
        rainfall: Math.max(0, Math.round(weather.rainfall * Math.random() * 2)),
        condition: ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy', 'Clear'][Math.floor(Math.random() * 5)]
      };
    });

    res.json({ weather: dynamicWeather, irrigationAdvice, alerts, forecast7Day });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
