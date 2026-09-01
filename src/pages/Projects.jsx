import { useEffect, useState } from 'react';
import { FolderKanban, RefreshCw, Eye } from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import './AdminDataPages.css';

function formatDate(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const response = await adminDataService.getProjects();
      setProjects(response.data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openDetail = async (projectId) => {
    setDetailLoading(true);
    try {
      const response = await adminDataService.getProjectById(projectId);
      setSelected(response.data || null);
    } catch (error) {
      console.error('Failed to load project detail:', error);
      alert('Failed to load project details');
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = projects.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      String(p.name || '').toLowerCase().includes(q) ||
      String(p.ownerEmail || '').toLowerCase().includes(q) ||
      String(p.ownerName || '').toLowerCase().includes(q) ||
      String(p.type || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="admin-data-page">
      <div className="page-header">
        <div>
          <h2>
            <FolderKanban size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Projects
          </h2>
          <p className="page-subtitle">All novels and scripts created by users</p>
        </div>
        <button type="button" className="refresh-btn" onClick={load} disabled={loading}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="toolbar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by project, owner, email..."
        />
        <span className="count-pill">{filtered.length} projects</span>
      </div>

      {loading ? (
        <div className="empty-state">Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No projects found.</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Type</th>
                <th>Owner</th>
                <th>Words</th>
                <th>Chapters</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => (
                <tr key={project.id}>
                  <td>
                    <strong>{project.name}</strong>
                    <div className="muted">{project.status}</div>
                  </td>
                  <td>
                    <span className={`type-badge type-${project.type}`}>{project.type}</span>
                  </td>
                  <td>
                    <div>{project.ownerName}</div>
                    <div className="muted">{project.ownerEmail}</div>
                  </td>
                  <td>{Number(project.wordCount || 0).toLocaleString()}</td>
                  <td>{project.chapterCount || 0}</td>
                  <td>{formatDate(project.updatedAt)}</td>
                  <td>
                    <button type="button" className="link-btn" onClick={() => openDetail(project.id)}>
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(selected || detailLoading) && (
        <div className="modal-backdrop" onClick={() => !detailLoading && setSelected(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {detailLoading || !selected ? (
              <p>Loading details...</p>
            ) : (
              <>
                <div className="modal-header">
                  <div>
                    <h3>{selected.name}</h3>
                    <p className="muted">
                      {selected.type} · {selected.ownerName} ({selected.ownerEmail})
                    </p>
                  </div>
                  <button type="button" className="link-btn" onClick={() => setSelected(null)}>
                    Close
                  </button>
                </div>
                <div className="stats-row">
                  <div><span>Words</span><strong>{Number(selected.wordCount || 0).toLocaleString()}</strong></div>
                  <div><span>Chapters</span><strong>{selected.chapters?.length || 0}</strong></div>
                  <div><span>Status</span><strong>{selected.status}</strong></div>
                </div>
                <h4>Chapters / Scenes</h4>
                <div className="chapter-list">
                  {(selected.chapters || []).length === 0 ? (
                    <p className="muted">No chapters yet.</p>
                  ) : (
                    selected.chapters.map((chap) => (
                      <div key={chap.id} className="chapter-item">
                        <div className="chapter-top">
                          <strong>{chap.title}</strong>
                          <span>{Number(chap.wordCount || 0).toLocaleString()} words</span>
                        </div>
                        <p>{chap.preview || 'Empty chapter'}</p>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
