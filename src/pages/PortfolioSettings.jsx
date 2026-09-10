import { useEffect, useState } from 'react';
import api from '../services/api';
import './AiConfig.css';

export default function PortfolioSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [allowUnlisted, setAllowUnlisted] = useState(true);
  const [allowPrivateWork, setAllowPrivateWork] = useState(true);
  const [portfolios, setPortfolios] = useState([]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/data/portfolio-settings');
      const settings = res.data?.data?.settings || {};
      setAllowUnlisted(settings.allowUnlisted !== false);
      setAllowPrivateWork(settings.allowPrivateWork !== false);
      setPortfolios(res.data?.data?.portfolios || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await api.put('/data/portfolio-settings', { allowUnlisted, allowPrivateWork });
      setMessage('Portfolio platform settings saved.');
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (id, status) => {
    try {
      await api.post(`/data/portfolio/${id}/status`, { status });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Status update failed');
    }
  };

  const setVerification = async (id, status) => {
    setMessage('');
    setError('');
    try {
      await api.post(`/data/portfolio/${id}/verification`, { status });
      setMessage(`Verification set to ${status}.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Verification update failed');
    }
  };

  return (
    <div className="ai-config-page">
      <div className="page-header">
        <div>
          <h2>Portfolio Settings</h2>
          <p>Visibility rules and writer verification. Users cannot self-assign Verified badge.</p>
        </div>
        <button type="button" className="btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading…</div>
      ) : (
        <>
          <div className="config-card">
            <h3>Visibility rules</h3>
            <div className="form-grid">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={allowUnlisted}
                  onChange={(e) => setAllowUnlisted(e.target.checked)}
                />
                Allow unlisted work items
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={allowPrivateWork}
                  onChange={(e) => setAllowPrivateWork(e.target.checked)}
                />
                Allow private work items
              </label>
            </div>
          </div>

          <div className="config-card">
            <h3>Writer Portfolios</h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Publish</th>
                    <th>Verification</th>
                    <th>Works</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolios.length === 0 ? (
                    <tr>
                      <td colSpan={6}>No portfolios found.</td>
                    </tr>
                  ) : (
                    portfolios.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div>{p.displayName || p.portfolioName}</div>
                          <div style={{ fontSize: 12, opacity: 0.7 }}>{p.professionalTitle}</div>
                        </td>
                        <td>{p.slug}</td>
                        <td>{p.status}</td>
                        <td>
                          <strong>{p.verificationStatus || 'unverified'}</strong>
                        </td>
                        <td>{p.works?.length || 0}</td>
                        <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => setVerification(p.id, 'approved')}
                            disabled={p.verificationStatus === 'approved'}
                          >
                            Approve
                          </button>
                          <button type="button" onClick={() => setVerification(p.id, 'rejected')}>
                            Reject
                          </button>
                          <button type="button" onClick={() => setVerification(p.id, 'pending')}>
                            Pending
                          </button>
                          {p.status === 'disabled' ? (
                            <button
                              type="button"
                              className="btn-link"
                              onClick={() => setStatus(p.id, 'published')}
                            >
                              Re-enable
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-link danger"
                              onClick={() => setStatus(p.id, 'disabled')}
                            >
                              Disable
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
