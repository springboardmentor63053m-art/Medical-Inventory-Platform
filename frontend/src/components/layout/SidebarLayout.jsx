import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  Pill,
  Truck,
  Package,
  Clock,
  ShoppingCart,
  FileText,
  Bell,
  User,
  Users,
  X,
  Activity,
  ShieldCheck,
  Store
} from 'lucide-react';

export default function SidebarLayout({ isOpen, onClose }) {
  const { isAdmin, isPharmacist, isStaff, isUser, isSupplier, getDashboardPath } = useAuth();

  const userDashboardPath = getDashboardPath();

  const primaryNavItems = [
    { name: 'Dashboard', path: userDashboardPath, icon: LayoutDashboard },
    { name: 'Medicines', path: '/medicines', icon: Pill },
    { name: 'Categories', path: '/categories', icon: Boxes },
  ];

  if (isStaff) {
    primaryNavItems.push({ name: 'Inventory', path: '/inventory', icon: Package });
  }

  if (isUser) {
    primaryNavItems.push({ name: 'Prescription Orders', path: '/prescription-orders', icon: FileText, badge: 'Rx Order' });
  }

  if (isAdmin || isPharmacist) {
    primaryNavItems.push(
      { name: 'Inventory', path: '/inventory', icon: Package },
      { name: 'Expiring Soon', path: '/expiring', icon: Clock, badge: '< 90d' },
      { name: 'Suppliers', path: '/suppliers', icon: Truck },
      { name: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart },
      { name: 'Rx Verification Queue', path: '/pharmacist/verify', icon: ShieldCheck, badge: isAdmin ? 'Admin' : 'Pharmacist' },
      { name: 'In-Store POS Counter', path: '/store-counter', icon: Store, badge: 'POS' },
      { name: 'Reports', path: '/reports', icon: FileText }
    );
  }

  if (isSupplier) {
    primaryNavItems.push(
      { name: 'My Supplier Profile', path: '/suppliers', icon: Truck },
      { name: 'Orders From MediStock', path: '/purchase-orders', icon: ShoppingCart, badge: 'MediStock Orders' }
    );
  }

  if (isAdmin || isPharmacist || isStaff || isSupplier) {
    primaryNavItems.push({ name: 'Notifications', path: '/notifications', icon: Bell });
  }

  if (isAdmin) {
    primaryNavItems.push({ name: 'User Management', path: '/users', icon: Users, badge: 'Admin' });
  }

  primaryNavItems.push({ name: 'Profile', path: '/profile', icon: User });

  return (
    <>
      {/* Backdrop for mobile screen */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo & Name */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-wide leading-tight">
                Medi<span className="text-blue-400">Stock</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Medical Inventory System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Core Operations
          </div>
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex-shrink-0">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              ✓
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">MediStock Enterprise</p>
              <p className="text-[10px] text-slate-400">v1.0 Healthcare Portal</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
