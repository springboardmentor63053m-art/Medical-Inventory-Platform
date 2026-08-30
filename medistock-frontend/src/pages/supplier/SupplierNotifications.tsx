import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/api/axios";
import { toast } from "sonner";
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

const initialNotifications: Notification[] = [];

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const SupplierNotifications: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const supplierName = useMemo(() => {
    const rawUser = user || (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "null");
      } catch {
        return null;
      }
    })();

    const name =
      rawUser?.username ||
      rawUser?.name ||
      rawUser?.fullName ||
      localStorage.getItem("username") ||
      "Supplier";

    return String(name)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [user]);

  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const [selectedPO, setSelectedPO] = useState<any | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [loadingPO, setLoadingPO] = useState<boolean>(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const rawUser = user || (() => {
          try {
            return JSON.parse(localStorage.getItem("user") || "null");
          } catch {
            return null;
          }
        })();

        const userId = rawUser?.id || rawUser?.userId;
        const endpoint = userId ? `/notifications?userId=${userId}` : "/notifications?role=ROLE_SUPPLIER";
        const response = await axiosInstance.get(endpoint);

        if (Array.isArray(response.data)) {
          const mapped: Notification[] = response.data.map((item: any) => {
            const rawType = String(item.type || "").toUpperCase();
            let normType: "order" | "delivery" | "stock" | "system" = "order";
            if (rawType.includes("STOCK")) normType = "stock";
            else if (rawType.includes("DELIVERY")) normType = "delivery";
            else if (rawType.includes("SYSTEM")) normType = "system";

            return {
              id: item.id,
              title: item.title || "New Stock Order",
              message: item.message || "",
              time: item.timestamp
                ? new Date(item.timestamp).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "Just now",
              type: normType,
              read: Boolean(item.isRead),
            };
          });
          setNotifications(mapped);
        }
      } catch (err) {
        console.error("Failed to load supplier notifications:", err);
      }
    };
    fetchNotifications();
  }, [user]);

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

  const markAsRead = async (id: number) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
    } catch {
      // non-blocking
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

  const getPoTotalAmount = (po: any): number => {
    if (!po) return 0;
    if (po.totalAmount && Number(po.totalAmount) > 0) return Number(po.totalAmount);
    if (po.amount && Number(po.amount) > 0) return Number(po.amount);
    if (Array.isArray(po.items) && po.items.length > 0) {
      return po.items.reduce((sum: number, item: any) => {
        const p = item.price || item.medicine?.price || 0;
        const q = item.quantity || 0;
        return sum + p * q;
      }, 0);
    }
    return 0;
  };

  const handleOpenReviewModal = async (poId: number | string | null) => {
    setShowReviewModal(true);
    setLoadingPO(true);
    setSelectedPO(null);

    if (!poId) {
      setSelectedPO({
        id: "—",
        supplierName: supplierName,
        orderDate: new Date().toISOString().slice(0, 10),
        status: "PENDING",
        totalAmount: 0,
        items: [],
      });
      setLoadingPO(false);
      return;
    }

    try {
      const response = await axiosInstance.get(`/purchaseorders/${poId}`);
      if (response.data) {
        setSelectedPO(response.data);
      } else {
        throw new Error("No PO data");
      }
    } catch {
      try {
        const allRes = await axiosInstance.get("/purchaseorders");
        if (Array.isArray(allRes.data)) {
          const found = allRes.data.find((item: any) => String(item.id) === String(poId));
          if (found) {
            setSelectedPO(found);
          } else {
            setSelectedPO({
              id: poId,
              supplierName: supplierName,
              orderDate: new Date().toISOString().slice(0, 10),
              status: "PENDING",
              totalAmount: 0,
              items: [],
            });
          }
        }
      } catch {
        setSelectedPO({
          id: poId,
          supplierName: supplierName,
          orderDate: new Date().toISOString().slice(0, 10),
          status: "PENDING",
          totalAmount: 0,
          items: [],
        });
      }
    } finally {
      setLoadingPO(false);
    }
  };

  const openOrderReview = async (notification: Notification) => {
    markAsRead(notification.id);
    const match = notification.message.match(/#PO-(\d+)/i);
    const poId = match ? match[1] : null;
    await handleOpenReviewModal(poId);
  };

  const handleBillSubmission = async (poId: number | string, currentAmount: number) => {
    const calcAmount = currentAmount || getPoTotalAmount(selectedPO);
    const inputAmount = window.prompt(
      "Enter invoice / bill total amount (₹):",
      String(calcAmount)
    );
    if (inputAmount === null) return;
    const amount = Number(inputAmount) || calcAmount;

    try {
      await axiosInstance.post(`/purchaseorders/${poId}/submit-bill`, {
        amount,
      });
      toast.success(`Bill for Stock Order #PO-${poId} submitted successfully to Admin!`);
      if (selectedPO) {
        setSelectedPO({ ...selectedPO, status: "BILL_SUBMITTED" });
      }
    } catch {
      toast.error("Failed to submit bill. Please try again.");
    }
  };

  /* =====================================================
     MARK ALL AS READ
     ===================================================== */

  const markAllAsRead = async () => {
    notifications.forEach(async (n) => {
      if (!n.read) {
        try {
          await axiosInstance.put(`/notifications/${n.id}/read`);
        } catch {
          // ignore
        }
      }
    });
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

                      <button
                        type="button"
                        onClick={() => openOrderReview(notification)}
                        style={{
                          border: "none",
                          borderRadius: "8px",
                          padding: "6px 14px",
                          background: "#2563eb",
                          color: "#ffffff",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                          marginRight: "8px",
                        }}
                      >
                        Review Order →
                      </button>

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

      {showReviewModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReviewModal(false);
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              maxWidth: "520px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "16px",
                marginBottom: "20px",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "1px",
                    color: "#2563eb",
                    textTransform: "uppercase",
                  }}
                >
                  STOCK ORDER DETAILS
                </span>
                <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  Purchase Order #{selectedPO?.id || "—"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ×
              </button>
            </div>

            {loadingPO ? (
              <div style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                Loading purchase order details...
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "20px",
                    background: "#f8fafc",
                    padding: "16px",
                    borderRadius: "12px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Supplier</span>
                    <strong style={{ fontSize: "14px", color: "#0f172a" }}>
                      {selectedPO?.supplier?.name || supplierName}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Order Status</span>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "12px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background: selectedPO?.status === "BILL_SUBMITTED" || selectedPO?.status === "COMPLETED" ? "#dcfce7" : "#fef3c7",
                        color: selectedPO?.status === "BILL_SUBMITTED" || selectedPO?.status === "COMPLETED" ? "#166534" : "#92400e",
                      }}
                    >
                      {selectedPO?.status === "BILL_SUBMITTED" ? "Bill Submitted" : selectedPO?.status || "PENDING"}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Order Date</span>
                    <strong style={{ fontSize: "14px", color: "#0f172a" }}>
                      {selectedPO?.orderDate
                        ? new Date(selectedPO.orderDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Today"}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Total Value</span>
                    <strong style={{ fontSize: "14px", color: "#059669" }}>
                      ₹{getPoTotalAmount(selectedPO).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
                    Requested Medicines & Quantities
                  </h4>
                  <div
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "12px",
                      background: "#ffffff",
                      maxHeight: "220px",
                      overflowY: "auto",
                    }}
                  >
                    {Array.isArray(selectedPO?.items) && selectedPO.items.length > 0 ? (
                      selectedPO.items.map((item: any, idx: number) => (
                        <div
                          key={item.id || idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "13px",
                            padding: "6px 0",
                            borderBottom: idx === selectedPO.items.length - 1 ? "none" : "1px solid #f1f5f9",
                          }}
                        >
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>
                            {item.medicine?.name || item.medicineName || "Medicine Item"}
                          </span>
                          <strong style={{ color: "#2563eb", background: "#eff6ff", padding: "2px 10px", borderRadius: "12px", fontSize: "12px" }}>
                            {item.quantity} Units
                          </strong>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: "#64748b", fontSize: "13px", textAlign: "center", padding: "8px 0" }}>
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
                    onClick={() => setShowReviewModal(false)}
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
                    onClick={() => handleBillSubmission(selectedPO?.id || 1, getPoTotalAmount(selectedPO))}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#2563eb",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Submit Bill
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierNotifications;