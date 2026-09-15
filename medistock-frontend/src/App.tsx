import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Toaster } from "sonner";
import axiosInstance from "@/api/axios";

import {
  LayoutDashboard,
  Pill,
  Package,
  Truck,
  ShoppingCart,
  ClipboardList,
  FileText,
  CalendarClock,
  Activity,
  Bell,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";

// ============================================================
// AUTH
// ============================================================

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import { ProtectedRoute } from "./routes/ProtectedRoute";

// ============================================================
// ADMIN PAGES
// ============================================================

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMedicines from "./pages/admin/Medicines";
import Inventory from "./pages/admin/Inventory";
import Purchases from "./pages/admin/Purchases";
import PurchaseItems from "./pages/purchases/PurchaseItems";
import { MedicineForm } from "./pages/medicines/MedicineForm";
import { ExpiryTracking } from "@/pages/admin/ExpiryTracking";
import AdminNotifications from "./pages/admin/AdminNotifications";
import Reports from "./pages/admin/Reports";
import StockActivity from "./pages/admin/StockActivity";
import AdminUsers from "./pages/admin/Users";
import Roles from "./pages/admin/Roles";

// ============================================================
// USER
// ============================================================

import UserDashboard from "./pages/user/UserDashboard";

// ============================================================
// STAFF
// ============================================================

import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffLayout from "./pages/staff/StaffLayout";
import StaffSearchMedicine from "./pages/staff/StaffSearchMedicine";
import StaffStock from "./pages/staff/StaffStock";
import StaffActivity from "./pages/staff/StaffActivity";
import StaffNotifications from "./pages/staff/StaffNotifications";

// ============================================================
// PHARMACIST
// ============================================================

import PharmacistLayout from "./pages/Pharmacist/PharmacistLayout";
import PharmacistDashboard from "./pages/Pharmacist/PharmacistDashboard";
import PharmacistMedicines from "./pages/Pharmacist/PharmacistMedicines";
import PharmacistOrders from "./pages/Pharmacist/PharmacistOrders";
import PharmacistPrescriptions from "./pages/Pharmacist/PharmacistPrescriptions";
import PharmacistNotifications from "./pages/Pharmacist/PharmacistNotifications";
import PharmacistActivity from "./pages/Pharmacist/PharmacistActivity";
import PharmacistDispensing from "./pages/Pharmacist/PharmacistDispensing";

// ============================================================
// SUPPLIERS
// ============================================================

import { SuppliersList } from "./pages/supplier/SuppliersList";
import { SupplierForm } from "./pages/supplier/SupplierForm";

// ============================================================
// RESOURCE MANAGER
// ============================================================

import { ResourceManager } from "./pages/ResourceManager";
import { resources } from "./pages/resources";
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import SupplierMedicines from "./pages/supplier/SupplierMedicines";

import SupplierPurchaseOrders from "./pages/supplier/SupplierPurchaseOrders";
import SupplierSupplyActivity from "./pages/supplier/SupplierSupplyActivity";
import SupplierProfile from "./pages/supplier/SupplierProfile";
import SupplierNotifications from "./pages/supplier/SupplierNotifications";

// ============================================================
// ADMIN SIDEBAR
// ============================================================

function AdminSidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Medicines",
      path: "/admin/medicines",
      icon: Pill,
    },
    {
      label: "Inventory",
      path: "/admin/inventory",
      icon: Package,
    },
    {
      label: "Suppliers",
      path: "/admin/suppliers",
      icon: Truck,
    },
    {
      label: "Purchases",
      path: "/admin/purchases",
      icon: ShoppingCart,
    },
    {
      label: "Purchase Items",
      path: "/admin/purchase-items",
      icon: ClipboardList,
    },
    {
      label: "Reports",
      path: "/admin/reports",
      icon: FileText,
    },
    {
      label: "Expiry Tracking",
      path: "/admin/expiries",
      icon: CalendarClock,
    },
    {
      label: "Stock Activity",
      path: "/admin/stock-logs",
      icon: Activity,
    },
    {
      label: "Notifications",
      path: "/admin/notifications",
      icon: Bell,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Roles",
      path: "/admin/roles",
      icon: ShieldCheck,
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");

    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="admin-mobile-menu"
        style={{
          position: "fixed",
          top: "18px",
          left: "18px",
          zIndex: 100,
          display: "none",
          border: "none",
          background: "#2563eb",
          color: "#ffffff",
          width: "44px",
          height: "44px",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <aside
        className={mobileOpen ? "admin-sidebar-open" : ""}
        style={{
          width: "270px",
          minWidth: "270px",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          background: "#ffffff",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
          overflowY: "auto",
          boxShadow: "2px 0 12px rgba(15, 23, 42, 0.04)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "22px 22px 20px",
            borderBottom: "1px solid #eef2f7",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "16px",
                background: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                flexShrink: 0,
              }}
            >
              <Pill size={32} />
            </div>

            <div>
              <div
                style={{
                  fontSize: "27px",
                  fontWeight: 800,
                  color: "#172033",
                  lineHeight: 1,
                }}
              >
                Medi<span style={{ color: "#2563eb" }}>Stock</span>
              </div>

              <div
                style={{
                  marginTop: "7px",
                  fontSize: "13px",
                  color: "#94a3b8",
                  letterSpacing: "0.5px",
                }}
              >
                MEDICAL INVENTORY
              </div>
            </div>
          </div>
        </div>

        {/* Role */}
        <div
          style={{
            margin: "24px 20px 18px",
            padding: "14px 16px",
            borderRadius: "12px",
            background: "#eff6ff",
            border: "1px solid #dbeafe",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#2563eb",
            fontWeight: 700,
          }}
        >
          <ShieldCheck size={21} />
          <span>Administrator</span>
        </div>

        {/* Main Menu */}
        <div
          style={{
            padding: "0 20px",
            fontSize: "12px",
            fontWeight: 800,
            color: "#94a3b8",
            letterSpacing: "1px",
            marginBottom: "10px",
          }}
        >
          MAIN MENU
        </div>

        <nav
          style={{
            padding: "0 16px",
            flex: 1,
          }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  padding: "14px 16px",
                  marginBottom: "5px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  color: active ? "#2563eb" : "#64748b",
                  background: active ? "#eff6ff" : "transparent",
                  borderLeft: active
                    ? "4px solid #2563eb"
                    : "4px solid transparent",
                  fontSize: "16px",
                  fontWeight: active ? 700 : 600,
                  transition: "all 0.2s ease",
                }}
              >
                <Icon
                  size={21}
                  strokeWidth={active ? 2.5 : 2}
                />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Menu */}
        <div
          style={{
            borderTop: "1px solid #eef2f7",
            padding: "14px 16px 18px",
          }}
        >
          <Link
            to="/settings"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              padding: "14px 16px",
              textDecoration: "none",
              color: "#64748b",
              fontSize: "16px",
              fontWeight: 600,
              borderRadius: "12px",
            }}
          >
            <Settings size={21} />
            Settings
          </Link>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "15px",
              padding: "14px 16px",
              marginTop: "5px",
              border: "none",
              borderRadius: "12px",
              background: "#fff1f2",
              color: "#dc2626",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <LogOut size={21} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

