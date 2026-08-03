import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0a0d16',
        color: '#f3f4f6',
        fontSize: '1.2rem',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <div style={{
          border: '4px solid rgba(255,255,255,0.1)',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <span style={{ marginLeft: '12px' }}>Loading session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role checking is enabled and user doesn't have any of the allowed roles
  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.some(role => user.roles?.includes(role));
    if (!hasPermission) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#0a0d16',
          color: '#f3f4f6',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Outfit, sans-serif'
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '30px',
            borderRadius: '16px',
            maxWidth: '480px',
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ef4444" style={{ width: '64px', height: '64px', marginBottom: '16px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
            </svg>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '10px' }}>Access Denied</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.95rem', marginBottom: '20px' }}>
              Your account with role <strong>{user.roles?.join(', ')}</strong> does not have permission to view this resource.
            </p>
            <button 
              onClick={() => window.history.back()}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
