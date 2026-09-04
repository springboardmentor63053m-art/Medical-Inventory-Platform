import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AdminSidebar() {

  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: "🏠",
    },
    {
      name: "User Management",
      path: "/admin/users",
      icon: "👥",
    },
    {
      name: "Medicines",
      path: "/admin/medicines",
      icon: "💊",
    },
    {
      name: "Inventory",
      path: "/admin/inventory",
      icon: "📦",
    },
    {
      name: "Suppliers",
      path: "/admin/suppliers",
      icon: "🚚",
    },
    {
      name: "Purchases",
      path: "/admin/purchases",
      icon: "🛒",
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: "📊",
    },
    {
      name: "Stock Activity",
      path: "/admin/stock-activity",
      icon: "📋",
    },
    {
      name: "Notifications",
      path: "/admin/notifications",
      icon: "🔔",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="admin-sidebar">

      {/* LOGO */}

      <div className="admin-logo">

        <div className="admin-logo-icon">
          💊
        </div>

        <div>
          <h2>
            Medi<span>Stock</span>
          </h2>

          <small>
            Admin Panel
          </small>
        </div>

      </div>


      {/* NAVIGATION */}

      <nav className="admin-nav">

        <p className="admin-nav-title">
          MAIN MENU
        </p>

        {menuItems.map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "admin-nav-link active"
                : "admin-nav-link"
            }
          >

            <span className="admin-nav-icon">
              {item.icon}
            </span>

            <span>
              {item.name}
            </span>

          </NavLink>

        ))}

      </nav>


      {/* BOTTOM */}

      <div className="admin-sidebar-bottom">

        <button
          className="admin-settings-button"
          onClick={() => navigate("/admin/settings")}
        >
          ⚙️
          <span>Settings</span>
        </button>

        <button
          className="admin-logout-button"
          onClick={handleLogout}
        >
          🚪
          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}