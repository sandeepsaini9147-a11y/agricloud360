import { useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const seasons = ['kharif', 'rabi', 'zaid', 'year-round'];
const soilTypes = ['clay', 'sandy', 'loamy', 'silt', 'black', 'red'];

export default function Recommend() {
  const [form, setForm] = useState({ nitrogen:80, phosphorus:40, potassium:40, temperature:25, humidity:65, ph:6.5, rainfall:100, season:'kharif', soilType:'loamy', location:'' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/recommend/crop', form);
      setResult(data);
      toast.success('Recommendations ready! 🌱');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Recommendation failed');
    } finally { setLoading(false); }
  };

  const typeColor = { fruit:'#f59e0b', vegetable:'#10b981', grain:'#3b82f6', oilseed:'#8b5cf6', pulse:'#06b6d4' };
  const typeEmoji = { fruit:'🍎', vegetable:'🥦', grain:'🌾', oilseed:'🌻', pulse:'🫘' };

  return (
    <div>
      <div className="page-header">
        <h1>🌱 Smart Crop Recommendation</h1>
        <p>Enter your soil and climate data to get AI-powered crop suggestions</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:24 }}>
        {/* Input Form */}
        <div className="card">
          <h3 style={{ fontWeight:700, color:'#14532d', marginBottom:20 }}>📋 Enter Farm Parameters</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ background:'#f0fdf4', padding:14, borderRadius:8, marginBottom:16 }}>
              <div style={{ fontWeight:700, color:'#166534', marginBottom:10 }}>🌿 Soil Nutrients (kg/ha)</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nitrogen (N)</label>
                  <input className="form-control" type="number" value={form.nitrogen} onChange={e => setForm({...form,nitrogen:e.target.value})} placeholder="0-200" min="0" max="200" />
                </div>
                <div className="form-group">
                  <label>Phosphorus (P)</label>
                  <input className="form-control" type="number" value={form.phosphorus} onChange={e => setForm({...form,phosphorus:e.target.value})} placeholder="0-100" min="0" max="100" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Potassium (K)</label>
                  <input className="form-control" type="number" value={form.potassium} onChange={e => setForm({...form,potassium:e.target.value})} placeholder="0-100" min="0" max="100" />
                </div>
                <div className="form-group">
                  <label>Soil pH</label>
                  <input className="form-control" type="number" step="0.1" value={form.ph} onChange={e => setForm({...form,ph:e.target.value})} placeholder="4.0-9.0" min="4" max="9" />
                </div>
              </div>
            </div>

            <div style={{ background:'#eff6ff', padding:14, borderRadius:8, marginBottom:16 }}>
              <div style={{ fontWeight:700, color:'#1e40af', marginBottom:10 }}>🌡️ Climate Conditions</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Temperature (°C)</label>
                  <input className="form-control" type="number" value={form.temperature} onChange={e => setForm({...form,temperature:e.target.value})} placeholder="10-45" />
                </div>
                <div className="form-group">
                  <label>Humidity (%)</label>
                  <input className="form-control" type="number" value={form.humidity} onChange={e => setForm({...form,humidity:e.target.value})} placeholder="30-100" />
                </div>
              </div>
              <div className="form-group">
                <label>Annual Rainfall (mm)</label>
                <input className="form-control" type="number" value={form.rainfall} onChange={e => setForm({...form,rainfall:e.target.value})} placeholder="50-3000" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Season</label>
                <select className="form-control" value={form.season} onChange={e => setForm({...form,season:e.target.value})}>
                  {seasons.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Soil Type</label>
                <select className="form-control" value={form.soilType} onChange={e => setForm({...form,soilType:e.target.value})}>
                  {soilTypes.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Location / State (optional)</label>
              <input className="form-control" value={form.location} onChange={e => setForm({...form,location:e.target.value})} placeholder="e.g. Uttar Pradesh, Lucknow" />
            </div>

            <button type="submit" className="btn btn-green btn-lg" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
              {loading ? '🌿 Analyzing...' : '🚀 Get Recommendations'}
            </button>
          </form>
        </div>

        {/* Results */}
        <div>
          {!result ? (
            <div className="card" style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ fontSize:'4rem', marginBottom:16 }}>🌱</div>
              <h3 style={{ color:'#14532d', marginBottom:8 }}>Ready for Recommendations</h3>
              <p style={{ color:'#4b5563' }}>Fill in your soil and climate parameters, then click "Get Recommendations" to see the best crops for your farm.</p>
            </div>
          ) : (
            <div>
              <h3 style={{ fontWeight:700, color:'#14532d', marginBottom:16 }}>🏆 Top Crop Recommendations</h3>
              {(result.recommendations || []).map((rec, i) => (
                <div key={i} className="rec-card" style={{ marginBottom:14 }}>
                  <div className="rec-rank">#{i + 1}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                    <span style={{ fontSize:'2rem' }}>{typeEmoji[rec.type] || '🌿'}</span>
                    <div>
                      <div style={{ fontWeight:800, fontSize:'1.1rem', color:'#14532d' }}>{rec.crop}</div>
                      <span className="badge" style={{ background:`${typeColor[rec.type] || '#16a34a'}20`, color:typeColor[rec.type] || '#16a34a' }}>
                        {rec.type}
                      </span>
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:10 }}>
                    {[['⏱️ Duration', rec.duration], ['💧 Water Need', rec.water], ['💰 Profit', rec.profit]].map(([l, v]) => (
                      <div key={l} style={{ background:'#f0fdf4', padding:'6px 10px', borderRadius:6 }}>
                        <div style={{ fontSize:'.7rem', color:'#4b5563' }}>{l}</div>
                        <div style={{ fontWeight:600, fontSize:'.85rem', color:'#14532d' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:'.82rem', color:'#4b5563', marginBottom:8 }}>{rec.reason}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                    <span style={{ fontSize:'.8rem', fontWeight:600, color:'#166534' }}>AI Confidence</span>
                    <span style={{ fontSize:'.8rem', fontWeight:800, color:'#16a34a' }}>{rec.confidence}%</span>
                  </div>
                  <div className="confidence-bar"><div className="confidence-fill" style={{ width:`${rec.confidence}%` }} /></div>
                </div>
              ))}

              {/* Soil Health */}
              {result.soilHealth && (
                <div className="card" style={{ marginTop:16, border:'2px solid #d1fae5' }}>
                  <h4 style={{ fontWeight:700, color:'#14532d', marginBottom:12 }}>🌍 Soil Health Analysis</h4>
                  <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:12 }}>
                    <div style={{ fontSize:'2rem', fontWeight:800, color: result.soilHealth.score >= 70 ? '#16a34a' : result.soilHealth.score >= 40 ? '#d97706' : '#dc2626' }}>
                      {result.soilHealth.score}/100
                    </div>
                    <span className={`badge badge-${result.soilHealth.status === 'Excellent' || result.soilHealth.status === 'Good' ? 'green' : result.soilHealth.status === 'Fair' ? 'amber' : 'red'}`}>
                      {result.soilHealth.status}
                    </span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom:12 }}>
                    <div className="progress-fill" style={{ width:`${result.soilHealth.score}%` }} />
                  </div>
                  {(result.soilHealth.recommendations || []).map((r, i) => (
                    <div key={i} style={{ fontSize:'.85rem', color:'#4b5563', padding:'4px 0', borderBottom:'1px solid #f0fdf4' }}>💡 {r}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
