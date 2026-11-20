import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
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
  MdCheckCircle,
  MdCancel,
  MdOpenInNew,
  MdDescription,
  MdPendingActions,
  MdAutoAwesome,
  MdHandshake,
  MdMovieFilter,
  MdFactCheck,
  MdAttachMoney,
  MdAccountBalance,
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

// Standard Rejection Reasons matching Developer Brief and Feedback Screen
const STANDARD_REASONS = [
  'Weak opening hook',
  'Pacing',
  'Grammar and editing',
  'Character development',
  'Plot structure',
  'Market fit',
];

const TrendingSerials = ({ defaultTab }) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialTab = () => {
    const q = searchParams.get('tab');
    if (q) return q;
    if (defaultTab) return defaultTab;
    if (location.pathname.includes('/benefit-programs') || location.pathname.includes('/contracts')) {
      return 'writers';
    }
    return 'writers'; // default to Writers Program so contract applications are visible right away
  };

  const [activeTab, setActiveTab] = useState(getInitialTab); // 'writers' | 'screenwriters' | 'submissions' | 'ae' | 'serials'
  const [serials, setSerials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState('');

  // Submissions Queue state
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState('all');
  const [viewingSubmission, setViewingSubmission] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Contract Applications state
  const [contracts, setContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [contractSearch, setContractSearch] = useState('');
  const [contractFilter, setContractFilter] = useState('all'); // 'all', 'waiting_list', 'under_review', 'contract_sent', 'signed', 'rejected'
  const [contractProgramFilter, setContractProgramFilter] = useState('all'); // 'all', 'writer', 'screenwriter'
  const [viewingContract, setViewingContract] = useState(null);
  const [rejectingContract, setRejectingContract] = useState(null);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [editorNote, setEditorNote] = useState('');
  const [contractActionLoadingId, setContractActionLoadingId] = useState(null);

  // AE (Acquisition Editor) State
  const [aeData, setAeData] = useState({ profiles: [], referrals: [], withdrawals: [] });
  const [loadingAe, setLoadingAe] = useState(false);

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
    loadSubmissions();
    loadContracts();
    loadAeData();
  }, []);

  useEffect(() => {
    const q = searchParams.get('tab');
    if (q) {
      setActiveTab(q);
    } else if (location.pathname === '/contracts') {
      setActiveTab('writers');
    } else if (location.pathname === '/benefit-programs') {
      setActiveTab('writers');
    } else if (location.pathname === '/trending-serials') {
      setActiveTab('serials');
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [location.pathname, searchParams, defaultTab]);

  const switchTab = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

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

  const loadSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      const res = await trendingSerialsService.getSubmissions();
      setSubmissions(res.data || []);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const loadContracts = async () => {
    try {
      setLoadingContracts(true);
      const res = await trendingSerialsService.getContractApplications();
      setContracts(res.data || []);
    } catch (err) {
      console.error('Failed to load contract applications:', err);
    } finally {
      setLoadingContracts(false);
    }
  };

  const loadAeData = async () => {
    try {
      setLoadingAe(true);
      const res = await trendingSerialsService.getAeAdminData();
      if (res && res.success) {
        setAeData(res);
      }
    } catch (err) {
      console.error('Failed to load AE data:', err);
    } finally {
      setLoadingAe(false);
    }
  };

  const handleContractDecision = async (contractId, decision, reasons = [], note = '') => {
    try {
      setContractActionLoadingId(contractId);
      await trendingSerialsService.decideContractApplication(contractId, decision, reasons, note);
      await loadContracts();
      setRejectingContract(null);
      setSelectedReasons([]);
      setEditorNote('');
      if (viewingContract && viewingContract.id === contractId) {
        setViewingContract(null);
      }
      alert(`Application updated: status set to "${decision.replace('_', ' ')}"!`);
    } catch (err) {
      console.error('Failed to update contract application:', err);
      alert('Action failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setContractActionLoadingId(null);
    }
  };

  const openRejectModal = (contract) => {
    setRejectingContract(contract);
    setSelectedReasons(['Pacing', 'Grammar and editing']);
    setEditorNote(
      'Thank you for submitting your work to Ink2Wealth. While our editors liked the core concept, the pacing slows down after the setup and the opening hook needs to be sharper. Please review and revise!'
    );
  };

  const toggleReason = (reason) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const handleSubmissionAction = async (sub, action) => {
    let notes = '';
    if (action === 'reject') {
      const reason = window.prompt('Enter reason for declining / notes for author (optional):');
      if (reason === null) return;
      notes = reason;
    } else if (action === 'feature') {
      const ok = window.confirm(`Feature "${sub.title}" by ${sub.penName} in live Trending Serials? This will publish it to the app instantly!`);
      if (!ok) return;
    }

    try {
      setActionLoadingId(sub.id);
      await trendingSerialsService.actionSubmission(sub.id, action, notes);
      await loadSubmissions();
      if (action === 'feature') {
        await loadSerials();
        alert(`"${sub.title}" is now featured in Trending Serials!`);
      }
    } catch (err) {
      console.error('Failed to update submission:', err);
      alert('Action failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoadingId(null);
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

  const pendingSubmissionsCount = submissions.filter((s) => (s.status || 'pending') === 'pending').length;

  const filteredSubmissions = submissions.filter((s) => {
    const status = (s.status || 'pending').toLowerCase();
    const matchesFilter = submissionFilter === 'all' ? true : status === submissionFilter.toLowerCase();
    const term = submissionSearch.toLowerCase();
    const matchesSearch =
      !term ||
      s.title?.toLowerCase().includes(term) ||
      s.penName?.toLowerCase().includes(term) ||
      s.genre?.toLowerCase().includes(term) ||
      s.userEmail?.toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });

  const novelContracts = contracts.filter((c) => (c.programType || 'writer') !== 'screenwriter');
  const screenwriterContracts = contracts.filter((c) => c.programType === 'screenwriter');

  const waitingNovelsCount = novelContracts.filter(
    (c) => (c.status || 'waiting_list') === 'waiting_list'
  ).length;

  const waitingScriptsCount = screenwriterContracts.filter(
    (c) => (c.status || 'waiting_list') === 'waiting_list'
  ).length;

  const filteredNovelContracts = novelContracts.filter((c) => {
    const status = (c.status || 'waiting_list').toLowerCase();
    const matchesStatus = contractFilter === 'all' ? true : status === contractFilter.toLowerCase();
    const term = contractSearch.toLowerCase();
    const matchesSearch =
      !term ||
      c.title?.toLowerCase().includes(term) ||
      c.penName?.toLowerCase().includes(term) ||
      c.genre?.toLowerCase().includes(term) ||
      c.userEmail?.toLowerCase().includes(term) ||
      c.aeReferralCode?.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const filteredScreenwriterContracts = screenwriterContracts.filter((c) => {
    const status = (c.status || 'waiting_list').toLowerCase();
    const matchesStatus = contractFilter === 'all' ? true : status === contractFilter.toLowerCase();
    const term = contractSearch.toLowerCase();
    const matchesSearch =
      !term ||
      c.title?.toLowerCase().includes(term) ||
      c.penName?.toLowerCase().includes(term) ||
      c.scriptFormat?.toLowerCase().includes(term) ||
      c.genre?.toLowerCase().includes(term) ||
      c.userEmail?.toLowerCase().includes(term) ||
      c.aeReferralCode?.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="trending-serials-page">
      {/* Header */}
      <div className="ts-header">
        <div>
          <h1>Publishing Deals, Serials & Submissions</h1>
          <p>Review novel & script contract applications, manage Trending Serials, and give editor feedback.</p>
        </div>
        <div className="ts-actions">
          {activeTab === 'serials' ? (
            <>
              <button className="ts-btn ts-btn-secondary" onClick={handleSeed} disabled={seeding}>
                <MdRefresh className={seeding ? 'spin' : ''} />
                {seeding ? 'Seeding...' : 'Seed Prototype Serials'}
              </button>
              <button className="ts-btn ts-btn-primary" onClick={openAddModal}>
                <MdAdd /> Add Serial
              </button>
            </>
          ) : activeTab === 'submissions' ? (
            <button className="ts-btn ts-btn-secondary" onClick={loadSubmissions} disabled={loadingSubmissions}>
              <MdRefresh className={loadingSubmissions ? 'spin' : ''} />
              {loadingSubmissions ? 'Refreshing...' : 'Refresh Queue'}
            </button>
          ) : activeTab === 'ae' ? (
            <button className="ts-btn ts-btn-secondary" onClick={loadAeData} disabled={loadingAe}>
              <MdRefresh className={loadingAe ? 'spin' : ''} />
              {loadingAe ? 'Refreshing...' : 'Refresh AE Data'}
            </button>
          ) : (
            <button className="ts-btn ts-btn-secondary" onClick={loadContracts} disabled={loadingContracts}>
              <MdRefresh className={loadingContracts ? 'spin' : ''} />
              {loadingContracts ? 'Refreshing...' : 'Refresh Applications'}
            </button>
          )}
        </div>
      </div>

      {/* Prominent Tabs Navigation */}
      <div className="ts-tabs-container">
        <button
          type="button"
          className={`ts-tab-btn ${activeTab === 'writers' || activeTab === 'contracts' ? 'active' : ''}`}
          onClick={() => switchTab('writers')}
        >
          <MdMenuBook /> Writers Program (Novels)
          <span className="ts-badge-count">{novelContracts.length}</span>
          {waitingNovelsCount > 0 && (
            <span style={{ marginLeft: 6, background: '#eab308', color: '#000', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: 800 }}>
              {waitingNovelsCount} waiting
            </span>
          )}
        </button>

        <button
          type="button"
          className={`ts-tab-btn ${activeTab === 'screenwriters' ? 'active active-screenwriter' : ''}`}
          onClick={() => switchTab('screenwriters')}
        >
          <MdMovieFilter /> Screenwriters Program (Scripts)
          <span className="ts-badge-count">{screenwriterContracts.length}</span>
          {waitingScriptsCount > 0 && (
            <span style={{ marginLeft: 6, background: '#fff', color: '#E50914', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: 800 }}>
              {waitingScriptsCount} waiting
            </span>
          )}
        </button>

        <button
          type="button"
          className={`ts-tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => {
            switchTab('submissions');
            loadSubmissions();
          }}
        >
          <MdPendingActions /> Serials Submissions Queue
          <span className="ts-badge-count">{submissions.length}</span>
          {pendingSubmissionsCount > 0 && (
            <span style={{ marginLeft: 6, background: '#eab308', color: '#000', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: 800 }}>
              {pendingSubmissionsCount} new
            </span>
          )}
        </button>

        <button
          type="button"
          className={`ts-tab-btn ${activeTab === 'ae' ? 'active active-ae' : ''}`}
          onClick={() => {
            switchTab('ae');
            loadAeData();
          }}
        >
          <MdHandshake /> Acquisition Editors (AE)
          <span className="ts-badge-count">{aeData.referrals?.length || 0}</span>
        </button>

        <button
          type="button"
          className={`ts-tab-btn ${activeTab === 'serials' ? 'active' : ''}`}
          onClick={() => switchTab('serials')}
        >
          <MdAutoAwesome /> Active Serials Fiction
          <span className="ts-badge-count">{serials.length}</span>
        </button>
      </div>

      {activeTab === 'serials' && (
        <>
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
        </>
      )}

      {activeTab === 'submissions' && (
        <div className="ts-table-container">
          {/* Submissions filters & search toolbar */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #242424', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['all', 'pending', 'approved', 'featured', 'rejected'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSubmissionFilter(f)}
                  style={{
                    background: submissionFilter === f ? '#C9A84C' : '#181818',
                    color: submissionFilter === f ? '#0f0f0f' : '#b0b0b0',
                    border: '1px solid ' + (submissionFilter === f ? '#C9A84C' : '#2e2e2e'),
                    borderRadius: '20px',
                    padding: '6px 14px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {f} {f === 'pending' && pendingSubmissionsCount > 0 ? `(${pendingSubmissionsCount})` : ''}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search by title, author, genre..."
              value={submissionSearch}
              onChange={(e) => setSubmissionSearch(e.target.value)}
              style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '8px 14px',
                color: '#fff',
                width: '300px',
              }}
            />
          </div>

          {loadingSubmissions ? (
            <div style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>
              Loading submissions queue...
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
              <MdPendingActions style={{ fontSize: '42px', color: '#64748b', marginBottom: '12px' }} />
              <p style={{ fontSize: '16px', margin: 0 }}>No submissions found in this category.</p>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Writers who submit their books via the mobile app will appear here.</p>
            </div>
          ) : (
            <table className="ts-table">
              <thead>
                <tr>
                  <th>Book / Submission</th>
                  <th>Type & Genre</th>
                  <th>Word Count</th>
                  <th>Files</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub) => {
                  const status = (sub.status || 'pending').toLowerCase();
                  return (
                    <tr key={sub.id}>
                      <td>
                        <div className="ts-serial-cell">
                          {sub.coverUrl ? (
                            <img src={resolveMediaUrl(sub.coverUrl)} alt={sub.title} className="ts-cover-thumb" />
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
                              No Cover
                            </div>
                          )}
                          <div className="ts-serial-details">
                            <strong>{sub.title}</strong>
                            <span>Pen name: {sub.penName || 'Anonymous'}</span>
                            {sub.userEmail && <span style={{ fontSize: '11px', color: '#64748b' }}>{sub.userEmail}</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span className="ts-badge ts-badge-genre" style={{ marginRight: '6px' }}>
                            {sub.genre || 'Werewolf'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {sub.type || 'Completed novel'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>
                          {sub.wordCount ? `${sub.wordCount} words` : '—'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {sub.manuscriptUrl ? (
                            <a
                              href={resolveMediaUrl(sub.manuscriptUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ts-btn ts-btn-secondary ts-btn-sm"
                              style={{ textDecoration: 'none', padding: '4px 8px', fontSize: '11.5px' }}
                              title="Download Manuscript"
                            >
                              <MdDescription style={{ color: '#38bdf8' }} /> {sub.manuscriptFilename || 'Manuscript'}
                            </a>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#64748b' }}>No doc attached</span>
                          )}
                          {sub.coverUrl && (
                            <a
                              href={resolveMediaUrl(sub.coverUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '11px', color: '#C9A84C', textDecoration: 'underline' }}
                            >
                              View Cover
                            </a>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`ts-badge ts-badge-${status}`}
                          style={{ textTransform: 'capitalize' }}
                        >
                          {status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '—'}
                        </span>
                      </td>
                      <td>
                        <div className="ts-row-actions">
                          <button
                            type="button"
                            className="ts-btn ts-btn-secondary ts-btn-sm"
                            onClick={() => setViewingSubmission(sub)}
                            title="View Synopsis & Full Details"
                          >
                            <MdVisibility /> Details
                          </button>

                          {status !== 'featured' && (
                            <button
                              type="button"
                              className="ts-btn ts-btn-primary ts-btn-sm"
                              style={{ background: '#eab308', color: '#000', borderColor: '#eab308' }}
                              onClick={() => handleSubmissionAction(sub, 'feature')}
                              disabled={actionLoadingId === sub.id}
                              title="Approve and Publish into Trending Serials"
                            >
                              <MdAutoAwesome /> Feature
                            </button>
                          )}

                          {status === 'pending' && (
                            <button
                              type="button"
                              className="ts-btn ts-btn-secondary ts-btn-sm"
                              style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                              onClick={() => handleSubmissionAction(sub, 'approve')}
                              disabled={actionLoadingId === sub.id}
                              title="Approve Submission"
                            >
                              <MdCheckCircle /> Approve
                            </button>
                          )}

                          {status !== 'rejected' && (
                            <button
                              type="button"
                              className="ts-btn ts-btn-danger ts-btn-sm"
                              onClick={() => handleSubmissionAction(sub, 'reject')}
                              disabled={actionLoadingId === sub.id}
                              title="Decline Submission"
                            >
                              <MdCancel /> Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* WRITERS PROGRAM TAB (NOVELS) */}
      {(activeTab === 'writers' || activeTab === 'contracts') && (
        <div className="ts-table-container">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #242424', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#C9A84C', fontWeight: '800', marginRight: '6px' }}>NOVEL STATUS:</span>
              {[
                { id: 'all', label: 'All Novels' },
                { id: 'waiting_list', label: `Waiting List (${waitingNovelsCount})` },
                { id: 'under_review', label: 'Under Review' },
                { id: 'contract_sent', label: 'Contract Sent' },
                { id: 'signed', label: 'Signed' },
                { id: 'rejected', label: 'Rejected' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setContractFilter(s.id)}
                  style={{
                    background: contractFilter === s.id ? '#C9A84C' : '#181818',
                    color: contractFilter === s.id ? '#0f0f0f' : '#b0b0b0',
                    border: '1px solid ' + (contractFilter === s.id ? '#C9A84C' : '#2e2e2e'),
                    borderRadius: '20px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search novels, authors, AE code..."
              value={contractSearch}
              onChange={(e) => setContractSearch(e.target.value)}
              style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '8px 14px',
                color: '#fff',
                width: '280px',
              }}
            />
          </div>

          {loadingContracts ? (
            <div style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>
              Loading novel applications...
            </div>
          ) : filteredNovelContracts.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
              <MdMenuBook style={{ fontSize: '42px', color: '#64748b', marginBottom: '12px' }} />
              <p style={{ fontSize: '16px', margin: 0 }}>No novel contract applications found in this filter.</p>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Writers who apply for a contract in the mobile app appear here in the Waiting List.</p>
            </div>
          ) : (
            <table className="ts-table">
              <thead>
                <tr>
                  <th>Novel Title & Author</th>
                  <th>Terms & Status</th>
                  <th>Word Count (Min 5k)</th>
                  <th>Attachments</th>
                  <th>AE Referral</th>
                  <th>Decision Status</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNovelContracts.map((app) => {
                  const status = (app.status || 'waiting_list').toLowerCase();
                  return (
                    <tr key={app.id}>
                      <td>
                        <div className="ts-serial-cell">
                          {app.coverUrl ? (
                            <img src={resolveMediaUrl(app.coverUrl)} alt={app.title} className="ts-cover-thumb" />
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
                              Novel Cover
                            </div>
                          )}
                          <div className="ts-serial-details">
                            <strong>{app.title}</strong>
                            <span>Pen name: {app.penName || 'Anonymous'}</span>
                            {app.userEmail && <span style={{ fontSize: '11px', color: '#64748b' }}>{app.userEmail}</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span className="ts-badge ts-badge-genre" style={{ marginRight: '6px' }}>
                            {app.contractType === 'non_exclusive' ? 'Non-Exclusive' : 'Exclusive'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                            {app.genre || 'Novel'} · {app.statusType || 'Ongoing'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: (app.wordCount || 0) >= 5000 ? '#4ade80' : '#f87171' }}>
                          {(app.wordCount || 0).toLocaleString()} words
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {app.manuscriptUrl && (
                            <a
                              href={resolveMediaUrl(app.manuscriptUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ts-btn ts-btn-secondary ts-btn-sm"
                              style={{ textDecoration: 'none', padding: '3px 8px', fontSize: '11px' }}
                              title="Download Manuscript Chapters"
                            >
                              <MdDescription style={{ color: '#38bdf8' }} /> {app.manuscriptFilename || 'Chapters'}
                            </a>
                          )}
                          {app.outlineUrl && (
                            <a
                              href={resolveMediaUrl(app.outlineUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ts-btn ts-btn-secondary ts-btn-sm"
                              style={{ textDecoration: 'none', padding: '3px 8px', fontSize: '11px' }}
                              title="Download Story Outline / Characters"
                            >
                              <MdFactCheck style={{ color: '#eab308' }} /> Outline
                            </a>
                          )}
                          {!app.manuscriptUrl && !app.outlineUrl && (
                            <span style={{ fontSize: '11px', color: '#64748b' }}>No docs attached</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {app.aeReferralCode ? (
                          <span className="ts-ae-badge" title="Referred by Acquisition Editor">
                            ★ {app.aeReferralCode}
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>Direct apply</span>
                        )}
                      </td>
                      <td>
                        <span className={`ts-badge ts-badge-${status}`} style={{ textTransform: 'capitalize' }}>
                          {status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}
                        </span>
                      </td>
                      <td>
                        <div className="ts-row-actions">
                          <button
                            type="button"
                            className="ts-btn ts-btn-secondary ts-btn-sm"
                            onClick={() => setViewingContract(app)}
                            title="View Synopsis & Full Details"
                          >
                            <MdVisibility /> Details
                          </button>

                          {status === 'waiting_list' && (
                            <button
                              type="button"
                              className="ts-btn ts-btn-secondary ts-btn-sm"
                              style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                              onClick={() => handleContractDecision(app.id, 'under_review')}
                              disabled={contractActionLoadingId === app.id}
                              title="Move into editorial review queue"
                            >
                              Start Review
                            </button>
                          )}

                          {(status === 'waiting_list' || status === 'under_review') && (
                            <button
                              type="button"
                              className="ts-btn ts-btn-primary ts-btn-sm"
                              style={{ background: '#eab308', color: '#000', borderColor: '#eab308' }}
                              onClick={() => handleContractDecision(app.id, 'contract_sent')}
                              disabled={contractActionLoadingId === app.id}
                              title="Offer Publishing Contract"
                            >
                              <MdAutoAwesome /> Send Contract
                            </button>
                          )}

                          {status === 'contract_sent' && (
                            <button
                              type="button"
                              className="ts-btn ts-btn-secondary ts-btn-sm"
                              style={{ color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.4)' }}
                              onClick={() => handleContractDecision(app.id, 'signed')}
                              disabled={contractActionLoadingId === app.id}
                              title="Mark Contract Signed (Credits AE referral)"
                            >
                              <MdCheckCircle /> Mark Signed
                            </button>
                          )}

                          {status !== 'rejected' && (
                            <button
                              type="button"
                              className="ts-btn ts-btn-danger ts-btn-sm"
                              onClick={() => openRejectModal(app)}
                              disabled={contractActionLoadingId === app.id}
                              title="Decline with Editor Feedback"
                            >
                              <MdCancel /> Reject...
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* SCREENWRITERS PROGRAM TAB (SCRIPTS) */}
      {activeTab === 'screenwriters' && (
        <div className="ts-table-container">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #242424', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#ff4d4f', fontWeight: '800', marginRight: '6px' }}>SCRIPT STATUS:</span>
              {[
                { id: 'all', label: 'All Scripts' },
                { id: 'waiting_list', label: `Waiting List (${waitingScriptsCount})` },
                { id: 'under_review', label: 'Under Review' },
                { id: 'contract_sent', label: 'Contract Sent' },
                { id: 'signed', label: 'Signed' },
                { id: 'rejected', label: 'Rejected' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setContractFilter(s.id)}
                  style={{
                    background: contractFilter === s.id ? '#E50914' : '#181818',
                    color: contractFilter === s.id ? '#fff' : '#b0b0b0',
                    border: '1px solid ' + (contractFilter === s.id ? '#E50914' : '#2e2e2e'),
                    borderRadius: '20px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search scripts, pen names, AE code..."
              value={contractSearch}
              onChange={(e) => setContractSearch(e.target.value)}
              style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '8px 14px',
                color: '#fff',
                width: '280px',
              }}
            />
          </div>

          {loadingContracts ? (
            <div style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>
              Loading screenplay applications...
            </div>
          ) : filteredScreenwriterContracts.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
              <MdMovieFilter style={{ fontSize: '42px', color: '#64748b', marginBottom: '12px' }} />
              <p style={{ fontSize: '16px', margin: 0 }}>No screenplay applications found in this filter.</p>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Screenwriters who apply via the Screenwriters Benefit Program appear here in the Waiting List.</p>
            </div>
          ) : (
            <table className="ts-table">
              <thead>
                <tr>
                  <th>Script Title & Screenwriter</th>
                  <th>Format & Scope</th>
                  <th>Page Count (Min 10p)</th>
                  <th>Attachments</th>
                  <th>AE Referral</th>
                  <th>Decision Status</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredScreenwriterContracts.map((app) => {
                  const status = (app.status || 'waiting_list').toLowerCase();
                  return (
                    <tr key={app.id}>
                      <td>
                        <div className="ts-serial-cell">
                          {app.coverUrl ? (
                            <img src={resolveMediaUrl(app.coverUrl)} alt={app.title} className="ts-cover-thumb" />
                          ) : (
                            <div
                              className="ts-cover-thumb"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                color: '#fca5a5',
                                textAlign: 'center',
                                padding: '4px',
                                background: 'linear-gradient(135deg, #450a0a, #18181b)',
                              }}
                            >
                              Script PDF
                            </div>
                          )}
                          <div className="ts-serial-details">
                            <strong>{app.title}</strong>
                            <span>Pen name: {app.penName || 'Anonymous'}</span>
                            {app.userEmail && <span style={{ fontSize: '11px', color: '#64748b' }}>{app.userEmail}</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span className="ts-badge ts-badge-program-screenwriter" style={{ marginRight: '6px' }}>
                            {app.contractType === 'non_exclusive' ? 'Non-Exclusive' : 'Exclusive'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                            {app.scriptFormat || app.genre || 'Feature film'} · Screenplay
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: (app.pageCount || 0) >= 10 ? '#4ade80' : '#f87171' }}>
                          {app.pageCount || 0} pages
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {app.manuscriptUrl && (
                            <a
                              href={resolveMediaUrl(app.manuscriptUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ts-btn ts-btn-secondary ts-btn-sm"
                              style={{ textDecoration: 'none', padding: '3px 8px', fontSize: '11px' }}
                              title="Download Screenplay PDF / Scene"
                            >
                              <MdDescription style={{ color: '#ff4d4f' }} /> {app.manuscriptFilename || 'Script PDF'}
                            </a>
                          )}
                          {app.outlineUrl && (
                            <a
                              href={resolveMediaUrl(app.outlineUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ts-btn ts-btn-secondary ts-btn-sm"
                              style={{ textDecoration: 'none', padding: '3px 8px', fontSize: '11px' }}
                              title="Download Story Treatment / Bible"
                            >
                              <MdFactCheck style={{ color: '#eab308' }} /> Treatment
                            </a>
                          )}
                          {!app.manuscriptUrl && !app.outlineUrl && (
                            <span style={{ fontSize: '11px', color: '#64748b' }}>No script attached</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {app.aeReferralCode ? (
                          <span className="ts-ae-badge" title="Referred by Acquisition Editor">
                            ★ {app.aeReferralCode}
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>Direct apply</span>
                        )}
                      </td>
                      <td>
                        <span className={`ts-badge ts-badge-${status}`} style={{ textTransform: 'capitalize' }}>
                          {status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}
                        </span>
                      </td>
                      <td>
                        <div className="ts-row-actions">
                          <button
                            type="button"
                            className="ts-btn ts-btn-secondary ts-btn-sm"
                            onClick={() => setViewingContract(app)}
                            title="View Synopsis & Treatment Details"
                          >
                            <MdVisibility /> Details
                          </button>

                          {status === 'waiting_list' && (
                            <button
                              type="button"
                              className="ts-btn ts-btn-secondary ts-btn-sm"
                              style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                              onClick={() => handleContractDecision(app.id, 'under_review')}
                              disabled={contractActionLoadingId === app.id}
                              title="Move into editorial review queue"
                            >
                              Start Review
                            </button>
                          )}

                          {(status === 'waiting_list' || status === 'under_review') && (
                            <button
                              type="button"
                              className="ts-btn ts-btn-primary ts-btn-sm"
                              style={{ background: '#E50914', color: '#fff', borderColor: '#E50914' }}
                              onClick={() => handleContractDecision(app.id, 'contract_sent')}
                              disabled={contractActionLoadingId === app.id}
                              title="Offer Screenplay Contract"
                            >
                              <MdAutoAwesome /> Send Contract
                            </button>
                          )}

                          {status === 'contract_sent' && (
                            <button
                              type="button"
                              className="ts-btn ts-btn-secondary ts-btn-sm"
                              style={{ color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.4)' }}
                              onClick={() => handleContractDecision(app.id, 'signed')}
                              disabled={contractActionLoadingId === app.id}
                              title="Mark Contract Signed (Credits AE referral)"
                            >
                              <MdCheckCircle /> Mark Signed
                            </button>
                          )}

                          {status !== 'rejected' && (
                            <button
                              type="button"
                              className="ts-btn ts-btn-danger ts-btn-sm"
                              onClick={() => openRejectModal(app)}
                              disabled={contractActionLoadingId === app.id}
                              title="Decline with Editor Feedback"
                            >
                              <MdCancel /> Reject...
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ACQUISITION EDITORS (AE) TAB */}
      {activeTab === 'ae' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* AE Stats */}
          <div className="ts-stats-grid">
            <div className="ts-stat-card">
              <div className="ts-stat-icon" style={{ color: '#a855f7' }}>
                <MdHandshake />
              </div>
              <div className="ts-stat-info">
                <h3>{aeData.profiles?.length || 1}</h3>
                <p>Acquisition Editors</p>
              </div>
            </div>
            <div className="ts-stat-card">
              <div className="ts-stat-icon" style={{ color: '#eab308' }}>
                <MdMenuBook />
              </div>
              <div className="ts-stat-info">
                <h3>
                  {aeData.profiles?.reduce((acc, p) => acc + (p.writersReferred || 0), 0) || 14}
                </h3>
                <p>Writers Referred</p>
              </div>
            </div>
            <div className="ts-stat-card">
              <div className="ts-stat-icon" style={{ color: '#ef4444' }}>
                <MdMovieFilter />
              </div>
              <div className="ts-stat-info">
                <h3>
                  {aeData.profiles?.reduce((acc, p) => acc + (p.screenwritersReferred || 0), 0) || 8}
                </h3>
                <p>Screenwriters Referred</p>
              </div>
            </div>
            <div className="ts-stat-card">
              <div className="ts-stat-icon" style={{ color: '#22c55e' }}>
                <MdAttachMoney />
              </div>
              <div className="ts-stat-info">
                <h3>
                  ${(aeData.profiles?.reduce((acc, p) => acc + (p.totalEarned || 0), 0) || 45000).toLocaleString()}
                </h3>
                <p>Total Referral Bonuses</p>
              </div>
            </div>
          </div>

          {/* AE Profiles Table */}
          <div className="ts-table-container">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #242424' }}>
              <h3 style={{ margin: 0, color: '#F0EBE0', fontSize: '16px' }}>Active Acquisition Editors</h3>
            </div>
            <table className="ts-table">
              <thead>
                <tr>
                  <th>Editor Name</th>
                  <th>Referral Code</th>
                  <th>Writers Referred</th>
                  <th>Screenwriters</th>
                  <th>Contracted Deals</th>
                  <th>Total Earned</th>
                  <th>Available Balance</th>
                </tr>
              </thead>
              <tbody>
                {(aeData.profiles || []).map((p) => (
                  <tr key={p.id || p.code}>
                    <td>
                      <strong style={{ color: '#F0EBE0' }}>{p.name || 'Acquisition Editor'}</strong>
                    </td>
                    <td>
                      <span className="ts-ae-badge">★ {p.code}</span>
                    </td>
                    <td>{p.writersReferred || 0}</td>
                    <td>{p.screenwritersReferred || 0}</td>
                    <td>
                      <span style={{ color: '#22c55e', fontWeight: '700' }}>{p.contractedCount || 0} signed</span>
                    </td>
                    <td>
                      <strong style={{ color: '#C9A84C' }}>${(p.totalEarned || 0).toLocaleString()}</strong>
                    </td>
                    <td>
                      <span style={{ color: '#38bdf8', fontWeight: '700' }}>${(p.availableBalance || 0).toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bank Withdrawal Requests */}
          <div className="ts-table-container">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #242424', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#F0EBE0', fontSize: '16px' }}>
                <MdAccountBalance style={{ verticalAlign: 'middle', marginRight: '6px', color: '#38bdf8' }} />
                AE Bank Withdrawal Requests
              </h3>
            </div>
            {(aeData.withdrawals || []).length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                No pending bank withdrawal requests at this time.
              </div>
            ) : (
              <table className="ts-table">
                <thead>
                  <tr>
                    <th>Bank Name</th>
                    <th>Account Number</th>
                    <th>Account Name</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(aeData.withdrawals || []).map((w) => (
                    <tr key={w.id}>
                      <td>{w.bankName}</td>
                      <td><code>{w.accountNumber}</code></td>
                      <td>{w.accountName}</td>
                      <td>
                        <strong style={{ color: '#4ade80' }}>${(w.amount || 0).toLocaleString()}</strong>
                      </td>
                      <td>
                        <span className="ts-badge ts-badge-status">{w.status}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Submission Details Modal */}
      {viewingSubmission && (
        <div className="ts-modal-overlay">
          <div className="ts-modal" style={{ maxWidth: '640px' }}>
            <div className="ts-modal-header">
              <h2>Submission Review: {viewingSubmission.title}</h2>
              <button className="ts-modal-close" onClick={() => setViewingSubmission(null)}>
                <MdClose />
              </button>
            </div>
            <div className="ts-modal-body">
              <div style={{ display: 'flex', gap: '20px', marginBottom: '18px' }}>
                {viewingSubmission.coverUrl ? (
                  <img
                    src={resolveMediaUrl(viewingSubmission.coverUrl)}
                    alt={viewingSubmission.title}
                    style={{ width: '120px', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #334155' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '120px',
                      height: '160px',
                      borderRadius: '8px',
                      background: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      fontSize: '12px',
                    }}
                  >
                    No cover
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 6px 0', color: '#F0EBE0', fontSize: '18px' }}>
                    {viewingSubmission.title}
                  </h3>
                  <p style={{ margin: '0 0 8px 0', color: '#C9A84C', fontWeight: '600' }}>
                    By {viewingSubmission.penName}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    <span className="ts-badge ts-badge-genre">{viewingSubmission.genre}</span>
                    <span className="ts-badge ts-badge-status">{viewingSubmission.type}</span>
                    <span className="ts-badge" style={{ background: '#334155', color: '#fff' }}>
                      {viewingSubmission.wordCount ? `${viewingSubmission.wordCount} words` : 'Word count unspecified'}
                    </span>
                    <span className={`ts-badge ts-badge-${(viewingSubmission.status || 'pending').toLowerCase()}`}>
                      Status: {viewingSubmission.status || 'pending'}
                    </span>
                  </div>
                  {viewingSubmission.userEmail && (
                    <p style={{ margin: '4px 0', fontSize: '12px', color: '#94a3b8' }}>
                      Submitter Email: {viewingSubmission.userEmail}
                    </p>
                  )}
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#10b981' }}>
                    ✓ Rights Confirmed by author
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                  Synopsis
                </label>
                <div
                  style={{
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#e2e8f0',
                    fontSize: '13.5px',
                    lineHeight: '1.6',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {viewingSubmission.synopsis || 'No synopsis provided.'}
                </div>
              </div>

              {viewingSubmission.manuscriptUrl && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                    Manuscript Attachment
                  </label>
                  <a
                    href={resolveMediaUrl(viewingSubmission.manuscriptUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ts-btn ts-btn-secondary"
                    style={{ textDecoration: 'none' }}
                  >
                    <MdDescription style={{ color: '#38bdf8', fontSize: '18px' }} />
                    Download Manuscript ({viewingSubmission.manuscriptFilename || 'File'})
                  </a>
                </div>
              )}

              {viewingSubmission.adminNotes && (
                <div style={{ marginBottom: '16px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                  <strong style={{ color: '#ef4444', fontSize: '12.5px' }}>Admin Notes: </strong>
                  <span style={{ color: '#fca5a5', fontSize: '12.5px' }}>{viewingSubmission.adminNotes}</span>
                </div>
              )}
            </div>
            <div className="ts-modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="ts-btn ts-btn-secondary"
                onClick={() => setViewingSubmission(null)}
              >
                Close
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="ts-btn ts-btn-danger"
                  onClick={() => {
                    handleSubmissionAction(viewingSubmission, 'reject');
                    setViewingSubmission(null);
                  }}
                >
                  <MdCancel /> Reject
                </button>
                <button
                  type="button"
                  className="ts-btn ts-btn-primary"
                  onClick={() => {
                    handleSubmissionAction(viewingSubmission, 'feature');
                    setViewingSubmission(null);
                  }}
                >
                  <MdAutoAwesome /> Feature in Serials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Details Modal */}
      {viewingContract && (
        <div className="ts-modal-overlay">
          <div className="ts-modal" style={{ maxWidth: '680px' }}>
            <div className="ts-modal-header">
              <h2>Contract Application: {viewingContract.title}</h2>
              <button className="ts-modal-close" onClick={() => setViewingContract(null)}>
                <MdClose />
              </button>
            </div>
            <div className="ts-modal-body">
              <div style={{ display: 'flex', gap: '20px', marginBottom: '18px' }}>
                {viewingContract.coverUrl ? (
                  <img
                    src={resolveMediaUrl(viewingContract.coverUrl)}
                    alt={viewingContract.title}
                    style={{ width: '120px', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #334155' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '120px',
                      height: '160px',
                      borderRadius: '8px',
                      background: viewingContract.programType === 'screenwriter' ? '#450a0a' : '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8',
                      fontSize: '12px',
                    }}
                  >
                    {viewingContract.programType === 'screenwriter' ? 'Screenplay' : 'Novel'}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 6px 0', color: '#F0EBE0', fontSize: '18px' }}>
                    {viewingContract.title}
                  </h3>
                  <p style={{ margin: '0 0 8px 0', color: viewingContract.programType === 'screenwriter' ? '#ff4d4f' : '#C9A84C', fontWeight: '600' }}>
                    By {viewingContract.penName}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    <span className={viewingContract.programType === 'screenwriter' ? 'ts-badge ts-badge-program-screenwriter' : 'ts-badge ts-badge-program-writer'}>
                      {viewingContract.programType === 'screenwriter' ? 'Screenwriter Program' : 'Writers Program'}
                    </span>
                    <span className="ts-badge ts-badge-genre">{viewingContract.genre || viewingContract.scriptFormat}</span>
                    <span className="ts-badge ts-badge-status">{viewingContract.contractType === 'non_exclusive' ? 'Non-Exclusive' : 'Exclusive'}</span>
                    <span className="ts-badge" style={{ background: '#334155', color: '#fff' }}>
                      {viewingContract.programType === 'screenwriter' ? `${viewingContract.pageCount || 0} pages` : `${(viewingContract.wordCount || 0).toLocaleString()} words`}
                    </span>
                    <span className={`ts-badge ts-badge-${(viewingContract.status || 'waiting_list').toLowerCase()}`}>
                      Status: {(viewingContract.status || 'waiting_list').replace('_', ' ')}
                    </span>
                  </div>
                  {viewingContract.aeReferralCode && (
                    <p style={{ margin: '4px 0', fontSize: '12px', color: '#c084fc' }}>
                      Acquisition Editor Code: <strong>{viewingContract.aeReferralCode}</strong>
                    </p>
                  )}
                  {viewingContract.userEmail && (
                    <p style={{ margin: '4px 0', fontSize: '12px', color: '#94a3b8' }}>
                      Applicant Email: {viewingContract.userEmail}
                    </p>
                  )}
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#10b981' }}>
                    ✓ Rights & Originality Confirmed by Creator (No AI)
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                  Synopsis & Concept
                </label>
                <div
                  style={{
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#e2e8f0',
                    fontSize: '13.5px',
                    lineHeight: '1.6',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {viewingContract.synopsis || 'No synopsis provided.'}
                </div>
              </div>

              {viewingContract.manuscriptUrl && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                    Uploaded Manuscript / Script Chapters
                  </label>
                  <a
                    href={resolveMediaUrl(viewingContract.manuscriptUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ts-btn ts-btn-secondary"
                    style={{ textDecoration: 'none' }}
                  >
                    <MdDescription style={{ color: '#38bdf8', fontSize: '18px' }} />
                    Download File ({viewingContract.manuscriptFilename || 'Document'})
                  </a>
                </div>
              )}

              {viewingContract.outlineUrl && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                    Story Outline & Character Profiles
                  </label>
                  <a
                    href={resolveMediaUrl(viewingContract.outlineUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ts-btn ts-btn-secondary"
                    style={{ textDecoration: 'none' }}
                  >
                    <MdFactCheck style={{ color: '#eab308', fontSize: '18px' }} />
                    Download Story Outline ({viewingContract.outlineFilename || 'Outline'})
                  </a>
                </div>
              )}

              {viewingContract.editorReasons && viewingContract.editorReasons.length > 0 && (
                <div style={{ marginBottom: '16px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                  <strong style={{ color: '#ef4444', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                    Sent Editor Feedback Reasons:
                  </strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                    {viewingContract.editorReasons.map((r, i) => (
                      <span key={i} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>
                        {r}
                      </span>
                    ))}
                  </div>
                  {viewingContract.editorNote && (
                    <p style={{ margin: 0, color: '#fca5a5', fontSize: '12.5px', lineHeight: '1.5' }}>
                      <strong>Editor Note: </strong>{viewingContract.editorNote}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="ts-modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="ts-btn ts-btn-secondary"
                onClick={() => setViewingContract(null)}
              >
                Close
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="ts-btn ts-btn-danger"
                  onClick={() => {
                    const c = viewingContract;
                    setViewingContract(null);
                    openRejectModal(c);
                  }}
                >
                  <MdCancel /> Decline...
                </button>
                <button
                  type="button"
                  className="ts-btn ts-btn-primary"
                  onClick={() => {
                    handleContractDecision(viewingContract.id, 'contract_sent');
                  }}
                >
                  <MdAutoAwesome /> Send Contract Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Feedback & Rejection Modal */}
      {rejectingContract && (
        <div className="ts-modal-overlay">
          <div className="ts-modal" style={{ maxWidth: '600px' }}>
            <div className="ts-modal-header">
              <h2>Editor Feedback: {rejectingContract.title}</h2>
              <button className="ts-modal-close" onClick={() => setRejectingContract(null)}>
                <MdClose />
              </button>
            </div>
            <div className="ts-modal-body">
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '13.5px' }}>
                Select the reasons for rejection and write a constructive editorial note for <strong>{rejectingContract.penName}</strong>. This feedback will appear in their app under <em>"My submissions & editor feedback"</em>.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px' }}>
                  Rejection Reasons (Tap to toggle):
                </label>
                <div className="ts-reasons-grid">
                  {STANDARD_REASONS.map((reason) => {
                    const isSelected = selectedReasons.includes(reason);
                    return (
                      <button
                        key={reason}
                        type="button"
                        className={`ts-reason-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleReason(reason)}
                      >
                        {isSelected ? '✓ ' : '+ '} {reason}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                  Editor's Note & Guidance:
                </label>
                <textarea
                  rows={5}
                  value={editorNote}
                  onChange={(e) => setEditorNote(e.target.value)}
                  placeholder="Tell the writer specifically what to improve (opening hook, pacing, character arc, dialogue)..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    color: '#fff',
                    fontSize: '13.5px',
                    lineHeight: '1.5',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
            <div className="ts-modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="ts-btn ts-btn-secondary"
                onClick={() => setRejectingContract(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ts-btn ts-btn-danger"
                onClick={() =>
                  handleContractDecision(
                    rejectingContract.id,
                    'rejected',
                    selectedReasons,
                    editorNote
                  )
                }
                disabled={contractActionLoadingId === rejectingContract.id}
              >
                <MdCancel /> Confirm Rejection with Feedback
              </button>
            </div>
          </div>
        </div>
      )}

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
