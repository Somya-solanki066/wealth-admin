import { useEffect, useState } from 'react';
import {
  MdDashboardCustomize,
  MdCloudUpload,
  MdSave,
  MdRefresh,
  MdCheckCircle,
  MdImage,
  MdLock,
  MdVisibility,
  MdSearch,
} from 'react-icons/md';
import api from '../services/api';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';
import './ToolCards.css';

const TABS = [
  { id: 'writer', label: 'Writer World Tools', color: '#D4AF37' },
  { id: 'screenwriter', label: 'Screenwriter World Tools', color: '#E50914' },
  { id: 'student', label: 'Student World Tools', color: '#3B82F6' },
];

export default function ToolCards() {
  const [activeTab, setActiveTab] = useState('writer');
  const [toolsData, setToolsData] = useState({ writer: [], screenwriter: [], student: [] });
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCardId, setActiveCardId] = useState(null);

  const fetchToolCards = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tool-cards');
      if (res.data?.success && res.data?.data) {
        setToolsData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load tool cards', err);
      showMessage('Failed to load tool cards', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToolCards();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleFieldChange = (world, toolId, field, value) => {
    setToolsData((prev) => {
      const list = prev[world] || [];
      const updated = list.map((item) => {
        if (item.toolId === toolId) {
          return { ...item, [field]: value };
        }
        return item;
      });
      return { ...prev, [world]: updated };
    });
  };

  const handleSaveCard = async (world, tool) => {
    setSavingId(tool.toolId);
    try {
      const res = await api.post('/tool-cards', {
        world,
        toolId: tool.toolId,
        title: tool.title,
        description: tool.description,
        badge: tool.badge,
        imageUrl: tool.imageUrl,
        gradientTheme: tool.gradientTheme,
        enabled: tool.enabled,
      });
      if (res.data?.success) {
        showMessage(`Saved "${tool.title}" successfully!`);
      } else {
        showMessage(res.data?.error || 'Failed to save card', 'error');
      }
    } catch (err) {
      console.error('Failed to save card', err);
      showMessage('Failed to save card configuration', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleImageUpload = async (world, toolId, file) => {
    if (!file) return;
    setUploadingId(toolId);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/tool-cards/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data?.url) {
        handleFieldChange(world, toolId, 'imageUrl', res.data.url);
        showMessage('Image uploaded! Click Save to apply changes.');
      } else {
        showMessage(res.data?.error || 'Failed to upload image', 'error');
      }
    } catch (err) {
      console.error('Error uploading image', err);
      showMessage('Error uploading image', 'error');
    } finally {
      setUploadingId(null);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Are you sure you want to reset ALL tool cards across all worlds to default seeds? Custom images and descriptions will be reset.')) {
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/tool-cards/reset');
      if (res.data?.success) {
        showMessage('All tool cards reset to default seeds!');
        await fetchToolCards();
      } else {
        showMessage(res.data?.error || 'Failed to reset', 'error');
      }
    } catch (err) {
      console.error('Error resetting', err);
      showMessage('Error resetting cards', 'error');
    } finally {
      setLoading(false);
    }
  };

  const currentTools = toolsData[activeTab] || [];
  const filteredTools = currentTools.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.toolId && t.toolId.toLowerCase().includes(q))
    );
  });

  const activeColor = TABS.find((t) => t.id === activeTab)?.color || '#D4AF37';

  return (
    <div className="tool-cards-page">
      <header className="tool-cards-header">
        <div className="tool-cards-header-title">
          <div className="tool-cards-header-icon" style={{ borderColor: activeColor }}>
            <MdDashboardCustomize size={26} color={activeColor} />
          </div>
          <div>
            <h1>Tool Cards Manager</h1>
            <p>Customize the glassmorphic background images, titles, and styles for all tools across Writer, Screenwriter, and Student worlds.</p>
          </div>
        </div>

        <div className="tool-cards-header-actions">
          <button className="btn-secondary" onClick={handleResetDefaults} title="Reset all cards to defaults">
            <MdRefresh size={18} /> Reset Defaults
          </button>
        </div>
      </header>

      {message.text && (
        <div className={`tool-cards-alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="tool-cards-tabs">
        {TABS.map((tab) => {
          const count = (toolsData[tab.id] || []).length;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`tool-tab-btn ${isActive ? 'active' : ''}`}
              style={isActive ? { borderBottomColor: tab.color, color: '#fff' } : {}}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery('');
              }}
            >
              <span className="tool-tab-indicator" style={{ backgroundColor: tab.color }} />
              {tab.label}
              <span className="tool-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar / Search */}
      <div className="tool-cards-toolbar">
        <div className="tool-search-box">
          <MdSearch size={20} color="#888" />
          <input
            type="text"
            placeholder={`Search ${TABS.find((t) => t.id === activeTab)?.label}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="tool-cards-stats">
          Showing {filteredTools.length} of {currentTools.length} tools
        </div>
      </div>

      {loading ? (
        <div className="tool-cards-loading">
          <div className="spinner" />
          <p>Loading tool cards configuration...</p>
        </div>
      ) : (
        <div className="tool-cards-grid">
          {filteredTools.map((tool) => {
            const isSaving = savingId === tool.toolId;
            const isUploading = uploadingId === tool.toolId;
            const imageUrl = tool.imageUrl ? resolveMediaUrl(tool.imageUrl) : '';

            return (
              <div key={tool.toolId} className="tool-card-editor-card">
                {/* Live Glassmorphic Preview */}
                <div className="tool-card-preview-container">
                  <div className="tool-card-preview-label">Live App Preview</div>
                  <div
                    className="tool-card-preview"
                    style={{
                      borderColor: activeColor + '88',
                      boxShadow: `0 4px 20px -2px ${activeColor}33`,
                    }}
                  >
                    {/* Background image */}
                    {imageUrl ? (
                      <img src={imageUrl} alt={tool.title} className="preview-bg-img" />
                    ) : (
                      <div className="preview-bg-placeholder" style={{ background: `linear-gradient(135deg, ${activeColor}22, #0d0f14)` }} />
                    )}

                    {/* Glassmorphic Gradient Overlay */}
                    <div className="preview-glass-overlay" />

                    {/* Top-Left Glowing Icon Badge */}
                    <div className="preview-icon-badge" style={{ borderColor: activeColor, boxShadow: `0 0 12px ${activeColor}66` }}>
                      <span className="preview-icon-dot" style={{ backgroundColor: activeColor }} />
                      <MdImage size={18} color="#fff" />
                    </div>

                    {/* Top-Right Tag/Badge */}
                    {tool.badge && (
                      <div className="preview-pill-badge" style={{ backgroundColor: activeColor + '33', color: activeColor, borderColor: activeColor + '66' }}>
                        {tool.badge}
                      </div>
                    )}

                    {/* Content Area */}
                    <div className="preview-content">
                      <h4 className="preview-title">{tool.title || 'Untitled Tool'}</h4>
                      <p className="preview-desc">{tool.description || 'No description provided.'}</p>
                      <div className="preview-action-pill" style={{ borderColor: activeColor + '66', color: '#fff' }}>
                        Try Now →
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                <div className="tool-card-form">
                  <div className="form-group-row">
                    <div className="form-group" style={{ flex: 2 }}>
                      <label>Tool Title</label>
                      <input
                        type="text"
                        value={tool.title || ''}
                        onChange={(e) => handleFieldChange(activeTab, tool.toolId, 'title', e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Badge (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. PRO, NEW"
                        value={tool.badge || ''}
                        onChange={(e) => handleFieldChange(activeTab, tool.toolId, 'badge', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      rows={2}
                      value={tool.description || ''}
                      onChange={(e) => handleFieldChange(activeTab, tool.toolId, 'description', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Background Image URL / Upload</label>
                    <div className="image-input-group">
                      <input
                        type="text"
                        placeholder="https://... or /uploads/tool-cards/..."
                        value={tool.imageUrl || ''}
                        onChange={(e) => handleFieldChange(activeTab, tool.toolId, 'imageUrl', e.target.value)}
                      />
                      <label className={`btn-upload ${isUploading ? 'uploading' : ''}`}>
                        <MdCloudUpload size={18} />
                        {isUploading ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          disabled={isUploading}
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(activeTab, tool.toolId, e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <span className="form-tip">Recommended: 800×600 or 16:9 ratio high-contrast cinematic photo.</span>
                  </div>

                  <div className="form-footer">
                    <span className="tool-id-badge">ID: {tool.toolId}</span>
                    <button
                      className="btn-save-card"
                      style={{ backgroundColor: activeColor, color: '#000' }}
                      disabled={isSaving}
                      onClick={() => handleSaveCard(activeTab, tool)}
                    >
                      <MdSave size={18} />
                      {isSaving ? 'Saving...' : 'Save Card'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
