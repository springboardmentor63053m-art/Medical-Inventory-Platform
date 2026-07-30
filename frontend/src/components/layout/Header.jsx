import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { inventoryService } from '../../services/api/inventoryService';
import { 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  Moon, 
  Sun, 
  AlertTriangle,
  ChevronDown,
  Activity
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Header({ toggleSidebar, sidebarOpen }) {
  const { user, logout, isAdmin, isPharmacist } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const [lowStockRes, expiringRes] = await Promise.allSettled([
          inventoryService.getLowStockInventory(),
          inventoryService.getExpiringInventory(30)
        ]);

        let items = [];
        if (lowStockRes.status === 'fulfilled' && Array.isArray(lowStockRes.value)) {
          items.push(...lowStockRes.value.map(i => ({
            id: `ls-${i.id}`,
            type: 'low-stock',
            title: `Low Stock: ${i.medicine?.name || 'Medicine'}`,
            message: `Current Qty: ${i.quantity} (Min: ${i.minimumStock})`,
            time: 'Immediate action required',
          })));
        }
        if (expiringRes.status === 'fulfilled' && Array.isArray(expiringRes.value)) {
          items.push(...expiringRes.value.map(i => ({
            id: `exp-${i.id}`,
            type: 'expiring',
            title: `Expiring Soon: ${i.medicine?.name || 'Medicine'}`,
            message: `Batch ${i.batchNumber} expires on ${i.expiryDate}`,
            time: 'Review inventory',
          })));
        }
        setAlerts(items.slice(0, 5));
      } catch (err) {
        // Fallback silently if unauthenticated or network error
      }
    };

    fetchAlerts();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = isAdmin ? 'Admin' : isPharmacist ? 'Pharmacist' : 'Staff';
  const roleBadgeColor = isAdmin 
    ? 'bg-purple-100 text-purple-700 border-purple-200' 
    : isPharmacist 
    ? 'bg-blue-100 text-blue-700 border-blue-200'
    : 'bg-emerald-100 text-emerald-700 border-emerald-200';

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden transition"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200 inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Enterprise Portal • Live Systems
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setDropdownOpen(false);
            }}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-blue-600" /> Notifications
                </span>
                <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                  {alerts.length} New
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {alerts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No active stock alerts
                  </div>
                ) : (
                  alerts.map((item) => (
                    <div key={item.id} className="p-3 hover:bg-slate-50 transition text-xs">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">{item.title}</p>
                          <p className="text-slate-600 mt-0.5">{item.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{item.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-slate-100 text-center bg-slate-50">
                <Link
                  to="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.firstName} {user?.lastName}
              </span>
              <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border inline-block mt-0.5 ${roleBadgeColor}`}>
                {roleLabel}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-bold text-slate-800">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-medium transition"
              >
                <User className="w-4 h-4 text-slate-500" />
                My Profile
              </Link>
              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 font-medium transition text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
