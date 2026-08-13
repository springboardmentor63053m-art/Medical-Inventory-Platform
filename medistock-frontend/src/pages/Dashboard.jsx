import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { 
  Users, 
  Pill, 
  Truck, 
  ClipboardList, 
  AlertTriangle, 
  IndianRupee,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  useEffect(() => {
    if (user?.roles?.includes('ROLE_SUPPLIER')) {
      navigate('/supplier/dashboard', { replace: true });
      return;
    }

    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        if (response.data.success) {
          setMetrics(response.data.data);
        } else {
          setError(response.data.message || 'Failed to retrieve metrics');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Error fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '₹0.00';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="stats-grid">
          {[1, 2, 3, 4, 5, 6, 7].map(n => (
            <div key={n} className="card" style={{ height: '100px', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
        <div className="card" style={{ height: '300px' }} />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      {/* Inventory Metrics Row */}
      <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Outfit, sans-serif' }}>Inventory Metrics</h3>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '28px' }}>
        <div className="card stat-card blue">
          <div className="stat-info">
            <span className="stat-label">Total Medicines</span>
            <span className="stat-value">{metrics?.totalMedicines || 0}</span>
            <span 
              onClick={() => navigate('/medicines', { state: { filterStatus: 'ALL' } })} 
              style={{ fontSize: '0.8rem', color: 'var(--primary)', cursor: 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View Catalogue <ArrowRight size={12} />
            </span>
          </div>
          <div className="stat-icon">
            <Pill size={24} />
          </div>
        </div>

        <div className="card stat-card emerald">
          <div className="stat-info">
            <span className="stat-label">Inventory Valuation</span>
            <span className="stat-value">{formatCurrency(metrics?.totalInventoryValue)}</span>
            <span 
              style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Total Assets Value
            </span>
          </div>
          <div className="stat-icon">
            <IndianRupee size={24} />
          </div>
        </div>
      </div>

      {/* Stock Level Metrics Row */}
      <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Outfit, sans-serif' }}>Stock Metrics</h3>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '28px' }}>
        <div className="card stat-card emerald">
          <div className="stat-info">
            <span className="stat-label">Available Medicines</span>
            <span className="stat-value">{metrics?.availableMedicinesCount || 0}</span>
            <span 
              onClick={() => navigate('/medicines', { state: { filterStatus: 'AVAILABLE' } })} 
              style={{ fontSize: '0.8rem', color: 'var(--success)', cursor: 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View Available <ArrowRight size={12} />
            </span>
          </div>
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="card stat-card amber">
          <div className="stat-info">
            <span className="stat-label">Low Stock Medicines</span>
            <span className="stat-value">{metrics?.lowStockMedicinesCount || 0}</span>
            <span 
              onClick={() => navigate('/medicines', { state: { filterStatus: 'LOW_STOCK' } })} 
              style={{ fontSize: '0.8rem', color: 'var(--warning)', cursor: 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Restock Now <ArrowRight size={12} />
            </span>
          </div>
          <div className="stat-icon">
            <TrendingDown size={24} />
          </div>
        </div>

        <div className="card stat-card blue" style={{ borderColor: 'rgba(107, 114, 128, 0.3)' }}>
          <div className="stat-info">
            <span className="stat-label">Out Of Stock Medicines</span>
            <span className="stat-value">{metrics?.outOfStockMedicinesCount || 0}</span>
            <span 
              onClick={() => navigate('/medicines', { state: { filterStatus: 'OUT_OF_STOCK' } })} 
              style={{ fontSize: '0.8rem', color: '#9ca3af', cursor: 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View Out Of Stock <ArrowRight size={12} />
            </span>
          </div>
          <div className="stat-icon" style={{ color: '#9ca3af', backgroundColor: 'rgba(107, 114, 128, 0.1)', borderColor: 'rgba(107, 114, 128, 0.2)' }}>
            <XCircle size={24} />
          </div>
        </div>
      </div>

      {/* Expiry Metrics Row */}
      <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Outfit, sans-serif' }}>Expiry Metrics</h3>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '28px' }}>
        <div className="card stat-card amber">
          <div className="stat-info">
            <span className="stat-label">Near Expiry Medicines</span>
            <span className="stat-value">{metrics?.nearExpiryMedicinesCount || 0}</span>
            <span 
              onClick={() => navigate('/medicines', { state: { filterStatus: 'NEAR_EXPIRY' } })} 
              style={{ fontSize: '0.8rem', color: 'var(--warning)', cursor: 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Monitor Expiry <ArrowRight size={12} />
            </span>
          </div>
          <div className="stat-icon">
            <Clock size={24} />
          </div>
        </div>

        <div className="card stat-card rose">
          <div className="stat-info">
            <span className="stat-label">Expired Medicines</span>
            <span className="stat-value">{metrics?.expiredMedicinesCount || 0}</span>
            <span 
              onClick={() => navigate('/medicines', { state: { filterStatus: 'EXPIRED' } })} 
              style={{ fontSize: '0.8rem', color: 'var(--danger)', cursor: 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Dispose Expired <ArrowRight size={12} />
            </span>
          </div>
          <div className="stat-icon">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* Auxiliary Metrics Row */}
      {isAdmin && (
        <>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Outfit, sans-serif' }}>System Registry</h3>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '28px' }}>
            <div className="card stat-card blue" style={{ padding: '16px' }}>
              <div className="stat-info">
                <span className="stat-label">Registered Suppliers</span>
                <span className="stat-value" style={{ fontSize: '1.4rem' }}>{metrics?.totalSuppliers || 0}</span>
              </div>
              <div className="stat-icon" style={{ width: '38px', height: '38px' }}>
                <Truck size={18} />
              </div>
            </div>

            <div className="card stat-card emerald" style={{ padding: '16px' }}>
              <div className="stat-info">
                <span className="stat-label">Registered Users</span>
                <span className="stat-value" style={{ fontSize: '1.4rem' }}>{metrics?.totalUsers || 0}</span>
              </div>
              <div className="stat-icon" style={{ width: '38px', height: '38px' }}>
                <Users size={18} />
              </div>
            </div>
          </div>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Low Stock Watch Section */}
        <div className="card">
          <div className="card-header-flex">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif' }}>
              <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
              Low Stock Watchlist
            </h3>
            <span className="badge badge-danger">{metrics?.lowStockItems?.length || 0} Alert(s)</span>
          </div>

          {metrics?.lowStockItems?.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '20px 0', textAlign: 'center' }}>
              All inventory levels are currently satisfactory.
            </div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '350px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Qty</th>
                    <th>Reorder Lvl</th>
                    <th>Rack Location</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.lowStockItems?.map(item => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.medicineName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.medicineCode}</div>
                      </td>
                      <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{item.quantity}</td>
                      <td>{item.reorderLevel}</td>
                      <td><span className="badge badge-info">{item.locationRack || 'N/A'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Orders Section */}
        <div className="card">
          <div className="card-header-flex">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif' }}>
              <ClipboardList size={18} style={{ color: 'var(--primary)' }} />
              Recent Purchase Orders
            </h3>
          </div>

          {metrics?.recentOrders?.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '20px 0', textAlign: 'center' }}>
              No purchase orders recorded yet.
            </div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '350px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Supplier</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.recentOrders?.map(order => (
                    <tr key={order.id}>
                      <td><strong>{order.orderNumber}</strong></td>
                      <td>{order.supplier?.name}</td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <span className={`badge ${
                          order.status === 'COMPLETED' ? 'badge-success' :
                          order.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
