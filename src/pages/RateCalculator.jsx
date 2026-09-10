import { useEffect, useState } from 'react';
import api from '../services/api';
import './AiConfig.css';

const emptyProject = () => ({
  id: `p_${Date.now()}`,
  name: '',
  rate: 0,
});

const emptyRetainer = () => ({
  id: `r_${Date.now()}`,
  name: '',
  quantity: '',
  monthlyRate: 0,
});

export default function RateCalculator() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [perWord, setPerWord] = useState({ rate: 0.08, minWords: 500, maxWords: 10000 });
  const [perProject, setPerProject] = useState([]);
  const [retainer, setRetainer] = useState([]);
  const [tab, setTab] = useState('perWord');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/data/rate-calculator-settings');
      const d = res.data?.data || {};
      setCurrency(d.currency || 'USD');
      setPerWord(d.perWord || { rate: 0.08, minWords: 500, maxWords: 10000 });
      setPerProject(d.perProject || []);
      setRetainer(d.retainer || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load settings');
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
      await api.put('/data/rate-calculator-settings', {
        currency,
        perWord,
        perProject,
        retainer,
      });
      setMessage('Pricing saved. User calculator will use these rates.');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ai-config-page">
      <div className="page-header">
        <div>
          <h2>Rate Calculator Settings</h2>
          <p>Content &amp; Freelance platform pricing — users cannot override these rates.</p>
        </div>
        <button type="button" className="btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading…</div>
      ) : (
        <>
          <div className="config-card">
            <div className="form-grid">
              <label>
                Currency
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="USD">USD</option>
                  <option value="NGN">NGN</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </label>
            </div>
          </div>

          <div className="filters-row">
            {[
              { id: 'perWord', label: 'Per Word' },
              { id: 'perProject', label: 'Per Project' },
              { id: 'retainer', label: 'Retainer' },
            ].map((t) => (
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

          {tab === 'perWord' && (
            <div className="config-card">
              <h3>Per Word Pricing</h3>
              <div className="form-grid">
                <label>
                  Default Rate
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={perWord.rate}
                    onChange={(e) => setPerWord({ ...perWord, rate: Number(e.target.value) })}
                  />
                </label>
                <label>
                  Minimum Words
                  <input
                    type="number"
                    value={perWord.minWords}
                    onChange={(e) => setPerWord({ ...perWord, minWords: Number(e.target.value) })}
                  />
                </label>
                <label>
                  Maximum Words
                  <input
                    type="number"
                    value={perWord.maxWords}
                    onChange={(e) => setPerWord({ ...perWord, maxWords: Number(e.target.value) })}
                  />
                </label>
              </div>
            </div>
          )}

          {tab === 'perProject' && (
            <div className="config-card">
              <div className="section-head">
                <h3>Project Pricing</h3>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setPerProject([...perProject, emptyProject()])}
                >
                  Add Project Type
                </button>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Rate</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {perProject.map((p, idx) => (
                      <tr key={p.id || idx}>
                        <td>
                          <input
                            value={p.name}
                            onChange={(e) => {
                              const next = [...perProject];
                              next[idx] = { ...p, name: e.target.value };
                              setPerProject(next);
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={p.rate}
                            onChange={(e) => {
                              const next = [...perProject];
                              next[idx] = { ...p, rate: Number(e.target.value) };
                              setPerProject(next);
                            }}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-link danger"
                            onClick={() => setPerProject(perProject.filter((_, i) => i !== idx))}
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
          )}

          {tab === 'retainer' && (
            <div className="config-card">
              <div className="section-head">
                <h3>Retainer Pricing</h3>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setRetainer([...retainer, emptyRetainer()])}
                >
                  Add Package
                </button>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Package</th>
                      <th>Quantity</th>
                      <th>Monthly Rate</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {retainer.map((r, idx) => (
                      <tr key={r.id || idx}>
                        <td>
                          <input
                            value={r.name}
                            onChange={(e) => {
                              const next = [...retainer];
                              next[idx] = { ...r, name: e.target.value };
                              setRetainer(next);
                            }}
                          />
                        </td>
                        <td>
                          <input
                            value={r.quantity}
                            onChange={(e) => {
                              const next = [...retainer];
                              next[idx] = { ...r, quantity: e.target.value };
                              setRetainer(next);
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={r.monthlyRate}
                            onChange={(e) => {
                              const next = [...retainer];
                              next[idx] = { ...r, monthlyRate: Number(e.target.value) };
                              setRetainer(next);
                            }}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-link danger"
                            onClick={() => setRetainer(retainer.filter((_, i) => i !== idx))}
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
          )}
        </>
      )}
    </div>
  );
}
