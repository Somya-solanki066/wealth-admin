import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MdMovieCreation,
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
  MdCheckCircle,
  MdCancel,
  MdOpenInNew,
  MdDescription,
  MdPendingActions,
  MdAutoAwesome,
  MdMovieFilter,
} from 'react-icons/md';
import { trendingScriptsService } from '../services/trendingScriptsService';
import resolveMediaUrl from '../utils/resolveMediaUrl';
import './TrendingScripts.css';

// Fallback prototype cover labels
const SCRIPT_COVER_MAP = {
  script0: 'Action Heist Cover',
  script1: 'Nollywood Satire Cover',
  script2: 'Delta Mystery Cover',
  script3: 'Aviation Romance Cover',
  script4: 'Benin Royal Epic Cover',
  script5: 'Cyberpunk Lagos Cover',
};

// Standard Screenplay Rejection Reasons
const STANDARD_SCRIPT_REASONS = [
  'Weak opening hook / slow start',
  'Scene pacing and act breaks',
  'Dialogue lacks subtext / too on-the-nose',
  'Unclear character motivations',
  'Format / Screenplay industry standard errors',
  'Budget / Production feasibility',
];

const TrendingScripts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'submissions';

  const [activeTab, setActiveTab] = useState(initialTab); // 'submissions' | 'scripts'
  const [scripts, setScripts] = useState([]);
  const [loadingScripts, setLoadingScripts] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [scriptSearch, setScriptSearch] = useState('');

  // Submissions Queue state
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState('all');
  const [viewingSubmission, setViewingSubmission] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Reject Modal for Submissions
  const [rejectingSub, setRejectingSub] = useState(null);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [editorNote, setEditorNote] = useState('');

  // Modals for Scripts & Scenes
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [editingScript, setEditingScript] = useState(null);
  const [showScenesModal, setShowScenesModal] = useState(false);
  const [activeScriptForScenes, setActiveScriptForScenes] = useState(null);

  // Script form state
  const [formData, setFormData] = useState({
    title: '',
    genre: 'Action Thriller',
    rating: '4.9',
    writer: 'Screenwriter',
    tagline: '',
    tags: '',
    format: 'Feature Film',
    pageCount: '110',
    status: 'Production Ready',
    synopsis: '',
    coverUrl: '',
    pdfUrl: '',
    img: 'script0',
  });
  const [uploadingCover, setUploadingCover] = useState(false);

  // Scene form state
  const [newScene, setNewScene] = useState({
    heading: 'SCENE 1 - EXT. LOCATION - NIGHT',
    title: 'Opening Scene',
    readTime: '4 min read',
    content: '',
  });
  const [submittingScene, setSubmittingScene] = useState(false);

  useEffect(() => {
    loadScripts();
    loadSubmissions();
  }, []);

  const switchTab = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  const loadScripts = async () => {
    try {
      setLoadingScripts(true);
      const res = await trendingScriptsService.getScripts();
      setScripts(res.data || []);
    } catch (err) {
      console.error('Failed to load trending scripts:', err);
    } finally {
      setLoadingScripts(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      const res = await trendingScriptsService.getSubmissions();
      setSubmissions(res.data || []);
    } catch (err) {
      console.error('Failed to load script submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleSeed = async () => {
    if (!window.confirm('Reset/seed default 6 trending screenplays in database?')) return;
    try {
      setSeeding(true);
      await trendingScriptsService.seedScripts(true);
      await loadScripts();
      alert('Trending scripts seeded successfully!');
    } catch (err) {
      alert('Failed to seed scripts: ' + (err.response?.data?.error || err.message));
    } finally {
      setSeeding(false);
    }
  };

  const handleSubmissionAction = async (id, action, notes = '') => {
    try {
      setActionLoadingId(id);
      await trendingScriptsService.actionSubmission(
        id,
        action,
        notes,
        selectedReasons,
        editorNote
      );
      await loadSubmissions();
      if (action === 'feature') {
        await loadScripts();
      }
      setRejectingSub(null);
      setSelectedReasons([]);
      setEditorNote('');
      if (viewingSubmission && viewingSubmission.id === id) {
        setViewingSubmission(null);
      }
      alert(`Submission marked as "${action.toUpperCase()}"!`);
    } catch (err) {
      console.error('Action failed:', err);
      alert('Action failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (sub) => {
    setRejectingSub(sub);
    setSelectedReasons([]);
    setEditorNote('');
  };

  const toggleReason = (reason) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  // Cover image upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      const res = await trendingScriptsService.uploadCover(file);
      if (res.url) {
        setFormData((prev) => ({ ...prev, coverUrl: res.url }));
      }
    } catch (err) {
      alert('Failed to upload cover: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploadingCover(false);
    }
  };

  // Open Create/Edit script modal
  const openScriptModal = (script = null) => {
    if (script) {
      setEditingScript(script);
      setFormData({
        title: script.title || '',
        genre: script.genre || 'Action Thriller',
        rating: script.rating || '4.9',
        writer: script.writer || 'Screenwriter',
        tagline: script.tagline || '',
        tags: Array.isArray(script.tags) ? script.tags.join(', ') : '',
        format: script.format || 'Feature Film',
        pageCount: String(script.pageCount || '110'),
        status: script.status || 'Production Ready',
        synopsis: script.synopsis || '',
        coverUrl: script.coverUrl || '',
        pdfUrl: script.pdfUrl || '',
        img: script.img || 'script0',
      });
    } else {
      setEditingScript(null);
      setFormData({
        title: '',
        genre: 'Action Thriller',
        rating: '4.9',
        writer: 'Screenwriter',
        tagline: '',
        tags: '',
        format: 'Feature Film',
        pageCount: '110',
        status: 'Production Ready',
        synopsis: '',
        coverUrl: '',
        pdfUrl: '',
        img: 'script0',
      });
    }
    setShowScriptModal(true);
  };

  const handleSaveScript = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        pageCount: parseInt(formData.pageCount || '100', 10) || 100,
      };

      if (editingScript) {
        await trendingScriptsService.updateScript(editingScript.id, payload);
      } else {
        await trendingScriptsService.createScript(payload);
      }
      setShowScriptModal(false);
      await loadScripts();
    } catch (err) {
      alert('Failed to save script: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteScript = async (id) => {
    if (!window.confirm('Are you sure you want to delete this screenplay?')) return;
    try {
      await trendingScriptsService.deleteScript(id);
      await loadScripts();
    } catch (err) {
      alert('Failed to delete script: ' + (err.response?.data?.error || err.message));
    }
  };

  // Scenes modal
  const openScenesModal = async (script) => {
    try {
      const res = await trendingScriptsService.getScript(script.id);
      setActiveScriptForScenes(res.data);
      setShowScenesModal(true);
      setNewScene({
        heading: `SCENE ${(res.data.scenes?.length || 0) + 1} - INT. LOCATION - DAY`,
        title: `Scene ${(res.data.scenes?.length || 0) + 1}`,
        readTime: '4 min read',
        content: '',
      });
    } catch (err) {
      alert('Failed to fetch scenes: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddScene = async (e) => {
    e.preventDefault();
    if (!newScene.heading || !newScene.content) {
      alert('Scene heading and content are required.');
      return;
    }
    try {
      setSubmittingScene(true);
      await trendingScriptsService.addScene(activeScriptForScenes.id, newScene);
      const res = await trendingScriptsService.getScript(activeScriptForScenes.id);
      setActiveScriptForScenes(res.data);
      setNewScene({
        heading: `SCENE ${(res.data.scenes?.length || 0) + 1} - INT. LOCATION - DAY`,
        title: `Scene ${(res.data.scenes?.length || 0) + 1}`,
        readTime: '4 min read',
        content: '',
      });
      await loadScripts();
    } catch (err) {
      alert('Failed to add scene: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmittingScene(false);
    }
  };

  const handleDeleteScene = async (sceneId) => {
    if (!window.confirm('Delete this scene?')) return;
    try {
      await trendingScriptsService.deleteScene(activeScriptForScenes.id, sceneId);
      const res = await trendingScriptsService.getScript(activeScriptForScenes.id);
      setActiveScriptForScenes(res.data);
      await loadScripts();
    } catch (err) {
      alert('Failed to delete scene: ' + (err.response?.data?.error || err.message));
    }
  };

  // Filtered lists
  const filteredSubmissions = submissions.filter((s) => {
    if (submissionFilter !== 'all' && s.status !== submissionFilter) return false;
    if (!submissionSearch) return true;
    const term = submissionSearch.toLowerCase();
    return (
      (s.title && s.title.toLowerCase().includes(term)) ||
      (s.penName && s.penName.toLowerCase().includes(term)) ||
      (s.genre && s.genre.toLowerCase().includes(term)) ||
      (s.userEmail && s.userEmail.toLowerCase().includes(term))
    );
  });

  const filteredScripts = scripts.filter((s) => {
    if (!scriptSearch) return true;
    const term = scriptSearch.toLowerCase();
    return (
      (s.title && s.title.toLowerCase().includes(term)) ||
      (s.writer && s.writer.toLowerCase().includes(term)) ||
      (s.genre && s.genre.toLowerCase().includes(term)) ||
      (s.format && s.format.toLowerCase().includes(term))
    );
  });

  return (
    <div className="trending-scripts-page">
      {/* Top Header */}
      <div className="ts-header">
        <div className="ts-header-left">
          <div className="ts-header-badge">
            <MdMovieCreation />
            <span>SCREENWRITER WORLD</span>
          </div>
          <h1>Trending Scripts Management</h1>
          <p>
            Review submitted screenplays, approve submissions, and curate the Trending Scripts row in Screenwriter World.
          </p>
        </div>
        <div className="ts-header-actions">
          <button className="ts-btn ts-btn-secondary" onClick={handleSeed} disabled={seeding}>
            <MdRefresh className={seeding ? 'ts-spin' : ''} />
            <span>{seeding ? 'Seeding...' : 'Seed Default Scripts'}</span>
          </button>
          <button className="ts-btn ts-btn-primary" onClick={() => openScriptModal()}>
            <MdAdd />
            <span>Add New Script</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="ts-tabs">
        <button
          className={`ts-tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => switchTab('submissions')}
        >
          <MdPendingActions />
          <span>Script Submissions Queue</span>
          {submissions.filter((s) => s.status === 'pending').length > 0 && (
            <span className="ts-tab-count">
              {submissions.filter((s) => s.status === 'pending').length} new
            </span>
          )}
        </button>
        <button
          className={`ts-tab-btn ${activeTab === 'scripts' ? 'active' : ''}`}
          onClick={() => switchTab('scripts')}
        >
          <MdMovieFilter />
          <span>Trending Scripts ({scripts.length})</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TAB 1: SUBMISSIONS QUEUE                                           */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'submissions' && (
        <div className="ts-tab-content">
          <div className="ts-filter-bar">
            <div className="ts-search-box">
              <input
                type="text"
                placeholder="Search by title, writer pen name, genre, email..."
                value={submissionSearch}
                onChange={(e) => setSubmissionSearch(e.target.value)}
              />
            </div>
            <div className="ts-filter-pills">
              {['all', 'pending', 'approved', 'featured', 'rejected'].map((f) => (
                <button
                  key={f}
                  className={`ts-pill ${submissionFilter === f ? 'active' : ''}`}
                  onClick={() => setSubmissionFilter(f)}
                >
                  {f === 'all' ? 'All Submissions' : f.charAt(0).toUpperCase() + f.slice(1)}
                  <span className="ts-pill-count">
                    {f === 'all'
                      ? submissions.length
                      : submissions.filter((s) => s.status === f).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loadingSubmissions ? (
            <div className="ts-loading-state">
              <div className="ts-spinner" />
              <p>Loading script submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="ts-empty-state">
              <MdPendingActions size={48} />
              <h3>No Script Submissions Found</h3>
              <p>Writers who submit scripts from the mobile app will appear in this review queue.</p>
            </div>
          ) : (
            <div className="ts-submissions-table-wrap">
              <table className="ts-table">
                <thead>
                  <tr>
                    <th>Script Details</th>
                    <th>Pen Name</th>
                    <th>Format / Genre</th>
                    <th>Pages</th>
                    <th>Manuscript (PDF)</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <div className="ts-sub-info">
                          {sub.coverUrl ? (
                            <img
                              src={resolveMediaUrl(sub.coverUrl)}
                              alt="Cover"
                              className="ts-sub-thumb"
                            />
                          ) : (
                            <div className="ts-sub-thumb-placeholder">
                              <MdMovieCreation />
                            </div>
                          )}
                          <div>
                            <div className="ts-sub-title">{sub.title}</div>
                            <div className="ts-sub-logline">
                              {sub.synopsis
                                ? sub.synopsis.slice(0, 90) + (sub.synopsis.length > 90 ? '...' : '')
                                : 'No logline provided.'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="ts-writer-badge">{sub.penName || 'Unknown'}</span>
                        {sub.userEmail && <div className="ts-sub-email">{sub.userEmail}</div>}
                      </td>
                      <td>
                        <span className="ts-genre-chip">{sub.genre || 'Action'}</span>
                        <div className="ts-format-line">{sub.type || 'Feature Film'}</div>
                      </td>
                      <td>{sub.pageCount ? `${sub.pageCount} pages` : '—'}</td>
                      <td>
                        {sub.manuscriptUrl ? (
                          <a
                            href={resolveMediaUrl(sub.manuscriptUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ts-pdf-link"
                          >
                            <MdDescription />
                            <span>View PDF</span>
                            <MdOpenInNew size={13} />
                          </a>
                        ) : (
                          <span className="ts-muted-text">None</span>
                        )}
                      </td>
                      <td>
                        <span className={`ts-status-tag ${sub.status}`}>
                          {sub.status === 'featured'
                            ? 'Featured'
                            : sub.status === 'approved'
                            ? 'Approved'
                            : sub.status === 'rejected'
                            ? 'Rejected'
                            : 'Pending Review'}
                        </span>
                      </td>
                      <td className="ts-muted-text">
                        {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="ts-action-group">
                          <button
                            className="ts-action-btn view"
                            onClick={() => setViewingSubmission(sub)}
                            title="View Full Details"
                          >
                            <MdVisibility />
                          </button>
                          {sub.status !== 'featured' && (
                            <button
                              className="ts-action-btn feature"
                              onClick={() => handleSubmissionAction(sub.id, 'feature')}
                              disabled={actionLoadingId === sub.id}
                              title="Feature in Trending Scripts (Publishes to Home Row)"
                            >
                              <MdAutoAwesome />
                              <span>Feature</span>
                            </button>
                          )}
                          {sub.status === 'pending' && (
                            <button
                              className="ts-action-btn approve"
                              onClick={() => handleSubmissionAction(sub.id, 'approve')}
                              disabled={actionLoadingId === sub.id}
                              title="Approve Submission"
                            >
                              <MdCheckCircle />
                            </button>
                          )}
                          {sub.status !== 'rejected' && (
                            <button
                              className="ts-action-btn reject"
                              onClick={() => openRejectModal(sub)}
                              disabled={actionLoadingId === sub.id}
                              title="Reject with Feedback"
                            >
                              <MdCancel />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 2: TRENDING SCRIPTS (PUBLISHED)                                */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'scripts' && (
        <div className="ts-tab-content">
          <div className="ts-filter-bar">
            <div className="ts-search-box">
              <input
                type="text"
                placeholder="Search trending scripts by title, writer, format..."
                value={scriptSearch}
                onChange={(e) => setScriptSearch(e.target.value)}
              />
            </div>
          </div>

          {loadingScripts ? (
            <div className="ts-loading-state">
              <div className="ts-spinner" />
              <p>Loading trending screenplays...</p>
            </div>
          ) : filteredScripts.length === 0 ? (
            <div className="ts-empty-state">
              <MdMovieFilter size={48} />
              <h3>No Trending Scripts Found</h3>
              <p>Click "Seed Default Scripts" or "Add New Script" to populate this section.</p>
            </div>
          ) : (
            <div className="ts-scripts-grid">
              {filteredScripts.map((sc) => (
                <div key={sc.id} className="ts-script-card">
                  <div className="ts-card-top">
                    <div className="ts-card-cover">
                      {sc.coverUrl ? (
                        <img src={resolveMediaUrl(sc.coverUrl)} alt={sc.title} />
                      ) : (
                        <div className="ts-card-cover-fallback">
                          <MdMovieCreation size={32} />
                          <span>{SCRIPT_COVER_MAP[sc.img] || sc.genre || 'Screenplay'}</span>
                        </div>
                      )}
                      <span className="ts-format-pill">{sc.format || 'Feature Film'}</span>
                    </div>
                    <div className="ts-card-body">
                      <div className="ts-card-badge-row">
                        <span className="ts-genre-chip">{sc.genre}</span>
                        <div className="ts-rating">
                          <MdStar />
                          <span>{sc.rating || '4.9'}</span>
                        </div>
                      </div>
                      <h3 className="ts-card-title">{sc.title}</h3>
                      <div className="ts-card-author">By {sc.writer}</div>
                      <p className="ts-card-logline">{sc.logline || sc.synopsis}</p>
                      <div className="ts-card-stats-row">
                        <span title="Reads">
                          <MdVisibility /> {sc.reads ? sc.reads.toLocaleString() : 0}
                        </span>
                        <span title="Likes">
                          <MdFavorite /> {sc.likes ? sc.likes.toLocaleString() : 0}
                        </span>
                        <span title="Shares">
                          <MdShare /> {sc.shares ? sc.shares.toLocaleString() : 0}
                        </span>
                        <span title="Comments">
                          <MdChatBubble /> {sc.commentsCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ts-card-footer">
                    <button
                      className="ts-btn-outline"
                      onClick={() => openScenesModal(sc)}
                      title="Manage script scenes"
                    >
                      <MdMovieFilter />
                      <span>Scenes ({sc.scenes?.length || sc.scenesTotal || 0})</span>
                    </button>
                    <div className="ts-card-actions">
                      <button
                        className="ts-action-btn edit"
                        onClick={() => openScriptModal(sc)}
                        title="Edit script metadata"
                      >
                        <MdEdit />
                      </button>
                      <button
                        className="ts-action-btn delete"
                        onClick={() => handleDeleteScript(sc.id)}
                        title="Delete script"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: VIEW SUBMISSION DETAILS                                      */}
      {/* ------------------------------------------------------------------ */}
      {viewingSubmission && (
        <div className="ts-modal-overlay" onClick={() => setViewingSubmission(null)}>
          <div className="ts-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ts-modal-header">
              <h2>Script Submission Details</h2>
              <button className="ts-modal-close" onClick={() => setViewingSubmission(null)}>
                <MdClose />
              </button>
            </div>
            <div className="ts-modal-body">
              <div className="ts-detail-hero">
                {viewingSubmission.coverUrl ? (
                  <img
                    src={resolveMediaUrl(viewingSubmission.coverUrl)}
                    alt="Poster"
                    className="ts-detail-poster"
                  />
                ) : (
                  <div className="ts-detail-poster-fallback">
                    <MdMovieCreation size={40} />
                  </div>
                )}
                <div>
                  <h3>{viewingSubmission.title}</h3>
                  <div className="ts-detail-meta">
                    <span>Pen Name: <strong>{viewingSubmission.penName}</strong></span>
                    <span>Format: <strong>{viewingSubmission.type}</strong></span>
                    <span>Genre: <strong>{viewingSubmission.genre}</strong></span>
                    <span>Pages: <strong>{viewingSubmission.pageCount || '—'}</strong></span>
                  </div>
                  {viewingSubmission.manuscriptUrl && (
                    <div style={{ marginTop: 12 }}>
                      <a
                        href={resolveMediaUrl(viewingSubmission.manuscriptUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ts-pdf-link large"
                      >
                        <MdDescription />
                        <span>Download / View Screenplay PDF</span>
                        <MdOpenInNew />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="ts-detail-section">
                <h4>Logline / Synopsis</h4>
                <div className="ts-synopsis-box">{viewingSubmission.synopsis}</div>
              </div>

              <div className="ts-detail-section">
                <h4>Submission Status</h4>
                <div className="ts-status-row">
                  <span className={`ts-status-tag ${viewingSubmission.status}`}>
                    {viewingSubmission.status.toUpperCase()}
                  </span>
                  <span className="ts-muted-text">
                    Submitted on: {new Date(viewingSubmission.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="ts-modal-footer">
              <button
                className="ts-btn ts-btn-secondary"
                onClick={() => setViewingSubmission(null)}
              >
                Close
              </button>
              {viewingSubmission.status !== 'featured' && (
                <button
                  className="ts-btn ts-btn-primary"
                  onClick={() => handleSubmissionAction(viewingSubmission.id, 'feature')}
                >
                  <MdAutoAwesome />
                  <span>Feature in Trending Scripts</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: REJECT SUBMISSION WITH FEEDBACK                             */}
      {/* ------------------------------------------------------------------ */}
      {rejectingSub && (
        <div className="ts-modal-overlay" onClick={() => setRejectingSub(null)}>
          <div className="ts-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ts-modal-header">
              <h2>Reject Screenplay with Feedback</h2>
              <button className="ts-modal-close" onClick={() => setRejectingSub(null)}>
                <MdClose />
              </button>
            </div>
            <div className="ts-modal-body">
              <p className="ts-modal-desc">
                Select the reasons from our editorial team. The writer will see these feedback chips and notes in their app dashboard.
              </p>

              <div className="ts-form-group">
                <label>Reasons from our editors</label>
                <div className="ts-reasons-wrap">
                  {STANDARD_SCRIPT_REASONS.map((reason) => {
                    const isSelected = selectedReasons.includes(reason);
                    return (
                      <button
                        key={reason}
                        type="button"
                        className={`ts-reason-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleReason(reason)}
                      >
                        {reason}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="ts-form-group">
                <label>Editor's Note (Optional Advice for Resubmission)</label>
                <textarea
                  rows={4}
                  placeholder="e.g. Your opening scene concept is strong, but the first act takes too long to reach the inciting incident. Tighten the dialogue and tighten the first 10 pages."
                  value={editorNote}
                  onChange={(e) => setEditorNote(e.target.value)}
                />
              </div>
            </div>
            <div className="ts-modal-footer">
              <button className="ts-btn ts-btn-secondary" onClick={() => setRejectingSub(null)}>
                Cancel
              </button>
              <button
                className="ts-btn ts-btn-danger"
                onClick={() => handleSubmissionAction(rejectingSub.id, 'reject')}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: CREATE / EDIT SCRIPT                                        */}
      {/* ------------------------------------------------------------------ */}
      {showScriptModal && (
        <div className="ts-modal-overlay" onClick={() => setShowScriptModal(false)}>
          <div className="ts-modal-card large" onClick={(e) => e.stopPropagation()}>
            <div className="ts-modal-header">
              <h2>{editingScript ? 'Edit Trending Script' : 'Add New Trending Script'}</h2>
              <button className="ts-modal-close" onClick={() => setShowScriptModal(false)}>
                <MdClose />
              </button>
            </div>
            <form onSubmit={handleSaveScript}>
              <div className="ts-modal-body ts-form-grid">
                <div className="ts-form-group full">
                  <label>Script Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Lagos Heist"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="ts-form-group">
                  <label>Genre *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Action Thriller"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  />
                </div>

                <div className="ts-form-group">
                  <label>Format</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  >
                    <option value="Feature Film">Feature Film (90-120 pages)</option>
                    <option value="TV Pilot">TV Pilot (50-65 pages)</option>
                    <option value="Short Script">Short Script (5-40 pages)</option>
                  </select>
                </div>

                <div className="ts-form-group">
                  <label>Screenwriter *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tunde Williams"
                    value={formData.writer}
                    onChange={(e) => setFormData({ ...formData, writer: e.target.value })}
                  />
                </div>

                <div className="ts-form-group">
                  <label>Page Count</label>
                  <input
                    type="number"
                    placeholder="e.g. 110"
                    value={formData.pageCount}
                    onChange={(e) => setFormData({ ...formData, pageCount: e.target.value })}
                  />
                </div>

                <div className="ts-form-group">
                  <label>Rating (1.0 - 5.0)</label>
                  <input
                    type="text"
                    placeholder="4.9"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  />
                </div>

                <div className="ts-form-group">
                  <label>Production Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Production Ready">Production Ready</option>
                    <option value="In Development">In Development</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="ts-form-group full">
                  <label>Logline / Short Hook *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A disgraced master safe-cracker is forced into one final job..."
                    value={formData.logline}
                    onChange={(e) => setFormData({ ...formData, logline: e.target.value })}
                  />
                </div>

                <div className="ts-form-group full">
                  <label>Synopsis</label>
                  <textarea
                    rows={3}
                    placeholder="Detailed story synopsis and act outline..."
                    value={formData.synopsis}
                    onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                  />
                </div>

                <div className="ts-form-group full">
                  <label>Poster / Cover Image</label>
                  <div className="ts-upload-field">
                    <input
                      type="text"
                      placeholder="Image URL or upload below"
                      value={formData.coverUrl}
                      onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                    />
                    <label className="ts-upload-btn">
                      <MdCloudUpload />
                      <span>{uploadingCover ? 'Uploading...' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleCoverUpload}
                        disabled={uploadingCover}
                      />
                    </label>
                  </div>
                </div>

                <div className="ts-form-group full">
                  <label>Screenplay PDF Document Link</label>
                  <input
                    type="text"
                    placeholder="URL to screenplay PDF"
                    value={formData.pdfUrl}
                    onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  />
                </div>
              </div>
              <div className="ts-modal-footer">
                <button
                  type="button"
                  className="ts-btn ts-btn-secondary"
                  onClick={() => setShowScriptModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ts-btn ts-btn-primary">
                  {editingScript ? 'Save Changes' : 'Create Script'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: MANAGE SCENES                                               */}
      {/* ------------------------------------------------------------------ */}
      {showScenesModal && activeScriptForScenes && (
        <div className="ts-modal-overlay" onClick={() => setShowScenesModal(false)}>
          <div className="ts-modal-card large" onClick={(e) => e.stopPropagation()}>
            <div className="ts-modal-header">
              <div>
                <h2>Manage Scenes: {activeScriptForScenes.title}</h2>
                <p className="ts-modal-subtitle">
                  {activeScriptForScenes.scenes?.length || 0} scenes total in screenplay.
                </p>
              </div>
              <button className="ts-modal-close" onClick={() => setShowScenesModal(false)}>
                <MdClose />
              </button>
            </div>
            <div className="ts-modal-body">
              {/* Scenes List */}
              <div className="ts-scenes-list">
                {(activeScriptForScenes.scenes || []).map((sc, idx) => (
                  <div key={sc.id || idx} className="ts-scene-item">
                    <div className="ts-scene-info">
                      <span className="ts-scene-num">Scene {sc.index || idx + 1}</span>
                      <div>
                        <h4>{sc.heading || sc.title}</h4>
                        <div className="ts-scene-readtime">{sc.readTime || '4 min read'}</div>
                      </div>
                    </div>
                    <button
                      className="ts-action-btn delete"
                      onClick={() => handleDeleteScene(sc.id)}
                      title="Delete scene"
                    >
                      <MdDelete />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Scene Form */}
              <div className="ts-add-scene-form">
                <h3>Add New Scene</h3>
                <form onSubmit={handleAddScene}>
                  <div className="ts-form-grid">
                    <div className="ts-form-group">
                      <label>Scene Slugline / Heading *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SCENE 4 - INT. MARINA CAFE - DAY"
                        value={newScene.heading}
                        onChange={(e) => setNewScene({ ...newScene, heading: e.target.value })}
                      />
                    </div>
                    <div className="ts-form-group">
                      <label>Scene Title</label>
                      <input
                        type="text"
                        placeholder="e.g. The Revelation"
                        value={newScene.title}
                        onChange={(e) => setNewScene({ ...newScene, title: e.target.value })}
                      />
                    </div>
                    <div className="ts-form-group full">
                      <label>Scene Script Content (Screenplay Format) *</label>
                      <textarea
                        rows={8}
                        required
                        style={{ fontFamily: 'monospace' }}
                        placeholder="EXT. LOCATION - DAY&#10;&#10;Action description here...&#10;&#10;CHARACTER&#10;(parenthetical)&#10;Dialogue here..."
                        value={newScene.content}
                        onChange={(e) => setNewScene({ ...newScene, content: e.target.value })}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="ts-btn ts-btn-primary"
                    disabled={submittingScene}
                    style={{ marginTop: 12 }}
                  >
                    <MdAdd />
                    <span>{submittingScene ? 'Adding Scene...' : 'Add Scene to Script'}</span>
                  </button>
                </form>
              </div>
            </div>
            <div className="ts-modal-footer">
              <button
                className="ts-btn ts-btn-secondary"
                onClick={() => setShowScenesModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendingScripts;

