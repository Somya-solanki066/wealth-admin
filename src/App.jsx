import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EditorialTrends from './pages/EditorialTrends';
import Users from './pages/Users';
import PremiumUsers from './pages/PremiumUsers';
import Posts from './pages/Posts';
import Pages from './pages/Pages';
import Notifications from './pages/Notifications';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Settings from './pages/Settings';
import ContentManager from './pages/ContentManager';
import Layout from './components/Layout';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/dashboard" />} />
        <Route path="/" element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
        <Route path="/users" element={isAuthenticated ? <Layout><Users /></Layout> : <Navigate to="/login" />} />
        <Route path="/premium-users" element={isAuthenticated ? <Layout><PremiumUsers /></Layout> : <Navigate to="/login" />} />
        <Route path="/editorial-trends" element={isAuthenticated ? <Layout><EditorialTrends /></Layout> : <Navigate to="/login" />} />
        <Route path="/posts" element={isAuthenticated ? <Layout><Posts /></Layout> : <Navigate to="/login" />} />
        <Route path="/pages" element={isAuthenticated ? <Layout><Pages /></Layout> : <Navigate to="/login" />} />
        <Route path="/notifications" element={isAuthenticated ? <Layout><Notifications /></Layout> : <Navigate to="/login" />} />
        <Route path="/students" element={isAuthenticated ? <Layout><Students /></Layout> : <Navigate to="/login" />} />
        <Route path="/teachers" element={isAuthenticated ? <Layout><Teachers /></Layout> : <Navigate to="/login" />} />
        <Route path="/plan-management" element={isAuthenticated ? <Layout><Settings /></Layout> : <Navigate to="/login" />} />
        <Route path="/content-manager" element={isAuthenticated ? <Layout><ContentManager /></Layout> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
