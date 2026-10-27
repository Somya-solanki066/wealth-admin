import { useEffect, useMemo, useState } from 'react';
import { writingVaultService } from '../services/writingVaultService';
import './AiConfig.css';

const EMPTY_PROMPT = {
  title: '',
  promptText: '',
  category: 'fire_starters',
  genre: 'Romance',
  tone: 'Dramatic',
  difficulty: 'intermediate',
  isActive: true,
};

const EMPTY_SPARK = {
  text: '',
  words: 100,
  mins: 8,
  order: 1,
  isActive: true,
};

const EMPTY_CONTEST = {
  kind: 'Daily challenge',
  title: '',
  brief: '',
  words: 100,
  left: 'Ends tonight',
  entries: '0 entries',
  prize: 'XP and a featured badge',
  dates: 'Opens 12:00 AM, closes 11:59 PM today',
  judging: 'Panel of 3 judges and the rubric below.',
  sponsored: false,
  order: 1,
  isActive: true,
};

const EMPTY_MOTION = {
  genre: 'Romance',
  title: '',
  gradientColors: ['#3A2A6B', '#C4577A', '#F3B27A'],
  segments: ['', '', ''],
  questions: ['', '', ''],
  order: 1,
  isActive: true,
};

export default function WritingVault() {
  const [activeTab, setActiveTab] = useState('prompts'); // prompts | sparks | contests | motion | games
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Prompts Tab State
  const [prompts, setPrompts] = useState([]);
  const [meta, setMeta] = useState({ categories: [], genres: [], tones: [] });
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editingPromptId, setEditingPromptId] = useState(null);
  const [promptForm, setPromptForm] = useState(EMPTY_PROMPT);

  // Sparks Tab State
  const [sparks, setSparks] = useState([]);
  const [editingSparkId, setEditingSparkId] = useState(null);
  const [sparkForm, setSparkForm] = useState(EMPTY_SPARK);

  // Contests Tab State
  const [contests, setContests] = useState([]);
  const [editingContestId, setEditingContestId] = useState(null);
  const [contestForm, setContestForm] = useState(EMPTY_CONTEST);

  // Motion Tab State
  const [motionList, setMotionList] = useState([]);
  const [editingMotionId, setEditingMotionId] = useState(null);
  const [motionForm, setMotionForm] = useState(EMPTY_MOTION);

  // Games & Ticker Tab State
  const [tickerList, setTickerList] = useState([]);
  const [tickerInput, setTickerInput] = useState('');
  const [gamesData, setGamesData] = useState(null);

  const showSuccess = (msg) => {
    setMessage(msg);
    setError('');
    setTimeout(() => setMessage(''), 4000);
  };

  const showError = (err) => {
    setError(err?.response?.data?.error || err.message || 'Operation failed');
    setMessage('');
  };

  // ——————————————————————————————————————————————————————————
  // LOAD DATA BASED ON TAB
  // ——————————————————————————————————————————————————————————

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const res = await writingVaultService.list({
        category: filterCategory || undefined,
        status: filterStatus || undefined,
      });
      setPrompts(res.data?.data || []);
      if (res.data?.meta) setMeta(res.data.meta);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSparks = async () => {
    setLoading(true);
    try {
      const res = await writingVaultService.getHubSection('sparks');
      setSparks(res.data?.data || []);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadContests = async () => {
    setLoading(true);
    try {
      const res = await writingVaultService.getHubSection('contests');
      setContests(res.data?.data || []);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMotion = async () => {
    setLoading(true);
    try {
      const res = await writingVaultService.getHubSection('motion');
      setMotionList(res.data?.data || []);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadGamesAndTicker = async () => {
    setLoading(true);
    try {
      const [gRes, tRes] = await Promise.all([
        writingVaultService.getHubSection('games'),
        writingVaultService.getHubSection('ticker'),
      ]);
      setGamesData(gRes.data?.data || null);
      const tickers = tRes.data?.data?.ticker || [];
      setTickerList(tickers);
      setTickerInput(tickers.join('\n'));
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'prompts') loadPrompts();
    if (activeTab === 'sparks') loadSparks();
    if (activeTab === 'contests') loadContests();
    if (activeTab === 'motion') loadMotion();
    if (activeTab === 'games') loadGamesAndTicker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filterCategory, filterStatus]);

  // Seed All Defaults Handler
  const handleSeedAllHub = async () => {
    if (!window.confirm('Initialize and seed all Writing Vault Hub sections with defaults?')) return;
    setSaving(true);
    try {
      await writingVaultService.seedHub();
      await writingVaultService.seed();
      showSuccess('Writing Vault sections & prompts seeded successfully!');
      if (activeTab === 'prompts') loadPrompts();
      if (activeTab === 'sparks') loadSparks();
      if (activeTab === 'contests') loadContests();
      if (activeTab === 'motion') loadMotion();
      if (activeTab === 'games') loadGamesAndTicker();
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  };

  // ——————————————————————————————————————————————————————————
  // PROMPT HANDLERS
  // ——————————————————————————————————————————————————————————

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPromptId) {
        await writingVaultService.update(editingPromptId, promptForm);
        showSuccess('Prompt updated');
      } else {
        await writingVaultService.create(promptForm);
        showSuccess('Prompt created');
      }
      setEditingPromptId(null);
      setPromptForm(EMPTY_PROMPT);
      loadPrompts();
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePromptDelete = async (id) => {
    if (!window.confirm('Delete this prompt?')) return;
    try {
      await writingVaultService.remove(id);
      showSuccess('Prompt deleted');
      loadPrompts();
    } catch (err) {
      showError(err);
    }
  };

  // ——————————————————————————————————————————————————————————
  // SPARK HANDLERS
  // ——————————————————————————————————————————————————————————

  const handleSparkSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingSparkId) {
        await writingVaultService.updateHubItem('sparks', editingSparkId, sparkForm);
        showSuccess('Daily spark updated');
      } else {
        await writingVaultService.createHubItem('sparks', sparkForm);
        showSuccess('Daily spark created');
      }
      setEditingSparkId(null);
      setSparkForm(EMPTY_SPARK);
      loadSparks();
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSparkDelete = async (id) => {
    if (!window.confirm('Delete this spark?')) return;
    try {
      await writingVaultService.deleteHubItem('sparks', id);
      showSuccess('Daily spark deleted');
      loadSparks();
    } catch (err) {
      showError(err);
    }
  };

  // ——————————————————————————————————————————————————————————
  // CONTEST HANDLERS
  // ——————————————————————————————————————————————————————————

  const handleContestSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingContestId) {
        await writingVaultService.updateHubItem('contests', editingContestId, contestForm);
        showSuccess('Contest updated');
      } else {
        await writingVaultService.createHubItem('contests', contestForm);
        showSuccess('Contest created');
      }
      setEditingContestId(null);
      setContestForm(EMPTY_CONTEST);
      loadContests();
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleContestDelete = async (id) => {
    if (!window.confirm('Delete this contest?')) return;
    try {
      await writingVaultService.deleteHubItem('contests', id);
      showSuccess('Contest deleted');
      loadContests();
    } catch (err) {
      showError(err);
    }
  };

  // ——————————————————————————————————————————————————————————
  // MOTION STORY HANDLERS
  // ——————————————————————————————————————————————————————————

  const handleMotionSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingMotionId) {
        await writingVaultService.updateHubItem('motion', editingMotionId, motionForm);
        showSuccess('Motion story updated');
      } else {
        await writingVaultService.createHubItem('motion', motionForm);
        showSuccess('Motion story created');
      }
      setEditingMotionId(null);
      setMotionForm(EMPTY_MOTION);
      loadMotion();
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleMotionDelete = async (id) => {
    if (!window.confirm('Delete this motion story?')) return;
    try {
      await writingVaultService.deleteHubItem('motion', id);
      showSuccess('Motion story deleted');
      loadMotion();
    } catch (err) {
      showError(err);
    }
  };

  // ——————————————————————————————————————————————————————————
  // TICKER & GAMES SAVE HANDLER
  // ——————————————————————————————————————————————————————————

  const handleTickerSave = async () => {
    setSaving(true);
    try {
      const items = tickerInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      await writingVaultService.updateHubItem('ticker', 'general', { ticker: items });
      setTickerList(items);
      showSuccess('Live ticker announcements saved');
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = useMemo(() => {
    if (meta.categories?.length) return meta.categories;
    return [
      { id: 'fire_starters', label: 'Fire Starters' },
      { id: 'scene_builders', label: 'Scene Builders' },
      { id: 'character_voice', label: 'Character Voice' },
    ];
  }, [meta]);

  const genreOptions = meta.genres?.length
    ? meta.genres.filter((g) => g !== 'All Genres')
    : ['Werewolf', 'Vampire', 'Billionaire', 'Romance', 'Fantasy', 'Thriller'];

  return (
    <div className="ai-config-page">
      <div className="page-header">
        <div>
          <h2>Writing Vault Management</h2>
          <p>
            Manage live mobile app prompts, daily sparks, contests, story-in-motion videos, games, and announcements in real-time.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn-secondary" onClick={handleSeedAllHub} disabled={saving}>
            ⚡ Seed All Vault Defaults
          </button>
        </div>
      </div>

      {message && <div className="notice-banner success">{message}</div>}
      {error && <div className="notice-banner error">{error}</div>}

      {/* Navigation Sub-Tabs */}
      <div className="filters-row" style={{ borderBottom: '1px solid #242424', paddingBottom: 14, marginBottom: 20 }}>
        {[
          { id: 'prompts', label: 'Prompts Library' },
          { id: 'sparks', label: "Daily Sparks (Today's Spark)" },
          { id: 'contests', label: 'Writing Contests' },
          { id: 'motion', label: 'Story in Motion' },
          { id: 'games', label: 'Games & Live Ticker' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab(tab.id)}
            style={{ fontSize: 13, padding: '8px 14px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* —————————————————————————————————————————————————————————— */}
      {/* TAB 1: PROMPTS LIBRARY                                      */}
      {/* —————————————————————————————————————————————————————————— */}
      {activeTab === 'prompts' && (
        <>
          <form className="config-card" onSubmit={handlePromptSubmit}>
            <h3>{editingPromptId ? 'Edit Prompt' : 'Add New Library Prompt'}</h3>
            <div className="form-grid">
              <label>
                Category
                <select
                  value={promptForm.category}
                  onChange={(e) => setPromptForm((f) => ({ ...f, category: e.target.value }))}
                >
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Genre
                <select
                  value={promptForm.genre}
                  onChange={(e) => setPromptForm((f) => ({ ...f, genre: e.target.value }))}
                >
                  {genreOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tone
                <input
                  value={promptForm.tone}
                  onChange={(e) => setPromptForm((f) => ({ ...f, tone: e.target.value }))}
                  placeholder="e.g. Dramatic, Dark, Flirty"
                />
              </label>
              <label>
                Title
                <input
                  value={promptForm.title}
                  onChange={(e) => setPromptForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Optional title"
                />
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={promptForm.isActive}
                  onChange={(e) => setPromptForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                Published
              </label>
            </div>
            <label className="field-stack">
              Prompt Text
              <textarea
                rows={3}
                value={promptForm.promptText}
                onChange={(e) => setPromptForm((f) => ({ ...f, promptText: e.target.value }))}
                placeholder="Write prompt text..."
                required
              />
            </label>
            <div className="form-actions" style={{ marginTop: 12, display: 'flex', gap: 10 }}>
              {editingPromptId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingPromptId(null);
                    setPromptForm(EMPTY_PROMPT);
                  }}
                >
                  Cancel edit
                </button>
              )}
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editingPromptId ? 'Update prompt' : 'Save prompt'}
              </button>
            </div>
          </form>

          <div className="config-card">
            <h3>Prompts Library ({prompts.length})</h3>
            <div className="filters-row">
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="">All categories</option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All statuses</option>
                <option value="active">Published</option>
                <option value="inactive">Unpublished</option>
              </select>
            </div>

            {loading ? (
              <div className="loading-state">Loading…</div>
            ) : prompts.length === 0 ? (
              <div className="empty-state">No prompts found. Click Seed defaults above.</div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Genre</th>
                      <th>Tone</th>
                      <th>Prompt</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prompts.map((p) => (
                      <tr key={p.id}>
                        <td>{p.category}</td>
                        <td>{p.genre}</td>
                        <td>{p.tone}</td>
                        <td style={{ maxWidth: 360 }}>{p.promptText}</td>
                        <td>{p.isActive ? 'Published' : 'Off'}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-link"
                            onClick={() => {
                              setEditingPromptId(p.id);
                              setPromptForm({
                                title: p.title || '',
                                promptText: p.promptText || '',
                                category: p.category || 'fire_starters',
                                genre: p.genre || 'Romance',
                                tone: p.tone || 'Dramatic',
                                difficulty: p.difficulty || 'intermediate',
                                isActive: p.isActive !== false,
                              });
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-link danger"
                            onClick={() => handlePromptDelete(p.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* —————————————————————————————————————————————————————————— */}
      {/* TAB 2: DAILY SPARKS                                         */}
      {/* —————————————————————————————————————————————————————————— */}
      {activeTab === 'sparks' && (
        <>
          <form className="config-card" onSubmit={handleSparkSubmit}>
            <h3>{editingSparkId ? 'Edit Daily Spark' : "Add Today's Spark"}</h3>
            <div className="form-grid">
              <label>
                Target Words
                <input
                  type="number"
                  value={sparkForm.words}
                  onChange={(e) => setSparkForm((f) => ({ ...f, words: Number(e.target.value) || 100 }))}
                  required
                />
              </label>
              <label>
                Target Minutes
                <input
                  type="number"
                  value={sparkForm.mins}
                  onChange={(e) => setSparkForm((f) => ({ ...f, mins: Number(e.target.value) || 8 }))}
                  required
                />
              </label>
              <label>
                Display Order
                <input
                  type="number"
                  value={sparkForm.order}
                  onChange={(e) => setSparkForm((f) => ({ ...f, order: Number(e.target.value) || 1 }))}
                />
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={sparkForm.isActive}
                  onChange={(e) => setSparkForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                Active
              </label>
            </div>
            <label className="field-stack">
              Spark Prompt Text
              <textarea
                rows={3}
                value={sparkForm.text}
                onChange={(e) => setSparkForm((f) => ({ ...f, text: e.target.value }))}
                placeholder='e.g. "Write the moment a promise breaks, in exactly 100 words."'
                required
              />
            </label>
            <div className="form-actions" style={{ marginTop: 12, display: 'flex', gap: 10 }}>
              {editingSparkId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingSparkId(null);
                    setSparkForm(EMPTY_SPARK);
                  }}
                >
                  Cancel edit
                </button>
              )}
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editingSparkId ? 'Update Spark' : 'Save Spark'}
              </button>
            </div>
          </form>

          <div className="config-card">
            <h3>Active Daily Sparks ({sparks.length})</h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Spark Text</th>
                    <th>Words</th>
                    <th>Minutes</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sparks.map((s) => (
                    <tr key={s.id}>
                      <td>{s.order || 1}</td>
                      <td style={{ maxWidth: 400 }}>{s.text}</td>
                      <td>{s.words} words</td>
                      <td>{s.mins} min</td>
                      <td>{s.isActive !== false ? 'Active' : 'Off'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() => {
                            setEditingSparkId(s.id);
                            setSparkForm({
                              text: s.text || '',
                              words: s.words || 100,
                              mins: s.mins || 8,
                              order: s.order || 1,
                              isActive: s.isActive !== false,
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-link danger"
                          onClick={() => handleSparkDelete(s.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* —————————————————————————————————————————————————————————— */}
      {/* TAB 3: CONTESTS                                             */}
      {/* —————————————————————————————————————————————————————————— */}
      {activeTab === 'contests' && (
        <>
          <form className="config-card" onSubmit={handleContestSubmit}>
            <h3>{editingContestId ? 'Edit Writing Contest' : 'Create New Writing Contest'}</h3>
            <div className="form-grid">
              <label>
                Contest Kind
                <select
                  value={contestForm.kind}
                  onChange={(e) => setContestForm((f) => ({ ...f, kind: e.target.value }))}
                >
                  <option value="Daily challenge">Daily challenge</option>
                  <option value="Weekly prompt contest">Weekly prompt contest</option>
                  <option value="Partner contest">Partner contest</option>
                </select>
              </label>
              <label>
                Title
                <input
                  value={contestForm.title}
                  onChange={(e) => setContestForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. The 100-Word Door"
                  required
                />
              </label>
              <label>
                Word Limit
                <input
                  type="number"
                  value={contestForm.words}
                  onChange={(e) => setContestForm((f) => ({ ...f, words: Number(e.target.value) || 100 }))}
                  required
                />
              </label>
              <label>
                Time Left Display
                <input
                  value={contestForm.left}
                  onChange={(e) => setContestForm((f) => ({ ...f, left: e.target.value }))}
                  placeholder="e.g. Ends tonight, 2 days left"
                />
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={contestForm.sponsored}
                  onChange={(e) => setContestForm((f) => ({ ...f, sponsored: e.target.checked }))}
                />
                Sponsored Contest
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={contestForm.isActive}
                  onChange={(e) => setContestForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                Active
              </label>
            </div>
            <label className="field-stack">
              The Brief
              <textarea
                rows={2}
                value={contestForm.brief}
                onChange={(e) => setContestForm((f) => ({ ...f, brief: e.target.value }))}
                placeholder="Contest instructions and prompt brief"
                required
              />
            </label>
            <div className="form-grid" style={{ marginTop: 10 }}>
              <label>
                Prize Details
                <input
                  value={contestForm.prize}
                  onChange={(e) => setContestForm((f) => ({ ...f, prize: e.target.value }))}
                  placeholder="e.g. XP and featured badge"
                />
              </label>
              <label>
                Dates / Schedule
                <input
                  value={contestForm.dates}
                  onChange={(e) => setContestForm((f) => ({ ...f, dates: e.target.value }))}
                  placeholder="e.g. Opens Monday, closes Sunday 11:59 PM"
                />
              </label>
              <label>
                Judging Rubric Summary
                <input
                  value={contestForm.judging}
                  onChange={(e) => setContestForm((f) => ({ ...f, judging: e.target.value }))}
                  placeholder="How it is judged..."
                />
              </label>
            </div>
            <div className="form-actions" style={{ marginTop: 12, display: 'flex', gap: 10 }}>
              {editingContestId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingContestId(null);
                    setContestForm(EMPTY_CONTEST);
                  }}
                >
                  Cancel edit
                </button>
              )}
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editingContestId ? 'Update Contest' : 'Save Contest'}
              </button>
            </div>
          </form>

          <div className="config-card">
            <h3>Live Writing Contests ({contests.length})</h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kind</th>
                    <th>Title</th>
                    <th>Words</th>
                    <th>Deadline</th>
                    <th>Prize</th>
                    <th>Sponsored</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contests.map((c) => (
                    <tr key={c.id}>
                      <td>{c.kind}</td>
                      <td><b>{c.title}</b></td>
                      <td>{c.words} words</td>
                      <td>{c.left}</td>
                      <td>{c.prize}</td>
                      <td>{c.sponsored ? 'Yes' : 'No'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() => {
                            setEditingContestId(c.id);
                            setContestForm({
                              kind: c.kind || 'Daily challenge',
                              title: c.title || '',
                              brief: c.brief || '',
                              words: c.words || 100,
                              left: c.left || '',
                              entries: c.entries || '0 entries',
                              prize: c.prize || '',
                              dates: c.dates || '',
                              judging: c.judging || '',
                              sponsored: Boolean(c.sponsored),
                              order: c.order || 1,
                              isActive: c.isActive !== false,
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-link danger"
                          onClick={() => handleContestDelete(c.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* —————————————————————————————————————————————————————————— */}
      {/* TAB 4: STORY IN MOTION                                      */}
      {/* —————————————————————————————————————————————————————————— */}
      {activeTab === 'motion' && (
        <>
          <form className="config-card" onSubmit={handleMotionSubmit}>
            <h3>{editingMotionId ? 'Edit Motion Episode' : 'Create Motion Episode'}</h3>
            <div className="form-grid">
              <label>
                Genre
                <select
                  value={motionForm.genre}
                  onChange={(e) => setMotionForm((f) => ({ ...f, genre: e.target.value }))}
                >
                  <option value="Romance">Romance</option>
                  <option value="Horror">Horror</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                </select>
              </label>
              <label>
                Episode Title
                <input
                  value={motionForm.title}
                  onChange={(e) => setMotionForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Rain at Platform 9"
                  required
                />
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={motionForm.isActive}
                  onChange={(e) => setMotionForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                Active
              </label>
            </div>

            <h4>Story Segments (3 parts)</h4>
            <div className="field-stack" style={{ gap: 8 }}>
              {[0, 1, 2].map((idx) => (
                <input
                  key={idx}
                  value={motionForm.segments?.[idx] || ''}
                  onChange={(e) => {
                    const segs = [...(motionForm.segments || ['', '', ''])];
                    segs[idx] = e.target.value;
                    setMotionForm((f) => ({ ...f, segments: segs }));
                  }}
                  placeholder={`Segment ${idx + 1} narrative line`}
                  required
                />
              ))}
            </div>

            <h4 style={{ marginTop: 14 }}>Pause Questions (3 prompts)</h4>
            <div className="field-stack" style={{ gap: 8 }}>
              {[0, 1, 2].map((idx) => (
                <input
                  key={idx}
                  value={motionForm.questions?.[idx] || ''}
                  onChange={(e) => {
                    const qs = [...(motionForm.questions || ['', '', ''])];
                    qs[idx] = e.target.value;
                    setMotionForm((f) => ({ ...f, questions: qs }));
                  }}
                  placeholder={`Question ${idx + 1} for writer at pause`}
                  required
                />
              ))}
            </div>

            <div className="form-actions" style={{ marginTop: 14, display: 'flex', gap: 10 }}>
              {editingMotionId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingMotionId(null);
                    setMotionForm(EMPTY_MOTION);
                  }}
                >
                  Cancel edit
                </button>
              )}
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editingMotionId ? 'Update Episode' : 'Save Episode'}
              </button>
            </div>
          </form>

          <div className="config-card">
            <h3>Motion Episodes ({motionList.length})</h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Genre</th>
                    <th>Title</th>
                    <th>Segments</th>
                    <th>Questions</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {motionList.map((m) => (
                    <tr key={m.id}>
                      <td><b>{m.genre}</b></td>
                      <td>{m.title}</td>
                      <td>{m.segments?.length || 3} segments</td>
                      <td>{m.questions?.length || 3} questions</td>
                      <td>{m.isActive !== false ? 'Active' : 'Off'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() => {
                            setEditingMotionId(m.id);
                            setMotionForm({
                              genre: m.genre || 'Romance',
                              title: m.title || '',
                              gradientColors: m.gradientColors || ['#3A2A6B', '#C4577A', '#F3B27A'],
                              segments: m.segments || ['', '', ''],
                              questions: m.questions || ['', '', ''],
                              order: m.order || 1,
                              isActive: m.isActive !== false,
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-link danger"
                          onClick={() => handleMotionDelete(m.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* —————————————————————————————————————————————————————————— */}
      {/* TAB 5: GAMES & LIVE TICKER                                  */}
      {/* —————————————————————————————————————————————————————————— */}
      {activeTab === 'games' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
          {/* Ticker Section */}
          <div className="config-card">
            <h3>Live Marquee Ticker Announcements</h3>
            <p style={{ color: '#909090', fontSize: 13, marginBottom: 12 }}>
              These announcements scroll continuously in the live mobile app ticker bar. Enter one announcement per line.
            </p>
            <textarea
              rows={8}
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value)}
              placeholder="Prompt Duel starts in 02:14&#10;128 writers online&#10;Weekly contest closes in 2d 4h..."
            />
            <div style={{ marginTop: 12 }}>
              <button type="button" className="btn-primary" onClick={handleTickerSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Live Ticker Announcements'}
              </button>
            </div>
          </div>

          {/* Logic Puzzle Summary */}
          <div className="config-card">
            <h3>Active Logic Puzzle</h3>
            <p style={{ color: '#909090', fontSize: 13, marginBottom: 10 }}>
              Title: <b>{gamesData?.logicPuzzle?.title || 'The Missing Manuscript'}</b>
            </p>
            <p style={{ color: '#F0EBE0', fontSize: 13, marginBottom: 10 }}>
              {gamesData?.logicPuzzle?.intro}
            </p>
            <div style={{ background: '#0F0F0F', padding: 12, borderRadius: 8, fontSize: 12.5, color: '#A0A0A0' }}>
              {(gamesData?.logicPuzzle?.clues || []).map((c, i) => (
                <div key={i} style={{ marginBottom: 4 }}>{c}</div>
              ))}
              <div style={{ marginTop: 8, color: '#C9A84C' }}>
                Solution: <b>{gamesData?.logicPuzzle?.solution}</b>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
