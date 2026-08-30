import React, { useEffect, useState } from "react";
import axiosInstance from "@/api/axios";
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
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get("/notifications?role=ROLE_PHARMACIST");
        if (Array.isArray(response.data)) {
          const mapped: Notification[] = response.data.map((item: any) => {
            let nType: "order" | "stock" | "urgent" | "system" = "order";
            const rawType = (item.type || "").toUpperCase();

            if (
              rawType === "NEW_ORDER" ||
              rawType === "PRESCRIPTION_ORDER" ||
              rawType === "ORDER"
            ) {
              nType = "order";
            } else if (
              rawType === "LOW_STOCK" ||
              rawType === "OUT_OF_STOCK" ||
              rawType === "EXPIRED"
            ) {
              nType = "urgent";
            } else if (rawType === "EXPIRY") {
              nType = "stock";
            }

            let title = item.title;
            if (!title || title === "Order / Inventory Notification") {
              if (rawType === "PRESCRIPTION_ORDER") {
                title = "Medicine Order (With Prescription)";
              } else if (rawType === "NEW_ORDER") {
                title = "Medicine Order (Without Prescription)";
              } else if (rawType === "LOW_STOCK") {
                title = "Low Stock Alert";
              } else {
                title = "Medicine Order";
              }
            }

            const customerMatch = item.message?.match(/from ([^.]+?)(?=\.|\s+Order|\s+Items|$)/i);
            const customerName = customerMatch ? customerMatch[1]?.trim() : undefined;

            return {
              id: item.id,
              type: nType,
              title,
              message: item.message,
              customer: customerName,
              medicine: item.message?.includes("Items:")
                ? item.message.split("Items:")[1]?.split(".")[0]?.trim()
                : undefined,
              time: item.timestamp
                ? new Date(item.timestamp).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "Just now",
              read: Boolean(item.isRead),
            };
          });
          setNotifications(mapped);
        }
      } catch (err) {
        console.warn("Could not load pharmacist notifications:", err);
      }
    };
    fetchNotifications();
  }, []);

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

  const markAsRead = async (id: number) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
    } catch (err) {
      console.warn("Could not mark notification as read in backend:", err);
    }
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

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter((n) => !n.read)
          .map((n) => axiosInstance.put(`/notifications/${n.id}/read`))
      );
    } catch (err) {
      console.warn("Could not mark all as read:", err);
    }
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const removeNotification = async (id: number) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
    } catch (err) {
      console.warn("Could not delete notification in backend:", err);
    }
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