import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🌾');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:'3.5rem', marginBottom:8 }}>🌾</div>
          <h1>AgriCloud360</h1>
          <p>Smart Farming & Fruit Intelligence Platform</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" placeholder="Your password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
          </div>
          <button type="submit" className="btn btn-green btn-lg" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
            {loading ? '🌱 Signing in...' : '🚀 Sign In'}
          </button>
        </form>
        <div className="auth-link">Don't have an account? <Link to="/register">Register here</Link></div>
        <div style={{ marginTop:20, padding:14, background:'#f0fdf4', borderRadius:8, fontSize:'.82rem', border:'1px solid #bbf7d0' }}>
          <strong>🌾 Demo Account:</strong><br />
          Email: farmer@agri.com<br />
          Password: farmer123
        </div>
      </div>
    </div>
  );
}
