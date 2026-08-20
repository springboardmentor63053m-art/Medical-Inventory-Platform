import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/supplier-dashboard.css";
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

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const SupplierNotifications: React.FC = () => {
  const navigate = useNavigate();

  const user = getUser();

  const supplierName = String(
    user?.username ||
      user?.name ||
      user?.fullName ||
      "Rahul"
  )
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const initials =
    supplierName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "R";

  /* =====================================================
     MARK ONE AS READ
     ===================================================== */

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

  /* =====================================================
     MARK ALL AS READ
     ===================================================== */

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  /* =====================================================
     DELETE NOTIFICATION
     ===================================================== */

  const deleteNotification = (id: number) => {
    setNotifications((previous) =>
      previous.filter(
        (notification) => notification.id !== id
      )
    );
  };

  /* =====================================================
     LOGOUT
     ===================================================== */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  };

  return (
    <div className="supplier-app">

      {/* =================================================
          SIDEBAR
          ================================================= */}

      <aside className="supplier-sidebar">

        {/* BRAND */}

        <div className="supplier-brand">

          <div className="supplier-brand-logo">
            <span>⌁</span>
          </div>

          <div>
            <h2>
              Medi<span>Stock</span>
            </h2>

            <p>
              MEDICAL INVENTORY
            </p>
          </div>

        </div>

        {/* SUPPLIER ROLE */}

        <div className="supplier-role">

          <div className="supplier-role-icon">
            ✓
          </div>

          <div>
            <strong>
              Supplier
            </strong>

            <span>
              Supplier Portal
            </span>
          </div>

        </div>

        <div className="supplier-menu-title">
          MAIN MENU
        </div>

        {/* =================================================
            NAVIGATION
            ================================================= */}

        <nav className="supplier-navigation">

          {/* DASHBOARD */}

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() =>
              navigate("/supplier/dashboard")
            }
          >
            <span>▦</span>
            <strong>
              Dashboard
            </strong>
          </button>

          {/* MY MEDICINES */}

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() =>
              navigate("/supplier/medicines")
            }
          >
            <span>💊</span>
            <strong>
              My Medicines
            </strong>
          </button>

          {/* PURCHASE ORDERS */}

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() =>
              navigate("/supplier/purchases")
            }
          >
            <span>🛒</span>
            <strong>
              Purchase Orders
            </strong>
          </button>

          {/* SUPPLY ACTIVITY */}

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() =>
              navigate("/supplier/activity")
            }
          >
            <span>◷</span>
            <strong>
              Supply Activity
            </strong>
          </button>

          {/* MY PROFILE */}

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() =>
              navigate("/supplier/profile")
            }
          >
            <span>♙</span>
            <strong>
              My Profile
            </strong>
          </button>

          {/* NOTIFICATIONS */}

          <button
            type="button"
            className="supplier-nav-item active"
            onClick={() =>
              navigate("/supplier/notifications")
            }
          >
            <span>♧</span>

            <strong>
              Notifications
            </strong>

            {unreadCount > 0 && (
              <em>
                {unreadCount}
              </em>
            )}
          </button>

        </nav>

        {/* LOGOUT */}

        <div className="supplier-sidebar-bottom">

          <button
            type="button"
            className="supplier-logout"
            onClick={logout}
          >
            <span>↪</span>

            <strong>
              Logout
            </strong>
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <main className="supplier-main">

        {/* =================================================
            TOP BAR
            ================================================= */}

        <header className="supplier-topbar">

          <div className="supplier-topbar-title">

            <h1>
              Notifications
            </h1>

            <p>
              MediStock Medical Inventory Platform
            </p>

          </div>

          <div className="supplier-topbar-right">

            {/* Notification button */}

            <button
              type="button"
              className="supplier-notification-button"
              onClick={() =>
                navigate("/supplier/notifications")
              }
            >
              ♧
              {unreadCount > 0 && (
                <span />
              )}
            </button>

            {/* User */}

            <div className="supplier-user">

              <div className="supplier-user-avatar">
                {initials}
              </div>

              <div>

                <strong>
                  {supplierName}
                </strong>

                <span>
                  Supplier
                </span>

              </div>

            </div>

            {/* Logout */}

            <button
              type="button"
              className="supplier-top-logout"
              onClick={logout}
            >
              ↪ Logout
            </button>

          </div>

        </header>

        {/* =================================================
            PAGE CONTENT
            ================================================= */}

        <div className="supplier-content">

          {/* PAGE HEADING */}

          <section className="supplier-page-heading">

            <div>

              <div className="supplier-eyebrow">
                SUPPLIER PORTAL
              </div>

              <h1>
                Notifications
              </h1>

              <p>
                Stay updated about your purchase
                orders, deliveries and account.
              </p>

            </div>

            <button
              type="button"
              className="supplier-notifications-read-all"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              ✓ Mark all as read
            </button>

          </section>

          {/* =================================================
              SUMMARY
              ================================================= */}

          <section className="supplier-notifications-summary">

            <div className="notification-summary-icon">
              🔔
            </div>

            <div>

              <strong>
                {unreadCount} unread notification
                {unreadCount !== 1 ? "s" : ""}
              </strong>

              <p>
                You have {notifications.length} total
                notifications.
              </p>

            </div>

          </section>

          {/* =================================================
              NOTIFICATION CARD
              ================================================= */}

          <section className="supplier-notifications-card">

            {/* CARD HEADER */}

            <div className="supplier-notifications-card-header">

              <div>

                <h2>
                  Recent Notifications
                </h2>

                <p>
                  Important updates related to your
                  supplier account.
                </p>

              </div>

              <span>
                {notifications.length} notifications
              </span>

            </div>

            {/* =================================================
                NOTIFICATION LIST
                ================================================= */}

            <div className="supplier-notification-list">

              {notifications.length === 0 ? (

                <div className="supplier-notifications-empty">

                  <div>
                    🔔
                  </div>

                  <h3>
                    No notifications
                  </h3>

                  <p>
                    You're all caught up.
                  </p>

                </div>

              ) : (

                notifications.map((notification) => (

                  <div
                    key={notification.id}
                    className={`supplier-notification ${
                      notification.read
                        ? "read"
                        : "unread"
                    }`}
                  >

                    {/* ICON */}

                    <div
                      className={`supplier-notification-icon ${notification.type}`}
                    >
                      {notification.type ===
                        "order" && "🛒"}

                      {notification.type ===
                        "delivery" && "📦"}

                      {notification.type ===
                        "stock" && "⚠"}

                      {notification.type ===
                        "system" && "✓"}
                    </div>

                    {/* CONTENT */}

                    <div className="supplier-notification-content">

                      <div className="supplier-notification-title-row">

                        <h3>
                          {notification.title}
                        </h3>

                        {!notification.read && (
                          <span className="supplier-notification-new">
                            NEW
                          </span>
                        )}

                      </div>

                      <p>
                        {notification.message}
                      </p>

                      <span className="supplier-notification-time">
                        {notification.time}
                      </span>

                    </div>

                    {/* ACTIONS */}

                    <div className="supplier-notification-actions">

                      {!notification.read && (

                        <button
                          type="button"
                          onClick={() =>
                            markAsRead(
                              notification.id
                            )
                          }
                        >
                          Mark read
                        </button>

                      )}

                      <button
                        type="button"
                        className="notification-delete"
                        onClick={() =>
                          deleteNotification(
                            notification.id
                          )
                        }
                      >
                        ×
                      </button>

                    </div>

                  </div>

                ))

              )}

            </div>

          </section>

        </div>

      </main>

    </div>
  );
};

export default SupplierNotifications;