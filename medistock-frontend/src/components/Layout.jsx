import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
      roles: ['ROLE_SUPPLIER']
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
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-item ${isActive ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '8px' }}
              >
                {item.icon}
                <span>{label}</span>
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
                cursor: 'pointer'
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
