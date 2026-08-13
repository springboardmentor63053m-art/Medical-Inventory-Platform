import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Truck, 
  Search, 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  IndianRupee, 
  Pill, 
  ShieldCheck, 
  ArrowUpRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SupplierDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [poSearch, setPoSearch] = useState('');

  const fetchSupplierDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
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

  useEffect(() => {
    fetchSupplierDashboard();
  }, []);

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '₹0.00';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  const getExpectedDeliveryDate = (orderDateStr) => {
    if (!orderDateStr) return 'N/A';
    try {
      const d = new Date(orderDateStr);
      d.setDate(d.getDate() + 7);
      return d.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-');
    } catch {
      return 'N/A';
    }
  };

  const formatDateOnly = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-');
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card" style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Loading Supplier Portal Dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger" style={{ margin: '20px 0' }}>{error}</div>;
  }

  const profile = data?.supplierProfile;
  const medicines = data?.suppliedMedicines || [];
  const orders = data?.recentActivity || [];

  // Metrics calculations
  const totalOrders = orders.length;
  const pendingDeliveries = orders.filter(o => o.status === 'PENDING' || o.status === 'APPROVED' || o.status === 'SHIPPED').length;
  const fulfilledShipments = orders.filter(o => o.status === 'RECEIVED').length;
  const catalogMedicines = medicines.length;

  // Filter Active POs by search query
  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(poSearch.toLowerCase()) ||
    o.status.toLowerCase().includes(poSearch.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Supplier Welcome Banner */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))', 
        border: '1px solid rgba(59, 130, 246, 0.15)',
        padding: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <span className="badge" style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            color: 'var(--primary)', 
            border: '1px solid rgba(59, 130, 246, 0.25)', 
            fontWeight: 650, 
            fontSize: '0.75rem', 
            padding: '4px 10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            SUPPLIER PARTNER PORTAL &nbsp;•&nbsp; ID: {user?.username || 'SUP001'}
          </span>
          <h2 style={{ margin: '14px 0 8px 0', fontSize: '1.8rem', fontWeight: 600, color: 'white', fontFamily: 'Outfit, sans-serif' }}>
            Welcome back, {user?.fullName || profile?.name || 'Glenmark'}
          </h2>
          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Manage incoming pharmaceutical purchase orders, track supply fulfillment statuses, and streamline enterprise deliveries.
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '14px', 
          background: 'rgba(255,255,255,0.03)', 
          padding: '14px 20px', 
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <Truck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>Supply Network</div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontWeight: 500 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              Active Logistics Partner
            </div>
          </div>
        </div>
      </div>

      {/* 4 Dashboard Metrics Widgets */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        <div className="card stat-card blue">
          <div className="stat-info">
            <span className="stat-value">{totalOrders}</span>
            <span className="stat-label" style={{ marginTop: '4px' }}>Total Purchase Orders</span>
          </div>
          <div className="stat-icon"><ClipboardList size={22} /></div>
        </div>

        <div className="card stat-card amber">
          <div className="stat-info">
            <span className="stat-value">{pendingDeliveries}</span>
            <span className="stat-label" style={{ marginTop: '4px' }}>Pending Deliveries</span>
          </div>
          <div className="stat-icon"><Clock size={22} /></div>
        </div>

        <div className="card stat-card blue">
          <div className="stat-info">
            <span className="stat-value">{fulfilledShipments}</span>
            <span className="stat-label" style={{ marginTop: '4px' }}>Fulfilled Shipments</span>
          </div>
          <div className="stat-icon"><CheckCircle size={22} /></div>
        </div>

        <div className="card stat-card blue">
          <div className="stat-info">
            <span className="stat-value">{catalogMedicines}</span>
            <span className="stat-label" style={{ marginTop: '4px' }}>Catalog Medicines</span>
          </div>
          <div className="stat-icon"><Pill size={22} /></div>
        </div>

      </div>

      {/* Dashboard Main Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Active Purchase Orders Table Card (Left) */}
        <div className="card" style={{ padding: '24px' }}>
          <div className="card-header-flex" style={{ padding: '0 0 20px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
                Active Purchase Orders
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Orders dispatched by healthcare network facilities
              </p>
            </div>
            
            <div className="search-input-wrap" style={{ width: '220px', height: '36px' }}>
              <Search size={14} />
              <input 
                type="text" 
                placeholder="Search POs..." 
                value={poSearch}
                onChange={(e) => setPoSearch(e.target.value)}
                style={{ fontSize: '0.82rem' }}
              />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              No active purchase orders found.
            </div>
          ) : (
            <div className="table-responsive">
              <table style={{ fontSize: '0.88rem' }}>
                <thead>
                  <tr>
                    <th>PO NUMBER</th>
                    <th>ORDER DATE</th>
                    <th>EXPECTED DELIVERY</th>
                    <th>TOTAL AMOUNT</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} onClick={() => navigate('/purchase-orders')} style={{ cursor: 'pointer' }}>
                      <td><strong style={{ color: 'white' }}>{order.orderNumber}</strong></td>
                      <td>{formatDateOnly(order.orderDate)}</td>
                      <td>{getExpectedDeliveryDate(order.orderDate)}</td>
                      <td style={{ fontWeight: 550 }}>{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <span className={`badge ${
                          order.status === 'RECEIVED' ? 'badge-success' :
                          order.status === 'APPROVED' || order.status === 'SHIPPED' ? 'badge-info' :
                          order.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'
                        }`} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px' }}>
                          ● {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SLA Guidelines & Quick Catalog Access (Right) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Supply SLA & Guidelines Card */}
          <div className="card" style={{ 
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.4))', 
            border: '1px solid rgba(59, 130, 246, 0.1)',
            padding: '24px'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
              Supply SLA & Guidelines
            </h3>
            <p style={{ margin: '4px 0 16px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Enterprise fulfillment standards
            </p>
            
            <ul style={{ 
              margin: 0, 
              paddingLeft: '20px', 
              fontSize: '0.88rem', 
              color: 'var(--text-primary)', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              lineHeight: '1.4'
            }}>
              <li>Confirm order receipt within <strong style={{ color: 'white' }}>24 hours</strong> of purchase order dispatch.</li>
              <li>Maintain cold-chain compliance for temperature-sensitive biopharmaceuticals.</li>
              <li>Attach valid batch COA (Certificate of Analysis) with every shipment.</li>
            </ul>
          </div>

          {/* Catalog Quick Access Card */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '0.92rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Outfit, sans-serif' }}>
              PHARMACEUTICAL CATALOG QUICK ACCESS
            </h3>
            
            {medicines.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '10px 0' }}>
                No catalog medicines supplied yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {medicines.slice(0, 4).map(med => (
                  <div 
                    key={med.id}
                    onClick={() => navigate('/medicines')}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255,255,255,0.01)',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                  >
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: 'white', display: 'block' }}>{med.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                        {med.manufacturer || 'Glenmark'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>
                        {formatCurrency(med.price)}
                      </strong>
                      <ArrowUpRight size={14} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default SupplierDashboard;
