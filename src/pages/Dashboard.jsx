import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { MdPeople, MdArticle, MdPerson, MdTrendingUp, MdBarChart } from 'react-icons/md';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    activeWriters: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await userService.getDashboardData();
      if (response.success || response.data || response.stats) {
        // Handle response mapping
        const statsData = response.data || response.stats || {};
        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalProjects: statsData.totalProjects || 0,
          activeWriters: statsData.activeWriters || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="dashboard-subtitle">Welcome to Ink2Wealth Admin Panel</p>
        </div>
        <div className="dashboard-header-icon">
          <MdBarChart size={40} />
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card stat-card-users">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper">
              <MdPeople className="stat-icon" size={40} />
            </div>
            <div className="stat-info">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.totalUsers || 0}</p>
              <p className="stat-label">Registered users</p>
            </div>
          </div>
          <div className="stat-card-footer">
            <MdTrendingUp size={16} />
            <span>All platform users</span>
          </div>
        </div>

        <div className="stat-card stat-card-posts">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper">
              <MdArticle className="stat-icon" size={40} />
            </div>
            <div className="stat-info">
              <h3>Total Projects</h3>
              <p className="stat-number">{stats.totalProjects || 0}</p>
              <p className="stat-label">User stories & scripts</p>
            </div>
          </div>
          <div className="stat-card-footer">
            <MdTrendingUp size={16} />
            <span>All projects created</span>
          </div>
        </div>

        <div className="stat-card stat-card-pages">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper">
              <MdPerson className="stat-icon" size={40} />
            </div>
            <div className="stat-info">
              <h3>Active Writers</h3>
              <p className="stat-number">{stats.activeWriters || 0}</p>
              <p className="stat-label">Writing today</p>
            </div>
          </div>
          <div className="stat-card-footer">
            <MdTrendingUp size={16} />
            <span>Active writer accounts</span>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <div className="action-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => window.location.href = '/users'}>
              <MdPeople size={20} />
              <span>Manage Users</span>
            </button>
            <button className="action-btn" onClick={() => window.open('http://localhost:3000', '_blank')}>
              <MdArticle size={20} />
              <span>Visit Public Site</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

