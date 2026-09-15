import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axios";

interface Medicine {
  id: number;
  name: string;
  category?: string;
  price?: number;
  stockQuantity?: number;
  expiryDate?: string;
  supplier?: {
    id?: number;
    name?: string;
  };
}

interface Supplier {
  id?: number;
  name?: string;
  contact?: string;
  email?: string;
}

interface DashboardStats {
  totalMedicines: number;
  availableStock: number;
  lowStock: number;
  outOfStock: number;
  totalSuppliers: number;
  inventoryValue: number;
}

interface BackendAnalytics {
  totalMedicines: number;
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringCount: number;
  inventoryValue: number;
  totalSuppliers: number;
  lowStockItems?: Medicine[];
  outOfStockItems?: Medicine[];
  expiringItems?: any[];
}

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [analyticsData, setAnalyticsData] = useState<BackendAnalytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const username =
    localStorage.getItem("username") || "Administrator";

  // ============================================================
  // LOAD DASHBOARD DATA
  // ============================================================

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      try {
        const analyticsRes = await axiosInstance.get("/analytics");
        if (analyticsRes.data) {
          setAnalyticsData(analyticsRes.data);
        }
      } catch (analyticsErr) {
        console.warn("Analytics API fetch failed, falling back:", analyticsErr);
      }

      const medicineRes = await axiosInstance.get("/medicines");
      setMedicines(Array.isArray(medicineRes.data) ? medicineRes.data : []);

      try {
        const supplierRes = await axiosInstance.get("/suppliers");
        setSuppliers(Array.isArray(supplierRes.data) ? supplierRes.data : []);
      } catch (supplierError) {
        console.warn("Supplier data could not be loaded:", supplierError);
        setSuppliers([]);
      }
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError("Unable to load dashboard data from the server.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CALCULATE STATISTICS (PREFER BACKEND ANALYTICS)
  // ============================================================

  const stats: DashboardStats = useMemo(() => {
    if (analyticsData) {
      return {
        totalMedicines: analyticsData.totalMedicines,
        availableStock: analyticsData.totalStock,
        lowStock: analyticsData.lowStockCount,
        outOfStock: analyticsData.outOfStockCount,
        totalSuppliers: analyticsData.totalSuppliers,
        inventoryValue: analyticsData.inventoryValue,
      };
    }

    let availableStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let inventoryValue = 0;

    medicines.forEach((medicine) => {
      const quantity =
        Number(medicine.stockQuantity) || 0;

      const price =
        Number(medicine.price) || 0;

      availableStock += quantity;

      inventoryValue += quantity * price;

      if (quantity <= 0) {
        outOfStock++;
      } else if (quantity <= 10) {
        lowStock++;
      }
    });

    return {
      totalMedicines: medicines.length,
      availableStock,
      lowStock,
      outOfStock,
      totalSuppliers: suppliers.length,
      inventoryValue,
    };
  }, [analyticsData, medicines, suppliers]);

  // ============================================================
  // RECENT MEDICINES
  // ============================================================

  const recentMedicines = useMemo(() => {
    return [...medicines]
      .slice(-5)
      .reverse();
  }, [medicines]);

  // ============================================================
  // LOW STOCK MEDICINES
  // ============================================================

  const lowStockMedicines = useMemo(() => {
    if (analyticsData?.lowStockItems) {
      return analyticsData.lowStockItems;
    }
    return medicines
      .filter((medicine) => {
        const qty = Number(medicine.stockQuantity) || 0;
        return qty > 0 && qty <= 20;
      })
      .sort(
        (a, b) =>
          (Number(a.stockQuantity) || 0) -
          (Number(b.stockQuantity) || 0)
      )
      .slice(0, 5);
  }, [analyticsData, medicines]);

  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(value);
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ============================================================
  // CARD
  // ============================================================

  const StatCard = ({
    icon,
    title,
    value,
    subtitle,
  }: {
    icon: string;
    title: string;
    value: string | number;
    subtitle: string;
  }) => (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "22px",
        border: "1px solid #e5e7eb",
        boxShadow:
          "0 4px 12px rgba(15,23,42,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {title}
          </p>

          <h2
            style={{
              margin:
                "8px 0 5px",
              fontSize: "28px",
              color: "#0f172a",
            }}
          >
            {value}
          </h2>

          <span
            style={{
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            {subtitle}
          </span>
        </div>

        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
      }}
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <header
        style={{
          height: "72px",
          background: "#ffffff",
          borderBottom:
            "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg,#1d4ed8,#2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
            }}
          >
            💊
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 800,
              }}
            >
              Medi<span
                style={{
                  color: "#2563eb",
                }}
              >
                Stock
              </span>
            </h1>

            <span
              style={{
                fontSize: "11px",
                color: "#64748b",
              }}
            >
              Admin Control Center
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <button
            onClick={loadDashboardData}
            style={{
              border: "1px solid #dbeafe",
              background: "#eff6ff",
              color: "#2563eb",
              padding:
                "9px 14px",
              borderRadius: "9px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ↻ Refresh
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "#1d4ed8",
              }}
            >
              {username
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                {username}
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                Administrator
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              border: "none",
              background: "#fee2e2",
              color: "#dc2626",
              padding:
                "9px 14px",
              borderRadius: "9px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* ========================================================
          MAIN
      ======================================================== */}

      <main
        style={{
          maxWidth: "1450px",
          margin: "0 auto",
          padding:
            "32px 36px 60px",
        }}
      >
        {/* ======================================================
            WELCOME
        ====================================================== */}

        <section
          style={{
            background:
              "linear-gradient(135deg,#0f3d91,#2563eb)",
            borderRadius: "20px",
            padding: "32px",
            color: "#ffffff",
            marginBottom: "28px",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                opacity: 0.8,
                textTransform:
                  "uppercase",
                letterSpacing: "1px",
                fontWeight: 700,
              }}
            >
              Administrator Portal
            </div>

            <h1
              style={{
                margin:
                  "8px 0",
                fontSize: "30px",
              }}
            >
              Welcome back,{" "}
              {username} 👋
            </h1>

            <p
              style={{
                margin: 0,
                opacity: 0.9,
              }}
            >
              Monitor your complete
              medical inventory and
              supplier operations.
            </p>
          </div>

          <div
            style={{
              fontSize: "72px",
            }}
          >
            🛡️
          </div>
        </section>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div
            style={{
              background: "#fef2f2",
              color: "#b91c1c",
              border:
                "1px solid #fecaca",
              padding: "14px 18px",
              borderRadius: "10px",
              marginBottom: "22px",
            }}
          >
            {error}
          </div>
        )}

        {/* ======================================================
            LOADING
        ====================================================== */}

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "70px",
              color: "#64748b",
            }}
          >
            <div
              style={{
                fontSize: "40px",
                marginBottom: "12px",
              }}
            >
              ⏳
            </div>

            Loading admin dashboard...
          </div>
        ) : (
          <>
            {/* ==================================================
                STATISTICS
            ================================================== */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(200px,1fr))",
                gap: "18px",
                marginBottom: "30px",
              }}
            >
              <StatCard
                icon="💊"
                title="TOTAL MEDICINES"
                value={
                  stats.totalMedicines
                }
                subtitle="Medicine records"
              />

              <StatCard
                icon="📦"
                title="AVAILABLE STOCK"
                value={
                  stats.availableStock
                }
                subtitle="Total units"
              />

              <StatCard
                icon="⚠️"
                title="LOW STOCK"
                value={
                  stats.lowStock
                }
                subtitle="Needs attention"
              />

              <StatCard
                icon="🚫"
                title="OUT OF STOCK"
                value={
                  stats.outOfStock
                }
                subtitle="Unavailable items"
              />

              <StatCard
                icon="🚚"
                title="TOTAL SUPPLIERS"
                value={
                  stats.totalSuppliers
                }
                subtitle="Registered suppliers"
              />

              <StatCard
                icon="₹"
                title="INVENTORY VALUE"
                value={formatCurrency(
                  stats.inventoryValue
                )}
                subtitle="Current stock value"
              />
            </div>

            {/* ==================================================
                QUICK ACTIONS
            ================================================== */}

            <section
              style={{
                marginBottom: "30px",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  marginBottom: "16px",
                }}
              >
                Quick Actions
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(210px,1fr))",
                  gap: "16px",
                }}
              >
                <button
                  onClick={() =>
                    navigate(
                      "/admin/medicines"
                    )
                  }
                  style={{
                    padding: "20px",
                    border: "1px solid #dbeafe",
                    borderRadius: "14px",
                    background: "#ffffff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      fontSize: "28px",
                    }}
                  >
                    💊
                  </div>

                  <strong>
                    Manage Medicines
                  </strong>

                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                      marginBottom: 0,
                    }}
                  >
                    Add, update and
                    manage medicines.
                  </p>
                </button>

                <button
                  onClick={() =>
                    navigate(
                      "/admin/inventory"
                    )
                  }
                  style={{
                    padding: "20px",
                    border: "1px solid #dbeafe",
                    borderRadius: "14px",
                    background: "#ffffff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      fontSize: "28px",
                    }}
                  >
                    📦
                  </div>

                  <strong>
                    Inventory
                  </strong>

                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                      marginBottom: 0,
                    }}
                  >
                    Monitor stock and
                    inventory records.
                  </p>
                </button>

                <button
                  onClick={() =>
                    navigate(
                      "/admin/suppliers"
                    )
                  }
                  style={{
                    padding: "20px",
                    border: "1px solid #dbeafe",
                    borderRadius: "14px",
                    background: "#ffffff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      fontSize: "28px",
                    }}
                  >
                    🚚
                  </div>

                  <strong>
                    Suppliers
                  </strong>

                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                      marginBottom: 0,
                    }}
                  >
                    Manage suppliers and
                    contacts.
                  </p>
                </button>

                <button
                  onClick={() =>
                    navigate(
                      "/admin/purchases"
                    )
                  }
                  style={{
                    padding: "20px",
                    border: "1px solid #dbeafe",
                    borderRadius: "14px",
                    background: "#ffffff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      fontSize: "28px",
                    }}
                  >
                    🛒
                  </div>

                  <strong>
                    Purchases
                  </strong>

                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                      marginBottom: 0,
                    }}
                  >
                    View purchase and
                    restocking activity.
                  </p>
                </button>
              </div>
            </section>

            {/* ==================================================
                TWO COLUMN SECTION
            ================================================== */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "22px",
              }}
            >
              {/* LOW STOCK */}

              <section
                style={{
                  background: "#ffffff",
                  border:
                    "1px solid #e5e7eb",
                  borderRadius: "16px",
                  padding: "22px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    marginBottom:
                      "18px",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "18px",
                    }}
                  >
                    ⚠️ Low Stock Medicines
                  </h2>

                  <button
                    onClick={() =>
                      navigate(
                        "/admin/medicines"
                      )
                    }
                    style={{
                      border: "none",
                      background:
                        "transparent",
                      color: "#2563eb",
                      cursor:
                        "pointer",
                      fontWeight: 600,
                    }}
                  >
                    View All →
                  </button>
                </div>

                {lowStockMedicines.length ===
                0 ? (
                  <div
                    style={{
                      padding: "30px",
                      textAlign:
                        "center",
                      color:
                        "#64748b",
                    }}
                  >
                    ✅ No low-stock
                    medicines
                  </div>
                ) : (
                  lowStockMedicines.map(
                    (medicine) => {
                      const quantity =
                        Number(
                          medicine.stockQuantity
                        ) || 0;

                      return (
                        <div
                          key={
                            medicine.id
                          }
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            padding:
                              "14px 0",
                            borderBottom:
                              "1px solid #f1f5f9",
                          }}
                        >
                          <div>
                            <strong>
                              {
                                medicine.name
                              }
                            </strong>

                            <div
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "#64748b",
                                marginTop:
                                  "4px",
                              }}
                            >
                              {medicine.category ||
                                "General"}
                            </div>
                          </div>

                          <span
                            style={{
                              background:
                                quantity ===
                                0
                                  ? "#fee2e2"
                                  : "#fef3c7",
                              color:
                                quantity ===
                                0
                                  ? "#b91c1c"
                                  : "#92400e",
                              padding:
                                "6px 10px",
                              borderRadius:
                                "8px",
                              fontSize:
                                "12px",
                              fontWeight:
                                700,
                            }}
                          >
                            {quantity ===
                            0
                              ? "Out of Stock"
                              : `${quantity} units`}
                          </span>
                        </div>
                      );
                    }
                  )
                )}
              </section>

              {/* RECENT MEDICINES */}

              <section
                style={{
                  background: "#ffffff",
                  border:
                    "1px solid #e5e7eb",
                  borderRadius: "16px",
                  padding: "22px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    marginBottom:
                      "18px",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "18px",
                    }}
                  >
                    💊 Recent Medicines
                  </h2>

                  <button
                    onClick={() =>
                      navigate(
                        "/admin/medicines"
                      )
                    }
                    style={{
                      border: "none",
                      background:
                        "transparent",
                      color: "#2563eb",
                      cursor:
                        "pointer",
                      fontWeight: 600,
                    }}
                  >
                    View All →
                  </button>
                </div>

                {recentMedicines.length ===
                0 ? (
                  <div
                    style={{
                      padding: "30px",
                      textAlign:
                        "center",
                      color:
                        "#64748b",
                    }}
                  >
                    No medicines found.
                  </div>
                ) : (
                  recentMedicines.map(
                    (medicine) => (
                      <div
                        key={
                          medicine.id
                        }
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "center",
                          padding:
                            "14px 0",
                          borderBottom:
                            "1px solid #f1f5f9",
                        }}
                      >
                        <div>
                          <strong>
                            {
                              medicine.name
                            }
                          </strong>

                          <div
                            style={{
                              fontSize:
                                "12px",
                              color:
                                "#64748b",
                              marginTop:
                                "4px",
                            }}
                          >
                            {medicine.category ||
                              "General"}
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize:
                              "13px",
                            fontWeight:
                              700,
                          }}
                        >
                          {Number(
                            medicine.stockQuantity
                          ) || 0}{" "}
                          units
                        </span>
                      </div>
                    )
                  )
                )}
              </section>
            </div>

            {/* ==================================================
                SYSTEM OVERVIEW
            ================================================== */}

            <section
              style={{
                marginTop: "24px",
                background: "#ffffff",
                border:
                  "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  fontSize: "19px",
                }}
              >
                🛡️ Admin System Overview
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(220px,1fr))",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    padding: "18px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                  }}
                >
                  <strong>
                    Inventory Management
                  </strong>

                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    Monitor medicines,
                    quantities and stock
                    status.
                  </p>
                </div>

                <div
                  style={{
                    padding: "18px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                  }}
                >
                  <strong>
                    Supplier Management
                  </strong>

                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    Manage suppliers and
                    supplier relationships.
                  </p>
                </div>

                <div
                  style={{
                    padding: "18px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                  }}
                >
                  <strong>
                    Stock Monitoring
                  </strong>

                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    Identify low-stock and
                    unavailable medicines.
                  </p>
                </div>

                <div
                  style={{
                    padding: "18px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                  }}
                >
                  <strong>
                    System Control
                  </strong>

                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    Administrator has
                    system-wide access.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}