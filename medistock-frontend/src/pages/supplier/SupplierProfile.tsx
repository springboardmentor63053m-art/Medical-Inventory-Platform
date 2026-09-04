import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import "../../styles/supplier-dashboard.css";
import "../../styles/supplier-profile.css";

const SupplierProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [editing, setEditing] = useState(false);

  const rawUser = useMemo(() => {
    return user || (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "null");
      } catch {
        return null;
      }
    })();
  }, [user]);

  const loggedInName = useMemo(() => {
    const name =
      rawUser?.username ||
      rawUser?.name ||
      rawUser?.fullName ||
      localStorage.getItem("username") ||
      "Supplier";

    return String(name)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [rawUser]);

  const [profile, setProfile] = useState({
    name: loggedInName,
    supplierId: rawUser?.supplierId || (rawUser?.id ? `SUP-${String(rawUser.id).padStart(4, "0")}` : "SUP-0002"),
    email: rawUser?.email || `${loggedInName.toLowerCase().replace(/\s+/g, "")}@medistock.com`,
    phone: rawUser?.phone || "+91 98765 43210",
    company:
      rawUser?.company ||
      rawUser?.companyName ||
      `${loggedInName} Medical Supplies`,
    address: rawUser?.address || "Supplier Central Hub, Industrial Area",
    city: rawUser?.city || "Chittoor",
    state: rawUser?.state || "Andhra Pradesh",
    status: "Active",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const initials =
    profile.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "S";

  return (
    <div className="supplier-app">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="supplier-sidebar">

        {/* BRAND */}

        <div className="supplier-brand">

          <div className="supplier-brand-logo">
            <span>⌁</span>
          </div>

          <div>
            <h2>
              Medi<span>Stock</span>
            </h2>

            <p>
              MEDICAL INVENTORY
            </p>
          </div>

        </div>

        {/* SUPPLIER ROLE */}

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

        {/* =================================================
            SUPPLIER NAVIGATION
            ================================================= */}

        <nav className="supplier-navigation">

          {/* DASHBOARD */}

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() =>
              navigate("/supplier/dashboard")
            }
          >
            <span>▦</span>
            <strong>Dashboard</strong>
          </button>

          {/* MY MEDICINES */}

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() =>
              navigate("/supplier/medicines")
            }
          >
            <span>💊</span>
            <strong>My Medicines</strong>
          </button>

          {/* PURCHASE ORDERS */}

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() =>
              navigate("/supplier/purchases")
            }
          >
            <span>🛒</span>
            <strong>Purchase Orders</strong>
          </button>

          {/* SUPPLY ACTIVITY */}

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() =>
              navigate("/supplier/activity")
            }
          >
            <span>◷</span>
            <strong>Supply Activity</strong>
          </button>

          {/* MY PROFILE */}

          <button
            type="button"
            className="supplier-nav-item active"
            onClick={() =>
              navigate("/supplier/profile")
            }
          >
            <span>♙</span>
            <strong>My Profile</strong>
          </button>

          {/* NOTIFICATIONS */}

          <button
            type="button"
            className="supplier-nav-item"
            onClick={() =>
              navigate("/supplier/notifications")
            }
          >
            <span>♧</span>
            <strong>Notifications</strong>
            <em>3</em>
          </button>

        </nav>

        {/* LOGOUT */}

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

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <main className="supplier-main">

        {/* =================================================
            TOP HEADER
            ================================================= */}

        <header className="supplier-topbar">

          <div className="supplier-topbar-title">

            <h1>
              My Profile
            </h1>

            <p>
              MediStock Medical Inventory Platform
            </p>

          </div>

          <div className="supplier-topbar-right">

            {/* Notification */}

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

            {/* User */}

            <div className="supplier-user">

              <div className="supplier-user-avatar">
                {initials}
              </div>

              <div>

                <strong>
                  {profile.name}
                </strong>

                <span>
                  Supplier
                </span>

              </div>

            </div>

            {/* Logout */}

            <button
              type="button"
              className="supplier-top-logout"
              onClick={logout}
            >
              ↪ Logout
            </button>

          </div>

        </header>

        {/* =================================================
            PROFILE CONTENT
            ================================================= */}

        <div className="supplier-content">

          {/* PAGE HEADING */}

          <section className="supplier-page-heading">

            <div>

              <div className="supplier-eyebrow">
                SUPPLIER PORTAL
              </div>

              <h1>
                My Profile
              </h1>

              <p>
                View and manage your supplier account
                information.
              </p>

            </div>

            <button
              type="button"
              className="supplier-profile-edit"
              onClick={() =>
                setEditing(!editing)
              }
            >
              {editing
                ? "Cancel"
                : "✎ Edit Profile"}
            </button>

          </section>

          {/* =================================================
              PROFILE HERO
              ================================================= */}

          <section className="supplier-profile-card">

            <div className="supplier-profile-avatar">
              {initials}
            </div>

            <div className="supplier-profile-main">

              <div className="supplier-profile-name-row">

                <h2>
                  {profile.name}
                </h2>

                <span className="supplier-profile-active">
                  <i />
                  {profile.status}
                </span>

              </div>

              <p>
                Registered Supplier
              </p>

              <span className="supplier-profile-id">
                Supplier ID:{" "}
                {profile.supplierId}
              </span>

            </div>

          </section>

          {/* =================================================
              PERSONAL INFORMATION
              ================================================= */}

          <section className="supplier-profile-section">

            <div className="supplier-profile-section-header">

              <div>

                <h2>
                  Personal Information
                </h2>

                <p>
                  Your supplier account details.
                </p>

              </div>

            </div>

            <div className="supplier-profile-grid">

              {/* FULL NAME */}

              <div className="supplier-profile-field">

                <label>
                  FULL NAME
                </label>

                {editing ? (
                  <input
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>
                    {profile.name}
                  </strong>
                )}

              </div>

              {/* SUPPLIER ID */}

              <div className="supplier-profile-field">

                <label>
                  SUPPLIER ID
                </label>

                <strong>
                  {profile.supplierId}
                </strong>

              </div>

              {/* EMAIL */}

              <div className="supplier-profile-field">

                <label>
                  EMAIL ADDRESS
                </label>

                {editing ? (
                  <input
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>
                    {profile.email}
                  </strong>
                )}

              </div>

              {/* PHONE */}

              <div className="supplier-profile-field">

                <label>
                  CONTACT NUMBER
                </label>

                {editing ? (
                  <input
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>
                    {profile.phone}
                  </strong>
                )}

              </div>

            </div>

          </section>

          {/* =================================================
              SUPPLIER INFORMATION
              ================================================= */}

          <section className="supplier-profile-section">

            <div className="supplier-profile-section-header">

              <div>

                <h2>
                  Supplier Information
                </h2>

                <p>
                  Information related to your
                  supply account.
                </p>

              </div>

            </div>

            <div className="supplier-profile-grid">

              {/* COMPANY */}

              <div className="supplier-profile-field">

                <label>
                  SUPPLIER / COMPANY NAME
                </label>

                {editing ? (
                  <input
                    name="company"
                    value={profile.company}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>
                    {profile.company}
                  </strong>
                )}

              </div>

              {/* STATUS */}

              <div className="supplier-profile-field">

                <label>
                  STATUS
                </label>

                <span className="supplier-profile-status">
                  <i />
                  {profile.status}
                </span>

              </div>

              {/* ADDRESS */}

              <div className="supplier-profile-field supplier-profile-wide">

                <label>
                  ADDRESS
                </label>

                {editing ? (
                  <input
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>
                    {profile.address}
                  </strong>
                )}

              </div>

              {/* CITY */}

              <div className="supplier-profile-field">

                <label>
                  CITY
                </label>

                {editing ? (
                  <input
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>
                    {profile.city}
                  </strong>
                )}

              </div>

              {/* STATE */}

              <div className="supplier-profile-field">

                <label>
                  STATE
                </label>

                {editing ? (
                  <input
                    name="state"
                    value={profile.state}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>
                    {profile.state}
                  </strong>
                )}

              </div>

            </div>

            {/* SAVE */}

            {editing && (

              <div className="supplier-profile-save-row">

                <button
                  type="button"
                  className="supplier-profile-save"
                  onClick={() =>
                    setEditing(false)
                  }
                >
                  ✓ Save Changes
                </button>

              </div>

            )}

          </section>

          {/* =================================================
              ACCOUNT STATUS
              ================================================= */}

          <section className="supplier-profile-security">

            <div className="supplier-profile-security-icon">
              ✓
            </div>

            <div>

              <h3>
                Supplier Account Active
              </h3>

              <p>
                Your MediStock supplier account
                is active and available for
                managing medicines and purchase
                orders.
              </p>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
};

export default SupplierProfile;