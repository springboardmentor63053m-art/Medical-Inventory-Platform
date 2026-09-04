import { useMemo, useState } from "react";
import {
  Check,
  Mail,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  Users as UsersIcon,
  X,
} from "lucide-react";

type UserRole =
  | "ADMIN"
  | "PHARMACIST"
  | "STAFF"
  | "SUPPLIER"
  | "USER";

type UserRecord = {
  id: number;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE";
};

const initialUsers: UserRecord[] = [
  {
    id: 1,
    username: "nithya-admin",
    email: "nithya@medistock.com",
    password: "••••••••",
    role: "ADMIN",
    status: "ACTIVE",
  },
  {
    id: 2,
    username: "swetha-staff",
    email: "swetha@medistock.com",
    password: "••••••••",
    role: "STAFF",
    status: "ACTIVE",
  },
  {
    id: 3,
    username: "arun-user",
    email: "arun@medistock.com",
    password: "••••••••",
    role: "USER",
    status: "ACTIVE",
  },
  {
    id: 4,
    username: "priya-pharmacist",
    email: "priya@medistock.com",
    password: "••••••••",
    role: "PHARMACIST",
    status: "ACTIVE",
  },
  {
    id: 5,
    username: "rahul-supplier",
    email: "rahul@medistock.com",
    password: "••••••••",
    role: "SUPPLIER",
    status: "ACTIVE",
  },
];

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrator",
  PHARMACIST: "Pharmacist",
  STAFF: "Staff",
  SUPPLIER: "Supplier",
  USER: "User",
};

