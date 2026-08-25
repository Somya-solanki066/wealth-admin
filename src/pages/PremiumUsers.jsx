import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { getProfilePictureUrl } from '../utils/imageHelper';
import './Users.css';

const PremiumUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const filterPremium = (data) => {
    return (data || []).filter(u => u.subscriptionPlan && u.subscriptionPlan !== 'free');
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers(page, 20);
      
      if (Array.isArray(response)) {
        setUsers(filterPremium(response));
      } else if (response.success) {
        setUsers(filterPremium(response.data || response.users));
      } else if (response.data) {
        setUsers(filterPremium(Array.isArray(response.data) ? response.data : []));
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching premium users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
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
        setUsers(filterPremium(response));
      } else if (response.success) {
        setUsers(filterPremium(response.data));
      } else if (response.data) {
        setUsers(filterPremium(Array.isArray(response.data) ? response.data : []));
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
      } else {
        alert('Error deleting user: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user';
      alert('Error deleting user: ' + errorMessage);
      console.error('Delete error:', error.response?.data || error);
    }
  };

  const handleView = async (userId) => {
    try {
      const response = await userService.getUserById(userId);
      setSelectedUser(response.data || response.user);
      setShowModal(true);
    } catch (error) {
      alert('Error fetching user details');
    }
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <h2>Premium Subscriptions</h2>
        <div className="search-box">
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
                <th>Name</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Purchased On</th>
                <th>Plan Expiry</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
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
                      <span style={{ fontWeight: 'bold', color: '#E2C06A', fontSize: '12px' }}>
                        {user.subscriptionPlan === 'free' ? 'FREE' : user.subscriptionPlan?.replace('plan_', '').toUpperCase() || 'NONE'}
                      </span>
                    </td>
                    <td>{user.subscriptionDate ? new Date(user.subscriptionDate).toLocaleDateString() : '-'}</td>
                    <td>{user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>ID:</strong> {selectedUser.id}</p>
              <p><strong>Name:</strong> {selectedUser.name || 'N/A'}</p>
              <p><strong>Email:</strong> {selectedUser.email || 'N/A'}</p>
              <p><strong>Role:</strong> {selectedUser.role || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
              <p><strong>Created:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumUsers;

