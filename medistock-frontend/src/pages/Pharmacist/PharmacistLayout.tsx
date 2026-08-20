import React, { useEffect, useState } from "react";
import {
  Link,
  Outlet,
  useLocation,
} from "react-router-dom";

import "./PharmacistLayout.css";

const PharmacistLayout: React.FC = () => {
  const [username, setUsername] =
    useState("Pharmacist");

  const location = useLocation();

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        const loggedInName =
          user.username ||
          user.userName ||
          user.name ||
          user.fullName ||
          "Pharmacist";

        setUsername(loggedInName);
      } catch {
        setUsername(storedUser);
      }
    }
  }, []);


  const isActive = (path: string) => {
    return location.pathname === path;
  };


  const getPageHeader = () => {
    switch (location.pathname) {

      case "/pharmacist/orders":
        return {
          title: "Orders",
          description:
            "Review customer medicine orders",
        };

      case "/pharmacist/prescriptions":
        return {
          title: "Prescriptions",
          description:
            "Review customer prescriptions",
        };

      case "/pharmacist/medicines":
        return {
          title: "Medicines",
          description:
            "View available medicines and stock",
        };

      case "/pharmacist/dispensing":
        return {
          title: "Dispensing",
          description:
            "Manage approved medicine orders",
        };

      case "/pharmacist/activity":
        return {
          title: "Activity",
          description:
            "View recent pharmacist activities",
        };

      default:
        return {
          title: "Pharmacist Dashboard",
          description:
            "Manage medicine orders and prescriptions",
        };
    }
  };


  const pageHeader = getPageHeader();


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");

    window.location.href = "/login";
  };


  return (
    <div className="pharmacist-layout">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="pharmacist-sidebar">

        <div className="pharmacist-logo">
          Medi<span>Stock</span>
        </div>


        <nav>

          <Link
            to="/pharmacist/dashboard"
            className={
              isActive(
                "/pharmacist/dashboard"
              )
                ? "active"
                : ""
            }
          >
            Dashboard
          </Link>


          <Link
            to="/pharmacist/orders"
            className={
              isActive(
                "/pharmacist/orders"
              )
                ? "active"
                : ""
            }
          >
            Orders
          </Link>


          <Link
            to="/pharmacist/prescriptions"
            className={
              isActive(
                "/pharmacist/prescriptions"
              )
                ? "active"
                : ""
            }
          >
            Prescriptions
          </Link>


          <Link
            to="/pharmacist/medicines"
            className={
              isActive(
                "/pharmacist/medicines"
              )
                ? "active"
                : ""
            }
          >
            Medicines
          </Link>


          <Link
            to="/pharmacist/dispensing"
            className={
              isActive(
                "/pharmacist/dispensing"
              )
                ? "active"
                : ""
            }
          >
            Dispensing
          </Link>


          <Link
            to="/pharmacist/activity"
            className={
              isActive(
                "/pharmacist/activity"
              )
                ? "active"
                : ""
            }
          >
            Activity
          </Link>

        </nav>


        <button
          className="pharmacist-logout"
          onClick={handleLogout}
        >
          Logout
        </button>

      </aside>


      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="pharmacist-main">

        <header className="pharmacist-header">

          <div>
            <h1>
              {pageHeader.title}
            </h1>

            <p>
              {pageHeader.description}
            </p>
          </div>


          <div className="pharmacist-user">

            <div className="pharmacist-avatar">
              {username
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {username}
              </strong>

              <span>
                Pharmacist
              </span>
            </div>

          </div>

        </header>


        <Outlet />

      </main>

    </div>
  );
};

export default PharmacistLayout;