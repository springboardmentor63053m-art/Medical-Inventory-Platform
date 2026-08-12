import React, { useState } from "react";
import "../../styles/supplier-profile.css";

const SupplierProfile: React.FC = () => {
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Rahul",
    supplierId: "SUP-0001",
    email: "rahul@medistock.com",
    phone: "+91 XXXXX XXXXX",
    company: "Rahul Medical Supplies",
    address: "Supplier Address",
    city: "Chittoor",
    state: "Andhra Pradesh",
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

  return (
    <div className="supplier-profile-page">

      {/* HEADER */}

      <div className="supplier-profile-header">
        <div>
          <div className="supplier-profile-eyebrow">
            SUPPLIER PORTAL
          </div>

          <h1>My Profile</h1>

          <p>
            View and manage your supplier account information.
          </p>
        </div>

        <button
          className="supplier-profile-edit"
          onClick={() => setEditing(!editing)}
        >
          {editing ? "Cancel" : "✎ Edit Profile"}
        </button>
      </div>

      {/* PROFILE HERO */}

      <div className="supplier-profile-card">

        <div className="supplier-profile-avatar">
          R
        </div>

        <div className="supplier-profile-main">
          <div className="supplier-profile-name-row">
            <h2>{profile.name}</h2>

            <span className="supplier-profile-active">
              <i />
              {profile.status}
            </span>
          </div>

          <p>
            Registered Supplier
          </p>

          <span className="supplier-profile-id">
            Supplier ID: {profile.supplierId}
          </span>
        </div>

      </div>

      {/* INFORMATION */}

      <div className="supplier-profile-section">

        <div className="supplier-profile-section-header">
          <div>
            <h2>Personal Information</h2>
            <p>Your supplier account details.</p>
          </div>
        </div>

        <div className="supplier-profile-grid">

          <div className="supplier-profile-field">
            <label>FULL NAME</label>

            {editing ? (
              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
              />
            ) : (
              <strong>{profile.name}</strong>
            )}
          </div>

          <div className="supplier-profile-field">
            <label>SUPPLIER ID</label>
            <strong>{profile.supplierId}</strong>
          </div>

          <div className="supplier-profile-field">
            <label>EMAIL ADDRESS</label>

            {editing ? (
              <input
                name="email"
                value={profile.email}
                onChange={handleChange}
              />
            ) : (
              <strong>{profile.email}</strong>
            )}
          </div>

          <div className="supplier-profile-field">
            <label>CONTACT NUMBER</label>

            {editing ? (
              <input
                name="phone"
                value={profile.phone}
                onChange={handleChange}
              />
            ) : (
              <strong>{profile.phone}</strong>
            )}
          </div>

        </div>

      </div>

      {/* COMPANY */}

      <div className="supplier-profile-section">

        <div className="supplier-profile-section-header">
          <div>
            <h2>Supplier Information</h2>
            <p>Information related to your supply account.</p>
          </div>
        </div>

        <div className="supplier-profile-grid">

          <div className="supplier-profile-field">
            <label>SUPPLIER / COMPANY NAME</label>

            {editing ? (
              <input
                name="company"
                value={profile.company}
                onChange={handleChange}
              />
            ) : (
              <strong>{profile.company}</strong>
            )}
          </div>

          <div className="supplier-profile-field">
            <label>STATUS</label>

            <span className="supplier-profile-status">
              <i />
              {profile.status}
            </span>
          </div>

          <div className="supplier-profile-field supplier-profile-wide">
            <label>ADDRESS</label>

            {editing ? (
              <input
                name="address"
                value={profile.address}
                onChange={handleChange}
              />
            ) : (
              <strong>{profile.address}</strong>
            )}
          </div>

          <div className="supplier-profile-field">
            <label>CITY</label>

            {editing ? (
              <input
                name="city"
                value={profile.city}
                onChange={handleChange}
              />
            ) : (
              <strong>{profile.city}</strong>
            )}
          </div>

          <div className="supplier-profile-field">
            <label>STATE</label>

            {editing ? (
              <input
                name="state"
                value={profile.state}
                onChange={handleChange}
              />
            ) : (
              <strong>{profile.state}</strong>
            )}
          </div>

        </div>

        {editing && (
          <div className="supplier-profile-save-row">
            <button
              className="supplier-profile-save"
              onClick={() => setEditing(false)}
            >
              ✓ Save Changes
            </button>
          </div>
        )}

      </div>

      {/* ACCOUNT STATUS */}

      <div className="supplier-profile-security">

        <div className="supplier-profile-security-icon">
          ✓
        </div>

        <div>
          <h3>Supplier Account Active</h3>

          <p>
            Your MediStock supplier account is active and
            available for managing medicines and purchase orders.
          </p>
        </div>

      </div>

    </div>
  );
};

export default SupplierProfile;