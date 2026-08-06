import { NavLink } from "react-router-dom";
import { LayoutDashboard, Pill, Truck, LogOut, Cross, ShoppingCart, FileDown, Activity, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const dashboardPathForRole = (role) => {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "PHARMACIST") return "/pharmacist/dashboard";
  return "/staff/dashboard";
};

function linksForRole(role) {
  const base = [
    { to: dashboardPathForRole(role), label: "Dashboard", icon: LayoutDashboard },
    { to: "/medicines", label: "Medicines", icon: Pill },
    { to: "/purchases", label: "Purchases", icon: ShoppingCart },
    { to: "/suppliers", label: "Suppliers", icon: Truck },
    { to: "/reports", label: "Reports", icon: FileDown },
  ];
  if (role === "ADMIN") {
    base.push({ to: "/admin/activity", label: "User activity", icon: Users });
    base.push({ to: "/admin/stock-movements", label: "Stock movements", icon: Activity });
  }
  return base;
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const links = linksForRole(user?.role);

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-[var(--color-primary-dark)] text-white">
      <div className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center">
            <Cross size={18} />
          </div>
          <div>
            <p className="font-[var(--font-display)] font-semibold text-lg leading-none">MediStock</p>
            <p className="text-[11px] text-white/50 mt-0.5">Inventory Platform</p>
          </div>
        </div>
      </div>

      <div className="px-3 mb-3">
        <NotificationBell />
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-5 pt-3 border-t border-white/10">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium truncate">{user?.fullName}</p>
          <p className="text-[11px] text-white/50 font-mono uppercase tracking-wide">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
