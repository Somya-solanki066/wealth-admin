import { useState, useEffect } from 'react';
import { connectionService } from '../services/connectionService';
import './Connections.css';

const Connections = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingRes, sentRes] = await Promise.all([
        connectionService.getPendingRequests(),
        connectionService.getSentRequests()
      ]);
      
      if (pendingRes.success) {
        setPendingRequests(pendingRes.data || pendingRes.requests || []);
      }
      if (sentRes.success) {
        setSentRequests(sentRes.data || sentRes.requests || []);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="connections-page">
      <div className="page-header">
        <h2>Connections Management</h2>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests ({pendingRequests.length})
        </button>
        <button
          className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          Sent Requests ({sentRequests.length})
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="connections-list">
          {activeTab === 'pending' ? (
            pendingRequests.length === 0 ? (
              <div className="empty-state">No pending requests</div>
            ) : (
              pendingRequests.map((request) => (
                <div key={request.id} className="connection-item">
                  <div className="connection-info">
                    <strong>From: {request.sender?.name || 'Unknown'}</strong>
                    <p>Email: {request.sender?.email || 'N/A'}</p>
                    <p>Status: {request.status || 'pending'}</p>
                  </div>
                  <div className="connection-time">
                    {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              ))
            )
          ) : (
            sentRequests.length === 0 ? (
              <div className="empty-state">No sent requests</div>
            ) : (
              sentRequests.map((request) => (
                <div key={request.id} className="connection-item">
                  <div className="connection-info">
                    <strong>To: {request.receiver?.name || 'Unknown'}</strong>
                    <p>Email: {request.receiver?.email || 'N/A'}</p>
                    <p>Status: {request.status || 'pending'}</p>
                  </div>
                  <div className="connection-time">
                    {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Connections;

