import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ fullScreen = true, message = 'Loading MediStock...' }) => {
  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      color: 'var(--color-text-secondary)'
    }}>
      <Loader2 className="spin" size={42} style={{ color: 'var(--color-primary)' }} />
      <span style={{ fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.02em' }}>{message}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        {content}
      </div>
    );
  }

  return content;
};
