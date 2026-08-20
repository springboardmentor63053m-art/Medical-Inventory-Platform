import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  PackageX,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import "./AdminNotifications.css";

type NotificationType =
  | "LOW_STOCK"
  | "OUT_OF_STOCK"
  | "EXPIRY"
  | "EXPIRED";

type NotificationStatus = "UNREAD" | "READ";

interface AdminNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  medicine: string;
  time: string;
  status: NotificationStatus;
}

const initialNotifications: AdminNotification[] = [
  {
    id: 1,
    type: "OUT_OF_STOCK",
    title: "Out of Stock",
    message: "Insulin 10ml is currently out of stock.",
    medicine: "Insulin 10ml",
    time: "Today, 10:30 AM",
    status: "UNREAD",
  },
  {
    id: 2,
    type: "LOW_STOCK",
    title: "Low Stock Alert",
    message:
      "Amoxicillin 250mg is below the reorder level.",
    medicine: "Amoxicillin 250mg",
    time: "Today, 09:45 AM",
    status: "UNREAD",
  },
  {
    id: 3,
    type: "EXPIRY",
    title: "Medicine Expiring Soon",
    message:
      "Paracetamol 500mg expires within 30 days.",
    medicine: "Paracetamol 500mg",
    time: "Today, 09:20 AM",
    status: "UNREAD",
  },
  {
    id: 4,
    type: "EXPIRED",
    title: "Expired Medicine",
    message:
      "Cetirizine 10mg has already expired.",
    medicine: "Cetirizine 10mg",
    time: "Today, 08:50 AM",
    status: "UNREAD",
  },
  {
    id: 5,
    type: "LOW_STOCK",
    title: "Low Stock Alert",
    message:
      "Azithromycin 500mg stock is below the reorder level.",
    medicine: "Azithromycin 500mg",
    time: "Yesterday, 05:30 PM",
    status: "READ",
  },
  {
    id: 6,
    type: "EXPIRY",
    title: "Expiry Reminder",
    message:
      "Vitamin C 500mg will expire within 60 days.",
    medicine: "Vitamin C 500mg",
    time: "Yesterday, 03:15 PM",
    status: "READ",
  },
  {
    id: 7,
    type: "LOW_STOCK",
    title: "Low Stock Alert",
    message:
      "Metformin 500mg is approaching its reorder level.",
    medicine: "Metformin 500mg",
    time: "Yesterday, 11:40 AM",
    status: "READ",
  },
];

const getNotificationIcon = (
  type: NotificationType
) => {
  switch (type) {
    case "OUT_OF_STOCK":
      return <PackageX size={21} />;

    case "LOW_STOCK":
      return <AlertTriangle size={21} />;

    case "EXPIRY":
      return <Clock3 size={21} />;

    case "EXPIRED":
      return <XCircle size={21} />;

    default:
      return <Bell size={21} />;
  }
};

const getNotificationClass = (
  type: NotificationType
) => {
  switch (type) {
    case "OUT_OF_STOCK":
      return "notification-danger";

    case "LOW_STOCK":
      return "notification-warning";

    case "EXPIRY":
      return "notification-expiry";

    case "EXPIRED":
      return "notification-expired";

    default:
      return "";
  }
};

