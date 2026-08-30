import React, { useEffect, useState } from "react";
import axiosInstance from "@/api/axios";
import {
  Bell,
  AlertTriangle,
  Package,
  CalendarClock,
  CheckCircle2,
  Trash2,
  Check,
} from "lucide-react";
import "./StaffNotifications.css";

type Notification = {
  id: number;
  title: string;
  message: string;
  type: "low-stock" | "expiry" | "stock" | "system";
  time: string;
  read: boolean;
};



const StaffNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get("/notifications");
        if (Array.isArray(response.data)) {
          const mapped: Notification[] = response.data.map((item: any) => {
            let type: "low-stock" | "expiry" | "stock" | "system" = "system";
            if (item.type === "LOW_STOCK" || item.type === "OUT_OF_STOCK") type = "low-stock";
            else if (item.type === "EXPIRY" || item.type === "EXPIRED") type = "expiry";
            return {
              id: item.id,
              title: item.title || "Notification",
              message: item.message,
              type: type,
              time: item.timestamp ? new Date(item.timestamp).toLocaleString("en-IN") : "Just now",
              read: Boolean(item.isRead),
            };
          });
          setNotifications(mapped);
        }
      } catch (e) {
        console.warn("Could not fetch staff notifications:", e);
      }
    };
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = async (id: number) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
    notifications.forEach(async (n) => {
      if (!n.read) {
        try {
          await axiosInstance.put(`/notifications/${n.id}/read`);
        } catch (e) {}
      }
    });
  };

  const removeNotification = (id: number) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "low-stock":
        return <AlertTriangle size={22} />;

      case "expiry":
        return <CalendarClock size={22} />;

      case "stock":
        return <Package size={22} />;

      default:
        return <Bell size={22} />;
    }
  };

  return (
    <div className="staff-notifications-page">
      <div className="staff-notifications-header">
        <div>
          <div className="staff-notifications-eyebrow">
            STAFF PORTAL
          </div>

          <h1>Notifications</h1>

          <p>
            Stay updated with stock, expiry and inventory alerts.
          </p>
        </div>

        <div className="staff-notification-header-icon">
          <Bell size={28} />

          {unreadCount > 0 && (
            <span>{unreadCount}</span>
          )}
        </div>
      </div>

      <div className="staff-notification-summary">
        <div className="staff-notification-summary-card">
          <div className="summary-icon blue">
            <Bell size={24} />
          </div>

          <div>
            <span>Total Notifications</span>
            <strong>{notifications.length}</strong>
          </div>
        </div>

        <div className="staff-notification-summary-card">
          <div className="summary-icon orange">
            <AlertTriangle size={24} />
          </div>

          <div>
            <span>Unread Alerts</span>
            <strong>{unreadCount}</strong>
          </div>
        </div>

        <div className="staff-notification-summary-card">
          <div className="summary-icon green">
            <CheckCircle2 size={24} />
          </div>

          <div>
            <span>Read Notifications</span>
            <strong>
              {notifications.length - unreadCount}
            </strong>
          </div>
        </div>
      </div>

      <div className="staff-notifications-card">
        <div className="staff-notifications-card-header">
          <div>
            <h2>Recent Notifications</h2>

            <p>
              Inventory alerts and system updates
            </p>
          </div>

          <div className="staff-notification-actions">
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="staff-mark-read-btn"
            >
              <Check size={17} />
              Mark all as read
            </button>

            <button
              type="button"
              onClick={clearAll}
              disabled={notifications.length === 0}
              className="staff-clear-btn"
            >
              <Trash2 size={17} />
              Clear all
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="staff-notification-empty">
            <div className="empty-bell">
              <Bell size={42} />
            </div>

            <h3>No notifications</h3>

            <p>
              You're all caught up. New inventory alerts
              will appear here.
            </p>
          </div>
        ) : (
          <div className="staff-notification-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`staff-notification-item ${
                  notification.read ? "read" : "unread"
                }`}
              >
                <div
                  className={`staff-notification-icon ${notification.type}`}
                >
                  {getIcon(notification.type)}
                </div>

                <div className="staff-notification-content">
                  <div className="staff-notification-title-row">
                    <h3>{notification.title}</h3>

                    {!notification.read && (
                      <span className="new-badge">NEW</span>
                    )}
                  </div>

                  <p>{notification.message}</p>

                  <span className="staff-notification-time">
                    {notification.time}
                  </span>
                </div>

                <div className="staff-notification-item-actions">
                  {!notification.read && (
                    <button
                      type="button"
                      title="Mark as read"
                      onClick={() =>
                        markAsRead(notification.id)
                      }
                    >
                      <Check size={18} />
                    </button>
                  )}

                  <button
                    type="button"
                    title="Delete notification"
                    onClick={() =>
                      removeNotification(notification.id)
                    }
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffNotifications;