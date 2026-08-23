import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import {
  LayoutDashboard,
  Pill,
  Tags,
  Truck,
  Warehouse,
  ClipboardList,
  Users as UsersIcon,
  LogOut,
  Activity,
  Receipt,
  History,
  User,
  MessageSquare,
  Clock,
  FileText,
  Bell,
  Sun,
  Moon,
  Calendar,
  RotateCw,
  BarChart3,
  Settings
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('medistock_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('medistock_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success && Array.isArray(res.data.data)) {
        const allAlerts = res.data.data;
        const readStorageKey = `medistock_read_notifications_${user.id || user.username}`;
        const readIds = JSON.parse(localStorage.getItem(readStorageKey) || '[]');
        const unread = allAlerts.filter(a => !readIds.includes(a.id)).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Error fetching unread notification count:', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000); // auto-refresh every 15s
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  const menuItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_DOCTOR', 'ROLE_USER', 'ROLE_STAFF', 'ROLE_SUPPLIER']
    },
    {
      path: '/messages',
      label: 'Messages',
      icon: <MessageSquare size={18} />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF', 'ROLE_SUPPLIER', 'ROLE_DOCTOR']
    },
    {
      path: '/medicines',
      label: 'Medicines',
      icon: <Pill size={18} />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_DOCTOR', 'ROLE_SUPPLIER', 'ROLE_USER', 'ROLE_STAFF']
    },
    {
      path: '/expiry',
      label: 'Expiry',
      icon: <Clock size={18} />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF']
    },
    {
      path: '/categories',
      label: 'Categories',
      icon: <Tags size={18} />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF', 'ROLE_SUPPLIER']
    },
    {
      path: '/suppliers',
      label: 'Suppliers',
      icon: <Truck size={18} />,
      roles: ['ROLE_ADMIN']
    },
    {
      path: '/stock-movements',
      label: 'Inventory',
      icon: <Warehouse size={18} />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF']
    },
    {
      path: '/purchase-orders',
      label: 'Purchase Orders',
      icon: <ClipboardList size={18} />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_SUPPLIER', 'ROLE_STAFF']
    },
    {
      path: '/billing',
      label: 'Billing / POS',
      icon: <Receipt size={18} />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF']
    },
    {
      path: '/sales',
      label: 'Sales History',
      icon: <History size={18} />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF']
    },
    {
      path: '/users',
      label: 'Users & Roles',
      icon: <UsersIcon size={18} />,
      roles: ['ROLE_ADMIN']
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: <FileText size={18} />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF']
    },
    {
      path: '/notifications',
      label: 'Notifications',
      icon: <Bell size={18} />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF', 'ROLE_SUPPLIER']
    }
  ];

  // Filter items matching user's roles
  const filteredMenuItems = menuItems.filter(item =>
    item.roles.some(role => user?.roles?.includes(role))
  );

  const getPageTitle = () => {
    const isSupplier = user?.roles?.includes('ROLE_SUPPLIER');
    const currentItem = menuItems.find(item => item.path === location.pathname);
    if (currentItem) {
      if (isSupplier && currentItem.path === '/purchase-orders') {
        return 'Orders From MediStock';
      }
      return currentItem.label === 'Dashboard' ? 'Admin Dashboard' : currentItem.label;
    }
    return 'MediStock Inventory';
  };

  const getUserRoleLabel = () => {
    if (!user?.roles || user.roles.length === 0) return 'User';
    return user.roles.map(role => {
      const upperRole = role.toUpperCase();
      switch (upperRole) {
        case 'ROLE_ADMIN': return 'Admin';
        case 'ROLE_PHARMACIST': return 'Pharmacist';
        case 'ROLE_STAFF': return 'Staff';
        case 'ROLE_SUPPLIER': return 'Supplier';
        case 'ROLE_DOCTOR': return 'Doctor';
        case 'ROLE_USER': return 'User';
        default:
          const clean = role.replace(/^ROLE_/i, '');
          return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
      }
    }).join(', ');
  };

  return (
    <div className="app-wrapper">
      {/* Sidebar Layout */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Activity size={24} style={{ color: 'var(--primary)' }} />
          <span className="logo-text">MEDISTOCK</span>
        </div>

        <nav className="sidebar-menu">
          {filteredMenuItems.map((item) => {
            const isSupplier = user?.roles?.includes('ROLE_SUPPLIER');
            const isActive = location.pathname === item.path || (isSupplier && item.path === '/' && location.pathname === '/supplier/dashboard');
            const label = isSupplier && item.path === '/purchase-orders' ? 'Orders From MediStock' : item.label;
            const isNotificationItem = item.path === '/notifications';

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-item ${isActive ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px', position: 'relative' }}
              >
                {item.icon}
                <span style={{ fontWeight: isActive ? 600 : 500 }}>{label}</span>

                {isNotificationItem && unreadCount > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    lineHeight: 1
                  }}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-badge" style={{ marginBottom: '10px' }}>
            <div className="avatar" style={{ background: 'var(--primary)', color: '#ffffff', fontWeight: 700 }}>
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="user-details">
              <div className="user-name" style={{ color: 'var(--text-main)' }}>{user?.username || 'User'}</div>
              <div className="user-role" style={{ color: 'var(--text-secondary)' }}>{getUserRoleLabel()}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{ width: '100%', gap: '8px' }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content min-w-0">
        <header className="top-header">
          <div className="header-title">
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{getPageTitle()}</h1>
            {location.pathname === '/' && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>
                Welcome back, {user?.username || 'User'}! Here's what's happening with your inventory today.
              </p>
            )}
          </div>

          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Sync / Refresh Button */}
            <button
              onClick={() => window.location.reload()}
              title="Refresh Telemetry"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                padding: 0
              }}
            >
              <RotateCw size={15} />
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle Light Mode"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                padding: 0
              }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Notification Bell */}
            <Link 
              to="/notifications" 
              title="Notifications"
              style={{ 
                color: 'var(--text-main)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Avatar Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-subtle)',
              padding: '4px 10px',
              borderRadius: '20px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'AD'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.1 }}>{user?.username || 'User'}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', lineHeight: 1.1 }}>{getUserRoleLabel()}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
