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
import AiConfig from './pages/AiConfig';
import ScriptAnalyzer from './pages/ScriptAnalyzer';
import Feedback from './pages/Feedback';
import Projects from './pages/Projects';
import ActiveWriters from './pages/ActiveWriters';
import AiUsage from './pages/AiUsage';
import LandingCourses from './pages/LandingCourses';
import CoachPage from './pages/CoachPage';
import WritingVault from './pages/WritingVault';
import ShortFilms from './pages/ShortFilms';
import ScriptMarketplace from './pages/ScriptMarketplace';
import Community from './pages/Community';
import RateCalculator from './pages/RateCalculator';
import PitchTemplates from './pages/PitchTemplates';
import FlashPrompts from './pages/FlashPrompts';
import PortfolioSettings from './pages/PortfolioSettings';
import ScreenwriterPortfolios from './pages/ScreenwriterPortfolios';
import TokenGates from './pages/TokenGates';
import WalletRoyaltiesSettings from './pages/WalletRoyaltiesSettings';
import WorldCourses from './pages/WorldCourses';
import WealthJobs from './pages/WealthJobs';
import WealthOpenCalls from './pages/WealthOpenCalls';
import CourseEnrollments from './pages/CourseEnrollments';
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
        <Route path="/ai-config" element={isAuthenticated ? <Layout><AiConfig /></Layout> : <Navigate to="/login" />} />
        <Route path="/script-analyzer" element={isAuthenticated ? <Layout><ScriptAnalyzer /></Layout> : <Navigate to="/login" />} />
        <Route path="/feedback" element={isAuthenticated ? <Layout><Feedback /></Layout> : <Navigate to="/login" />} />
        <Route path="/projects" element={isAuthenticated ? <Layout><Projects /></Layout> : <Navigate to="/login" />} />
        <Route path="/active-writers" element={isAuthenticated ? <Layout><ActiveWriters /></Layout> : <Navigate to="/login" />} />
        <Route path="/ai-usage" element={isAuthenticated ? <Layout><AiUsage /></Layout> : <Navigate to="/login" />} />
        <Route path="/content-manager" element={isAuthenticated ? <Layout><ContentManager /></Layout> : <Navigate to="/login" />} />
        <Route path="/landing-courses" element={isAuthenticated ? <Layout><LandingCourses /></Layout> : <Navigate to="/login" />} />
        <Route path="/coach-page" element={isAuthenticated ? <Layout><CoachPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/writing-vault" element={isAuthenticated ? <Layout><WritingVault /></Layout> : <Navigate to="/login" />} />
        <Route path="/short-films" element={isAuthenticated ? <Layout><ShortFilms /></Layout> : <Navigate to="/login" />} />
        <Route path="/script-marketplace" element={isAuthenticated ? <Layout><ScriptMarketplace /></Layout> : <Navigate to="/login" />} />
        <Route path="/community" element={isAuthenticated ? <Layout><Community /></Layout> : <Navigate to="/login" />} />
        <Route path="/rate-calculator" element={isAuthenticated ? <Layout><RateCalculator /></Layout> : <Navigate to="/login" />} />
        <Route path="/pitch-templates" element={isAuthenticated ? <Layout><PitchTemplates /></Layout> : <Navigate to="/login" />} />
        <Route path="/flash-prompts" element={isAuthenticated ? <Layout><FlashPrompts /></Layout> : <Navigate to="/login" />} />
        <Route path="/portfolio-settings" element={isAuthenticated ? <Layout><PortfolioSettings /></Layout> : <Navigate to="/login" />} />
        <Route path="/screenwriter-portfolios" element={isAuthenticated ? <Layout><ScreenwriterPortfolios /></Layout> : <Navigate to="/login" />} />
        <Route path="/token-gates" element={isAuthenticated ? <Layout><TokenGates /></Layout> : <Navigate to="/login" />} />
        <Route path="/wallet-royalties" element={isAuthenticated ? <Layout><WalletRoyaltiesSettings /></Layout> : <Navigate to="/login" />} />
        <Route path="/world-courses" element={isAuthenticated ? <Layout><WorldCourses /></Layout> : <Navigate to="/login" />} />
        <Route path="/course-enrollments" element={isAuthenticated ? <Layout><CourseEnrollments /></Layout> : <Navigate to="/login" />} />
        <Route path="/wealth-jobs" element={isAuthenticated ? <Layout><WealthJobs /></Layout> : <Navigate to="/login" />} />
        <Route path="/wealth-open-calls" element={isAuthenticated ? <Layout><WealthOpenCalls /></Layout> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
