import { useEffect, useState } from 'react';
import api from '../services/api';
import './AiConfig.css';

const TABS = [
  { id: 'pending_review', label: 'Pending' },
  { id: 'published', label: 'Published' },
  { id: 'sold', label: 'Sold' },
  { id: 'optioned', label: 'Optioned' },
  { id: 'rejected', label: 'Rejected' },
];

export default function ScriptMarketplace() {
  const [tab, setTab] = useState('pending_review');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [rejectReason, setRejectReason] = useState('Needs changes');
  const [commissionRate, setCommissionRate] = useState(0.12);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [listRes, settingsRes] = await Promise.all([
        api.get('/data/marketplace-listings', { params: { status: tab } }),
        api.get('/data/marketplace-settings'),
      ]);
      setListings(listRes.data?.data || []);
      if (settingsRes.data?.data?.commissionRate) {
        setCommissionRate(settingsRes.data.data.commissionRate);
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
        await api.post(`/data/marketplace-listings/${id}/approve`);
        setMessage('Listing approved.');
      } else {
        await api.post(`/data/marketplace-listings/${id}/reject`, { reason: rejectReason });
        setMessage('Listing rejected.');
      }
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Action failed');
    }
  };

  const saveCommission = async () => {
    try {
      await api.put('/data/marketplace-settings', { commissionRate: Number(commissionRate) });
      setMessage(`Commission set to ${Math.round(commissionRate * 100)}%`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save commission');
    }
  };

  return (
    <div className="ai-config-page">
      <div className="page-header">
        <h2>Script Marketplace</h2>
        <p>Review listings and configure platform commission (10–15%).</p>
      </div>

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      <div className="config-card">
        <h3>Commission rate</h3>
        <div className="filters-row" style={{ marginBottom: 0 }}>
          <input
            type="number"
            min={0.1}
            max={0.15}
            step={0.01}
            value={commissionRate}
            onChange={(e) => setCommissionRate(Number(e.target.value))}
            style={{ maxWidth: 120 }}
          />
          <span style={{ color: '#C9A84C', fontWeight: 700 }}>{Math.round(commissionRate * 100)}%</span>
          <button type="button" className="btn-primary" onClick={saveCommission}>
            Save
          </button>
        </div>
      </div>

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

        {tab === 'pending_review' && (
          <label className="reject-field">
            Reject reason
            <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </label>
        )}

        {loading ? (
          <div className="loading-state">Loading…</div>
        ) : listings.length === 0 ? (
          <div className="empty-state">No listings in this queue.</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Writer</th>
                  <th>Type</th>
                  <th>Pages</th>
                  <th>Price</th>
                  <th>Deal</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l.id}>
                    <td>{l.title}</td>
                    <td>{l.writerName}</td>
                    <td>{l.scriptType}</td>
                    <td>{l.pageCount}</td>
                    <td>
                      {l.priceNGN ? `₦${l.priceNGN}` : ''}
                      {l.optionPriceNGN ? ` / Opt ₦${l.optionPriceNGN}` : ''}
                    </td>
                    <td>{l.dealType}</td>
                    <td>
                      {tab === 'pending_review' && (
                        <>
                          <button type="button" className="btn-link" onClick={() => moderate(l.id, 'approve')}>
                            Approve
                          </button>
                          <button type="button" className="btn-link danger" onClick={() => moderate(l.id, 'reject')}>
                            Reject
                          </button>
                        </>
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
