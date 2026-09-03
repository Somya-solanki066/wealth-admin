import { useEffect, useState } from 'react';
import { MdMenuBook, MdSave, MdAdd, MdDelete, MdCloudUpload } from 'react-icons/md';
import api from '../services/api';
import { getApiOrigin } from '../config/api';
import './LandingCourses.css';
import './WorldCourses.css';

const WORLD_OPTIONS = [
  { id: 'writer', label: 'Writer' },
  { id: 'screenwriter', label: 'Script' },
  { id: 'student', label: 'Student' },
];

const EMPTY_COURSE = {
  id: '',
  sectionLabel: 'Flagship Course',
  title: 'New Course',
  bannerEmoji: '📖',
  bannerGradient: 'linear-gradient(135deg,#1a1200,#2e2000)',
  kicker: 'New Course',
  courseName: 'Course Name',
  description: '',
  tags: [],
  primaryCtaLabel: 'Enroll Now',
  primaryCtaHref: '/register',
  secondaryCtaLabel: 'Learn More',
  secondaryCtaHref: '/register',
  miniCreatorLabel: 'Coach — Course Creator',
  miniCreatorBio: '',
  learnHeading: 'What You Will Learn',
  learnPoints: [],
  dividerSubtitle: '',
  coachSectionLabel: 'Your Coach',
  coachHeading: 'Meet Your Coach',
  coachName: 'Coach Name',
  coachRole: '',
  coachBio: '',
  coachPhotoUrl: '',
  coachPhotoEmoji: '👨‍🏫',
  coachAvatarGradient: 'linear-gradient(135deg,#1e1500,#2a1e00)',
  stats: [],
  youtubeHandle: '',
  youtubeUrl: '',
  coachEnrollLabel: 'Enroll →',
  coachEnrollHref: '/register',
  coachYoutubeButtonLabel: '▶️ YouTube Channel',
};

function resolvePhotoUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const origin = getApiOrigin();
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

function makeNewCourse() {
  return {
    ...EMPTY_COURSE,
    id: `course-${Date.now()}`,
    learnPoints: [
      { icon: '✨', title: 'Point one', desc: 'Describe this learning outcome.' },
      { icon: '🎯', title: 'Point two', desc: 'Describe this learning outcome.' },
    ],
    stats: [
      { value: '0', label: 'Students' },
      { value: '0', label: 'Modules' },
      { value: 'YouTube', label: '@handle' },
    ],
  };
}