const AdminNotifications = () => {
  const [notifications, setNotifications] =
    useState<AdminNotification[]>(
      initialNotifications
    );

  const [filter, setFilter] = useState<
    "ALL" | "UNREAD" | "CRITICAL"
  >("ALL");

  const [search, setSearch] = useState("");

  const unreadCount = notifications.filter(
    (notification) =>
      notification.status === "UNREAD"
  ).length;

  const criticalCount = notifications.filter(
    (notification) =>
      notification.type === "OUT_OF_STOCK" ||
      notification.type === "EXPIRED"
  ).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        notification.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        notification.message
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        notification.medicine
          .toLowerCase()
          .includes(search.toLowerCase());

      if (!matchesSearch) {
        return false;
      }

      if (filter === "UNREAD") {
        return notification.status === "UNREAD";
      }

      if (filter === "CRITICAL") {
        return (
          notification.type === "OUT_OF_STOCK" ||
          notification.type === "EXPIRED"
        );
      }

      return true;
    });
  }, [notifications, search, filter]);

  const markAsRead = (id: number) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              status: "READ",
            }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        status: "READ",
      }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications((current) =>
      current.filter(
        (notification) =>
          notification.id !== id
      )
    );
  };

  const refreshNotifications = () => {
    setNotifications([...initialNotifications]);
    setSearch("");
    setFilter("ALL");
  };

  return (
    <div className="admin-notifications-page">

      {/* HEADER */}
      <div className="notifications-header">
        <div>
          <div className="notifications-eyebrow">
            MEDISTOCK • ALERT CENTER
          </div>

          <h1>Notifications</h1>

          <p>
            Monitor stock and expiry alerts that
            require your attention.
          </p>
        </div>

        <div className="notifications-header-actions">
          <button
            className="notification-refresh"
            onClick={refreshNotifications}
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          <button
            className="mark-all-button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCircle2 size={18} />
            Mark All Read
          </button>
        </div>
      </div>

      {/* BLUE HERO */}
      <div className="notifications-hero">

        <div className="notifications-hero-content">
          <div className="notifications-hero-icon">
            <Bell size={30} />
          </div>

          <div>
            <span>INVENTORY ALERT CENTER</span>

            <h2>
              Stay ahead of stock
              <br />
              and expiry problems.
            </h2>

            <p>
              Low-stock, out-of-stock and medicine
              expiry alerts are shown here.
            </p>
          </div>
        </div>

        <div className="notifications-hero-count">
          <strong>{unreadCount}</strong>
          <span>Unread Alerts</span>
        </div>

      </div>

      {/* SUMMARY CARDS */}
      <div className="notification-summary-grid">

        <button
          className={`notification-stat ${
            filter === "ALL" ? "selected" : ""
          }`}
          onClick={() => setFilter("ALL")}
        >
          <div className="notification-stat-icon blue">
            <Bell size={24} />
          </div>

          <div>
            <span>Total Alerts</span>
            <strong>{notifications.length}</strong>
            <small>All notifications</small>
          </div>
        </button>

        <button
          className={`notification-stat ${
            filter === "UNREAD" ? "selected" : ""
          }`}
          onClick={() => setFilter("UNREAD")}
        >
          <div className="notification-stat-icon orange">
            <AlertTriangle size={24} />
          </div>

          <div>
            <span>Unread</span>
            <strong>{unreadCount}</strong>
            <small>Need attention</small>
          </div>
        </button>

        <button
          className={`notification-stat ${
            filter === "CRITICAL" ? "selected" : ""
          }`}
          onClick={() => setFilter("CRITICAL")}
        >
          <div className="notification-stat-icon red">
            <XCircle size={24} />
          </div>

          <div>
            <span>Critical</span>
            <strong>{criticalCount}</strong>
            <small>Immediate action</small>
          </div>
        </button>

        <div className="notification-stat">
          <div className="notification-stat-icon green">
            <CheckCircle2 size={24} />
          </div>

          <div>
            <span>Read</span>
            <strong>
              {
                notifications.filter(
                  (item) =>
                    item.status === "READ"
                ).length
              }
            </strong>
            <small>Reviewed alerts</small>
          </div>
        </div>

      </div>

      {/* FILTER */}
      <div className="notifications-filter">

        <div className="notification-search">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search notifications or medicines..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="notification-tabs">

          <button
            className={
              filter === "ALL"
                ? "active"
                : ""
            }
            onClick={() => setFilter("ALL")}
          >
            All
          </button>

          <button
            className={
              filter === "UNREAD"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("UNREAD")
            }
          >
            Unread
          </button>

          <button
            className={
              filter === "CRITICAL"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("CRITICAL")
            }
          >
            Critical
          </button>

        </div>

      </div>

      {/* NOTIFICATION LIST */}
      <div className="notification-list-card">

        <div className="notification-list-header">
          <div>
            <h2>Recent Alerts</h2>

            <p>
              {filteredNotifications.length} alerts
              displayed
            </p>
          </div>
        </div>

        {filteredNotifications.length === 0 ? (

          <div className="notifications-empty">
            <CheckCircle2 size={48} />

            <h3>No notifications found</h3>

            <p>
              There are no notifications matching
              your current filter.
            </p>
          </div>

        ) : (

          <div className="notification-list">

            {filteredNotifications.map(
              (notification) => (

                <div
                  key={notification.id}
                  className={`notification-item ${
                    notification.status ===
                    "UNREAD"
                      ? "unread"
                      : ""
                  }`}
                >

                  <div
                    className={`notification-icon ${getNotificationClass(
                      notification.type
                    )}`}
                  >
                    {getNotificationIcon(
                      notification.type
                    )}
                  </div>

                  <div className="notification-content">

                    <div className="notification-title-row">

                      <h3>
                        {notification.title}
                      </h3>

                      {notification.status ===
                        "UNREAD" && (
                        <span className="unread-badge">
                          NEW
                        </span>
                      )}

                    </div>

                    <p>
                      {notification.message}
                    </p>

                    <div className="notification-meta">
                      <span>
                        Medicine:{" "}
                        <strong>
                          {notification.medicine}
                        </strong>
                      </span>

                      <span>
                        {notification.time}
                      </span>
                    </div>

                  </div>

                  <div className="notification-actions">

                    {notification.status ===
                      "UNREAD" && (
                      <button
                        className="read-button"
                        onClick={() =>
                          markAsRead(
                            notification.id
                          )
                        }
                      >
                        <CheckCircle2
                          size={16}
                        />
                        Mark Read
                      </button>
                    )}

                    <button
                      className="delete-notification"
                      onClick={() =>
                        deleteNotification(
                          notification.id
                        )
                      }
                      title="Delete notification"
                    >
                      <Trash2 size={17} />
                    </button>

                  </div>

                </div>

              )
            )}

          </div>
        )}

      </div>

      {/* ALERT RULES */}
      <div className="notification-rules">

        <div className="notification-rules-header">
          <h2>Alert Types</h2>

          <p>
            Notifications generated from inventory
            monitoring conditions.
          </p>
        </div>

        <div className="notification-rules-grid">

          <div className="notification-rule danger">
            <PackageX size={22} />

            <div>
              <strong>Out of Stock</strong>

              <span>
                Medicine quantity reaches 0.
              </span>
            </div>
          </div>

          <div className="notification-rule warning">
            <AlertTriangle size={22} />

            <div>
              <strong>Low Stock</strong>

              <span>
                Quantity falls below reorder level.
              </span>
            </div>
          </div>

          <div className="notification-rule expiry">
            <Clock3 size={22} />

            <div>
              <strong>Expiry Alert</strong>

              <span>
                Medicine expires within 30 days.
              </span>
            </div>
          </div>

          <div className="notification-rule expired">
            <XCircle size={22} />

            <div>
              <strong>Expired</strong>

              <span>
                Medicine expiry date has passed.
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminNotifications;