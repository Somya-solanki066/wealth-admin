import { useEffect, useState } from 'react';
import api from '../services/api';
import './AiConfig.css';

const TABS = [
  { id: 'pending_review', label: 'Pending' },
  { id: 'published', label: 'Published' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'reported', label: 'Reported' },
];

export default function ShortFilms() {
  const [tab, setTab] = useState('pending_review');
  const [films, setFilms] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [rejectReason, setRejectReason] = useState('Needs changes');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'reported') {
        const res = await api.get('/data/short-film-reports');
        setReports(res.data?.data || []);
      } else {
        const res = await api.get('/data/short-films', { params: { status: tab } });
        setFilms(res.data?.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const moderate = async (id, action) => {
    try {
      if (action === 'approve') {
        await api.post(`/data/short-films/${id}/approve`);
        setMessage('Film approved and published.');
      } else if (action === 'reject') {
        await api.post(`/data/short-films/${id}/reject`, { reason: rejectReason });
        setMessage('Film rejected.');
      } else {
        await api.post(`/data/short-films/${id}/remove`);
        setMessage('Film removed.');
      }
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Action failed');
    }
  };

  return (
    <div className="ai-config-page">
      <div className="page-header">
        <div>
          <h2>Short Films</h2>
          <p>Moderate Short Film Showcase uploads before they go live.</p>
        </div>
      </div>

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      <div className="config-card">
        <div className="filters-row">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tab-chip${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab !== 'reported' && (
          <label className="reject-field">
            Reject reason
            <input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </label>
        )}

        {loading ? (
          <div className="loading-state">Loading…</div>
        ) : tab === 'reported' ? (
          reports.length === 0 ? (
            <div className="empty-state">No reports.</div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Film ID</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id}>
                      <td>{r.filmId}</td>
                      <td>{r.reason}</td>
                      <td>{r.status}</td>
                      <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : films.length === 0 ? (
          <div className="empty-state">No films in this queue.</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Creator</th>
                  <th>Genre</th>
                  <th>Duration</th>
                  <th>Preview</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {films.map((f) => (
                  <tr key={f.id}>
                    <td>{f.title}</td>
                    <td>{f.creatorName}</td>
                    <td>{f.genre}</td>
                    <td>{f.durationLabel}</td>
                    <td>
                      {f.thumbnailUrl ? (
                        <img
                          src={f.thumbnailUrl}
                          alt=""
                          style={{ width: 64, height: 36, objectFit: 'cover', borderRadius: 6 }}
                        />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {tab === 'pending_review' && (
                        <>
                          <button type="button" className="btn-link" onClick={() => moderate(f.id, 'approve')}>
                            Approve
                          </button>
                          <button type="button" className="btn-link danger" onClick={() => moderate(f.id, 'reject')}>
                            Reject
                          </button>
                        </>
                      )}
                      {tab === 'published' && (
                        <button type="button" className="btn-link danger" onClick={() => moderate(f.id, 'remove')}>
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
