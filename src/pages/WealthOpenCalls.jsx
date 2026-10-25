import { useEffect, useState } from 'react';
import api from '../services/api';
import { MdMovieFilter, MdRefresh, MdCheck, MdClose, MdAdd, MdEdit, MdVisibility } from 'react-icons/md';

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
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [pitches, setPitches] = useState([]);
  const [pitchesFor, setPitchesFor] = useState('');
  const [form, setForm] = useState({
    title: '',
    organization: '',
    callType: 'script_submission',
    genre: 'Drama',
    description: '',
    applyFormat: 'Logline and 10 pages',
    budget: '',
    location: '',
    experience: 'Intermediate',
    duration: '1 to 3 months',
    skills: '',
    deadline: '',
    pinned: false,
    verified: true,
    publishNow: true,
  });

  const emptyForm = {
    title: '',
    organization: '',
    callType: 'script_submission',
    genre: 'Drama',
    description: '',
    applyFormat: 'Logline and 10 pages',
    budget: '',
    location: '',
    experience: 'Intermediate',
    duration: '1 to 3 months',
    skills: '',
    deadline: '',
    pinned: false,
    verified: true,
    publishNow: true,
  };

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

  const createListing = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const payload = {
        ...form,
        status: form.publishNow ? 'active' : 'pending_review',
      };
      if (editingId) {
        await api.put(`/data/wealth-open-calls/${editingId}`, payload);
      } else {
        await api.post('/data/wealth-open-calls', payload);
      }
      setShowCreate(false);
      setEditingId('');
      setForm(emptyForm);
      await load(status);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save listing.');
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (call) => {
    setEditingId(call.id);
    setForm({
      title: call.title || '',
      organization: call.organization || '',
      callType: call.callType || 'script_submission',
      genre: call.genre || 'Drama',
      description: call.description || '',
      applyFormat: call.applyFormat || '',
      budget: call.budget || call.prize || '',
      location: call.location || '',
      experience: call.experience || 'Intermediate',
      duration: call.duration || '1 to 3 months',
      skills: Array.isArray(call.skills) ? call.skills.join(', ') : (call.skills || ''),
      deadline: call.deadline ? String(call.deadline).slice(0, 10) : '',
      pinned: call.pinned === true,
      verified: call.verified !== false,
      publishNow: call.status === 'active',
    });
    setShowCreate(true);
  };

  const closeListing = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/data/wealth-open-calls/${id}/close`);
      await load(status);
    } catch (err) {
      setError(err.response?.data?.error || 'Close failed.');
    } finally {
      setBusyId('');
    }
  };

  const viewPitches = async (id) => {
    setBusyId(id);
    setError('');
    try {
      const res = await api.get(`/data/wealth-open-calls/${id}/pitches`);
      setPitches(res.data.data || []);
      setPitchesFor(id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load proposals.');
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
            Create listings, review user posts, and approve them for the Script Industry Hub.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={() => {
            setEditingId('');
            setForm(emptyForm);
            setShowCreate(true);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            border: 'none',
            background: '#C9A84C',
            color: '#1a1400',
            borderRadius: 10,
            padding: '8px 14px',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          <MdAdd size={16} /> Add listing
        </button>
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
                    Poster: {call.posterName} · {call.budget || call.prize || 'Budget n/a'} · Deadline:{' '}
                    {formatDate(call.deadline)} · Pitches: {call.pitchCount || 0}
                  </p>
                  {call.location ? (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#777' }}>{call.location}</p>
                  ) : null}
                  {call.rejectReason ? (
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: '#E05252' }}>
                      Reject reason: {call.rejectReason}
                    </p>
                  ) : null}
                </div>
              </div>

                  <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => openEdit(call)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        border: '1px solid #333',
                        background: 'transparent',
                        color: '#ddd',
                        borderRadius: 8,
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      <MdEdit size={15} /> Edit
                    </button>
                    <button
                      type="button"
                      disabled={busyId === call.id}
                      onClick={() => viewPitches(call.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        border: '1px solid #333',
                        background: 'transparent',
                        color: '#ddd',
                        borderRadius: 8,
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      <MdVisibility size={15} /> Proposals
                    </button>
                    {call.status === 'active' ? (
                      <button
                        type="button"
                        disabled={busyId === call.id}
                        onClick={() => closeListing(call.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          border: '1px solid #888',
                          background: 'transparent',
                          color: '#aaa',
                          borderRadius: 8,
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        Close listing
                      </button>
                    ) : null}
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

      {showCreate ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.62)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 40,
            padding: 16,
          }}
        >
          <form
            onSubmit={createListing}
            style={{
              width: 'min(560px, 100%)',
              maxHeight: '90vh',
              overflow: 'auto',
              background: '#141414',
              border: '1px solid #2a2a2a',
              borderRadius: 16,
              padding: 20,
            }}
          >
            <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>
              {editingId ? 'Edit Industry Hub listing' : 'Add Industry Hub listing'}
            </h2>
            <label style={{ display: 'block', marginBottom: 10, fontSize: 12, color: '#aaa' }}>
              Type
              <select
                value={form.callType}
                onChange={(e) => setForm((prev) => ({ ...prev, callType: e.target.value }))}
                style={{
                  width: '100%',
                  marginTop: 4,
                  border: '1px solid #333',
                  background: '#1a1a1a',
                  color: '#eee',
                  borderRadius: 8,
                  padding: '8px 10px',
                }}
              >
                <option value="script_submission">Feature / script submission</option>
                <option value="short_film">Short film</option>
                <option value="commission">TV / commission</option>
                <option value="collaboration">Audio / collaboration</option>
                <option value="competition">Competition</option>
              </select>
            </label>
            {[
              ['title', 'Job title'],
              ['organization', 'Company / production house'],
              ['genre', 'Genre'],
              ['budget', 'Budget'],
              ['location', 'Location'],
              ['applyFormat', 'How to apply'],
              ['skills', 'Skills (comma separated)'],
              ['deadline', 'Deadline (YYYY-MM-DD)'],
            ].map(([key, label]) => (
              <label key={key} style={{ display: 'block', marginBottom: 10, fontSize: 12, color: '#aaa' }}>
                {label}
                <input
                  required={key === 'title' || key === 'organization'}
                  value={form[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  style={{
                    width: '100%',
                    marginTop: 4,
                    border: '1px solid #333',
                    background: '#1a1a1a',
                    color: '#eee',
                    borderRadius: 8,
                    padding: '8px 10px',
                  }}
                />
              </label>
            ))}
            <label style={{ display: 'block', marginBottom: 10, fontSize: 12, color: '#aaa' }}>
              Description
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  marginTop: 4,
                  border: '1px solid #333',
                  background: '#1a1a1a',
                  color: '#eee',
                  borderRadius: 8,
                  padding: '8px 10px',
                }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: 10, fontSize: 12, color: '#aaa' }}>
              Experience
              <select
                value={form.experience}
                onChange={(e) => setForm((prev) => ({ ...prev, experience: e.target.value }))}
                style={{ width: '100%', marginTop: 4, border: '1px solid #333', background: '#1a1a1a', color: '#eee', borderRadius: 8, padding: '8px 10px' }}
              >
                <option>Entry level</option>
                <option>Intermediate</option>
                <option>Expert</option>
              </select>
            </label>
            <label style={{ display: 'block', marginBottom: 10, fontSize: 12, color: '#aaa' }}>
              Duration
              <select
                value={form.duration}
                onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
                style={{ width: '100%', marginTop: 4, border: '1px solid #333', background: '#1a1a1a', color: '#eee', borderRadius: 8, padding: '8px 10px' }}
              >
                <option>Under 1 month</option>
                <option>1 to 3 months</option>
                <option>2 to 3 months</option>
                <option>3 to 6 months</option>
              </select>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0', fontSize: 13, color: '#ddd' }}>
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(e) => setForm((prev) => ({ ...prev, pinned: e.target.checked }))}
              />
              Pin to top of Find work
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0', fontSize: 13, color: '#ddd' }}>
              <input
                type="checkbox"
                checked={form.verified}
                onChange={(e) => setForm((prev) => ({ ...prev, verified: e.target.checked }))}
              />
              Payment verified
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 16px', fontSize: 13, color: '#ddd' }}>
              <input
                type="checkbox"
                checked={form.publishNow}
                onChange={(e) => setForm((prev) => ({ ...prev, publishNow: e.target.checked }))}
              />
              Publish now (skip pending review)
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                onClick={() => {
                  setShowCreate(false);
                  setEditingId('');
                  setForm(emptyForm);
                }}
                style={{ background: 'transparent', color: '#aaa', border: '1px solid #333', borderRadius: 8, padding: '8px 12px' }}
              >
                Cancel
              </button>
              <button type="submit" disabled={creating} style={{ background: '#C9A84C', color: '#1a1400', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 700 }}>
                {creating ? 'Saving…' : 'Save listing'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {pitchesFor ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.62)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 40,
            padding: 16,
          }}
        >
          <div
            style={{
              width: 'min(640px, 100%)',
              maxHeight: '90vh',
              overflow: 'auto',
              background: '#141414',
              border: '1px solid #2a2a2a',
              borderRadius: 16,
              padding: 20,
            }}
          >
            <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Proposals</h2>
            {pitches.length === 0 ? (
              <p style={{ color: '#888', fontSize: 13 }}>No proposals on this listing yet.</p>
            ) : (
              pitches.map((p) => (
                <div key={p.id} style={{ border: '1px solid #2a2a2a', borderRadius: 12, padding: 12, marginBottom: 10 }}>
                  <strong style={{ color: '#fff' }}>{p.applicantName || 'Applicant'}</strong>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#888' }}>
                    {p.status || 'pending'} · {p.bidAmount || 'No bid'} · {p.deliveryTime || 'No delivery time'}
                  </p>
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: '#ccc', lineHeight: 1.5 }}>{p.pitchMessage}</p>
                  {p.sampleUrl ? (
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: '#C9A84C' }}>{p.sampleUrl}</p>
                  ) : null}
                </div>
              ))
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setPitchesFor('');
                  setPitches([]);
                }}
                style={{ background: 'transparent', color: '#aaa', border: '1px solid #333', borderRadius: 8, padding: '8px 12px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
