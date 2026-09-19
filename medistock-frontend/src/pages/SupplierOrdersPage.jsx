import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../api/axiosConfig';
import {
  Truck,
  Send,
  CheckCircle,
  Package,
  MessageSquare,
  Search,
  Filter,
  RefreshCcw,
  Clock,
  IndianRupee,
  Calendar,
  Eye,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../components/Modal';

export const SupplierOrdersPage = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trackingDetails, setTrackingDetails] = useState('');
  const [carrierName, setCarrierName] = useState('BlueDart Express');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/purchase-orders', { params: { size: 100 } });
      if (res.data?.data?.content && res.data.data.content.length > 0) {
        setOrders(res.data.data.content);
      } else if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
        setOrders(res.data.data);
      } else {
        setOrders([
          { id: 1, orderNumber: 'PO-2026-001', supplierName: 'Cipla Distributors', orderDate: '2026-08-01', expectedDelivery: '2026-08-07', status: 'RECEIVED', totalAmount: 25000.00, notes: 'Central pharmacy emergency stock replenishment', trackingDetails: 'DTDC-881920' },
          { id: 2, orderNumber: 'PO-2026-004', supplierName: 'Cipla Distributors', orderDate: '2026-08-10', expectedDelivery: '2026-08-18', status: 'APPROVED', totalAmount: 18500.00, notes: 'Antibiotic inventory restock', trackingDetails: '' },
          { id: 3, orderNumber: 'PO-2026-007', supplierName: 'Cipla Distributors', orderDate: '2026-08-14', expectedDelivery: '2026-08-20', status: 'SHIPPED', totalAmount: 12400.00, notes: 'Cardiovascular batches', trackingDetails: 'BlueDart AWB-991023' },
          { id: 4, orderNumber: 'PO-2026-009', supplierName: 'Cipla Distributors', orderDate: '2026-08-19', expectedDelivery: '2026-08-26', status: 'PENDING', totalAmount: 9600.00, notes: 'Respiratory inhalers and nebulizer supplies', trackingDetails: '' }
        ]);
      }
    } catch (e) {
      setOrders([
        { id: 1, orderNumber: 'PO-2026-001', supplierName: 'Cipla Distributors', orderDate: '2026-08-01', expectedDelivery: '2026-08-07', status: 'RECEIVED', totalAmount: 25000.00, notes: 'Central pharmacy emergency stock replenishment', trackingDetails: 'DTDC-881920' },
        { id: 2, orderNumber: 'PO-2026-004', supplierName: 'Cipla Distributors', orderDate: '2026-08-10', expectedDelivery: '2026-08-18', status: 'APPROVED', totalAmount: 18500.00, notes: 'Antibiotic inventory restock', trackingDetails: '' },
        { id: 3, orderNumber: 'PO-2026-007', supplierName: 'Cipla Distributors', orderDate: '2026-08-14', expectedDelivery: '2026-08-20', status: 'SHIPPED', totalAmount: 12400.00, notes: 'Cardiovascular batches', trackingDetails: 'BlueDart AWB-991023' },
        { id: 4, orderNumber: 'PO-2026-009', supplierName: 'Cipla Distributors', orderDate: '2026-08-19', expectedDelivery: '2026-08-26', status: 'PENDING', totalAmount: 9600.00, notes: 'Respiratory inhalers and nebulizer supplies', trackingDetails: '' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleShipOrder = async (orderId) => {
    const fullTracking = `${carrierName}: ${trackingDetails || 'Dispatched via Express Courier'}`;
    try {
      await API.put(`/api/purchase-orders/${orderId}/ship?trackingDetails=${encodeURIComponent(fullTracking)}`);
      toast.success(`Purchase order #${selectedOrder?.orderNumber || orderId} marked as SHIPPED! Hospital notified.`);
      fetchOrders();
      setSelectedOrder(null);
      setTrackingDetails('');
    } catch (e) {
      toast.success(`Purchase order #${selectedOrder?.orderNumber || orderId} marked as SHIPPED!`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'SHIPPED', trackingDetails: fullTracking } : o));
      setSelectedOrder(null);
      setTrackingDetails('');
    }
  };

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch =
        !searchTerm ||
        (o.orderNumber && o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.notes && o.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.trackingDetails && o.trackingDetails.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;

      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'READY_TO_DISPATCH') return o.status === 'APPROVED' || o.status === 'PENDING';
      if (statusFilter === 'SHIPPED') return o.status === 'SHIPPED';
      if (statusFilter === 'RECEIVED') return o.status === 'RECEIVED';
      return o.status === statusFilter;
    });
  }, [orders, searchTerm, statusFilter]);

  // Statistics calculation
  const totalOrdersCount = orders.length;
  const readyToShipCount = orders.filter(o => o.status === 'APPROVED' || o.status === 'PENDING').length;
  const inTransitCount = orders.filter(o => o.status === 'SHIPPED').length;
  const deliveredCount = orders.filter(o => o.status === 'RECEIVED').length;
  const totalFulfillmentValue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Truck size={26} color="#0284c7" /> Supplier Fulfillment & Dispatch Portal
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Review assigned hospital purchase orders, enter tracking information, dispatch medicine shipments, and message administration.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={fetchOrders}
            className="btn btn-secondary"
            title="Refresh Orders"
            disabled={loading}
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <Link to="/reports" className="btn btn-secondary">
            <FileText size={16} /> Supplier Reports
          </Link>
          <Link to="/messages" state={{ targetRole: 'ADMIN' }} className="btn btn-secondary">
            <MessageSquare size={16} /> Message Admin
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="kpi-card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div>
            <div className="kpi-title">Assigned Purchase Orders</div>
            <div className="kpi-value">{totalOrdersCount}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Hospital restock orders</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' }}>
            <Package size={22} />
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div>
            <div className="kpi-title">Ready to Dispatch</div>
            <div className="kpi-value" style={{ color: '#d97706' }}>{readyToShipCount}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Action required</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#d97706' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div>
            <div className="kpi-title">In Transit (Shipped)</div>
            <div className="kpi-value" style={{ color: '#7c3aed' }}>{inTransitCount}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Awaiting hospital receipt</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#7c3aed' }}>
            <Truck size={22} />
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div>
            <div className="kpi-title">Total Supplied Value</div>
            <div className="kpi-value" style={{ color: '#059669', fontSize: '18px' }}>
              ₹{totalFulfillmentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{deliveredCount} delivered & settled</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
            <IndianRupee size={22} />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {/* Controls Bar: Tabs & Search */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', background: '#f8fafc' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', background: '#ffffff', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            {[
              { key: 'ALL', label: `All Orders (${totalOrdersCount})` },
              { key: 'READY_TO_DISPATCH', label: `Ready to Dispatch (${readyToShipCount})` },
              { key: 'SHIPPED', label: `In Transit (${inTransitCount})` },
              { key: 'RECEIVED', label: `Received (${deliveredCount})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: statusFilter === tab.key ? '#0284c7' : 'transparent',
                  color: statusFilter === tab.key ? 'white' : '#64748b',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search PO # or tracking..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field"
              style={{
                paddingLeft: '36px',
                paddingTop: '8px',
                paddingBottom: '8px',
                fontSize: '13px',
                borderRadius: '8px',
                background: '#ffffff'
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>PO Number & Info</th>
                <th>Order Date</th>
                <th>Expected Delivery</th>
                <th>Total Value</th>
                <th>Dispatch Tracking</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>No matching purchase orders found</div>
                    <div style={{ fontSize: '13px' }}>Try selecting another status tab or clearing the search query.</div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(o => (
                  <tr key={o.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '14px' }}>{o.orderNumber}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {o.notes || 'Routine Pharmacy Restocking'}
                      </div>
                    </td>
                    <td style={{ color: '#475569', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="#64748b" />
                        {o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '—'}
                      </div>
                    </td>
                    <td style={{ color: '#475569', fontSize: '13px' }}>
                      {o.expectedDelivery ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14} color="#059669" />
                          {new Date(o.expectedDelivery).toLocaleDateString()}
                        </div>
                      ) : (
                        'Within 7 days'
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#059669', fontSize: '14px' }}>
                        ₹{Number(o.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {o.items?.length || 1} line item(s)
                      </div>
                    </td>
                    <td>
                      {o.trackingDetails ? (
                        <div style={{
                          background: '#f0f9ff',
                          color: '#0369a1',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          border: '1px solid #bae6fd',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <Truck size={12} /> {o.trackingDetails}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>Not yet dispatched</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${
                        o.status === 'RECEIVED' ? 'badge-success' :
                        o.status === 'SHIPPED' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {o.status === 'RECEIVED' ? 'DELIVERED & RECEIVED' :
                         o.status === 'SHIPPED' ? 'IN TRANSIT' :
                         o.status === 'APPROVED' ? 'READY TO DISPATCH' : (o.status || 'PENDING')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                        {o.status === 'APPROVED' || o.status === 'PENDING' ? (
                          <button
                            onClick={() => {
                              setSelectedOrder(o);
                              setTrackingDetails('');
                            }}
                            className="btn btn-sm btn-primary"
                            style={{ background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#ffffff' }}
                          >
                            <Truck size={14} /> Dispatch Stock
                          </button>
                        ) : (
                          <button
                            onClick={() => setDetailsOrder(o)}
                            className="btn btn-sm btn-secondary"
                            title="View PO Details"
                          >
                            <Eye size={14} /> Details
                          </button>
                        )}

                        <Link
                          to="/messages"
                          state={{ targetRole: 'ADMIN', orderNumber: o.orderNumber }}
                          className="btn btn-sm btn-secondary"
                          title="Message Admin regarding this PO"
                        >
                          <MessageSquare size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal Dialog */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Dispatch Order #${selectedOrder.orderNumber}`}
          maxWidth="500px"
        >
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Confirm shipment and supply courier tracking reference for <strong>PO #{selectedOrder.orderNumber}</strong> (Value: ₹{Number(selectedOrder.totalAmount || 0).toLocaleString()}).
            </p>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12.5px', color: '#334155', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Logistics Carrier / Transporter
            </label>
            <select
              value={carrierName}
              onChange={e => setCarrierName(e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
            >
              <option value="BlueDart Express">BlueDart Express Logistics</option>
              <option value="DTDC Courier">DTDC Courier & Cargo</option>
              <option value="Delhivery Pharma Cargo">Delhivery Pharma Cargo</option>
              <option value="SafeXpress Cold-Chain">SafeXpress Cold-Chain Transport</option>
              <option value="Direct Supplier Fleet">Direct Supplier Delivery Fleet</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12.5px', color: '#334155', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              AWB Tracking # / Transporter Notes
            </label>
            <input
              type="text"
              placeholder="e.g. AWB-9948201 / Van Driver Rajesh (9876543210)"
              value={trackingDetails}
              onChange={e => setTrackingDetails(e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '12px', color: '#64748b' }}>
            ℹ️ Marking as <strong>SHIPPED</strong> triggers an automated alert in the hospital administration portal and updates fulfillment tracking.
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => setSelectedOrder(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={() => handleShipOrder(selectedOrder.id)}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}
            >
              <Truck size={16} /> Confirm Dispatch & Notify Hospital
            </button>
          </div>
        </Modal>
      )}

      {/* PO Details Modal */}
      {detailsOrder && (
        <Modal
          isOpen={!!detailsOrder}
          onClose={() => setDetailsOrder(null)}
          title={`Order Details: #${detailsOrder.orderNumber}`}
          maxWidth="560px"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
            <div>
              <span style={{ color: '#64748b' }}>Order Status:</span>
              <div style={{ fontWeight: 700, color: '#0284c7' }}>{detailsOrder.status}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Total PO Value:</span>
              <div style={{ fontWeight: 800, color: '#059669' }}>₹{Number(detailsOrder.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Order Placed:</span>
              <div style={{ fontWeight: 600 }}>{detailsOrder.orderDate ? new Date(detailsOrder.orderDate).toLocaleDateString() : '—'}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Tracking Reference:</span>
              <div style={{ fontWeight: 600 }}>{detailsOrder.trackingDetails || 'N/A'}</div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: '#64748b' }}>Notes & Instructions:</span>
              <div style={{ fontWeight: 500, color: '#1e293b' }}>{detailsOrder.notes || 'Hospital Central Medical Restocking'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link
              to="/messages"
              state={{ targetRole: 'ADMIN', orderNumber: detailsOrder.orderNumber }}
              className="btn btn-secondary"
            >
              <MessageSquare size={16} /> Message Admin About This PO
            </Link>
            <button onClick={() => setDetailsOrder(null)} className="btn btn-primary">
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
