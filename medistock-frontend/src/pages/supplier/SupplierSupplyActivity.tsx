import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
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

export default function SupplierSupplyActivity() {
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

  const [activities] = useState<Activity[]>(demoActivities);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const initials =
    supplierName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase())
      .join("") || "S";

  /*
   * ============================================================
   * FILTER ACTIVITIES
   * ============================================================
   */

  const filteredActivities = useMemo(() => {
    const value = search.trim().toLowerCase();

    return activities.filter((activity) => {
      const matchesSearch =
        !value ||
        activity.action.toLowerCase().includes(value) ||
        activity.medicine.toLowerCase().includes(value) ||
        activity.batchNumber.toLowerCase().includes(value) ||
        activity.status.toLowerCase().includes(value);

      const matchesAction =
        actionFilter === "ALL" ||
        activity.action === actionFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        activity.status === statusFilter;

      return matchesSearch && matchesAction && matchesStatus;
    });
  }, [activities, search, actionFilter, statusFilter]);

  /*
   * ============================================================
   * SUMMARY COUNTS
   * ============================================================
   */

  const completedCount = activities.filter(
    (item) => item.status === "Completed"
  ).length;

  const transitCount = activities.filter(
    (item) => item.status === "In Transit"
  ).length;

  const processingCount = activities.filter(
    (item) => item.status === "Processing"
  ).length;

  /*
   * ============================================================
   * CLEAR FILTERS
   * ============================================================
   */

  const clearFilters = () => {
    setSearch("");
    setActionFilter("ALL");
    setStatusFilter("ALL");
  };



  return (
    <div className="supplier-app">

      {/* ======================================================
          SIDEBAR
          ====================================================== */}

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

          {/* ACTIVE SUPPLY ACTIVITY */}

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

      {/* ======================================================
          MAIN
          ====================================================== */}

      <main className="supplier-main">

        {/* ====================================================
            TOP HEADER
            ==================================================== */}

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

        {/* ====================================================
            CONTENT
            ==================================================== */}

        <div className="supplier-content">

          {/* ==================================================
              PAGE HEADING
              ================================================== */}

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

          {/* ==================================================
              SUMMARY CARDS
              ================================================== */}

          <section
            className="supplier-activity-summary"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, minmax(0, 1fr))",
              gap: "18px",
              width: "100%",
              margin: "24px 0 26px",
            }}
          >

            {/* TOTAL */}

            <div
              className="supplier-activity-summary-card"
              style={{
                minHeight: "125px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "22px 24px",
                background: "#ffffff",
                border: "1px solid #e1e8f2",
                borderTop: "4px solid #2864e8",
                borderRadius: "18px",
                boxShadow:
                  "0 8px 25px rgba(30,55,95,0.05)",
                boxSizing: "border-box",
              }}
            >
              <span
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#7890ad",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Total Activities
              </span>

              <strong
                style={{
                  display: "block",
                  color: "#17233d",
                  fontSize: "30px",
                  lineHeight: "1.1",
                  fontWeight: 800,
                }}
              >
                {activities.length}
              </strong>

              <small
                style={{
                  display: "block",
                  marginTop: "6px",
                  color: "#91a2b9",
                  fontSize: "12px",
                }}
              >
                Recent supply records
              </small>
            </div>

            {/* COMPLETED */}

            <div
              className="supplier-activity-summary-card completed"
              style={{
                minHeight: "125px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "22px 24px",
                background: "#ffffff",
                border: "1px solid #e1e8f2",
                borderTop: "4px solid #16a878",
                borderRadius: "18px",
                boxShadow:
                  "0 8px 25px rgba(30,55,95,0.05)",
                boxSizing: "border-box",
              }}
            >
              <span
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#7890ad",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Completed
              </span>

              <strong
                style={{
                  display: "block",
                  color: "#17233d",
                  fontSize: "30px",
                  lineHeight: "1.1",
                  fontWeight: 800,
                }}
              >
                {completedCount}
              </strong>

              <small
                style={{
                  display: "block",
                  marginTop: "6px",
                  color: "#91a2b9",
                  fontSize: "12px",
                }}
              >
                Successfully delivered
              </small>
            </div>

            {/* IN TRANSIT */}

            <div
              className="supplier-activity-summary-card transit"
              style={{
                minHeight: "125px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "22px 24px",
                background: "#ffffff",
                border: "1px solid #e1e8f2",
                borderTop: "4px solid #2864e8",
                borderRadius: "18px",
                boxShadow:
                  "0 8px 25px rgba(30,55,95,0.05)",
                boxSizing: "border-box",
              }}
            >
              <span
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#7890ad",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                In Transit
              </span>

              <strong
                style={{
                  display: "block",
                  color: "#17233d",
                  fontSize: "30px",
                  lineHeight: "1.1",
                  fontWeight: 800,
                }}
              >
                {transitCount}
              </strong>

              <small
                style={{
                  display: "block",
                  marginTop: "6px",
                  color: "#91a2b9",
                  fontSize: "12px",
                }}
              >
                Currently dispatched
              </small>
            </div>

            {/* PROCESSING */}

            <div
              className="supplier-activity-summary-card processing"
              style={{
                minHeight: "125px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "22px 24px",
                background: "#ffffff",
                border: "1px solid #e1e8f2",
                borderTop: "4px solid #e58a12",
                borderRadius: "18px",
                boxShadow:
                  "0 8px 25px rgba(30,55,95,0.05)",
                boxSizing: "border-box",
              }}
            >
              <span
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#7890ad",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Processing
              </span>

              <strong
                style={{
                  display: "block",
                  color: "#17233d",
                  fontSize: "30px",
                  lineHeight: "1.1",
                  fontWeight: 800,
                }}
              >
                {processingCount}
              </strong>

              <small
                style={{
                  display: "block",
                  marginTop: "6px",
                  color: "#91a2b9",
                  fontSize: "12px",
                }}
              >
                Being processed
              </small>
            </div>

          </section>

          {/* ==================================================
              ACTIVITY TABLE CARD
              ================================================== */}

          <section
            className="supplier-card supplier-activity-card"
            style={{
              overflow: "hidden",
            }}
          >

            {/* CARD HEADER */}

            <div className="supplier-activity-header">

              <div>
                <h2>Supply Activity</h2>

                <p>
                  Recent activity associated with your supplier
                  account.
                </p>
              </div>

            </div>

            {/* =================================================
                FILTER BAR
                ================================================= */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "18px",
                padding: "18px 24px",
                background: "#f8fafd",
                borderTop: "1px solid #edf1f6",
                borderBottom: "1px solid #e6ebf2",
                flexWrap: "wrap",
              }}
            >

              {/* RECORD COUNT */}

              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "5px",
                  minWidth: "90px",
                }}
              >
                <strong
                  style={{
                    color: "#17233d",
                    fontSize: "20px",
                    fontWeight: 800,
                  }}
                >
                  {filteredActivities.length}
                </strong>

                <span
                  style={{
                    color: "#879ab3",
                    fontSize: "13px",
                  }}
                >
                  records
                </span>
              </div>

              {/* FILTERS */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flex: 1,
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                }}
              >

                {/* SEARCH */}

                <div
                  className="supplier-activity-search"
                  style={{
                    position: "relative",
                    width: "300px",
                    maxWidth: "100%",
                  }}
                >
                  <span>⌕</span>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search medicine or batch..."
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* ACTION FILTER */}

                <select
                  value={actionFilter}
                  onChange={(event) =>
                    setActionFilter(event.target.value)
                  }
                  aria-label="Filter by action"
                  style={{
                    height: "46px",
                    minWidth: "145px",
                    padding: "0 34px 0 14px",
                    border: "1px solid #dbe4ef",
                    borderRadius: "10px",
                    background: "#ffffff",
                    color: "#273b58",
                    fontFamily: "inherit",
                    fontSize: "13px",
                    fontWeight: 600,
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="ALL">
                    All Actions
                  </option>

                  <option value="Delivered">
                    Delivered
                  </option>

                  <option value="Dispatched">
                    Dispatched
                  </option>

                  <option value="Updated">
                    Updated
                  </option>
                </select>

                {/* STATUS FILTER */}

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  aria-label="Filter by status"
                  style={{
                    height: "46px",
                    minWidth: "145px",
                    padding: "0 34px 0 14px",
                    border: "1px solid #dbe4ef",
                    borderRadius: "10px",
                    background: "#ffffff",
                    color: "#273b58",
                    fontFamily: "inherit",
                    fontSize: "13px",
                    fontWeight: 600,
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="ALL">
                    All Status
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="In Transit">
                    In Transit
                  </option>

                  <option value="Processing">
                    Processing
                  </option>
                </select>

                {/* CLEAR */}

                <button
                  type="button"
                  onClick={clearFilters}
                  style={{
                    height: "46px",
                    padding: "0 16px",
                    border: "1px solid #dbe4ef",
                    borderRadius: "10px",
                    background:
                      search ||
                      actionFilter !== "ALL" ||
                      statusFilter !== "ALL"
                        ? "#edf4ff"
                        : "#ffffff",
                    color: "#2864e8",
                    fontFamily: "inherit",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Clear Filters
                </button>

              </div>

            </div>

            {/* =================================================
                TABLE
                ================================================= */}

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

                      {/* ACTION */}

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

                      {/* MEDICINE */}

                      <td>
                        <strong>
                          {activity.medicine}
                        </strong>
                      </td>

                      {/* BATCH */}

                      <td>
                        <span className="supplier-batch">
                          {activity.batchNumber}
                        </span>
                      </td>

                      {/* QUANTITY */}

                      <td>
                        <strong>
                          {activity.quantity}
                        </strong>
                      </td>

                      {/* DATE */}

                      <td>
                        <span className="supplier-activity-date">
                          {activity.date}
                        </span>
                      </td>

                      {/* STATUS */}

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

                  {/* EMPTY STATE */}

                  {filteredActivities.length === 0 && (

                    <tr>

                      <td
                        colSpan={6}
                        className="supplier-empty-state"
                      >
                        <div
                          style={{
                            padding: "50px 20px",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "32px",
                              marginBottom: "10px",
                              opacity: 0.55,
                            }}
                          >
                            ⌕
                          </div>

                          <strong
                            style={{
                              display: "block",
                              color: "#344b69",
                              fontSize: "16px",
                            }}
                          >
                            No supply activity found
                          </strong>

                          <span
                            style={{
                              display: "block",
                              marginTop: "6px",
                              color: "#92a2b8",
                              fontSize: "13px",
                            }}
                          >
                            Try changing your search or filters.
                          </span>

                          <button
                            type="button"
                            onClick={clearFilters}
                            style={{
                              marginTop: "16px",
                              padding: "9px 16px",
                              border: "1px solid #dbe4ef",
                              borderRadius: "9px",
                              background: "#edf4ff",
                              color: "#2864e8",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Reset Filters
                          </button>
                        </div>
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