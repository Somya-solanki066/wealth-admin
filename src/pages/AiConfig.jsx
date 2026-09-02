import { useEffect, useState } from 'react';
import { catalogService } from '../services/catalogService';
import './AiConfig.css';

const AiConfig = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openaiModel, setOpenaiModel] = useState('gpt-4o-mini');
  const [platforms, setPlatforms] = useState([]);
  const [genres, setGenres] = useState([]);
  const [newPlatformId, setNewPlatformId] = useState('');
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newGenreId, setNewGenreId] = useState('');
  const [newGenreName, setNewGenreName] = useState('');
  const [smartEditPrompt, setSmartEditPrompt] = useState('');
  const [savingSmartEdit, setSavingSmartEdit] = useState(false);
  const [analyzerPlatform, setAnalyzerPlatform] = useState('');
  const [analyzerPrompt, setAnalyzerPrompt] = useState('');
  const [analyzerPlatforms, setAnalyzerPlatforms] = useState([]);
  const [savingAnalyzer, setSavingAnalyzer] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [configRes, smartRes] = await Promise.all([
        catalogService.getAiConfig(),
        catalogService.getSmartEditPrompt(),
      ]);
      const config = configRes.data || {};
      setOpenaiModel(config.openaiModel || 'gpt-4o-mini');
      setPlatforms(config.platforms || []);
      setGenres(config.genres || []);
      setSmartEditPrompt(smartRes.data?.prompt || '');
      const firstPlatform = config.platforms?.[0]?.id || 'GoodNovel';
      setAnalyzerPlatform(firstPlatform);
      await loadAnalyzerPrompt(firstPlatform);
    } catch (error) {
      console.error(error);
      setMessage('Failed to load AI config');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyzerPrompt = async (platform) => {
    if (!platform) return;
    try {
      const response = await catalogService.getAnalyzerPrompt(platform);
      const data = response.data || {};
      setAnalyzerPrompt(data.prompt || '');
      if (Array.isArray(data.platforms) && data.platforms.length) {
        setAnalyzerPlatforms(data.platforms);
      }
    } catch (error) {
      console.error(error);
      setAnalyzerPrompt('');
    }
  };

  const handlePlatformChange = async (value) => {
    setAnalyzerPlatform(value);
    await loadAnalyzerPrompt(value);
  };

  const updateItem = (list, setList, index, patch) => {
    setList(list.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addItem = (list, setList, id, name, clear) => {
    const nextId = id.trim();
    const nextName = name.trim() || nextId;
    if (!nextId) {
      alert('ID is required');
      return;
    }
    if (list.some((item) => item.id === nextId)) {
      alert('That ID already exists');
      return;
    }
    setList([...list, { id: nextId, name: nextName, enabled: true }]);
    clear();
  };

  const saveConfig = async () => {
    setSaving(true);
    setMessage('');
    try {
      await catalogService.saveAiConfig({ openaiModel, platforms, genres });
      setMessage('AI config saved');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to save AI config');
    } finally {
      setSaving(false);
    }
  };

  const saveSmartEdit = async () => {
    setSavingSmartEdit(true);
    setMessage('');
    try {
      await catalogService.saveSmartEditPrompt(smartEditPrompt);
      setMessage('Smart Edit prompt saved');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to save Smart Edit prompt');
    } finally {
      setSavingSmartEdit(false);
    }
  };

  const saveAnalyzer = async () => {
    if (!analyzerPlatform) return;
    setSavingAnalyzer(true);
    setMessage('');
    try {
      await catalogService.saveAnalyzerPrompt(analyzerPlatform, analyzerPrompt);
      setMessage(`Analyzer prompt saved for ${analyzerPlatform}`);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to save analyzer prompt');
    } finally {
      setSavingAnalyzer(false);
    }
  };

  if (loading) {
    return <div className="ai-config-page">Loading AI config...</div>;
  }

  const promptPlatforms = analyzerPlatforms.length
    ? analyzerPlatforms
    : platforms.map((p) => p.id);

  return (
    <div className="ai-config-page">
      <div className="page-header">
        <div>
          <h2>AI Config</h2>
          <p>Manage platforms, genres, the OpenAI model, and the prompts used by Chapter Analyzer and Smart Edit.</p>
        </div>
        <button className="save-btn" onClick={saveConfig} disabled={saving}>
          {saving ? 'Saving...' : 'Save platforms, genres & model'}
        </button>
      </div>
      {message && <div className="status-banner">{message}</div>}

      <section className="config-section">
        <h3>OpenAI model</h3>
        <input
          type="text"
          value={openaiModel}
          onChange={(e) => setOpenaiModel(e.target.value)}
          placeholder="gpt-4o-mini"
        />
      </section>

      <section className="config-section">
        <h3>Platforms</h3>
        <div className="catalog-table-wrap">
        <table className="catalog-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Enabled</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {platforms.map((item, index) => (
              <tr key={item.id}>
                <td><code>{item.id}</code></td>
                <td>
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(platforms, setPlatforms, index, { name: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={item.enabled !== false}
                    onChange={(e) => updateItem(platforms, setPlatforms, index, { enabled: e.target.checked })}
                  />
                </td>
                <td>
                  <button className="danger-btn" onClick={() => setPlatforms(platforms.filter((_, i) => i !== index))}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className="add-row">
          <input placeholder="id" value={newPlatformId} onChange={(e) => setNewPlatformId(e.target.value)} />
          <input placeholder="name" value={newPlatformName} onChange={(e) => setNewPlatformName(e.target.value)} />
          <button onClick={() => addItem(platforms, setPlatforms, newPlatformId, newPlatformName, () => {
            setNewPlatformId('');
            setNewPlatformName('');
          })}>
            Add platform
          </button>
        </div>
      </section>

      <section className="config-section">
        <h3>Genres</h3>
        <div className="catalog-table-wrap">
        <table className="catalog-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Enabled</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {genres.map((item, index) => (
              <tr key={item.id}>
                <td><code>{item.id}</code></td>
                <td>
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(genres, setGenres, index, { name: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={item.enabled !== false}
                    onChange={(e) => updateItem(genres, setGenres, index, { enabled: e.target.checked })}
                  />
                </td>
                <td>
                  <button className="danger-btn" onClick={() => setGenres(genres.filter((_, i) => i !== index))}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className="add-row">
          <input placeholder="id" value={newGenreId} onChange={(e) => setNewGenreId(e.target.value)} />
          <input placeholder="name" value={newGenreName} onChange={(e) => setNewGenreName(e.target.value)} />
          <button onClick={() => addItem(genres, setGenres, newGenreId, newGenreName, () => {
            setNewGenreId('');
            setNewGenreName('');
          })}>
            Add genre
          </button>
        </div>
      </section>

      <section className="config-section">
        <div className="section-head">
          <h3>Smart Edit prompt</h3>
          <button className="save-btn" onClick={saveSmartEdit} disabled={savingSmartEdit}>
            {savingSmartEdit ? 'Saving...' : 'Save Smart Edit prompt'}
          </button>
        </div>
        <textarea
          rows={12}
          value={smartEditPrompt}
          onChange={(e) => setSmartEditPrompt(e.target.value)}
        />
      </section>

      <section className="config-section">
        <div className="section-head">
          <h3>Analyzer prompts</h3>
          <button className="save-btn" onClick={saveAnalyzer} disabled={savingAnalyzer}>
            {savingAnalyzer ? 'Saving...' : 'Save analyzer prompt'}
          </button>
        </div>
        <label className="field-label">
          Platform
          <select value={analyzerPlatform} onChange={(e) => handlePlatformChange(e.target.value)}>
            {promptPlatforms.map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </label>
        <textarea
          rows={18}
          value={analyzerPrompt}
          onChange={(e) => setAnalyzerPrompt(e.target.value)}
        />
      </section>
    </div>
  );
};

export default AiConfig;
