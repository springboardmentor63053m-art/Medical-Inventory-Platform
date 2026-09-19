import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../api/axiosConfig';
import { MessageSquare, Send, User, CheckCheck } from 'lucide-react';

export const MessagesPage = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();

  const [inbox, setInbox] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInbox();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchConversation(selectedUser.id);
      const interval = setInterval(() => {
        fetchConversation(selectedUser.id, true);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  const fetchInbox = async () => {
    try {
      const res = await API.get('/api/messages/inbox');
      const data = res.data?.data;
      if (Array.isArray(data)) {
        setInbox(data);
      } else if (data?.content && Array.isArray(data.content)) {
        setInbox(data.content);
      }
    } catch (e) {
      console.warn('Inbox load fallback:', e.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get('/api/users');
      const data = res.data?.data;
      let rawList = [];
      if (Array.isArray(data)) {
        rawList = data;
      } else if (data?.content && Array.isArray(data.content)) {
        rawList = data.content;
      } else if (Array.isArray(res.data)) {
        rawList = res.data;
      }

      const formatted = rawList.map(u => ({
        id: u.id,
        name: u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : (u.name || u.email),
        role: u.roleName || u.role || 'USER',
        email: u.email
      }));
      setUsersList(formatted);
      if (formatted.length > 0 && !selectedUser) {
        setSelectedUser(formatted[0]);
      }
    } catch (e) {
      console.error('Fetch users error:', e);
      setUsersList([
        { id: 1, name: 'Admin User', role: 'ADMIN', email: 'admin@medistock.com' },
        { id: 2, name: 'Pharmacist Staff', role: 'PHARMACIST', email: 'pharmacist@medistock.com' },
        { id: 5, name: 'Supplier Partner', role: 'SUPPLIER', email: 'supplier@medistock.com' }
      ]);
    }
  };

  const fetchConversation = async (otherUserId, isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await API.get(`/api/messages/conversation/${otherUserId}`);
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setConversation(data);
      }
    } catch (e) {
      console.error('Fetch conversation error:', e);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUser) return;

    const currentText = messageText;
    setMessageText('');

    try {
      await API.post('/api/messages', {
        receiverId: selectedUser.id,
        content: currentText,
        subject: 'Direct Chat Message'
      });
      fetchConversation(selectedUser.id, true);
    } catch (e) {
      console.error('Send message error:', e);
      setConversation(prev => [
        ...prev,
        {
          id: Date.now(),
          senderId: user?.id || 1,
          senderName: user?.name || 'Me',
          content: currentText,
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare color="#0284c7" /> Staff & Supplier Communications
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Direct message channel between admins, pharmacists, and medical suppliers.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', minHeight: '520px' }}>
        {/* Contact List */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contacts & Inbox</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {usersList.filter(u => u.id !== user?.id).map(u => (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: selectedUser?.id === u.id ? '#f0f9ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid ' + (selectedUser?.id === u.id ? '#0284c7' : '#f1f5f9')
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{u.name || u.email}</span>
                  <span style={{ fontSize: '10px', background: selectedUser?.id === u.id ? 'rgba(2,132,199,0.15)' : '#f1f5f9', color: selectedUser?.id === u.id ? '#0284c7' : '#64748b', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    {u.role}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  {u.email}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Thread */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {selectedUser ? (
            <>
              {/* Header */}
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b' }}>{selectedUser.name || selectedUser.email}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Role: {selectedUser.role}</div>
                </div>
              </div>

              {/* Messages Body */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px', marginBottom: '16px', minHeight: '300px' }}>
                {conversation.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px' }}>
                    No messages yet. Send a message to start the conversation.
                  </div>
                ) : (
                  conversation.map(msg => {
                    const isMe = msg.senderId === user?.id || msg.senderName === 'Me';
                    return (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          background: isMe ? '#0284c7' : '#f1f5f9',
                          color: isMe ? '#ffffff' : '#1e293b',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid ' + (isMe ? '#0284c7' : '#e2e8f0'),
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        <div style={{ fontSize: '11px', color: isMe ? '#e0f2fe' : '#64748b', marginBottom: '4px', fontWeight: 600 }}>
                          {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: '14px', lineHeight: 1.4 }}>{msg.content}</div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Form Input */}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder={`Type a message to ${selectedUser.name || selectedUser.email}...`}
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  className="input-field"
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0 20px', gap: '6px' }}
                >
                  <Send size={16} /> Send
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', flexDirection: 'column', gap: '12px' }}>
              <MessageSquare size={48} color="#cbd5e1" />
              <div>Select a contact from the left panel to start messaging.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
