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
  MdLightbulb,
  MdMovie,
  MdStorefront,
  MdGroups,
  MdCalculate,
  MdOutgoingMail,
  MdBolt,
  MdLock,
  MdAccountBalanceWallet,
  MdBadge,
  MdEmail,
  MdInfo,
  MdHandshake,
  MdFactCheck,
  MdDynamicFeed,
  MdWeb,
  MdHub,
  MdChat,
  MdMovieCreation,
  MdViewCarousel,
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

  const menuSections = [
    {
      title: 'OVERVIEW',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: MdDashboard },
        { path: '/users', label: 'Users', icon: MdPeople },
        { path: '/premium-users', label: 'Premium Details', icon: MdSettings },
        { path: '/students', label: 'Students', icon: MdSchool },
        { path: '/teachers', label: 'Teachers', icon: MdPerson },
      ],
    },
    {
      title: 'PUBLISHING & CONTRACTS',
      items: [
        { path: '/contracts', label: 'Contracts (Waiting List)', icon: MdFactCheck },
        { path: '/benefit-programs', label: 'Benefit Programs', icon: MdHandshake },
        { path: '/trending-serials', label: 'Trending Serials', icon: MdMenuBook },
        { path: '/active-writers', label: 'Active Writers', icon: MdEdit },
        { path: '/writing-vault', label: 'Writing Vault', icon: MdLightbulb },
      ],
    },
    {
      title: 'FILMS & SCREENWRITERS',
      items: [
        { path: '/trending-scripts', label: 'Trending Scripts', icon: MdMovieCreation },
        { path: '/screenwriter-portfolios', label: 'SW Portfolios', icon: MdBadge },
        { path: '/portfolio-settings', label: 'Portfolio Settings', icon: MdWork },
        { path: '/script-marketplace', label: 'Script Marketplace', icon: MdStorefront },
        { path: '/script-analyzer', label: 'Script Analyzer', icon: MdMovieFilter },
        { path: '/short-films', label: 'Short Films', icon: MdMovie },
        { path: '/pitch-templates', label: 'Pitch Templates', icon: MdOutgoingMail },
        { path: '/flash-prompts', label: 'Flash Prompts', icon: MdBolt },
        { path: '/rate-calculator', label: 'Rate Calculator', icon: MdCalculate },
      ],
    },
    {
      title: 'WEALTH & JOBS',
      items: [
        { path: '/wealth-jobs', label: 'WEALTH Jobs', icon: MdWork },
        { path: '/wealth-open-calls', label: 'Open Calls', icon: MdMovieFilter },
        { path: '/projects', label: 'Projects', icon: MdFolder },
        { path: '/token-gates', label: 'Token Gates', icon: MdLock },
        { path: '/wallet-royalties', label: 'Wallet Royalties', icon: MdAccountBalanceWallet },
      ],
    },
    {
      title: 'COURSES & EDUCATION',
      items: [
        { path: '/world-courses', label: 'Courses', icon: MdMenuBook },
        { path: '/landing-courses', label: 'Landing Page Courses', icon: MdSchool },
        { path: '/course-enrollments', label: 'Course Enrollments', icon: MdSchool },
        { path: '/subject-hubs', label: 'Subject Hubs', icon: MdSchool },
        { path: '/coach-page', label: 'Coach Page', icon: MdPerson },
      ],
    },
    {
      title: 'CONTENT & EDITORIAL',
      items: [
        { path: '/world-banners', label: 'World Banners', icon: MdViewCarousel },
        { path: '/content-manager', label: 'Content Editor', icon: MdArticle },
        { path: '/posts', label: 'Posts Feed', icon: MdDynamicFeed },
        { path: '/pages', label: 'Pages', icon: MdWeb },
        { path: '/editorial-trends', label: 'Editorial Trends', icon: MdArticle },
        { path: '/member-stories', label: 'Member Stories', icon: MdMovie },
        { path: '/about-ink2wealth', label: 'About Ink2Wealth', icon: MdInfo },
      ],
    },
    {
      title: 'COMMUNICATION & SOCIAL',
      items: [
        { path: '/community', label: 'Community', icon: MdGroups },
        { path: '/connections', label: 'Connections', icon: MdHub },
        { path: '/messages', label: 'Messages', icon: MdChat },
        { path: '/notifications', label: 'Notifications', icon: MdNotifications },
        { path: '/email-templates', label: 'Email Templates', icon: MdEmail },
      ],
    },
    {
      title: 'AI & SETTINGS',
      items: [
        { path: '/ai-config', label: 'AI Config', icon: MdAutoAwesome },
        { path: '/ai-usage', label: 'AI Usage', icon: MdQueryStats },
        { path: '/feedback', label: 'AI Feedback', icon: MdFeedback },
        { path: '/plan-management', label: 'Plan Management', icon: MdSettings },
      ],
    },
  ];

  const allMenuItems = menuSections.flatMap((s) => s.items);

  const currentPage =
    allMenuItems.find((item) => item.path === location.pathname)?.label || 'Admin Panel';

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
          <img src="/brand/logo.webp" alt="Ink2Wealth" className="brand-logo" />
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
          {menuSections.map((section) => (
            <div key={section.title} className="sidebar-section">
              {sidebarOpen && <div className="sidebar-section-title">{section.title}</div>}
              {section.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={closeMobileMenu}
                    title={item.label}
                  >
                    <span className="nav-icon">
                      <IconComponent size={20} />
                    </span>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
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
