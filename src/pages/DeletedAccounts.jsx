import { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Search, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Smartphone, 
  Globe, 
  LayoutDashboard,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import './DeletedAccounts.css';

function parseDate(value) {
  if (!value) return null;
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const seconds = value.seconds || value._seconds;
  if (seconds) return new Date(seconds * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return 'N/A';
  return date.toLocaleString();
}

export default function DeletedAccounts() {
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    fetchDeletedAccounts();
  }, []);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  const fetchDeletedAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/deleted-users');
      if (res.data?.success) {
        setDeletedUsers(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch deleted accounts:', err);
      showNotification('Failed to load deleted accounts list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccount = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/users/${selectedUser.id}/revoke-delete`);
      if (res.data?.success) {
        showNotification(
          res.data.message || `Account for ${selectedUser.email} has been restored! The user can now log in.`,
          'success'
        );
        setShowRevokeModal(false);
        setSelectedUser(null);
        await fetchDeletedAccounts();
      } else {
        showNotification(res.data?.error || 'Failed to revoke deletion.', 'error');
      }
    } catch (err) {
      console.error('Revoke error:', err);
      showNotification(err.response?.data?.error || 'Error restoring account.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter accounts
  const filteredUsers = deletedUsers.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSource =
      filterSource === 'all' ||
      (filterSource === 'mobile_app' && (u.deletedSource === 'mobile_app' || u.deletedSource === 'app')) ||
      (filterSource === 'web_dashboard' && u.deletedSource === 'web_dashboard') ||
      (filterSource === 'web_public' && (u.deletedSource === 'web_public' || u.deletedSource?.includes('public')));

    return matchesSearch && matchesSource;
  });

  const countMobile = deletedUsers.filter(
    (u) => u.deletedSource === 'mobile_app' || u.deletedSource === 'app'
  ).length;
  const countDashboard = deletedUsers.filter((u) => u.deletedSource === 'web_dashboard').length;
  const countPublic = deletedUsers.filter(
    (u) => u.deletedSource === 'web_public' || u.deletedSource?.includes('public')
  ).length;

  return (
    <div className="deleted-accounts-page">
      {/* Toast Notification */}
      {toast.message && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle className="icon" /> : <AlertTriangle className="icon" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="title flex items-center gap-2">
            <Trash2 className="text-red-500 w-6 h-6 inline-block" /> Deleted Accounts & Requests
          </h2>
          <p className="subtitle">
            Track user accounts deactivated from the mobile app, web dashboard, or the Google Play compliance deletion page. You can restore (revoke) any account here with one click.
          </p>
        </div>
        <button
          onClick={fetchDeletedAccounts}
          className="refresh-btn"
          disabled={loading}
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card total">
          <div className="stat-label">Total Deleted Accounts</div>
          <div className="stat-value">{deletedUsers.length}</div>
          <div className="stat-footer">Access disabled & logged out</div>
        </div>
        <div className="stat-card mobile">
          <div className="stat-label flex items-center gap-1.5">
            <Smartphone className="w-4 h-4" /> Mobile App
          </div>
          <div className="stat-value">{countMobile}</div>
          <div className="stat-footer">Via Android / iOS Profile</div>
        </div>
        <div className="stat-card dashboard">
          <div className="stat-label flex items-center gap-1.5">
            <LayoutDashboard className="w-4 h-4" /> Web Dashboard
          </div>
          <div className="stat-value">{countDashboard}</div>
          <div className="stat-footer">Via Web Profile Settings</div>
        </div>
        <div className="stat-card public">
          <div className="stat-label flex items-center gap-1.5">
            <Globe className="w-4 h-4" /> Play Console Public
          </div>
          <div className="stat-value">{countPublic}</div>
          <div className="stat-footer">Via /delete-account URL</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by email, name, or UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-select-wrap">
          <label>Source:</label>
          <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
            <option value="all">All Sources ({deletedUsers.length})</option>
            <option value="mobile_app">Mobile App ({countMobile})</option>
            <option value="web_dashboard">Web Dashboard ({countDashboard})</option>
            <option value="web_public">Public Web Form ({countPublic})</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading deleted accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <ShieldAlert className="w-12 h-12 text-zinc-600 mb-2" />
            <h3>No Deleted Accounts Found</h3>
            <p className="text-xs text-zinc-500">
              {searchQuery || filterSource !== 'all'
                ? 'No records match your filter criteria.'
                : 'There are currently no deleted or deactivated user accounts.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Deletion Date</th>
                  <th>Source</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const source = u.deletedSource || 'mobile_app';
                  let sourceBadge = { label: 'Mobile App', cls: 'badge-mobile' };
                  if (source === 'web_dashboard') {
                    sourceBadge = { label: 'Web Dashboard', cls: 'badge-dashboard' };
                  } else if (source === 'web_public' || source.includes('public')) {
                    sourceBadge = { label: 'Public Web', cls: 'badge-public' };
                  } else if (source === 'admin_panel') {
                    sourceBadge = { label: 'Admin Panel', cls: 'badge-admin' };
                  }

                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {u.photoURL ? (
                              <img src={u.photoURL} alt={u.name} />
                            ) : (
                              <span>{(u.name || 'U')[0].toUpperCase()}</span>
                            )}
                          </div>
                          <div className="user-meta">
                            <span className="user-name">{u.name}</span>
                            <span className="user-uid" title={u.id}>
                              ID: {u.id.slice(0, 10)}...
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="user-email">{u.email}</span>
                      </td>
                      <td>
                        <span className="date-text">{formatDate(u.deletedAt)}</span>
                      </td>
                      <td>
                        <span className={`badge-pill ${sourceBadge.cls}`}>{sourceBadge.label}</span>
                      </td>
                      <td>
                        <span className="reason-text" title={u.deletedReason}>
                          {u.deletedReason || 'User requested deletion'}
                        </span>
                      </td>
                      <td>
                        <span className="badge-pill badge-deleted">Deactivated</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowRevokeModal(true);
                          }}
                          className="revoke-btn"
                          title="Restore user account so they can log in again"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Revoke / Restore
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Revoke Confirmation Modal */}
      {showRevokeModal && selectedUser && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-icon-wrap">
              <RotateCcw className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="modal-title">Revoke & Restore Account?</h3>
            <p className="modal-desc">
              Restoring this account will immediately remove the deletion flag in the database and re-enable the user in Firebase Authentication.
            </p>

            <div className="modal-user-card">
              <div className="row">
                <span className="label">User:</span>
                <span className="val">{selectedUser.name}</span>
              </div>
              <div className="row">
                <span className="label">Email:</span>
                <span className="val">{selectedUser.email}</span>
              </div>
              <div className="row">
                <span className="label">Deleted On:</span>
                <span className="val">{formatDate(selectedUser.deletedAt)}</span>
              </div>
            </div>

            <p className="modal-hint">
              Once restored, <strong>{selectedUser.email}</strong> will be able to log in immediately with their existing credentials.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                disabled={actionLoading}
                onClick={() => {
                  setShowRevokeModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-confirm-restore"
                disabled={actionLoading}
                onClick={handleRevokeAccount}
              >
                {actionLoading ? 'Restoring...' : 'Yes, Restore Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
