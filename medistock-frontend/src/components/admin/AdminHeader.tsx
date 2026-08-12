import { useAuth } from "@/context/AuthContext";

export default function AdminHeader() {

  const { user } = useAuth();

  return (
    <header className="admin-header">

      <div>

        <h1>
          Admin Dashboard
        </h1>

        <p>
          Manage and monitor your MediStock platform
        </p>

      </div>


      <div className="admin-header-right">

        {/* NOTIFICATION */}

        <button className="admin-notification-button">
          🔔

          <span className="notification-dot"></span>
        </button>


        {/* ADMIN PROFILE */}

        <div className="admin-profile">

          <div className="admin-avatar">
            {user?.username?.charAt(0).toUpperCase() || "A"}
          </div>

          <div className="admin-profile-info">

            <strong>
              {user?.username || "Administrator"}
            </strong>

            <small>
              Administrator
            </small>

          </div>

        </div>

      </div>

    </header>
  );
}