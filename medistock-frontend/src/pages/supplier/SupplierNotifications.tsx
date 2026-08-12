import React, { useState } from "react";
import "../../styles/supplier-notifications.css";

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  type: "order" | "delivery" | "stock" | "system";
  read: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "Purchase order completed",
    message:
      "Purchase order PO-1002 has been successfully completed.",
    time: "Today, 10:30 AM",
    type: "order",
    read: false,
  },
  {
    id: 2,
    title: "Delivery received",
    message:
      "The delivery containing Metformin 500mg has been received.",
    time: "Today, 09:15 AM",
    type: "delivery",
    read: false,
  },
  {
    id: 3,
    title: "Low stock alert",
    message:
      "Vitamin C 500mg supplied by you is currently running low.",
    time: "Yesterday, 04:40 PM",
    type: "stock",
    read: false,
  },
  {
    id: 4,
    title: "Purchase order update",
    message:
      "Purchase order PO-1003 is currently in transit.",
    time: "Yesterday, 11:20 AM",
    type: "order",
    read: true,
  },
  {
    id: 5,
    title: "Account verified",
    message:
      "Your supplier account has been successfully verified.",
    time: "08 Aug 2026",
    type: "system",
    read: true,
  },
];

const SupplierNotifications: React.FC = () => {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = (id: number) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications((previous) =>
      previous.filter((notification) => notification.id !== id)
    );
  };

  return (
    <div className="supplier-notifications-page">

      {/* HEADER */}

      <div className="supplier-notifications-header">

        <div>
          <div className="supplier-notifications-eyebrow">
            SUPPLIER PORTAL
          </div>

          <h1>Notifications</h1>

          <p>
            Stay updated about your purchase orders, deliveries and account.
          </p>
        </div>

        <button
          className="supplier-notifications-read-all"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          ✓ Mark all as read
        </button>

      </div>

      {/* SUMMARY */}

      <div className="supplier-notifications-summary">

        <div className="notification-summary-icon">
          🔔
        </div>

        <div>
          <strong>
            {unreadCount} unread notification
            {unreadCount !== 1 ? "s" : ""}
          </strong>

          <p>
            You have {notifications.length} total notifications.
          </p>
        </div>

      </div>

      {/* NOTIFICATION LIST */}

      <div className="supplier-notifications-card">

        <div className="supplier-notifications-card-header">
          <div>
            <h2>Recent Notifications</h2>
            <p>
              Important updates related to your supplier account.
            </p>
          </div>

          <span>
            {notifications.length} notifications
          </span>
        </div>

        <div className="supplier-notification-list">

          {notifications.length === 0 ? (
            <div className="supplier-notifications-empty">
              <div>🔔</div>
              <h3>No notifications</h3>
              <p>
                You're all caught up.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`supplier-notification ${
                  notification.read ? "read" : "unread"
                }`}
              >

                <div
                  className={`supplier-notification-icon ${notification.type}`}
                >
                  {notification.type === "order" && "🛒"}
                  {notification.type === "delivery" && "📦"}
                  {notification.type === "stock" && "⚠"}
                  {notification.type === "system" && "✓"}
                </div>

                <div className="supplier-notification-content">

                  <div className="supplier-notification-title-row">

                    <h3>{notification.title}</h3>

                    {!notification.read && (
                      <span className="supplier-notification-new">
                        NEW
                      </span>
                    )}

                  </div>

                  <p>{notification.message}</p>

                  <span className="supplier-notification-time">
                    {notification.time}
                  </span>

                </div>

                <div className="supplier-notification-actions">

                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark read
                    </button>
                  )}

                  <button
                    className="notification-delete"
                    onClick={() =>
                      deleteNotification(notification.id)
                    }
                  >
                    ×
                  </button>

                </div>

              </div>
            ))
          )}

        </div>

      </div>

    </div>
  );
};

export default SupplierNotifications;