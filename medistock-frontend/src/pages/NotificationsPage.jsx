import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  CheckCheck,
  Trash2,
  Filter,
  XCircle,
  Clock
} from 'lucide-react';
import { Pagination } from '../components/Pagination';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, READ
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [page, filter, typeFilter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'UNREAD' ? '/api/notifications/unread' : '/api/notifications';
      const params = { page, size: 10 };

      const res = await API.get(endpoint, { params });
      if (res.data?.data) {
        let list = res.data.data.content || [];
        if (filter === 'READ') {
          list = list.filter(n => n.status === 'READ');
        }
        if (typeFilter) {
          list = list.filter(n => n.notificationType === typeFilter);
        }
        setNotifications(list);
        setTotalPages(res.data.data.totalPages || 0);
        setTotalElements(res.data.data.totalElements || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await API.get('/api/notifications/unread-count');
      if (res.data?.data !== undefined) {
        setUnreadCount(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/api/notifications/${id}/read`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.put('/api/notifications/read-all');
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/api/notifications/${id}`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getSeverityBadge = (severity, type) => {
    if (severity === 'CRITICAL' || type === 'OUT_OF_STOCK' || type === 'EXPIRED_MEDICINE') {
      return <span className="badge badge-danger"><XCircle size={14} /> CRITICAL</span>;
    }
    if (severity === 'WARNING' || type === 'LOW_STOCK' || type === 'EXPIRING_SOON') {
      return <span className="badge badge-warning"><AlertTriangle size={14} /> WARNING</span>;
    }
    return <span className="badge badge-info"><Info size={14} /> INFO</span>;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Notifications & Alerts
            {unreadCount > 0 && (
              <span style={{
                background: '#dc2626', color: 'white', fontSize: '13px',
                padding: '2px 10px', borderRadius: '12px', fontWeight: 700
              }}>
                {unreadCount} UNREAD
              </span>
            )}
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            System-wide automated alerts for low stock, out of stock, and medicine expiry
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-secondary">
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px', background: '#ffffff', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          {['ALL', 'UNREAD', 'READ'].map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(0); }}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
            >
              {f}
            </button>
          ))}
        </div>

        <select
          className="input-field"
          style={{ width: '220px' }}
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
        >
          <option value="">All Notification Types</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
          <option value="EXPIRING_SOON">Expiring Soon</option>
          <option value="EXPIRED_MEDICINE">Expired Medicine</option>
          <option value="EXPIRY_ALERT">Expiry Alert</option>
          <option value="PURCHASE_ALERT">Purchase Alert</option>
          <option value="SALE_ALERT">Sale Alert</option>
        </select>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
            padding: '40px', textAlign: 'center', color: '#64748b'
          }}>
            <Bell size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>No notifications found</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>All systems operational and stock alerts clear.</div>
          </div>
        ) : (
          notifications.map((item) => {
            const isUnread = item.status === 'UNREAD';
            return (
              <div
                key={item.id}
                style={{
                  background: isUnread ? '#f0f9ff' : '#ffffff',
                  border: `1px solid ${isUnread ? '#bae6fd' : '#e2e8f0'}`,
                  borderLeft: `4px solid ${
                    item.severity === 'CRITICAL' || item.notificationType === 'OUT_OF_STOCK' || item.notificationType === 'EXPIRED_MEDICINE' ? '#dc2626' :
                    item.severity === 'WARNING' || item.notificationType === 'LOW_STOCK' || item.notificationType === 'EXPIRING_SOON' ? '#d97706' : '#0284c7'
                  }`,
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                      {item.title}
                    </div>
                    {getSeverityBadge(item.severity, item.notificationType)}
                    {isUnread && (
                      <span style={{ fontSize: '10px', background: '#0284c7', color: 'white', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#475569', fontSize: '14px', lineHeight: '1.4', marginBottom: '8px' }}>
                    {item.message}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={12} />
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Just now'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isUnread && (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      className="btn btn-sm btn-secondary"
                      title="Mark as read"
                    >
                      <CheckCircle size={14} /> Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn btn-sm btn-secondary"
                    style={{ color: '#dc2626' }}
                    title="Delete notification"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ marginTop: '24px' }}>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};
