import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  { id: 1, orderNumber: "PO-2026-001", orderDate: "2026-08-08", expectedDelivery: "2026-08-15", items: 5, amount: 28500, status: "PENDING" },
  { id: 2, orderNumber: "PO-2026-002", orderDate: "2026-08-04", expectedDelivery: "2026-08-10", items: 8, amount: 42500, status: "COMPLETED" },
  { id: 3, orderNumber: "PO-2026-003", orderDate: "2026-07-28", expectedDelivery: "2026-08-03", items: 4, amount: 18200, status: "COMPLETED" },
  { id: 4, orderNumber: "PO-2026-004", orderDate: "2026-07-24", expectedDelivery: "2026-07-31", items: 3, amount: 12700, status: "CANCELLED" },
];

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const formatCurrency = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function SupplierPurchaseOrders() {
  const navigate = useNavigate();
  const user = getUser();

  const supplierName = String(
    user?.username || user?.name || user?.fullName || "Rahul",
  )
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char: string) => char.toUpperCase());

  const [orders, setOrders] = useState<PurchaseOrder[]>(demoOrders);
  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "COMPLETED" | "CANCELLED"
  >("ALL");
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/suppliers/me/purchase-orders");
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data)
          ? data
          : data?.data ?? data?.content ?? [];

        if (Array.isArray(list) && list.length > 0) {
          setOrders(list);
        }
      }
    } catch {
      // Keep demo orders when the backend is unavailable.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (filter === "ALL") return orders;
    return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

  const pending = orders.filter((order) => order.status === "PENDING").length;
  const completed = orders.filter((order) => order.status === "COMPLETED").length;
  const cancelled = orders.filter((order) => order.status === "CANCELLED").length;
  const totalValue = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + Number(order.amount || 0), 0);

  const initials =
    supplierName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase())
      .join("") || "R";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="supplier-app">
      <aside className="supplier-sidebar">
        <div className="supplier-brand">
          <div className="supplier-brand-logo"><span>⌁</span></div>
          <div>
            <h2>Medi<span>Stock</span></h2>
            <p>MEDICAL INVENTORY</p>
          </div>
        </div>

        <div className="supplier-role">
          <div className="supplier-role-icon">✓</div>
          <div><strong>Supplier</strong><span>Supplier Portal</span></div>
        </div>

        <div className="supplier-menu-title">MAIN MENU</div>

        <nav className="supplier-navigation">
          <button type="button" className="supplier-nav-item" onClick={() => navigate("/supplier/dashboard")}>
            <span>▦</span><strong>Dashboard</strong>
          </button>
          <button type="button" className="supplier-nav-item" onClick={() => navigate("/supplier/medicines")}>
            <span>💊</span><strong>My Medicines</strong>
          </button>
          <button type="button" className="supplier-nav-item active" onClick={() => navigate("/supplier/purchases")}>
            <span>🛒</span><strong>Purchase Orders</strong>
          </button>
          <button type="button" className="supplier-nav-item" onClick={() => navigate("/supplier/dashboard#supplier-activity")}>
            <span>◷</span><strong>Supply Activity</strong>
          </button>
          <button type="button" className="supplier-nav-item" onClick={() => navigate("/supplier/dashboard#supplier-profile")}>
            <span>♙</span><strong>My Profile</strong>
          </button>
          <button type="button" className="supplier-nav-item" onClick={() => navigate("/supplier/notifications")}>
            <span>♧</span><strong>Notifications</strong><em>3</em>
          </button>
        </nav>

        <div className="supplier-sidebar-bottom">
          <button type="button" className="supplier-logout" onClick={logout}>
            <span>↪</span><strong>Logout</strong>
          </button>
        </div>
      </aside>

      <main className="supplier-main">
        <header className="supplier-topbar">
          <div className="supplier-topbar-title">
            <h1>Purchase Orders</h1>
            <p>MediStock Medical Inventory Platform</p>
          </div>

          <div className="supplier-topbar-right">
            <button type="button" className="supplier-notification-button" onClick={() => navigate("/supplier/notifications")}>
              ♧<span />
            </button>
            <div className="supplier-user">
              <div className="supplier-user-avatar">{initials}</div>
              <div><strong>{supplierName}</strong><span>Supplier</span></div>
            </div>
            <button type="button" className="supplier-top-logout" onClick={logout}>↪ Logout</button>
          </div>
        </header>

        <div className="supplier-content">
          <section className="supplier-page-heading">
            <div>
              <div className="supplier-eyebrow">SUPPLIER PORTAL</div>
              <h1>Purchase Orders</h1>
              <p>View and track purchase orders associated with your supplier account.</p>
            </div>
            <button type="button" className="supplier-refresh" onClick={loadOrders} disabled={loading}>
              ↻ {loading ? "Refreshing..." : "Refresh"}
            </button>
          </section>

          <section className="supplier-stat-grid">
            <div className="supplier-stat-card">
              <div className="supplier-stat-icon blue">🛒</div>
              <div><span>TOTAL ORDERS</span><strong>{orders.length}</strong><small>All purchase orders</small></div>
            </div>
            <div className="supplier-stat-card">
              <div className="supplier-stat-icon orange">◷</div>
              <div><span>PENDING ORDERS</span><strong>{pending}</strong><small>Awaiting completion</small></div>
            </div>
            <div className="supplier-stat-card">
              <div className="supplier-stat-icon green">✓</div>
              <div><span>COMPLETED ORDERS</span><strong>{completed}</strong><small>Successfully completed</small></div>
            </div>
            <div className="supplier-stat-card">
              <div className="supplier-stat-icon purple">₹</div>
              <div><span>TOTAL VALUE</span><strong>{formatCurrency(totalValue)}</strong><small>Excluding cancelled</small></div>
            </div>
          </section>

          <section className="supplier-card supplier-table-card">
            <div className="supplier-card-heading large">
              <div>
                <h2>My Purchase Orders</h2>
                <p>Orders associated with your supplier account</p>
              </div>
              <select
                className="supplier-order-filter"
                value={filter}
                onChange={(event) => setFilter(event.target.value as typeof filter)}
              >
                <option value="ALL">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="supplier-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>ORDER DATE</th>
                    <th>EXPECTED DELIVERY</th>
                    <th>ITEMS</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td><strong className="supplier-order-id">{order.orderNumber}</strong></td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>{formatDate(order.expectedDelivery)}</td>
                      <td><span className="supplier-items">{order.items} items</span></td>
                      <td><strong>{formatCurrency(Number(order.amount || 0))}</strong></td>
                      <td>
                        <span className={`supplier-status ${order.status === "PENDING" ? "pending" : order.status === "COMPLETED" ? "stock" : "out"}`}>
                          <i />{order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr><td colSpan={6} className="supplier-empty-state">No purchase orders found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="supplier-performance-grid" style={{ marginTop: 20 }}>
              <div><span>PENDING</span><strong>{pending}</strong></div>
              <div><span>COMPLETED</span><strong>{completed}</strong></div>
              <div><span>CANCELLED</span><strong>{cancelled}</strong></div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
