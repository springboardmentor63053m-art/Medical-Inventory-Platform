import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/supplier-dashboard.css";

type Medicine = {
  id: number | string;
  name: string;
  category: string;
  batchNumber: string;
  quantity: number;
  status: "IN STOCK" | "LOW STOCK" | "OUT OF STOCK";
};

const demoMedicines: Medicine[] = [
  {
    id: 1,
    name: "Metformin 500mg",
    category: "Diabetes",
    batchNumber: "MED-MET-001",
    quantity: 120,
    status: "IN STOCK",
  },
  {
    id: 2,
    name: "Amlodipine 5mg",
    category: "Blood Pressure",
    batchNumber: "MED-AML-001",
    quantity: 85,
    status: "IN STOCK",
  },
  {
    id: 3,
    name: "Vitamin C 500mg",
    category: "Vitamins",
    batchNumber: "MED-VIT-001",
    quantity: 35,
    status: "LOW STOCK",
  },
  {
    id: 4,
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    batchNumber: "MED-PAR-002",
    quantity: 0,
    status: "OUT OF STOCK",
  },
];

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function SupplierMedicines() {
  const navigate = useNavigate();

  const user = getUser();

  const supplierName = String(
    user?.username || user?.name || user?.fullName || "Rahul",
  )
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char: string) => char.toUpperCase());

  const [medicines, setMedicines] = useState<Medicine[]>(demoMedicines);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const loadMedicines = async () => {
    setLoading(true);

    try {
      const response = await fetch("/suppliers/me/medicines");

      if (response.ok) {
        const data = await response.json();

        const list = Array.isArray(data)
          ? data
          : data?.data ?? data?.content ?? [];

        if (Array.isArray(list) && list.length > 0) {
          setMedicines(list);
        }
      }
    } catch {
      // Keep demo medicines when the backend is unavailable.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const filteredMedicines = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return medicines;
    }

    return medicines.filter(
      (medicine) =>
        medicine.name.toLowerCase().includes(value) ||
        medicine.category.toLowerCase().includes(value) ||
        medicine.batchNumber.toLowerCase().includes(value),
    );
  }, [medicines, search]);

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

      {/* =========================================================
          SIDEBAR
          ========================================================= */}

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

          {/* DASHBOARD */}

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() => navigate("/supplier/dashboard")}
          >
            <span>▦</span>
            <strong>Dashboard</strong>
          </button>

          {/* MY MEDICINES */}

          <button
            type="button"
            className="supplier-nav-item active"
            onClick={() => navigate("/supplier/medicines")}
          >
            <span>💊</span>
            <strong>My Medicines</strong>
          </button>

          {/* PURCHASE ORDERS */}

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() => navigate("/supplier/purchases")}
          >
            <span>🛒</span>
            <strong>Purchase Orders</strong>
          </button>

          {/* SUPPLY ACTIVITY
              FIXED: Goes to the separate activity page
          */}

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() => navigate("/supplier/activity")}
          >
            <span>◷</span>
            <strong>Supply Activity</strong>
          </button>

          {/* MY PROFILE
              FIXED: Goes to the separate profile page
          */}

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() => navigate("/supplier/profile")}
          >
            <span>♙</span>
            <strong>My Profile</strong>
          </button>

          {/* NOTIFICATIONS */}

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

      {/* =========================================================
          MAIN CONTENT
          ========================================================= */}

      <main className="supplier-main">

        {/* TOP BAR */}

        <header className="supplier-topbar">

          <div className="supplier-topbar-title">

            <h1>My Medicines</h1>

            <p>
              MediStock Medical Inventory Platform
            </p>

          </div>

          <div className="supplier-topbar-right">

            <button
              type="button"
              className="supplier-notification-button"
              onClick={() => navigate("/supplier/notifications")}
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

        {/* =========================================================
            PAGE CONTENT
            ========================================================= */}

        <div className="supplier-content">

          {/* PAGE HEADING */}

          <section className="supplier-page-heading">

            <div>

              <div className="supplier-eyebrow">
                SUPPLIER PORTAL
              </div>

              <h1>
                My Medicines
              </h1>

              <p>
                View medicines supplied by your supplier account and
                their current stock status.
              </p>

            </div>

            <button
              type="button"
              className="supplier-refresh"
              onClick={loadMedicines}
              disabled={loading}
            >
              ↻ {loading ? "Refreshing..." : "Refresh"}
            </button>

          </section>

          {/* =====================================================
              SUMMARY CARDS
              ===================================================== */}

          <section className="supplier-stat-grid">

            {/* SUPPLIED MEDICINES */}

            <div className="supplier-stat-card">

              <div className="supplier-stat-icon blue">
                💊
              </div>

              <div>

                <span>
                  SUPPLIED MEDICINES
                </span>

                <strong>
                  {medicines.length}
                </strong>

                <small>
                  Medicines supplied
                </small>

              </div>

            </div>

            {/* IN STOCK */}

            <div className="supplier-stat-card">

              <div className="supplier-stat-icon green">
                ✓
              </div>

              <div>

                <span>
                  IN STOCK
                </span>

                <strong>
                  {
                    medicines.filter(
                      (m) => m.status === "IN STOCK",
                    ).length
                  }
                </strong>

                <small>
                  Available medicines
                </small>

              </div>

            </div>

            {/* LOW STOCK */}

            <div className="supplier-stat-card">

              <div className="supplier-stat-icon orange">
                !
              </div>

              <div>

                <span>
                  LOW STOCK
                </span>

                <strong>
                  {
                    medicines.filter(
                      (m) => m.status === "LOW STOCK",
                    ).length
                  }
                </strong>

                <small>
                  Needs attention
                </small>

              </div>

            </div>

            {/* OUT OF STOCK */}

            <div className="supplier-stat-card">

              <div className="supplier-stat-icon purple">
                0
              </div>

              <div>

                <span>
                  OUT OF STOCK
                </span>

                <strong>
                  {
                    medicines.filter(
                      (m) => m.status === "OUT OF STOCK",
                    ).length
                  }
                </strong>

                <small>
                  Currently unavailable
                </small>

              </div>

            </div>

          </section>

          {/* =====================================================
              MEDICINES TABLE
              ===================================================== */}

          <section className="supplier-card supplier-table-card">

            <div className="supplier-card-heading large">

              <div>

                <h2>
                  Supplied Medicines
                </h2>

                <p>
                  Medicines provided by your supplier account
                </p>

              </div>

              <div className="supplier-search">

                <span>
                  ⌕
                </span>

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search medicines..."
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

            <div className="supplier-table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      MEDICINE
                    </th>

                    <th>
                      CATEGORY
                    </th>

                    <th>
                      BATCH NUMBER
                    </th>

                    <th>
                      QUANTITY
                    </th>

                    <th>
                      STATUS
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredMedicines.map((medicine) => (

                    <tr key={medicine.id}>

                      <td>
                        <strong>
                          {medicine.name}
                        </strong>
                      </td>

                      <td>
                        {medicine.category}
                      </td>

                      <td>
                        <span className="supplier-batch">
                          {medicine.batchNumber}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {medicine.quantity}
                        </strong>
                      </td>

                      <td>

                        <span
                          className={`supplier-status ${
                            medicine.status === "IN STOCK"
                              ? "stock"
                              : medicine.status === "LOW STOCK"
                                ? "low"
                                : "out"
                          }`}
                        >

                          <i />

                          {medicine.status}

                        </span>

                      </td>

                    </tr>

                  ))}

                  {filteredMedicines.length === 0 && (

                    <tr>

                      <td
                        colSpan={5}
                        className="supplier-empty-state"
                      >
                        No medicines found.
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