// ============================================================
// ADMIN HEADER
// ============================================================

function AdminHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const response = await axiosInstance.get("/notifications?role=ROLE_ADMIN");
        if (Array.isArray(response.data)) {
          const unread = response.data.filter(
            (n: any) => !n.isRead && (!n.user || n.user?.role?.name === "ROLE_ADMIN" || n.user?.role?.name === "ADMIN")
          ).length;
          setUnreadCount(unread);
        }
      } catch {
        // non-blocking
      }
    };
    fetchUnread();
  }, [location.pathname]);

  const getTitle = () => {
    const pathname = location.pathname;

    if (pathname === "/admin/dashboard") {
      return "Dashboard";
    }

    if (pathname === "/admin/medicines") {
      return "Medicines";
    }

    if (
      pathname === "/admin/suppliers" ||
      pathname.startsWith("/admin/suppliers/")
    ) {
      return "Suppliers";
    }

    if (
      pathname === "/admin/purchases" ||
      pathname.startsWith("/admin/purchases/")
    ) {
      return "Purchases";
    }

    if (
      pathname === "/admin/purchase-items" ||
      pathname.startsWith("/admin/purchase-items/")
    ) {
      return "Purchase Items";
    }

    if (
      pathname === "/admin/inventory" ||
      pathname.startsWith("/admin/inventory/")
    ) {
      return "Inventory";
    }

    if (pathname.startsWith("/admin/reports")) {
      return "Reports";
    }

    if (pathname.startsWith("/admin/expiries")) {
      return "Expiry Tracking";
    }

    if (pathname.startsWith("/admin/stock-logs")) {
      return "Stock Activity";
    }

    if (pathname.startsWith("/admin/notifications")) {
      return "Notifications";
    }

    if (pathname.startsWith("/admin/users")) {
      return "Users";
    }

    if (pathname.startsWith("/admin/roles")) {
      return "Roles";
    }

    return "Dashboard";
  };

  return (
    <header
      style={{
        height: "104px",
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Left */}
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "30px",
            fontWeight: 800,
            color: "#172033",
          }}
        >
          {getTitle()}
        </h1>

        <p
          style={{
            margin: "5px 0 0",
            color: "#94a3b8",
            fontSize: "15px",
          }}
        >
          MediStock Medical Inventory Platform
        </p>
      </div>

      {/* Right */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
        }}
      >
        {/* Notification */}
        <button
          onClick={() => navigate("/admin/notifications")}
          title="Notifications"
          style={{
            position: "relative",
            width: "54px",
            height: "54px",
            borderRadius: "14px",
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            cursor: "pointer",
          }}
        >
          <Bell size={23} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                background: "#ef4444",
                color: "#ffffff",
                borderRadius: "50%",
                padding: "2px 6px",
                fontSize: "11px",
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* User */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "#dbeafe",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 800,
            }}
          >
            N
          </div>

          <div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "#172033",
              }}
            >
              nithya
            </div>

            <div
              style={{
                fontSize: "13px",
                color: "#94a3b8",
              }}
            >
              Administrator
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("authToken");

            window.location.href = "/login";
          }}
          style={{
            padding: "14px 22px",
            borderRadius: "12px",
            border: "none",
            background: "#fff1f2",
            color: "#dc2626",
            fontWeight: 700,
            fontSize: "15px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </header>
  );
}

