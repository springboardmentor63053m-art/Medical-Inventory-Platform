import React, { useState, useEffect, useMemo } from 'react';
import { inventoryApi } from '../../api/inventoryApi';
import { Loader } from '../../components/common/Loader';
import { 
  Boxes, 
  Search, 
  Edit, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  TrendingDown,
  PackageCheck,
  Layers,
  MapPin
} from 'lucide-react';

export const InventoryManagement = () => {
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Search, Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'LOW_STOCK' | 'NORMAL'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Edit Inventory Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInventory, setCurrentInventory] = useState({
    id: null,
    medicineId: null,
    medicineName: '',
    medicineCode: '',
    quantity: 0,
    reorderLevel: 10,
    maxQuantity: 100,
    locationRack: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stock Adjustment Delta Modal State
  const [deltaModalOpen, setDeltaModalOpen] = useState(false);
  const [selectedItemForDelta, setSelectedItemForDelta] = useState(null);
  const [deltaAmount, setDeltaAmount] = useState(10);
  const [deltaAction, setDeltaAction] = useState('ADD'); // 'ADD' | 'REMOVE'
  const [isAdjustingStock, setIsAdjustingStock] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.getAll();
      if (response && response.success) {
        setInventoryList(response.data || []);
      } else {
        setError(response?.message || 'Failed to fetch inventory.');
      }
    } catch (err) {
      console.error('Fetch inventory error:', err);
      setError(err.response?.data?.message || 'Failed to load inventory from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Search & Filter Logic
  const filteredInventory = useMemo(() => {
    return inventoryList.filter((item) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || (
        (item.medicineName && item.medicineName.toLowerCase().includes(query)) ||
        (item.medicineCode && item.medicineCode.toLowerCase().includes(query)) ||
        (item.locationRack && item.locationRack.toLowerCase().includes(query))
      );

      const isLow = item.lowStock || (item.quantity <= item.reorderLevel);
      const matchesFilter = 
        filterMode === 'ALL' ||
        (filterMode === 'LOW_STOCK' && isLow) ||
        (filterMode === 'NORMAL' && !isLow);

      return matchesSearch && matchesFilter;
    });
  }, [inventoryList, searchQuery, filterMode]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage) || 1;
  const paginatedInventory = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInventory.slice(start, start + itemsPerPage);
  }, [filteredInventory, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (item) => {
    setCurrentInventory({
      id: item.id,
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      medicineCode: item.medicineCode,
      quantity: item.quantity ?? 0,
      reorderLevel: item.reorderLevel ?? 10,
      maxQuantity: item.maxQuantity ?? 100,
      locationRack: item.locationRack || 'RACK-A1'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Validate Edit Form
  const validateForm = () => {
    const errors = {};
    if (currentInventory.quantity === '' || currentInventory.quantity < 0) {
      errors.quantity = 'Quantity cannot be negative.';
    }
    if (currentInventory.reorderLevel === '' || currentInventory.reorderLevel < 0) {
      errors.reorderLevel = 'Reorder level cannot be negative.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Edit Inventory Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        medicineId: currentInventory.medicineId,
        quantity: Number(currentInventory.quantity),
        reorderLevel: Number(currentInventory.reorderLevel),
        maxQuantity: Number(currentInventory.maxQuantity || 500),
        locationRack: currentInventory.locationRack.trim() || 'RACK-A1'
      };

      const response = await inventoryApi.update(currentInventory.id, payload);
      if (response && response.success) {
        showNotification(`Inventory for "${currentInventory.medicineName}" updated successfully!`);
        setIsModalOpen(false);
        fetchInventory();
      } else {
        showNotification(response?.message || 'Failed to update inventory record.', 'error');
      }
    } catch (err) {
      console.error('Update inventory error:', err);
      const msg = err.response?.data?.message || 'An error occurred while updating inventory.';
      showNotification(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Stock Delta Adjustment Handler
  const handleOpenDeltaModal = (item, action) => {
    setSelectedItemForDelta(item);
    setDeltaAction(action);
    setDeltaAmount(10);
    setDeltaModalOpen(true);
  };

  const handleConfirmDeltaAdjustment = async () => {
    if (!selectedItemForDelta) return;

    const actualDelta = deltaAction === 'ADD' ? Math.abs(Number(deltaAmount)) : -Math.abs(Number(deltaAmount));
    if (isNaN(actualDelta) || actualDelta === 0) return;

    setIsAdjustingStock(true);
    try {
      const response = await inventoryApi.updateStockDelta(selectedItemForDelta.medicineId, actualDelta);
      if (response && response.success) {
        showNotification(`Stock for "${selectedItemForDelta.medicineName}" updated by ${actualDelta > 0 ? '+' : ''}${actualDelta} units!`);
        setDeltaModalOpen(false);
        setSelectedItemForDelta(null);
        fetchInventory();
      } else {
        showNotification(response?.message || 'Failed to adjust stock quantity.', 'error');
      }
    } catch (err) {
      console.error('Stock delta adjustment error:', err);
      const msg = err.response?.data?.message || 'Failed to update stock delta.';
      showNotification(msg, 'error');
    } finally {
      setIsAdjustingStock(false);
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
            <Boxes size={28} style={{ color: 'var(--color-primary)' }} />
            Inventory Control & Stock Management
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Real-time stock quantity adjustments, reorder threshold highlights, and warehouse rack tracking.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.875rem'
          }}
        >
          <RefreshCw size={16} />
          Sync Stock Levels
        </button>
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

      {/* Controls: Search, Filter Tabs & Page Size */}
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
            placeholder="Search by medicine name, code, or rack location..."
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

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: 'All Inventory', value: 'ALL' },
            { label: 'Low Stock Only ⚠️', value: 'LOW_STOCK' },
            { label: 'In Stock OK', value: 'NORMAL' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setFilterMode(tab.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: filterMode === tab.value ? 'var(--color-primary)' : 'rgba(15, 23, 42, 0.6)',
                color: filterMode === tab.value ? '#ffffff' : 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
                transition: 'var(--transition-fast)'
              }}
            >
              {tab.label}
            </button>
          ))}

          {/* Page Size Select */}
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              fontSize: '0.85rem',
              color: 'var(--color-text-primary)'
            }}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>
      </div>

      {/* Main Inventory Table */}
      {loading ? (
        <Loader fullScreen={false} message="Loading stock inventory list..." />
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
            onClick={fetchInventory}
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
                  <th style={{ padding: '16px 18px' }}>Medicine Details</th>
                  <th style={{ padding: '16px 18px' }}>Rack Location</th>
                  <th style={{ padding: '16px 18px' }}>Current Stock</th>
                  <th style={{ padding: '16px 18px' }}>Reorder Threshold</th>
                  <th style={{ padding: '16px 18px' }}>Stock Health Status</th>
                  <th style={{ padding: '16px 18px', textAlign: 'right' }}>Quick Stock Delta</th>
                  <th style={{ padding: '16px 18px', textAlign: 'right' }}>Edit</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No inventory records match the selected filter query.
                    </td>
                  </tr>
                ) : (
                  paginatedInventory.map((item) => {
                    const isLow = item.lowStock || (item.quantity <= item.reorderLevel);
                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: '1px solid var(--color-border)',
                          backgroundColor: isLow ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                          borderLeft: isLow ? '4px solid var(--color-warning)' : '4px solid transparent'
                        }}
                      >
                        <td style={{ padding: '16px 18px' }}>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)', display: 'block' }}>
                            {item.medicineName || `Medicine #${item.medicineId}`}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                            {item.medicineCode || 'NO-CODE'}
                          </span>
                        </td>

                        <td style={{ padding: '16px 18px', color: 'var(--color-text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} style={{ color: 'var(--color-accent)' }} />
                            {item.locationRack || 'RACK-A1'}
                          </span>
                        </td>

                        <td style={{ padding: '16px 18px' }}>
                          <span style={{
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            color: isLow ? 'var(--color-warning)' : 'var(--color-accent)'
                          }}>
                            {item.quantity} units
                          </span>
                        </td>

                        <td style={{ padding: '16px 18px', color: 'var(--color-text-secondary)' }}>
                          Reorder at: <strong>{item.reorderLevel} units</strong>
                        </td>

                        <td style={{ padding: '16px 18px' }}>
                          {isLow ? (
                            <span style={{
                              backgroundColor: 'var(--color-warning-light)',
                              color: 'var(--color-warning)',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-sm)',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <TrendingDown size={14} />
                              LOW STOCK
                            </span>
                          ) : (
                            <span style={{
                              backgroundColor: 'var(--color-accent-light)',
                              color: 'var(--color-accent)',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-sm)',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <PackageCheck size={14} />
                              SUFFICIENT
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenDeltaModal(item, 'ADD')}
                              title="Add Stock (+)"
                              style={{
                                padding: '6px 10px',
                                backgroundColor: 'var(--color-accent-light)',
                                color: 'var(--color-accent)',
                                borderRadius: 'var(--radius-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 700
                              }}
                            >
                              <PlusCircle size={14} />
                              Add Stock
                            </button>
                            <button
                              onClick={() => handleOpenDeltaModal(item, 'REMOVE')}
                              title="Reduce Stock (-)"
                              style={{
                                padding: '6px 10px',
                                backgroundColor: 'var(--color-warning-light)',
                                color: 'var(--color-warning)',
                                borderRadius: 'var(--radius-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 700
                              }}
                            >
                              <MinusCircle size={14} />
                              Deduct
                            </button>
                          </div>
                        </td>

                        <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleOpenEditModal(item)}
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
                            <Edit size={14} />
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredInventory.length > 0 && (
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
                Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredInventory.length)}</strong> of <strong>{filteredInventory.length}</strong> inventory records
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

      {/* Edit Inventory Modal */}
      {isModalOpen && (
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
            maxWidth: '520px',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                Edit Inventory Details
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                  Medicine
                </label>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {currentInventory.medicineName} ({currentInventory.medicineCode})
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Current Stock Quantity <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentInventory.quantity}
                    onChange={(e) => setCurrentInventory({ ...currentInventory, quantity: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${formErrors.quantity ? 'var(--color-danger)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  {formErrors.quantity && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>{formErrors.quantity}</span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Reorder Level Threshold <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentInventory.reorderLevel}
                    onChange={(e) => setCurrentInventory({ ...currentInventory, reorderLevel: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${formErrors.reorderLevel ? 'var(--color-danger)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  {formErrors.reorderLevel && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>{formErrors.reorderLevel}</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Max Capacity Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentInventory.maxQuantity}
                    onChange={(e) => setCurrentInventory({ ...currentInventory, maxQuantity: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Warehouse Rack Location
                  </label>
                  <input
                    type="text"
                    value={currentInventory.locationRack}
                    onChange={(e) => setCurrentInventory({ ...currentInventory, locationRack: e.target.value })}
                    placeholder="e.g. RACK-A1"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  {isSubmitting ? 'Saving...' : 'Update Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Delta Adjustment Modal */}
      {deltaModalOpen && (
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
            maxWidth: '460px',
            padding: '28px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              {deltaAction === 'ADD' ? 'Add Stock Units' : 'Deduct Stock Units'}
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Medicine: <strong>"{selectedItemForDelta?.medicineName}"</strong> (Current: {selectedItemForDelta?.quantity} units)
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                Quantity Delta Amount
              </label>
              <input
                type="number"
                min="1"
                value={deltaAmount}
                onChange={(e) => setDeltaAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setDeltaModalOpen(false)}
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
                onClick={handleConfirmDeltaAdjustment}
                disabled={isAdjustingStock}
                style={{
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: deltaAction === 'ADD' ? 'var(--color-accent)' : 'var(--color-warning)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}
              >
                {isAdjustingStock ? 'Applying...' : deltaAction === 'ADD' ? '+ Add Stock' : '- Deduct Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
