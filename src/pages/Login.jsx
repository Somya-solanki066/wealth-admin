import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { testConnection } from '../utils/testConnection';
import './Login.css';

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState(null);
  const navigate = useNavigate();

  // Test connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      const result = await testConnection();
      setConnectionStatus(result);
      if (!result.success) {
        setError(result.message);
      }
    };
    checkConnection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email.trim(), password);
      if (response.success || response.token) {
        setIsAuthenticated(true);
        navigate('/dashboard', { replace: true });
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        setError(err.response.data?.message || err.response.data?.error || 'Invalid email or password.');
      } else if (err.request) {
        setError('Cannot connect to server. Please check if backend API is running on port 5000.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Ink2Wealth Admin Panel</h1>
          <p>Sign in to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {connectionStatus && !connectionStatus.success && (
            <div className="error-message" style={{ background: '#fff3cd', color: '#856404', border: '1px solid #ffc107' }}>
              <strong>Connection Issue:</strong> {connectionStatus.message}
              {connectionStatus.details && <div style={{ marginTop: '8px', fontSize: '12px' }}>{connectionStatus.details}</div>}
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

