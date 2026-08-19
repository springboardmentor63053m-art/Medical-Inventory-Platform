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
  Bell
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

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
      icon: <LayoutDashboard />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_DOCTOR', 'ROLE_USER', 'ROLE_STAFF']
    },
    {
      path: '/supplier/dashboard',
      label: 'Supplier Dashboard',
      icon: <LayoutDashboard />,
      roles: ['ROLE_SUPPLIER']
    },
    {
      path: '/supplier/profile',
      label: 'My Supplier Profile',
      icon: <User />,
      roles: ['ROLE_SUPPLIER']
    },
    {
      path: '/medicines',
      label: 'Medicines',
      icon: <Pill />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_DOCTOR', 'ROLE_SUPPLIER', 'ROLE_USER', 'ROLE_STAFF']
    },
    {
      path: '/billing',
      label: 'Billing / POS',
      icon: <Receipt />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF']
    },
    {
      path: '/sales',
      label: 'Sales History',
      icon: <History />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF']
    },
    {
      path: '/categories',
      label: 'Categories',
      icon: <Tags />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF', 'ROLE_SUPPLIER']
    },
    {
      path: '/suppliers',
      label: 'Suppliers',
      icon: <Truck />,
      roles: ['ROLE_ADMIN']
    },
    {
      path: '/stock-movements',
      label: 'Stock Movements',
      icon: <Activity />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF']
    },
    {
      path: '/purchase-orders',
      label: 'Purchase Orders',
      icon: <ClipboardList />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_SUPPLIER', 'ROLE_STAFF']
    },
    {
      path: '/notifications',
      label: 'Notifications',
      icon: <Bell />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF', 'ROLE_SUPPLIER']
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: <User />,
      roles: ['ROLE_SUPPLIER']
    },
    {
      path: '/users',
      label: 'Users Control',
      icon: <UsersIcon />,
      roles: ['ROLE_ADMIN']
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
      return currentItem.label;
    }
    return 'MediStock Inventory';
  };

  return (
    <div className="app-wrapper">
      {/* Sidebar Layout */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Activity size={24} />
          <span className="logo-text">MEDISTOCK</span>
        </div>

        <nav className="sidebar-menu">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isSupplier = user?.roles?.includes('ROLE_SUPPLIER');
            const label = isSupplier && item.path === '/purchase-orders' ? 'Orders From MediStock' : item.label;
            const isNotificationItem = item.path === '/notifications';

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-item ${isActive ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '8px', position: 'relative' }}
              >
                {item.icon}
                <span>{label}</span>

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

                {isSupplier && item.path === '/purchase-orders' && (
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '0.65rem',
                    background: 'rgba(147, 51, 234, 0.15)',
                    border: '1px solid rgba(147, 51, 234, 0.3)',
                    color: '#c084fc',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}>
                    MediStock Orders
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-badge" style={{ marginBottom: '10px' }}>
            <div className="avatar">
              {user?.username?.substring(0, 2).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.username}</div>
              <div className="user-role">{
                user?.roles ? user.roles.map(role => {
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
                }).join(', ') : ''
              }</div>
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
            <h1>{getPageTitle()}</h1>
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link 
              to="/notifications" 
              style={{ 
                color: 'var(--text-secondary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'all 0.2s',
                cursor: 'pointer',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = 'var(--primary)';
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              <Bell size={18} />
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
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Server: <strong style={{ color: 'var(--success)' }}>Online</strong>
            </span>
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
