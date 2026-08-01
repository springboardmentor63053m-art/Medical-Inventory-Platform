import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '48px 36px',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <HelpCircle size={34} />
        </div>

        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '12px' }}>
          404 - Page Not Found
        </h1>

        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '28px', fontSize: '0.95rem' }}>
          The page or route you are looking for does not exist in MediStock.
        </p>

        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          <Home size={18} />
          Return to Portal
        </button>
      </div>
    </div>
  );
};
