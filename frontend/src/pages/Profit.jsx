import { useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Profit() {
  const [form, setForm] = useState({ cropName:'mango', landArea:1, seedCost:2000, fertilizerCost:3000, labourCost:4000, otherCost:1000, expectedYield:25, marketPrice:4500 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalc = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/market/profit-prediction', form);
      setResult(data);
      toast.success('Profit calculated! 💰');
    } catch (err) { toast.error('Calculation failed'); }
    finally { setLoading(false); }
  };

  const COLORS = ['#16a34a','#f59e0b','#3b82f6','#ef4444'];

  return (
    <div>
      <div className="page-header">
        <h1>💰 Profit Calculator & Yield Prediction</h1>
        <p>Estimate your expected profit before investing in a crop</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:24 }}>
        <div className="card">
          <h3 style={{ fontWeight:700, color:'#14532d', marginBottom:20 }}>📊 Enter Crop Details</h3>
          <form onSubmit={handleCalc}>
            <div className="form-row">
              <div className="form-group">
                <label>Crop Name</label>
                <input className="form-control" value={form.cropName} onChange={e => setForm({...form,cropName:e.target.value})} placeholder="e.g. Mango" required />
              </div>
              <div className="form-group">
                <label>Land Area (Acres)</label>
                <input className="form-control" type="number" value={form.landArea} onChange={e => setForm({...form,landArea:e.target.value})} min="0.1" step="0.1" required />
              </div>
            </div>
            <div style={{ background:'#fef3c7', padding:14, borderRadius:8, marginBottom:16 }}>
              <div style={{ fontWeight:700, color:'#92400e', marginBottom:10 }}>💸 Input Costs (₹ per acre)</div>
              <div className="form-row">
                <div className="form-group"><label>Seed Cost (₹)</label><input className="form-control" type="number" value={form.seedCost} onChange={e => setForm({...form,seedCost:e.target.value})} /></div>
                <div className="form-group"><label>Fertilizer Cost (₹)</label><input className="form-control" type="number" value={form.fertilizerCost} onChange={e => setForm({...form,fertilizerCost:e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Labour Cost (₹)</label><input className="form-control" type="number" value={form.labourCost} onChange={e => setForm({...form,labourCost:e.target.value})} /></div>
                <div className="form-group"><label>Other Costs (₹)</label><input className="form-control" type="number" value={form.otherCost} onChange={e => setForm({...form,otherCost:e.target.value})} /></div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expected Yield (quintal/acre)</label>
                <input className="form-control" type="number" value={form.expectedYield} onChange={e => setForm({...form,expectedYield:e.target.value})} />
              </div>
              <div className="form-group">
                <label>Market Price (₹/quintal)</label>
                <input className="form-control" type="number" value={form.marketPrice} onChange={e => setForm({...form,marketPrice:e.target.value})} />
              </div>
            </div>
            <button type="submit" className="btn btn-green btn-lg" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
              {loading ? '⏳ Calculating...' : '💰 Calculate Profit'}
            </button>
          </form>
        </div>

        <div>
          {!result ? (
            <div className="card" style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ fontSize:'4rem', marginBottom:16 }}>💰</div>
              <h3 style={{ color:'#14532d', marginBottom:8 }}>Profit Prediction Engine</h3>
              <p style={{ color:'#4b5563' }}>Enter your crop details, costs, and expected yield on the left to calculate estimated profit and ROI.</p>
            </div>
          ) : (
            <div>
              <div className={`profit-box ${result.profitStatus === 'profitable' ? 'profit-positive' : 'profit-negative'}`}>
                <div style={{ fontSize:'1rem', marginBottom:8, fontWeight:600 }}>Expected Profit</div>
                <div className="profit-amount" style={{ color: result.profitStatus === 'profitable' ? '#15803d' : '#dc2626' }}>
                  {result.profitStatus === 'profitable' ? '+' : ''}₹{result.expectedProfit?.toLocaleString()}
                </div>
                <div style={{ marginTop:8, fontSize:'.9rem', color:'#374151' }}>ROI: <strong>{result.roi}</strong> &nbsp;|&nbsp; Break-even: <strong>{result.breakEvenPrice}</strong></div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, margin:'16px 0' }}>
                {[
                  ['💸 Total Cost', `₹${result.totalCost?.toLocaleString()}`, '#dc2626'],
                  ['📈 Revenue', `₹${result.expectedRevenue?.toLocaleString()}`, '#2563eb'],
                  ['💰 Profit', `₹${result.expectedProfit?.toLocaleString()}`, result.profitStatus === 'profitable' ? '#16a34a' : '#dc2626'],
                ].map(([l,v,c]) => (
                  <div key={l} style={{ background:'#fff', border:`2px solid ${c}30`, borderRadius:10, padding:'12px 14px', textAlign:'center' }}>
                    <div style={{ fontSize:'.78rem', color:'#4b5563' }}>{l}</div>
                    <div style={{ fontWeight:800, color:c, fontSize:'1rem' }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Cost breakdown chart */}
              <div className="card">
                <h4 style={{ fontWeight:700, color:'#14532d', marginBottom:12 }}>📊 Cost Breakdown</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={[
                      { name:'Seed', value: result.costBreakdown?.seed || 0 },
                      { name:'Fertilizer', value: result.costBreakdown?.fertilizer || 0 },
                      { name:'Labour', value: result.costBreakdown?.labour || 0 },
                      { name:'Others', value: result.costBreakdown?.other || 0 },
                    ]} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({name,percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                      {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className={`alert ${result.profitStatus === 'profitable' ? 'alert-green' : 'alert-red'}`} style={{ marginTop:12 }}>
                <span>{result.profitStatus === 'profitable' ? '✅' : '⚠️'}</span>
                <span style={{ fontSize:'.88rem' }}>{result.advice}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
