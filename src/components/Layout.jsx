import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { 
  MdDashboard, 
  MdPeople, 
  MdArticle, 
  MdBusiness, 
  MdNotifications, 
  MdSchool, 
  MdPerson,
  MdSettings,
  MdLogout,
  MdAutoAwesome,
  MdFeedback,
  MdFolder,
  MdEdit,
  MdQueryStats
} from 'react-icons/md';
import './Layout.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: MdDashboard },
    { path: '/content-manager', label: 'Content Editor', icon: MdArticle },
    { path: '/users', label: 'Users', icon: MdPeople },
    { path: '/projects', label: 'Projects', icon: MdFolder },
    { path: '/active-writers', label: 'Active Writers', icon: MdEdit },
    { path: '/premium-users', label: 'Premium Details', icon: MdSettings },
    { path: '/editorial-trends', label: 'Editorial Trends', icon: MdArticle },
    { path: '/ai-config', label: 'AI Config', icon: MdAutoAwesome },
    { path: '/ai-usage', label: 'AI Usage', icon: MdQueryStats },
    { path: '/feedback', label: 'AI Feedback', icon: MdFeedback },
    { path: '/plan-management', label: 'Plan Management', icon: MdSettings },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Ink2Wealth Admin</h2>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">
                  <IconComponent size={20} />
                </span>
                {sidebarOpen && <span className="nav-label">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">
              <MdLogout size={20} />
            </span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <h1>Admin Panel</h1>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

