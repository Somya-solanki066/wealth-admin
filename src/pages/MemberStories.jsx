import { useState, useEffect } from 'react';
import {
  MdAdd,
  MdRefresh,
  MdEdit,
  MdDelete,
  MdClose,
  MdCloudUpload,
  MdStar,
  MdMovie,
  MdPlayCircle,
  MdVolumeOff,
} from 'react-icons/md';
import { memberStoriesService } from '../services/memberStoriesService';
import resolveMediaUrl from '../utils/resolveMediaUrl';
import './MemberStories.css';

const MemberStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    role: 'Writer and student',
    initials: '',
    time: '0:45',
    quote: '',
    rating: '5',
    youtubeId: '',
    videoUrl: '',
    imageUrl: '',
    world: 'writer',
    order: 0,
    featured: true,
  });

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const res = await memberStoriesService.getStories();
      const list = Array.isArray(res.data) ? res.data : [];
      setStories(list);
    } catch (err) {
      console.error('Failed to load member stories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingStory(null);
    setFormData({
      title: '',
      role: 'Writer and student',
      initials: 'WA',
      time: '0:45',
      quote: '',
      rating: '5',
      youtubeId: '',
      videoUrl: '',
      imageUrl: '',
      world: 'writer',
      order: stories.length,
      featured: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (story) => {
    setEditingStory(story);
    setFormData({
      title: story.title || '',
      role: story.role || story.by || 'Writer and student',
      initials: story.initials || '',
      time: story.time || '0:45',
      quote: story.quote || story.title || '',
      rating: String(story.rating || '5'),
      youtubeId: story.youtubeId || '',
      videoUrl: story.videoUrl || '',
      imageUrl: story.imageUrl || '',
      world: story.world === 'screenwriter' || story.world === 'student' ? story.world : 'writer',
      order: story.order ?? 0,
      featured: story.featured !== false,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStory(null);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const res = await memberStoriesService.uploadImage(file);
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, imageUrl: res.url }));
      }
    } catch (err) {
      alert('Failed to upload image: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Title / Quote is required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        rating: Number(formData.rating) || 5,
        order: Number(formData.order) || 0,
      };

      if (editingStory) {
        await memberStoriesService.updateStory(editingStory.id, payload);
      } else {
        await memberStoriesService.createStory(payload);
      }

      handleCloseModal();
      loadStories();
    } catch (err) {
      alert('Error saving story: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (story) => {
    if (!window.confirm(`Delete story "${story.title}"?`)) return;
    try {
      await memberStoriesService.deleteStory(story.id);
      loadStories();
    } catch (err) {
      alert('Failed to delete story: ' + (err.response?.data?.error || err.message));
    }
  };

  const filteredStories = stories.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.title && s.title.toLowerCase().includes(q)) ||
      (s.role && s.role.toLowerCase().includes(q)) ||
      (s.quote && s.quote.toLowerCase().includes(q))
    );
  });

  return (
    <div className="member-stories-page">
      <div className="page-header">
        <div>
          <h1>Stories from our members</h1>
          <p className="page-subtitle">
            Manage member video testimonials. Choose Writer, Script, or Student so each story shows on that world only.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={loadStories} title="Refresh">
            <MdRefresh /> Refresh
          </button>
          <button className="btn-primary" onClick={handleOpenAdd}>
            <MdAdd /> Add Member Story
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="stories-toolbar">
        <input
          type="text"
          placeholder="Search by quote, role, or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <span className="count-badge">{filteredStories.length} Stories</span>
      </div>

      {/* Stories Grid */}
      {loading ? (
        <div className="loading-state">Loading member stories...</div>
      ) : filteredStories.length === 0 ? (
        <div className="empty-state">
          <MdMovie size={48} />
          <h3>No Member Stories Found</h3>
          <p>Add a video testimonial or story to display on the app's home slider.</p>
          <button className="btn-primary" onClick={handleOpenAdd}>
            <MdAdd /> Add First Story
          </button>
        </div>
      ) : (
        <div className="stories-grid">
          {filteredStories.map((story) => {
            const resolvedImg = resolveMediaUrl(story.imageUrl);
            return (
              <div key={story.id} className="story-card">
                <div className="story-card-media">
                  {resolvedImg ? (
                    <img src={resolvedImg} alt={story.title} className="story-img" />
                  ) : (
                    <div className="story-ph">
                      <MdPlayCircle size={40} />
                    </div>
                  )}
                  <span className="badge-duration">{story.time || '0:45'}</span>
                  <span className="badge-preview">
                    <MdVolumeOff size={13} /> Preview
                  </span>
                  <div className="story-media-overlay">
                    <p className="story-quote">"{story.quote || story.title}"</p>
                    <div className="story-stars">
                      {Array.from({ length: story.rating || 5 }).map((_, i) => (
                        <MdStar key={i} color="#FFB800" size={14} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="story-card-body">
                  <div className="story-meta-row">
                    <div className="story-avatar">{story.initials || 'WA'}</div>
                    <div className="story-meta-text">
                      <h4 title={story.title}>{story.title}</h4>
                      <p>{story.role || story.by || 'Writer and student'}</p>
                      <p className="story-world-tag">
                        {story.world === 'screenwriter'
                          ? 'Shows in Script'
                          : story.world === 'student'
                            ? 'Shows in Student'
                            : 'Shows in Writer'}
                      </p>
                    </div>
                  </div>

                  {story.youtubeId && (
                    <div className="story-yt-tag">
                      <span>YouTube ID: {story.youtubeId}</span>
                    </div>
                  )}

                  <div className="story-actions">
                    <button className="btn-icon edit" onClick={() => handleOpenEdit(story)} title="Edit Story">
                      <MdEdit /> Edit
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(story)} title="Delete Story">
                      <MdDelete /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content story-modal">
            <div className="modal-header">
              <h2>{editingStory ? 'Edit Member Story' : 'Add New Member Story'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <MdClose />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="story-form">
              <div className="form-group">
                <label>Story Title / Main Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. This app changed my life!"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Show this story in *</label>
                <select
                  value={formData.world}
                  onChange={(e) => setFormData({ ...formData, world: e.target.value })}
                >
                  <option value="writer">Writer section</option>
                  <option value="screenwriter">Script section</option>
                  <option value="student">Student section</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Member Role / Subtitle</label>
                  <input
                    type="text"
                    placeholder="e.g. Writer and student"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Avatar Initials</label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="e.g. WA"
                    value={formData.initials}
                    onChange={(e) => setFormData({ ...formData, initials: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration Badge (e.g. 0:45)</label>
                  <input
                    type="text"
                    placeholder="0:45"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Rating (Stars 1-5)</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Overlay Quote Text</label>
                <textarea
                  rows={2}
                  placeholder="Quote shown on the video preview card (defaults to title if empty)"
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>YouTube Video ID (e.g. dQw4w9WgXcQ)</label>
                  <input
                    type="text"
                    placeholder="YouTube ID for in-app autoplay & full screen"
                    value={formData.youtubeId}
                    onChange={(e) => setFormData({ ...formData, youtubeId: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Full Video URL / Link</label>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  />
                </div>
              </div>

              {/* Cover Image Upload / URL */}
              <div className="form-group">
                <label>Cover Thumbnail Image</label>
                <div className="image-input-container">
                  <input
                    type="text"
                    placeholder="/uploads/stories/... or https://..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                  <label className="upload-btn">
                    <MdCloudUpload /> {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      style={{ display: 'none' }}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                {formData.imageUrl && (
                  <div className="image-preview-box">
                    <img src={resolveMediaUrl(formData.imageUrl)} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Display Sort Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    Featured on Home Slider
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingStory ? 'Update Story' : 'Create Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberStories;
