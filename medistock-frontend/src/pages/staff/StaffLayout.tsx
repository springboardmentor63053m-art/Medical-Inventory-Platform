import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "./StaffLayout.css";

const StaffLayout: React.FC = () => {
  const [username, setUsername] = useState("Staff User");
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        const loggedInName =
          user.username ||
          user.userName ||
          user.name ||
          user.fullName ||
          "Staff User";

        setUsername(loggedInName);
      } catch {
        setUsername(storedUser);
      }
    }
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");

    window.location.href = "/login";
  };

  /* =========================================================
     PAGE HEADER
     ========================================================= */

  const getPageHeader = () => {
    switch (location.pathname) {
      case "/staff/medicines":
        return {
          title: "Medicines",
          description: "View and search available medicines",
        };

      case "/staff/search":
        return {
          title: "Search Medicine",
          description: "Find medicines by name, category or stock status",
        };

      case "/staff/stock":
        return {
          title: "Stock",
          description: "Monitor medicine stock and availability",
        };

      case "/staff/activity":
        return {
          title: "Activity",
          description: "View your recent inventory activities",
        };

      case "/staff/dashboard":
      default:
        return {
          title: "Staff Dashboard",
          description: "Medicine and inventory overview",
        };
    }
  };

  const pageHeader = getPageHeader();

  return (
    <div className="staff-layout">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="staff-sidebar">

        <div className="staff-logo">
          Medi<span>Stock</span>
        </div>

        <nav>

          <Link
            to="/staff/dashboard"
            className={
              isActive("/staff/dashboard")
                ? "active"
                : ""
            }
          >
            Dashboard
          </Link>

          

          <Link
            to="/staff/search"
            className={
              isActive("/staff/search")
                ? "active"
                : ""
            }
          >
            Search Medicine
          </Link>

          <Link
            to="/staff/stock"
            className={
              isActive("/staff/stock")
                ? "active"
                : ""
            }
          >
            Stock
          </Link>

          <Link
            to="/staff/activity"
            className={
              isActive("/staff/activity")
                ? "active"
                : ""
            }
          >
            Activity
          </Link>

        </nav>

        <button
          className="staff-logout"
          onClick={handleLogout}
        >
          Logout
        </button>

      </aside>

      {/* =====================================================
          MAIN AREA
          ===================================================== */}

      <main className="staff-main">

        {/* ===================================================
            PAGE HEADER
            =================================================== */}

        <header className="staff-header">

          <div>
            <h1>
              {pageHeader.title}
            </h1>

            <p>
              {pageHeader.description}
            </p>
          </div>

          {/* User */}

          <div className="staff-user">

            <div className="staff-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>
                {username}
              </strong>

              <span>
                Staff
              </span>
            </div>

          </div>

        </header>

        {/* ===================================================
            PAGE CONTENT
            =================================================== */}

        <Outlet />

      </main>

    </div>
  );
};

export default StaffLayout;