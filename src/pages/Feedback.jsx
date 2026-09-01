import { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw } from 'lucide-react';
import { feedbackService } from '../services/feedbackService';
import './Feedback.css';

const TABS = [
  { id: 'chapter-analyzer', label: 'Chapter Analyzer' },
  { id: 'smart-edit', label: 'Smart Edit Suite' },
];

const RATING_LABELS = {
  yes: 'Working well',
  partial: 'Partially working',
  no: 'Not working',
};

function formatDate(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
}

function formatContext(context) {
  if (!context || typeof context !== 'object') return [];
  return Object.entries(context).filter(([, value]) => String(value || '').trim());
}

function FeedbackSection({ tool, title, description }) {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ total: 0, yes: 0, partial: 0, no: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const response = await feedbackService.getFeedback(tool);
      setItems(response.data || []);
      setSummary(response.summary || { total: 0, yes: 0, partial: 0, no: 0 });
    } catch (error) {
      console.error('Failed to load feedback:', error);
      setItems([]);
      setSummary({ total: 0, yes: 0, partial: 0, no: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [tool]);

  return (
    <div className="feedback-section">
      <div className="feedback-section-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <button type="button" className="refresh-btn" onClick={loadFeedback} disabled={loading}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="feedback-stats">
        <div className="stat-card">
          <span className="stat-label">Total</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="stat-card stat-yes">
          <span className="stat-label">Working well</span>
          <strong>{summary.yes}</strong>
        </div>
        <div className="stat-card stat-partial">
          <span className="stat-label">Partially working</span>
          <strong>{summary.partial}</strong>
        </div>
        <div className="stat-card stat-no">
          <span className="stat-label">Not working</span>
          <strong>{summary.no}</strong>
        </div>
      </div>

      {loading ? (
        <div className="feedback-empty">Loading feedback...</div>
      ) : items.length === 0 ? (
        <div className="feedback-empty">No feedback submitted yet for this tool.</div>
      ) : (
        <div className="feedback-list">
          {items.map((item) => {
            const contextEntries = formatContext(item.context);
            const isExpanded = expandedId === item.id;

            return (
              <div key={item.id} className="feedback-card">
                <div className="feedback-card-top">
                  <div className="feedback-user">
                    <strong>{item.userEmail || 'Unknown user'}</strong>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  <span className={`rating-badge rating-${item.rating}`}>
                    {RATING_LABELS[item.rating] || item.rating}
                  </span>
                </div>

                <p className="feedback-message">{item.message}</p>

                {contextEntries.length > 0 && (
                  <button
                    type="button"
                    className="context-toggle"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    {isExpanded ? 'Hide context' : 'Show context'}
                  </button>
                )}

                {isExpanded && contextEntries.length > 0 && (
                  <div className="feedback-context">
                    {contextEntries.map(([key, value]) => (
                      <div key={key} className="context-row">
                        <span>{key}</span>
                        <strong>{String(value)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Feedback() {
  const [activeTab, setActiveTab] = useState('chapter-analyzer');

  return (
    <div className="feedback-page">
      <div className="page-header">
        <div>
          <h2>
            <MessageSquare size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            AI Tool Feedback
          </h2>
          <p className="page-subtitle">
            Review user feedback for Chapter Analyzer and Smart Edit Suite separately.
          </p>
        </div>
      </div>

      <div className="feedback-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`feedback-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'chapter-analyzer' && (
        <FeedbackSection
          tool="chapter-analyzer"
          title="Chapter Analyzer Feedback"
          description="User reports about analyzer accuracy, errors, and platform-specific issues."
        />
      )}

      {activeTab === 'smart-edit' && (
        <FeedbackSection
          tool="smart-edit"
          title="Smart Edit Suite Feedback"
          description="User reports about grammar checks, scoring quality, and edit suggestions."
        />
      )}
    </div>
  );
}

export default Feedback;
