import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { 
  MessageSquare, 
  Send, 
  Search, 
  User, 
  Truck, 
  Pill, 
  Users as StaffIcon, 
  CheckCheck,
  Circle,
  Paperclip,
  Smile
} from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessageText, setNewMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const messagesEndRef = useRef(null);

  // Default seed conversations matching real project users (sneha, kiran, admin, Sharma)
  const defaultConversations = {
    'user_3': [
      { id: 1, sender: 'sneha', senderName: 'Sneha Reddy', text: 'Hello Admin, we are running low on Amoxicillin 250mg. Should I create a purchase order?', timestamp: '10:15 AM' },
      { id: 2, sender: 'admin', senderName: 'Admin', text: 'Hi Sneha! Yes, please generate PO for 1,000 units from Sani Sharma.', timestamp: '10:18 AM' },
      { id: 3, sender: 'sneha', senderName: 'Sneha Reddy', text: 'Great, creating purchase order now.', timestamp: '10:20 AM' }
    ],
    'user_4': [
      { id: 1, sender: 'kiran', senderName: 'Kiran Kumar', text: 'Stock adjustment completed for rack RACK-A1.', timestamp: '2 days ago' },
      { id: 2, sender: 'admin', senderName: 'Admin', text: 'Received and verified. Thank you Kiran!', timestamp: '2 days ago' }
    ],
    'supplier_5': [
      { id: 1, sender: 'admin', senderName: 'Admin', text: 'Hello Sani Sharma, please confirm delivery date for PO-2026-0012.', timestamp: 'Yesterday' },
      { id: 2, sender: 'Sharma', senderName: 'Sani Sharma', text: 'Hi Admin! Shipment is dispatched and expected to arrive by tomorrow morning.', timestamp: 'Yesterday' }
    ]
  };

  const getAllowedCategoriesForUser = (roles = []) => {
    if (roles.includes('ROLE_ADMIN')) {
      return ['ADMIN', 'PHARMACIST', 'STAFF', 'SUPPLIER'];
    }
    if (roles.includes('ROLE_PHARMACIST')) {
      return ['ADMIN', 'STAFF'];
    }
    if (roles.includes('ROLE_STAFF')) {
      return ['ADMIN', 'PHARMACIST'];
    }
    if (roles.includes('ROLE_SUPPLIER')) {
      return ['ADMIN'];
    }
    return ['ADMIN'];
  };

  useEffect(() => {
    // Load stored messages or seed defaults
    const stored = localStorage.getItem('medistock_chat_conversations');
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch (err) {
        setMessages(defaultConversations);
      }
    } else {
      setMessages(defaultConversations);
      localStorage.setItem('medistock_chat_conversations', JSON.stringify(defaultConversations));
    }

    const fetchContacts = async () => {
      try {
        const [usersRes, suppliersRes] = await Promise.all([
          api.get('/users').catch(() => null),
          api.get('/suppliers').catch(() => null)
        ]);

        let loadedContacts = [];

        // Add real users from database
        if (usersRes && usersRes.data && usersRes.data.success) {
          const uList = usersRes.data.data || [];
          uList.forEach(u => {
            if (u.username !== user?.username) {
              const role = (u.roles || [])[0] || 'ROLE_USER';
              let category = 'STAFF';
              if (role.includes('PHARMACIST')) category = 'PHARMACIST';
              else if (role.includes('ADMIN')) category = 'ADMIN';

              loadedContacts.push({
                id: `user_${u.id}`,
                name: u.fullName || u.username,
                role: role.replace('ROLE_', ''),
                category: category,
                email: u.email,
                avatarText: (u.fullName || u.username).substring(0, 2).toUpperCase(),
                online: true
              });
            }
          });
        }

        // Add real suppliers from database
        if (suppliersRes && suppliersRes.data && suppliersRes.data.success) {
          const sList = suppliersRes.data.data || [];
          sList.forEach(s => {
            loadedContacts.push({
              id: `supplier_${s.id}`,
              name: s.name,
              role: 'SUPPLIER',
              category: 'SUPPLIER',
              email: s.email || s.contactPerson,
              avatarText: s.name.substring(0, 2).toUpperCase(),
              online: true
            });
          });
        }

        // Baseline default contacts using exact real database users
        const defaultContacts = [
          { id: 'user_1', name: 'System Administrator (admin)', role: 'ADMIN', category: 'ADMIN', email: 'admin@medistock.com', avatarText: 'AD', online: true },
          { id: 'user_3', name: 'Sneha Reddy (Pharmacist)', role: 'PHARMACIST', category: 'PHARMACIST', email: 'sneha@gmail.com', avatarText: 'SN', online: true },
          { id: 'user_4', name: 'Kiran Kumar (Staff)', role: 'STAFF', category: 'STAFF', email: 'kiran@gmail.com', avatarText: 'KK', online: true },
          { id: 'supplier_5', name: 'Sani Sharma (Supplier)', role: 'SUPPLIER', category: 'SUPPLIER', email: 'sharma23@gmail.com', avatarText: 'SS', online: true },
          { id: 'supplier_6', name: 'MedPlus Supplier', role: 'SUPPLIER', category: 'SUPPLIER', email: 'supplier2@gmail.com', avatarText: 'MS', online: false }
        ];

        // Filter out current user from default contacts
        const availableDefaults = defaultContacts.filter(dc => !user?.username || !dc.name.toLowerCase().includes(user.username.toLowerCase()));

        // Ensure baseline contacts exist for categories not returned by API (e.g., non-admin users where /users returns 403)
        availableDefaults.forEach(dc => {
          const hasCategoryInLoaded = loadedContacts.some(c => c.category === dc.category);
          if (!hasCategoryInLoaded) {
            loadedContacts.push(dc);
          }
        });

        const allowedCategories = getAllowedCategoriesForUser(user?.roles || []);
        loadedContacts = loadedContacts.filter(c => allowedCategories.includes(c.category));

        setContacts(loadedContacts);
        if (loadedContacts.length > 0) {
          setSelectedContact(loadedContacts[0]);
        }
      } catch (err) {
        console.error('Error loading chat contacts:', err);
      }
    };

    fetchContacts();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedContact]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedContact) return;

    const contactId = selectedContact.id;
    const newMsg = {
      id: Date.now(),
      sender: user?.username || 'admin',
      senderName: user?.username || 'Admin',
      text: newMessageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = {
      ...messages,
      [contactId]: [...(messages[contactId] || []), newMsg]
    };

    setMessages(updated);
    localStorage.setItem('medistock_chat_conversations', JSON.stringify(updated));
    setNewMessageText('');
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const activeMessages = selectedContact ? (messages[selectedContact.id] || []) : [];
  const allowedCategories = getAllowedCategoriesForUser(user?.roles || []);
  const categoryTabs = ['ALL', ...allowedCategories];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      gap: '20px',
      height: 'calc(100vh - 120px)',
      minHeight: '550px'
    }}>
      
      {/* LEFT PANEL: CONTACTS DIRECTORY */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        
        {/* Header & Category Filters */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} style={{ color: 'var(--primary)' }} />
            Internal Communication
          </h3>

          {/* Search Box */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search Pharmacist, Staff, Supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '32px',
                paddingRight: '12px',
                height: '34px',
                fontSize: '0.8rem',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-main)'
              }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {categoryTabs.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: activeCategory === cat ? 'var(--primary)' : 'var(--bg-subtle)',
                  color: activeCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredContacts.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              No contacts found.
            </div>
          ) : (
            filteredContacts.map(c => {
              const isSelected = selectedContact?.id === c.id;
              const contactMsgs = messages[c.id] || [];
              const lastMsg = contactMsgs[contactMsgs.length - 1];

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedContact(c)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: isSelected ? 'var(--primary-subtle)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: c.category === 'SUPPLIER' ? 'rgba(245, 158, 11, 0.2)' :
                                       c.category === 'PHARMACIST' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: c.category === 'SUPPLIER' ? 'var(--warning)' :
                             c.category === 'PHARMACIST' ? 'var(--primary)' : 'var(--success)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {c.avatarText}
                    </div>
                    {c.online && (
                      <span style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        border: '2px solid var(--bg-card)'
                      }} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.name}
                      </span>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '8px',
                        backgroundColor: c.category === 'SUPPLIER' ? 'rgba(245, 158, 11, 0.15)' :
                                         c.category === 'PHARMACIST' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: c.category === 'SUPPLIER' ? 'var(--warning)' :
                               c.category === 'PHARMACIST' ? 'var(--primary)' : 'var(--success)'
                      }}>
                        {c.role}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lastMsg ? lastMsg.text : 'Click to start conversation...'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: CHAT WINDOW */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {selectedContact ? (
          <>
            {/* Chat Conversation Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedContact.avatarText}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {selectedContact.name}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Circle size={8} style={{ fill: selectedContact.online ? '#10b981' : '#6b7280', color: selectedContact.online ? '#10b981' : '#6b7280' }} />
                    {selectedContact.role} • {selectedContact.email || 'Active Direct Channel'}
                  </span>
                </div>
              </div>

              <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                Direct Channel
              </span>
            </div>

            {/* Messages Thread Body */}
            <div style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: 'var(--bg-card)'
            }}>
              {activeMessages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <MessageSquare size={36} style={{ color: 'var(--border-color)', marginBottom: '8px' }} />
                  <div>No previous messages with {selectedContact.name}.</div>
                  <div style={{ fontSize: '0.75rem' }}>Send a message to initiate communication.</div>
                </div>
              ) : (
                activeMessages.map((msg, index) => {
                  const isMe = msg.sender === user?.username || msg.sender === 'admin';

                  return (
                    <div
                      key={msg.id || index}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        alignSelf: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '2px', padding: '0 4px' }}>
                        {isMe ? 'You' : msg.senderName} • {msg.timestamp}
                      </span>
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        backgroundColor: isMe ? 'var(--primary)' : 'var(--bg-subtle)',
                        color: isMe ? '#ffffff' : 'var(--text-main)',
                        border: isMe ? 'none' : '1px solid var(--border-color)',
                        fontSize: '0.88rem',
                        lineHeight: '1.4',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Footer */}
            <form onSubmit={handleSendMessage} style={{
              padding: '14px 18px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--bg-subtle)'
            }}>
              <input
                type="text"
                placeholder={`Message ${selectedContact.name}...`}
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                style={{
                  flex: 1,
                  height: '40px',
                  padding: '0 16px',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-secondary)' }}>
            Select a contact to open chat.
          </div>
        )}
      </div>

    </div>
  );
};

export default Messages;
