import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Farms from './pages/Farms';
import Crops from './pages/Crops';
import Recommend from './pages/Recommend';
import Disease from './pages/Disease';
import Weather from './pages/Weather';
import Market from './pages/Market';
import Profit from './pages/Profit';
import CalendarPage from './pages/Calendar';
import Analytics from './pages/Analytics';

function AppLayout() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/farms" element={<Farms />} />
          <Route path="/crops" element={<Crops />} />
          <Route path="/recommend" element={<Recommend />} />
          <Route path="/disease" element={<Disease />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/market" element={<Market />} />
          <Route path="/profit" element={<Profit />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { borderRadius:10, fontWeight:600, background:'#14532d', color:'#fff' }, success: { style: { background:'#16a34a' } }, error: { style: { background:'#dc2626' } } }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
