import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import {
  MdDashboard,
  MdPeople,
  MdArticle,
  MdNotifications,
  MdSchool,
  MdPerson,
  MdSettings,
  MdLogout,
  MdAutoAwesome,
  MdFeedback,
  MdFolder,
  MdEdit,
  MdQueryStats,
  MdMenu,
  MdClose,
  MdMenuBook,
  MdWork,
  MdMovieFilter,
} from 'react-icons/md';
import './Layout.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: MdDashboard },
    { path: '/content-manager', label: 'Content Editor', icon: MdArticle },
    { path: '/landing-courses', label: 'Landing Page Courses', icon: MdSchool },
    { path: '/world-courses', label: 'Courses', icon: MdMenuBook },
    { path: '/course-enrollments', label: 'Course Enrollments', icon: MdSchool },
    { path: '/wealth-jobs', label: 'WEALTH Jobs', icon: MdWork },
    { path: '/wealth-open-calls', label: 'Open Calls', icon: MdMovieFilter },
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

  const currentPage =
    menuItems.find((item) => item.path === location.pathname)?.label || 'Admin Panel';

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <div className="admin-layout">
      {mobileMenuOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={closeMobileMenu}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}
      >
        <div className="sidebar-header">
          <h2>Ink2Wealth Admin</h2>
          <button
            type="button"
            className="toggle-btn desktop-only"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <MdClose size={22} />
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
                onClick={closeMobileMenu}
              >
                <span className="nav-icon">
                  <IconComponent size={20} />
                </span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">
              <MdLogout size={20} />
            </span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="top-header-left">
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <MdMenu size={22} />
            </button>
            <div>
              <h1>Admin Panel</h1>
              <p className="top-header-sub">{currentPage}</p>
            </div>
          </div>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
