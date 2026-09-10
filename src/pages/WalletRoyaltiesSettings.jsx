import { useEffect, useState } from 'react';
import api from '../services/api';
import './AiConfig.css';

export default function WalletRoyaltiesSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [creatorRoyaltyPercent, setCreatorRoyaltyPercent] = useState(90);
  const [platformFeePercent, setPlatformFeePercent] = useState(10);
  const [configNote, setConfigNote] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/data/wallet-royalties/settings');
      const s = res.data?.data?.settings || {};
      setCreatorRoyaltyPercent(Number(s.creatorRoyaltyPercent ?? 90));
      setPlatformFeePercent(Number(s.platformFeePercent ?? 10));
      setConfigNote(res.data?.data?.config?.message || '');
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
      const res = await api.put('/data/wallet-royalties/settings', {
        creatorRoyaltyPercent,
        platformFeePercent,
      });
      const s = res.data?.data?.settings;
      if (s) {
        setCreatorRoyaltyPercent(s.creatorRoyaltyPercent);
        setPlatformFeePercent(s.platformFeePercent);
      }
      setMessage('Royalty settings saved.');
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
          <h2>Royalty Settings</h2>
          <p>Creator vs platform split for Web3 wallet royalties (backend-calculated only).</p>
        </div>
        <button type="button" className="btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      {configNote && (
        <div className="config-card" style={{ marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>{configNote}</p>
        </div>
      )}

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading…</div>
      ) : (
        <div className="config-card">
          <h3>Split rules</h3>
          <div className="form-grid">
            <label>
              Creator royalty %
              <input
                type="number"
                min={0}
                max={100}
                value={creatorRoyaltyPercent}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setCreatorRoyaltyPercent(v);
                  setPlatformFeePercent(Math.round((100 - v) * 100) / 100);
                }}
              />
            </label>
            <label>
              Platform fee %
              <input
                type="number"
                min={0}
                max={100}
                value={platformFeePercent}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setPlatformFeePercent(v);
                  setCreatorRoyaltyPercent(Math.round((100 - v) * 100) / 100);
                }}
              />
            </label>
          </div>
          <p style={{ marginTop: 12, fontSize: 13, opacity: 0.75 }}>
            Example: $40 sale → creator ${(40 * creatorRoyaltyPercent) / 100} · platform $
            {(40 * platformFeePercent) / 100}
          </p>
        </div>
      )}
    </div>
  );
}
