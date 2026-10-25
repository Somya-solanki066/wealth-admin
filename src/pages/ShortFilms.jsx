import { useEffect, useState } from 'react';
import api from '../services/api';
import './AiConfig.css';

const TABS = [
  { id: 'published', label: 'Published' },
  { id: 'pending_review', label: 'Pending' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'reported', label: 'Reported' },
];

const GENRES = [
  'Drama',
  'Romance',
  'Thriller',
  'Crime',
  'Comedy',
  'Sci-Fi',
  'Horror',
  'Action',
  'Documentary',
  'Animation',
];

const EMPTY_FORM = {
  title: '',
  genre: 'Drama',
  durationLabel: '10:00',
  durationMinutes: 10,
  thumbnailUrl: '',
  videoUrl: '',
  description: '',
  director: 'Admin',
  writer: 'Admin',
  cast: '',
  creatorName: 'Ink2Wealth Studio',
  status: 'published',
};

export default function ShortFilms() {
  const [tab, setTab] = useState('published');
  const [films, setFilms] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [rejectReason, setRejectReason] = useState('Needs changes');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const deleteFilm = async (id) => {
    if (!window.confirm('Are you sure you want to delete this short film?')) return;
    try {
      await api.delete(`/data/short-films/${id}`);
      setMessage('Short film deleted successfully.');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (film) => {
    setEditingId(film.id);
    setFormData({
      title: film.title || '',
      genre: film.genre || 'Drama',
      durationLabel: film.durationLabel || '10:00',
      durationMinutes: film.durationSeconds ? Math.round(film.durationSeconds / 60) : 10,
      thumbnailUrl: film.thumbnailUrl || '',
      videoUrl: film.externalVideoUrl || film.videoUrl || '',
      description: film.description || '',
      director: film.director || 'Admin',
      writer: film.writer || 'Admin',
      cast: film.cast || '',
      creatorName: film.creatorName || 'Ink2Wealth Studio',
      status: film.status || 'published',
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await api.post('/data/short-films/upload-thumbnail', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.url) {
        setFormData((prev) => ({ ...prev, thumbnailUrl: res.data.url }));
        setMessage('Thumbnail uploaded successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload thumbnail');
    } finally {
      setUploadingImg(false);
    }
  };

  const saveFilm = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      if (editingId) {
        await api.put(`/data/short-films/${editingId}`, formData);
        setMessage('Film updated successfully.');
      } else {
        await api.post('/data/short-films', formData);
        setMessage('Short film created and published.');
      }
      setShowModal(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save short film');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ai-config-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Short Films</h2>
          <p>Upload and manage short films that appear in the Screenwriter section.</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          style={{
            background: 'linear-gradient(135deg, #D0232F, #9E1520)',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>+ Add Short Film</span>
        </button>
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

        {tab === 'pending_review' && (
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
          <div className="empty-state">No films in this list. Click "+ Add Short Film" to create one.</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Title</th>
                  <th>Genre</th>
                  <th>Duration</th>
                  <th>Creator / Director</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {films.map((f) => (
                  <tr key={f.id}>
                    <td>
                      {f.thumbnailUrl ? (
                        <img
                          src={f.thumbnailUrl}
                          alt=""
                          style={{ width: 72, height: 42, objectFit: 'cover', borderRadius: 6 }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 72,
                            height: 42,
                            background: '#2A0A10',
                            color: '#D0232F',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          🎬
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{f.title}</strong>
                      {f.description && (
                        <div style={{ fontSize: 12, color: '#888', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {f.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ background: '#33171A', color: '#ff7b89', padding: '3px 8px', borderRadius: 6, fontSize: 12 }}>
                        {f.genre}
                      </span>
                    </td>
                    <td>{f.durationLabel || (f.durationSeconds ? `${Math.round(f.durationSeconds / 60)} min` : '—')}</td>
                    <td>{f.director || f.creatorName || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() => openEdit(f)}
                          style={{ color: '#D0232F', fontWeight: 600 }}
                        >
                          Edit
                        </button>
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
                        <button type="button" className="btn-link danger" onClick={() => deleteFilm(f.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Short Film Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#1A1817',
              color: '#F0ECE8',
              borderRadius: '16px',
              border: '1px solid #332B25',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                {editingId ? 'Edit Short Film' : 'Add New Short Film'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#999', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveFilm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#B5ADA6' }}>
                  Film Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Last Message"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: '#25221F', border: '1px solid #3D3630', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#B5ADA6' }}>
                    Genre
                  </label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#25221F', border: '1px solid #3D3630', borderRadius: '8px', color: '#fff' }}
                  >
                    {GENRES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#B5ADA6' }}>
                    Duration Display (e.g. 12:04)
                  </label>
                  <input
                    type="text"
                    placeholder="12:04"
                    value={formData.durationLabel}
                    onChange={(e) => setFormData({ ...formData, durationLabel: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#25221F', border: '1px solid #3D3630', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#B5ADA6' }}>
                  Thumbnail Image URL
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="https://... or upload below"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    style={{ flex: 1, padding: '10px 12px', background: '#25221F', border: '1px solid #3D3630', borderRadius: '8px', color: '#fff' }}
                  />
                  <label
                    style={{
                      background: '#332B25',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {uploadingImg ? 'Uploading…' : '📁 Upload'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                {formData.thumbnailUrl && (
                  <div style={{ marginTop: '8px' }}>
                    <img
                      src={formData.thumbnailUrl}
                      alt="Preview"
                      style={{ height: '70px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#B5ADA6' }}>
                  Video URL / YouTube Embed URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://www.youtube.com/embed/aqz-KE-bpKQ or .mp4"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: '#25221F', border: '1px solid #3D3630', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#B5ADA6' }}>
                  Logline / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Short logline or premise of the film..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: '#25221F', border: '1px solid #3D3630', borderRadius: '8px', color: '#fff', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#B5ADA6' }}>
                    Director
                  </label>
                  <input
                    type="text"
                    value={formData.director}
                    onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#25221F', border: '1px solid #3D3630', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#B5ADA6' }}>
                    Writer
                  </label>
                  <input
                    type="text"
                    value={formData.writer}
                    onChange={(e) => setFormData({ ...formData, writer: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#25221F', border: '1px solid #3D3630', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: '#2A241F',
                    border: '1px solid #3D3630',
                    color: '#B5ADA6',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #D0232F, #9E1520)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? 'Saving…' : editingId ? 'Update Film' : 'Publish Film'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
