import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Pill,
  Layers,
  Truck,
  Boxes,
  ShoppingCart,
  Users,
  Lock,
  Bell
} from 'lucide-react';

export const Sidebar = ({ isCollapsed }) => {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('ROLE_ADMIN');
  const isPharmacist = hasRole('ROLE_PHARMACIST');

  const adminNav = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Medicines', path: '/admin/medicines', icon: Pill },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Suppliers', path: '/admin/suppliers', icon: Truck },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Purchase Orders', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Users', path: '/admin/users', icon: Users },
  ];

  const pharmacistNav = [
    { label: 'Pharmacist Dashboard', path: '/pharmacist/dashboard', icon: LayoutDashboard },
    { label: 'Medicines Catalogue', path: '/pharmacist/medicines', icon: Pill },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Orders', path: '/pharmacist/orders', icon: ShoppingCart },
  ];

  const navItems = isAdmin ? adminNav : isPharmacist ? pharmacistNav : [];

  return (
    <aside style={{
      width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
      backgroundColor: 'var(--color-bg-secondary)',
      borderRight: '1px solid var(--color-border)',
      height: 'calc(100vh - var(--navbar-height))',
      position: 'sticky',
      top: 'var(--navbar-height)',
      transition: 'width var(--transition-normal)',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      zIndex: 30,
    }}>
      <div style={{ padding: isCollapsed ? '16px 12px' : '20px 16px', flex: 1 }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--color-text-muted)',
          marginBottom: '12px',
          paddingLeft: isCollapsed ? '0' : '12px',
          textAlign: isCollapsed ? 'center' : 'left'
        }}>
          {isCollapsed ? '•••' : 'Main Menu'}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: isCollapsed ? '12px' : '12px 16px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
                  backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                  transition: 'var(--transition-fast)',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? 'var(--shadow-glow)' : 'none'
                })}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={20} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {!isCollapsed && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--color-border)',
          margin: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Lock size={16} style={{ color: 'var(--color-accent)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            JWT Authenticated Session
          </span>
        </div>
      )}
    </aside>
  );
};
