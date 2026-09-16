import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationsApi } from '../features/notifications/services/api/notificationsApi';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user, isAdmin, isPharmacist, isStaff } = useAuth();
  const canUseNotifications = isAdmin || isPharmacist || isStaff;
  const [rawNotifications, setRawNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user || !canUseNotifications) {
      setRawNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const response = await notificationsApi.getActiveNotifications();
      setRawNotifications(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load notifications from database backend:', error);
      setRawNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user, canUseNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const handleNotificationChanged = () => {
      fetchNotifications();
    };
    const handleInventoryUpdated = () => {
      fetchNotifications();
    };

    window.addEventListener('medistock-notification-changed', handleNotificationChanged);
    window.addEventListener('medistock-inventory-updated', handleInventoryUpdated);

    return () => {
      window.removeEventListener('medistock-notification-changed', handleNotificationChanged);
      window.removeEventListener('medistock-inventory-updated', handleInventoryUpdated);
    };
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    setRawNotifications((prev) =>
      prev.map((n) =>
        String(n.id) === String(id) ? { ...n, isRead: true, read: true } : n
      )
    );
    try {
      await notificationsApi.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read in database:', error);
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    setRawNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, read: true }))
    );
    try {
      await notificationsApi.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read in database:', error);
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const dismissNotification = useCallback(async (id) => {
    setRawNotifications((prev) =>
      prev.filter((n) => String(n.id) !== String(id))
    );
    try {
      await notificationsApi.dismissNotification(id);
    } catch (error) {
      console.error('Failed to dismiss notification in database:', error);
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const notifications = rawNotifications.map((n) => ({
    ...n,
    read: Boolean(n.isRead ?? n.read),
  }));

  const unreadCount = notifications.filter((n) => !n.read).length;
  const stockAlertCount = notifications.filter(
    (n) => n.type === 'LOW_STOCK' || n.type === 'OUT_OF_STOCK'
  ).length;
  const expiryAlertCount = notifications.filter(
    (n) => n.type === 'EXPIRING_SOON' || n.type === 'EXPIRED'
  ).length;
  const totalCount = notifications.length;

  const value = {
    notifications,
    rawNotifications,
    loading,
    unreadCount,
    stockAlertCount,
    expiryAlertCount,
    totalCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
