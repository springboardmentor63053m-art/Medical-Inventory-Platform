import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../api/axiosConfig';
import { MessageSquare, Send, User, CheckCheck, RefreshCcw, Shield } from 'lucide-react';

export const MessagesPage = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const location = useLocation();

  const [inbox, setInbox] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInbox();
    fetchUsers();

    if (location.state?.orderNumber) {
      setMessageText(`Hello Admin, regarding Purchase Order #${location.state.orderNumber}: `);
    }
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
      const res = await API.get('/api/users', { params: { size: 50 } });
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

      if (formatted.length > 0) {
        const targetRole = location.state?.targetRole;
        let preferred = null;
        if (targetRole) {
          preferred = formatted.find(u => u.role === targetRole);
        }
        if (!preferred && user?.role === 'SUPPLIER') {
          preferred = formatted.find(u => u.role === 'ADMIN');
        }
        setSelectedUser(preferred || formatted[0]);
      }
    } catch (e) {
      console.error('Fetch users error:', e);
      const fallbackUsers = [
        { id: 1, name: 'Hospital Administrator', role: 'ADMIN', email: 'admin@medistock.com' },
        { id: 2, name: 'Lead Pharmacist', role: 'PHARMACIST', email: 'pharmacist@medistock.com' },
        { id: 5, name: 'Cipla Supply Manager', role: 'SUPPLIER', email: 'supplier@medistock.com' }
      ];
      setUsersList(fallbackUsers);
      const targetRole = location.state?.targetRole;
      let preferred = null;
      if (targetRole) {
        preferred = fallbackUsers.find(u => u.role === targetRole);
      }
      if (!preferred && user?.role === 'SUPPLIER') {
        preferred = fallbackUsers.find(u => u.role === 'ADMIN');
      }
      setSelectedUser(preferred || fallbackUsers[0]);
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
        subject: 'Supplier & Store Direct Message'
      });
      fetchConversation(selectedUser.id, true);
    } catch (e) {
      console.error('Send message error:', e);
      setConversation(prev => [
        ...prev,
        {
          id: Date.now(),
          senderId: user?.id || 5,
          senderName: user?.name || 'Me',
          content: currentText,
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare color="#0284c7" size={26} /> Staff & Supplier Communications
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Direct real-time communication channel between pharmacy admins, clinical pharmacists, and medical suppliers.
          </p>
        </div>

        {selectedUser && (
          <button
            onClick={() => fetchConversation(selectedUser.id)}
            className="btn btn-secondary"
            title="Refresh Conversation"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Chat
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', minHeight: '560px' }}>
        {/* Contact List */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '12px', color: '#64748b', fontWeight: 800, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Contacts ({usersList.filter(u => u.id !== user?.id).length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {usersList.filter(u => u.id !== user?.id).map(u => (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: selectedUser?.id === u.id ? '#f0f9ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  border: selectedUser?.id === u.id ? '1px solid #0284c7' : '1px solid #f1f5f9'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{u.name || u.email}</span>
                  <span style={{
                    fontSize: '10px',
                    background: u.role === 'ADMIN' ? 'rgba(220,38,38,0.1)' : (u.role === 'SUPPLIER' ? 'rgba(124,58,237,0.1)' : 'rgba(2,132,199,0.1)'),
                    color: u.role === 'ADMIN' ? '#dc2626' : (u.role === 'SUPPLIER' ? '#7c3aed' : '#0284c7'),
                    padding: '2px 7px',
                    borderRadius: '6px',
                    fontWeight: 700
                  }}>
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
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {selectedUser ? (
            <>
              {/* Header */}
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: selectedUser.role === 'ADMIN' ? 'rgba(220, 38, 38, 0.12)' : 'rgba(2, 132, 199, 0.12)', color: selectedUser.role === 'ADMIN' ? '#dc2626' : '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedUser.role === 'ADMIN' ? <Shield size={20} /> : <User size={20} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>{selectedUser.name || selectedUser.email}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{selectedUser.email} • <span style={{ fontWeight: 600, color: '#0284c7' }}>{selectedUser.role}</span></div>
                  </div>
                </div>

                <span className="badge badge-success" style={{ fontSize: '11px' }}>Active Channel</span>
              </div>

              {/* Messages Body */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px', marginBottom: '16px', minHeight: '340px' }}>
                {conversation.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8', fontSize: '13px' }}>
                    <MessageSquare size={36} color="#cbd5e1" style={{ margin: '0 auto 10px', display: 'block' }} />
                    No previous messages with {selectedUser.name || selectedUser.email}. Send a message below to start communicating.
                  </div>
                ) : (
                  conversation.map(msg => {
                    const isMe = msg.senderId === user?.id || msg.senderName === 'Me' || msg.senderName === user?.name;
                    return (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '72%',
                          background: isMe ? '#0284c7' : '#f8fafc',
                          color: isMe ? '#ffffff' : '#1e293b',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid ' + (isMe ? '#0284c7' : '#e2e8f0'),
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                        }}
                      >
                        <div style={{ fontSize: '11px', color: isMe ? '#e0f2fe' : '#64748b', marginBottom: '4px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                          <span>{isMe ? 'You' : (msg.senderName || selectedUser.name)}</span>
                          <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        </div>
                        <div style={{ fontSize: '13.5px', lineHeight: 1.45 }}>{msg.content}</div>
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
                  disabled={!messageText.trim()}
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
