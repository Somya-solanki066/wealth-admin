import { useEffect, useMemo, useState } from 'react';
import { MdEmail, MdSave, MdSend, MdArrowBack } from 'react-icons/md';
import api from '../services/api';
import './ContentManager.css';

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testTo, setTestTo] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/email-templates');
      const list = res.data?.templates || [];
      setTemplates(list);
      if (!selectedId && list[0]) {
        setSelectedId(list[0].id);
        setDraft(list[0]);
      } else if (selectedId) {
        const match = list.find((t) => t.id === selectedId);
        if (match) setDraft(match);
      }
    } catch (err) {
      console.error(err);
      showMessage(err.response?.data?.error || 'Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) || null,
    [templates, selectedId]
  );

  const selectTemplate = (id) => {
    const t = templates.find((item) => item.id === id);
    setSelectedId(id);
    setDraft(t ? { ...t } : null);
  };

  const updateDraft = (key, value) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    if (!draft?.id) return;
    setSaving(true);
    try {
      const res = await api.put(`/email-templates/${draft.id}`, {
        subject: draft.subject,
        htmlBody: draft.htmlBody,
        textBody: draft.textBody,
        enabled: draft.enabled,
        name: draft.name,
        description: draft.description,
      });
      const updated = res.data?.template || draft;
      setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setDraft(updated);
      showMessage('Template saved');
    } catch (err) {
      console.error(err);
      showMessage(err.response?.data?.error || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = async () => {
    if (!draft?.id) return;
    setTesting(true);
    try {
      await api.post(`/email-templates/${draft.id}/test-send`, {
        to: testTo || undefined,
      });
      showMessage(`Test email sent${testTo ? ` to ${testTo}` : ''}`);
    } catch (err) {
      console.error(err);
      showMessage(err.response?.data?.error || 'Test send failed', 'error');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="content-manager">
        <p>Loading email templates…</p>
      </div>
    );
  }

  return (
    <div className="content-manager">
      <div className="cm-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <MdEmail size={28} />
        <div>
          <h1 style={{ margin: 0 }}>Email Templates</h1>
          <p style={{ margin: '4px 0 0', opacity: 0.7, fontSize: 14 }}>
            Edit transactional copy. Placeholders use {'{{name}}'} style tokens.
          </p>
        </div>
      </div>

      {message.text ? (
        <div
          className={`cm-message ${message.type === 'error' ? 'error' : 'success'}`}
          style={{ marginTop: 12 }}
        >
          {message.text}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 280px) 1fr',
          gap: 20,
          marginTop: 20,
        }}
      >
        <aside
          style={{
            border: '1px solid #2a2a2a',
            borderRadius: 8,
            padding: 12,
            background: '#121212',
            maxHeight: '75vh',
            overflow: 'auto',
          }}
        >
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTemplate(t.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 12px',
                marginBottom: 8,
                borderRadius: 6,
                border: selectedId === t.id ? '1px solid #C9A84C' : '1px solid #2a2a2a',
                background: selectedId === t.id ? '#1c1a14' : '#161616',
                color: '#f0ebe0',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
              <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                {t.enabled ? 'Enabled' : 'Disabled'} · {t.id}
              </div>
            </button>
          ))}
        </aside>

        <section
          style={{
            border: '1px solid #2a2a2a',
            borderRadius: 8,
            padding: 20,
            background: '#121212',
          }}
        >
          {!draft ? (
            <p>Select a template</p>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ margin: 0 }}>{draft.name}</h2>
                  <p style={{ margin: '6px 0 0', fontSize: 13, opacity: 0.65 }}>{draft.description}</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={!!draft.enabled}
                    onChange={(e) => updateDraft('enabled', e.target.checked)}
                  />
                  Enabled
                </label>
              </div>

              {Array.isArray(draft.placeholders) && draft.placeholders.length > 0 ? (
                <p style={{ marginTop: 14, fontSize: 12, opacity: 0.75 }}>
                  Placeholders:{' '}
                  {draft.placeholders.map((p) => (
                    <code
                      key={p}
                      style={{
                        marginRight: 6,
                        padding: '2px 6px',
                        background: '#1a1a1a',
                        borderRadius: 4,
                      }}
                    >
                      {`{{${p}}}`}
                    </code>
                  ))}
                </p>
              ) : null}

              <label className="cm-label" style={{ display: 'block', marginTop: 16 }}>
                Subject
              </label>
              <input
                className="cm-input"
                value={draft.subject || ''}
                onChange={(e) => updateDraft('subject', e.target.value)}
                style={{ width: '100%' }}
              />

              <label className="cm-label" style={{ display: 'block', marginTop: 14 }}>
                HTML body (inner content — branded layout wraps this)
              </label>
              <textarea
                className="cm-textarea"
                rows={14}
                value={draft.htmlBody || ''}
                onChange={(e) => updateDraft('htmlBody', e.target.value)}
                style={{ width: '100%', fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
              />

              <label className="cm-label" style={{ display: 'block', marginTop: 14 }}>
                Plain text body
              </label>
              <textarea
                className="cm-textarea"
                rows={6}
                value={draft.textBody || ''}
                onChange={(e) => updateDraft('textBody', e.target.value)}
                style={{ width: '100%', fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
              />

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginTop: 18,
                  alignItems: 'center',
                }}
              >
                <button type="button" className="cm-btn primary" onClick={handleSave} disabled={saving}>
                  <MdSave /> {saving ? 'Saving…' : 'Save template'}
                </button>

                <input
                  className="cm-input"
                  placeholder="Test recipient (optional)"
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  style={{ minWidth: 220 }}
                />
                <button
                  type="button"
                  className="cm-btn"
                  onClick={handleTestSend}
                  disabled={testing}
                >
                  <MdSend /> {testing ? 'Sending…' : 'Test send'}
                </button>

                {selected && selectedId !== selected.id ? (
                  <button type="button" className="cm-btn" onClick={() => selectTemplate(selected.id)}>
                    <MdArrowBack /> Reset
                  </button>
                ) : null}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
