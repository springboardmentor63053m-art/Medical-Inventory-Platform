import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/supplier-supply-activity.css";

type Activity = {
  id: number;
  action: string;
  medicine: string;
  batchNumber: string;
  quantity: number;
  date: string;
  status: "Completed" | "In Transit" | "Processing";
};

const demoActivities: Activity[] = [
  {
    id: 1,
    action: "Delivered",
    medicine: "Metformin 500mg",
    batchNumber: "MED-MET-001",
    quantity: 120,
    date: "12 Aug 2026",
    status: "Completed",
  },
  {
    id: 2,
    action: "Delivered",
    medicine: "Amlodipine 5mg",
    batchNumber: "MED-AML-001",
    quantity: 85,
    date: "10 Aug 2026",
    status: "Completed",
  },
  {
    id: 3,
    action: "Dispatched",
    medicine: "Vitamin C 500mg",
    batchNumber: "MED-VIT-001",
    quantity: 60,
    date: "09 Aug 2026",
    status: "In Transit",
  },
  {
    id: 4,
    action: "Updated",
    medicine: "Paracetamol 500mg",
    batchNumber: "MED-PAR-002",
    quantity: 100,
    date: "07 Aug 2026",
    status: "Processing",
  },
  {
    id: 5,
    action: "Delivered",
    medicine: "Azithromycin 250mg",
    batchNumber: "MED-AZI-001",
    quantity: 75,
    date: "05 Aug 2026",
    status: "Completed",
  },
  {
    id: 6,
    action: "Dispatched",
    medicine: "Cetirizine 10mg",
    batchNumber: "MED-CET-001",
    quantity: 90,
    date: "03 Aug 2026",
    status: "In Transit",
  },
];

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function SupplierSupplyActivity()  {
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

  const [activities] = useState<Activity[]>(demoActivities);
  const [search, setSearch] = useState("");

  const initials =
    supplierName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase())
      .join("") || "R";

  const filteredActivities = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return activities;
    }

    return activities.filter(
      (activity) =>
        activity.action.toLowerCase().includes(value) ||
        activity.medicine.toLowerCase().includes(value) ||
        activity.batchNumber.toLowerCase().includes(value) ||
        activity.status.toLowerCase().includes(value)
    );
  }, [activities, search]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="supplier-app">

      {/* ================= SIDEBAR ================= */}

      <aside className="supplier-sidebar">

        <div className="supplier-brand">
          <div className="supplier-brand-logo">
            <span>⌁</span>
          </div>

          <div>
            <h2>
              Medi<span>Stock</span>
            </h2>
            <p>MEDICAL INVENTORY</p>
          </div>
        </div>

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

        <nav className="supplier-navigation">

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() => navigate("/supplier/dashboard")}
          >
            <span>▦</span>
            <strong>Dashboard</strong>
          </button>

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() => navigate("/supplier/medicines")}
          >
            <span>💊</span>
            <strong>My Medicines</strong>
          </button>

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() => navigate("/supplier/purchases")}
          >
            <span>🛒</span>
            <strong>Purchase Orders</strong>
          </button>

          {/* ACTIVE ACTIVITY */}
          <button
            type="button"
            className="supplier-nav-item active"
            onClick={() => navigate("/supplier/activity")}
          >
            <span>◷</span>
            <strong>Supply Activity</strong>
          </button>

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() => navigate("/supplier/profile")}
          >
            <span>♙</span>
            <strong>My Profile</strong>
          </button>

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() => navigate("/supplier/notifications")}
          >
            <span>♧</span>
            <strong>Notifications</strong>
            <em>3</em>
          </button>

        </nav>

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

      {/* ================= MAIN ================= */}

      <main className="supplier-main">

        {/* TOP HEADER */}

        <header className="supplier-topbar">

          <div className="supplier-topbar-title">
            <h1>Supply Activity</h1>
            <p>MediStock Medical Inventory Platform</p>
          </div>

          <div className="supplier-topbar-right">

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

            <div className="supplier-user">

              <div className="supplier-user-avatar">
                {initials}
              </div>

              <div>
                <strong>{supplierName}</strong>
                <span>Supplier</span>
              </div>

            </div>

            <button
              type="button"
              className="supplier-top-logout"
              onClick={logout}
            >
              ↪ Logout
            </button>

          </div>

        </header>

        {/* ================= CONTENT ================= */}

        <div className="supplier-content">

          <section className="supplier-page-heading">

            <div>
              <div className="supplier-eyebrow">
                SUPPLIER PORTAL
              </div>

              <h1>Supply Activity</h1>

              <p>
                Track your medicine deliveries, dispatches,
                stock updates and supply activity.
              </p>
            </div>

            <button
              type="button"
              className="supplier-refresh"
              onClick={() => window.location.reload()}
            >
              ↻ Refresh
            </button>

          </section>

          {/* ACTIVITY SUMMARY */}

          <section className="supplier-activity-summary">

            <div className="supplier-activity-summary-card">
              <span>Total Activities</span>
              <strong>{activities.length}</strong>
              <small>Recent supply records</small>
            </div>

            <div className="supplier-activity-summary-card completed">
              <span>Completed</span>
              <strong>
                {
                  activities.filter(
                    (item) => item.status === "Completed"
                  ).length
                }
              </strong>
              <small>Successfully delivered</small>
            </div>

            <div className="supplier-activity-summary-card transit">
              <span>In Transit</span>
              <strong>
                {
                  activities.filter(
                    (item) => item.status === "In Transit"
                  ).length
                }
              </strong>
              <small>Currently dispatched</small>
            </div>

            <div className="supplier-activity-summary-card processing">
              <span>Processing</span>
              <strong>
                {
                  activities.filter(
                    (item) => item.status === "Processing"
                  ).length
                }
              </strong>
              <small>Being processed</small>
            </div>

          </section>

          {/* ACTIVITY TABLE */}

          <section className="supplier-card supplier-activity-card">

            <div className="supplier-activity-header">

              <div>
                <h2>Supply Activity</h2>
                <p>
                  Recent activity associated with your supplier account.
                </p>
              </div>

              <div className="supplier-activity-header-right">

                <span className="supplier-record-count">
                  {filteredActivities.length} records
                </span>

                <div className="supplier-activity-search">
                  <span>⌕</span>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search activity..."
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                    >
                      ×
                    </button>
                  )}
                </div>

              </div>

            </div>

            <div className="supplier-table-wrapper">

              <table className="supplier-activity-table">

                <thead>
                  <tr>
                    <th>ACTION</th>
                    <th>MEDICINE</th>
                    <th>BATCH NUMBER</th>
                    <th>QUANTITY</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredActivities.map((activity) => (

                    <tr key={activity.id}>

                      <td>
                        <span
                          className={`supplier-activity-action ${
                            activity.action === "Delivered"
                              ? "delivered"
                              : activity.action === "Dispatched"
                              ? "dispatched"
                              : "updated"
                          }`}
                        >
                          {activity.action}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {activity.medicine}
                        </strong>
                      </td>

                      <td>
                        <span className="supplier-batch">
                          {activity.batchNumber}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {activity.quantity}
                        </strong>
                      </td>

                      <td>
                        <span className="supplier-activity-date">
                          {activity.date}
                        </span>
                      </td>

                      <td>

                        <span
                          className={`supplier-activity-status ${
                            activity.status === "Completed"
                              ? "completed"
                              : activity.status === "In Transit"
                              ? "transit"
                              : "processing"
                          }`}
                        >
                          <i />
                          {activity.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                  {filteredActivities.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="supplier-empty-state"
                      >
                        No supply activity found.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}