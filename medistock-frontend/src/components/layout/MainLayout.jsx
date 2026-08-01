import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <Navbar toggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />
      
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar isCollapsed={isCollapsed} />
        
        <main style={{
          flex: 1,
          padding: '28px',
          overflowY: 'auto',
          backgroundColor: 'var(--color-bg)',
          minHeight: 'calc(100vh - var(--navbar-height))'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
