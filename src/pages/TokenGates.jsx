import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import './AiConfig.css';

export default function TokenGates() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [gates, setGates] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [config, setConfig] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/data/token-gates');
      setGates(res.data?.data?.gates || []);
      setTokens(res.data?.data?.tokens || []);
      setConfig(res.data?.data?.config || null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load token gates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const byStory = useMemo(() => {
    const map = {};
    for (const g of gates) {
      const key = g.projectId || 'unknown';
      if (!map[key]) {
        map[key] = { projectName: g.projectName || key, projectId: key, gates: [] };
      }
      map[key].gates.push(g);
    }
    return Object.values(map);
  }, [gates]);

  const patchGate = async (g, body) => {
    setMessage('');
    setError('');
    try {
      await api.patch(`/data/token-gates/${g.projectId}/${g.chapterId}`, body);
      setMessage('Gate updated.');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    }
  };

  const removeGate = async (g) => {
    setMessage('');
    setError('');
    try {
      await api.delete(`/data/token-gates/${g.projectId}/${g.chapterId}`);
      setMessage('Gate removed.');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Remove failed');
    }
  };

  return (
    <div className="ai-config-page">
      <div className="page-header">
        <div>
          <h2>Token-Gated Chapters</h2>
          <p>Edit, disable, change token, or remove chapter gates.</p>
        </div>
        <button type="button" className="btn-primary" onClick={load}>
          Refresh
        </button>
      </div>

      {config?.message && (
        <div className="config-card" style={{ marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>{config.message}</p>
        </div>
      )}

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading…</div>
      ) : byStory.length === 0 ? (
        <div className="config-card">No token gates configured yet.</div>
      ) : (
        byStory.map((story) => (
          <div key={story.projectId} className="config-card" style={{ marginBottom: 16 }}>
            <h3>{story.projectName}</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Chapter</th>
                    <th>Token</th>
                    <th>Policy</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {story.gates.map((g) => (
                    <tr key={g.id || `${g.projectId}-${g.chapterId}`}>
                      <td>{g.chapterTitle}</td>
                      <td>
                        <select
                          value={g.tokenId}
                          onChange={(e) => patchGate(g, { tokenId: e.target.value })}
                        >
                          {tokens.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.standard})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={g.accessPolicy || 'current-ownership'}
                          onChange={(e) => patchGate(g, { accessPolicy: e.target.value })}
                        >
                          <option value="current-ownership">Current ownership</option>
                          <option value="one-time-unlock">One-time unlock</option>
                        </select>
                      </td>
                      <td>{g.status}</td>
                      <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() =>
                            patchGate(g, {
                              status: g.status === 'active' ? 'disabled' : 'active',
                            })
                          }
                        >
                          {g.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => removeGate(g)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
