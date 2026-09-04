import { useMemo, useState } from "react";
import {
  Check,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";

type RoleRecord = {
  id: number;
  name: string;
  description: string;
  users: number;
  status: "ACTIVE" | "INACTIVE";
};

const initialRoles: RoleRecord[] = [
  {
    id: 1,
    name: "ROLE_ADMIN",
    description: "Full system administration access",
    users: 1,
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "ROLE_STAFF",
    description: "Inventory and stock management access",
    users: 1,
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "ROLE_USER",
    description: "Standard system user access",
    users: 1,
    status: "ACTIVE",
  },
  {
    id: 4,
    name: "ROLE_PHARMACIST",
    description: "Medicine and pharmacy management access",
    users: 1,
    status: "ACTIVE",
  },
  {
    id: 5,
    name: "ROLE_SUPPLIER",
    description: "Supplier and purchase management access",
    users: 1,
    status: "ACTIVE",
  },
];

const roleDescriptions: Record<string, string> = {
  ROLE_ADMIN: "Full system administration access",
  ROLE_STAFF: "Inventory and stock management access",
  ROLE_USER: "Standard system user access",
  ROLE_PHARMACIST: "Medicine and pharmacy management access",
  ROLE_SUPPLIER: "Supplier and purchase management access",
};

export default function Roles() {
  const [roles, setRoles] = useState<RoleRecord[]>(initialRoles);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingRole, setEditingRole] =
    useState<RoleRecord | null>(null);

  const [roleName, setRoleName] = useState("");

  const [description, setDescription] = useState("");

  const filteredRoles = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return roles;
    }

    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(keyword) ||
        role.description.toLowerCase().includes(keyword)
    );
  }, [roles, search]);

  const totalRoles = roles.length;

  const activeRoles = roles.filter(
    (role) => role.status === "ACTIVE"
  ).length;

  const totalUsers = roles.reduce(
    (total, role) => total + role.users,
    0
  );

  const adminRoles = roles.filter(
    (role) => role.name === "ROLE_ADMIN"
  ).length;

  const openNewRole = () => {
    setEditingRole(null);
    setRoleName("");
    setDescription("");
    setShowModal(true);
  };

  const openEditRole = (role: RoleRecord) => {
    setEditingRole(role);
    setRoleName(role.name);
    setDescription(role.description);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRole(null);
    setRoleName("");
    setDescription("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedName = roleName.trim().toUpperCase();

    if (!cleanedName) {
      alert("Please enter a role name.");
      return;
    }

    if (!cleanedName.startsWith("ROLE_")) {
      alert("Role name must start with ROLE_.");
      return;
    }

    if (editingRole) {
      setRoles((previous) =>
        previous.map((role) =>
          role.id === editingRole.id
            ? {
                ...role,
                name: cleanedName,
                description:
                  description.trim() ||
                  "System access role",
              }
            : role
        )
      );
    } else {
      const exists = roles.some(
        (role) => role.name === cleanedName
      );

      if (exists) {
        alert("This role already exists.");
        return;
      }

      const newRole: RoleRecord = {
        id: Date.now(),
        name: cleanedName,
        description:
          description.trim() || "System access role",
        users: 0,
        status: "ACTIVE",
      };

      setRoles((previous) => [...previous, newRole]);
    }

    closeModal();
  };

  const handleDelete = (role: RoleRecord) => {
    if (role.users > 0) {
      alert(
        `${role.name} is assigned to ${role.users} user(s) and cannot be deleted.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${role.name}?`
    );

    if (!confirmed) {
      return;
    }

    setRoles((previous) =>
      previous.filter((item) => item.id !== role.id)
    );
  };

  const handleRefresh = () => {
    setSearch("");
  };

  const getRoleClass = (name: string) => {
    if (name === "ROLE_ADMIN") return "admin";
    if (name === "ROLE_STAFF") return "staff";
    if (name === "ROLE_PHARMACIST") return "pharmacist";
    if (name === "ROLE_SUPPLIER") return "supplier";
    return "user";
  };

  const getRoleLabel = (name: string) => {
    switch (name) {
      case "ROLE_ADMIN":
        return "Administrator";

      case "ROLE_STAFF":
        return "Staff";

      case "ROLE_USER":
        return "User";

      case "ROLE_PHARMACIST":
        return "Pharmacist";

      case "ROLE_SUPPLIER":
        return "Supplier";

      default:
        return name.replace("ROLE_", "");
    }
  };

  return (
    <>
      <style>{`
        .roles-page {
          width: 100%;
          min-height: calc(100vh - 104px);
          background: #f5f8fd;
          padding: 32px 36px 60px;
          box-sizing: border-box;
          color: #17233d;
        }

        .roles-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
          margin-bottom: 28px;
        }

        .role-stat-card {
          min-height: 125px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 18px;
          border: 1px solid #e1e9f5;
          border-radius: 21px;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(38, 74, 125, 0.06);
        }

        .role-stat-icon {
          width: 62px;
          height: 62px;
          min-width: 62px;
          border-radius: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .role-stat-icon.blue {
          background: #edf4ff;
          color: #2563eb;
        }

        .role-stat-icon.green {
          background: #e9faf2;
          color: #009b68;
        }

        .role-stat-icon.purple {
          background: #f1edff;
          color: #6947d9;
        }

        .role-stat-icon.orange {
          background: #fff4e8;
          color: #e87500;
        }

        .role-stat-label {
          color: #7186a3;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .role-stat-value {
          margin-top: 6px;
          color: #17233d;
          font-size: 31px;
          font-weight: 800;
          line-height: 1;
        }

        .role-stat-description {
          margin-top: 6px;
          color: #91a2b9;
          font-size: 12px;
        }

        .roles-toolbar {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px;
          margin-bottom: 25px;
          border: 1px solid #e1e9f5;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(38, 74, 125, 0.05);
        }

        .roles-search {
          position: relative;
          flex: 1;
        }

        .roles-search svg {
          position: absolute;
          left: 17px;
          top: 50%;
          transform: translateY(-50%);
          color: #7890ad;
        }

        .roles-search input {
          width: 100%;
          height: 54px;
          padding: 0 18px 0 50px;
          box-sizing: border-box;
          border: 1px solid #d9e4f2;
          border-radius: 13px;
          outline: none;
          color: #17233d;
          background: #ffffff;
          font-size: 15px;
        }

        .roles-search input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, .08);
        }

        .roles-refresh {
          height: 54px;
          padding: 0 21px;
          border: 1px solid #d9e4f2;
          border-radius: 13px;
          background: #ffffff;
          color: #344b69;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .roles-refresh:hover {
          background: #f5f8fd;
        }

        .roles-card {
          overflow: hidden;
          border: 1px solid #e1e9f5;
          border-radius: 22px;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(38, 74, 125, 0.05);
        }

        .roles-card-header {
          padding: 28px 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid #e7edf5;
        }

        .roles-card-header h2 {
          margin: 0;
          color: #17233d;
          font-size: 24px;
        }

        .roles-card-header p {
          margin: 7px 0 0;
          color: #7890ad;
          font-size: 14px;
        }

        .new-role-button {
          border: none;
          border-radius: 13px;
          background: #2563eb;
          color: #ffffff;
          padding: 15px 24px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 9px;
          box-shadow: 0 12px 25px rgba(37, 99, 235, .22);
        }

        .new-role-button:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .roles-table-scroll {
          overflow-x: auto;
        }

        .roles-table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
        }

        .roles-table th {
          padding: 18px 24px;
          background: #f8fafd;
          color: #7186a3;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .8px;
          text-align: left;
          text-transform: uppercase;
        }

        .roles-table td {
          padding: 20px 24px;
          border-top: 1px solid #edf1f6;
          color: #344b69;
          font-size: 14px;
          vertical-align: middle;
        }

        .roles-table tbody tr:hover {
          background: #fbfdff;
        }

        .role-name-cell {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .role-icon {
          width: 46px;
          height: 46px;
          min-width: 46px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .role-icon.admin {
          background: #edf4ff;
          color: #2563eb;
        }

        .role-icon.staff {
          background: #fff4e8;
          color: #e87500;
        }

        .role-icon.pharmacist {
          background: #f1edff;
          color: #6947d9;
        }

        .role-icon.supplier {
          background: #e9faf2;
          color: #009b68;
        }

        .role-icon.user {
          background: #eef2f7;
          color: #526b8b;
        }

        .role-title {
          color: #17233d;
          font-size: 15px;
          font-weight: 800;
        }

        .role-code {
          margin-top: 4px;
          color: #91a2b9;
          font-size: 12px;
        }

        .role-description {
          color: #526b8b;
          max-width: 360px;
        }

        .role-user-count {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 12px;
          border-radius: 999px;
          background: #edf4ff;
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
        }

        .role-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 12px;
          border-radius: 999px;
          background: #e9faf2;
          color: #008f61;
          font-size: 12px;
          font-weight: 800;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .role-actions {
          display: flex;
          gap: 8px;
        }

        .role-action-button {
          width: 42px;
          height: 42px;
          border: 1px solid #d9e4f2;
          border-radius: 10px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .role-action-button.edit {
          color: #2563eb;
        }

        .role-action-button.edit:hover {
          background: #edf4ff;
          border-color: #2563eb;
        }

        .role-action-button.delete {
          color: #ef4444;
        }

        .role-action-button.delete:hover {
          background: #fff1f1;
          border-color: #ef4444;
        }

        .empty-roles {
          padding: 70px 30px;
          text-align: center;
        }

        .empty-roles-icon {
          width: 65px;
          height: 65px;
          margin: 0 auto 18px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #edf4ff;
          color: #2563eb;
        }

        .empty-roles h3 {
          margin: 0;
          color: #344b69;
        }

        .empty-roles p {
          margin: 8px 0 0;
          color: #91a3bb;
        }

        /* MODAL */

        .roles-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(15, 31, 55, .55);
        }

        .roles-modal {
          width: min(560px, 100%);
          border-radius: 22px;
          background: #ffffff;
          box-shadow: 0 30px 80px rgba(15, 35, 65, .25);
          overflow: hidden;
        }

        .roles-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 26px 28px;
          border-bottom: 1px solid #e7edf5;
        }

        .roles-modal-header h2 {
          margin: 0;
          color: #17233d;
          font-size: 25px;
        }

        .roles-modal-header p {
          margin: 6px 0 0;
          color: #7890ad;
          font-size: 14px;
        }

        .roles-modal-close {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 10px;
          background: #f2f5f9;
          color: #61758f;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .roles-form {
          padding: 28px;
          display: grid;
          gap: 20px;
        }

        .roles-form-group {
          display: grid;
          gap: 8px;
        }

        .roles-form-group label {
          color: #344b69;
          font-size: 13px;
          font-weight: 800;
        }

        .roles-form-group input,
        .roles-form-group textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 13px 14px;
          border: 1px solid #d9e4f2;
          border-radius: 11px;
          outline: none;
          background: #ffffff;
          color: #17233d;
          font-size: 14px;
          font-family: inherit;
        }

        .roles-form-group input {
          height: 50px;
        }

        .roles-form-group textarea {
          min-height: 110px;
          resize: vertical;
        }

        .roles-form-group input:focus,
        .roles-form-group textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, .08);
        }

        .roles-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 28px 28px;
          border-top: 1px solid #edf1f6;
        }

        .roles-cancel {
          min-height: 48px;
          padding: 0 20px;
          border: 1px solid #d9e4f2;
          border-radius: 11px;
          background: #ffffff;
          color: #526b8b;
          font-weight: 700;
          cursor: pointer;
        }

        .roles-save {
          min-height: 48px;
          padding: 0 23px;
          border: none;
          border-radius: 11px;
          background: #2563eb;
          color: #ffffff;
          font-weight: 800;
          cursor: pointer;
        }

        .roles-save:hover {
          background: #1d4ed8;
        }

        @media (max-width: 1100px) {
          .roles-summary {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 760px) {
          .roles-page {
            padding: 24px 16px 40px;
          }

          .roles-summary {
            grid-template-columns: 1fr;
          }

          .roles-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .roles-refresh {
            width: 100%;
            justify-content: center;
          }

          .roles-card-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .new-role-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="roles-page">

        {/* SUMMARY CARDS */}

        <div className="roles-summary">

          <div className="role-stat-card">
            <div className="role-stat-icon blue">
              <ShieldCheck size={30} />
            </div>

            <div>
              <div className="role-stat-label">
                Total Roles
              </div>

              <div className="role-stat-value">
                {totalRoles}
              </div>

              <div className="role-stat-description">
                System roles
              </div>
            </div>
          </div>

          <div className="role-stat-card">
            <div className="role-stat-icon green">
              <Check size={30} />
            </div>

            <div>
              <div className="role-stat-label">
                Active Roles
              </div>

              <div className="role-stat-value">
                {activeRoles}
              </div>

              <div className="role-stat-description">
                Currently enabled
              </div>
            </div>
          </div>

          <div className="role-stat-card">
            <div className="role-stat-icon purple">
              <Users size={30} />
            </div>

            <div>
              <div className="role-stat-label">
                Assigned Users
              </div>

              <div className="role-stat-value">
                {totalUsers}
              </div>

              <div className="role-stat-description">
                Users across roles
              </div>
            </div>
          </div>

          <div className="role-stat-card">
            <div className="role-stat-icon orange">
              <ShieldCheck size={30} />
            </div>

            <div>
              <div className="role-stat-label">
                Admin Roles
              </div>

              <div className="role-stat-value">
                {adminRoles}
              </div>

              <div className="role-stat-description">
                System administrators
              </div>
            </div>
          </div>

        </div>

        {/* SEARCH */}

        <div className="roles-toolbar">

          <div className="roles-search">
            <Search size={23} />

            <input
              type="text"
              placeholder="Search roles..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <button
            type="button"
            className="roles-refresh"
            onClick={handleRefresh}
          >
            <RefreshCw size={18} />
            Refresh
          </button>

        </div>

        {/* ROLE TABLE */}

        <div className="roles-card">

          <div className="roles-card-header">

            <div>
              <h2>Role Management</h2>

              <p>
                Showing {filteredRoles.length} of{" "}
                {roles.length} system roles
              </p>
            </div>

            <button
              type="button"
              className="new-role-button"
              onClick={openNewRole}
            >
              <Plus size={21} />
              New Role
            </button>

          </div>

          <div className="roles-table-scroll">

            {filteredRoles.length === 0 ? (

              <div className="empty-roles">

                <div className="empty-roles-icon">
                  <ShieldCheck size={30} />
                </div>

                <h3>No roles found</h3>

                <p>
                  Try another search or create a new role.
                </p>

              </div>

            ) : (

              <table className="roles-table">

                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Description</th>
                    <th>Users</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredRoles.map((role) => {

                    const roleClass =
                      getRoleClass(role.name);

                    return (
                      <tr key={role.id}>

                        <td>

                          <div className="role-name-cell">

                            <div
                              className={`role-icon ${roleClass}`}
                            >
                              <ShieldCheck size={22} />
                            </div>

                            <div>

                              <div className="role-title">
                                {getRoleLabel(role.name)}
                              </div>

                              <div className="role-code">
                                {role.name}
                              </div>

                            </div>

                          </div>

                        </td>

                        <td>
                          <div className="role-description">
                            {role.description}
                          </div>
                        </td>

                        <td>

                          <span className="role-user-count">
                            <Users size={14} />
                            {role.users}{" "}
                            {role.users === 1
                              ? "User"
                              : "Users"}
                          </span>

                        </td>

                        <td>

                          <span className="role-status">
                            <span className="status-dot" />
                            Active
                          </span>

                        </td>

                        <td>

                          <div className="role-actions">

                            <button
                              type="button"
                              className="role-action-button edit"
                              title="Edit Role"
                              onClick={() =>
                                openEditRole(role)
                              }
                            >
                              <Edit3 size={18} />
                            </button>

                            <button
                              type="button"
                              className="role-action-button delete"
                              title="Delete Role"
                              onClick={() =>
                                handleDelete(role)
                              }
                            >
                              <Trash2 size={18} />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            )}

          </div>

        </div>

      </div>

      {/* NEW / EDIT ROLE MODAL */}

      {showModal && (

        <div
          className="roles-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >

          <div className="roles-modal">

            <div className="roles-modal-header">

              <div>

                <h2>
                  {editingRole
                    ? "Edit Role"
                    : "New Role"}
                </h2>

                <p>
                  {editingRole
                    ? "Update the system role details."
                    : "Create a new MediStock system role."}
                </p>

              </div>

              <button
                type="button"
                className="roles-modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>

            </div>

            <form
              className="roles-form"
              onSubmit={handleSubmit}
            >

              <div className="roles-form-group">

                <label htmlFor="roleName">
                  Role Name
                </label>

                <input
                  id="roleName"
                  type="text"
                  placeholder="ROLE_EXAMPLE"
                  value={roleName}
                  onChange={(e) =>
                    setRoleName(
                      e.target.value.toUpperCase()
                    )
                  }
                />

              </div>

              <div className="roles-form-group">

                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  placeholder="Describe what this role can access..."
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                />

              </div>

            </form>

            <div className="roles-form-actions">

              <button
                type="button"
                className="roles-cancel"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="roles-save"
                onClick={handleSubmit}
              >
                <Check
                  size={17}
                  style={{
                    verticalAlign: "middle",
                    marginRight: "6px",
                  }}
                />

                {editingRole
                  ? "Save Changes"
                  : "Create Role"}
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}