export default function Users() {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState<
    "ALL" | UserRole
  >("ALL");

  const [showModal, setShowModal] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("STAFF");

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return users.filter((user) => {
      const matchesSearch =
        !keyword ||
        user.username.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        roleLabels[user.role].toLowerCase().includes(keyword);

      const matchesRole =
        roleFilter === "ALL" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalUsers = users.length;

  const adminCount = users.filter(
    (user) => user.role === "ADMIN"
  ).length;

  const pharmacistCount = users.filter(
    (user) => user.role === "PHARMACIST"
  ).length;

  const staffCount = users.filter(
    (user) => user.role === "STAFF"
  ).length;

  const activeCount = users.filter(
    (user) => user.status === "ACTIVE"
  ).length;

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("STAFF");
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleNewUser = () => {
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      alert("Please enter username.");
      return;
    }

    if (!email.trim()) {
      alert("Please enter email.");
      return;
    }

    if (!password.trim()) {
      alert("Please enter password.");
      return;
    }

    const newUser: UserRecord = {
      id: Date.now(),
      username: username.trim(),
      email: email.trim(),
      password: "••••••••",
      role,
      status: "ACTIVE",
    };

    setUsers((previous) => [newUser, ...previous]);

    closeModal();
  };

  const handleRefresh = () => {
    setSearch("");
    setRoleFilter("ALL");
  };

  const getRoleClass = (userRole: UserRole) => {
    switch (userRole) {
      case "ADMIN":
        return "admin";

      case "PHARMACIST":
        return "pharmacist";

      case "STAFF":
        return "staff";

      case "SUPPLIER":
        return "supplier";

      case "USER":
        return "user";

      default:
        return "user";
    }
  };

  return (
    <>
      <style>{`
        .users-page {
          width: 100%;
          min-height: calc(100vh - 104px);
          background: #f5f8fd;
          padding: 32px 36px 60px;
          box-sizing: border-box;
          color: #17233d;
        }

        .users-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
          margin-bottom: 28px;
        }

        .user-stat-card {
          display: flex;
          align-items: center;
          gap: 18px;
          min-height: 125px;
          padding: 24px;
          box-sizing: border-box;
          border: 1px solid #e1e9f5;
          border-radius: 21px;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(38, 74, 125, 0.06);
        }

        .user-stat-icon {
          width: 62px;
          height: 62px;
          min-width: 62px;
          border-radius: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-stat-icon.blue {
          background: #edf4ff;
          color: #2563eb;
        }

        .user-stat-icon.green {
          background: #e9faf2;
          color: #009b68;
        }

        .user-stat-icon.purple {
          background: #f1edff;
          color: #6947d9;
        }

        .user-stat-icon.orange {
          background: #fff4e8;
          color: #e87500;
        }

        .user-stat-label {
          color: #7186a3;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .user-stat-value {
          margin-top: 6px;
          color: #17233d;
          font-size: 31px;
          line-height: 1;
          font-weight: 800;
        }

        .user-stat-description {
          margin-top: 6px;
          color: #91a2b9;
          font-size: 12px;
        }

        .users-toolbar {
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

        .users-search {
          position: relative;
          flex: 1;
        }

        .users-search svg {
          position: absolute;
          left: 17px;
          top: 50%;
          transform: translateY(-50%);
          color: #7890ad;
        }

        .users-search input {
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

        .users-search input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
        }

        .users-filter {
          width: 190px;
          height: 54px;
          padding: 0 15px;
          border: 1px solid #d9e4f2;
          border-radius: 13px;
          outline: none;
          background: #ffffff;
          color: #344b69;
          font-size: 15px;
        }

        .users-refresh {
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

        .users-refresh:hover {
          background: #f5f8fd;
        }

        .users-table-card {
          overflow: hidden;
          border: 1px solid #e1e9f5;
          border-radius: 22px;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(38, 74, 125, 0.05);
        }

        .users-table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 28px 30px;
          border-bottom: 1px solid #e7edf5;
        }

        .users-table-header h2 {
          margin: 0;
          color: #17233d;
          font-size: 24px;
        }

        .users-table-header p {
          margin: 7px 0 0;
          color: #7890ad;
          font-size: 14px;
        }

        .new-user-button {
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
          box-shadow: 0 12px 25px rgba(37, 99, 235, 0.22);
        }

        .new-user-button:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .users-table-scroll {
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
        }

        .users-table th {
          padding: 18px 24px;
          background: #f8fafd;
          color: #7186a3;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .8px;
          text-align: left;
          text-transform: uppercase;
        }

        .users-table td {
          padding: 20px 24px;
          border-top: 1px solid #edf1f6;
          color: #344b69;
          font-size: 14px;
          vertical-align: middle;
        }

        .users-table tbody tr:hover {
          background: #fbfdff;
        }

        .username-cell {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .user-avatar {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 13px;
          background: #edf4ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 800;
        }

        .username-name {
          color: #17233d;
          font-size: 15px;
          font-weight: 800;
        }

        .username-id {
          margin-top: 3px;
          color: #91a2b9;
          font-size: 12px;
        }

        .email-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #526b8b;
        }

        .role-badge,
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .role-badge.admin {
          background: #edf4ff;
          color: #2563eb;
        }

        .role-badge.pharmacist {
          background: #f1edff;
          color: #6947d9;
        }

        .role-badge.staff {
          background: #fff4e8;
          color: #d87800;
        }

        .role-badge.supplier {
          background: #e9faf2;
          color: #008f61;
        }

        .role-badge.user {
          background: #eef2f7;
          color: #526b8b;
        }

        .status-badge {
          background: #e9faf2;
          color: #008f61;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .empty-users {
          padding: 70px 30px;
          text-align: center;
        }

        .empty-users-icon {
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

        .empty-users h3 {
          margin: 0;
          color: #344b69;
        }

        .empty-users p {
          margin: 8px 0 0;
          color: #91a3bb;
        }

        .users-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(15, 31, 55, .55);
        }

        .users-modal {
          width: min(560px, 100%);
          max-height: calc(100vh - 48px);
          overflow-y: auto;
          border-radius: 22px;
          background: #ffffff;
          box-shadow: 0 30px 80px rgba(15, 35, 65, .25);
        }

        .users-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 26px 28px;
          border-bottom: 1px solid #e7edf5;
        }

        .users-modal-header h2 {
          margin: 0;
          color: #17233d;
          font-size: 25px;
        }

        .users-modal-header p {
          margin: 6px 0 0;
          color: #7890ad;
          font-size: 14px;
        }

        .users-modal-close {
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

        .users-form {
          padding: 28px;
          display: grid;
          gap: 19px;
        }

        .users-form-group {
          display: grid;
          gap: 8px;
        }

        .users-form-group label {
          color: #344b69;
          font-size: 13px;
          font-weight: 800;
        }

        .users-form-group input,
        .users-form-group select {
          width: 100%;
          height: 50px;
          box-sizing: border-box;
          padding: 0 14px;
          border: 1px solid #d9e4f2;
          border-radius: 11px;
          outline: none;
          background: #ffffff;
          color: #17233d;
          font-size: 14px;
        }

        .users-form-group input:focus,
        .users-form-group select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, .08);
        }

        .users-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 28px 28px;
          border-top: 1px solid #edf1f6;
        }

        .users-cancel {
          min-height: 48px;
          padding: 0 20px;
          border: 1px solid #d9e4f2;
          border-radius: 11px;
          background: #ffffff;
          color: #526b8b;
          font-weight: 700;
          cursor: pointer;
        }

        .users-save {
          min-height: 48px;
          padding: 0 23px;
          border: none;
          border-radius: 11px;
          background: #2563eb;
          color: #ffffff;
          font-weight: 800;
          cursor: pointer;
        }

        .users-save:hover {
          background: #1d4ed8;
        }

        @media (max-width: 1100px) {
          .users-summary {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 760px) {
          .users-page {
            padding: 24px 16px 40px;
          }

          .users-summary {
            grid-template-columns: 1fr;
          }

          .users-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .users-filter,
          .users-refresh {
            width: 100%;
          }

          .users-table-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .new-user-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="users-page">

        {/* SUMMARY */}
        <div className="users-summary">

          <div className="user-stat-card">
            <div className="user-stat-icon blue">
              <UsersIcon size={30} />
            </div>

            <div>
              <div className="user-stat-label">
                Total Users
              </div>

              <div className="user-stat-value">
                {totalUsers}
              </div>

              <div className="user-stat-description">
                Registered users
              </div>
            </div>
          </div>

          <div className="user-stat-card">
            <div className="user-stat-icon green">
              <Check size={30} />
            </div>

            <div>
              <div className="user-stat-label">
                Active Users
              </div>

              <div className="user-stat-value">
                {activeCount}
              </div>

              <div className="user-stat-description">
                Currently active
              </div>
            </div>
          </div>

          <div className="user-stat-card">
            <div className="user-stat-icon purple">
              <ShieldCheck size={30} />
            </div>

            <div>
              <div className="user-stat-label">
                Administrators
              </div>

              <div className="user-stat-value">
                {adminCount}
              </div>

              <div className="user-stat-description">
                System administrators
              </div>
            </div>
          </div>

          <div className="user-stat-card">
            <div className="user-stat-icon orange">
              <User size={30} />
            </div>

            <div>
              <div className="user-stat-label">
                Staff
              </div>

              <div className="user-stat-value">
                {staffCount + pharmacistCount}
              </div>

              <div className="user-stat-description">
                Pharmacists & staff
              </div>
            </div>
          </div>

        </div>

        {/* SEARCH */}
        <div className="users-toolbar">

          <div className="users-search">
            <Search size={23} />

            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="users-filter"
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(
                e.target.value as "ALL" | UserRole
              )
            }
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Administrator</option>
            <option value="STAFF">Staff</option>
            <option value="PHARMACIST">Pharmacist</option>
            <option value="USER">User</option>
            <option value="SUPPLIER">Supplier</option>
          </select>

          <button
            type="button"
            className="users-refresh"
            onClick={handleRefresh}
          >
            <RefreshCw size={18} />
            Refresh
          </button>

        </div>

        {/* USERS TABLE */}
        <div className="users-table-card">

          <div className="users-table-header">

            <div>
              <h2>User Management</h2>

              <p>
                Showing {filteredUsers.length} of{" "}
                {users.length} users
              </p>
            </div>

            <button
              type="button"
              className="new-user-button"
              onClick={handleNewUser}
            >
              <Plus size={21} />
              New User
            </button>

          </div>

          <div className="users-table-scroll">

            {filteredUsers.length === 0 ? (

              <div className="empty-users">

                <div className="empty-users-icon">
                  <UsersIcon size={30} />
                </div>

                <h3>No users found</h3>

                <p>
                  Add a new user using the button above.
                </p>

              </div>

            ) : (

              <table className="users-table">

                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Password</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredUsers.map((user) => (

                    <tr key={user.id}>

                      <td>
                        <div className="username-cell">

                          <div className="user-avatar">
                            {user.username
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <div className="username-name">
                              {user.username}
                            </div>

                            <div className="username-id">
                              User #{user.id}
                            </div>
                          </div>

                        </div>
                      </td>

                      <td>
                        <div className="email-cell">
                          <Mail size={16} />
                          {user.email}
                        </div>
                      </td>

                      <td>
                        {user.password}
                      </td>

                      <td>

                        <span
                          className={`role-badge ${getRoleClass(
                            user.role
                          )}`}
                        >
                          {roleLabels[user.role]}
                        </span>

                      </td>

                      <td>

                        <span className="status-badge">
                          <span className="status-dot" />
                          Active
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

        </div>

      </div>

      {/* NEW USER MODAL */}
      {showModal && (

        <div
          className="users-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >

          <div className="users-modal">

            <div className="users-modal-header">

              <div>
                <h2>New User</h2>

                <p>
                  Create a new MediStock system user.
                </p>
              </div>

              <button
                type="button"
                className="users-modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>

            </div>

            <form
              className="users-form"
              onSubmit={handleSubmit}
            >

              <div className="users-form-group">

                <label htmlFor="username">
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                />

              </div>

              <div className="users-form-group">

                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="user@medistock.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />

              </div>

              <div className="users-form-group">

                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

              </div>

              <div className="users-form-group">

                <label htmlFor="role">
                  Role
                </label>

                <select
                  id="role"
                  value={role}
                  onChange={(e) =>
                    setRole(
                      e.target.value as UserRole
                    )
                  }
                >

                  <option value="STAFF">
                    Staff
                  </option>

                  <option value="PHARMACIST">
                    Pharmacist
                  </option>

                  <option value="ADMIN">
                    Administrator
                  </option>

                  <option value="USER">
                    User
                  </option>

                  <option value="SUPPLIER">
                    Supplier
                  </option>

                </select>

              </div>

            </form>

            <div className="users-form-actions">

              <button
                type="button"
                className="users-cancel"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="users-save"
                onClick={handleSubmit}
              >
                <Check
                  size={17}
                  style={{
                    verticalAlign: "middle",
                    marginRight: "6px",
                  }}
                />
                Create User
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}