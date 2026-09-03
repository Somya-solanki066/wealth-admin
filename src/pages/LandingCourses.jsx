import { useEffect, useState } from 'react';
import { MdSchool, MdSave, MdAdd, MdDelete, MdCloudUpload } from 'react-icons/md';
import api from '../services/api';
import { getApiOrigin } from '../config/api';
import './LandingCourses.css';

const COURSE_OPTIONS = [
  { id: 'witweb', label: 'WIT-WEB Academy' },
  { id: 'ssg', label: 'SSG Blueprint' },
];

const EMPTY_COURSE = {
  sectionLabel: '',
  title: '',
  bannerEmoji: '',
  bannerGradient: '',
  kicker: '',
  courseName: '',
  description: '',
  tags: [],
  primaryCtaLabel: '',
  primaryCtaHref: '',
  secondaryCtaLabel: '',
  secondaryCtaHref: '',
  miniCreatorLabel: '',
  miniCreatorBio: '',
  learnHeading: '',
  learnPoints: [],
  dividerSubtitle: '',
  coachSectionLabel: '',
  coachHeading: '',
  coachName: '',
  coachRole: '',
  coachBio: '',
  coachPhotoUrl: '',
  coachPhotoEmoji: '👨‍🏫',
  coachAvatarGradient: '',
  stats: [],
  youtubeHandle: '',
  youtubeUrl: '',
  coachEnrollLabel: '',
  coachEnrollHref: '',
  coachYoutubeButtonLabel: '',
};

function resolvePhotoUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const origin = getApiOrigin();
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function LandingCourses() {
  const [selectedId, setSelectedId] = useState('witweb');
  const [course, setCourse] = useState(EMPTY_COURSE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [tagsText, setTagsText] = useState('');

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3500);
  };

  const loadCourse = async (courseId) => {
    setLoading(true);
    try {
      const res = await api.get(`/landing-courses/${courseId}`);
      const data = res.data?.data || { ...EMPTY_COURSE, id: courseId };
      setCourse(data);
      setTagsText(Array.isArray(data.tags) ? data.tags.join(', ') : '');
    } catch (err) {
      console.error(err);
      showMessage('Failed to load course data.', 'error');
      setCourse({ ...EMPTY_COURSE, id: courseId });
      setTagsText('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse(selectedId);
  }, [selectedId]);

  const updateField = (key, value) => {
    setCourse((prev) => ({ ...prev, [key]: value }));
  };

  const updateLearnPoint = (index, patch) => {
    setCourse((prev) => ({
      ...prev,
      learnPoints: (prev.learnPoints || []).map((item, i) =>
        i === index ? { ...item, ...patch } : item
      ),
    }));
  };

  const addLearnPoint = () => {
    setCourse((prev) => ({
      ...prev,
      learnPoints: [...(prev.learnPoints || []), { icon: '✨', title: '', desc: '' }],
    }));
  };

  const removeLearnPoint = (index) => {
    setCourse((prev) => ({
      ...prev,
      learnPoints: (prev.learnPoints || []).filter((_, i) => i !== index),
    }));
  };

  const updateStat = (index, patch) => {
    setCourse((prev) => ({
      ...prev,
      stats: (prev.stats || []).map((item, i) =>
        i === index ? { ...item, ...patch } : item
      ),
    }));
  };

  const addStat = () => {
    setCourse((prev) => ({
      ...prev,
      stats: [...(prev.stats || []), { value: '', label: '' }],
    }));
  };

  const removeStat = (index) => {
    setCourse((prev) => ({
      ...prev,
      stats: (prev.stats || []).filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const tags = tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const payload = { ...course, tags, id: selectedId };
      const res = await api.put(`/landing-courses/${selectedId}`, { course: payload });
      const saved = res.data?.data;
      if (saved) {
        setCourse(saved);
        setTagsText(Array.isArray(saved.tags) ? saved.tags.join(', ') : tagsText);
      }
      showMessage('Course saved successfully.');
    } catch (err) {
      console.error(err);
      showMessage(err.response?.data?.error || 'Failed to save course.', 'error');
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
      const res = await api.post(`/landing-courses/${selectedId}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.coachPhotoUrl || res.data?.photoURL || '';
      if (url) updateField('coachPhotoUrl', url);
      showMessage('Coach photo uploaded. Remember to Save if you change other fields.');
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
            <MdSchool className="lc-header-icon" /> Landing Page Courses
          </h2>
          <p>
            Edit flagship course cards and coach sections for the main landing pages. Choose a
            course, update fields, then save.
          </p>
        </div>
        <button type="button" className="lc-save-btn" onClick={handleSave} disabled={saving || loading}>
          <MdSave size={18} />
          {saving ? 'Saving...' : 'Save Course'}
        </button>
      </div>

      {message.text && (
        <div className={`lc-message ${message.type}`}>{message.text}</div>
      )}

      <div className="lc-course-tabs">
        {COURSE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`lc-course-tab ${selectedId === opt.id ? 'active' : ''}`}
            onClick={() => setSelectedId(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="lc-loading">Loading course data...</div>
      ) : (
        <div className="lc-panels">
          <section className="lc-panel">
            <h3>Course Card</h3>
            <div className="lc-grid">
              <label>
                Section label
                <input value={course.sectionLabel || ''} onChange={(e) => updateField('sectionLabel', e.target.value)} />
              </label>
              <label>
                Title (H2)
                <input value={course.title || ''} onChange={(e) => updateField('title', e.target.value)} />
              </label>
              <label>
                Banner emoji
                <input value={course.bannerEmoji || ''} onChange={(e) => updateField('bannerEmoji', e.target.value)} />
              </label>
              <label>
                Banner gradient (CSS)
                <input value={course.bannerGradient || ''} onChange={(e) => updateField('bannerGradient', e.target.value)} />
              </label>
              <label>
                Kicker
                <input value={course.kicker || ''} onChange={(e) => updateField('kicker', e.target.value)} />
              </label>
              <label>
                Course name
                <input value={course.courseName || ''} onChange={(e) => updateField('courseName', e.target.value)} />
              </label>
              <label className="lc-full">
                Description
                <textarea
                  rows={3}
                  value={course.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                />
              </label>
              <label className="lc-full">
                Tags (comma-separated)
                <input
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="12 Modules, 48 Lessons, Lifetime Access"
                />
              </label>
              <label>
                Primary CTA label
                <input value={course.primaryCtaLabel || ''} onChange={(e) => updateField('primaryCtaLabel', e.target.value)} />
              </label>
              <label>
                Primary CTA link
                <input value={course.primaryCtaHref || ''} onChange={(e) => updateField('primaryCtaHref', e.target.value)} />
              </label>
              <label>
                Secondary CTA label
                <input value={course.secondaryCtaLabel || ''} onChange={(e) => updateField('secondaryCtaLabel', e.target.value)} />
              </label>
              <label>
                Secondary CTA link
                <input value={course.secondaryCtaHref || ''} onChange={(e) => updateField('secondaryCtaHref', e.target.value)} />
              </label>
              <label>
                Mini creator label
                <input value={course.miniCreatorLabel || ''} onChange={(e) => updateField('miniCreatorLabel', e.target.value)} />
              </label>
              <label className="lc-full">
                Mini creator bio
                <textarea
                  rows={2}
                  value={course.miniCreatorBio || ''}
                  onChange={(e) => updateField('miniCreatorBio', e.target.value)}
                />
              </label>
              <label>
                Learn heading
                <input value={course.learnHeading || ''} onChange={(e) => updateField('learnHeading', e.target.value)} />
              </label>
              <label className="lc-full">
                Divider subtitle
                <textarea
                  rows={2}
                  value={course.dividerSubtitle || ''}
                  onChange={(e) => updateField('dividerSubtitle', e.target.value)}
                />
              </label>
            </div>

            <div className="lc-subhead">
              <h4>What You Will Learn</h4>
              <button type="button" className="lc-add-btn" onClick={addLearnPoint}>
                <MdAdd size={16} /> Add point
              </button>
            </div>
            <div className="lc-list">
              {(course.learnPoints || []).map((point, index) => (
                <div key={index} className="lc-list-row lc-learn-row">
                  <input
                    className="lc-icon-input"
                    value={point.icon || ''}
                    onChange={(e) => updateLearnPoint(index, { icon: e.target.value })}
                    placeholder="Icon"
                  />
                  <input
                    value={point.title || ''}
                    onChange={(e) => updateLearnPoint(index, { title: e.target.value })}
                    placeholder="Title"
                  />
                  <input
                    value={point.desc || ''}
                    onChange={(e) => updateLearnPoint(index, { desc: e.target.value })}
                    placeholder="Description"
                  />
                  <button type="button" className="lc-icon-btn danger" onClick={() => removeLearnPoint(index)}>
                    <MdDelete size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="lc-panel">
            <h3>Coach Card</h3>
            <div className="lc-coach-photo">
              <div className="lc-photo-preview">
                {course.coachPhotoUrl ? (
                  <img src={resolvePhotoUrl(course.coachPhotoUrl)} alt="Coach" />
                ) : (
                  <span>{course.coachPhotoEmoji || '👨‍🏫'}</span>
                )}
              </div>
              <div className="lc-photo-actions">
                <label className="lc-upload-btn">
                  <MdCloudUpload size={16} />
                  {uploading ? 'Uploading...' : 'Upload profile picture'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handlePhotoUpload} disabled={uploading} />
                </label>
                <label>
                  Photo URL (optional)
                  <input
                    value={course.coachPhotoUrl || ''}
                    onChange={(e) => updateField('coachPhotoUrl', e.target.value)}
                    placeholder="https://... or /uploads/..."
                  />
                </label>
                <label>
                  Emoji fallback
                  <input
                    value={course.coachPhotoEmoji || ''}
                    onChange={(e) => updateField('coachPhotoEmoji', e.target.value)}
                  />
                </label>
                <label>
                  Avatar gradient
                  <input
                    value={course.coachAvatarGradient || ''}
                    onChange={(e) => updateField('coachAvatarGradient', e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="lc-grid">
              <label>
                Coach section label
                <input value={course.coachSectionLabel || ''} onChange={(e) => updateField('coachSectionLabel', e.target.value)} />
              </label>
              <label>
                Coach heading
                <input value={course.coachHeading || ''} onChange={(e) => updateField('coachHeading', e.target.value)} />
              </label>
              <label>
                Coach name
                <input value={course.coachName || ''} onChange={(e) => updateField('coachName', e.target.value)} />
              </label>
              <label>
                Coach role / titles
                <input value={course.coachRole || ''} onChange={(e) => updateField('coachRole', e.target.value)} />
              </label>
              <label className="lc-full">
                Coach bio
                <textarea
                  rows={4}
                  value={course.coachBio || ''}
                  onChange={(e) => updateField('coachBio', e.target.value)}
                />
              </label>
              <label>
                YouTube handle
                <input value={course.youtubeHandle || ''} onChange={(e) => updateField('youtubeHandle', e.target.value)} />
              </label>
              <label>
                YouTube URL
                <input value={course.youtubeUrl || ''} onChange={(e) => updateField('youtubeUrl', e.target.value)} />
              </label>
              <label>
                Enroll button label
                <input value={course.coachEnrollLabel || ''} onChange={(e) => updateField('coachEnrollLabel', e.target.value)} />
              </label>
              <label>
                Enroll button link
                <input value={course.coachEnrollHref || ''} onChange={(e) => updateField('coachEnrollHref', e.target.value)} />
              </label>
              <label className="lc-full">
                YouTube button label
                <input
                  value={course.coachYoutubeButtonLabel || ''}
                  onChange={(e) => updateField('coachYoutubeButtonLabel', e.target.value)}
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
              {(course.stats || []).map((stat, index) => (
                <div key={index} className="lc-list-row lc-stat-row">
                  <input
                    value={stat.value || ''}
                    onChange={(e) => updateStat(index, { value: e.target.value })}
                    placeholder="Value e.g. 2,400+"
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
        </div>
      )}
    </div>
  );
}
