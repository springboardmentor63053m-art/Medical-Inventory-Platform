import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Pill, Users, Building2, Package, ShoppingCart, LogOut, FileText, Bell, ClipboardList, ShieldCheck, History, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SIDEBAR_ITEMS = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Medicines", href: "/medicines", icon: Pill },
  { title: "Inventory", href: "/inventory", icon: Package },
  { title: "Suppliers", href: "/suppliers", icon: Building2 },
  { title: "Purchases", href: "/purchases", icon: ShoppingCart },
  { title: "Purchase items", href: "/purchase-items", icon: ClipboardList },
  { title: "Reports", href: "/reports", icon: FileText },
  { title: "Expiry tracking", href: "/expiries", icon: CalendarClock },
  { title: "Stock activity", href: "/stock-activity", icon: History },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Users", href: "/users", icon: Users },
  { title: "Roles", href: "/roles", icon: ShieldCheck },
];

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f6f8fc]">
      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 bg-slate-950 text-slate-300 flex flex-col transition-all duration-300">
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-3 text-white">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20"><Pill className="h-5 w-5" /></div>
            <span className="font-bold text-xl tracking-tight">MediStock</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = location.pathname === item.href || 
                             (item.href !== "/" && location.pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-cyan-400/15 text-cyan-300"
                    : "text-slate-400 hover:bg-white/7 hover:text-white"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-cyan-300" : "text-slate-500")} />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-9 w-9 rounded-full bg-cyan-400/15 flex items-center justify-center text-cyan-300 font-bold">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-white truncate">{user?.username}</span>
              <span className="text-xs text-slate-500 truncate">{user?.roles?.join(', ') || "User"}</span>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 flex-shrink-0 bg-white/80 backdrop-blur border-b border-slate-200/70 flex items-center justify-between px-8">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">MediStock workspace</p><h1 className="text-lg font-bold text-slate-900 capitalize">
            {location.pathname === "/" ? "Dashboard" : location.pathname.split("/")[1]}
          </h1></div>
          
          <div className="flex items-center gap-4">
            <Link to="/notifications" className="relative rounded-xl p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
