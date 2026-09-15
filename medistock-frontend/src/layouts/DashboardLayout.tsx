import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Pill,
  Package,
  Truck,
  ShoppingCart,
  ClipboardList,
  FileText,
  Activity,
  Clock3,
  Bell,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
} from "lucide-react";

type MenuItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

function getRole(): string {
  try {
    const role = localStorage.getItem("role");

    if (role) {
      return role
        .replace("ROLE_", "")
        .toUpperCase();
    }

    const userText =
      localStorage.getItem("user");

    if (userText) {
      const user = JSON.parse(userText);

      if (
        user?.roles &&
        Array.isArray(user.roles) &&
        user.roles.length > 0
      ) {
        return String(user.roles[0])
          .replace("ROLE_", "")
          .toUpperCase();
      }
    }

    const rolesText =
      localStorage.getItem("roles");

    if (rolesText) {
      const roles = JSON.parse(rolesText);

      if (
        Array.isArray(roles) &&
        roles.length > 0
      ) {
        return String(roles[0])
          .replace("ROLE_", "")
          .toUpperCase();
      }
    }
  } catch (error) {
    console.error(
      "Unable to read role:",
      error
    );
  }

  return "USER";
}

function getUsername(): string {
  try {
    const username =
      localStorage.getItem("username");

    if (username) {
      return username;
    }

    const userText =
      localStorage.getItem("user");

    if (userText) {
      const user = JSON.parse(userText);

      return (
        user?.username ||
        user?.name ||
        "User"
      );
    }
  } catch (error) {
    console.error(
      "Unable to read username:",
      error
    );
  }

  return "User";
}


/* =========================================================
   ADMIN MENU
========================================================= */

const adminMenu: MenuItem[] = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Medicines",
    path: "/admin/medicines",
    icon: <Pill size={20} />,
  },
  {
    label: "Inventory",
    path: "/admin/inventory",
    icon: <Package size={20} />,
  },
  {
    label: "Suppliers",
    path: "/admin/suppliers",
    icon: <Truck size={20} />,
  },
  {
    label: "Purchases",
    path: "/admin/purchases",
    icon: <ShoppingCart size={20} />,
  },
  {
    label: "Purchase Items",
    path: "/admin/purchase-items",
    icon: <ClipboardList size={20} />,
  },
  {
    label: "Reports",
    path: "/admin/reports",
    icon: <FileText size={20} />,
  },
  {
    label: "Stock Activity",
    path: "/admin/stock-activity",
    icon: <Activity size={20} />,
  },
  {
    label: "Expiry Tracking",
    path: "/admin/expiries",
    icon: <Clock3 size={20} />,
  },
  {
    label: "Notifications",
    path: "/admin/notifications",
    icon: <Bell size={20} />,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: <Users size={20} />,
  },
  {
    label: "Roles",
    path: "/admin/roles",
    icon: <ShieldCheck size={20} />,
  },
];


/* =========================================================
   USER MENU
========================================================= */

const userMenu: MenuItem[] = [
  {
    label: "Dashboard",
    path: "/user/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Medicines",
    path: "/user/medicines",
    icon: <Pill size={20} />,
  },
  {
    label: "My Purchases",
    path: "/user/purchases",
    icon: <ShoppingCart size={20} />,
  },
  {
    label: "Notifications",
    path: "/user/notifications",
    icon: <Bell size={20} />,
  },
];


/* =========================================================
   PHARMACIST MENU
========================================================= */

const pharmacistMenu: MenuItem[] = [
  {
    label: "Dashboard",
    path: "/pharmacist/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Medicines",
    path: "/pharmacist/medicines",
    icon: <Pill size={20} />,
  },
  {
    label: "Inventory",
    path: "/pharmacist/inventory",
    icon: <Package size={20} />,
  },
  {
    label: "Purchases",
    path: "/pharmacist/purchases",
    icon: <ShoppingCart size={20} />,
  },
  {
    label: "Purchase Items",
    path: "/pharmacist/purchase-items",
    icon: <ClipboardList size={20} />,
  },
  {
    label: "Expiry Tracking",
    path: "/pharmacist/expiries",
    icon: <Clock3 size={20} />,
  },
  {
    label: "Notifications",
    path: "/pharmacist/notifications",
    icon: <Bell size={20} />,
  },
];


/* =========================================================
   SUPPLIER MENU
========================================================= */

const supplierMenu: MenuItem[] = [
  {
    label: "Dashboard",
    path: "/supplier/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Suppliers",
    path: "/supplier/suppliers",
    icon: <Truck size={20} />,
  },
  {
    label: "Purchases",
    path: "/supplier/purchases",
    icon: <ShoppingCart size={20} />,
  },
  {
    label: "Purchase Items",
    path: "/supplier/purchase-items",
    icon: <ClipboardList size={20} />,
  },
  {
    label: "Notifications",
    path: "/supplier/notifications",
    icon: <Bell size={20} />,
  },
];


