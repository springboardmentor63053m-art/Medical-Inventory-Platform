import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface User {
  id: number;
  username: string;
  email: string;
  role?: {
    name: string;
  };
  accountStatus?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  useEffect(() => {
    loadUsers();
  }, []);

  // =====================================================
  // LOAD USERS FROM BACKEND
  // =====================================================

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SEARCH + ROLE FILTER
  // =====================================================

  const filteredUsers = users.filter((user) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      user.username.toLowerCase().includes(searchValue) ||
      user.email.toLowerCase().includes(searchValue);

    const roleName = user.role?.name || "";

    const matchesRole =
      roleFilter === "ALL" || roleName === roleFilter;

    return matchesSearch && matchesRole;
  });

  // =====================================================
  // VIEW USER
  // =====================================================

  const handleViewUser = (user: User) => {
    alert(
      `User Details\n\n` +
        `Username: ${user.username}\n` +
        `Email: ${user.email}\n` +
        `Role: ${formatRole(user.role?.name)}\n` +
        `Status: ${user.accountStatus || "APPROVED"}`
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="user-management-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="user-management-header">

        <h1>User Management</h1>

        <p>
          Manage users, pharmacists and suppliers
        </p>

      </div>


      {/* =================================================
          FILTER BAR
      ================================================= */}

      <div className="user-management-filters">

        {/* SEARCH */}

        <div className="user-search-wrapper">

          <span className="user-search-icon">
            🔍
          </span>

          <input
            type="text"
            className="user-search-input"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        {/* ROLE FILTER */}

        <select
          className="user-role-filter"
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value)
          }
        >

          <option value="ALL">
            All Roles
          </option>

          <option value="ROLE_ADMIN">
            Administrators
          </option>

          <option value="ROLE_USER">
            Users
          </option>

          <option value="ROLE_PHARMACIST">
            Pharmacists
          </option>

          <option value="ROLE_SUPPLIER">
            Suppliers
          </option>

        </select>

      </div>


      {/* =================================================
          TABLE CARD
      ================================================= */}

      <div className="user-table-card">

        <div className="user-table-wrapper">

          {loading ? (

            /* LOADING */

            <div className="user-empty-state">

              <div className="user-empty-state-icon">
                ⏳
              </div>

              <p>
                Loading users...
              </p>

            </div>

          ) : (

            <table className="user-table">

              {/* =================================================
                  TABLE HEADER
              ================================================= */}

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    User
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              {/* =================================================
                  TABLE BODY
              ================================================= */}

              <tbody>

                {filteredUsers.length === 0 ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="user-empty-state"
                    >

                      <div className="user-empty-state-icon">
                        👤
                      </div>

                      <p>
                        No users found.
                      </p>

                    </td>

                  </tr>

                ) : (

                  filteredUsers.map((user) => (

                    <tr key={user.id}>

                      {/* ID */}

                      <td>

                        <span className="user-id">
                          #{user.id}
                        </span>

                      </td>


                      {/* USER */}

                      <td>

                        <div className="user-cell">

                          <div className="user-avatar">

                            {user.username
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div className="user-info">

                            <span className="user-name">
                              {user.username}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* EMAIL */}

                      <td>

                        <span className="user-email">
                          {user.email}
                        </span>

                      </td>


                      {/* ROLE */}

                      <td>

                        <span
                          className={`user-role-badge ${getRoleClass(
                            user.role?.name
                          )}`}
                        >

                          {formatRole(
                            user.role?.name
                          )}

                        </span>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span className="user-status">

                          <span className="user-status-dot"></span>

                          {user.accountStatus ||
                            "APPROVED"}

                        </span>

                      </td>


                      {/* ACTION */}

                      <td>

                        <button
                          type="button"
                          className="user-view-button"
                          onClick={() =>
                            handleViewUser(user)
                          }
                        >

                          👁 View

                        </button>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          )}

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        {!loading && (

          <div className="user-table-footer">

            <span>
              Showing{" "}
              <strong>
                {filteredUsers.length}
              </strong>{" "}
              of{" "}
              <strong>
                {users.length}
              </strong>{" "}
              users
            </span>

            {search && (
              <span>
                Search: "{search}"
              </span>
            )}

          </div>

        )}

      </div>

    </div>
  );
}


/* =========================================================
   FORMAT ROLE
========================================================= */

function formatRole(role?: string) {
  switch (role) {

    case "ROLE_ADMIN":
      return "Admin";

    case "ROLE_USER":
      return "User";

    case "ROLE_PHARMACIST":
      return "Pharmacist";

    case "ROLE_SUPPLIER":
      return "Supplier";

    default:
      return role || "Unknown";
  }
}


/* =========================================================
   ROLE CSS CLASS
========================================================= */

function getRoleClass(role?: string) {

  switch (role) {

    case "ROLE_ADMIN":
      return "user-role-admin";

    case "ROLE_USER":
      return "user-role-user";

    case "ROLE_PHARMACIST":
      return "user-role-pharmacist";

    case "ROLE_SUPPLIER":
      return "user-role-supplier";

    default:
      return "user-role-user";
  }
}