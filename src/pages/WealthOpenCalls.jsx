import { useEffect, useState } from 'react';
import api from '../services/api';
import { MdMovieFilter, MdRefresh, MdCheck, MdClose } from 'react-icons/md';

const STATUS_TABS = [
  { id: 'pending_review', label: 'Pending Review' },
  { id: 'active', label: 'Active' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'closed', label: 'Closed' },
  { id: '', label: 'All' },
];

function formatDate(value) {
  if (!value) return 'N/A';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

export default function WealthOpenCalls() {
  const [status, setStatus] = useState('pending_review');
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [rejectReason, setRejectReason] = useState({});

  const load = async (nextStatus = status) => {
    setLoading(true);
    setError('');
    try {
      const params = nextStatus ? `?status=${encodeURIComponent(nextStatus)}` : '';
      const res = await api.get(`/data/wealth-open-calls${params}`);
      setCalls(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load open calls.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const approve = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/data/wealth-open-calls/${id}/approve`);
      await load(status);
    } catch (err) {
      setError(err.response?.data?.error || 'Approve failed.');
    } finally {
      setBusyId('');
    }
  };

  const reject = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/data/wealth-open-calls/${id}/reject`, {
        reason: rejectReason[id] || 'Does not meet marketplace guidelines.',
      });
      await load(status);
    } catch (err) {
      setError(err.response?.data?.error || 'Reject failed.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div style={{ padding: '8px 4px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdMovieFilter size={26} /> Industry Open Calls
          </h1>
          <p style={{ margin: '6px 0 0', color: '#888', fontSize: 13 }}>
            Moderate industry listings before they go live on Industry Connect.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load(status)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            border: '1px solid #333',
            background: '#1a1a1a',
            color: '#eee',
            borderRadius: 10,
            padding: '8px 14px',
            cursor: 'pointer',
          }}
        >
          <MdRefresh size={16} /> Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id || 'all'}
            type="button"
            onClick={() => setStatus(tab.id)}
            style={{
              border: status === tab.id ? '1px solid #C9A84C' : '1px solid #333',
              background: status === tab.id ? 'rgba(201,168,76,0.15)' : '#141414',
              color: status === tab.id ? '#C9A84C' : '#aaa',
              borderRadius: 999,
              padding: '7px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? (
        <p style={{ color: '#E05252', fontSize: 13, marginBottom: 12 }}>{error}</p>
      ) : null}

      {loading ? (
        <p style={{ color: '#888', fontSize: 13 }}>Loading open calls…</p>
      ) : calls.length === 0 ? (
        <p style={{ color: '#888', fontSize: 13 }}>No listings in this queue.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {calls.map((call) => (
            <div
              key={call.id}
              style={{
                border: '1px solid #2a2a2a',
                borderRadius: 14,
                background: '#141414',
                padding: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#C9A84C', marginBottom: 4 }}>
                    {call.callType} · {call.status} · {call.locationType}
                  </div>
                  <h3 style={{ margin: 0, fontSize: 17, color: '#fff' }}>{call.title}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#C9A84C' }}>{call.organization}</p>
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: '#999', lineHeight: 1.5 }}>
                    {(call.description || '').slice(0, 280)}
                    {(call.description || '').length > 280 ? '…' : ''}
                  </p>
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: '#777' }}>
                    Poster: {call.posterName} · Deadline: {formatDate(call.deadline)} · Pitches:{' '}
                    {call.pitchCount || 0}
                  </p>
                  {call.rejectReason ? (
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: '#E05252' }}>
                      Reject reason: {call.rejectReason}
                    </p>
                  ) : null}
                </div>
              </div>

              {call.status === 'pending_review' ? (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    value={rejectReason[call.id] || ''}
                    onChange={(e) =>
                      setRejectReason((prev) => ({ ...prev, [call.id]: e.target.value }))
                    }
                    placeholder="Reject reason (optional)"
                    style={{
                      border: '1px solid #333',
                      background: '#1a1a1a',
                      color: '#eee',
                      borderRadius: 8,
                      padding: '8px 10px',
                      fontSize: 13,
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      disabled={busyId === call.id}
                      onClick={() => approve(call.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        border: 'none',
                        background: '#2d6a4f',
                        color: '#fff',
                        borderRadius: 8,
                        padding: '8px 14px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: 12,
                        opacity: busyId === call.id ? 0.6 : 1,
                      }}
                    >
                      <MdCheck size={16} /> Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === call.id}
                      onClick={() => reject(call.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        border: '1px solid #E05252',
                        background: 'transparent',
                        color: '#E05252',
                        borderRadius: 8,
                        padding: '8px 14px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: 12,
                        opacity: busyId === call.id ? 0.6 : 1,
                      }}
                    >
                      <MdClose size={16} /> Reject
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
