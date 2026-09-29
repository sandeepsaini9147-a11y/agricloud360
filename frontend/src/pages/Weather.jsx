import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const indianStates = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Nagaland','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal'];

export default function Weather() {
  const { user } = useAuth();
  const [weather, setWeather] = useState(null);
  const [state, setState] = useState(user?.state || 'Uttar Pradesh');
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/weather/current?state=${state}`);
      setWeather(data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchWeather(); }, [state]);

  if (loading) return <div className="loading"><div className="spinner"></div>Fetching weather data...</div>;

  const w = weather?.weather || {};
  const alerts = weather?.alerts || [];
  const forecast = weather?.forecast7Day || [];
  const irrigation = weather?.irrigationAdvice || {};

  const conditionIcon = { 'Sunny':'☀️','Clear':'🌤️','Partly Cloudy':'⛅','Cloudy':'☁️','Rainy':'🌧️','Hot & Dry':'🌡️' };

  return (
    <div>
      <div className="page-header">
        <h1>☁️ Weather & Smart Irrigation</h1>
        <p>Real-time weather data and irrigation recommendations for your farm</p>
      </div>

      {/* State Selector */}
      <div className="card" style={{ marginBottom:20, display:'flex', gap:16, alignItems:'center', flexWrap:'wrap' }}>
        <label style={{ fontWeight:700, color:'#14532d', whiteSpace:'nowrap' }}>📍 Select State:</label>
        <select className="form-control" style={{ maxWidth:280 }} value={state} onChange={e => setState(e.target.value)}>
          {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn btn-green btn-sm" onClick={fetchWeather}>🔄 Refresh</button>
      </div>

      {/* Main weather card */}
      <div className="weather-card" style={{ marginBottom:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:20, alignItems:'center' }}>
          <div>
            <div style={{ opacity:.8, fontSize:'.85rem', marginBottom:4 }}>📍 {state}</div>
            <div style={{ fontSize:'.8rem', opacity:.7 }}>{w.date}</div>
            <div style={{ fontSize:'3.5rem', fontWeight:800, margin:'8px 0', lineHeight:1 }}>{w.temp?.toFixed(1)}°C</div>
            <div style={{ fontSize:'1.1rem', opacity:.9 }}>{conditionIcon[w.condition] || '🌤️'} {w.condition}</div>
            <div style={{ marginTop:8, opacity:.8, fontSize:'.88rem' }}>📋 {w.forecast}</div>
          </div>
          <div style={{ textAlign:'center', background:'rgba(255,255,255,.12)', padding:16, borderRadius:10 }}>
            <div style={{ fontSize:'2rem' }}>💧</div>
            <div style={{ fontSize:'1.8rem', fontWeight:800 }}>{w.humidity?.toFixed(0)}%</div>
            <div style={{ opacity:.8 }}>Humidity</div>
          </div>
          <div style={{ textAlign:'center', background:'rgba(255,255,255,.12)', padding:16, borderRadius:10 }}>
            <div style={{ fontSize:'2rem' }}>🌧️</div>
            <div style={{ fontSize:'1.8rem', fontWeight:800 }}>{w.rainfall?.toFixed(1)}mm</div>
            <div style={{ opacity:.8 }}>Rainfall</div>
          </div>
          <div style={{ textAlign:'center', background:'rgba(255,255,255,.12)', padding:16, borderRadius:10 }}>
            <div style={{ fontSize:'2rem' }}>💨</div>
            <div style={{ fontSize:'1.8rem', fontWeight:800 }}>{w.windSpeed}</div>
            <div style={{ opacity:.8 }}>km/h Wind</div>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {/* Irrigation Advice */}
        <div className="card">
          <h3 style={{ fontWeight:700, color:'#14532d', marginBottom:16 }}>💧 Smart Irrigation Advice</h3>
          <div style={{ background: irrigation.level === 'high' ? '#fee2e2' : irrigation.level === 'medium' ? '#fef3c7' : '#dcfce7', padding:16, borderRadius:10, marginBottom:16, border:`2px solid ${irrigation.level === 'high' ? '#fca5a5' : irrigation.level === 'medium' ? '#fde68a' : '#86efac'}` }}>
            <div style={{ fontSize:'1.5rem', marginBottom:6 }}>{irrigation.level === 'high' ? '🚨' : irrigation.level === 'medium' ? '⚠️' : '✅'}</div>
            <div style={{ fontWeight:700, marginBottom:4 }}>Recommendation</div>
            <p style={{ fontSize:'.9rem' }}>{irrigation.advice}</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[['Method', irrigation.method], ['Frequency', irrigation.frequency], ['Duration', irrigation.duration]].map(([l, v]) => (
              <div key={l} style={{ background:'#f0fdf4', padding:'10px 12px', borderRadius:8 }}>
                <div style={{ fontSize:'.75rem', color:'#4b5563' }}>{l}</div>
                <div style={{ fontWeight:700, color:'#14532d', fontSize:'.9rem' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Farming Alerts */}
        <div className="card">
          <h3 style={{ fontWeight:700, color:'#14532d', marginBottom:16 }}>🚨 Farming Alerts</h3>
          {alerts.map((alert, i) => (
            <div key={i} className={`alert alert-${alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'amber' : 'green'}`} style={{ marginBottom:10 }}>
              <span style={{ flexShrink:0 }}>{alert.severity === 'high' ? '🔴' : alert.severity === 'medium' ? '🟡' : '🟢'}</span>
              <span style={{ fontSize:'.88rem' }}>{alert.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="card">
        <h3 style={{ fontWeight:700, color:'#14532d', marginBottom:16 }}>📅 7-Day Forecast</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:10 }}>
          {forecast.map((day, i) => (
            <div key={i} style={{ background:'#f0fdf4', padding:'12px 8px', borderRadius:10, textAlign:'center', border:'1px solid #d1fae5' }}>
              <div style={{ fontSize:'.75rem', color:'#4b5563', marginBottom:6 }}>{day.date}</div>
              <div style={{ fontSize:'1.4rem', marginBottom:6 }}>{conditionIcon[day.condition] || '⛅'}</div>
              <div style={{ fontWeight:800, color:'#dc2626', fontSize:'.9rem' }}>{day.maxTemp}°</div>
              <div style={{ color:'#2563eb', fontSize:'.85rem' }}>{day.minTemp}°</div>
              <div style={{ marginTop:6, fontSize:'.75rem', color:'#3b82f6' }}>💧{day.rainfall}mm</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
