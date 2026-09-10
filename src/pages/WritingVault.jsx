import { useEffect, useMemo, useState } from 'react';
import { writingVaultService } from '../services/writingVaultService';
import './AiConfig.css';

const EMPTY_FORM = {
  title: '',
  promptText: '',
  category: 'fire_starters',
  genre: 'Romance',
  tone: 'Dramatic',
  difficulty: 'intermediate',
  isActive: true,
};

export default function WritingVault() {
  const [prompts, setPrompts] = useState([]);
  const [meta, setMeta] = useState({ categories: [], genres: [], tones: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await writingVaultService.list({
        category: filterCategory || undefined,
        status: filterStatus || undefined,
      });
      setPrompts(res.data?.data || []);
      if (res.data?.meta) setMeta(res.data.meta);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory, filterStatus]);

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

  const toneOptions = meta.tones?.length
    ? meta.tones.filter((t) => t !== 'Any')
    : ['Dark', 'Emotional', 'Romantic', 'Suspenseful', 'Humorous', 'Dramatic'];

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      promptText: item.promptText || '',
      category: item.category || 'fire_starters',
      genre: item.genre || 'Romance',
      tone: item.tone || 'Dramatic',
      difficulty: item.difficulty || 'intermediate',
      isActive: item.isActive !== false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      if (editingId) {
        await writingVaultService.update(editingId, form);
        setMessage('Prompt updated.');
      } else {
        await writingVaultService.create(form);
        setMessage('Prompt created.');
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this prompt?')) return;
    try {
      await writingVaultService.remove(id);
      setMessage('Prompt deleted.');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  };

  const handleSeed = async () => {
    if (!window.confirm('Seed default prompt library? Only works if the collection is empty.')) return;
    try {
      const res = await writingVaultService.seed();
      setMessage(res.data?.message || `Seeded ${res.data?.seeded || 0} prompts.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Seed failed');
    }
  };

  return (
    <div className="ai-config-page">
      <div className="page-header">
        <div>
          <h2>Writing Vault</h2>
          <p>Manage curated prompts for Fire Starters, Scene Builders, and Character Voice.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={handleSeed}>
          Seed defaults
        </button>
      </div>

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      <form className="config-card" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit prompt' : 'Add prompt'}</h3>
        <div className="form-grid">
          <label>
            Category
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              required
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
              value={form.genre}
              onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
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
            <select
              value={form.tone}
              onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value }))}
            >
              {toneOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            Difficulty
            <select
              value={form.difficulty}
              onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Optional short title"
            />
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            Published
          </label>
        </div>
        <label className="field-stack">
          Prompt
          <textarea
            rows={4}
            value={form.promptText}
            onChange={(e) => setForm((f) => ({ ...f, promptText: e.target.value }))}
            placeholder='e.g. "The pack had a rule for everything except this..."'
            required
          />
        </label>
        <div className="form-actions">
          {editingId && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancel edit
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Update prompt' : 'Save prompt'}
          </button>
        </div>
      </form>

      <div className="config-card">
        <h3>Library</h3>
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
          <div className="empty-state">No prompts yet. Add one above or click Seed defaults.</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Genre</th>
                  <th>Tone</th>
                  <th>Prompt</th>
                  <th>Uses</th>
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
                    <td>{p.usageCount || 0}</td>
                    <td>{p.isActive ? 'Published' : 'Off'}</td>
                    <td>
                      <button type="button" className="btn-link" onClick={() => startEdit(p)}>
                        Edit
                      </button>
                      <button type="button" className="btn-link danger" onClick={() => handleDelete(p.id)}>
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
    </div>
  );
}
