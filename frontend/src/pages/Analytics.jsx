import { useState, useEffect } from 'react';
import API from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#16a34a','#f59e0b','#3b82f6','#8b5cf6','#ef4444','#06b6d4','#ec4899'];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div>Loading analytics...</div>;

  const ov = stats?.overview || {};
  const charts = stats?.charts || {};
  const monthlyData = charts.monthlyData || [];
  const cropDist = charts.cropDistribution || [];

  const profitData = monthlyData.map(d => ({ ...d, profit: d.revenue - d.cost }));

  const kpiData = [
    { label:'Total Investment', value:`₹${((ov.totalInvestment||0)/1000).toFixed(1)}K`, icon:'💸', color:'#dc2626' },
    { label:'Total Revenue', value:`₹${((ov.totalRevenue||0)/1000).toFixed(1)}K`, icon:'📈', color:'#2563eb' },
    { label:'Net Profit', value:`₹${((ov.totalProfit||0)/1000).toFixed(1)}K`, icon:'💰', color:'#16a34a' },
    { label:'ROI', value: ov.totalInvestment > 0 ? `${((ov.totalProfit/ov.totalInvestment)*100).toFixed(1)}%` : '0%', icon:'🎯', color:'#7c3aed' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>📊 Farm Analytics</h1>
        <p>Comprehensive view of your farming performance and financials</p>
      </div>

      {/* KPI Cards */}
      <div className="stat-grid" style={{ marginBottom:24 }}>
        {kpiData.map((k, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background:`${k.color}15`, fontSize:'1.5rem' }}>{k.icon}</div>
            <div>
              <div className="stat-val" style={{ color:k.color }}>{k.value}</div>
              <div className="stat-label">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {/* Revenue vs Cost Bar */}
        <div className="card">
          <h3 style={{ fontWeight:700, color:'#14532d', marginBottom:16 }}>📊 Revenue vs Cost (6 Months)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
              <XAxis dataKey="month" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="revenue" fill="#16a34a" name="Revenue" radius={[4,4,0,0]} />
              <Bar dataKey="cost" fill="#f59e0b" name="Cost" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Profit Trend Line */}
        <div className="card">
          <h3 style={{ fontWeight:700, color:'#14532d', marginBottom:16 }}>📈 Profit Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
              <XAxis dataKey="month" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="profit" stroke="#16a34a" strokeWidth={3} dot={{ fill:'#16a34a', r:5 }} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Crop Distribution */}
        <div className="card">
          <h3 style={{ fontWeight:700, color:'#14532d', marginBottom:16 }}>🌱 Crop Portfolio</h3>
          {cropDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={cropDist} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                  {cropDist.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign:'center', padding:40, color:'#4b5563' }}>Add crops to see distribution</div>}
        </div>

        {/* Farm Summary */}
        <div className="card">
          <h3 style={{ fontWeight:700, color:'#14532d', marginBottom:16 }}>🏡 Farm Summary</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[
              ['Total Farms', ov.totalFarms || 0, '#16a34a'],
              ['Total Crop Area', `${ov.totalArea || 0} acres`, '#2563eb'],
              ['Active Crops', ov.activeCrops || 0, '#d97706'],
              ['Harvested Crops', ov.harvestedCrops || 0, '#7c3aed'],
              ['Total Crops', ov.totalCrops || 0, '#0891b2'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'#f0fdf4', borderRadius:8, border:`1px solid #d1fae5` }}>
                <span style={{ color:'#374151', fontSize:'.9rem' }}>{label}</span>
                <span style={{ fontWeight:800, color, fontSize:'1rem' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
