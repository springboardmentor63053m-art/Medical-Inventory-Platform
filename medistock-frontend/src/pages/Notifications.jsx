import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  Bell, 
  AlertTriangle, 
  XOctagon, 
  RotateCcw, 
  Search, 
  ArrowRight,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchSupplierMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/medicines');
      if (res.data.success) {
        setMedicines(res.data.data);
      } else {
        setError(res.data.message || 'Failed to fetch medicines catalog');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error loading medicines catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplierMedicines();
  }, []);

  // Generate notifications dynamically from catalog data
  const generateNotifications = () => {
    const alerts = [];
    const today = new Date();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(today.getDate() + 90);

    medicines.forEach(med => {
      const qty = med.supplierAvailableQuantity || 0;
      const reorder = med.reorderLevel || 30; // Use inventory reorderLevel or default 30

      // 1. Check Expiry
      if (med.expiryDate) {
        const expDate = new Date(med.expiryDate);
        if (expDate < today) {
          alerts.push({
            id: `exp-${med.id}`,
            type: 'CRITICAL',
            title: 'Critical Expiry Alert',
            message: `Supplied batch of "${med.name}" (Code: ${med.code}) has EXPIRED on ${med.expiryDate}.`,
            medicineId: med.id,
            icon: <XOctagon size={18} />,
            color: '#ef4444',
            bg: 'rgba(239, 68, 68, 0.08)',
            border: 'rgba(239, 68, 68, 0.2)'
          });
        } else if (expDate <= ninetyDaysFromNow) {
          alerts.push({
            id: `near-exp-${med.id}`,
            type: 'WARNING',
            title: 'Near Expiry Warning',
            message: `Supplied batch of "${med.name}" (Code: ${med.code}) is nearing expiration on ${med.expiryDate} (under 90 days).`,
            medicineId: med.id,
            icon: <Clock size={18} />,
            color: '#f59e0b',
            bg: 'rgba(245, 158, 11, 0.08)',
            border: 'rgba(245, 158, 11, 0.2)'
          });
        }
      }

      // 2. Check Stock Levels
      if (qty === 0) {
        alerts.push({
          id: `oos-${med.id}`,
          type: 'CRITICAL',
          title: 'Critical Out-Of-Stock Alert',
          message: `Supplied formulation "${med.name}" (Code: ${med.code}) is OUT OF STOCK. Please replenish availability immediately.`,
          medicineId: med.id,
          icon: <ShieldAlert size={18} />,
          color: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.08)',
          border: 'rgba(239, 68, 68, 0.2)'
        });
      } else if (qty <= reorder) {
        alerts.push({
          id: `low-${med.id}`,
          type: 'WARNING',
          title: 'Low Stock Warning',
          message: `Supply alert: Formulation "${med.name}" (Code: ${med.code}) is in LOW STOCK with only ${qty} units remaining (Reorder: ${reorder}).`,
          medicineId: med.id,
          icon: <AlertTriangle size={18} />,
          color: '#f97316',
          bg: 'rgba(249, 115, 22, 0.08)',
          border: 'rgba(249, 115, 22, 0.2)'
        });
      }
    });

    return alerts;
  };

  const allAlerts = generateNotifications();

  // Filter alerts by search query and active tab
  const filteredAlerts = allAlerts.filter(alert => {
    const matchesSearch = alert.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          alert.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'ALL' || alert.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const criticalCount = allAlerts.filter(a => a.type === 'CRITICAL').length;
  const warningCount = allAlerts.filter(a => a.type === 'WARNING').length;

  if (loading) {
    return (
      <div className="card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading alerts feed...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Panel */}
      <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          background: 'rgba(59, 130, 246, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)'
        }}>
          <Bell size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
            Notifications & Alerts Feed
          </h2>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time alerts for low stock, near-expiry, and expired items in your supplied catalog.
          </p>
        </div>
        <button 
          className="btn-icon" 
          onClick={fetchSupplierMedicines} 
          title="Refresh Alerts"
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="search-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: '280px' }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search alerts by formulation name, code or alert text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn ${activeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('ALL')}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            All ({allAlerts.length})
          </button>
          <button 
            className={`btn ${activeTab === 'CRITICAL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('CRITICAL')}
            style={{ 
              padding: '8px 16px', 
              fontSize: '0.85rem',
              background: activeTab === 'CRITICAL' ? '#ef4444' : undefined,
              borderColor: activeTab === 'CRITICAL' ? '#ef4444' : undefined,
              color: activeTab === 'CRITICAL' ? 'white' : undefined
            }}
          >
            Critical ({criticalCount})
          </button>
          <button 
            className={`btn ${activeTab === 'WARNING' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('WARNING')}
            style={{ 
              padding: '8px 16px', 
              fontSize: '0.85rem',
              background: activeTab === 'WARNING' ? '#f59e0b' : undefined,
              borderColor: activeTab === 'WARNING' ? '#f59e0b' : undefined,
              color: activeTab === 'WARNING' ? 'black' : undefined
            }}
          >
            Warnings ({warningCount})
          </button>
        </div>
      </div>

      {/* Notifications Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredAlerts.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Bell size={36} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: '0.95rem' }}>No active notifications or alerts found.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div 
              key={alert.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                borderRadius: '12px',
                background: alert.bg,
                border: `1px solid ${alert.border}`,
                gap: '16px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '240px' }}>
                <div style={{
                  color: alert.color,
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {alert.icon}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 650, color: 'white', fontFamily: 'Outfit' }}>
                    {alert.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    {alert.message}
                  </p>
                </div>
              </div>

              <div>
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigate('/medicines')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    padding: '8px 16px',
                    borderColor: alert.border,
                    background: 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    color: 'white'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                >
                  <span>Verify Catalog</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Notifications;
