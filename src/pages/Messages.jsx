import { useState, useEffect } from 'react';
import { messageService } from '../services/messageService';
import './Messages.css';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageService.getConversations();
      if (response.success) {
        setConversations(response.conversations || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conversationId) => {
    try {
      const response = await messageService.getMessages(conversationId);
      if (response.success) {
        setMessages(response.messages || response.data || []);
        setSelectedConversation(conversationId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  return (
    <div className="messages-page">
      <div className="page-header">
        <h2>Messages Management</h2>
      </div>

      <div className="messages-container">
        <div className="conversations-list">
          <h3>Conversations ({conversations.length})</h3>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="empty-state">No conversations found</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${selectedConversation === conv.id ? 'active' : ''}`}
                onClick={() => handleSelectConversation(conv.id)}
              >
                <div className="conv-name">{conv.name || 'Unknown'}</div>
                <div className="conv-preview">{conv.lastMessage?.content || 'No messages'}</div>
                <div className="conv-time">
                  {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ''}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="messages-view">
          {selectedConversation ? (
            <>
              <h3>Messages</h3>
              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="empty-state">No messages</div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="message-item">
                      <div className="message-sender">{msg.sender?.name || 'Unknown'}</div>
                      <div className="message-content">{msg.content || 'No content'}</div>
                      <div className="message-time">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">Select a conversation to view messages</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;

