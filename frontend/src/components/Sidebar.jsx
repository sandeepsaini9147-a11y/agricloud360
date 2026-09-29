import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Sprout, Building2, CloudSun, TrendingUp, Microscope, Calendar, ShoppingCart, Calculator, LogOut } from 'lucide-react';

const navItems = [
  { label: 'Main', items: [
    { to: '/dashboard', icon: <LayoutDashboard size={17} />, label: 'Dashboard' },
    { to: '/farms', icon: <Building2 size={17} />, label: 'My Farms' },
    { to: '/crops', icon: <Sprout size={17} />, label: 'My Crops' },
  ]},
  { label: 'Smart Tools', items: [
    { to: '/recommend', icon: <Sprout size={17} />, label: 'Crop Recommendation' },
    { to: '/disease', icon: <Microscope size={17} />, label: 'Disease Detection' },
    { to: '/weather', icon: <CloudSun size={17} />, label: 'Weather & Irrigation' },
    { to: '/calendar', icon: <Calendar size={17} />, label: 'Farming Calendar' },
  ]},
  { label: 'Market & Finance', items: [
    { to: '/market', icon: <ShoppingCart size={17} />, label: 'Market Prices' },
    { to: '/profit', icon: <Calculator size={17} />, label: 'Profit Calculator' },
    { to: '/analytics', icon: <TrendingUp size={17} />, label: 'Analytics' },
  ]}
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1>🌾 AgriCloud360</h1>
        <p>Smart Farming Platform</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(section => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map(item => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-block">
          <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</div>
            <div className="user-role">{user?.state || 'Farmer'}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ width:'100%', marginTop:10, color:'#86efac', borderColor:'rgba(255,255,255,.3)', justifyContent:'center' }}>
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );
}
