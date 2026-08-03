import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  Users, 
  Pill, 
  Truck, 
  ClipboardList, 
  AlertTriangle, 
  DollarSign,
  TrendingDown
} from 'lucide-react';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
    if (val === undefined || val === null) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="stats-grid">
          {[1, 2, 3, 4].map(n => (
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
      {/* Statistics Header cards */}
      <div className="stats-grid">
        <div className="card stat-card blue">
          <div className="stat-info">
            <span className="stat-label">Total Medicines</span>
            <span className="stat-value">{metrics?.totalMedicines || 0}</span>
          </div>
          <div className="stat-icon">
            <Pill size={24} />
          </div>
        </div>

        <div className="card stat-card emerald">
          <div className="stat-info">
            <span className="stat-label">Inventory Valuation</span>
            <span className="stat-value">{formatCurrency(metrics?.totalInventoryValue)}</span>
          </div>
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="card stat-card amber">
          <div className="stat-info">
            <span className="stat-label">Low Stock Alarms</span>
            <span className="stat-value">{metrics?.lowStockCount || 0}</span>
          </div>
          <div className="stat-icon">
            <TrendingDown size={24} />
          </div>
        </div>

        <div className="card stat-card rose">
          <div className="stat-info">
            <span className="stat-label">Purchase Orders</span>
            <span className="stat-value">{metrics?.totalPurchaseOrders || 0}</span>
          </div>
          <div className="stat-icon">
            <ClipboardList size={24} />
          </div>
        </div>
      </div>

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
