import { useEffect, useState } from 'react';
import api from '../services/api';
import { MdSchool, MdRefresh } from 'react-icons/md';

const COURSE_FILTERS = [
  { id: '', label: 'All Courses' },
  { id: 'witweb', label: 'WIT-WEB' },
  { id: 'ssg', label: 'SSG Blueprint' },
];

const STATUS_FILTERS = [
  { id: '', label: 'All Status' },
  { id: 'paid', label: 'Paid' },
  { id: 'pending', label: 'Pending' },
  { id: 'failed', label: 'Failed' },
];

function formatDate(value) {
  if (!value) return 'Lifetime';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function formatMoney(amount, currency = 'NGN') {
  if (!amount && amount !== 0) return '—';
  return `${currency === 'NGN' ? '₦' : ''}${Number(amount).toLocaleString()}`;
}

export default function CourseEnrollments() {
  const [courseId, setCourseId] = useState('');
  const [status, setStatus] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (nextCourse = courseId, nextStatus = status) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (nextCourse) params.set('courseId', nextCourse);
      if (nextStatus) params.set('status', nextStatus);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await api.get(`/data/course-enrollments${qs}`);
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load enrollments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(courseId, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, status]);

  return (
    <div style={{ padding: '8px 4px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdSchool size={26} /> Course Enrollments
          </h1>
          <p style={{ margin: '6px 0 0', color: '#888', fontSize: 13 }}>
            Track who enrolled in WIT-WEB, SSG Blueprint, and other flagship courses — payment amount and unique enrollment IDs.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load(courseId, status)}
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
        {COURSE_FILTERS.map((f) => (
          <button
            key={f.id || 'all'}
            type="button"
            onClick={() => setCourseId(f.id)}
            style={{
              borderRadius: 999,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              border: '1px solid #333',
              cursor: 'pointer',
              background: courseId === f.id ? '#3b82f6' : '#111',
              color: courseId === f.id ? '#fff' : '#aaa',
            }}
          >
            {f.label}
          </button>
        ))}
        {STATUS_FILTERS.map((f) => (
          <button
            key={`status-${f.id || 'all'}`}
            type="button"
            onClick={() => setStatus(f.id)}
            style={{
              borderRadius: 999,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              border: '1px solid #333',
              cursor: 'pointer',
              background: status === f.id ? '#22c55e' : '#111',
              color: status === f.id ? '#fff' : '#aaa',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p> : null}

      {loading ? (
        <p style={{ color: '#888' }}>Loading enrollments…</p>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid #2a2a2a', borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 960 }}>
            <thead>
              <tr style={{ background: '#141414', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px', color: '#888' }}>Enrollment ID</th>
                <th style={{ padding: '12px 14px', color: '#888' }}>User</th>
                <th style={{ padding: '12px 14px', color: '#888' }}>Course</th>
                <th style={{ padding: '12px 14px', color: '#888' }}>Amount</th>
                <th style={{ padding: '12px 14px', color: '#888' }}>Status</th>
                <th style={{ padding: '12px 14px', color: '#888' }}>Valid From</th>
                <th style={{ padding: '12px 14px', color: '#888' }}>Valid Until</th>
                <th style={{ padding: '12px 14px', color: '#888' }}>Paid On</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr key={row.id} style={{ borderTop: '1px solid #222' }}>
                    <td style={{ padding: '12px 14px', color: '#60a5fa', fontWeight: 700, fontFamily: 'monospace' }}>
                      {row.enrollmentId || '—'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ color: '#eee' }}>{row.userName || '—'}</div>
                      <div style={{ color: '#666', fontSize: 11 }}>{row.userEmail || row.userId}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#eee' }}>{row.courseName}</td>
                    <td style={{ padding: '12px 14px', color: '#eee' }}>
                      {formatMoney(row.amountPaid, row.currency)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          background: row.status === 'paid' ? 'rgba(34,197,94,0.15)' : 'rgba(250,204,21,0.15)',
                          color: row.status === 'paid' ? '#4ade80' : '#facc15',
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#aaa' }}>{formatDate(row.validFrom)}</td>
                    <td style={{ padding: '12px 14px', color: '#aaa' }}>
                      {row.accessType === 'lifetime' ? 'Lifetime' : formatDate(row.validUntil)}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#aaa' }}>{formatDate(row.confirmedAt || row.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#666' }}>
                    No enrollments yet. They appear here when a user pays for a course.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