export default function WorldCourses() {
  const [worldId, setWorldId] = useState('writer');
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [tagsText, setTagsText] = useState('');

  const course =
    courses.find((c) => c.id === selectedCourseId) || courses[0] || null;

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3500);
  };

  const syncTagsFromCourse = (c) => {
    setTagsText(Array.isArray(c?.tags) ? c.tags.join(', ') : '');
  };

  const loadWorld = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/world-courses/${id}`);
      const list = Array.isArray(res.data?.data?.courses) ? res.data.data.courses : [];
      setCourses(list);
      const firstId = list[0]?.id || '';
      setSelectedCourseId(firstId);
      syncTagsFromCourse(list[0]);
    } catch (err) {
      console.error(err);
      showMessage('Failed to load courses.', 'error');
      setCourses([]);
      setSelectedCourseId('');
      setTagsText('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorld(worldId);
  }, [worldId]);

  const updateCourseField = (key, value) => {
    if (!course) return;
    setCourses((prev) =>
      prev.map((c) => (c.id === course.id ? { ...c, [key]: value } : c))
    );
  };

  const updateLearnPoint = (index, patch) => {
    if (!course) return;
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== course.id) return c;
        return {
          ...c,
          learnPoints: (c.learnPoints || []).map((item, i) =>
            i === index ? { ...item, ...patch } : item
          ),
        };
      })
    );
  };

  const addLearnPoint = () => {
    if (!course) return;
    setCourses((prev) =>
      prev.map((c) =>
        c.id === course.id
          ? {
              ...c,
              learnPoints: [...(c.learnPoints || []), { icon: '✨', title: '', desc: '' }],
            }
          : c
      )
    );
  };

  const removeLearnPoint = (index) => {
    if (!course) return;
    setCourses((prev) =>
      prev.map((c) =>
        c.id === course.id
          ? { ...c, learnPoints: (c.learnPoints || []).filter((_, i) => i !== index) }
          : c
      )
    );
  };

  const updateStat = (index, patch) => {
    if (!course) return;
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== course.id) return c;
        return {
          ...c,
          stats: (c.stats || []).map((item, i) =>
            i === index ? { ...item, ...patch } : item
          ),
        };
      })
    );
  };

  const addStat = () => {
    if (!course) return;
    setCourses((prev) =>
      prev.map((c) =>
        c.id === course.id
          ? { ...c, stats: [...(c.stats || []), { value: '', label: '' }] }
          : c
      )
    );
  };

  const removeStat = (index) => {
    if (!course) return;
    setCourses((prev) =>
      prev.map((c) =>
        c.id === course.id
          ? { ...c, stats: (c.stats || []).filter((_, i) => i !== index) }
          : c
      )
    );
  };

  const handleAddCourse = () => {
    const next = makeNewCourse();
    setCourses((prev) => [...prev, next]);
    setSelectedCourseId(next.id);
    syncTagsFromCourse(next);
    showMessage('New course + coach card added. Fill details and Save.');
  };

  const handleDeleteCourse = () => {
    if (!course) return;
    if (!window.confirm(`Delete course "${course.title || course.courseName}" and its coach card?`)) {
      return;
    }
    const remaining = courses.filter((c) => c.id !== course.id);
    setCourses(remaining);
    const next = remaining[0] || null;
    setSelectedCourseId(next?.id || '');
    syncTagsFromCourse(next);
  };

  const handleSelectCourse = (id) => {
    setSelectedCourseId(id);
    syncTagsFromCourse(courses.find((c) => c.id === id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const tags = tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payloadCourses = courses.map((c) =>
        c.id === course?.id ? { ...c, tags } : c
      );

      const res = await api.put(`/world-courses/${worldId}`, {
        page: { id: worldId, courses: payloadCourses },
      });
      const savedList = res.data?.data?.courses || payloadCourses;
      setCourses(savedList);
      const keepId = course?.id && savedList.some((c) => c.id === course.id)
        ? course.id
        : savedList[0]?.id || '';
      setSelectedCourseId(keepId);
      syncTagsFromCourse(savedList.find((c) => c.id === keepId));
      showMessage('Courses saved successfully.');
    } catch (err) {
      console.error(err);
      showMessage(err.response?.data?.error || 'Failed to save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !course) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await api.post(
        `/world-courses/${worldId}/courses/${course.id}/photo`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const url = res.data?.coachPhotoUrl || res.data?.photoURL || '';
      if (url) updateCourseField('coachPhotoUrl', url);
      showMessage('Coach photo uploaded. Click Save to keep other edits.');
    } catch (err) {
      console.error(err);
      showMessage(err.response?.data?.error || 'Photo upload failed.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="landing-courses-page world-courses-page">
      <div className="lc-header">
        <div>
          <h2>
            <MdMenuBook className="lc-header-icon" /> Courses
          </h2>
          <p>
            Writer / Script / Student courses pages. Har course ke saath Course Card + Coach Card —
            Landing Page Courses jaisa. Naya course add karoge to uska coach card bhi banega.
          </p>
        </div>
        <div className="wc-header-actions">
          <button type="button" className="lc-add-btn" onClick={handleAddCourse} disabled={loading}>
            <MdAdd size={16} /> Add Course
          </button>
          <button type="button" className="lc-save-btn" onClick={handleSave} disabled={saving || loading || !course}>
            <MdSave size={18} />
            {saving ? 'Saving...' : 'Save Courses'}
          </button>
        </div>
      </div>

      {message.text && <div className={`lc-message ${message.type}`}>{message.text}</div>}

      <div className="lc-course-tabs">
        {WORLD_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`lc-course-tab ${worldId === opt.id ? 'active' : ''}`}
            onClick={() => setWorldId(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {!loading && courses.length > 0 && (
        <div className="lc-course-tabs wc-inner-tabs">
          {courses.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`lc-course-tab ${selectedCourseId === c.id ? 'active' : ''}`}
              onClick={() => handleSelectCourse(c.id)}
            >
              {c.title || c.courseName || c.id}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="lc-loading">Loading courses...</div>
      ) : !course ? (
        <div className="lc-loading">
          No courses yet. Click <strong>Add Course</strong> to create a course with its coach card.
        </div>
      ) : (
        <>
          <div className="wc-course-toolbar">
            <span>
              Editing: <strong>{course.title || course.courseName}</strong>
            </span>
            <button type="button" className="lc-icon-btn danger" onClick={handleDeleteCourse} title="Delete course">
              <MdDelete size={16} /> Delete course
            </button>
          </div>

          <div className="lc-panels">
            <section className="lc-panel">
              <h3>Course Card</h3>
              <div className="lc-grid">
                <label>
                  Section label
                  <input value={course.sectionLabel || ''} onChange={(e) => updateCourseField('sectionLabel', e.target.value)} />
                </label>
                <label>
                  Title (H2)
                  <input value={course.title || ''} onChange={(e) => updateCourseField('title', e.target.value)} />
                </label>
                <label>
                  Banner emoji
                  <input value={course.bannerEmoji || ''} onChange={(e) => updateCourseField('bannerEmoji', e.target.value)} />
                </label>
                <label>
                  Banner gradient (CSS)
                  <input value={course.bannerGradient || ''} onChange={(e) => updateCourseField('bannerGradient', e.target.value)} />
                </label>
                <label>
                  Kicker
                  <input value={course.kicker || ''} onChange={(e) => updateCourseField('kicker', e.target.value)} />
                </label>
                <label>
                  Course name
                  <input value={course.courseName || ''} onChange={(e) => updateCourseField('courseName', e.target.value)} />
                </label>
                <label className="lc-full">
                  Description
                  <textarea
                    rows={3}
                    value={course.description || ''}
                    onChange={(e) => updateCourseField('description', e.target.value)}
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
                  <input value={course.primaryCtaLabel || ''} onChange={(e) => updateCourseField('primaryCtaLabel', e.target.value)} />
                </label>
                <label>
                  Primary CTA link
                  <input value={course.primaryCtaHref || ''} onChange={(e) => updateCourseField('primaryCtaHref', e.target.value)} />
                </label>
                <label>
                  Secondary CTA label
                  <input value={course.secondaryCtaLabel || ''} onChange={(e) => updateCourseField('secondaryCtaLabel', e.target.value)} />
                </label>
                <label>
                  Secondary CTA link
                  <input value={course.secondaryCtaHref || ''} onChange={(e) => updateCourseField('secondaryCtaHref', e.target.value)} />
                </label>
                <label>
                  Mini creator label
                  <input value={course.miniCreatorLabel || ''} onChange={(e) => updateCourseField('miniCreatorLabel', e.target.value)} />
                </label>
                <label className="lc-full">
                  Mini creator bio
                  <textarea
                    rows={2}
                    value={course.miniCreatorBio || ''}
                    onChange={(e) => updateCourseField('miniCreatorBio', e.target.value)}
                  />
                </label>
                <label>
                  Learn heading
                  <input value={course.learnHeading || ''} onChange={(e) => updateCourseField('learnHeading', e.target.value)} />
                </label>
                <label className="lc-full">
                  Divider subtitle
                  <textarea
                    rows={2}
                    value={course.dividerSubtitle || ''}
                    onChange={(e) => updateCourseField('dividerSubtitle', e.target.value)}
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
                      value={course.coachPhotoUrl || ''}
                      onChange={(e) => updateCourseField('coachPhotoUrl', e.target.value)}
                      placeholder="https://... or /uploads/..."
                    />
                  </label>
                  <label>
                    Emoji fallback
                    <input
                      value={course.coachPhotoEmoji || ''}
                      onChange={(e) => updateCourseField('coachPhotoEmoji', e.target.value)}
                    />
                  </label>
                  <label>
                    Avatar gradient
                    <input
                      value={course.coachAvatarGradient || ''}
                      onChange={(e) => updateCourseField('coachAvatarGradient', e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="lc-grid">
                <label>
                  Coach section label
                  <input value={course.coachSectionLabel || ''} onChange={(e) => updateCourseField('coachSectionLabel', e.target.value)} />
                </label>
                <label>
                  Coach heading
                  <input value={course.coachHeading || ''} onChange={(e) => updateCourseField('coachHeading', e.target.value)} />
                </label>
                <label>
                  Coach name
                  <input value={course.coachName || ''} onChange={(e) => updateCourseField('coachName', e.target.value)} />
                </label>
                <label>
                  Coach role / titles
                  <input value={course.coachRole || ''} onChange={(e) => updateCourseField('coachRole', e.target.value)} />
                </label>
                <label className="lc-full">
                  Coach bio
                  <textarea
                    rows={4}
                    value={course.coachBio || ''}
                    onChange={(e) => updateCourseField('coachBio', e.target.value)}
                  />
                </label>
                <label>
                  YouTube handle
                  <input value={course.youtubeHandle || ''} onChange={(e) => updateCourseField('youtubeHandle', e.target.value)} />
                </label>
                <label>
                  YouTube URL
                  <input value={course.youtubeUrl || ''} onChange={(e) => updateCourseField('youtubeUrl', e.target.value)} />
                </label>
                <label>
                  Enroll button label
                  <input value={course.coachEnrollLabel || ''} onChange={(e) => updateCourseField('coachEnrollLabel', e.target.value)} />
                </label>
                <label>
                  Enroll button link
                  <input value={course.coachEnrollHref || ''} onChange={(e) => updateCourseField('coachEnrollHref', e.target.value)} />
                </label>
                <label className="lc-full">
                  YouTube button label
                  <input
                    value={course.coachYoutubeButtonLabel || ''}
                    onChange={(e) => updateCourseField('coachYoutubeButtonLabel', e.target.value)}
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
        </>
      )}
    </div>
  );
}
