import { useState, useEffect } from 'react';
import { subjectHubService } from '../services/subjectHubService';
import './AiConfig.css';

export default function SubjectHubs() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('info'); // info | modules | notes | questions

  // New module / video / note state for editingItem
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);

  const [newVideo, setNewVideo] = useState({ title: '', videoUrl: '', duration: '', summary: '' });
  const [newNote, setNewNote] = useState({ title: '', content: '', keyPoints: '' });
  const [newQuestion, setNewQuestion] = useState({ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const res = await subjectHubService.getAll();
      const list = res?.data?.data || res?.data || [];
      setSubjects(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load subject hubs:', err);
      setMessage({ type: 'error', text: 'Failed to load subject hubs.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!window.confirm('Seed default student subject hubs (Human Physiology, Anatomy, Nursing Exams, etc.)?')) return;
    try {
      setSaving(true);
      await subjectHubService.seed();
      setMessage({ type: 'success', text: 'Default subject hubs seeded successfully!' });
      await loadSubjects();
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.error || err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingItem.id) {
        await subjectHubService.update(editingItem.id, editingItem);
        setMessage({ type: 'success', text: 'Subject hub updated successfully!' });
      } else {
        await subjectHubService.create(editingItem);
        setMessage({ type: 'success', text: 'Subject hub created successfully!' });
      }
      setEditingItem(null);
      await loadSubjects();
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.error || err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      setSaving(true);
      await subjectHubService.delete(id);
      setMessage({ type: 'success', text: 'Subject hub deleted.' });
      await loadSubjects();
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.error || err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleAddModule = () => {
    if (!newModuleTitle.trim()) return;
    const modules = editingItem.modules || [];
    const newMod = {
      id: `mod-${Date.now()}`,
      title: newModuleTitle.trim(),
      description: '',
      videos: [],
      notes: [],
      questions: [],
    };
    setEditingItem({ ...editingItem, modules: [...modules, newMod] });
    setNewModuleTitle('');
    setSelectedModuleIdx(modules.length);
  };

  const handleAddVideo = () => {
    if (!newVideo.title.trim() || !newVideo.videoUrl.trim()) return;
    const modules = [...(editingItem.modules || [])];
    if (!modules[selectedModuleIdx]) return;
    const currentVideos = modules[selectedModuleIdx].videos || [];
    modules[selectedModuleIdx].videos = [
      ...currentVideos,
      { id: `vid-${Date.now()}`, ...newVideo },
    ];
    setEditingItem({ ...editingItem, modules });
    setNewVideo({ title: '', videoUrl: '', duration: '', summary: '' });
  };

  const handleDeleteVideo = (videoIdx) => {
    const modules = [...(editingItem.modules || [])];
    if (!modules[selectedModuleIdx]) return;
    modules[selectedModuleIdx].videos = modules[selectedModuleIdx].videos.filter((_, i) => i !== videoIdx);
    setEditingItem({ ...editingItem, modules });
  };

  const handleAddNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    const modules = [...(editingItem.modules || [])];
    if (!modules[selectedModuleIdx]) return;
    const currentNotes = modules[selectedModuleIdx].notes || [];
    const keyPointsArr = newNote.keyPoints
      ? newNote.keyPoints.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];

    modules[selectedModuleIdx].notes = [
      ...currentNotes,
      {
        id: `note-${Date.now()}`,
        title: newNote.title.trim(),
        content: newNote.content.trim(),
        keyPoints: keyPointsArr,
      },
    ];
    setEditingItem({ ...editingItem, modules });
    setNewNote({ title: '', content: '', keyPoints: '' });
  };

  const handleDeleteNote = (noteIdx) => {
    const modules = [...(editingItem.modules || [])];
    if (!modules[selectedModuleIdx]) return;
    modules[selectedModuleIdx].notes = modules[selectedModuleIdx].notes.filter((_, i) => i !== noteIdx);
    setEditingItem({ ...editingItem, modules });
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim() || !newQuestion.options[0].trim()) return;
    const modules = [...(editingItem.modules || [])];
    if (!modules[selectedModuleIdx]) return;
    const currentQuestions = modules[selectedModuleIdx].questions || [];
    modules[selectedModuleIdx].questions = [
      ...currentQuestions,
      { id: `q-${Date.now()}`, ...newQuestion },
    ];
    setEditingItem({ ...editingItem, modules });
    setNewQuestion({ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' });
  };

  const handleDeleteQuestion = (qIdx) => {
    const modules = [...(editingItem.modules || [])];
    if (!modules[selectedModuleIdx]) return;
    modules[selectedModuleIdx].questions = modules[selectedModuleIdx].questions.filter((_, i) => i !== qIdx);
    setEditingItem({ ...editingItem, modules });
  };

  return (
    <div className="ai-config-container">
      <div className="ai-config-header">
        <div>
          <h1>Student Subject Hubs</h1>
          <p className="subtitle">
            Manage student course hubs, modules, video lectures, and revision study materials.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleSeed} disabled={saving}>
            Seed Default Subjects
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingItem({
                title: '',
                subtitle: '',
                category: 'MBBS & Nursing',
                imageUrl: '',
                description: '',
                featured: true,
                order: subjects.length + 1,
                status: 'active',
                modules: [],
              });
              setActiveModalTab('info');
              setSelectedModuleIdx(0);
            }}
          >
            + Add Subject Hub
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: '16px' }}>
          {message.text}
          <button
            onClick={() => setMessage(null)}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading subject hubs...</div>
      ) : subjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', border: '1px dashed #444', borderRadius: '12px' }}>
          <h3>No Subject Hubs Found</h3>
          <p style={{ color: '#888' }}>
            Click &quot;Seed Default Subjects&quot; to auto-populate Human Physiology, Anatomy, Nursing Exams, and more.
          </p>
          <button className="btn btn-primary" onClick={handleSeed} disabled={saving} style={{ marginTop: '12px' }}>
            Seed Defaults Now
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {subjects.map((s) => {
            const modules = s.modules || [];
            const totalVideos = modules.reduce((acc, m) => acc + (m.videos?.length || 0), 0);
            const totalNotes = modules.reduce((acc, m) => acc + (m.notes?.length || 0), 0);

            return (
              <div
                key={s.id}
                style={{
                  background: 'var(--card-bg, #1e1e24)',
                  border: '1px solid var(--border-color, #2d2d38)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ height: '140px', background: '#252732', position: 'relative' }}>
                  {s.imageUrl ? (
                    <img
                      src={s.imageUrl}
                      alt={s.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#888' }}>
                      No Image Banner
                    </div>
                  )}
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: s.status === 'active' ? '#2e7d32' : '#757575',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {s.status?.toUpperCase()}
                  </span>
                  {s.featured && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: '#d9a21b',
                        color: '#000',
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      ★ FEATURED
                    </span>
                  )}
                </div>

                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '12px', color: '#d9a21b', fontWeight: '600' }}>{s.category}</div>
                  <h3 style={{ margin: '4px 0 2px', fontSize: '18px' }}>{s.title}</h3>
                  <div style={{ fontSize: '13px', color: '#9e9ea7', marginBottom: '10px' }}>{s.subtitle}</div>
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#bbb',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: '14px',
                    }}
                  >
                    {s.description || 'No description provided.'}
                  </p>

                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-color, #2d2d38)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#888',
                    }}
                  >
                    <span>{modules.length} Modules</span>
                    <span>{totalVideos} Videos</span>
                    <span>{totalNotes} Notes</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '7px' }}
                      onClick={() => {
                        setEditingItem({ ...s });
                        setActiveModalTab('info');
                        setSelectedModuleIdx(0);
                      }}
                    >
                      Edit Content
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '7px 12px' }}
                      onClick={() => handleDeleteItem(s.id, s.title)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT MODAL */}
      {editingItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#1a1b23',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              borderRadius: '16px',
              border: '1px solid #333',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '18px' }}>
                {editingItem.id ? `Edit Subject: ${editingItem.title}` : 'Add New Subject Hub'}
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #333', background: '#14151b' }}>
              {[
                { id: 'info', label: '1. Basic Info' },
                { id: 'modules', label: `2. Modules & Videos (${editingItem.modules?.length || 0})` },
                { id: 'notes', label: '3. Study Notes' },
                { id: 'questions', label: '4. Practice Quizzes' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveModalTab(t.id)}
                  style={{
                    padding: '12px 18px',
                    background: activeModalTab === t.id ? '#1a1b23' : 'transparent',
                    color: activeModalTab === t.id ? '#d9a21b' : '#888',
                    border: 'none',
                    borderBottom: activeModalTab === t.id ? '2px solid #d9a21b' : 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {/* TAB 1: BASIC INFO */}
              {activeModalTab === 'info' && (
                <div style={{ display: 'grid', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
                        Subject Title *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingItem.title}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        placeholder="e.g. Human Physiology"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
                        Subtitle / Tagline *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingItem.subtitle}
                        onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.value })}
                        placeholder="e.g. MBBS and Nursing"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
                        Category
                      </label>
                      <select
                        className="form-control"
                        value={editingItem.category}
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      >
                        <option>MBBS & Nursing</option>
                        <option>Professional Courses</option>
                        <option>JAMB & Sciences</option>
                        <option>Arts & Law</option>
                        <option>General</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
                        Status
                      </label>
                      <select
                        className="form-control"
                        value={editingItem.status}
                        onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                      >
                        <option value="active">Active (Visible)</option>
                        <option value="draft">Draft (Hidden)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
                        Display Order
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={editingItem.order ?? 1}
                        onChange={(e) => setEditingItem({ ...editingItem, order: parseInt(e.target.value, 10) || 1 })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
                      Banner Image URL (16:9 ratio recommended)
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      value={editingItem.imageUrl}
                      onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
                      Subject Description & Objectives
                    </label>
                    <textarea
                      rows={3}
                      className="form-control"
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      placeholder="High-yield lecture summaries and syllabus coverage..."
                    />
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editingItem.featured}
                        onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked })}
                      />
                      <span>Feature this Subject on Student Home Page Slider</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: MODULES & VIDEOS */}
              {activeModalTab === 'modules' && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      marginBottom: '16px',
                      padding: '12px',
                      background: '#14151b',
                      borderRadius: '8px',
                    }}
                  >
                    <input
                      type="text"
                      className="form-control"
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      placeholder="New module title (e.g. Module 1: Cardiovascular Dynamics)"
                      style={{ flex: 1 }}
                    />
                    <button className="btn btn-secondary" onClick={handleAddModule}>
                      + Add Module
                    </button>
                  </div>

                  {(!editingItem.modules || editingItem.modules.length === 0) ? (
                    <p style={{ color: '#888' }}>No modules added yet. Add a module above to attach videos and notes.</p>
                  ) : (
                    <div>
                      {/* Module Selector Chips */}
                      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '14px' }}>
                        {editingItem.modules.map((m, idx) => (
                          <button
                            key={m.id || idx}
                            onClick={() => setSelectedModuleIdx(idx)}
                            style={{
                              padding: '8px 12px',
                              background: selectedModuleIdx === idx ? '#d9a21b' : '#222',
                              color: selectedModuleIdx === idx ? '#000' : '#ccc',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {m.title || `Module ${idx + 1}`}
                          </button>
                        ))}
                      </div>

                      {/* Current Module Videos */}
                      {editingItem.modules[selectedModuleIdx] && (
                        <div style={{ border: '1px solid #333', padding: '14px', borderRadius: '10px' }}>
                          <h4 style={{ margin: '0 0 10px', color: '#d9a21b' }}>
                            {editingItem.modules[selectedModuleIdx].title} — Video Lectures
                          </h4>

                          {/* Existing Videos List */}
                          {(editingItem.modules[selectedModuleIdx].videos || []).map((v, vIdx) => (
                            <div
                              key={v.id || vIdx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 12px',
                                background: '#111',
                                borderRadius: '6px',
                                marginBottom: '6px',
                              }}
                            >
                              <div>
                                <b>{v.title}</b> <small style={{ color: '#888' }}>({v.duration || 'N/A'})</small>
                                <div style={{ fontSize: '11px', color: '#64b5f6' }}>{v.videoUrl}</div>
                              </div>
                              <button
                                className="btn btn-danger"
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                                onClick={() => handleDeleteVideo(vIdx)}
                              >
                                Delete
                              </button>
                            </div>
                          ))}

                          {/* Add New Video Form */}
                          <div style={{ marginTop: '12px', background: '#181920', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>+ Attach Video Lecture</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '6px' }}>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Video title (e.g. Action Potential Breakdown)"
                                value={newVideo.title}
                                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                              />
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Duration (e.g. 15:30)"
                                value={newVideo.duration}
                                onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })}
                              />
                            </div>
                            <input
                              type="url"
                              className="form-control"
                              placeholder="YouTube / Video stream URL (e.g. https://www.youtube.com/watch?v=...)"
                              value={newVideo.videoUrl}
                              onChange={(e) => setNewVideo({ ...newVideo, videoUrl: e.target.value })}
                              style={{ marginBottom: '6px' }}
                            />
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Summary points (optional)"
                              value={newVideo.summary}
                              onChange={(e) => setNewVideo({ ...newVideo, summary: e.target.value })}
                              style={{ marginBottom: '8px' }}
                            />
                            <button className="btn btn-secondary" onClick={handleAddVideo} style={{ width: '100%' }}>
                              Add Video to Module
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: STUDY NOTES */}
              {activeModalTab === 'notes' && (
                <div>
                  {(!editingItem.modules || editingItem.modules.length === 0) ? (
                    <p style={{ color: '#888' }}>Please create a module first in &quot;Modules & Videos&quot; tab.</p>
                  ) : (
                    <div>
                      <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '8px' }}>
                        Adding notes to:{' '}
                        <b style={{ color: '#d9a21b' }}>{editingItem.modules[selectedModuleIdx]?.title}</b>
                      </div>

                      {/* Existing notes */}
                      {(editingItem.modules[selectedModuleIdx]?.notes || []).map((n, nIdx) => (
                        <div
                          key={n.id || nIdx}
                          style={{
                            padding: '10px 14px',
                            background: '#111',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            border: '1px solid #333',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, color: '#fff' }}>{n.title}</h4>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '3px 8px', fontSize: '11px' }}
                              onClick={() => handleDeleteNote(nIdx)}
                            >
                              Delete
                            </button>
                          </div>
                          <p style={{ fontSize: '12px', color: '#bbb', margin: '6px 0', whiteSpace: 'pre-wrap' }}>
                            {n.content}
                          </p>
                          {n.keyPoints && n.keyPoints.length > 0 && (
                            <ul style={{ margin: '4px 0', paddingLeft: '20px', fontSize: '11px', color: '#d9a21b' }}>
                              {n.keyPoints.map((kp, kIdx) => (
                                <li key={kIdx}>{kp}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}

                      {/* Add New Note */}
                      <div style={{ marginTop: '12px', background: '#181920', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>+ Add Study Notes</div>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Note title (e.g. Resting Membrane Potential & Goldman Equation)"
                          value={newNote.title}
                          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                          style={{ marginBottom: '8px' }}
                        />
                        <textarea
                          rows={4}
                          className="form-control"
                          placeholder="Full revision note / textbook summary..."
                          value={newNote.content}
                          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                          style={{ marginBottom: '8px' }}
                        />
                        <textarea
                          rows={2}
                          className="form-control"
                          placeholder="Key takeaways (one per line)..."
                          value={newNote.keyPoints}
                          onChange={(e) => setNewNote({ ...newNote, keyPoints: e.target.value })}
                          style={{ marginBottom: '8px' }}
                        />
                        <button className="btn btn-secondary" onClick={handleAddNote} style={{ width: '100%' }}>
                          Save Study Note to Module
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PRACTICE QUESTIONS */}
              {activeModalTab === 'questions' && (
                <div>
                  {(!editingItem.modules || editingItem.modules.length === 0) ? (
                    <p style={{ color: '#888' }}>Please create a module first.</p>
                  ) : (
                    <div>
                      <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '8px' }}>
                        Questions for:{' '}
                        <b style={{ color: '#d9a21b' }}>{editingItem.modules[selectedModuleIdx]?.title}</b>
                      </div>

                      {/* Existing questions */}
                      {(editingItem.modules[selectedModuleIdx]?.questions || []).map((q, qIdx) => (
                        <div
                          key={q.id || qIdx}
                          style={{
                            padding: '10px 14px',
                            background: '#111',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            border: '1px solid #333',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <b>Q: {q.question}</b>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '3px 8px', fontSize: '11px' }}
                              onClick={() => handleDeleteQuestion(qIdx)}
                            >
                              Delete
                            </button>
                          </div>
                          <div style={{ fontSize: '12px', margin: '6px 0', color: '#ccc' }}>
                            Correct: <span style={{ color: '#4caf50' }}>{q.options[q.correctIndex]}</span>
                          </div>
                        </div>
                      ))}

                      {/* Add Question */}
                      <div style={{ marginTop: '12px', background: '#181920', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>+ Add Multiple Choice Question</div>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Question text..."
                          value={newQuestion.question}
                          onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                          style={{ marginBottom: '8px' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          {newQuestion.options.map((opt, oIdx) => (
                            <input
                              key={oIdx}
                              type="text"
                              className="form-control"
                              placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                              value={opt}
                              onChange={(e) => {
                                const options = [...newQuestion.options];
                                options[oIdx] = e.target.value;
                                setNewQuestion({ ...newQuestion, options });
                              }}
                            />
                          ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px', marginBottom: '8px' }}>
                          <select
                            className="form-control"
                            value={newQuestion.correctIndex}
                            onChange={(e) => setNewQuestion({ ...newQuestion, correctIndex: parseInt(e.target.value, 10) })}
                          >
                            <option value={0}>Correct: Option A</option>
                            <option value={1}>Correct: Option B</option>
                            <option value={2}>Correct: Option C</option>
                            <option value={3}>Correct: Option D</option>
                          </select>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Explanation (why this answer is correct)..."
                            value={newQuestion.explanation}
                            onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                          />
                        </div>
                        <button className="btn btn-secondary" onClick={handleAddQuestion} style={{ width: '100%' }}>
                          Add Practice Question
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid #333',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                background: '#14151b',
              }}
            >
              <button className="btn btn-secondary" onClick={() => setEditingItem(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveItem} disabled={saving}>
                {saving ? 'Saving...' : 'Save Subject Hub'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
