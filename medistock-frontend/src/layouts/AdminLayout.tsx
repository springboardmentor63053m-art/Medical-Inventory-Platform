import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    navigate("/login");
  };

  return (
    <div className="admin-layout">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-sidebar">

        {/* BRAND */}

        <div className="sidebar-brand">
          <div className="brand-icon">💊</div>

          <div>
            <div className="brand-name">MediStock</div>
            <div className="brand-subtitle">Administration</div>
          </div>
        </div>


        {/* NAVIGATION */}

        <nav className="sidebar-nav">

          <div className="nav-section-title">
            MAIN
          </div>

          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>


          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">👥</span>
            <span>User Management</span>
          </NavLink>


          <NavLink
            to="/admin/medicines"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">💊</span>
            <span>Medicines</span>
          </NavLink>


          <div className="nav-section-title">
            MANAGEMENT
          </div>


          <NavLink
            to="/admin/inventory"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">📦</span>
            <span>Inventory</span>
          </NavLink>


          <NavLink
            to="/admin/suppliers"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">🚚</span>
            <span>Suppliers</span>
          </NavLink>


        </nav>


        {/* BOTTOM USER AREA */}

        <div className="sidebar-bottom">

          <div className="admin-user">

            <div className="admin-avatar">
              👤
            </div>

            <div>
              <div className="admin-user-name">
                Administrator
              </div>

              <div className="admin-user-role">
                Admin
              </div>
            </div>

          </div>


          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <span>🚪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN APPLICATION
      ===================================================== */}

      <div className="admin-main">

        {/* TOP HEADER */}

        <header className="admin-header">

          <div className="header-title">
            MediStock Admin
          </div>

          <div className="system-status">
            <span className="status-dot"></span>
            System Online
          </div>

        </header>


        {/* PAGE CONTENT */}

        <main className="admin-content">
          {children}
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;