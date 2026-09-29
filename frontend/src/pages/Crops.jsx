import { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, Sprout } from 'lucide-react';

const cropTypes = ['fruit','vegetable','grain','pulse','oilseed','spice','fiber','other'];
const statuses = ['planted','growing','flowering','fruiting','harvested','failed'];
const statusColor = { planted:'green', growing:'green', flowering:'amber', fruiting:'amber', harvested:'blue', failed:'red' };

export default function Crops() {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({
    farm:'', cropName:'', cropType:'fruit', variety:'', area:'',
    plantationDate:'', seedCost:'', fertilizerCost:'', labourCost:'', otherCost:'',
    expectedYield:'', expectedPrice:'', status:'planted', notes:''
  });

  const fetchAll = async () => {
    try {
      const [c, f] = await Promise.all([API.get('/crops'), API.get('/farms')]);
      setCrops(c.data.crops); setFarms(f.data.farms);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openNew = () => {
    setForm({ farm: farms[0]?._id || '', cropName:'', cropType:'fruit', variety:'', area:'', plantationDate: new Date().toISOString().split('T')[0], seedCost:'', fertilizerCost:'', labourCost:'', otherCost:'', expectedYield:'', expectedPrice:'', status:'planted', notes:'' });
    setEditing(null); setShowModal(true);
  };

  const openEdit = (crop) => {
    setForm({
      farm: crop.farm?._id || crop.farm, cropName: crop.cropName, cropType: crop.cropType,
      variety: crop.variety || '', area: crop.area, status: crop.status,
      plantationDate: crop.plantationDate ? crop.plantationDate.split('T')[0] : '',
      seedCost: crop.seedCost, fertilizerCost: crop.fertilizerCost, labourCost: crop.labourCost, otherCost: crop.otherCost,
      expectedYield: crop.expectedYield, expectedPrice: crop.expectedPrice, notes: crop.notes || ''
    });
    setEditing(crop._id); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await API.put(`/crops/${editing}`, form); toast.success('Crop updated!'); }
      else { await API.post('/crops', form); toast.success('Crop added! 🌱 Calendar auto-generated.'); }
      setShowModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this crop record?')) return;
    try { await API.delete(`/crops/${id}`); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = crops.filter(c => statusFilter === 'all' || c.status === statusFilter);

  const cropEmoji = { fruit:'🍎', vegetable:'🥦', grain:'🌾', pulse:'🫘', oilseed:'🌻', spice:'🌶️', fiber:'🪢', other:'🌿' };

  const daysSince = (date) => Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));

  return (
    <div>
      <div className="page-header">
        <h1>🌱 My Crops</h1>
        <p>Manage crop records, track growth, and monitor investments</p>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {['all',...statuses].map(s => (
            <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-green' : 'btn-outline'}`} onClick={() => setStatusFilter(s)} style={{ textTransform:'capitalize' }}>
              {s === 'all' ? '📋 All' : s}
            </button>
          ))}
        </div>
        <button className="btn btn-green" onClick={openNew} disabled={farms.length === 0}>
          <Plus size={16} /> Add Crop
        </button>
      </div>

      {farms.length === 0 && (
        <div className="alert alert-amber"><span>⚠️</span><span>Please <a href="/farms" style={{ fontWeight:700 }}>add a farm first</a> before adding crops.</span></div>
      )}

      {loading ? <div className="loading"><div className="spinner"></div>Loading crops...</div> :
       filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <div style={{ fontSize:'4rem', marginBottom:16 }}>🌱</div>
          <h3 style={{ color:'#14532d' }}>No crops yet</h3>
          <p style={{ color:'#4b5563', marginBottom:20 }}>Add your first crop to start tracking growth and generating farming schedules</p>
          <button className="btn btn-green" onClick={openNew} disabled={farms.length === 0}><Plus size={16}/> Add First Crop</button>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map(crop => {
            const daysOld = daysSince(crop.plantationDate);
            const totalCost = (crop.seedCost + crop.fertilizerCost + crop.labourCost + crop.otherCost) * crop.area;
            const expectedRev = crop.expectedYield * crop.area * (crop.expectedPrice / 100);
            return (
              <div key={crop._id} className={`crop-card crop-type-${crop.cropType}`}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:'2rem' }}>{cropEmoji[crop.cropType]}</span>
                    <div>
                      <div style={{ fontWeight:800, fontSize:'1.05rem', color:'#14532d' }}>{crop.cropName}</div>
                      {crop.variety && <div style={{ fontSize:'.78rem', color:'#4b5563' }}>Variety: {crop.variety}</div>}
                      <div style={{ fontSize:'.78rem', color:'#4b5563' }}>🏡 {crop.farm?.name || 'Farm'}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(crop)}><Edit size={12}/></button>
                    <button className="btn btn-red btn-sm" onClick={() => handleDelete(crop._id)}><Trash2 size={12}/></button>
                  </div>
                </div>

                <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                  <span className={`badge badge-${statusColor[crop.status]}`} style={{ textTransform:'capitalize' }}>{crop.status}</span>
                  <span className="badge badge-blue">{crop.area} acres</span>
                  <span className="badge" style={{ background:'#f0fdf4', color:'#166534' }}>{daysOld}d old</span>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                  {[
                    ['📅 Planted', new Date(crop.plantationDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })],
                    ['🌾 Harvest', crop.expectedHarvestDate ? new Date(crop.expectedHarvestDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : 'TBD'],
                    ['💸 Cost', `₹${totalCost.toLocaleString()}`],
                    ['📈 Expected Rev', `₹${Math.round(expectedRev).toLocaleString()}`],
                  ].map(([l, v]) => (
                    <div key={l} style={{ background:'#f0fdf4', padding:'6px 10px', borderRadius:6 }}>
                      <div style={{ fontSize:'.72rem', color:'#4b5563' }}>{l}</div>
                      <div style={{ fontWeight:600, color:'#14532d', fontSize:'.85rem' }}>{v}</div>
                    </div>
                  ))}
                </div>

                {crop.diseaseHistory?.some(d => !d.resolved) && (
                  <div className="alert alert-red" style={{ padding:'6px 10px', fontSize:'.8rem' }}>
                    <span>🔴</span><span>Active disease issue — check immediately</span>
                  </div>
                )}
                {crop.notes && <p style={{ fontSize:'.8rem', color:'#4b5563', marginTop:8, fontStyle:'italic' }}>{crop.notes.slice(0,80)}...</p>}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth:680 }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h2>{editing ? '✏️ Edit Crop' : '🌱 Add New Crop'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Farm *</label>
                  <select className="form-control" value={form.farm} onChange={e => setForm({...form,farm:e.target.value})} required>
                    <option value="">Select Farm</option>
                    {farms.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Crop Type *</label>
                  <select className="form-control" value={form.cropType} onChange={e => setForm({...form,cropType:e.target.value})}>
                    {cropTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Crop Name *</label>
                  <input className="form-control" value={form.cropName} onChange={e => setForm({...form,cropName:e.target.value})} placeholder="e.g. Mango, Tomato" required />
                </div>
                <div className="form-group">
                  <label>Variety</label>
                  <input className="form-control" value={form.variety} onChange={e => setForm({...form,variety:e.target.value})} placeholder="e.g. Dasheri, Hybrid" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Area (Acres) *</label>
                  <input className="form-control" type="number" step="0.1" value={form.area} onChange={e => setForm({...form,area:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Plantation Date *</label>
                  <input className="form-control" type="date" value={form.plantationDate} onChange={e => setForm({...form,plantationDate:e.target.value})} required />
                </div>
              </div>
              <div style={{ background:'#fef3c7', padding:12, borderRadius:8, marginBottom:14 }}>
                <div style={{ fontWeight:700, color:'#92400e', marginBottom:10 }}>💸 Costs (₹ per acre)</div>
                <div className="form-row">
                  <div className="form-group"><label>Seed Cost</label><input className="form-control" type="number" value={form.seedCost} onChange={e => setForm({...form,seedCost:e.target.value})} placeholder="0" /></div>
                  <div className="form-group"><label>Fertilizer Cost</label><input className="form-control" type="number" value={form.fertilizerCost} onChange={e => setForm({...form,fertilizerCost:e.target.value})} placeholder="0" /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Labour Cost</label><input className="form-control" type="number" value={form.labourCost} onChange={e => setForm({...form,labourCost:e.target.value})} placeholder="0" /></div>
                  <div className="form-group"><label>Other Costs</label><input className="form-control" type="number" value={form.otherCost} onChange={e => setForm({...form,otherCost:e.target.value})} placeholder="0" /></div>
                </div>
              </div>
              <div className="form-row-3">
                <div className="form-group"><label>Expected Yield (q/acre)</label><input className="form-control" type="number" value={form.expectedYield} onChange={e => setForm({...form,expectedYield:e.target.value})} placeholder="e.g. 25" /></div>
                <div className="form-group"><label>Market Price (₹/q)</label><input className="form-control" type="number" value={form.expectedPrice} onChange={e => setForm({...form,expectedPrice:e.target.value})} placeholder="e.g. 4500" /></div>
                <div className="form-group"><label>Status</label>
                  <select className="form-control" value={form.status} onChange={e => setForm({...form,status:e.target.value})}>
                    {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Notes</label><textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} placeholder="Any observations..." /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-green">{editing ? '💾 Update' : '🌱 Add Crop & Generate Calendar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
