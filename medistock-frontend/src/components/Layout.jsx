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
  Activity
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: <LayoutDashboard />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_DOCTOR', 'ROLE_SUPPLIER', 'ROLE_USER', 'ROLE_STAFF']
    },
    {
      path: '/medicines',
      label: 'Medicines',
      icon: <Pill />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_DOCTOR', 'ROLE_SUPPLIER', 'ROLE_USER', 'ROLE_STAFF']
    },
    {
      path: '/categories',
      label: 'Categories',
      icon: <Tags />,
      roles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF']
    },
    {
      path: '/suppliers',
      label: 'Suppliers',
      icon: <Truck />,
      roles: ['ROLE_ADMIN', 'ROLE_STAFF']
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
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.label : 'MediStock Inventory';
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
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
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
              <div className="user-role">{user?.roles?.join(', ')}</div>
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
      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            <h1>{getPageTitle()}</h1>
          </div>
          <div className="header-actions">
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
