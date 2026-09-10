import { useEffect, useState } from 'react';
import api from '../services/api';
import './AiConfig.css';

const GENRES = [
  { id: 'romance', label: 'Romance' },
  { id: 'horror', label: 'Horror' },
  { id: 'scifi', label: 'Sci-Fi' },
  { id: 'comedy', label: 'Comedy' },
];

const emptyPrompt = (genre = 'romance') => ({
  id: `fp_${Date.now()}`,
  text: '',
  genre,
  active: true,
  featured: false,
  createdAt: new Date().toISOString(),
});

export default function FlashPrompts() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/data/flash-prompts-settings');
      setPrompts(res.data?.data?.prompts || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load prompts');
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
      await api.put('/data/flash-prompts-settings', { prompts });
      setMessage('Prompts saved. Daily + shuffle now use this library.');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const filtered =
    filter === 'all' ? prompts : prompts.filter((p) => p.genre === filter);

  const updateAt = (idxInFiltered, patch) => {
    const target = filtered[idxInFiltered];
    if (!target) return;
    setPrompts((list) =>
      list.map((p) => (p.id === target.id ? { ...p, ...patch } : p))
    );
  };

  return (
    <div className="ai-config-page">
      <div className="page-header">
        <div>
          <h2>Flash Prompts</h2>
          <p>Short-Form Fiction — admin-managed prompt library (daily rotation + shuffle).</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              setPrompts((list) => [
                ...list,
                emptyPrompt(filter === 'all' ? 'romance' : filter),
              ])
            }
          >
            Add Prompt
          </button>
          <button type="button" className="btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      <div className="filters-row">
        <button
          type="button"
          className={`tab-chip${filter === 'all' ? ' active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {GENRES.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`tab-chip${filter === g.id ? ' active' : ''}`}
            onClick={() => setFilter(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">Loading…</div>
      ) : (
        <div className="config-card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Prompt</th>
                  <th>Genre</th>
                  <th>Active</th>
                  <th>Featured</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={p.id || idx}>
                    <td>
                      <textarea
                        rows={3}
                        value={p.text}
                        onChange={(e) => updateAt(idx, { text: e.target.value })}
                      />
                    </td>
                    <td>
                      <select
                        value={p.genre}
                        onChange={(e) => updateAt(idx, { genre: e.target.value })}
                      >
                        {GENRES.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={!!p.active}
                        onChange={(e) => updateAt(idx, { active: e.target.checked })}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={!!p.featured}
                        onChange={(e) => updateAt(idx, { featured: e.target.checked })}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-link danger"
                        onClick={() =>
                          setPrompts((list) => list.filter((x) => x.id !== p.id))
                        }
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filtered.length && (
            <p className="loading-state">No prompts in this filter. Add one.</p>
          )}
        </div>
      )}
    </div>
  );
}
