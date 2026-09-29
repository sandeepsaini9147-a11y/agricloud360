import { useState, useRef } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Upload, Microscope } from 'lucide-react';

const cropTypes = ['mango','apple','banana','tomato','potato','onion','wheat','rice','grapes','guava','papaya','corn'];

export default function Disease() {
  const [form, setForm] = useState({ cropType:'mango', symptoms:'' });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setImageBase64(ev.target.result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageBase64 && !form.symptoms) { toast.error('Please upload an image or describe symptoms'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/disease/detect', { imageBase64, cropType: form.cropType, symptoms: form.symptoms });
      setResult(data);
      toast.success('Detection complete! 🔬');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Detection failed');
    } finally { setLoading(false); }
  };

  const sevColor = { high:'red', medium:'amber', low:'green', none:'green' };

  return (
    <div>
      <div className="page-header">
        <h1>🔬 Fruit & Plant Disease Detection</h1>
        <p>Upload a leaf/fruit image or describe symptoms to detect disease and get treatment</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:24 }}>
        {/* Input */}
        <div>
          <div className="card" style={{ marginBottom:20 }}>
            <h3 style={{ fontWeight:700, color:'#14532d', marginBottom:16 }}>📸 Upload Image</h3>
            <div className="upload-area" onClick={() => fileRef.current.click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="Crop" style={{ maxWidth:'100%', maxHeight:200, borderRadius:8, objectFit:'contain' }} />
              ) : (
                <>
                  <div style={{ fontSize:'3rem', marginBottom:8 }}>📷</div>
                  <div style={{ fontWeight:700, color:'#16a34a', marginBottom:4 }}>Click to upload leaf/fruit image</div>
                  <div style={{ fontSize:'.82rem', color:'#4b5563' }}>JPG, PNG — max 5MB. Clear, well-lit images work best.</div>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display:'none' }} />
            {imagePreview && (
              <button className="btn btn-outline btn-sm" style={{ marginTop:10, width:'100%', justifyContent:'center' }} onClick={() => { setImagePreview(null); setImageBase64(''); }}>
                🗑️ Remove Image
              </button>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontWeight:700, color:'#14532d', marginBottom:16 }}>🌿 Additional Details</h3>
            <div className="form-group">
              <label>Crop Type</label>
              <select className="form-control" value={form.cropType} onChange={e => setForm({...form, cropType:e.target.value})}>
                {cropTypes.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Describe Symptoms (optional)</label>
              <textarea className="form-control" rows={4} value={form.symptoms} onChange={e => setForm({...form, symptoms:e.target.value})}
                placeholder="e.g. Yellow spots on leaves, white powdery coating, curling leaves, black spots on fruit..." />
            </div>
            <button className="btn btn-green btn-lg" style={{ width:'100%', justifyContent:'center' }} onClick={handleSubmit} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width:20, height:20, borderWidth:3, marginRight:8 }}></span>Analyzing...</> : <><Microscope size={18} /> Detect Disease</>}
            </button>
          </div>
        </div>

        {/* Results */}
        <div>
          {!result ? (
            <div className="card" style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ fontSize:'4rem', marginBottom:16 }}>🔬</div>
              <h3 style={{ color:'#14532d', marginBottom:8 }}>AI Disease Detection</h3>
              <p style={{ color:'#4b5563', maxWidth:320, margin:'0 auto' }}>Upload a clear image of your affected crop leaf or fruit. Our AI model will identify the disease and suggest treatment.</p>
              <div style={{ marginTop:24, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {['Apple Scab','Powdery Mildew','Anthracnose','Leaf Curl','Bacterial Blight','Fruit Rot'].map(d => (
                  <div key={d} style={{ background:'#f0fdf4', padding:'8px 12px', borderRadius:8, fontSize:'.82rem', color:'#166534', fontWeight:500 }}>🔴 {d}</div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className={`disease-result disease-${sevColor[result.severity] || 'medium'}`}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                  <div>
                    <div style={{ fontSize:'.82rem', color:'#4b5563', marginBottom:4 }}>Detection Result</div>
                    <h2 style={{ fontSize:'1.4rem', fontWeight:800, color:'#14532d' }}>{result.disease}</h2>
                    <div style={{ fontSize:'.88rem', color:'#4b5563', marginTop:4 }}>Crop: {result.crop}</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'1.8rem', fontWeight:800, color: result.confidence >= 80 ? '#16a34a' : result.confidence >= 60 ? '#d97706' : '#dc2626' }}>
                      {result.confidence}%
                    </div>
                    <div style={{ fontSize:'.75rem', color:'#4b5563' }}>Confidence</div>
                  </div>
                </div>

                <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                  <span className={`badge badge-${sevColor[result.severity] || 'amber'}`}>
                    Severity: {result.severity?.charAt(0).toUpperCase() + result.severity?.slice(1)}
                  </span>
                  <span className="badge badge-blue">AI Detected</span>
                </div>

                <div style={{ marginBottom:14 }}>
                  <div style={{ fontWeight:700, color:'#14532d', marginBottom:6 }}>🦠 Cause</div>
                  <p style={{ color:'#374151', fontSize:'.9rem' }}>{result.cause}</p>
                </div>

                <div style={{ marginBottom:14 }}>
                  <div style={{ fontWeight:700, color:'#dc2626', marginBottom:8 }}>💊 Chemical Treatment</div>
                  {(result.treatment || []).map((t, i) => (
                    <div key={i} style={{ background:'#fff', padding:'8px 12px', borderRadius:6, marginBottom:6, fontSize:'.88rem', color:'#374151', border:'1px solid #fecaca' }}>
                      {i+1}. {t}
                    </div>
                  ))}
                </div>

                {result.organic && (
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontWeight:700, color:'#16a34a', marginBottom:6 }}>🌿 Organic Treatment</div>
                    <div style={{ background:'#f0fdf4', padding:'10px 14px', borderRadius:6, fontSize:'.88rem', color:'#166534', border:'1px solid #bbf7d0' }}>
                      {result.organic}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ fontWeight:700, color:'#d97706', marginBottom:8 }}>🛡️ Prevention</div>
                  {(result.prevention || []).map((p, i) => (
                    <div key={i} style={{ fontSize:'.88rem', color:'#374151', padding:'4px 0', display:'flex', gap:8 }}>
                      <span>✅</span> {p}
                    </div>
                  ))}
                </div>

                {result.note && (
                  <div className="alert alert-blue" style={{ marginTop:14 }}>
                    <span>ℹ️</span> <span style={{ fontSize:'.85rem' }}>{result.note}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
