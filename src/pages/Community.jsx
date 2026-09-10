import { useEffect, useState } from 'react';
import api from '../services/api';
import './AiConfig.css';

export default function Community() {
  const [tab, setTab] = useState('reports');
  const [rooms, setRooms] = useState([]);
  const [reports, setReports] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [roomForm, setRoomForm] = useState({
    name: '',
    description: '',
    type: 'genre',
    category: '',
    visibility: 'public',
    status: 'active',
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'rooms') {
        const res = await api.get('/data/community-rooms');
        setRooms(res.data?.data || []);
      } else if (tab === 'reports') {
        const res = await api.get('/data/community-reports', { params: { status: 'open' } });
        setReports(res.data?.data || []);
      } else {
        const res = await api.get('/data/community-posts');
        setPosts(res.data?.data || []);
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

  const resolve = async (id, action) => {
    try {
      await api.post(`/data/community-reports/${id}/resolve`, { action });
      setMessage(action === 'remove_content' ? 'Content removed.' : 'Report dismissed.');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Action failed');
    }
  };

  const createRoom = async () => {
    if (!roomForm.name.trim()) {
      setError('Room name required');
      return;
    }
    try {
      await api.post('/data/community-rooms', roomForm);
      setMessage('Room saved.');
      setRoomForm({
        name: '',
        description: '',
        type: 'genre',
        category: '',
        visibility: 'public',
        status: 'active',
      });
      setTab('rooms');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create room');
    }
  };

  return (
    <div className="ai-config-page">
      <div className="page-header">
        <h2>Screenwriter Community</h2>
        <p>Manage rooms, moderate reports, and review posts.</p>
      </div>

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      <div className="filters-row">
        {[
          { id: 'reports', label: 'Reports' },
          { id: 'rooms', label: 'Rooms' },
          { id: 'posts', label: 'Posts' },
          { id: 'create', label: 'Create Room' },
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

      {tab === 'create' && (
        <div className="config-card" style={{ maxWidth: 520 }}>
          <h3>Create Room</h3>
          <div className="form-grid">
            <label>
              Room Name
              <input
                value={roomForm.name}
                onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
              />
            </label>
            <label>
              Category
              <input
                value={roomForm.category}
                onChange={(e) => setRoomForm({ ...roomForm, category: e.target.value })}
              />
            </label>
            <label>
              Type
              <select
                value={roomForm.type}
                onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
              >
                <option value="public">Public discussion</option>
                <option value="genre">Genre</option>
                <option value="feedback">Weekly Feedback</option>
                <option value="mentorship">Mentorship</option>
              </select>
            </label>
            <label>
              Visibility
              <select
                value={roomForm.visibility}
                onChange={(e) => setRoomForm({ ...roomForm, visibility: e.target.value })}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </label>
          </div>
          <label className="field-stack">
            Description
            <textarea
              value={roomForm.description}
              onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
              rows={3}
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn-primary" onClick={createRoom}>
              Create Room
            </button>
          </div>
        </div>
      )}

      {loading && tab !== 'create' ? (
        <div className="loading-state">Loading…</div>
      ) : tab === 'reports' ? (
        reports.length === 0 ? (
          <div className="empty-state">No open reports.</div>
        ) : (
          <div className="config-card">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Target</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id}>
                      <td>{r.targetType}</td>
                      <td>{r.targetId}</td>
                      <td>{r.reason}</td>
                      <td>{r.status}</td>
                      <td>
                        <button type="button" className="btn-link" onClick={() => resolve(r.id, 'dismiss')}>
                          Dismiss
                        </button>
                        <button
                          type="button"
                          className="btn-link danger"
                          onClick={() => resolve(r.id, 'remove_content')}
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
        )
      ) : tab === 'rooms' ? (
        <div className="config-card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Members</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.type}</td>
                    <td>{r.memberCount || 0}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === 'posts' ? (
        <div className="config-card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Room</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>{p.authorName}</td>
                    <td>{p.roomName || p.roomId}</td>
                    <td>{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
