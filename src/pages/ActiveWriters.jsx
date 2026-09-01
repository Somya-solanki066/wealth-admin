import { useEffect, useState } from 'react';
import { PenLine, RefreshCw } from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import './AdminDataPages.css';

function formatDate(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
}

export default function ActiveWriters() {
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await adminDataService.getActiveWriters();
      setWriters(response.data || []);
    } catch (error) {
      console.error('Failed to load active writers:', error);
      setWriters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="admin-data-page">
      <div className="page-header">
        <div>
          <h2>
            <PenLine size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Active Writers (7 days)
          </h2>
          <p className="page-subtitle">Writers who wrote or used AI this week, and what they are writing</p>
        </div>
        <button type="button" className="refresh-btn" onClick={load} disabled={loading}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="empty-state">Loading active writers...</div>
      ) : writers.length === 0 ? (
        <div className="empty-state">No active writers in the last 7 days.</div>
      ) : (
        <div className="writer-grid">
          {writers.map((writer) => (
            <div key={writer.id} className="writer-card">
              <div className="writer-top">
                <div>
                  <h3>{writer.name}</h3>
                  <p className="muted">{writer.email}</p>
                </div>
                <span className={`activity-badge activity-${writer.activityType}`}>
                  {writer.activityType === 'writing-ai'
                    ? 'writing + ai'
                    : writer.activityType}
                </span>
              </div>

              <div className="stats-row compact">
                <div><span>Streak</span><strong>{writer.writingStreak || 0}</strong></div>
                <div><span>Words written</span><strong>{Number(writer.totalWordsWritten || 0).toLocaleString()}</strong></div>
                <div><span>Analyzer</span><strong>{writer.aiAnalyzerCount || 0}</strong></div>
                <div><span>Smart Edit</span><strong>{writer.smartEditCount || 0}</strong></div>
              </div>

              <div className="meta-lines">
                <div><span>Last write</span><strong>{formatDate(writer.lastWriteDate)}</strong></div>
                <div><span>Last AI use</span><strong>{formatDate(writer.lastAiUsed)}</strong></div>
              </div>

              <div className="current-project">
                <h4>Currently writing</h4>
                {writer.currentProject ? (
                  <div className="project-chip">
                    <strong>{writer.currentProject.name}</strong>
                    <span>
                      {writer.currentProject.type} · {Number(writer.currentProject.wordCount || 0).toLocaleString()} words ·{' '}
                      {writer.currentProject.chapterCount || 0} chapters
                    </span>
                    <span className="muted">Updated {formatDate(writer.currentProject.updatedAt)}</span>
                  </div>
                ) : (
                  <p className="muted">No project yet — AI activity only.</p>
                )}
              </div>

              {(writer.projects || []).length > 1 && (
                <div className="other-projects">
                  <h4>Other projects</h4>
                  <ul>
                    {writer.projects.slice(1, 4).map((p) => (
                      <li key={p.id}>
                        {p.name} <span className="muted">({p.type})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
