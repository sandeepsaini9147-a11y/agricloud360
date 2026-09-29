const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/farms', require('./routes/farms'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/market', require('./routes/market'));
app.use('/api/recommend', require('./routes/recommend'));
app.use('/api/disease', require('./routes/disease'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/calendar', require('./routes/calendar'));

app.get('/api/health', (req, res) => res.json({ status: '🌾 AgriCloud360 API Running ✅' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agricloud360';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 AgriCloud360 Server running on port ${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB Error:', err.message); process.exit(1); });
