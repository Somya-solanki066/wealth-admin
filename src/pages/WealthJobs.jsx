import { useEffect, useState } from 'react';
import api from '../services/api';
import { MdWork, MdRefresh, MdCheck, MdClose } from 'react-icons/md';

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

export default function WealthJobs() {
  const [status, setStatus] = useState('pending_review');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [rejectReason, setRejectReason] = useState({});

  const load = async (nextStatus = status) => {
    setLoading(true);
    setError('');
    try {
      const params = nextStatus ? `?status=${encodeURIComponent(nextStatus)}` : '';
      const res = await api.get(`/data/wealth-jobs${params}`);
      setJobs(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load jobs.');
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
      await api.post(`/data/wealth-jobs/${id}/approve`);
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
      await api.post(`/data/wealth-jobs/${id}/reject`, {
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
            <MdWork size={26} /> WEALTH Jobs
          </h1>
          <p style={{ margin: '6px 0 0', color: '#888', fontSize: 13 }}>
            Moderate writing job posts before they go live on the marketplace.
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
        <p style={{ color: '#888', fontSize: 13 }}>Loading jobs…</p>
      ) : jobs.length === 0 ? (
        <div
          style={{
            border: '1px dashed #333',
            borderRadius: 16,
            padding: 32,
            textAlign: 'center',
            color: '#666',
            fontSize: 13,
          }}
        >
          No jobs in this queue.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                background: '#161616',
                border: '1px solid #242424',
                borderRadius: 16,
                padding: 18,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: 16, color: '#fff' }}>{job.title}</h3>
                    {job.urgent ? (
                      <span style={{ color: '#E05252', fontSize: 11, fontWeight: 700 }}>URGENT</span>
                    ) : null}
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#C9A84C',
                        border: '1px solid rgba(201,168,76,0.35)',
                        borderRadius: 6,
                        padding: '2px 8px',
                      }}
                    >
                      {String(job.status || '').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p style={{ margin: '8px 0', color: '#909090', fontSize: 12, lineHeight: 1.5 }}>
                    {(job.description || '').slice(0, 220)}
                    {(job.description || '').length > 220 ? '…' : ''}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, color: '#666', fontSize: 11 }}>
                    <span>Category: {job.category}</span>
                    <span>Budget: {job.budgetDisplay || job.budget || '—'}</span>
                    <span>Deadline: {formatDate(job.deadline)}</span>
                    <span>Location: {job.locationType}</span>
                    <span>Poster: {job.posterName}</span>
                    <span>Apps: {job.applicationCount || 0}</span>
                  </div>
                  {job.rejectReason ? (
                    <p style={{ margin: '8px 0 0', color: '#E05252', fontSize: 12 }}>
                      Reject reason: {job.rejectReason}
                    </p>
                  ) : null}
                </div>

                {job.status === 'pending_review' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 }}>
                    <input
                      type="text"
                      placeholder="Reject reason (optional)"
                      value={rejectReason[job.id] || ''}
                      onChange={(e) =>
                        setRejectReason((prev) => ({ ...prev, [job.id]: e.target.value }))
                      }
                      style={{
                        background: '#0f0f0f',
                        border: '1px solid #333',
                        borderRadius: 10,
                        color: '#eee',
                        padding: '8px 10px',
                        fontSize: 12,
                      }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        disabled={busyId === job.id}
                        onClick={() => approve(job.id)}
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          background: 'linear-gradient(135deg,#E2C06A,#7A5E1E)',
                          border: 'none',
                          borderRadius: 10,
                          padding: '9px 12px',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer',
                          color: '#080808',
                        }}
                      >
                        <MdCheck size={16} /> Approve
                      </button>
                      <button
                        type="button"
                        disabled={busyId === job.id}
                        onClick={() => reject(job.id)}
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          background: 'rgba(224,82,82,0.12)',
                          border: '1px solid rgba(224,82,82,0.35)',
                          borderRadius: 10,
                          padding: '9px 12px',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer',
                          color: '#E05252',
                        }}
                      >
                        <MdClose size={16} /> Reject
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
