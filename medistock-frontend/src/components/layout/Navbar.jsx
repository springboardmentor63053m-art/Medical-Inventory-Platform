import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Menu, LogOut, Shield, Pill, User as UserIcon } from 'lucide-react';

export const Navbar = ({ toggleSidebar, isCollapsed }) => {
  const { user, logout } = useAuth();

  const getPrimaryRole = () => {
    if (!user || !user.roles) return 'User';
    if (user.roles.includes('ROLE_ADMIN')) return 'ADMIN';
    if (user.roles.includes('ROLE_PHARMACIST')) return 'PHARMACIST';
    return user.roles[0]?.replace('ROLE_', '') || 'User';
  };

  const roleText = getPrimaryRole();
  const isAdmin = roleText === 'ADMIN';

  return (
    <header style={{
      height: 'var(--navbar-height)',
      backgroundColor: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          style={{
            color: 'var(--color-text-secondary)',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition-fast)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)'
          }}
        >
          <Menu size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Pill size={22} />
          </div>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            MediStock
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: isAdmin ? 'var(--color-primary-light)' : 'var(--color-accent-light)',
            color: isAdmin ? 'var(--color-primary)' : 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UserIcon size={18} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {user?.username || 'Guest'}
            </span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: isAdmin ? 'var(--color-primary)' : 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Shield size={10} />
              {roleText}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          title="Logout"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-danger-light)',
            color: 'var(--color-danger)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'var(--transition-fast)'
          }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
