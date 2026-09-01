import { useState, useEffect } from 'react';
import { Eye, UserPlus, UserMinus, Trash2 } from 'lucide-react';
import { userService } from '../services/userService';
import { getProfilePictureUrl } from '../utils/imageHelper';
import api from '../services/api';
import './Users.css';

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
  return date ? date.toLocaleDateString() : 'N/A';
}

function toDateInput(value) {
  const date = parseDate(value);
  if (!date) return '';
  return date.toISOString().slice(0, 10);
}

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [plans, setPlans] = useState([]);
  const [allPlans, setAllPlans] = useState([]);
  const [grantPlanId, setGrantPlanId] = useState('');
  const [editPlanId, setEditPlanId] = useState('');
  const [editExpiry, setEditExpiry] = useState('');
  const [editPremium, setEditPremium] = useState(false);
  const [savingSub, setSavingSub] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, [page]);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/settings');
      const loaded = response.data?.data?.plans || [];
      setAllPlans(loaded);
      const paid = loaded.filter((p) => !p.isFree && p.id !== 'free');
      setPlans(paid);
      if (paid[0]?.id) setGrantPlanId(paid[0].id);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers(page, 20);

      if (Array.isArray(response)) {
        setUsers(response);
      } else if (response.success) {
        setUsers(response.data || response.users || []);
      } else if (response.data) {
        setUsers(Array.isArray(response.data) ? response.data : []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error details:', error.response?.data);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const applyUserToModal = (data) => {
    setSelectedUser(data);
    const planId = data.subscriptionPlan && data.subscriptionPlan !== 'None'
      ? data.subscriptionPlan
      : 'free';
    setEditPlanId(planId);
    setEditExpiry(toDateInput(data.subscriptionExpiry));
    setEditPremium(!!data.isPremium);
  };

  const refreshSelectedUser = async (userId) => {
    const response = await userService.getUserById(userId);
    const data = response.data || response.user;
    applyUserToModal(data);
    fetchUsers();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }
    try {
      setLoading(true);
      const response = await userService.searchUsers(searchQuery);

      if (Array.isArray(response)) {
        setUsers(response);
      } else if (response.success) {
        setUsers(response.data || []);
      } else if (response.data) {
        setUsers(Array.isArray(response.data) ? response.data : []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await userService.deleteUser(userId);
      if (response.success || response.message) {
        alert('User deleted successfully');
        fetchUsers();
        if (selectedUser?.id === userId) {
          setShowModal(false);
          setSelectedUser(null);
        }
      } else {
        alert('Error deleting user: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user';
      alert('Error deleting user: ' + errorMessage);
      console.error('Delete error:', error.response?.data || error);
    }
  };

  const handleGrant = async (userId, planId) => {
    if (!planId) {
      alert('Select a paid plan first.');
      return;
    }
    if (!window.confirm('Grant this paid plan to the user?')) return;
    try {
      const response = await userService.setSubscription(userId, { action: 'grant', planId });
      alert(response.message || 'Premium granted');
      if (selectedUser?.id === userId) {
        await refreshSelectedUser(userId);
      } else {
        fetchUsers();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to grant premium');
    }
  };

  const handleRevoke = async (userId) => {
    if (!window.confirm('Revoke premium and move this user to the free plan?')) return;
    try {
      const response = await userService.setSubscription(userId, { action: 'revoke' });
      alert(response.message || 'Premium revoked');
      if (selectedUser?.id === userId) {
        await refreshSelectedUser(userId);
      } else {
        fetchUsers();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to revoke premium');
    }
  };

  const handleView = async (userId) => {
    try {
      const response = await userService.getUserById(userId);
      applyUserToModal(response.data || response.user);
      setShowModal(true);
    } catch (error) {
      alert('Error fetching user details');
    }
  };

  const handleSaveSubscription = async () => {
    if (!selectedUser) return;
    setSavingSub(true);
    try {
      await userService.setSubscription(selectedUser.id, {
        action: 'update',
        planId: editPlanId,
        subscriptionExpiry: editExpiry || null,
        isPremium: editPremium,
      });
      await refreshSelectedUser(selectedUser.id);
      alert('Subscription updated');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update subscription');
    } finally {
      setSavingSub(false);
    }
  };

  const handleToggleActive = async (userId, nextActive) => {
    try {
      await userService.updateUser(userId, { isActive: nextActive });
      setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: nextActive } : u)));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, isActive: nextActive });
      }
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  const planOptions = (() => {
    const ids = new Set(allPlans.map((p) => p.id));
    const extras = [];
    if (editPlanId && !ids.has(editPlanId)) {
      extras.push({ id: editPlanId, name: editPlanId });
    }
    if (!ids.has('free') && !extras.find((p) => p.id === 'free')) {
      extras.unshift({ id: 'free', name: 'Free' });
    }
    return [...allPlans, ...extras];
  })();

  const usage = selectedUser?.aiUsage || {};
  const projects = selectedUser?.projects || [];

  return (
    <div className="users-page">
      <div className="page-header">
        <h2>Users Management</h2>
        <div className="search-box">
          <select value={grantPlanId} onChange={(e) => setGrantPlanId(e.target.value)} style={{ padding: '8px', background: '#161616', color: '#F0EBE0', border: '1px solid #333', borderRadius: '6px' }}>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.world ? `[${plan.world}] ` : ''}{plan.name} ({plan.price})
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Plan</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={getProfilePictureUrl(user, 32)}
                          alt={user.name || 'User'}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.src = getProfilePictureUrl({ name: user.name || 'User' }, 32);
                          }}
                        />
                        <span>{user.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td>{user.email || 'N/A'}</td>
                    <td>
                      <span className={`role-badge role-${user.role || 'user'}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={user.isActive !== false}
                          onChange={() => handleToggleActive(user.id, user.isActive === false)}
                        />
                        <span className="slider round"></span>
                      </label>
                    </td>
                    <td>
                      <span style={{ color: user.isPremium ? '#52C07A' : '#909090', fontWeight: 700, fontSize: '12px' }}>
                        {user.isPremium ? (user.subscriptionPlan || 'PREMIUM') : (user.subscriptionPlan || 'free')}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon btn-view" onClick={() => handleView(user.id)} title="View">
                          <Eye size={16} />
                        </button>
                        {user.isPremium ? (
                          <button className="btn-icon btn-revoke" onClick={() => handleRevoke(user.id)} title="Revoke premium">
                            <UserMinus size={16} />
                          </button>
                        ) : (
                          <button className="btn-icon btn-grant" onClick={() => handleGrant(user.id, grantPlanId)} title="Grant premium">
                            <UserPlus size={16} />
                          </button>
                        )}
                        <button className="btn-icon btn-delete" onClick={() => handleDelete(user.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content user-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <p><strong>ID</strong> {selectedUser.id}</p>
                <p><strong>Name</strong> {selectedUser.name || 'N/A'}</p>
                <p><strong>Email</strong> {selectedUser.email || 'N/A'}</p>
                <p><strong>Role</strong> {selectedUser.role || 'N/A'}</p>
                <p><strong>Phone</strong> {selectedUser.phone || 'N/A'}</p>
                <p><strong>Created</strong> {formatDate(selectedUser.createdAt)}</p>
                <p><strong>Status</strong> {selectedUser.isActive === false ? 'Deactivated' : 'Active'}</p>
                <p><strong>Source</strong> {selectedUser.subscriptionSource || 'N/A'}</p>
              </div>

              <h4 className="modal-section-title">Subscription</h4>
              <div className="subscription-editor">
                <label>
                  Plan
                  <select value={editPlanId} onChange={(e) => setEditPlanId(e.target.value)}>
                    {planOptions.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.world ? `[${plan.world}] ` : ''}{plan.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Expiry
                  <input type="date" value={editExpiry} onChange={(e) => setEditExpiry(e.target.value)} />
                </label>
                <label className="premium-toggle">
                  Premium
                  <input
                    type="checkbox"
                    checked={editPremium}
                    onChange={(e) => setEditPremium(e.target.checked)}
                  />
                </label>
              </div>
              <div className="modal-actions">
                <button className="btn-view" onClick={handleSaveSubscription} disabled={savingSub}>
                  {savingSub ? 'Saving...' : 'Save subscription'}
                </button>
                <button className="btn-grant" onClick={() => handleGrant(selectedUser.id, grantPlanId || editPlanId)}>
                  Grant
                </button>
                <button className="btn-revoke" onClick={() => handleRevoke(selectedUser.id)}>
                  Revoke
                </button>
                {selectedUser.isActive === false ? (
                  <button className="btn-grant" onClick={() => handleToggleActive(selectedUser.id, true)}>
                    Activate
                  </button>
                ) : (
                  <button className="btn-delete" onClick={() => {
                    if (window.confirm('Deactivate this account? The user will no longer be able to sign in.')) {
                      handleToggleActive(selectedUser.id, false);
                    }
                  }}>
                    Deactivate
                  </button>
                )}
              </div>

              <h4 className="modal-section-title">Writing & AI usage</h4>
              <div className="stats-grid-mini">
                <div><span>Streak</span><strong>{selectedUser.writingStreak || 0}</strong></div>
                <div><span>Last write</span><strong>{formatDate(selectedUser.lastWriteDate)}</strong></div>
                <div><span>Total words</span><strong>{selectedUser.totalWordsWritten || 0}</strong></div>
                <div><span>Analyzer uses</span><strong>{usage.aiAnalyzerCount || 0}</strong></div>
                <div><span>Smart Edit uses</span><strong>{usage.smartEditCount || 0}</strong></div>
                <div><span>AI last used</span><strong>{formatDate(usage.lastUsed)}</strong></div>
              </div>

              <h4 className="modal-section-title">Projects</h4>
              {projects.length === 0 ? (
                <p className="empty-hint">No projects</p>
              ) : (
                <table className="projects-mini-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Words</th>
                      <th>Chapters</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.id}>
                        <td>{project.name}</td>
                        <td>{project.type || '—'}</td>
                        <td>{project.wordCount || 0}</td>
                        <td>{project.chapterCount || 0}</td>
                        <td>{formatDate(project.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
