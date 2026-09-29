import { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, MapPin } from 'lucide-react';

const soilTypes = ['clay','sandy','loamy','silt','peaty','chalky','black'];
const irrigSources = ['rain','canal','borewell','river','pond','mixed'];
const indianStates = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Nagaland','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal'];

const emptyFarm = { name:'', location:'', state:'', district:'', totalArea:'', soilType:'loamy', irrigationSource:'rain', description:'' };

export default function Farms() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyFarm);

  const fetchFarms = async () => {
    try { const { data } = await API.get('/farms'); setFarms(data.farms); }
    catch { toast.error('Failed to load farms'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFarms(); }, []);

  const openNew = () => { setForm(emptyFarm); setEditing(null); setShowModal(true); };
  const openEdit = (farm) => { setForm({ name:farm.name, location:farm.location, state:farm.state, district:farm.district||'', totalArea:farm.totalArea, soilType:farm.soilType, irrigationSource:farm.irrigationSource, description:farm.description||'' }); setEditing(farm._id); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await API.put(`/farms/${editing}`, form); toast.success('Farm updated!'); }
      else { await API.post('/farms', form); toast.success('Farm created! 🏡'); }
      setShowModal(false); fetchFarms();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this farm?')) return;
    try { await API.delete(`/farms/${id}`); toast.success('Farm deleted'); fetchFarms(); }
    catch { toast.error('Delete failed'); }
  };

  const soilEmoji = { clay:'🔴', sandy:'🟡', loamy:'🟤', silt:'⚫', peaty:'🟫', chalky:'⚪', black:'⬛' };

  return (
    <div>
      <div className="page-header">
        <h1>🏡 My Farms</h1>
        <p>Manage your farm profiles and digital twins</p>
      </div>
      <div className="section-header">
        <span style={{ color:'#4b5563' }}>{farms.length} farm(s) registered</span>
        <button className="btn btn-green" onClick={openNew}><Plus size={16} /> Add New Farm</button>
      </div>

      {loading ? <div className="loading"><div className="spinner"></div>Loading...</div> :
       farms.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <div style={{ fontSize:'4rem', marginBottom:16 }}>🏡</div>
          <h3 style={{ color:'#14532d', marginBottom:8 }}>No farms yet</h3>
          <p style={{ color:'#4b5563', marginBottom:20 }}>Add your first farm to start managing your agriculture</p>
          <button className="btn btn-green" onClick={openNew}><Plus size={16} /> Add First Farm</button>
        </div>
      ) : (
        <div className="card-grid">
          {farms.map(farm => (
            <div key={farm._id} className="card" style={{ borderLeft:'4px solid #16a34a' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div>
                  <h3 style={{ fontSize:'1.1rem', fontWeight:700, color:'#14532d' }}>{farm.name}</h3>
                  <div style={{ display:'flex', alignItems:'center', gap:4, color:'#4b5563', fontSize:'.88rem', marginTop:4 }}>
                    <MapPin size={13} /> {farm.location}
                  </div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(farm)}><Edit size={13} /></button>
                  <button className="btn btn-red btn-sm" onClick={() => handleDelete(farm._id)}><Trash2 size={13} /></button>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  ['📐 Total Area', `${farm.totalArea} acres`],
                  ['🌍 State', farm.state],
                  [`${soilEmoji[farm.soilType]} Soil Type`, farm.soilType.charAt(0).toUpperCase()+farm.soilType.slice(1)],
                  ['💧 Irrigation', farm.irrigationSource.charAt(0).toUpperCase()+farm.irrigationSource.slice(1)],
                ].map(([label, val]) => (
                  <div key={label} style={{ background:'#f0fdf4', padding:'8px 12px', borderRadius:8 }}>
                    <div style={{ fontSize:'.75rem', color:'#4b5563' }}>{label}</div>
                    <div style={{ fontWeight:600, color:'#14532d', fontSize:'.88rem' }}>{val}</div>
                  </div>
                ))}
              </div>
              {farm.description && <p style={{ marginTop:12, color:'#4b5563', fontSize:'.85rem', borderTop:'1px solid #d1fae5', paddingTop:10 }}>{farm.description}</p>}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h2>{editing ? '✏️ Edit Farm' : '🏡 Add New Farm'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Farm Name *</label><input className="form-control" value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="e.g. Green Valley Farm" required /></div>
                <div className="form-group"><label>Total Area (Acres) *</label><input className="form-control" type="number" value={form.totalArea} onChange={e => setForm({...form,totalArea:e.target.value})} placeholder="e.g. 5" required /></div>
              </div>
              <div className="form-group"><label>Location / Village *</label><input className="form-control" value={form.location} onChange={e => setForm({...form,location:e.target.value})} placeholder="e.g. Village Rampur, District Lucknow" required /></div>
              <div className="form-row">
                <div className="form-group"><label>State *</label>
                  <select className="form-control" value={form.state} onChange={e => setForm({...form,state:e.target.value})} required>
                    <option value="">Select State</option>
                    {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>District</label><input className="form-control" value={form.district} onChange={e => setForm({...form,district:e.target.value})} placeholder="District name" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Soil Type</label>
                  <select className="form-control" value={form.soilType} onChange={e => setForm({...form,soilType:e.target.value})}>
                    {soilTypes.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Irrigation Source</label>
                  <select className="form-control" value={form.irrigationSource} onChange={e => setForm({...form,irrigationSource:e.target.value})}>
                    {irrigSources.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Description (optional)</label><textarea className="form-control" rows={2} value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="Notes about this farm..." /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-green">{editing ? '💾 Update Farm' : '🏡 Create Farm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
