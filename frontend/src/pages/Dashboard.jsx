import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building2, Sprout, TrendingUp, AlertTriangle, Calendar, DollarSign, Wheat, DropletIcon } from 'lucide-react';

const COLORS = ['#16a34a','#f59e0b','#3b82f6','#8b5cf6','#ef4444','#06b6d4'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/dashboard/stats'),
      API.get('/weather/current')
    ]).then(([s, w]) => {
      setStats(s.data);
      setWeather(w.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div>Loading your farm data...</div>;

  const ov = stats?.overview || {};
  const charts = stats?.charts || {};
  const alerts = stats?.alerts || {};

  const statCards = [
    { label: 'My Farms', value: ov.totalFarms || 0, icon: '🏡', bg: '#dcfce7', color: '#166534' },
    { label: 'Active Crops', value: ov.activeCrops || 0, icon: '🌱', bg: '#fef3c7', color: '#92400e' },
    { label: 'Total Area (Acres)', value: ov.totalArea || 0, icon: '📐', bg: '#dbeafe', color: '#1e40af' },
    { label: 'Investment (₹)', value: `₹${((ov.totalInvestment||0)/1000).toFixed(0)}K`, icon: '💰', bg: '#ede9fe', color: '#5b21b6' },
    { label: 'Revenue (₹)', value: `₹${((ov.totalRevenue||0)/1000).toFixed(0)}K`, icon: '📈', bg: '#dcfce7', color: '#166534' },
    { label: 'Disease Alerts', value: alerts.diseaseAlerts || 0, icon: '🔴', bg: '#fee2e2', color: '#991b1b' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>🌾 Welcome, {user?.name?.split(' ')[0]}!</h1>
        <p>Your smart farm overview — {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
      </div>

      {/* Weather Banner */}
      {weather && (
        <div className="weather-card" style={{ marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
            <div>
              <div style={{ opacity:.8, fontSize:'.85rem', marginBottom:4 }}>☁️ Current Weather — {user?.state || 'Your Location'}</div>
              <div className="weather-temp">{weather.weather?.temp?.toFixed(1)}°C</div>
              <div className="weather-condition">{weather.weather?.condition}</div>
            </div>
            <div style={{ display:'flex', gap:24 }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'1.5rem' }}>💧</div>
                <div style={{ fontWeight:700 }}>{weather.weather?.humidity?.toFixed(0)}%</div>
                <div style={{ opacity:.8, fontSize:'.8rem' }}>Humidity</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'1.5rem' }}>🌧️</div>
                <div style={{ fontWeight:700 }}>{weather.weather?.rainfall?.toFixed(1)}mm</div>
                <div style={{ opacity:.8, fontSize:'.8rem' }}>Rainfall</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'1.5rem' }}>💨</div>
                <div style={{ fontWeight:700 }}>{weather.weather?.windSpeed} km/h</div>
                <div style={{ opacity:.8, fontSize:'.8rem' }}>Wind</div>
              </div>
            </div>
            <div style={{ background:'rgba(255,255,255,.15)', padding:14, borderRadius:10, maxWidth:260 }}>
              <div style={{ fontWeight:700, marginBottom:4 }}>💧 Irrigation Advice</div>
              <div style={{ fontSize:'.88rem', opacity:.9 }}>{weather.irrigationAdvice?.advice}</div>
            </div>
          </div>
        </div>
      )}

      {/* Alert banner */}
      {(alerts.diseaseAlerts > 0 || alerts.upcomingHarvests > 0) && (
        <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
          {alerts.diseaseAlerts > 0 && (
            <div className="alert alert-red" style={{ flex:1, minWidth:200 }}>
              <span style={{ fontSize:'1.2rem' }}>🦠</span>
              <span><strong>{alerts.diseaseAlerts} crop(s)</strong> have unresolved disease issues. Check immediately!</span>
            </div>
          )}
          {alerts.upcomingHarvests > 0 && (
            <div className="alert alert-amber" style={{ flex:1, minWidth:200 }}>
              <span style={{ fontSize:'1.2rem' }}>🌾</span>
              <span><strong>{alerts.upcomingHarvests} crop(s)</strong> ready to harvest within 30 days!</span>
            </div>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="stat-grid">
        {statCards.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background:s.bg, fontSize:'1.5rem' }}>{s.icon}</div>
            <div>
              <div className="stat-val" style={{ color:s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:24 }}>
        <div className="card">
          <h3 style={{ fontWeight:700, color:'#14532d', marginBottom:16 }}>📊 Monthly Revenue vs Cost (₹)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.monthlyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
              <XAxis dataKey="month" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#16a34a" name="Revenue" radius={[4,4,0,0]} />
              <Bar dataKey="cost" fill="#f59e0b" name="Cost" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontWeight:700, color:'#14532d', marginBottom:16 }}>🌱 Crop Distribution</h3>
          {(charts.cropDistribution || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={charts.cropDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                  {(charts.cropDistribution || []).map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign:'center', padding:'40px 0', color:'#86efac' }}>
              <div style={{ fontSize:'2rem', marginBottom:8 }}>🌱</div>
              <p>No crops added yet</p>
              <a href="/crops" className="btn btn-green btn-sm" style={{ marginTop:12, display:'inline-flex' }}>Add First Crop</a>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 style={{ fontWeight:700, color:'#14532d', marginBottom:16 }}>⚡ Quick Actions</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12 }}>
          {[
            { href:'/recommend', icon:'🌱', label:'Get Crop Recommendation', color:'#16a34a' },
            { href:'/disease', icon:'🔬', label:'Detect Plant Disease', color:'#dc2626' },
            { href:'/weather', icon:'☁️', label:'Check Weather & Irrigation', color:'#2563eb' },
            { href:'/market', icon:'📈', label:'View Market Prices', color:'#d97706' },
            { href:'/profit', icon:'💰', label:'Calculate Profit', color:'#7c3aed' },
            { href:'/calendar', icon:'📅', label:'Farming Calendar', color:'#0891b2' },
          ].map(a => (
            <a key={a.href} href={a.href} style={{ background:`${a.color}15`, border:`2px solid ${a.color}30`, borderRadius:10, padding:'14px 12px', textAlign:'center', display:'block', transition:'all .2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = a.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = `${a.color}30`}>
              <div style={{ fontSize:'1.8rem', marginBottom:6 }}>{a.icon}</div>
              <div style={{ fontSize:'.8rem', fontWeight:600, color:a.color }}>{a.label}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
