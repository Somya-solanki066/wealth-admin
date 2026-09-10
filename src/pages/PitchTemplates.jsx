import { useEffect, useState } from 'react';
import api from '../services/api';
import './AiConfig.css';

const emptyField = () => ({
  key: '',
  label: '',
  required: true,
  placeholder: '',
  multiline: false,
});

const emptyTemplate = () => ({
  id: `tpl_${Date.now()}`,
  name: '',
  description: '',
  structure: 'Hi [Name],\n\n...',
  fields: [emptyField()],
  generateLabel: 'Generate Pitch',
  active: true,
  sortOrder: 99,
});

export default function PitchTemplates() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState('');

  const selected = templates.find((t) => t.id === selectedId) || null;

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/data/pitch-templates-settings');
      const list = res.data?.data?.templates || [];
      setTemplates(list);
      setSelectedId((prev) => prev || list[0]?.id || '');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateSelected = (patch) => {
    setTemplates((list) =>
      list.map((t) => (t.id === selectedId ? { ...t, ...patch } : t))
    );
  };

  const updateField = (idx, patch) => {
    if (!selected) return;
    const fields = selected.fields.map((f, i) => (i === idx ? { ...f, ...patch } : f));
    updateSelected({ fields });
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await api.put('/data/pitch-templates-settings', { templates });
      setMessage('Templates saved. Active templates appear in the user Pitch Templates tool.');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const addTemplate = () => {
    const t = emptyTemplate();
    setTemplates((list) => [...list, t]);
    setSelectedId(t.id);
  };

  return (
    <div className="ai-config-page">
      <div className="page-header">
        <div>
          <h2>Pitch Templates</h2>
          <p>Content &amp; Freelance — manage outreach templates, fields, and active status.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-secondary" onClick={addTemplate}>
            Add Template
          </button>
          <button type="button" className="btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>
          <div className="config-card" style={{ padding: 12 }}>
            <h3 style={{ marginBottom: 10 }}>Templates</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`tab-chip${selectedId === t.id ? ' active' : ''}`}
                  style={{ textAlign: 'left', width: '100%' }}
                  onClick={() => setSelectedId(t.id)}
                >
                  {t.name || t.id}
                  {!t.active ? ' (off)' : ''}
                </button>
              ))}
            </div>
          </div>

          {selected ? (
            <div className="config-card">
              <div className="section-head">
                <h3>{selected.name || 'Untitled template'}</h3>
                <button
                  type="button"
                  className="btn-link danger"
                  onClick={() => {
                    const next = templates.filter((t) => t.id !== selected.id);
                    setTemplates(next);
                    setSelectedId(next[0]?.id || '');
                  }}
                >
                  Delete
                </button>
              </div>

              <div className="form-grid">
                <label>
                  Template Name
                  <input
                    value={selected.name}
                    onChange={(e) => updateSelected({ name: e.target.value })}
                  />
                </label>
                <label>
                  ID (stable key)
                  <input
                    value={selected.id}
                    onChange={(e) => {
                      const id = e.target.value.trim().replace(/\s+/g, '-');
                      setTemplates((list) =>
                        list.map((t) => (t.id === selectedId ? { ...t, id } : t))
                      );
                      setSelectedId(id);
                    }}
                  />
                </label>
                <label>
                  Generate button label
                  <input
                    value={selected.generateLabel}
                    onChange={(e) => updateSelected({ generateLabel: e.target.value })}
                  />
                </label>
                <label>
                  Sort order
                  <input
                    type="number"
                    value={selected.sortOrder}
                    onChange={(e) => updateSelected({ sortOrder: Number(e.target.value) })}
                  />
                </label>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={!!selected.active}
                    onChange={(e) => updateSelected({ active: e.target.checked })}
                  />
                  Active (visible to users)
                </label>
              </div>

              <label className="field-stack" style={{ display: 'block', marginTop: 16 }}>
                Description
                <input
                  value={selected.description}
                  onChange={(e) => updateSelected({ description: e.target.value })}
                />
              </label>

              <label className="field-stack" style={{ display: 'block', marginTop: 16 }}>
                Template Structure
                <textarea
                  rows={12}
                  value={selected.structure}
                  onChange={(e) => updateSelected({ structure: e.target.value })}
                  placeholder="Use [placeholders] that AI will personalize with user fields"
                />
              </label>

              <div className="section-head" style={{ marginTop: 20 }}>
                <h3>Required / Optional Fields</h3>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    updateSelected({ fields: [...(selected.fields || []), emptyField()] })
                  }
                >
                  Add Field
                </button>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Key</th>
                      <th>Label</th>
                      <th>Required</th>
                      <th>Multiline</th>
                      <th>Placeholder</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.fields || []).map((f, idx) => (
                      <tr key={`${selected.id}_${idx}`}>
                        <td>
                          <input
                            value={f.key}
                            onChange={(e) =>
                              updateField(idx, {
                                key: e.target.value.trim().replace(/\s+/g, ''),
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            value={f.label}
                            onChange={(e) => updateField(idx, { label: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={!!f.required}
                            onChange={(e) => updateField(idx, { required: e.target.checked })}
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={!!f.multiline}
                            onChange={(e) => updateField(idx, { multiline: e.target.checked })}
                          />
                        </td>
                        <td>
                          <input
                            value={f.placeholder || ''}
                            onChange={(e) => updateField(idx, { placeholder: e.target.value })}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-link danger"
                            onClick={() =>
                              updateSelected({
                                fields: selected.fields.filter((_, i) => i !== idx),
                              })
                            }
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="config-card">No template selected.</div>
          )}
        </div>
      )}
    </div>
  );
}
