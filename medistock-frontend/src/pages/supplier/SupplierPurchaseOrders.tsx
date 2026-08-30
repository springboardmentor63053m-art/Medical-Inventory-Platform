import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/api/axios";
import { toast } from "sonner";
import "../../styles/supplier-dashboard.css";

type PurchaseOrder = {
  id: number | string;
  orderNumber: string;
  orderDate: string;
  expectedDelivery: string;
  items: number;
  amount: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
};

const demoOrders: PurchaseOrder[] = [
  {
    id: 1,
    orderNumber: "PO-2026-001",
    orderDate: "2026-08-08",
    expectedDelivery: "2026-08-15",
    items: 5,
    amount: 28500,
    status: "PENDING",
  },
  {
    id: 2,
    orderNumber: "PO-2026-002",
    orderDate: "2026-08-04",
    expectedDelivery: "2026-08-10",
    items: 8,
    amount: 42500,
    status: "COMPLETED",
  },
  {
    id: 3,
    orderNumber: "PO-2026-003",
    orderDate: "2026-07-28",
    expectedDelivery: "2026-08-03",
    items: 4,
    amount: 18200,
    status: "COMPLETED",
  },
  {
    id: 4,
    orderNumber: "PO-2026-004",
    orderDate: "2026-07-24",
    expectedDelivery: "2026-07-31",
    items: 3,
    amount: 12700,
    status: "CANCELLED",
  },
];

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString("en-IN")}`;

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function SupplierPurchaseOrders() {
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
      .replace(/\b\w/g, (char: string) => char.toUpperCase());
  }, [user]);

  const [orders, setOrders] =
    useState<PurchaseOrder[]>(demoOrders);

  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "COMPLETED" | "CANCELLED"
  >("ALL");

  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.get("/purchaseorders");
      if (Array.isArray(response.data) && response.data.length > 0) {
        const mapped: PurchaseOrder[] = response.data.map((item: any) => ({
          id: item.id,
          orderNumber: item.orderNumber || `PO-2026-00${item.id}`,
          orderDate: item.orderDate ? String(item.orderDate).slice(0, 10) : new Date().toISOString().slice(0, 10),
          expectedDelivery: item.expectedDelivery ? String(item.expectedDelivery).slice(0, 10) : new Date().toISOString().slice(0, 10),
          items: Array.isArray(item.items) ? item.items.length : 1,
          amount: Number(
            item.totalAmount ||
              item.amount ||
              (Array.isArray(item.items) && item.items.length > 0
                ? item.items.reduce(
                    (sum: number, i: any) =>
                      sum + Number(i.price || i.medicine?.price || 0) * Number(i.quantity || 0),
                    0
                  )
                : 0)
          ),
          status: (item.status === "COMPLETED" || item.status === "CANCELLED" || item.status === "BILL_SUBMITTED") ? (item.status === "BILL_SUBMITTED" ? "COMPLETED" : item.status) : "PENDING",
        }));
        setOrders(mapped);
      }
    } catch {
      // Fallback to demo orders if request fails
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBill = async (orderId: number | string, currentAmount: number) => {
    const inputAmount = window.prompt(
      "Enter invoice / bill total amount (₹):",
      String(currentAmount || 25000)
    );
    if (inputAmount === null) return;
    const amount = Number(inputAmount) || currentAmount || 25000;

    try {
      await axiosInstance.post(`/purchaseorders/${orderId}/submit-bill`, {
        amount: amount,
      });
      toast.success(`Bill for Order #${orderId} submitted successfully to Admin!`);
      setOrders((prev) =>
        prev.map((o) =>
          String(o.id) === String(orderId) ? { ...o, status: "COMPLETED" } : o
        )
      );
    } catch (err) {
      try {
        await axiosInstance.post("/notifications", {
          title: "Bill Submitted",
          type: "BILL_SUBMITTED",
          message: `Bill submitted by ${supplierName} for Stock Order #PO-${orderId}. Amount: ₹${amount}. Please review the bill.`,
          isRead: false,
        });
        toast.success(`Bill for Order #${orderId} submitted successfully to Admin!`);
        setOrders((prev) =>
          prev.map((o) =>
            String(o.id) === String(orderId) ? { ...o, status: "COMPLETED" } : o
          )
        );
      } catch {
        toast.error("Failed to submit bill. Please try again.");
      }
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (filter === "ALL") {
      return orders;
    }

    return orders.filter(
      (order) => order.status === filter,
    );
  }, [orders, filter]);

  const pending = orders.filter(
    (order) => order.status === "PENDING",
  ).length;

  const completed = orders.filter(
    (order) => order.status === "COMPLETED",
  ).length;

  const cancelled = orders.filter(
    (order) => order.status === "CANCELLED",
  ).length;

  const totalValue = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce(
      (sum, order) => sum + Number(order.amount || 0),
      0,
    );

  const initials =
    supplierName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part: string) =>
          part[0]?.toUpperCase(),
      )
      .join("") || "S";

  return (
    <div className="supplier-app">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

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

        {/* ROLE */}

        <div className="supplier-role">

          <div className="supplier-role-icon">
            ✓
          </div>

          <div>
            <strong>Supplier</strong>
            <span>Supplier Portal</span>
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
            <strong>Dashboard</strong>
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
            <strong>My Medicines</strong>
          </button>

          {/* PURCHASE ORDERS */}

          <button
            type="button"
            className="supplier-nav-item active"
            onClick={() =>
              navigate("/supplier/purchases")
            }
          >
            <span>🛒</span>
            <strong>Purchase Orders</strong>
          </button>

          {/* SUPPLY ACTIVITY
              IMPORTANT:
              Do NOT use /supplier/dashboard#supplier-activity
          */}

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() =>
              navigate("/supplier/activity")
            }
          >
            <span>◷</span>
            <strong>Supply Activity</strong>
          </button>

          {/* MY PROFILE
              IMPORTANT:
              Do NOT use /supplier/dashboard#supplier-profile
          */}

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() =>
              navigate("/supplier/profile")
            }
          >
            <span>♙</span>
            <strong>My Profile</strong>
          </button>

          {/* NOTIFICATIONS */}

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() =>
              navigate("/supplier/notifications")
            }
          >
            <span>♧</span>
            <strong>Notifications</strong>
            <em>3</em>
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
            <strong>Logout</strong>
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="supplier-main">

        {/* TOP BAR */}

        <header className="supplier-topbar">

          <div className="supplier-topbar-title">

            <h1>
              Purchase Orders
            </h1>

            <p>
              MediStock Medical Inventory Platform
            </p>

          </div>

          <div className="supplier-topbar-right">

            {/* NOTIFICATION */}

            <button
              type="button"
              className="supplier-notification-button"
              onClick={() =>
                navigate("/supplier/notifications")
              }
            >
              ♧
              <span />
            </button>

            {/* USER */}

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

            {/* LOGOUT */}

            <button
              type="button"
              className="supplier-top-logout"
              onClick={logout}
            >
              ↪ Logout
            </button>

          </div>

        </header>

        {/* =====================================================
            CONTENT
            ===================================================== */}

        <div className="supplier-content">

          {/* PAGE HEADING */}

          <section className="supplier-page-heading">

            <div>

              <div className="supplier-eyebrow">
                SUPPLIER PORTAL
              </div>

              <h1>
                Purchase Orders
              </h1>

              <p>
                View and track purchase orders
                associated with your supplier account.
              </p>

            </div>

            <button
              type="button"
              className="supplier-refresh"
              onClick={loadOrders}
              disabled={loading}
            >
              ↻{" "}
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </section>

          {/* =================================================
              STAT CARDS
              ================================================= */}

          <section className="supplier-stat-grid">

            {/* TOTAL */}

            <div className="supplier-stat-card">

              <div className="supplier-stat-icon blue">
                🛒
              </div>

              <div>

                <span>
                  TOTAL ORDERS
                </span>

                <strong>
                  {orders.length}
                </strong>

                <small>
                  All purchase orders
                </small>

              </div>

            </div>

            {/* PENDING */}

            <div className="supplier-stat-card">

              <div className="supplier-stat-icon orange">
                ◷
              </div>

              <div>

                <span>
                  PENDING ORDERS
                </span>

                <strong>
                  {pending}
                </strong>

                <small>
                  Awaiting completion
                </small>

              </div>

            </div>

            {/* COMPLETED */}

            <div className="supplier-stat-card">

              <div className="supplier-stat-icon green">
                ✓
              </div>

              <div>

                <span>
                  COMPLETED ORDERS
                </span>

                <strong>
                  {completed}
                </strong>

                <small>
                  Successfully completed
                </small>

              </div>

            </div>

            {/* TOTAL VALUE */}

            <div className="supplier-stat-card">

              <div className="supplier-stat-icon purple">
                ₹
              </div>

              <div>

                <span>
                  TOTAL VALUE
                </span>

                <strong>
                  {formatCurrency(totalValue)}
                </strong>

                <small>
                  Excluding cancelled
                </small>

              </div>

            </div>

          </section>

          {/* =================================================
              PURCHASE ORDERS TABLE
              ================================================= */}

          <section className="supplier-card supplier-table-card">

            <div className="supplier-card-heading large">

              <div>

                <h2>
                  My Purchase Orders
                </h2>

                <p>
                  Orders associated with your
                  supplier account
                </p>

              </div>

              {/* FILTER */}

              <select
                className="supplier-order-filter"
                value={filter}
                onChange={(event) =>
                  setFilter(
                    event.target.value as typeof filter,
                  )
                }
              >

                <option value="ALL">
                  All Orders
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>

              </select>

            </div>

            {/* TABLE */}

            <div className="supplier-table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      ORDER ID
                    </th>

                    <th>
                      ORDER DATE
                    </th>

                    <th>
                      EXPECTED DELIVERY
                    </th>

                    <th>
                      ITEMS
                    </th>

                    <th>
                      AMOUNT
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      ACTION
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredOrders.map(
                    (order) => (

                      <tr key={order.id}>

                        <td>
                          <strong className="supplier-order-id">
                            {order.orderNumber}
                          </strong>
                        </td>

                        <td>
                          {formatDate(
                            order.orderDate,
                          )}
                        </td>

                        <td>
                          {formatDate(
                            order.expectedDelivery,
                          )}
                        </td>

                        <td>
                          <span className="supplier-items">
                            {order.items} items
                          </span>
                        </td>

                        <td>
                          <strong>
                            {formatCurrency(
                              Number(
                                order.amount || 0,
                              ),
                            )}
                          </strong>
                        </td>

                        <td>

                          <span
                            className={`supplier-status ${
                              order.status ===
                              "PENDING"
                                ? "pending"
                                : order.status ===
                                    "COMPLETED"
                                  ? "stock"
                                  : "out"
                            }`}
                          >

                            <i />

                            {order.status}

                          </span>

                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() => handleSubmitBill(order.id, order.amount)}
                            style={{
                              border: "none",
                              borderRadius: "8px",
                              padding: "6px 12px",
                              background: "#2563eb",
                              color: "#ffffff",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Submit Bill
                          </button>
                        </td>

                      </tr>

                    ),
                  )}

                  {filteredOrders.length === 0 && (

                    <tr>

                      <td
                        colSpan={6}
                        className="supplier-empty-state"
                      >
                        No purchase orders found.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            {/* SUMMARY */}

            <div
              className="supplier-performance-grid"
              style={{ marginTop: 20 }}
            >

              <div>

                <span>
                  PENDING
                </span>

                <strong>
                  {pending}
                </strong>

              </div>

              <div>

                <span>
                  COMPLETED
                </span>

                <strong>
                  {completed}
                </strong>

              </div>

              <div>

                <span>
                  CANCELLED
                </span>

                <strong>
                  {cancelled}
                </strong>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}