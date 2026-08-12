import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { 
  Truck, 
  Mail, 
  Phone, 
  MapPin, 
  User as UserIcon, 
  Pill, 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  IndianRupee, 
  Activity 
} from 'lucide-react';

const SupplierDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupplierDashboard = async () => {
      try {
        setLoading(true);
        const response = await api.get('/supplier/dashboard');
        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError(response.data.message || 'Failed to retrieve supplier dashboard metrics');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Error fetching supplier dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierDashboard();
  }, []);

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '₹0.00';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card" style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Loading Supplier Portal...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" style={{ margin: '20px 0' }}>
        {error}
      </div>
    );
  }

  const profile = data?.supplierProfile;
  const medicines = data?.suppliedMedicines || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* SECTION A: Supplier Profile Header */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            background: 'rgba(59, 130, 246, 0.15)', 
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Truck size={32} />
          </div>
          
          <div style={{ flex: 1, minWidth: '240px' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
              {profile?.name || 'Supplier Partner'}
            </h2>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {profile?.contactPerson && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserIcon size={14} style={{ color: 'var(--primary)' }} /> {profile.contactPerson}
                </span>
              )}
              {profile?.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} style={{ color: 'var(--primary)' }} /> {profile.email}
                </span>
              )}
              {profile?.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} style={{ color: 'var(--primary)' }} /> {profile.phone}
                </span>
              )}
              {profile?.address && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} style={{ color: 'var(--primary)' }} /> {profile.address}
                </span>
              )}
            </div>
          </div>
          
          <div>
            <span className="badge badge-info" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              Verified Supplier Account
            </span>
          </div>
        </div>
      </div>

      {/* SECTION C: Purchase Order Summary Cards */}
      <div>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Outfit, sans-serif' }}>
          Purchase Order Summary
        </h3>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          
          <div className="card stat-card blue">
            <div className="stat-info">
              <span className="stat-label">Total Orders</span>
              <span className="stat-value">{data?.totalOrdersCount || 0}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                All Purchase Orders
              </span>
            </div>
            <div className="stat-icon">
              <ClipboardList size={24} />
            </div>
          </div>

          <div className="card stat-card amber">
            <div className="stat-info">
              <span className="stat-label">Pending Orders</span>
              <span className="stat-value">{data?.pendingOrdersCount || 0}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: '6px' }}>
                Awaiting Fulfillment
              </span>
            </div>
            <div className="stat-icon">
              <Clock size={24} />
            </div>
          </div>

          <div className="card stat-card emerald">
            <div className="stat-info">
              <span className="stat-label">Approved / Completed</span>
              <span className="stat-value">{data?.completedOrdersCount || 0}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '6px' }}>
                Successfully Processed
              </span>
            </div>
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
          </div>

          <div className="card stat-card emerald">
            <div className="stat-info">
              <span className="stat-label">Total Business Value</span>
              <span className="stat-value">{formatCurrency(data?.totalOrderAmount)}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Cumulative Order Amount
              </span>
            </div>
            <div className="stat-icon">
              <IndianRupee size={24} />
            </div>
          </div>

        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* SECTION B: Supplied Medicines Summary */}
        <div className="card">
          <div className="card-header-flex">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
              <Pill size={18} style={{ color: 'var(--primary)' }} />
              Supplied Medicines ({medicines.length})
            </h3>
          </div>

          {medicines.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '24px 0', textAlign: 'center' }}>
              No medicines currently registered under your supplier profile.
            </div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '380px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Supplier Avail Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map(med => (
                    <tr key={med.id}>
                      <td>
                        <strong>{med.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{med.code}</div>
                      </td>
                      <td>
                        <span className="badge badge-info">{med.category?.name || 'General'}</span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{formatCurrency(med.price)}</td>
                      <td>
                        <span className="badge badge-success" style={{ fontWeight: 600 }}>
                          {med.supplierAvailableQuantity || 0} units
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION D: Recent Supply Activity */}
        <div className="card">
          <div className="card-header-flex">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
              <Activity size={18} style={{ color: 'var(--success)' }} />
              Recent Supply Activity ({recentActivity.length})
            </h3>
          </div>

          {recentActivity.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '24px 0', textAlign: 'center' }}>
              No recent order activity found.
            </div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '380px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map(order => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.orderNumber}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {order.items?.length || 0} item(s)
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{formatDate(order.orderDate)}</td>
                      <td style={{ fontWeight: 500 }}>{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <span className={`badge ${
                          order.status === 'RECEIVED' || order.status === 'APPROVED' ? 'badge-success' :
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

export default SupplierDashboard;
