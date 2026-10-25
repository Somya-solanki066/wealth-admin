import { useState, useEffect } from 'react';
import {
  MdMenuBook,
  MdAdd,
  MdRefresh,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdFavorite,
  MdChatBubble,
  MdShare,
  MdStar,
  MdClose,
  MdCloudUpload,
} from 'react-icons/md';
import { trendingSerialsService } from '../services/trendingSerialsService';
import resolveMediaUrl from '../utils/resolveMediaUrl';
import './TrendingSerials.css';

// Fallback prototype cover maps
const COVER_MAP = {
  book0: 'Werewolf Romance Cover',
  book1: 'Fantasy Romance Cover',
  book2: 'Vampire Romance Cover',
  book3: 'Second-Chance Romance Cover',
  book4: 'Legal Thriller Cover',
  book5: 'Sci-Fi Cover',
};

const TrendingSerials = () => {
  const [serials, setSerials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState('');

  // Modals
  const [showSerialModal, setShowSerialModal] = useState(false);
  const [editingSerial, setEditingSerial] = useState(null);
  const [showChaptersModal, setShowChaptersModal] = useState(false);
  const [activeSerialForChapters, setActiveSerialForChapters] = useState(null);

  // Serial form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'Werewolf romance',
    rating: '4.8',
    author: 'Ink2Wealth Author',
    tagline: '',
    tags: '',
    status: 'Ongoing',
    chaptersTotal: '100',
    blurb: '',
    coverUrl: '',
    img: 'book0',
  });
  const [uploadingCover, setUploadingCover] = useState(false);

  // Chapter form state
  const [newChapter, setNewChapter] = useState({
    title: '',
    readTime: '5 min read',
    content: '',
  });
  const [submittingChapter, setSubmittingChapter] = useState(false);

  useEffect(() => {
    loadSerials();
  }, []);

  const loadSerials = async () => {
    try {
      setLoading(true);
      const res = await trendingSerialsService.getSerials();
      setSerials(res.data || []);
    } catch (err) {
      console.error('Failed to load serials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!window.confirm('Seed or reset prototype serials? This will populate the 6 prototype serials with complete chapters, covers, and metrics.')) {
      return;
    }
    try {
      setSeeding(true);
      await trendingSerialsService.seedSerials(true);
      await loadSerials();
      alert('Prototype serials seeded successfully!');
    } catch (err) {
      console.error('Seeder failed:', err);
      alert('Failed to seed serials: ' + (err.response?.data?.error || err.message));
    } finally {
      setSeeding(false);
    }
  };

  const openAddModal = () => {
    setEditingSerial(null);
    setFormData({
      title: '',
      category: 'Werewolf romance',
      rating: '4.8',
      author: 'Ink2Wealth Author',
      tagline: '',
      tags: 'Romance, Werewolf, Alpha',
      status: 'Ongoing',
      chaptersTotal: '50',
      blurb: '',
      coverUrl: '',
      img: 'book0',
    });
    setShowSerialModal(true);
  };

  const openEditModal = (serial) => {
    setEditingSerial(serial);
    setFormData({
      title: serial.title || '',
      category: serial.category || serial.sub || 'Romance',
      rating: serial.rating || '4.8',
      author: serial.author || 'Ink2Wealth Author',
      tagline: serial.tagline || '',
      tags: Array.isArray(serial.tags) ? serial.tags.join(', ') : serial.tags || '',
      status: serial.status || 'Ongoing',
      chaptersTotal: String(serial.chaptersTotal || '0'),
      blurb: serial.blurb || '',
      coverUrl: serial.coverUrl || '',
      img: serial.img || 'book0',
    });
    setShowSerialModal(true);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      const res = await trendingSerialsService.uploadCover(file);
      if (res.url) {
        setFormData((prev) => ({ ...prev, coverUrl: res.url, img: res.url }));
      }
    } catch (err) {
      console.error('Failed to upload cover:', err);
      alert('Failed to upload cover image.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSaveSerial = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Title is required.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      category: formData.category.trim(),
      sub: formData.category.trim(),
      rating: formData.rating.trim(),
      author: formData.author.trim(),
      tagline: formData.tagline.trim(),
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status: formData.status,
      chaptersTotal: parseInt(formData.chaptersTotal || '0', 10),
      blurb: formData.blurb.trim(),
      coverUrl: formData.coverUrl.trim(),
      img: formData.coverUrl.trim() || formData.img,
    };

    try {
      if (editingSerial) {
        await trendingSerialsService.updateSerial(editingSerial.id, payload);
      } else {
        await trendingSerialsService.createSerial(payload);
      }
      setShowSerialModal(false);
      await loadSerials();
    } catch (err) {
      console.error('Failed to save serial:', err);
      alert('Failed to save serial: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteSerial = async (serial) => {
    if (!window.confirm(`Are you sure you want to delete "${serial.title}"?`)) {
      return;
    }
    try {
      await trendingSerialsService.deleteSerial(serial.id);
      await loadSerials();
    } catch (err) {
      console.error('Failed to delete serial:', err);
      alert('Failed to delete serial: ' + (err.response?.data?.error || err.message));
    }
  };

  // Chapter management
  const openChaptersModal = (serial) => {
    setActiveSerialForChapters(serial);
    setNewChapter({ title: '', readTime: '5 min read', content: '' });
    setShowChaptersModal(true);
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!newChapter.title.trim()) {
      alert('Chapter title is required.');
      return;
    }
    try {
      setSubmittingChapter(true);
      await trendingSerialsService.addChapter(activeSerialForChapters.id, newChapter);
      // Refresh current serial
      const refreshed = await trendingSerialsService.getSerial(activeSerialForChapters.id);
      setActiveSerialForChapters(refreshed.data);
      setNewChapter({ title: '', readTime: '5 min read', content: '' });
      await loadSerials();
    } catch (err) {
      console.error('Failed to add chapter:', err);
      alert('Failed to add chapter: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmittingChapter(false);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Delete this chapter?')) return;
    try {
      await trendingSerialsService.deleteChapter(activeSerialForChapters.id, chapterId);
      const refreshed = await trendingSerialsService.getSerial(activeSerialForChapters.id);
      setActiveSerialForChapters(refreshed.data);
      await loadSerials();
    } catch (err) {
      console.error('Failed to delete chapter:', err);
      alert('Failed to delete chapter: ' + (err.response?.data?.error || err.message));
    }
  };

  // Calculations for overview stats
  const totalSerials = serials.length;
  const totalReads = serials.reduce((acc, s) => acc + (s.reads || 0), 0);
  const totalLikes = serials.reduce((acc, s) => acc + (s.likes || 0), 0);
  const totalComments = serials.reduce((acc, s) => acc + (s.commentsCount || 0), 0);

  const formatCount = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  };

  const filteredSerials = serials.filter(
    (s) =>
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase()) ||
      s.sub?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="trending-serials-page">
      {/* Header */}
      <div className="ts-header">
        <div>
          <h1>Trending Serials</h1>
          <p>Manage serial fiction, live ratings, categories, blurbs, chapters, and Instagram-style engagement.</p>
        </div>
        <div className="ts-actions">
          <button className="ts-btn ts-btn-secondary" onClick={handleSeed} disabled={seeding}>
            <MdRefresh className={seeding ? 'spin' : ''} />
            {seeding ? 'Seeding...' : 'Seed Prototype Serials'}
          </button>
          <button className="ts-btn ts-btn-primary" onClick={openAddModal}>
            <MdAdd /> Add Serial
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="ts-stats-grid">
        <div className="ts-stat-card">
          <div className="ts-stat-icon" style={{ color: '#f97316' }}>
            <MdMenuBook />
          </div>
          <div className="ts-stat-info">
            <h3>{totalSerials}</h3>
            <p>Active Serials</p>
          </div>
        </div>
        <div className="ts-stat-card">
          <div className="ts-stat-icon" style={{ color: '#3b82f6' }}>
            <MdVisibility />
          </div>
          <div className="ts-stat-info">
            <h3>{formatCount(totalReads)}</h3>
            <p>Total Reads / Views</p>
          </div>
        </div>
        <div className="ts-stat-card">
          <div className="ts-stat-icon" style={{ color: '#ec4899' }}>
            <MdFavorite />
          </div>
          <div className="ts-stat-info">
            <h3>{formatCount(totalLikes)}</h3>
            <p>Total Likes</p>
          </div>
        </div>
        <div className="ts-stat-card">
          <div className="ts-stat-icon" style={{ color: '#10b981' }}>
            <MdChatBubble />
          </div>
          <div className="ts-stat-info">
            <h3>{formatCount(totalComments)}</h3>
            <p>Total Comments</p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="ts-table-container">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
          <input
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '8px 14px',
              color: '#fff',
              width: '320px',
            }}
          />
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Loading serials...
          </div>
        ) : filteredSerials.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <p style={{ fontSize: '16px', marginBottom: '16px' }}>No trending serials found.</p>
            <button className="ts-btn ts-btn-primary" onClick={handleSeed}>
              Seed Default Serials
            </button>
          </div>
        ) : (
          <table className="ts-table">
            <thead>
              <tr>
                <th>Serial</th>
                <th>Category</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Chapters</th>
                <th>Live Engagement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSerials.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="ts-serial-cell">
                      {s.coverUrl ? (
                        <img src={resolveMediaUrl(s.coverUrl)} alt={s.title} className="ts-cover-thumb" />
                      ) : (
                        <div
                          className="ts-cover-thumb"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: '#e2e8f0',
                            textAlign: 'center',
                            padding: '4px',
                            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                          }}
                        >
                          {s.img || 'Cover'}
                        </div>
                      )}
                      <div className="ts-serial-details">
                        <strong>{s.title}</strong>
                        <span>{s.tagline || s.blurb}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="ts-badge ts-badge-genre">{s.category || s.sub}</span>
                  </td>
                  <td>
                    <span className="ts-badge ts-badge-rating">
                      <MdStar style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                      {s.rating || '4.8'}
                    </span>
                  </td>
                  <td>
                    <span className="ts-badge ts-badge-status">{s.status || 'Ongoing'}</span>
                  </td>
                  <td>
                    <button
                      className="ts-btn ts-btn-secondary ts-btn-sm"
                      onClick={() => openChaptersModal(s)}
                    >
                      {s.chapters?.length || 0} / {s.chaptersTotal || 0} Ch.
                    </button>
                  </td>
                  <td>
                    <div className="ts-metrics">
                      <span title="Reads / Views">
                        <MdVisibility style={{ color: '#38bdf8' }} /> {formatCount(s.reads || 0)}
                      </span>
                      <span title="Likes">
                        <MdFavorite style={{ color: '#f43f5e' }} /> {formatCount(s.likes || 0)}
                      </span>
                      <span title="Comments">
                        <MdChatBubble style={{ color: '#34d399' }} /> {s.commentsCount || 0}
                      </span>
                      <span title="Shares">
                        <MdShare style={{ color: '#a78bfa' }} /> {s.shares || 0}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="ts-row-actions">
                      <button
                        className="ts-btn ts-btn-secondary ts-btn-sm"
                        onClick={() => openEditModal(s)}
                        title="Edit Serial"
                      >
                        <MdEdit />
                      </button>
                      <button
                        className="ts-btn ts-btn-secondary ts-btn-sm"
                        onClick={() => openChaptersModal(s)}
                        title="Manage Chapters"
                      >
                        <MdMenuBook />
                      </button>
                      <button
                        className="ts-btn ts-btn-danger ts-btn-sm"
                        onClick={() => handleDeleteSerial(s)}
                        title="Delete Serial"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Serial Modal */}
      {showSerialModal && (
        <div className="ts-modal-overlay">
          <div className="ts-modal">
            <div className="ts-modal-header">
              <h2>{editingSerial ? 'Edit Trending Serial' : 'Add New Trending Serial'}</h2>
              <button className="ts-modal-close" onClick={() => setShowSerialModal(false)}>
                <MdClose />
              </button>
            </div>
            <form onSubmit={handleSaveSerial}>
              <div className="ts-modal-body">
                <div className="ts-form-row">
                  <div className="ts-form-group">
                    <label>Serial Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. The Alpha's Hidden Mate"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="ts-form-group">
                    <label>Category / Genre *</label>
                    <input
                      type="text"
                      placeholder="e.g. Werewolf romance, Fantasy romance"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="ts-form-row">
                  <div className="ts-form-group">
                    <label>Rating (e.g. 4.8) *</label>
                    <input
                      type="text"
                      placeholder="4.8"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      required
                    />
                  </div>
                  <div className="ts-form-group">
                    <label>Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="ts-form-row">
                  <div className="ts-form-group">
                    <label>Author Byline</label>
                    <input
                      type="text"
                      placeholder="Ink2Wealth Author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    />
                  </div>
                  <div className="ts-form-group">
                    <label>Total Chapters Planned</label>
                    <input
                      type="number"
                      placeholder="112"
                      value={formData.chaptersTotal}
                      onChange={(e) => setFormData({ ...formData, chaptersTotal: e.target.value })}
                    />
                  </div>
                </div>

                <div className="ts-form-group">
                  <label>Tagline (One-liner hook)</label>
                  <input
                    type="text"
                    placeholder="e.g. Some bonds are written in blood, not just in souls."
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  />
                </div>

                <div className="ts-form-group">
                  <label>Tags (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Werewolf, Fated mates, Slow burn, Alpha"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>

                <div className="ts-form-group">
                  <label>About / Blurb *</label>
                  <textarea
                    placeholder="Enter the full synopsis of this serial..."
                    value={formData.blurb}
                    onChange={(e) => setFormData({ ...formData, blurb: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="ts-form-row">
                  <div className="ts-form-group">
                    <label>Cover Image URL (or upload below)</label>
                    <input
                      type="text"
                      placeholder="https://... or /uploads/..."
                      value={formData.coverUrl}
                      onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                    />
                  </div>
                  <div className="ts-form-group">
                    <label>Upload Cover Image</label>
                    <label className="ts-btn ts-btn-secondary" style={{ cursor: 'pointer', textAlign: 'center' }}>
                      <MdCloudUpload /> {uploadingCover ? 'Uploading...' : 'Choose File'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        style={{ display: 'none' }}
                        disabled={uploadingCover}
                      />
                    </label>
                  </div>
                </div>
                {formData.coverUrl && (
                  <div className="ts-cover-preview-box">
                    <img
                      src={resolveMediaUrl(formData.coverUrl)}
                      alt="Cover Preview"
                      className="ts-cover-preview-img"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="ts-cover-preview-info">
                      <span className="ts-cover-preview-badge">Cover image selected</span>
                      <small>{formData.coverUrl}</small>
                    </div>
                  </div>
                )}
              </div>

              <div className="ts-modal-footer">
                <button
                  type="button"
                  className="ts-btn ts-btn-secondary"
                  onClick={() => setShowSerialModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ts-btn ts-btn-primary">
                  {editingSerial ? 'Save Changes' : 'Create Serial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chapters Management Modal */}
      {showChaptersModal && activeSerialForChapters && (
        <div className="ts-modal-overlay">
          <div className="ts-modal ts-modal-lg">
            <div className="ts-modal-header">
              <h2>Chapters: {activeSerialForChapters.title}</h2>
              <button className="ts-modal-close" onClick={() => setShowChaptersModal(false)}>
                <MdClose />
              </button>
            </div>
            <div className="ts-modal-body">
              {/* Existing chapters list */}
              <label style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>
                Uploaded Chapters ({activeSerialForChapters.chapters?.length || 0})
              </label>
              <div className="ts-chapters-list">
                {!activeSerialForChapters.chapters || activeSerialForChapters.chapters.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: '8px 0' }}>
                    No chapters added yet. Use the form below to add chapter 1.
                  </p>
                ) : (
                  activeSerialForChapters.chapters.map((chap, idx) => (
                    <div className="ts-chapter-item" key={chap.id || idx}>
                      <div className="ts-chapter-meta">
                        <span className="ts-chapter-num">{chap.index || idx + 1}</span>
                        <div>
                          <span className="ts-chapter-title">{chap.title}</span>
                          <span className="ts-chapter-time">{chap.readTime}</span>
                        </div>
                      </div>
                      <button
                        className="ts-btn ts-btn-danger ts-btn-sm"
                        onClick={() => handleDeleteChapter(chap.id)}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Chapter Form */}
              <form onSubmit={handleAddChapter} style={{ borderTop: '1px solid #334155', paddingTop: '18px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 12px 0', color: '#f97316' }}>
                  + Add New Chapter
                </h3>
                <div className="ts-form-row" style={{ marginBottom: '12px' }}>
                  <div className="ts-form-group">
                    <label>Chapter Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. The Scent at the Border"
                      value={newChapter.title}
                      onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="ts-form-group">
                    <label>Reading Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 5 min read"
                      value={newChapter.readTime}
                      onChange={(e) => setNewChapter({ ...newChapter, readTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="ts-form-group" style={{ marginBottom: '14px' }}>
                  <label>Chapter Content / Story Text *</label>
                  <textarea
                    placeholder="Enter the full chapter story content here. Separate paragraphs with blank lines."
                    value={newChapter.content}
                    onChange={(e) => setNewChapter({ ...newChapter, content: e.target.value })}
                    rows={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="ts-btn ts-btn-primary"
                  disabled={submittingChapter}
                >
                  <MdAdd /> {submittingChapter ? 'Adding...' : 'Add Chapter'}
                </button>
              </form>
            </div>
            <div className="ts-modal-footer">
              <button
                type="button"
                className="ts-btn ts-btn-secondary"
                onClick={() => setShowChaptersModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendingSerials;
