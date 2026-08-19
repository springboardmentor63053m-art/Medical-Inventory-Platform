import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, 
  AlertTriangle, 
  XOctagon, 
  RotateCcw, 
  Search, 
  ArrowRight,
  ShieldAlert,
  Clock,
  CheckCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [readAlertIds, setReadAlertIds] = useState([]);

  const isSupplier = user?.roles?.includes('ROLE_SUPPLIER');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isStaff = user?.roles?.includes('ROLE_PHARMACIST') || user?.roles?.includes('ROLE_STAFF');

  const storageKey = `medistock_read_notifications_${user?.id || user?.username}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setReadAlertIds(JSON.parse(saved));
      } catch (e) {
        setReadAlertIds([]);
      }
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      } else {
        setError(res.data.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadAlertIds(allIds);
    localStorage.setItem(storageKey, JSON.stringify(allIds));
  };

  // Enhance alerts with UI styling details
  const allAlerts = notifications.map(item => {
    const isRead = readAlertIds.includes(item.id);
    let icon = <AlertTriangle size={18} />;
    let color = '#f97316';
    let bg = 'rgba(249, 115, 22, 0.08)';
    let border = 'rgba(249, 115, 22, 0.2)';

    if (item.type === 'CRITICAL') {
      color = '#ef4444';
      bg = 'rgba(239, 68, 68, 0.08)';
      border = 'rgba(239, 68, 68, 0.2)';
      if (item.category === 'EXPIRY') {
        icon = <XOctagon size={18} />;
      } else {
        icon = <ShieldAlert size={18} />;
      }
    } else if (item.type === 'WARNING') {
      if (item.category === 'EXPIRY') {
        icon = <Clock size={18} />;
        color = '#f59e0b';
        bg = 'rgba(245, 158, 11, 0.08)';
        border = 'rgba(245, 158, 11, 0.2)';
      }
    }

    return {
      ...item,
      icon,
      color,
      bg,
      border,
      isRead
    };
  });

  // Filter alerts by search query and active tab
  const filteredAlerts = allAlerts.filter(alert => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (alert.message && alert.message.toLowerCase().includes(searchLower)) || 
      (alert.title && alert.title.toLowerCase().includes(searchLower)) ||
      (alert.medicineName && alert.medicineName.toLowerCase().includes(searchLower)) ||
      (alert.supplierName && alert.supplierName.toLowerCase().includes(searchLower));
    
    const matchesTab = activeTab === 'ALL' || alert.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const criticalCount = allAlerts.filter(a => a.type === 'CRITICAL').length;
  const warningCount = allAlerts.filter(a => a.type === 'WARNING').length;
  const unreadCount = allAlerts.filter(a => !a.isRead).length;

  if (loading) {
    return (
      <div className="card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading notifications feed...</div>
      </div>
    );
  }

  const getHeaderTitle = () => {
    if (isSupplier) return 'Supplier Notifications Feed';
    if (isAdmin) return 'Pharmacy Inventory Notifications (Admin)';
    if (isStaff) return 'Pharmacy Inventory Notifications (Staff)';
    return 'Notifications & Alerts Feed';
  };

  const getHeaderSubtitle = () => {
    if (isSupplier) {
      return 'Real-time alerts for low stock, near-expiry, and expired items in your supplied catalog.';
    }
    return 'Pharmacy-wide real-time alerts for low stock, out of stock, near-expiry, and expired medicines across all suppliers.';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Panel */}
      <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          background: 'rgba(59, 130, 246, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)'
        }}>
          <Bell size={28} />
        </div>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
              {getHeaderTitle()}
            </h2>
            {unreadCount > 0 && (
              <span style={{
                backgroundColor: '#ef4444',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px'
              }}>
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {getHeaderSubtitle()}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {unreadCount > 0 && (
            <button 
              className="btn btn-secondary" 
              onClick={markAllAsRead} 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              <CheckCheck size={16} />
              <span>Mark All Read</span>
            </button>
          )}
          <button 
            className="btn-icon" 
            onClick={fetchNotifications} 
            title="Refresh Alerts"
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="search-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: '280px' }}>
          <Search size={18} />
          <input
            type="text"
            placeholder={isSupplier ? "Search alerts by formulation name, code or alert text..." : "Search alerts by medicine, code, supplier or alert text..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn ${activeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('ALL')}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            All ({allAlerts.length})
          </button>
          <button 
            className={`btn ${activeTab === 'CRITICAL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('CRITICAL')}
            style={{ 
              padding: '8px 16px', 
              fontSize: '0.85rem',
              background: activeTab === 'CRITICAL' ? '#ef4444' : undefined,
              borderColor: activeTab === 'CRITICAL' ? '#ef4444' : undefined,
              color: activeTab === 'CRITICAL' ? 'white' : undefined
            }}
          >
            Critical ({criticalCount})
          </button>
          <button 
            className={`btn ${activeTab === 'WARNING' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('WARNING')}
            style={{ 
              padding: '8px 16px', 
              fontSize: '0.85rem',
              background: activeTab === 'WARNING' ? '#f59e0b' : undefined,
              borderColor: activeTab === 'WARNING' ? '#f59e0b' : undefined,
              color: activeTab === 'WARNING' ? 'black' : undefined
            }}
          >
            Warnings ({warningCount})
          </button>
        </div>
      </div>

      {/* Notifications Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredAlerts.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Bell size={36} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: '0.95rem' }}>No active notifications or alerts found.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div 
              key={alert.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                borderRadius: '12px',
                background: alert.bg,
                border: `1px solid ${alert.border}`,
                gap: '16px',
                flexWrap: 'wrap',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '240px' }}>
                <div style={{
                  color: alert.color,
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {alert.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 650, color: 'white', fontFamily: 'Outfit' }}>
                      {alert.title}
                    </h4>
                    {!alert.isRead && (
                      <span style={{
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '6px',
                        textTransform: 'uppercase'
                      }}>
                        Unread
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    {alert.message}
                  </p>
                </div>
              </div>

              <div>
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigate('/medicines')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    padding: '8px 16px',
                    borderColor: alert.border,
                    background: 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    color: 'white'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                >
                  <span>{isSupplier ? "Verify Catalog" : "Verify Inventory"}</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Notifications;
