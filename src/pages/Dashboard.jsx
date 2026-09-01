import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { MdPeople, MdArticle, MdPerson, MdTrendingUp, MdBarChart, MdStar, MdAutoAwesome } from 'react-icons/md';
import './Dashboard.css';

function parseDate(value) {
  if (!value) return null;
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const seconds = value.seconds || value._seconds;
  if (seconds) return new Date(seconds * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseDate(value);
  return date ? date.toLocaleDateString() : 'N/A';
}

function formatMoney(amount, currency = 'ngn') {
  const value = Number(amount || 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: String(currency || 'ngn').toUpperCase(),
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    activeWriters7d: 0,
    newSignups7d: 0,
    newSignups30d: 0,
    premiumUsers: 0,
    aiAnalyzerCalls: 0,
    smartEditCalls: 0,
    recentSignups: [],
    recentPayments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await userService.getDashboardData();
      const statsData = response.data || response.stats || {};
      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalProjects: statsData.totalProjects || 0,
        activeWriters7d: statsData.activeWriters7d || statsData.activeWriters || 0,
        newSignups7d: statsData.newSignups7d || 0,
        newSignups30d: statsData.newSignups30d || 0,
        premiumUsers: statsData.premiumUsers || 0,
        aiAnalyzerCalls: statsData.aiAnalyzerCalls || 0,
        smartEditCalls: statsData.smartEditCalls || 0,
        recentSignups: statsData.recentSignups || [],
        recentPayments: statsData.recentPayments || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  const cards = [
    {
      key: 'users',
      className: 'stat-card-users',
      icon: MdPeople,
      title: 'Total Users',
      value: stats.totalUsers || 0,
      label: 'Registered users',
      footer: 'All platform users',
      to: '/users',
    },
    {
      key: 'projects',
      className: 'stat-card-posts',
      icon: MdArticle,
      title: 'Total Projects',
      value: stats.totalProjects || 0,
      label: 'User stories & scripts',
      footer: 'All projects created',
      to: '/projects',
    },
    {
      key: 'active',
      className: 'stat-card-pages',
      icon: MdPerson,
      title: 'Active Writers (7d)',
      value: stats.activeWriters7d || 0,
      label: 'Wrote or used AI this week',
      footer: 'See what they are writing',
      to: '/active-writers',
    },
    {
      key: 'signups',
      className: 'stat-card-users',
      icon: MdPeople,
      title: 'New signups (7d)',
      value: stats.newSignups7d || 0,
      label: `${stats.newSignups30d || 0} in last 30 days`,
      footer: 'Open users table',
      to: '/users',
    },
    {
      key: 'premium',
      className: 'stat-card-posts',
      icon: MdStar,
      title: 'Premium users',
      value: stats.premiumUsers || 0,
      label: 'Active paid access',
      footer: 'Premium details',
      to: '/premium-users',
    },
    {
      key: 'ai',
      className: 'stat-card-pages',
      icon: MdAutoAwesome,
      title: 'AI calls',
      value: (stats.aiAnalyzerCalls || 0) + (stats.smartEditCalls || 0),
      label: `Analyzer ${stats.aiAnalyzerCalls || 0} · Smart Edit ${stats.smartEditCalls || 0}`,
      footer: 'Per-user AI usage details',
      to: '/ai-usage',
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="dashboard-subtitle">Live signups, payments, and AI usage</p>
        </div>
        <div className="dashboard-header-icon">
          <MdBarChart size={40} />
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.key}
              type="button"
              className={`stat-card ${card.className} clickable-card`}
              onClick={() => navigate(card.to)}
            >
              <div className="stat-card-content">
                <div className="stat-icon-wrapper">
                  <Icon className="stat-icon" size={40} />
                </div>
                <div className="stat-info">
                  <h3>{card.title}</h3>
                  <p className="stat-number">{card.value}</p>
                  <p className="stat-label">{card.label}</p>
                </div>
              </div>
              <div className="stat-card-footer">
                <MdTrendingUp size={16} />
                <span>{card.footer}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="ops-tables">
        <div className="ops-table-card">
          <h3>Recent signups</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {(stats.recentSignups || []).length === 0 ? (
                <tr><td colSpan="4">No signups yet</td></tr>
              ) : (
                stats.recentSignups.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name || 'N/A'}</td>
                    <td>{user.email || 'N/A'}</td>
                    <td>{user.subscriptionPlan || 'free'}</td>
                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="ops-table-card">
          <h3>Recent payments</h3>
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {(stats.recentPayments || []).length === 0 ? (
                <tr><td colSpan="5">No payments yet</td></tr>
              ) : (
                stats.recentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.email || payment.userId || 'N/A'}</td>
                    <td>{payment.planId || '—'}</td>
                    <td>{formatMoney(payment.amountTotal, payment.currency)}</td>
                    <td>{payment.status || 'paid'}</td>
                    <td>{formatDate(payment.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-actions">
        <div className="action-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => navigate('/users')}>
              <MdPeople size={20} />
              <span>Manage Users</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/ai-config')}>
              <MdAutoAwesome size={20} />
              <span>AI Config</span>
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
