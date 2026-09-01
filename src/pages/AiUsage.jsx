import { useEffect, useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import './AdminDataPages.css';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'chapter-analyzer', label: 'Chapter Analyzer' },
  { id: 'smart-edit', label: 'Smart Edit' },
];

function formatDate(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
}

export default function AiUsage() {
  const [tab, setTab] = useState('all');
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    analyzerCalls: 0,
    smartEditCalls: 0,
    totalTokens: 0,
    totalWords: 0,
    loggedCalls: 0,
  });
  const [loading, setLoading] = useState(true);

  const load = async (toolTab = tab) => {
    setLoading(true);
    try {
      const tool = toolTab === 'all' ? undefined : toolTab;
      const response = await adminDataService.getAiUsage(tool);
      setUsers(response.data?.users || []);
      setLogs(response.data?.logs || []);
      setSummary(response.summary || {});
    } catch (error) {
      console.error('Failed to load AI usage:', error);
      setUsers([]);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(tab);
  }, [tab]);

  return (
    <div className="admin-data-page">
      <div className="page-header">
        <div>
          <h2>
            <Sparkles size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            AI Usage
          </h2>
          <p className="page-subtitle">
            Per-user AI calls, tokens, words analyzed, novels/chapters, and Smart Edit details
          </p>
        </div>
        <button type="button" className="refresh-btn" onClick={() => load(tab)} disabled={loading}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="stats-row">
        <div><span>Users with AI use</span><strong>{summary.totalUsers || 0}</strong></div>
        <div><span>Analyzer calls</span><strong>{summary.analyzerCalls || 0}</strong></div>
        <div><span>Smart Edit calls</span><strong>{summary.smartEditCalls || 0}</strong></div>
        <div><span>Total tokens</span><strong>{Number(summary.totalTokens || 0).toLocaleString()}</strong></div>
        <div><span>Words analyzed</span><strong>{Number(summary.totalWords || 0).toLocaleString()}</strong></div>
      </div>

      <div className="feedback-tabs" style={{ marginBottom: 20 }}>
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`feedback-tab ${tab === item.id ? 'active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">Loading AI usage...</div>
      ) : (
        <>
          <h3 className="section-title">Users</h3>
          {users.length === 0 ? (
            <div className="empty-state">No AI usage recorded yet.</div>
          ) : (
            <div className="table-wrap" style={{ marginBottom: 28 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Analyzer</th>
                    <th>Smart Edit</th>
                    <th>Total calls</th>
                    <th>Tokens</th>
                    <th>Words</th>
                    <th>Last used</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.userId}>
                      <td>
                        <strong>{user.userName}</strong>
                        <div className="muted">{user.userEmail}</div>
                      </td>
                      <td>{user.aiAnalyzerCount}</td>
                      <td>{user.smartEditCount}</td>
                      <td>{user.totalCalls}</td>
                      <td>{Number(user.totalTokensUsed || 0).toLocaleString()}</td>
                      <td>{Number(user.totalWordsAnalyzed || 0).toLocaleString()}</td>
                      <td>
                        <div>{formatDate(user.lastUsed)}</div>
                        <div className="muted">{user.lastTool || '—'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3 className="section-title">Call history ({summary.loggedCalls || logs.length})</h3>
          {logs.length === 0 ? (
            <div className="empty-state">
              No detailed call logs yet. New Analyzer / Smart Edit runs will appear here with chapter, novel, tokens, and words.
            </div>
          ) : (
            <div className="log-list">
              {logs.map((log) => (
                <div key={log.id} className="log-card">
                  <div className="log-top">
                    <div>
                      <strong>{log.userName}</strong>
                      <div className="muted">{log.userEmail}</div>
                    </div>
                    <span className={`type-badge type-${log.tool === 'chapter-analyzer' ? 'novel' : 'script'}`}>
                      {log.tool === 'chapter-analyzer' ? 'Chapter Analyzer' : 'Smart Edit'}
                    </span>
                  </div>

                  <div className="stats-row compact">
                    <div><span>Words</span><strong>{Number(log.wordsAnalyzed || 0).toLocaleString()}</strong></div>
                    <div><span>Tokens</span><strong>{Number(log.tokensUsed || 0).toLocaleString()}</strong></div>
                    <div><span>Score</span><strong>{log.score ?? '—'}</strong></div>
                    <div><span>When</span><strong>{formatDate(log.createdAt)}</strong></div>
                  </div>

                  {log.tool === 'chapter-analyzer' ? (
                    <div className="meta-lines">
                      <div><span>Novel</span><strong>{log.projectName || '—'}</strong></div>
                      <div><span>Chapter</span><strong>{log.chapterTitle || '—'}</strong></div>
                      <div><span>Platform</span><strong>{log.platform || '—'}</strong></div>
                      <div><span>Genre</span><strong>{log.genre || '—'}</strong></div>
                    </div>
                  ) : (
                    <div className="meta-lines">
                      <div><span>File</span><strong>{log.fileName || 'Pasted text'}</strong></div>
                      <div><span>Model</span><strong>{log.model || '—'}</strong></div>
                      <div><span>Prompt tokens</span><strong>{Number(log.promptTokens || 0).toLocaleString()}</strong></div>
                      <div><span>Completion tokens</span><strong>{Number(log.completionTokens || 0).toLocaleString()}</strong></div>
                    </div>
                  )}

                  {log.inputPreview && (
                    <p className="preview-text">"{log.inputPreview}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
