import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const indianStates = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Nagaland','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal'];

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', state:'', district:'' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to AgriCloud360 🌾');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth:520 }}>
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ fontSize:'2.5rem' }}>🌱</div>
          <h1>Join AgriCloud360</h1>
          <p>Create your farmer profile</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-control" placeholder="Your name" value={form.name} onChange={e => setForm({...form,name:e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-control" placeholder="Mobile number" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password (min 6 characters)</label>
            <input className="form-control" type="password" placeholder="Create password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>State</label>
              <select className="form-control" value={form.state} onChange={e => setForm({...form,state:e.target.value})}>
                <option value="">Select State</option>
                {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>District</label>
              <input className="form-control" placeholder="Your district" value={form.district} onChange={e => setForm({...form,district:e.target.value})} />
            </div>
          </div>
          <button type="submit" className="btn btn-green btn-lg" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
            {loading ? 'Creating...' : '🌾 Create Account'}
          </button>
        </form>
        <div className="auth-link">Already have an account? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  );
}
