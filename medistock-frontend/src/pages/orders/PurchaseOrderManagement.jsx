import React, { useState, useEffect, useMemo } from 'react';
import { purchaseOrderApi } from '../../api/purchaseOrderApi';
import { supplierApi } from '../../api/supplierApi';
import { medicineApi } from '../../api/medicineApi';
import { Loader } from '../../components/common/Loader';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Eye, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  Clock,
  CheckCircle,
  Truck,
  PackageCheck,
  Ban,
  Trash,
  DollarSign
} from 'lucide-react';

export const PurchaseOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Search & Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Create Order Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [orderItems, setOrderItems] = useState([
    { medicineId: '', quantity: 1, unitPrice: 0 }
  ]);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Status Change State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [orderToUpdateStatus, setOrderToUpdateStatus] = useState(null);
  const [newStatus, setNewStatus] = useState('PENDING');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Delete Order Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [orderRes, supRes, medRes] = await Promise.all([
        purchaseOrderApi.getAll(),
        supplierApi.getAll().catch(() => ({ success: true, data: [] })),
        medicineApi.getAll().catch(() => ({ success: true, data: [] }))
      ]);

      if (orderRes && orderRes.success) {
        setOrders(orderRes.data || []);
      } else {
        setError(orderRes?.message || 'Failed to fetch purchase orders.');
      }

      setSuppliers(supRes?.data || []);
      setMedicines(medRes?.data || []);
    } catch (err) {
      console.error('Fetch purchase orders error:', err);
      setError(err.response?.data?.message || 'Failed to load purchase orders from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Search & Status Filtering
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || (
        (ord.orderNumber && ord.orderNumber.toLowerCase().includes(query)) ||
        (ord.supplier && ord.supplier.name && ord.supplier.name.toLowerCase().includes(query)) ||
        (ord.createdByUsername && ord.createdByUsername.toLowerCase().includes(query))
      );

      const matchesStatus = statusFilter === 'ALL' || ord.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Dynamic Item Row Handlers for Create Form
  const handleAddItemRow = () => {
    setOrderItems([...orderItems, { medicineId: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItemRow = (index) => {
    if (orderItems.length === 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;

    // Auto update unit price when medicine is selected
    if (field === 'medicineId') {
      const selectedMed = medicines.find((m) => String(m.id) === String(value));
      if (selectedMed) {
        updated[index].unitPrice = selectedMed.price || 0;
      }
    }

    setOrderItems(updated);
  };

  const calculateOrderTotal = () => {
    return orderItems.reduce((sum, item) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.unitPrice || 0);
      return sum + (qty * price);
    }, 0);
  };

  // Form Validation
  const validateCreateForm = () => {
    const errors = {};
    if (!selectedSupplierId) {
      errors.supplier = 'Please select a supplier.';
    }
    if (orderItems.length === 0) {
      errors.items = 'Order must contain at least one item.';
    }
    const invalidItems = orderItems.some((it) => !it.medicineId || Number(it.quantity) <= 0 || Number(it.unitPrice) <= 0);
    if (invalidItems) {
      errors.items = 'Each item must have a valid medicine, positive quantity, and unit price.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Create Order
  const handleCreateOrderSubmit = async (e) => {
    e.preventDefault();
    if (!validateCreateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        supplierId: Number(selectedSupplierId),
        items: orderItems.map((item) => ({
          medicineId: Number(item.medicineId),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        }))
      };

      const response = await purchaseOrderApi.create(payload);
      if (response && response.success) {
        showNotification(`Purchase Order "${response.data.orderNumber}" created successfully!`);
        setCreateModalOpen(false);
        setSelectedSupplierId('');
        setOrderItems([{ medicineId: '', quantity: 1, unitPrice: 0 }]);
        fetchInitialData();
      } else {
        showNotification(response?.message || 'Failed to create purchase order.', 'error');
      }
    } catch (err) {
      console.error('Create purchase order error:', err);
      const msg = err.response?.data?.message || 'Failed to create purchase order.';
      showNotification(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Status Handlers
  const handleOpenStatusModal = (ord) => {
    setOrderToUpdateStatus(ord);
    setNewStatus(ord.status || 'PENDING');
    setStatusModalOpen(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!orderToUpdateStatus) return;
    setIsUpdatingStatus(true);
    try {
      const response = await purchaseOrderApi.updateStatus(orderToUpdateStatus.id, newStatus);
      if (response && response.success) {
        showNotification(`Order "${orderToUpdateStatus.orderNumber}" status updated to ${newStatus}!`);
        setStatusModalOpen(false);
        setOrderToUpdateStatus(null);
        fetchInitialData();
      } else {
        showNotification(response?.message || 'Failed to update order status.', 'error');
      }
    } catch (err) {
      console.error('Status update error:', err);
      const msg = err.response?.data?.message || 'Failed to update order status.';
      showNotification(msg, 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete Order Handlers
  const handleOpenDeleteModal = (ord) => {
    setOrderToDelete(ord);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      const response = await purchaseOrderApi.delete(orderToDelete.id);
      if (response && response.success) {
        showNotification(`Purchase Order "${orderToDelete.orderNumber}" deleted successfully!`);
        setDeleteModalOpen(false);
        setOrderToDelete(null);
        fetchInitialData();
      } else {
        showNotification(response?.message || 'Failed to delete order.', 'error');
      }
    } catch (err) {
      console.error('Delete purchase order error:', err);
      const msg = err.response?.data?.message || 'Failed to delete purchase order.';
      showNotification(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span style={{ backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> PENDING</span>;
      case 'APPROVED':
        return <span style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> APPROVED</span>;
      case 'SHIPPED':
        return <span style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Truck size={12} /> SHIPPED</span>;
      case 'RECEIVED':
        return <span style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><PackageCheck size={12} /> RECEIVED</span>;
      case 'CANCELLED':
        return <span style={{ backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Ban size={12} /> CANCELLED</span>;
      default:
        return <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--color-text-muted)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.75rem' }}>{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingCart size={28} style={{ color: 'var(--color-primary)' }} />
            Purchase Order Management
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Create procurement purchase orders, inspect line items, and track order fulfillment status.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={fetchInitialData}
            title="Refresh Orders"
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={() => {
              setSelectedSupplierId(suppliers[0]?.id ? String(suppliers[0].id) : '');
              setOrderItems([{ medicineId: medicines[0]?.id ? String(medicines[0].id) : '', quantity: 10, unitPrice: medicines[0]?.price || 25.5 }]);
              setFormErrors({});
              setCreateModalOpen(true);
            }}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <Plus size={18} />
            Create Purchase Order
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div style={{
          backgroundColor: notification.type === 'success' ? 'var(--color-accent-light)' : 'var(--color-danger-light)',
          border: `1px solid ${notification.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: notification.type === 'success' ? '#a7f3d0' : '#fca5a5',
          padding: '14px 20px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.9rem',
          fontWeight: 500,
          boxShadow: 'var(--shadow-sm)'
        }}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Search & Status Filters */}
      <div style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)'
          }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by PO number, supplier, or creator username..."
            style={{
              width: '100%',
              padding: '10px 14px 10px 42px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {['ALL', 'PENDING', 'APPROVED', 'SHIPPED', 'RECEIVED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: statusFilter === st ? 'var(--color-primary)' : 'rgba(15, 23, 42, 0.6)',
                color: statusFilter === st ? '#ffffff' : 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
                transition: 'var(--transition-fast)'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <Loader fullScreen={false} message="Loading purchase orders..." />
      ) : error ? (
        <div style={{
          backgroundColor: 'var(--color-danger-light)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center'
        }}>
          <AlertCircle size={32} style={{ margin: '0 auto 8px' }} />
          <p>{error}</p>
          <button
            onClick={fetchInitialData}
            style={{
              marginTop: '12px',
              backgroundColor: 'var(--color-danger)',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  borderBottom: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em'
                }}>
                  <th style={{ padding: '16px 18px' }}>Order Number</th>
                  <th style={{ padding: '16px 18px' }}>Supplier Company</th>
                  <th style={{ padding: '16px 18px' }}>Created By</th>
                  <th style={{ padding: '16px 18px' }}>Total Amount</th>
                  <th style={{ padding: '16px 18px' }}>Status</th>
                  <th style={{ padding: '16px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No purchase orders found matching the filter query.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((ord) => (
                    <tr key={ord.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '16px 18px' }}>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                          {ord.orderNumber}
                        </strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {ord.orderDate ? new Date(ord.orderDate).toLocaleString() : 'N/A'}
                        </div>
                      </td>

                      <td style={{ padding: '16px 18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {ord.supplier ? ord.supplier.name : 'N/A'}
                      </td>

                      <td style={{ padding: '16px 18px', color: 'var(--color-text-secondary)' }}>
                        {ord.createdByUsername || 'admin'}
                      </td>

                      <td style={{ padding: '16px 18px', fontWeight: 800, color: 'var(--color-accent)' }}>
                        ₹{Number(ord.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        {renderStatusBadge(ord.status)}
                      </td>

                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setDetailsModalOpen(true);
                            }}
                            title="View Order Details"
                            style={{
                              padding: '6px 10px',
                              backgroundColor: 'var(--color-primary-light)',
                              color: 'var(--color-primary)',
                              borderRadius: 'var(--radius-sm)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                          >
                            <Eye size={14} />
                            Details
                          </button>

                          <button
                            onClick={() => handleOpenStatusModal(ord)}
                            title="Update Status"
                            style={{
                              padding: '6px 10px',
                              backgroundColor: 'rgba(245, 158, 11, 0.15)',
                              color: 'var(--color-warning)',
                              borderRadius: 'var(--radius-sm)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                          >
                            Status
                          </button>

                          <button
                            onClick={() => handleOpenDeleteModal(ord)}
                            title="Delete Order"
                            style={{
                              padding: '6px 10px',
                              backgroundColor: 'var(--color-danger-light)',
                              color: 'var(--color-danger)',
                              borderRadius: 'var(--radius-sm)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)'
            }}>
              <div>
                Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</strong> of <strong>{filteredOrders.length}</strong> purchase orders
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: currentPage === 1 ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ChevronLeft size={16} />
                  Prev
                </button>

                <span style={{ padding: '0 8px', fontWeight: 600 }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: currentPage === totalPages ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Purchase Order Modal */}
      {createModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '720px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              backgroundColor: 'var(--color-bg-secondary)',
              zIndex: 10
            }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                Create New Purchase Order
              </h3>
              <button onClick={() => setCreateModalOpen(false)} style={{ color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateOrderSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  Supplier <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${formErrors.supplier ? 'var(--color-danger)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <option value="">Select Supplier...</option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>{sup.name} ({sup.contactPerson || 'No contact'})</option>
                  ))}
                </select>
                {formErrors.supplier && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>{formErrors.supplier}</span>
                )}
              </div>

              {/* Order Items List */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Order Line Items <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={14} />
                    Add Item Row
                  </button>
                </div>

                {formErrors.items && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginBottom: '10px' }}>
                    {formErrors.items}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {orderItems.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 40px',
                      gap: '10px',
                      alignItems: 'center',
                      backgroundColor: 'rgba(15, 23, 42, 0.4)',
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)'
                    }}>
                      <select
                        value={item.medicineId}
                        onChange={(e) => handleItemChange(idx, 'medicineId', e.target.value)}
                        required
                        style={{
                          padding: '8px 10px',
                          backgroundColor: 'rgba(15, 23, 42, 0.6)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        <option value="">Select Medicine...</option>
                        {medicines.map((med) => (
                          <option key={med.id} value={med.id}>{med.name} ({med.code})</option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        placeholder="Qty"
                        required
                        style={{
                          padding: '8px 10px',
                          backgroundColor: 'rgba(15, 23, 42, 0.6)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem'
                        }}
                      />

                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        placeholder="Unit Price ₹"
                        required
                        style={{
                          padding: '8px 10px',
                          backgroundColor: 'rgba(15, 23, 42, 0.6)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem'
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        disabled={orderItems.length === 1}
                        style={{
                          color: orderItems.length === 1 ? 'var(--color-text-muted)' : 'var(--color-danger)',
                          padding: '4px',
                          cursor: orderItems.length === 1 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div style={{
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                border: '1px solid rgba(14, 165, 233, 0.2)',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Total Estimated Amount:
                </span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--color-accent)' }}>
                  ₹{calculateOrderTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </strong>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    boxShadow: 'var(--shadow-glow)'
                  }}
                >
                  {isSubmitting ? 'Creating...' : 'Submit Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Details Modal */}
      {detailsModalOpen && selectedOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '640px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800 }}>
                  Order #{selectedOrder.orderNumber}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Created on {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleString() : 'N/A'} by {selectedOrder.createdByUsername || 'admin'}
                </span>
              </div>
              <button onClick={() => setDetailsModalOpen(false)} style={{ color: 'var(--color-text-muted)' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>SUPPLIER VENDOR</span>
                <strong style={{ fontSize: '0.95rem' }}>{selectedOrder.supplier?.name || 'N/A'}</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  {selectedOrder.supplier?.contactPerson ? `Contact: ${selectedOrder.supplier.contactPerson}` : ''}
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>FULFILLMENT STATUS</span>
                <div style={{ marginTop: '4px' }}>{renderStatusBadge(selectedOrder.status)}</div>
              </div>
            </div>

            {/* Items Table */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>Line Items Breakdown:</h4>
            <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: '10px 14px' }}>Medicine Name</th>
                    <th style={{ padding: '10px 14px' }}>Quantity</th>
                    <th style={{ padding: '10px 14px' }}>Unit Price</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>{item.medicineName || `Medicine #${item.medicineId}`}</td>
                        <td style={{ padding: '10px 14px' }}>{item.quantity} units</td>
                        <td style={{ padding: '10px 14px' }}>₹{Number(item.unitPrice || 0).toFixed(2)}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--color-accent)' }}>
                          ₹{Number(item.totalPrice || (item.quantity * item.unitPrice) || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No line items recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>Grand Total:</span>
              <strong style={{ fontSize: '1.3rem', color: 'var(--color-accent)' }}>
                ₹{Number(selectedOrder.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Update Order Status Modal */}
      {statusModalOpen && orderToUpdateStatus && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '440px',
            padding: '28px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
              Update Order Status
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Order: <strong>"{orderToUpdateStatus.orderNumber}"</strong>
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                Select Status State
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="RECEIVED">RECEIVED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setStatusModalOpen(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusUpdate}
                disabled={isUpdatingStatus}
                style={{
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}
              >
                {isUpdatingStatus ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-danger-light)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '440px',
            padding: '28px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-danger-light)',
              color: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <AlertCircle size={30} />
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              Delete Purchase Order?
            </h3>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Are you sure you want to delete Purchase Order <strong>"{orderToDelete?.orderNumber}"</strong>?
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-danger)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
