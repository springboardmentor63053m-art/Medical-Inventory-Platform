import React, { useContext, useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosConfig';
import {
  LayoutDashboard,
  Pill,
  Users,
  Boxes,
  ArrowDownUp,
  History,
  AlertTriangle,
  LogOut,
  Cross,
  MessageSquare,
  FileCheck,
  ShoppingCart,
  Receipt,
  UserCheck,
  Truck,
  Bell,
  Calendar,
  BarChart3,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Shield,
  Store
} from 'lucide-react';

export const ProtectedLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownNotifications, setDropdownNotifications] = useState([]);

  const role = user?.role || 'PHARMACIST';

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh unread count every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await API.get('/api/notifications/unread-count');
      if (res.data?.data !== undefined) {
        setUnreadCount(res.data.data);
      }
    } catch (e) {
      // Quiet catch
    }
  };

  const handleBellClick = async () => {
    const nextState = !dropdownOpen;
    setDropdownOpen(nextState);
    if (nextState) {
      try {
        const res = await API.get('/api/notifications/unread', { params: { size: 5 } });
        setDropdownNotifications(res.data?.data?.content || []);
      } catch (e) {
        setDropdownNotifications([]);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'PHARMACIST', 'VIEWER', 'STAFF', 'SUPPLIER'] },
    { label: 'Medicines', path: '/medicines', icon: Pill, roles: ['ADMIN', 'PHARMACIST', 'VIEWER', 'STAFF'] },
    { label: 'User Management', path: '/user-management', icon: Shield, roles: ['ADMIN'] },
    { label: 'Point of Sale (POS)', path: '/sales', icon: ShoppingCart, roles: ['ADMIN', 'PHARMACIST'] },
    { label: 'Bills & Invoices', path: '/bills', icon: Receipt, roles: ['ADMIN', 'PHARMACIST', 'VIEWER', 'STAFF'] },
    { label: 'Customers', path: '/customers', icon: UserCheck, roles: ['ADMIN', 'PHARMACIST'] },
    { label: 'Prescriptions', path: '/prescriptions', icon: FileCheck, roles: ['ADMIN', 'PHARMACIST'] },
    { label: 'Suppliers', path: '/suppliers', icon: Users, roles: ['ADMIN', 'PHARMACIST'] },
    { label: 'Supplier Catalogue', path: '/supplier-catalogue', icon: Store, roles: ['ADMIN', 'PHARMACIST', 'SUPPLIER'] },
    { label: 'Inventory Stock', path: '/inventory', icon: Boxes, roles: ['ADMIN', 'PHARMACIST', 'VIEWER', 'STAFF'] },
    { label: 'Expiry Tracking', path: '/expiry', icon: Calendar, roles: ['ADMIN', 'PHARMACIST'] },
    { label: 'Stock Operations', path: '/stock-management', icon: ArrowDownUp, roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
    { label: 'Stock History', path: '/stock-history', icon: History, roles: ['ADMIN', 'PHARMACIST', 'VIEWER', 'STAFF'] },
    { label: 'Low Stock Alerts', path: '/low-stock', icon: AlertTriangle, roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
    { label: 'Out of Stock', path: '/out-of-stock', icon: XCircle, roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
    { label: 'Notifications', path: '/notifications', icon: Bell, roles: ['ADMIN', 'PHARMACIST', 'STAFF', 'SUPPLIER'] },
    { label: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['ADMIN', 'PHARMACIST'] },
    { label: 'Reports', path: '/reports', icon: FileText, roles: ['ADMIN', 'PHARMACIST', 'STAFF', 'VIEWER', 'SUPPLIER'] },
    { label: 'Messages / Chat', path: '/messages', icon: MessageSquare, roles: ['ADMIN', 'SUPPLIER', 'PHARMACIST'] },
    { label: 'Procurement Orders', path: '/supplier-orders', icon: Truck, roles: ['SUPPLIER', 'ADMIN', 'PHARMACIST'] },
  ].filter(item => item.roles.includes(role));

  // Determine display role label
  const getRoleDisplay = () => {
    if (role === 'VIEWER' || role === 'STAFF') return 'STAFF';
    return role;
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7, #14b8a6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)'
          }}>
            <Activity size={22} />
          </div>
          <div>
            <div className="sidebar-brand">MEDISTOCK</div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Pharmacy & Stock Portal</div>
          </div>
        </div>

        <nav className="sidebar-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.path === '/notifications' && unreadCount > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="navbar">
          <div className="navbar-title">Medical Inventory & Management Portal</div>
          <div className="navbar-user">
            {/* Notification Bell Icon */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={handleBellClick}
                style={{
                  background: dropdownOpen ? '#f1f5f9' : '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1e293b',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <Bell size={20} color="#475569" />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 800,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '50px',
                  width: '340px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  zIndex: 100,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f8fafc'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>Unread Alerts</div>
                    <Link to="/notifications" onClick={() => setDropdownOpen(false)} style={{ fontSize: '12px', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                      View All
                    </Link>
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {dropdownNotifications.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                        No unread notifications
                      </div>
                    ) : (
                      dropdownNotifications.map(n => (
                        <div key={n.id} style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #f1f5f9',
                          fontSize: '13px'
                        }}>
                          <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{n.title}</div>
                          <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>{n.message}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                            {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ padding: '10px', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Link to="/notifications" onClick={() => setDropdownOpen(false)} className="btn btn-sm btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      Go to Notifications Page
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="user-badge">
              <div className="user-avatar">{user?.name ? user.name[0].toUpperCase() : 'U'}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{user?.name || 'User'}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{user?.email}</div>
              </div>
              <span className={`role-tag role-${(role === 'VIEWER' || role === 'STAFF') ? 'staff' : role.toLowerCase()}`}>
                {getRoleDisplay()}
              </span>
            </div>
          </div>
        </header>

        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
