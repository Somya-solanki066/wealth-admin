import { useEffect, useState } from 'react';
import api from '../services/api';
import './AiConfig.css';

export default function ScreenwriterPortfolios() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [portfolios, setPortfolios] = useState([]);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/data/screenwriter-portfolios');
      setPortfolios(res.data?.data?.portfolios || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load portfolios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setVerification = async (id, status) => {
    setMessage('');
    setError('');
    try {
      await api.post(`/data/screenwriter-portfolios/${id}/verification`, { status });
      setMessage(`Verification set to ${status}.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    }
  };

  const filtered = portfolios.filter((p) => {
    if (filter === 'all') return true;
    return p.verificationStatus === filter;
  });

  return (
    <div className="ai-config-page">
      <div className="page-header">
        <div>
          <h2>Screenwriter Portfolios</h2>
          <p>Review verification requests. Users cannot self-assign the Verified writer badge.</p>
        </div>
        <button type="button" className="btn-primary" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      <div className="config-card" style={{ marginBottom: 16 }}>
        <label>
          Filter status{' '}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="unverified">Unverified</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="loading-state">Loading…</div>
      ) : (
        <div className="config-card">
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No portfolios found.</td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div>{p.displayName}</div>
                        <div style={{ fontSize: 12, opacity: 0.7 }}>{p.professionalTitle}</div>
                      </td>
                      <td>{p.slug}</td>
                      <td>{p.publishStatus}</td>
                      <td>
                        <strong>{p.verificationStatus}</strong>
                        {p.verificationNote ? (
                          <div style={{ fontSize: 12, opacity: 0.7 }}>{p.verificationNote}</div>
                        ) : null}
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
                        <button
                          type="button"
                          onClick={() => setVerification(p.id, 'rejected')}
                          disabled={p.verificationStatus === 'rejected'}
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => setVerification(p.id, 'pending')}
                        >
                          Mark pending
                        </button>
                        <button
                          type="button"
                          onClick={() => setVerification(p.id, 'unverified')}
                        >
                          Clear
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
