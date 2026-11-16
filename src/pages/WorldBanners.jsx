import { useEffect, useMemo, useState } from 'react';
import {
  MdViewCarousel,
  MdAdd,
  MdDelete,
  MdCloudUpload,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
  MdSave,
} from 'react-icons/md';
import api from '../services/api';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';
import './WorldBanners.css';

const TABS = [
  { id: 'writer', label: 'Writer' },
  { id: 'screenwriter', label: 'Script' },
  { id: 'student', label: 'Student' },
  { id: 'all', label: 'All worlds' },
];

const EMPTY = {
  id: '',
  world: 'writer',
  kind: 'identity',
  title: '',
  description: '',
  ctaLabel: '',
  ctaHref: '',
  imageUrl: '',
  sortOrder: 1,
  enabled: true,
  isUrgent: false,
  startsAt: '',
  endsAt: '',
};

function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

export default function WorldBanners() {
  const [tab, setTab] = useState('writer');
  const [banners, setBanners] = useState([]);
  const [settings, setSettings] = useState({ autoPlay: true, intervalMs: 5500 });
  const [form, setForm] = useState({ ...EMPTY, world: 'writer' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/world-banners/admin');
      setBanners(res.data?.data?.banners || []);
      setSettings(res.data?.data?.settings || { autoPlay: true, intervalMs: 5500 });
    } catch (err) {
      console.error(err);
      showMessage(err.response?.data?.error || 'Failed to load banners.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(
    () => banners.filter((item) => item.world === tab).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    [banners, tab]
  );

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const startNew = () => {
    setForm({
      ...EMPTY,
      world: tab,
      sortOrder: visible.length + 1,
    });
  };

  const selectBanner = (item) => {
    setForm({
      ...EMPTY,
      ...item,
      startsAt: item.startsAt || '',
      endsAt: item.endsAt || '',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        startsAt: form.startsAt,
        endsAt: form.endsAt,
        world: form.world || tab,
      };
      if (form.id) {
        const res = await api.put(`/world-banners/${form.id}`, payload);
        const saved = res.data?.data;
        setBanners((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
        setForm(saved);
      } else {
        const res = await api.post('/world-banners', payload);
        const saved = res.data?.data;
        setBanners((prev) => [...prev, saved]);
        setForm(saved);
      }
      showMessage('Banner saved.');
    } catch (err) {
      console.error(err);
      showMessage(err.response?.data?.error || 'Failed to save banner.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id || !window.confirm('Delete this banner?')) return;
    try {
      await api.delete(`/world-banners/${id}`);
      setBanners((prev) => prev.filter((item) => item.id !== id));
      if (form.id === id) startNew();
      showMessage('Banner deleted.');
    } catch (err) {
      showMessage(err.response?.data?.error || 'Failed to delete.', 'error');
    }
  };

  const move = async (id, dir) => {
    const list = [...visible];
    const index = list.findIndex((item) => item.id === id);
    const next = index + dir;
    if (index < 0 || next < 0 || next >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(next, 0, item);
    const ids = list.map((row) => row.id);
    try {
      const res = await api.post('/world-banners/reorder', { ids });
      const updated = res.data?.data?.banners;
      if (updated) setBanners(updated);
      else await load();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Reorder failed.', 'error');
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await api.post('/world-banners/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.url || '';
      if (url) updateForm('imageUrl', url);
      showMessage('Image uploaded. Save the banner to keep it.');
    } catch (err) {
      showMessage(err.response?.data?.error || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const saveSettings = async () => {
    try {
      const res = await api.put('/world-banners/settings', settings);
      setSettings(res.data?.data || settings);
      showMessage('Carousel settings saved.');
    } catch (err) {
      showMessage(err.response?.data?.error || 'Failed to save settings.', 'error');
    }
  };

  return (
    <div className="wb-page">
      <div className="wb-header">
        <div>
          <h2>
            <MdViewCarousel className="wb-header-icon" /> World banners
          </h2>
          <p>
            6–8 rotating hero slides per world. Identity photos stay live; add contests, collabs, and
            sponsored posts into the same rotation.
          </p>
        </div>
        <button type="button" className="wb-btn gold sm" onClick={startNew}>
          <MdAdd /> New banner
        </button>
      </div>

      {message.text ? <div className={`wb-message ${message.type}`}>{message.text}</div> : null}

      <div className="wb-settings">
        <label className="wb-check">
          <input
            type="checkbox"
            checked={settings.autoPlay !== false}
            onChange={(e) => setSettings((s) => ({ ...s, autoPlay: e.target.checked }))}
          />
          Auto-rotate
        </label>
        <label>
          Interval (seconds)
          <input
            type="number"
            min="2"
            max="30"
            value={Math.round((settings.intervalMs || 5500) / 1000)}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                intervalMs: Math.max(2, Number(e.target.value) || 5) * 1000,
              }))
            }
          />
        </label>
        <button type="button" className="wb-btn" onClick={saveSettings}>
          Save settings
        </button>
      </div>

      <div className="wb-tabs">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`wb-tab ${tab === item.id ? 'on' : ''} ${item.id}`}
            onClick={() => {
              setTab(item.id);
              setForm((prev) => ({ ...prev, world: item.id, id: '' }));
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="wb-loading">Loading banners…</div>
      ) : (
        <div className="wb-layout">
          <div className="wb-list">
            {visible.length === 0 ? (
              <p className="wb-empty">No banners in this tab yet.</p>
            ) : (
              visible.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`wb-card ${form.id === item.id ? 'on' : ''}`}
                  onClick={() => selectBanner(item)}
                >
                  <img src={resolveMediaUrl(item.imageUrl)} alt="" />
                  <div className="wb-card-body">
                    <strong>{item.title || 'Untitled'}</strong>
                    <span>
                      {item.kind}
                      {item.isUrgent ? ' · urgent' : ''}
                      {!item.enabled ? ' · off' : ''}
                    </span>
                  </div>
                  <div className="wb-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button type="button" disabled={index === 0} onClick={() => move(item.id, -1)}>
                      <MdKeyboardArrowUp />
                    </button>
                    <button
                      type="button"
                      disabled={index === visible.length - 1}
                      onClick={() => move(item.id, 1)}
                    >
                      <MdKeyboardArrowDown />
                    </button>
                    <button type="button" className="danger" onClick={() => handleDelete(item.id)}>
                      <MdDelete />
                    </button>
                  </div>
                </button>
              ))
            )}
          </div>

          <form
            className="wb-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <h3>{form.id ? 'Edit banner' : 'New banner'}</h3>
            <div className="wb-preview">
              {form.imageUrl ? (
                <img src={resolveMediaUrl(form.imageUrl)} alt="" />
              ) : (
                <div className="wb-preview-empty">No image</div>
              )}
            </div>
            <label className="wb-upload">
              <MdCloudUpload /> {uploading ? 'Uploading…' : 'Upload / replace image'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} hidden />
            </label>
            <label>
              Heading
              <input value={form.title} onChange={(e) => updateForm('title', e.target.value)} />
            </label>
            <label>
              Description
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
              />
            </label>
            <div className="wb-row">
              <label>
                CTA label
                <input value={form.ctaLabel} onChange={(e) => updateForm('ctaLabel', e.target.value)} />
              </label>
              <label>
                CTA link
                <input
                  value={form.ctaHref}
                  onChange={(e) => updateForm('ctaHref', e.target.value)}
                  placeholder="/dashboard?tab=writer or https://…"
                />
              </label>
            </div>
            <div className="wb-row">
              <label>
                World
                <select value={form.world} onChange={(e) => updateForm('world', e.target.value)}>
                  {TABS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Kind
                <select value={form.kind} onChange={(e) => updateForm('kind', e.target.value)}>
                  <option value="identity">Identity</option>
                  <option value="announcement">Announcement</option>
                  <option value="promo">Promo</option>
                  <option value="sponsored">Sponsored</option>
                </select>
              </label>
            </div>
            <div className="wb-row">
              <label>
                Starts
                <input
                  type="datetime-local"
                  value={toLocalInput(form.startsAt)}
                  onChange={(e) => updateForm('startsAt', fromLocalInput(e.target.value))}
                />
              </label>
              <label>
                Expires
                <input
                  type="datetime-local"
                  value={toLocalInput(form.endsAt)}
                  onChange={(e) => updateForm('endsAt', fromLocalInput(e.target.value))}
                />
              </label>
            </div>
            <div className="wb-checks">
              <label className="wb-check">
                <input
                  type="checkbox"
                  checked={form.enabled !== false}
                  onChange={(e) => updateForm('enabled', e.target.checked)}
                />
                Enabled
              </label>
              <label className="wb-check">
                <input
                  type="checkbox"
                  checked={form.isUrgent === true}
                  onChange={(e) => updateForm('isUrgent', e.target.checked)}
                />
                Urgent (pin first)
              </label>
            </div>
            <button type="submit" className="wb-btn gold" disabled={saving}>
              <MdSave /> {saving ? 'Saving…' : 'Save banner'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