// ============================================================
// ADMIN LAYOUT
// ============================================================

function AdminLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
      }}
    >
      <AdminSidebar />

      <div
        style={{
          marginLeft: "270px",
          minHeight: "100vh",
        }}
      >
        <AdminHeader />

        <main
          style={{
            padding: "36px 40px 50px",
            minHeight: "calc(100vh - 104px)",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        richColors
      />

      <Routes>

        {/* ==================================================
            ROOT
        ================================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* ==================================================
            AUTH
        ================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ==================================================
            GENERAL DASHBOARD
        ================================================== */}

        <Route
          path="/dashboard"
          element={
            <Navigate
              to="/admin/dashboard"
              replace
            />
          }
        />

        {/* ==================================================
            ADMIN
        ================================================== */}

        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route
            path="/admin"
            element={<AdminLayout />}
          >

            {/* /admin -> /admin/dashboard */}

            <Route
              index
              element={
                <Navigate
                  to="/admin/dashboard"
                  replace
                />
              }
            />

          {/* ==================================================
              DASHBOARD
          ================================================== */}

          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          {/* ==================================================
              MEDICINES
          ================================================== */}

          <Route
            path="medicines"
            element={<AdminMedicines />}
          />
          <Route
            path="medicines/new"
            element={<MedicineForm />}
          />

          <Route
            path="medicines/:id/edit"
            element={<MedicineForm />}
          />

          {/* ==================================================
              INVENTORY
          ================================================== */}

          <Route
            path="inventory"
            element={<Inventory />}
          />

          {/* ==================================================
              SUPPLIERS
          ================================================== */}

          <Route
            path="suppliers"
            element={<SuppliersList />}
          />

          <Route
            path="suppliers/new"
            element={<SupplierForm />}
          />

          <Route
            path="suppliers/:id/edit"
            element={<SupplierForm />}
          />

          {/* ==================================================
              PURCHASES
          ================================================== */}

          <Route
            path="purchases"
            element={<Purchases />}
          />

          {/* ==================================================
              PURCHASE ITEMS
          ================================================== */}

          <Route
            path="purchase-items"
            element={<PurchaseItems />}
          />

          {/* ==================================================
              REPORTS
          ================================================== */}

          <Route
            path="reports"
            element={<Reports />}
          />

          {/* ==================================================
              EXPIRY TRACKING
          ================================================== */}

          <Route
            path="expiries"
            element={<ExpiryTracking />}
          />

          <Route
            path="/admin/expiry-tracking"
            element={<ExpiryTracking/>
             
                
            }
          />

          {/* ==================================================
              STOCK ACTIVITY
          ================================================== */}

          <Route
            path="stock-logs"
            element={<StockActivity />}
          />

          <Route
            path="stock-activity"
            element={<StockActivity />}
          />

          {/* ==================================================
              NOTIFICATIONS
          ================================================== */}

          <Route
            path="notifications"
            element={<AdminNotifications />}
          />

          {/* ==================================================
              USERS
          ================================================== */}

          <Route
            path="users"
            element={<AdminUsers
              
              />
            }
          />

          {/* ==================================================
              ROLES
          ================================================== */}

          <Route
            path="roles"
            element={<Roles />}
          />

        </Route>
        </Route>

        {/* ==================================================
            SUPPLIER PORTAL
        ================================================== */}

        <Route
          path="/supplier/dashboard"
          element={<SupplierDashboard />}
        />

        <Route
          path="/supplier/medicines"
          element={<SupplierMedicines />}
        />

        <Route
          path="/supplier/purchases"
          element={<SupplierPurchaseOrders />}
        />

        <Route
          path="/supplier/activity"
          element={<SupplierSupplyActivity />}
        />

        <Route
          path="/supplier/profile"
          element={<SupplierProfile />}
        />

        <Route
          path="/supplier/notifications"
          element={<SupplierNotifications />}
        />

        {/* ==================================================
            USER
        ================================================== */}

        <Route
          path="/user/dashboard"
          element={<UserDashboard />}
        />

        {/* ==================================================
            STAFF
        ================================================== */}

        <Route element={<ProtectedRoute allowedRoles={["STAFF", "ADMIN"]} />}>
          <Route
            path="/staff"
            element={<StaffLayout />}
          >

            <Route
              index
              element={
                <Navigate
                  to="/staff/dashboard"
                  replace
                />
              }
            />

            <Route
              path="dashboard"
              element={<StaffDashboard />}
            />

            <Route
              path="search"
              element={<StaffSearchMedicine />}
            />

            <Route
              path="stock"
              element={<StaffStock />}
            />

            <Route
              path="activity"
              element={<StaffActivity />}
            />

            <Route
              path="notifications"
              element={<StaffNotifications />}
            />

          </Route>
        </Route>

        {/* ==================================================
            PHARMACIST
        ================================================== */}

        <Route element={<ProtectedRoute allowedRoles={["PHARMACIST", "ADMIN"]} />}>
          <Route
            path="/pharmacist"
            element={<PharmacistLayout />}
          >

            {/* /pharmacist -> /pharmacist/dashboard */}

            <Route
              index
              element={
                <Navigate
                  to="/pharmacist/dashboard"
                  replace
                />
              }
            />

            {/* ==================================================
                PHARMACIST DASHBOARD
            ================================================== */}

            <Route
              path="dashboard"
              element={<PharmacistDashboard />}
            />

            {/* ==================================================
                PHARMACIST MEDICINES
            ================================================== */}

            <Route
              path="medicines"
              element={<PharmacistMedicines />}
            />

            {/* ==================================================
                CUSTOMER ORDERS
            ================================================== */}

            <Route
              path="orders"
              element={<PharmacistOrders />}
            />

            <Route
              path="prescriptions"
              element={<PharmacistPrescriptions />}
            />

            {/* ==================================================
                NOTIFICATIONS
            ================================================== */}

            <Route
              path="notifications"
              element={<PharmacistNotifications />}
            />

            {/* ==================================================
                ACTIVITY
            ================================================== */}

            <Route
              path="activity"
              element={<PharmacistActivity />}
            />

            {/* ==================================================
                PROFILE
            ================================================== */}

            <Route
              path="dispensing"
              element={<PharmacistDispensing />}
            />

          </Route>
        </Route>

        {/* ==================================================
            FALLBACK
        ================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
