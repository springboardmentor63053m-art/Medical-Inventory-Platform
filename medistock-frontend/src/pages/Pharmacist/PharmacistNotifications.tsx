import React, { useState } from "react";
import "./PharmacistNotifications.css";

interface Notification {
  id: number;
  type: "order" | "stock" | "urgent" | "system";
  title: string;
  message: string;
  customer?: string;
  medicine?: string;
  quantity?: number;
  time: string;
  read: boolean;
}

const PharmacistNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "order",
      title: "New Medicine Request",
      message:
        "A customer has requested medicines. Please review the order and prepare the medicines.",
      customer: "Rahul Kumar",
      medicine: "Paracetamol 500mg",
      quantity: 2,
      time: "10 minutes ago",
      read: false,
    },
    {
      id: 2,
      type: "order",
      title: "Medicine Request Pending",
      message:
        "A new medicine purchase request is waiting for your approval.",
      customer: "Priya Sharma",
      medicine: "Amoxicillin 250mg",
      quantity: 1,
      time: "25 minutes ago",
      read: false,
    },
    {
      id: 3,
      type: "urgent",
      title: "Low Stock Alert",
      message:
        "The stock quantity of Cetirizine 10mg has fallen below the minimum stock level.",
      medicine: "Cetirizine 10mg",
      quantity: 8,
      time: "1 hour ago",
      read: false,
    },
    {
      id: 4,
      type: "stock",
      title: "Stock Updated",
      message:
        "New stock has been added to the medicine inventory.",
      medicine: "Ibuprofen 400mg",
      quantity: 210,
      time: "2 hours ago",
      read: true,
    },
    {
      id: 5,
      type: "order",
      title: "Medicine Request Completed",
      message:
        "The medicine request has been successfully prepared and marked as completed.",
      customer: "Anjali Reddy",
      medicine: "Cough Syrup",
      quantity: 1,
      time: "3 hours ago",
      read: true,
    },
  ]);

  const [filter, setFilter] = useState("all");

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter(
          (notification) => !notification.read
        )
      : filter === "orders"
      ? notifications.filter(
          (notification) => notification.type === "order"
        )
      : filter === "alerts"
      ? notifications.filter(
          (notification) =>
            notification.type === "urgent" ||
            notification.type === "stock"
        )
      : notifications;

  const markAsRead = (id: number) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
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

  const removeNotification = (id: number) => {
    setNotifications((previous) =>
      previous.filter(
        (notification) => notification.id !== id
      )
    );
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "order":
        return "🛒";

      case "stock":
        return "📦";

      case "urgent":
        return "⚠️";

      case "system":
        return "🔔";

      default:
        return "🔔";
    }
  };

  return (
    <div className="pharmacist-notifications-page">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <section className="notification-page-header">

        <div>
          <h2>Notifications</h2>

          <p>
            Review medicine requests, stock alerts and
            pharmacy activities.
          </p>
        </div>

        <button
          className="mark-all-button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          ✓ Mark all as read
        </button>

      </section>


      {/* =====================================================
          SUMMARY
          ===================================================== */}

      <section className="notification-summary">

        <div className="notification-summary-card">

          <div className="notification-summary-icon blue">
            🔔
          </div>

          <div>
            <p>Total Notifications</p>
            <h3>{notifications.length}</h3>
          </div>

        </div>


        <div className="notification-summary-card">

          <div className="notification-summary-icon orange">
            ●
          </div>

          <div>
            <p>Unread</p>
            <h3>{unreadCount}</h3>
          </div>

        </div>


        <div className="notification-summary-card">

          <div className="notification-summary-icon green">
            🛒
          </div>

          <div>
            <p>Medicine Requests</p>
            <h3>
              {
                notifications.filter(
                  (notification) =>
                    notification.type === "order"
                ).length
              }
            </h3>
          </div>

        </div>


        <div className="notification-summary-card">

          <div className="notification-summary-icon red">
            ⚠️
          </div>

          <div>
            <p>Stock Alerts</p>
            <h3>
              {
                notifications.filter(
                  (notification) =>
                    notification.type === "urgent" ||
                    notification.type === "stock"
                ).length
              }
            </h3>
          </div>

        </div>

      </section>


      {/* =====================================================
          FILTERS
          ===================================================== */}

      <section className="notification-container">

        <div className="notification-filter-bar">

          <button
            className={
              filter === "all"
                ? "notification-filter active"
                : "notification-filter"
            }
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            className={
              filter === "unread"
                ? "notification-filter active"
                : "notification-filter"
            }
            onClick={() => setFilter("unread")}
          >
            Unread
            {unreadCount > 0 && (
              <span className="filter-count">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            className={
              filter === "orders"
                ? "notification-filter active"
                : "notification-filter"
            }
            onClick={() => setFilter("orders")}
          >
            Medicine Requests
          </button>

          <button
            className={
              filter === "alerts"
                ? "notification-filter active"
                : "notification-filter"
            }
            onClick={() => setFilter("alerts")}
          >
            Stock Alerts
          </button>

        </div>


        {/* =================================================
            NOTIFICATION LIST
            ================================================= */}

        <div className="notification-list">

          {filteredNotifications.length === 0 ? (

            <div className="empty-notifications">

              <div className="empty-notification-icon">
                🔔
              </div>

              <h3>No notifications</h3>

              <p>
                You don't have any notifications in
                this category.
              </p>

            </div>

          ) : (

            filteredNotifications.map(
              (notification) => (

                <div
                  key={notification.id}
                  className={
                    notification.read
                      ? "notification-item read"
                      : "notification-item unread"
                  }
                >

                  {/* Icon */}

                  <div
                    className={`notification-icon ${notification.type}`}
                  >
                    {getIcon(notification.type)}
                  </div>


                  {/* Content */}

                  <div className="notification-content">

                    <div className="notification-title-row">

                      <h3>
                        {notification.title}
                      </h3>

                      {!notification.read && (
                        <span className="unread-dot"></span>
                      )}

                    </div>

                    <p className="notification-message">
                      {notification.message}
                    </p>


                    {/* Customer / Medicine Details */}

                    {(notification.customer ||
                      notification.medicine) && (

                      <div className="notification-details">

                        {notification.customer && (
                          <div>
                            <span>
                              Customer
                            </span>

                            <strong>
                              {notification.customer}
                            </strong>
                          </div>
                        )}

                        {notification.medicine && (
                          <div>
                            <span>
                              Medicine
                            </span>

                            <strong>
                              {notification.medicine}
                            </strong>
                          </div>
                        )}

                        {notification.quantity !==
                          undefined && (
                          <div>
                            <span>
                              Quantity
                            </span>

                            <strong>
                              {notification.quantity}
                            </strong>
                          </div>
                        )}

                      </div>

                    )}


                    <div className="notification-footer">

                      <span className="notification-time">
                        {notification.time}
                      </span>


                      {/* Action */}

                      {notification.type ===
                        "order" &&
                        !notification.read && (
                          <button
                            className="review-button"
                            onClick={() =>
                              markAsRead(
                                notification.id
                              )
                            }
                          >
                            Review Request
                          </button>
                        )}

                      {!notification.read &&
                        notification.type !==
                          "order" && (
                          <button
                            className="read-button"
                            onClick={() =>
                              markAsRead(
                                notification.id
                              )
                            }
                          >
                            Mark as read
                          </button>
                        )}

                      <button
                        className="delete-button"
                        onClick={() =>
                          removeNotification(
                            notification.id
                          )
                        }
                        title="Remove notification"
                      >
                        ×
                      </button>

                    </div>

                  </div>

                </div>

              )
            )

          )}

        </div>

      </section>

    </div>
  );
};

export default PharmacistNotifications;