import { useEffect, useState } from 'react';
import { MdPerson, MdSave, MdAdd, MdDelete, MdCloudUpload } from 'react-icons/md';
import api from '../services/api';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';
import './LandingCourses.css';

const EMPTY_PAGE = {
  name: '',
  role: '',
  bio: '',
  photoUrl: '',
  stats: [],
  youtubeHandle: '',
  youtubeLabel: '',
  youtubeDescription: '',
  youtubeButtonLabel: '',
  youtubeUrl: '',
  communityTitle: '',
  communityBadge: '',
  communityDescription: '',
  communityButtonLabel: '',
  communityUrl: '',
};

export default function CoachPage() {
  const [page, setPage] = useState(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3500);
  };

  const loadPage = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coach-page');
      setPage(res.data?.data || EMPTY_PAGE);
    } catch (err) {
      console.error(err);
      showMessage('Failed to load coach page.', 'error');
      setPage(EMPTY_PAGE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const updateField = (key, value) => {
    setPage((prev) => ({ ...prev, [key]: value }));
  };

  const updateStat = (index, patch) => {
    setPage((prev) => ({
      ...prev,
      stats: (prev.stats || []).map((item, i) =>
        i === index ? { ...item, ...patch } : item
      ),
    }));
  };

  const addStat = () => {
    setPage((prev) => ({
      ...prev,
      stats: [...(prev.stats || []), { value: '', label: '' }],
    }));
  };

  const removeStat = (index) => {
    setPage((prev) => ({
      ...prev,
      stats: (prev.stats || []).filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/coach-page', { page });
      if (res.data?.data) setPage(res.data.data);
      showMessage('Coach page saved successfully.');
    } catch (err) {
      console.error(err);
      showMessage(err.response?.data?.error || 'Failed to save coach page.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await api.post('/coach-page/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.photoUrl || res.data?.photoURL || '';
      if (url) updateField('photoUrl', url);
      showMessage('Profile photo uploaded.');
    } catch (err) {
      console.error(err);
      showMessage(err.response?.data?.error || 'Photo upload failed.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="landing-courses-page">
      <div className="lc-header">
        <div>
          <h2>
            <MdPerson className="lc-header-icon" /> Coach Page
          </h2>
          <p>
            Edit the public /coach profile — photo, bio, stats, YouTube link, and community link.
          </p>
        </div>
        <button type="button" className="lc-save-btn" onClick={handleSave} disabled={saving || loading}>
          <MdSave size={18} />
          {saving ? 'Saving...' : 'Save Coach Page'}
        </button>
      </div>

      {message.text && <div className={`lc-message ${message.type}`}>{message.text}</div>}

      {loading ? (
        <div className="lc-loading">Loading coach page...</div>
      ) : (
        <div className="lc-panels">
          <section className="lc-panel">
            <h3>Profile</h3>
            <div className="lc-coach-photo">
              <div className="lc-photo-preview">
                {page.photoUrl ? (
                  <img src={resolveMediaUrl(page.photoUrl)} alt="Coach" />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <div className="lc-photo-actions">
                <label className="lc-upload-btn">
                  <MdCloudUpload size={16} />
                  {uploading ? 'Uploading...' : 'Upload profile photo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                  />
                </label>
                <label>
                  Photo URL (optional)
                  <input
                    value={page.photoUrl || ''}
                    onChange={(e) => updateField('photoUrl', e.target.value)}
                    placeholder="https://... or /uploads/..."
                  />
                </label>
                <p className="lc-hint">JPEG / PNG / WEBP · max 5 MB</p>
              </div>
            </div>

            <div className="lc-grid">
              <label>
                Name
                <input value={page.name || ''} onChange={(e) => updateField('name', e.target.value)} />
              </label>
              <label>
                Role / titles
                <input value={page.role || ''} onChange={(e) => updateField('role', e.target.value)} />
              </label>
              <label className="lc-full">
                Bio
                <textarea
                  rows={4}
                  value={page.bio || ''}
                  onChange={(e) => updateField('bio', e.target.value)}
                />
              </label>
            </div>

            <div className="lc-subhead">
              <h4>Stats</h4>
              <button type="button" className="lc-add-btn" onClick={addStat}>
                <MdAdd size={16} /> Add stat
              </button>
            </div>
            <div className="lc-list">
              {(page.stats || []).map((stat, index) => (
                <div key={index} className="lc-list-row">
                  <input
                    value={stat.value || ''}
                    onChange={(e) => updateStat(index, { value: e.target.value })}
                    placeholder="Value (e.g. 2,400+)"
                  />
                  <input
                    value={stat.label || ''}
                    onChange={(e) => updateStat(index, { label: e.target.value })}
                    placeholder="Label"
                  />
                  <button type="button" className="lc-icon-btn danger" onClick={() => removeStat(index)}>
                    <MdDelete size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="lc-panel">
            <h3>YouTube Card</h3>
            <div className="lc-grid">
              <label>
                Handle
                <input
                  value={page.youtubeHandle || ''}
                  onChange={(e) => updateField('youtubeHandle', e.target.value)}
                />
              </label>
              <label>
                Label
                <input
                  value={page.youtubeLabel || ''}
                  onChange={(e) => updateField('youtubeLabel', e.target.value)}
                />
              </label>
              <label className="lc-full">
                Description
                <textarea
                  rows={3}
                  value={page.youtubeDescription || ''}
                  onChange={(e) => updateField('youtubeDescription', e.target.value)}
                />
              </label>
              <label>
                Button label
                <input
                  value={page.youtubeButtonLabel || ''}
                  onChange={(e) => updateField('youtubeButtonLabel', e.target.value)}
                />
              </label>
              <label>
                YouTube URL
                <input
                  value={page.youtubeUrl || ''}
                  onChange={(e) => updateField('youtubeUrl', e.target.value)}
                  placeholder="https://www.youtube.com/..."
                />
              </label>
            </div>
          </section>

          <section className="lc-panel">
            <h3>Community Card</h3>
            <div className="lc-grid">
              <label>
                Title
                <input
                  value={page.communityTitle || ''}
                  onChange={(e) => updateField('communityTitle', e.target.value)}
                />
              </label>
              <label>
                Badge / subtitle
                <input
                  value={page.communityBadge || ''}
                  onChange={(e) => updateField('communityBadge', e.target.value)}
                />
              </label>
              <label className="lc-full">
                Description
                <textarea
                  rows={3}
                  value={page.communityDescription || ''}
                  onChange={(e) => updateField('communityDescription', e.target.value)}
                />
              </label>
              <label>
                Button label
                <input
                  value={page.communityButtonLabel || ''}
                  onChange={(e) => updateField('communityButtonLabel', e.target.value)}
                />
              </label>
              <label>
                Community URL
                <input
                  value={page.communityUrl || ''}
                  onChange={(e) => updateField('communityUrl', e.target.value)}
                  placeholder="https://..."
                />
              </label>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