/* =========================================================
   DASHBOARD LAYOUT
========================================================= */

export function DashboardLayout() {

  const navigate = useNavigate();

  const location = useLocation();

  const role = getRole();

  const username = getUsername();

  const [unused] = [false];

  void unused;


  let menuItems: MenuItem[] = [];

  let roleName = "User";


  if (role === "ADMIN") {

    menuItems = adminMenu;

    roleName = "Administrator";

  } else if (role === "PHARMACIST") {

    menuItems = pharmacistMenu;

    roleName = "Pharmacist";

  } else if (role === "SUPPLIER") {

    menuItems = supplierMenu;

    roleName = "Supplier";

  } else {

    menuItems = userMenu;

    roleName = "User";

  }


  const handleLogout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem(
      "isAuthenticated"
    );

    localStorage.removeItem("username");

    localStorage.removeItem("roles");

    localStorage.removeItem("role");

    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });

  };



  return (

    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#f5f7fb",
        fontFamily:
          "Inter, Arial, sans-serif",
        color: "#172033",
      }}
    >

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          width: "260px",
          background: "#ffffff",
          borderRight:
            "1px solid #e5e7eb",
          boxShadow:
            "4px 0 20px rgba(15,23,42,0.05)",
          display: "flex",
          flexDirection: "column",
          zIndex: 1000,
        }}
      >

        {/* BRAND */}

        <div
          style={{
            height: "78px",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            borderBottom:
              "1px solid #eef0f4",
          }}
        >

          <div
            style={{
              width: "43px",
              height: "43px",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg,#2563eb,#1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
            }}
          >
            <Pill size={24} />
          </div>


          <div
            style={{
              marginLeft: "12px",
            }}
          >

            <div
              style={{
                fontSize: "21px",
                fontWeight: 800,
                color: "#172033",
              }}
            >
              Medi
              <span
                style={{
                  color: "#2563eb",
                }}
              >
                Stock
              </span>
            </div>

            <div
              style={{
                fontSize: "10px",
                color: "#8a94a6",
                marginTop: "2px",
              }}
            >
              MEDICAL INVENTORY
            </div>

          </div>

        </div>


        {/* ROLE BADGE */}

        <div
          style={{
            margin: "18px 15px 10px",
            padding:
              "9px 12px",
            borderRadius: "9px",
            background: "#eff6ff",
            border:
              "1px solid #dbeafe",
            color: "#1d4ed8",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >

          <ShieldCheck size={16} />

          {roleName}

        </div>


        {/* MENU */}

        <nav
          style={{
            flex: 1,
            overflowY: "auto",
            padding:
              "8px 12px",
          }}
        >

          <div
            style={{
              padding:
                "8px 10px",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "1px",
              color: "#9aa3b2",
            }}
          >
            MAIN MENU
          </div>


          {menuItems.map(
            (item) => {

              const active =
                location.pathname ===
                item.path;

              return (

                <NavLink
                  key={item.path}
                  to={item.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    minHeight:
                      "45px",
                    padding:
                      "10px 12px",
                    marginBottom:
                      "4px",
                    borderRadius:
                      "9px",
                    textDecoration:
                      "none",
                    color: active
                      ? "#2563eb"
                      : "#5d6879",
                    background:
                      active
                        ? "#eff6ff"
                        : "transparent",
                    fontSize:
                      "13px",
                    fontWeight: 600,
                    boxShadow:
                      active
                        ? "inset 3px 0 0 #2563eb"
                        : "none",
                  }}
                >

                  <span
                    style={{
                      minWidth:
                        "24px",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    {item.icon}
                  </span>

                  <span>
                    {item.label}
                  </span>

                </NavLink>

              );

            }
          )}

        </nav>


        {/* BOTTOM */}

        <div
          style={{
            padding: "12px",
            borderTop:
              "1px solid #eef0f4",
          }}
        >

          <button
            type="button"
            style={{
              width: "100%",
              minHeight: "45px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding:
                "10px 12px",
              border: "none",
              borderRadius: "9px",
              background:
                "transparent",
              color: "#667085",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "left",
            }}
          >

            <Settings size={20} />

            Settings

          </button>


          <button
            type="button"
            onClick={
              handleLogout
            }
            style={{
              width: "100%",
              minHeight: "45px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding:
                "10px 12px",
              border: "none",
              borderRadius: "9px",
              background:
                "#fff1f2",
              color: "#dc2626",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              textAlign: "left",
              marginTop: "4px",
            }}
          >

            <LogOut size={20} />

            Logout

          </button>

        </div>

      </aside>


      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <div
        style={{
          marginLeft: "260px",
          width:
            "calc(100% - 260px)",
          minHeight: "100vh",
        }}
      >




        {/* PAGE */}

        <main
          style={{
            padding: "30px",
            minHeight: "100vh",
            background:
              "#f5f7fb",
          }}
        >

          <Outlet />

        </main>

      </div>

    </div>
  );
}
