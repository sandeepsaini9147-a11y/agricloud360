# 🌾 AgriCloud360 — Smart Farming & Fruit Intelligence Platform

A cloud-based intelligent agriculture and fruit farming management system with AI-powered crop recommendation, disease detection, weather-based irrigation, and profit prediction.

---

## 🔥 Features

| Module | Description |
|---|---|
| 🌱 Crop Recommendation | AI/ML-based crop suggestion using soil NPK, climate, season |
| 🔬 Disease Detection | Upload leaf/fruit image → AI detects disease + treatment |
| ☁️ Farm Management | Digital farm profiles with crop tracking |
| 🌦️ Weather & Irrigation | Real-time weather + smart irrigation advice + 7-day forecast |
| 💰 Market Prices | Current market rates for 20+ crops and fruits |
| 📊 Profit Calculator | Estimate profit, ROI, break-even price before farming |
| 📅 Farming Calendar | Auto-generated irrigation, fertilizer, disease check schedule |
| 📈 Analytics | Revenue/cost charts, crop distribution, farm performance |
| 👨‍🌾 Farmer Dashboard | Weather banner, alerts, quick actions, live stats |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6, Recharts, Lucide React |
| Backend | Node.js, Express.js, Mongoose ODM |
| Database | MongoDB (local or Atlas) |
| ML Service | Python 3, Flask, Scikit-learn, NumPy, Pandas |
| Auth | JWT + bcryptjs |
| Cloud DB | MongoDB Atlas |

---

## 📁 Project Structure

```
agricloud360/
├── backend/
│   ├── models/         (User, Farm, Crop)
│   ├── routes/         (auth, farms, crops, weather, market, recommend, disease, dashboard, calendar)
│   ├── middleware/     (auth.js — JWT protect)
│   ├── server.js
│   ├── seed.js
│   └── .env
├── ml-service/
│   └── app.py          (Flask ML API — crop recommendation + disease detection)
└── frontend/
    └── src/
        ├── pages/      (Dashboard, Farms, Crops, Recommend, Disease, Weather, Market, Profit, Calendar, Analytics)
        ├── components/ (Sidebar, ProtectedRoute)
        ├── context/    (AuthContext)
        └── services/   (api.js)
```

---

## 🚀 Setup — Step by Step

### Prerequisites
- Node.js v18+
- Python 3.10+
- MongoDB (local) OR MongoDB Atlas account

---

### Step 1 — Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/agricloud360
JWT_SECRET=agricloud360_secret_key_2026
JWT_EXPIRE=7d
ML_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```

> **For MongoDB Atlas:** Replace MONGO_URI with your Atlas connection string.

Seed demo data:
```bash
node seed.js
```

Start backend:
```bash
npm run dev
```
Backend runs at: **http://localhost:5000**

---

### Step 2 — ML Service Setup

```bash
cd ml-service
pip install flask flask-cors scikit-learn pandas numpy
python app.py
```
ML Service runs at: **http://localhost:8000**

> ML service is optional — backend has a rule-based fallback if ML is unavailable.

---

### Step 3 — Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: **http://localhost:5173**

---

## 🔑 Demo Login

| Role | Email | Password |
|---|---|---|
| Farmer | farmer@agri.com | farmer123 |
| Admin | admin@agri.com | admin123 |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new farmer |
| POST | /api/auth/login | Login |
| GET | /api/farms | Get my farms |
| POST | /api/farms | Add farm |
| GET | /api/crops | Get my crops |
| POST | /api/crops | Add crop + auto-generate calendar |
| POST | /api/recommend/crop | AI crop recommendation |
| POST | /api/disease/detect | Plant disease detection |
| GET | /api/weather/current | Weather + irrigation advice |
| GET | /api/market/prices | Crop market prices |
| POST | /api/market/profit-prediction | Profit calculator |
| GET | /api/calendar | Farming calendar events |
| GET | /api/dashboard/stats | Dashboard statistics |

---

## ☁️ Cloud Deployment

### Backend → Render.com (Free)
1. Push code to GitHub
2. Create new Web Service on render.com
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add environment variables

### Frontend → Vercel (Free)
1. Push frontend to GitHub
2. Import on vercel.com
3. Framework: Vite
4. Done!

### Database → MongoDB Atlas (Free M0 tier)
Replace MONGO_URI with Atlas connection string.

---

## 🎓 For B.Tech Viva

**How to explain:**
1. "AgriCloud360 is a cloud-based smart agriculture platform using MERN stack + Python ML"
2. "It has 10 modules: farm management, crop tracking, AI crop recommendation, disease detection, weather analysis, market prices, profit calculator, farming calendar, analytics dashboard"
3. "The ML service uses Random Forest classifier trained on soil NPK, temperature, humidity, pH, rainfall data"
4. "JWT authentication with bcrypt password hashing ensures security"
5. "MongoDB Atlas provides cloud database with automatic replication"
