import { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function Market() {
  const [prices, setPrices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/market/prices').then(r => setPrices(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = prices.filter(p => p.crop.toLowerCase().includes(search.toLowerCase()));
  const trendIcon = { up:<TrendingUp size={14}/>, down:<TrendingDown size={14}/>, stable:<Minus size={14}/> };
  const trendStyle = { up:'price-trend-up', down:'price-trend-down', stable:'price-trend-stable' };

  return (
    <div>
      <div className="page-header">
        <h1>📈 Market Prices</h1>
        <p>Current crop and fruit market prices across India — Updated daily</p>
      </div>

      <div style={{ display:'flex', gap:16, marginBottom:20, alignItems:'center', flexWrap:'wrap' }}>
        <input className="form-control" style={{ maxWidth:300 }} placeholder="🔍 Search crop..." value={search} onChange={e => setSearch(e.target.value)} />
        <span style={{ color:'#4b5563', fontSize:'.88rem' }}>{filtered.length} crops listed</span>
        <span style={{ marginLeft:'auto', fontSize:'.82rem', color:'#4b5563' }}>
          📅 Updated: {new Date().toLocaleDateString('en-IN')} &nbsp;|&nbsp; Source: APMC Mandi Data
        </span>
      </div>

      {loading ? <div className="loading"><div className="spinner"></div>Loading prices...</div> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {filtered.map(p => (
            <div key={p.crop} className="price-card">
              <div>
                <div style={{ fontWeight:800, fontSize:'1rem', color:'#14532d', textTransform:'capitalize' }}>{p.crop}</div>
                <div style={{ fontSize:'.78rem', color:'#4b5563', marginTop:2 }}>Per Quintal (100 kg)</div>
                <div style={{ fontSize:'.75rem', color:'#4b5563', marginTop:6 }}>
                  Demand: <span style={{ fontWeight:600 }}>{p.demand}</span>
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#14532d' }}>₹{p.price?.toLocaleString()}</div>
                <div className={trendStyle[p.trend] || 'price-trend-stable'} style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'flex-end', fontSize:'.85rem', fontWeight:600 }}>
                  {trendIcon[p.trend]} {p.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
