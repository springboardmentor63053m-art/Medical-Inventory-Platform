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

type PurchaseOrder = {
  id: number | string;
  orderNumber: string;
  orderDate: string;
  expectedDelivery: string;
  items: number;
  amount: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
};

type Activity = {
  id: number | string;
  type: "ORDER" | "DELIVERY" | "STOCK" | "PROFILE";
  title: string;
  description: string;
  date: string;
};

type SupplierProfile = {
  id: number | string;
  name: string;
  contact: string;
  email: string;
  address: string;
};

const getLoggedInUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const loggedInUser = getLoggedInUser();

const getLoggedInSupplierName = () => {
  const name =
    loggedInUser?.username ||
    loggedInUser?.name ||
    loggedInUser?.fullName ||
    "Rahul";

  return String(name)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const demoProfile: SupplierProfile = {
  id: loggedInUser?.supplierId ?? loggedInUser?.id ?? 1,
  name: getLoggedInSupplierName(),
  contact: loggedInUser?.phone ?? loggedInUser?.contact ?? "+91 XXXXX XXXXX",
  email: loggedInUser?.email ?? "rahul@medistock.com",
  address: loggedInUser?.address ?? "Supplier Address",
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

const demoActivities: Activity[] = [
  {
    id: 1,
    type: "ORDER",
    title: "New purchase order received",
    description: "PO-2026-001 has been created.",
    date: "Today, 10:30 AM",
  },
  {
    id: 2,
    type: "DELIVERY",
    title: "Delivery completed",
    description: "PO-2026-002 was successfully delivered.",
    date: "Aug 10, 2026",
  },
  {
    id: 3,
    type: "STOCK",
    title: "Medicine stock updated",
    description: "Vitamin C 500mg stock was updated.",
    date: "Aug 09, 2026",
  },
  {
    id: 4,
    type: "PROFILE",
    title: "Supplier information verified",
    description: "Your supplier profile is active.",
    date: "Aug 07, 2026",
  },
];

const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString("en-IN")}`;
};

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

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const [profile, setProfile] =
    useState<SupplierProfile>(demoProfile);

  const [medicines, setMedicines] =
    useState<Medicine[]>(demoMedicines);

  const [orders, setOrders] =
    useState<PurchaseOrder[]>(demoOrders);

  const [activities, setActivities] =
    useState<Activity[]>(demoActivities);

  const [loading, setLoading] = useState(false);

  const [medicineSearch, setMedicineSearch] = useState("");

  const [orderFilter, setOrderFilter] = useState<
    "ALL" | "PENDING" | "COMPLETED" | "CANCELLED"
  >("ALL");

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const profileResponse = await fetch("/suppliers/me");

      if (profileResponse.ok) {
        const data = await profileResponse.json();

        setProfile({
          id: data.id ?? data.supplierId ?? 1,
          name: data.name ?? demoProfile.name,
          contact:
            data.contact ??
            data.phone ??
            demoProfile.contact,
          email: data.email ?? demoProfile.email,
          address: data.address ?? demoProfile.address,
        });
      }

      const medicineResponse = await fetch(
        "/suppliers/me/medicines",
      );

      if (medicineResponse.ok) {
        const data = await medicineResponse.json();

        const list = Array.isArray(data)
          ? data
          : data?.data ?? data?.content ?? [];

        if (Array.isArray(list) && list.length > 0) {
          setMedicines(list);
        }
      }

      const ordersResponse = await fetch(
        "/suppliers/me/purchase-orders",
      );

      if (ordersResponse.ok) {
        const data = await ordersResponse.json();

        const list = Array.isArray(data)
          ? data
          : data?.data ?? data?.content ?? [];

        if (Array.isArray(list) && list.length > 0) {
          setOrders(list);
        }
      }

      const activityResponse = await fetch(
        "/suppliers/me/activity",
      );

      if (activityResponse.ok) {
        const data = await activityResponse.json();

        const list = Array.isArray(data)
          ? data
          : data?.data ?? data?.content ?? [];

        if (Array.isArray(list) && list.length > 0) {
          setActivities(list);
        }
      }
    } catch {
      // Demo data remains available if backend is unavailable.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING",
  );

  const completedOrders = orders.filter(
    (order) => order.status === "COMPLETED",
  );

  const activeOrders = orders.filter(
    (order) =>
      order.status === "PENDING" ||
      order.status === "COMPLETED",
  );

  const totalOrderValue = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + order.amount, 0);

  const filteredMedicines = useMemo(() => {
    const search = medicineSearch.trim().toLowerCase();

    if (!search) {
      return medicines;
    }

    return medicines.filter(
      (medicine) =>
        medicine.name.toLowerCase().includes(search) ||
        medicine.category.toLowerCase().includes(search) ||
        medicine.batchNumber.toLowerCase().includes(search),
    );
  }, [medicineSearch, medicines]);

  const filteredOrders = useMemo(() => {
    if (orderFilter === "ALL") {
      return orders;
    }

    return orders.filter(
      (order) => order.status === orderFilter,
    );
  }, [orders, orderFilter]);

  const initials =
    profile.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((item) => item[0]?.toUpperCase())
      .join("") || "S";

  const handleMenu = (menu: string) => {
    setActiveMenu(menu);

    switch (menu) {
      case "dashboard":
        navigate("/supplier/dashboard");
        break;
      case "medicines":
        navigate("/supplier/medicines");
        break;
      case "orders":
        navigate("/supplier/purchases");
        break;
      case "activity":
        // Open the dedicated Supply Activity page.
        window.location.assign("/supplier/activity");
        break;
      case "profile":
        navigate("/supplier/profile");
        break;
      case "notifications":
        navigate("/supplier/notifications");
        break;
      default:
        navigate("/supplier/dashboard");
    }
  };

  return (
    <div className="supplier-app">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

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
            className={
              activeMenu === "dashboard"
                ? "supplier-nav-item active"
                : "supplier-nav-item"
            }
            onClick={() => handleMenu("dashboard")}
          >
            <span>▦</span>
            <strong>Dashboard</strong>
          </button>

          <button
            type="button"
            className={
              activeMenu === "medicines"
                ? "supplier-nav-item active"
                : "supplier-nav-item"
            }
            onClick={() => handleMenu("medicines")}
          >
            <span>💊</span>
            <strong>My Medicines</strong>
          </button>

          <button
            type="button"
            className={
              activeMenu === "orders"
                ? "supplier-nav-item active"
                : "supplier-nav-item"
            }
            onClick={() => handleMenu("orders")}
          >
            <span>🛒</span>
            <strong>Purchase Orders</strong>
          </button>

          <button
            type="button"
            className={
              activeMenu === "activity"
                ? "supplier-nav-item active"
                : "supplier-nav-item"
            }
            onClick={() => handleMenu("activity")}
          >
            <span>◷</span>
            <strong>Supply Activity</strong>
          </button>

          <button
            type="button"
            className={
              activeMenu === "profile"
                ? "supplier-nav-item active"
                : "supplier-nav-item"
            }
            onClick={() => handleMenu("profile")}
          >
            <span>♙</span>
            <strong>My Profile</strong>
          </button>

          <button
            type="button"
            className={
              activeMenu === "notifications"
                ? "supplier-nav-item active"
                : "supplier-nav-item"
            }
            onClick={() => handleMenu("notifications")}
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
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
          >
            <span>↪</span>
            <strong>Logout</strong>
          </button>

        </div>
      </aside>

      {/* =====================================================
          MAIN AREA
          ===================================================== */}

      <main className="supplier-main">

        {/* TOP HEADER */}

        <header className="supplier-topbar">

          <div className="supplier-topbar-title">
            <h1>Supplier Dashboard</h1>
            <p>MediStock Medical Inventory Platform</p>
          </div>

          <div className="supplier-topbar-right">

            <button
              type="button"
              className="supplier-notification-button"
              onClick={() => handleMenu("notifications")}
            >
              ♧
              <span />
            </button>

            <div className="supplier-user">

              <div className="supplier-user-avatar">
                {initials}
              </div>

              <div>
                <strong>{profile.name}</strong>
                <span>Supplier</span>
              </div>

            </div>

            <button
              type="button"
              className="supplier-top-logout"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/";
              }}
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

              <h1>Supplier Dashboard</h1>

              <p>
                Manage your supplied medicines, purchase orders
                and supply activity.
              </p>
            </div>

            <button
              type="button"
              className="supplier-refresh"
              onClick={loadDashboard}
              disabled={loading}
            >
              ↻ {loading ? "Refreshing..." : "Refresh"}
            </button>

          </section>

          {/* WELCOME */}

          <section className="supplier-welcome">

            <div>

              <div className="supplier-welcome-label">
                SUPPLIER ACCOUNT
              </div>

              <h2>
                Welcome back,{" "}
                {profile.name.split(" ")[0]} 👋
              </h2>

              <p>
                Here is an overview of your medicines,
                purchase orders and recent supply activity.
              </p>

              <div className="supplier-welcome-meta">

                <span>
                  <b>Supplier ID:</b>{" "}
                  SUP-{String(profile.id).padStart(4, "0")}
                </span>

                <span>
                  <b>Status:</b> Active
                </span>

              </div>

            </div>

            <div className="supplier-welcome-avatar">
              {initials}
            </div>

          </section>

          {/* SUMMARY CARDS */}

          <section className="supplier-stat-grid">

            <div className="supplier-stat-card">

              <div className="supplier-stat-icon blue">
                💊
              </div>

              <div>
                <span>SUPPLIED MEDICINES</span>
                <strong>{medicines.length}</strong>
                <small>Medicines supplied</small>
              </div>

            </div>

            <div className="supplier-stat-card">

              <div className="supplier-stat-icon orange">
                🛒
              </div>

              <div>
                <span>ACTIVE ORDERS</span>
                <strong>{activeOrders.length}</strong>
                <small>Current purchase orders</small>
              </div>

            </div>

            <div className="supplier-stat-card">

              <div className="supplier-stat-icon purple">
                ◷
              </div>

              <div>
                <span>PENDING ORDERS</span>
                <strong>{pendingOrders.length}</strong>
                <small>Awaiting completion</small>
              </div>

            </div>

            <div className="supplier-stat-card">

              <div className="supplier-stat-icon green">
                ✓
              </div>

              <div>
                <span>COMPLETED ORDERS</span>
                <strong>{completedOrders.length}</strong>
                <small>Successfully completed</small>
              </div>

            </div>

          </section>

          {/* PROFILE + PERFORMANCE */}

          <section className="supplier-two-column">

            <div
              className="supplier-card"
              id="supplier-profile"
            >

              <div className="supplier-card-heading">

                <div>
                  <h2>Supplier Profile</h2>
                  <p>Your registered supplier information</p>
                </div>

                <span className="supplier-active">
                  <i />
                  Active
                </span>

              </div>

              <div className="supplier-profile">

                <div className="supplier-profile-avatar">
                  {initials}
                </div>

                <div>
                  <h3>{profile.name}</h3>
                  <span>Registered Supplier</span>
                </div>

              </div>

              <div className="supplier-profile-details">

                <div>
                  <span>CONTACT</span>
                  <strong>{profile.contact}</strong>
                </div>

                <div>
                  <span>EMAIL</span>
                  <strong>{profile.email}</strong>
                </div>

                <div>
                  <span>ADDRESS</span>
                  <strong>{profile.address}</strong>
                </div>

              </div>

            </div>

            <div className="supplier-card">

              <div className="supplier-card-heading">

                <div>
                  <h2>Supply Performance</h2>
                  <p>Your current supply overview</p>
                </div>

              </div>

              <div className="supplier-performance">

                <div className="supplier-performance-circle">

                  <strong>
                    {orders.length === 0
                      ? 0
                      : Math.round(
                          (completedOrders.length /
                            orders.length) *
                            100,
                        )}
                    %
                  </strong>

                </div>

                <div>
                  <h3>Order Completion</h3>
                  <p>
                    Based on completed purchase orders.
                  </p>
                </div>

              </div>

              <div className="supplier-performance-grid">

                <div>
                  <span>TOTAL VALUE</span>
                  <strong>
                    {formatCurrency(totalOrderValue)}
                  </strong>
                </div>

                <div>
                  <span>COMPLETED</span>
                  <strong>
                    {completedOrders.length}
                  </strong>
                </div>

                <div>
                  <span>PENDING</span>
                  <strong>
                    {pendingOrders.length}
                  </strong>
                </div>

              </div>

            </div>

          </section>

          {/* MEDICINES */}

          <section
            className="supplier-card supplier-table-card"
            id="supplier-medicines"
          >

            <div className="supplier-card-heading large">

              <div>
                <h2>Supplied Medicines</h2>
                <p>
                  Medicines supplied by your organization
                </p>
              </div>

              <div className="supplier-search">

                <span>⌕</span>

                <input
                  type="text"
                  value={medicineSearch}
                  onChange={(event) =>
                    setMedicineSearch(event.target.value)
                  }
                  placeholder="Search medicines..."
                />

                {medicineSearch && (
                  <button
                    type="button"
                    onClick={() =>
                      setMedicineSearch("")
                    }
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
                    <th>MEDICINE</th>
                    <th>CATEGORY</th>
                    <th>BATCH NUMBER</th>
                    <th>QUANTITY</th>
                    <th>STATUS</th>
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
                              : medicine.status ===
                                  "LOW STOCK"
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

                </tbody>

              </table>

            </div>

          </section>

          {/* PURCHASE ORDERS */}

          <section
            className="supplier-card supplier-table-card"
            id="supplier-orders"
          >

            <div className="supplier-card-heading large">

              <div>
                <h2>Purchase Orders</h2>

                <p>
                  Orders associated with your supplier account
                </p>
              </div>

              <select
                className="supplier-order-filter"
                value={orderFilter}
                onChange={(event) =>
                  setOrderFilter(
                    event.target.value as
                      | "ALL"
                      | "PENDING"
                      | "COMPLETED"
                      | "CANCELLED",
                  )
                }
              >
                <option value="ALL">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">
                  Completed
                </option>
                <option value="CANCELLED">
                  Cancelled
                </option>
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

                      <td>
                        <strong className="supplier-order-id">
                          {order.orderNumber}
                        </strong>
                      </td>

                      <td>
                        {formatDate(order.orderDate)}
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
                          {formatCurrency(order.amount)}
                        </strong>
                      </td>

                      <td>

                        <span
                          className={`supplier-status ${
                            order.status === "PENDING"
                              ? "pending"
                              : order.status ===
                                  "COMPLETED"
                                ? "completed"
                                : "cancelled"
                          }`}
                        >
                          <i />
                          {order.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>

          {/* ACTIVITY */}

          <section
            className="supplier-card"
            id="supplier-activity"
          >

            <div className="supplier-card-heading">

              <div>
                <h2>Recent Supply Activity</h2>

                <p>
                  Latest activity from your supplier account
                </p>
              </div>

            </div>

            <div className="supplier-activity-list">

              {activities.map((activity) => (

                <div
                  className="supplier-activity-item"
                  key={activity.id}
                >

                  <div className="supplier-activity-icon">
                    {activity.type === "ORDER" && "🛒"}
                    {activity.type === "DELIVERY" && "✓"}
                    {activity.type === "STOCK" && "📦"}
                    {activity.type === "PROFILE" && "👤"}
                  </div>

                  <div>

                    <strong>
                      {activity.title}
                    </strong>

                    <span>
                      {activity.description}
                    </span>

                  </div>

                  <time>
                    {activity.date}
                  </time>

                </div>

              ))}

            </div>

          </section>

        </div>
      </main>
    </div>
  );
}
