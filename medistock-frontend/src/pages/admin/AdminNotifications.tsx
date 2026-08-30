import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axios";
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
  | "EXPIRED"
  | "BILL_SUBMITTED";

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

    case "BILL_SUBMITTED":
      return <CheckCircle2 size={21} />;

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

    case "BILL_SUBMITTED":
      return "notification-success";

    default:
      return "";
  }
};

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [loadingPO, setLoadingPO] = useState(false);
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [selectedLowStockData, setSelectedLowStockData] = useState<any>(null);

  const [filter, setFilter] = useState<
    "ALL" | "UNREAD" | "CRITICAL"
  >("ALL");

  const [search, setSearch] = useState("");

  const handleNotificationClick = async (notification: AdminNotification) => {
    markAsRead(notification.id);

    const match = notification.message?.match(/#PO-(\d+)/i);
    const poId = match ? match[1] : null;

    if (poId) {
      setShowBillModal(true);
      setLoadingPO(true);
      setSelectedPO(null);

      try {
        const response = await axiosInstance.get(`/purchaseorders/${poId}`);
        if (response.data) {
          setSelectedPO(response.data);
        }
      } catch (err) {
        console.warn("Could not load PO details for admin review:", err);
      } finally {
        setLoadingPO(false);
      }
    } else {
      let medName = notification.medicine || "Medicine";
      if (notification.message?.includes("alert for ")) {
        const medMatch = notification.message.match(/alert for (.+?)\./i);
        if (medMatch) medName = medMatch[1].trim();
      }

      let stockQty = "Low";
      if (notification.message?.includes("Current Stock: ")) {
        const stockMatch = notification.message.match(/Current Stock:\s*(\d+\s*\w*)/i);
        if (stockMatch) stockQty = stockMatch[1];
      }

      setSelectedLowStockData({
        id: notification.id,
        medicineName: medName,
        stockQuantity: stockQty,
        message: notification.message,
        time: notification.time,
        title: notification.title,
      });
      setShowLowStockModal(true);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get("/notifications?role=ROLE_ADMIN");
      if (Array.isArray(response.data)) {
        const mapped: AdminNotification[] = response.data.map((item: any) => {
          let type: NotificationType = "LOW_STOCK";
          if (item.type) {
            type = item.type as NotificationType;
          } else if (item.message?.toLowerCase().includes("out of stock")) {
            type = "OUT_OF_STOCK";
          } else if (item.message?.toLowerCase().includes("expired")) {
            type = "EXPIRED";
          } else if (item.message?.toLowerCase().includes("expir")) {
            type = "EXPIRY";
          }

          let title = item.title;
          if (!title) {
            if (type === "OUT_OF_STOCK") title = "Out of Stock";
            else if (type === "LOW_STOCK") title = "Low Stock Alert";
            else if (type === "EXPIRED") title = "Expired Medicine";
            else title = "Medicine Expiring Soon";
          }

          let medName = "Inventory";
          if (type === "BILL_SUBMITTED" || item.type === "BILL_SUBMITTED") {
            type = "BILL_SUBMITTED";
            const supMatch = item.message?.match(/submitted by (.+?) for Stock Order/i);
            medName = supMatch ? supMatch[1]?.trim() : "Supplier Invoice";
          } else if (item.message?.includes("Low Stock Alert:")) {
            const medMatch = item.message?.match(/Low Stock Alert:\s*(.+?)\s+stock is below/i);
            medName = medMatch ? medMatch[1]?.trim() : item.message?.split(" ")[3] || "Medicine";
          } else {
            medName = item.message?.split(" ")[0] || "Medicine";
          }

          return {
            id: item.id,
            type,
            title,
            message: item.message,
            medicine: medName,
            time: item.timestamp
              ? new Date(item.timestamp).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Just now",
            status: item.isRead ? "READ" : "UNREAD",
          };
        });
        setNotifications(mapped);
      }
    } catch (err) {
      console.warn("Could not load backend notifications:", err);
    }
  };

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

  const markAsRead = async (id: number) => {
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
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
    } catch (err) {
      console.warn("Could not mark notification as read on server:", err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        status: "READ",
      }))
    );
    notifications.forEach(async (n) => {
      if (n.status === "UNREAD") {
        try {
          await axiosInstance.put(`/notifications/${n.id}/read`);
        } catch (e) {}
      }
    });
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
                  onClick={() => handleNotificationClick(notification)}
                  style={{ cursor: "pointer" }}
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
                    {notification.message?.includes("#PO-") ? (
                      <button
                        className="read-button"
                        style={{
                          background: "#2563eb",
                          color: "#ffffff",
                          borderColor: "#2563eb",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationClick(notification);
                        }}
                      >
                        Review Bill Details →
                      </button>
                    ) : (
                      <button
                        className="read-button"
                        style={{
                          background: "#ea580c",
                          color: "#ffffff",
                          borderColor: "#ea580c",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationClick(notification);
                        }}
                      >
                        Review Low Stock →
                      </button>
                    )}

                    {notification.status ===
                      "UNREAD" && (
                      <button
                        className="read-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(
                            notification.id
                          );
                        }}
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

      {/* ADMIN SUBMITTED BILL DETAILS MODAL */}
      {showBillModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "560px",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#2563eb",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Submitted Bill & Stock Order Verification
                </span>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#0f172a",
                    marginTop: "2px",
                  }}
                >
                  Stock Order #PO-{selectedPO?.id || "—"} Details
                </h3>
              </div>
              <button
                onClick={() => setShowBillModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#64748b",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {loadingPO ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "36px 0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Loading order and bill details...
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    background: "#f8fafc",
                    padding: "16px",
                    borderRadius: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>
                      Supplier Name
                    </span>
                    <strong style={{ fontSize: "14px", color: "#0f172a" }}>
                      {selectedPO?.supplier?.name || "Supplier"}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>
                      Order / Bill Status
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "12px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background:
                          selectedPO?.status === "COMPLETED"
                            ? "#dcfce7"
                            : "#fef3c7",
                        color:
                          selectedPO?.status === "COMPLETED"
                            ? "#166534"
                            : "#92400e",
                      }}
                    >
                      {selectedPO?.status === "BILL_SUBMITTED"
                        ? "Bill Submitted"
                        : selectedPO?.status || "PENDING"}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>
                      Order Date
                    </span>
                    <strong style={{ fontSize: "14px", color: "#0f172a" }}>
                      {selectedPO?.orderDate
                        ? new Date(selectedPO.orderDate).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "Today"}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>
                      Total Bill Amount
                    </span>
                    <strong style={{ fontSize: "16px", color: "#059669" }}>
                      ₹
                      {Number(
                        selectedPO?.totalAmount || selectedPO?.amount || 0
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#334155",
                      marginBottom: "8px",
                    }}
                  >
                    Bill Item Breakdown (Medicines & Quantities)
                  </h4>
                  <div
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "12px",
                      background: "#ffffff",
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    {Array.isArray(selectedPO?.items) &&
                    selectedPO.items.length > 0 ? (
                      selectedPO.items.map((item: any, idx: number) => (
                        <div
                          key={item.id || idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "13px",
                            padding: "8px 0",
                            borderBottom:
                              idx === selectedPO.items.length - 1
                                ? "none"
                                : "1px solid #f1f5f9",
                          }}
                        >
                          <div>
                            <span
                              style={{
                                fontWeight: 600,
                                color: "#1e293b",
                                display: "block",
                              }}
                            >
                              {item.medicine?.name ||
                                item.medicineName ||
                                "Medicine"}
                            </span>
                            <small style={{ color: "#64748b" }}>
                              Unit Price: ₹
                              {item.price || item.medicine?.price || 0}
                            </small>
                          </div>
                          <strong
                            style={{
                              color: "#2563eb",
                              background: "#eff6ff",
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "12px",
                            }}
                          >
                            {item.quantity} Units (₹
                            {(
                              (item.price || item.medicine?.price || 0) *
                              (item.quantity || 0)
                            ).toLocaleString("en-IN")}
                            )
                          </strong>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: "13px",
                          textAlign: "center",
                          padding: "8px 0",
                        }}
                      >
                        No specific medicine items listed for this order.
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: "16px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowBillModal(false)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Close
                  </button>

                  {selectedPO?.status !== "COMPLETED" && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await axiosInstance.put(
                            `/purchaseorders/${selectedPO.id}`,
                            {
                              ...selectedPO,
                              status: "COMPLETED",
                            }
                          );
                          setSelectedPO({
                            ...selectedPO,
                            status: "COMPLETED",
                          });
                          fetchNotifications();
                        } catch (e) {
                          console.warn("Could not update order status:", e);
                        }
                      }}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#059669",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      ✔ Approve Bill & Complete Order
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN LOW STOCK REPORT MODAL */}
      {showLowStockModal && selectedLowStockData && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "12px",
                marginBottom: "16px",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#ea580c",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Staff Low Stock Report Details
                </span>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#0f172a",
                    marginTop: "2px",
                  }}
                >
                  {selectedLowStockData.title || "Low Stock Medicine Alert"}
                </h3>
              </div>
              <button
                onClick={() => setShowLowStockModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#64748b",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                background: "#fff7ed",
                border: "1px solid #ffedd5",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <strong style={{ fontSize: "16px", color: "#9a3412" }}>
                  {selectedLowStockData.medicineName}
                </strong>
                <span
                  style={{
                    background: "#ea580c",
                    color: "#ffffff",
                    padding: "2px 10px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  LOW STOCK
                </span>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#c2410c",
                  margin: 0,
                  lineHeight: 1.5,
                  fontWeight: 500,
                }}
              >
                {selectedLowStockData.message}
              </p>
              <div
                style={{
                  marginTop: "12px",
                  fontSize: "11px",
                  color: "#9a3412",
                  fontWeight: 600,
                }}
              >
                Report Time: {selectedLowStockData.time}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                borderTop: "1px solid #f1f5f9",
                paddingTop: "16px",
              }}
            >
              <button
                type="button"
                onClick={() => setShowLowStockModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowLowStockModal(false);
                  navigate("/admin/purchases");
                }}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#2563eb",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                + Create Purchase Order →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminNotifications;