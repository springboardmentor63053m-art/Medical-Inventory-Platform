import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Search, X, Clipboard, Eye, Calendar, User, DollarSign, Edit } from 'lucide-react';

const PurchaseOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  
  // Create PO form states
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [lineItems, setLineItems] = useState([
    { medicineId: '', quantity: 1, unitPrice: 0 }
  ]);

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Role permissions
  const isAdminOrPharmacist = user?.roles?.some(role => ['ROLE_ADMIN', 'ROLE_PHARMACIST'].includes(role));
  const isSupplier = user?.roles?.includes('ROLE_SUPPLIER');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderRes, supplierRes, medicineRes] = await Promise.all([
        api.get('/purchase-orders'),
        api.get('/suppliers'),
        api.get('/medicines')
      ]);

      if (orderRes.data.success) setOrders(orderRes.data.data);
      if (supplierRes.data.success) setSuppliers(supplierRes.data.data);
      if (medicineRes.data.success) setMedicines(medicineRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error loading purchase orders data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setSelectedSupplierId(suppliers[0]?.id || '');
    setLineItems([{ medicineId: medicines[0]?.id || '', quantity: 1, unitPrice: medicines[0]?.price || 0 }]);
    setFormError('');
    setCreateModalOpen(true);
  };

  const handleAddLineItem = () => {
    const defaultMed = medicines[0];
    setLineItems(prev => [
      ...prev,
      { medicineId: defaultMed?.id || '', quantity: 1, unitPrice: defaultMed?.price || 0 }
    ]);
  };

  const handleRemoveLineItem = (index) => {
    if (lineItems.length === 1) return;
    setLineItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleLineItemChange = (index, field, value) => {
    setLineItems(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      
      const updated = { ...item, [field]: value };
      
      // If medicine ID changes, auto-fill standard price
      if (field === 'medicineId') {
        const matchingMed = medicines.find(m => m.id.toString() === value.toString());
        if (matchingMed) {
          updated.unitPrice = matchingMed.price;
        }
      }
      return updated;
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      setFormError('Supplier selection is required.');
      return;
    }

    const invalidItem = lineItems.some(item => !item.medicineId || !item.quantity || item.quantity < 1 || !item.unitPrice);
    if (invalidItem) {
      setFormError('Please verify all items have a valid medicine selection, positive quantity, and price.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    const payload = {
      supplierId: parseInt(selectedSupplierId),
      items: lineItems.map(item => ({
        medicineId: parseInt(item.medicineId),
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitPrice)
      }))
    };

    try {
      const response = await api.post('/purchase-orders', payload);
      if (response.data.success) {
        setOrders(prev => [response.data.data, ...prev]);
        setCreateModalOpen(false);
      } else {
        setFormError(response.data.message || 'Failed to create purchase order');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error processing purchase order request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const handleOpenStatusModal = (order) => {
    setSelectedOrder(order);
    setNewOrderStatus(order.status);
    setFormError('');
    setStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const response = await api.patch(`/purchase-orders/${selectedOrder.id}/status`, null, {
        params: { status: newOrderStatus }
      });
      if (response.data.success) {
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? response.data.data : o));
        setStatusModalOpen(false);
        // If details modal was open, refresh selectedOrder
        if (detailModalOpen && selectedOrder?.id === response.data.data.id) {
          setSelectedOrder(response.data.data);
        }
      } else {
        setFormError(response.data.message || 'Failed to update order status');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error updating order status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, orderNo) => {
    if (window.confirm(`Are you sure you want to delete purchase order "${orderNo}"?`)) {
      try {
        const response = await api.delete(`/purchase-orders/${id}`);
        if (response.data.success) {
          setOrders(prev => prev.filter(o => o.id !== id));
        } else {
          alert(response.data.message || 'Failed to delete order');
        }
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Error occurred during deletion');
      }
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const calculateTotal = () => {
    return lineItems.reduce((acc, item) => acc + (parseInt(item.quantity || 0) * parseFloat(item.unitPrice || 0)), 0);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.createdByUsername?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading && orders.length === 0) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading orders database...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <div className="search-filter-bar">
        <div className="search-input-wrap">
          <Search />
          <input
            type="text"
            placeholder="Search orders by PO#, supplier name, or creator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '160px', height: '42px' }}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="RECEIVED">RECEIVED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          {isAdminOrPharmacist && (
            <button className="btn btn-primary" onClick={openCreateModal} style={{ height: '42px' }}>
              <Plus size={16} />
              <span>Create PO</span>
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {filteredOrders.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>
            No purchase orders logged.
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Supplier</th>
                  <th>Created By</th>
                  <th>Order Date</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                  <th style={{ width: '150px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const dateStr = order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A';
                  return (
                    <tr key={order.id}>
                      <td><span className="badge badge-info" style={{ letterSpacing: '0.5px' }}>{order.orderNumber}</span></td>
                      <td><strong style={{ color: 'white' }}>{order.supplier?.name}</strong></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{order.createdByUsername || 'System'}</td>
                      <td>{dateStr}</td>
                      <td><strong>{formatCurrency(order.totalAmount)}</strong></td>
                      <td>
                        <span className={`badge ${
                          order.status === 'COMPLETED' || order.status === 'RECEIVED' ? 'badge-success' :
                          order.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn-icon" 
                            onClick={() => handleOpenDetails(order)}
                            title="View Items"
                          >
                            <Eye size={14} />
                          </button>
                          {(isAdminOrPharmacist || isSupplier) && (
                            <button 
                              className="btn-icon edit" 
                              onClick={() => handleOpenStatusModal(order)}
                              title="Update Status"
                            >
                              <Edit size={14} />
                            </button>
                          )}
                          {isAdminOrPharmacist && (
                            <button 
                              className="btn-icon delete" 
                              onClick={() => handleDelete(order.id, order.orderNumber)}
                              title="Delete Order"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {createModalOpen && (
        <div className="modal-overlay">
          <div className="card modal-content" style={{ maxWidth: '720px' }}>
            <div className="card-header-flex">
              <h3 style={{ fontFamily: 'Outfit, sans-serif' }}>Generate Purchase Order</h3>
              <button className="btn-icon" onClick={() => setCreateModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {formError && <div className="alert alert-danger">{formError}</div>}

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label htmlFor="supplierSelect">Target Supplier *</label>
                <select
                  id="supplierSelect"
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  disabled={submitting}
                  required
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.contactPerson || 'No Rep'})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: '20px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontWeight: 600 }}>Medicine Items List *</label>
                <button type="button" className="btn btn-secondary" onClick={handleAddLineItem} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                  + Add Line
                </button>
              </div>

              <div className="po-items-list">
                {lineItems.map((item, idx) => (
                  <div key={idx} className="po-item-row">
                    <select
                      value={item.medicineId}
                      onChange={(e) => handleLineItemChange(idx, 'medicineId', e.target.value)}
                      disabled={submitting}
                      required
                    >
                      <option value="">Select Medicine</option>
                      {medicines.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                      min="1"
                      required
                      disabled={submitting}
                    />

                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => handleLineItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      required
                      disabled={submitting}
                    />

                    <button 
                      type="button" 
                      onClick={() => handleRemoveLineItem(idx)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                      disabled={lineItems.length === 1 || submitting}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Calculated Total:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--success)', fontFamily: 'Outfit' }}>
                  {formatCurrency(calculateTotal())}
                </span>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setCreateModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Issue Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {detailModalOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="card modal-content" style={{ maxWidth: '640px' }}>
            <div className="card-header-flex">
              <h3 style={{ fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clipboard size={20} style={{ color: 'var(--primary)' }} />
                PO: {selectedOrder.orderNumber}
              </h3>
              <button className="btn-icon" onClick={() => setDetailModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Supplier</div>
                <div style={{ fontWeight: 600, color: 'white', marginTop: '4px' }}>{selectedOrder.supplier?.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rep: {selectedOrder.supplier?.contactPerson || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Order Status</div>
                <div style={{ marginTop: '4px' }}>
                  <span className={`badge ${
                    selectedOrder.status === 'COMPLETED' || selectedOrder.status === 'RECEIVED' ? 'badge-success' :
                    selectedOrder.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Order Date</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', marginTop: '4px' }}>
                  <Calendar size={14} /> {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleString() : 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Issued By</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', marginTop: '4px' }}>
                  <User size={14} /> {selectedOrder.createdByUsername || 'System'}
                </div>
              </div>
            </div>

            <label style={{ fontWeight: 600, display: 'block', marginBottom: '10px' }}>Ordered Items</label>
            <div className="table-responsive" style={{ maxHeight: '250px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item) => (
                    <tr key={item.id}>
                      <td><strong style={{ color: 'white' }}>{item.medicineName}</strong></td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td><strong>{formatCurrency(item.totalPrice)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <span style={{ fontWeight: 600 }}>Grand Total:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--success)', fontFamily: 'Outfit' }}>
                {formatCurrency(selectedOrder.totalAmount)}
              </span>
            </div>

            <div className="modal-footer" style={{ marginTop: '20px' }}>
              {(isAdminOrPharmacist || isSupplier) && (
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => {
                    setDetailModalOpen(false);
                    handleOpenStatusModal(selectedOrder);
                  }}
                  style={{ gap: '6px' }}
                >
                  <Edit size={14} />
                  <span>Change Status</span>
                </button>
              )}
              <button type="button" className="btn btn-secondary" onClick={() => setDetailModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {statusModalOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="card modal-content" style={{ maxWidth: '400px' }}>
            <div className="card-header-flex">
              <h3 style={{ fontFamily: 'Outfit, sans-serif' }}>Update Status: {selectedOrder.orderNumber}</h3>
              <button className="btn-icon" onClick={() => setStatusModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {formError && <div className="alert alert-danger">{formError}</div>}

            <form onSubmit={handleStatusSubmit}>
              <div className="form-group">
                <label htmlFor="statusSelect">Select Order Status</label>
                <select
                  id="statusSelect"
                  value={newOrderStatus}
                  onChange={(e) => setNewOrderStatus(e.target.value)}
                  disabled={submitting}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="RECEIVED">RECEIVED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setStatusModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Applying...' : 'Apply Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
