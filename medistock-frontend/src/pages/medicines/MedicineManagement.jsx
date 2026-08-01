import React, { useState, useEffect, useMemo } from 'react';
import { medicineApi } from '../../api/medicineApi';
import { categoryApi } from '../../api/categoryApi';
import { supplierApi } from '../../api/supplierApi';
import { Loader } from '../../components/common/Loader';
import { 
  Pill, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  Tag,
  Truck,
  Calendar,
  DollarSign
} from 'lucide-react';

export const MedicineManagement = () => {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Filters & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSupplier, setSelectedSupplier] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [currentMedicine, setCurrentMedicine] = useState({
    id: null,
    name: '',
    code: '',
    genericName: '',
    manufacturer: '',
    price: '',
    expiryDate: '',
    batchNumber: '',
    categoryId: '',
    supplierId: '',
    initialQuantity: 100,
    reorderLevel: 10,
    maxQuantity: 500,
    locationRack: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [medRes, catRes, supRes] = await Promise.all([
        medicineApi.getAll(),
        categoryApi.getAll().catch(() => ({ success: true, data: [] })),
        supplierApi.getAll().catch(() => ({ success: true, data: [] }))
      ]);

      if (medRes && medRes.success) {
        setMedicines(medRes.data || []);
      } else {
        setError(medRes?.message || 'Failed to fetch medicines list.');
      }

      setCategories(catRes?.data || []);
      setSuppliers(supRes?.data || []);
    } catch (err) {
      console.error('Fetch medicine data error:', err);
      setError(err.response?.data?.message || 'Failed to load medicines from backend server.');
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

  // Search & Multi-Filter Logic
  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || (
        (med.name && med.name.toLowerCase().includes(query)) ||
        (med.code && med.code.toLowerCase().includes(query)) ||
        (med.genericName && med.genericName.toLowerCase().includes(query)) ||
        (med.manufacturer && med.manufacturer.toLowerCase().includes(query)) ||
        (med.batchNumber && med.batchNumber.toLowerCase().includes(query))
      );

      const matchesCategory = selectedCategory === 'ALL' || (med.category && med.category.id === Number(selectedCategory));
      const matchesSupplier = selectedSupplier === 'ALL' || (med.supplier && med.supplier.id === Number(selectedSupplier));

      return matchesSearch && matchesCategory && matchesSupplier;
    });
  }, [medicines, searchQuery, selectedCategory, selectedSupplier]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage) || 1;
  const paginatedMedicines = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMedicines.slice(start, start + itemsPerPage);
  }, [filteredMedicines, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!currentMedicine.name.trim()) errors.name = 'Medicine name is required.';
    if (!currentMedicine.code.trim()) errors.code = 'Medicine code is required.';
    if (!currentMedicine.price || isNaN(currentMedicine.price) || Number(currentMedicine.price) <= 0) {
      errors.price = 'Price must be a valid positive number.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Modal Handlers
  const handleOpenAddModal = () => {
    setModalMode('add');
    setCurrentMedicine({
      id: null,
      name: '',
      code: `MED-${Math.floor(1000 + Math.random() * 9000)}`,
      genericName: '',
      manufacturer: '',
      price: '',
      expiryDate: '',
      batchNumber: `BATCH-${new Date().getFullYear()}`,
      categoryId: categories[0]?.id ? String(categories[0].id) : '',
      supplierId: suppliers[0]?.id ? String(suppliers[0].id) : '',
      initialQuantity: 100,
      reorderLevel: 15,
      maxQuantity: 500,
      locationRack: 'RACK-A1'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (med) => {
    setModalMode('edit');
    setCurrentMedicine({
      id: med.id,
      name: med.name || '',
      code: med.code || '',
      genericName: med.genericName || '',
      manufacturer: med.manufacturer || '',
      price: med.price || '',
      expiryDate: med.expiryDate || '',
      batchNumber: med.batchNumber || '',
      categoryId: med.category?.id ? String(med.category.id) : '',
      supplierId: med.supplier?.id ? String(med.supplier.id) : '',
      initialQuantity: med.currentStock || 0,
      reorderLevel: med.reorderLevel || 10,
      maxQuantity: 500,
      locationRack: 'RACK-A1'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormErrors({});
  };

  // Submit Handler (Create / Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: currentMedicine.name.trim(),
        code: currentMedicine.code.trim(),
        genericName: currentMedicine.genericName.trim() || null,
        manufacturer: currentMedicine.manufacturer.trim() || null,
        price: Number(currentMedicine.price),
        expiryDate: currentMedicine.expiryDate ? currentMedicine.expiryDate : null,
        batchNumber: currentMedicine.batchNumber.trim() || null,
        categoryId: currentMedicine.categoryId ? Number(currentMedicine.categoryId) : null,
        supplierId: currentMedicine.supplierId ? Number(currentMedicine.supplierId) : null,
        initialQuantity: Number(currentMedicine.initialQuantity || 0),
        reorderLevel: Number(currentMedicine.reorderLevel || 10),
        maxQuantity: Number(currentMedicine.maxQuantity || 500),
        locationRack: currentMedicine.locationRack.trim() || 'RACK-A1'
      };

      if (modalMode === 'add') {
        const response = await medicineApi.create(payload);
        if (response && response.success) {
          showNotification('Medicine created successfully!');
          handleCloseModal();
          fetchInitialData();
        } else {
          showNotification(response?.message || 'Failed to create medicine.', 'error');
        }
      } else {
        const response = await medicineApi.update(currentMedicine.id, payload);
        if (response && response.success) {
          showNotification('Medicine updated successfully!');
          handleCloseModal();
          fetchInitialData();
        } else {
          showNotification(response?.message || 'Failed to update medicine.', 'error');
        }
      }
    } catch (err) {
      console.error('Save medicine error:', err);
      const msg = err.response?.data?.message || 'Failed to save medicine record.';
      showNotification(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const handleOpenDeleteModal = (med) => {
    setMedicineToDelete(med);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!medicineToDelete) return;
    setIsDeleting(true);
    try {
      const response = await medicineApi.delete(medicineToDelete.id);
      if (response && response.success) {
        showNotification('Medicine deleted successfully!');
        setDeleteModalOpen(false);
        setMedicineToDelete(null);
        fetchInitialData();
      } else {
        showNotification(response?.message || 'Failed to delete medicine.', 'error');
      }
    } catch (err) {
      console.error('Delete medicine error:', err);
      const msg = err.response?.data?.message || 'Failed to delete medicine record.';
      showNotification(msg, 'error');
    } finally {
      setIsDeleting(false);
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
            <Pill size={28} style={{ color: 'var(--color-primary)' }} />
            Medicine Management
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Manage pharmaceutical catalog, pricing, batch tracking, and stock synchronization.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={fetchInitialData}
            title="Refresh List"
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
            onClick={handleOpenAddModal}
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
              boxShadow: 'var(--shadow-glow)',
              transition: 'var(--transition-fast)'
            }}
          >
            <Plus size={18} />
            Add New Medicine
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

      {/* Search, Filter, and Page Controls */}
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
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
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
            placeholder="Search by name, code, generic name, batch..."
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

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <Tag size={16} style={{ color: 'var(--color-text-muted)' }} />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
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
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Supplier Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <Truck size={16} style={{ color: 'var(--color-text-muted)' }} />
            <select
              value={selectedSupplier}
              onChange={(e) => {
                setSelectedSupplier(e.target.value);
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
              <option value="ALL">All Suppliers</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>{sup.name}</option>
              ))}
            </select>
          </div>

          {/* Page Size Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
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
                fontSize: '0.85rem'
              }}
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <Loader fullScreen={false} message="Loading medicines database..." />
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
                  <th style={{ padding: '16px 18px' }}>Medicine & Code</th>
                  <th style={{ padding: '16px 18px' }}>Generic & Mfr</th>
                  <th style={{ padding: '16px 18px' }}>Category</th>
                  <th style={{ padding: '16px 18px' }}>Supplier</th>
                  <th style={{ padding: '16px 18px' }}>Price</th>
                  <th style={{ padding: '16px 18px' }}>Expiry / Batch</th>
                  <th style={{ padding: '16px 18px' }}>Stock</th>
                  <th style={{ padding: '16px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMedicines.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No medicines found matching the active search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedMedicines.map((med) => (
                    <tr key={med.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '16px 18px' }}>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)', display: 'block' }}>
                          {med.name}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                          {med.code}
                        </span>
                      </td>

                      <td style={{ padding: '16px 18px', color: 'var(--color-text-secondary)' }}>
                        <div>{med.genericName || 'N/A'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {med.manufacturer || 'N/A'}
                        </div>
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        {med.category ? (
                          <span style={{
                            backgroundColor: 'rgba(14, 165, 233, 0.12)',
                            color: 'var(--color-primary)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 600,
                            fontSize: '0.8rem'
                          }}>
                            {med.category.name}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>Uncategorized</span>
                        )}
                      </td>

                      <td style={{ padding: '16px 18px', color: 'var(--color-text-secondary)' }}>
                        {med.supplier ? med.supplier.name : 'N/A'}
                      </td>

                      <td style={{ padding: '16px 18px', fontWeight: 700, color: 'var(--color-accent)' }}>
                        ₹{Number(med.price || 0).toFixed(2)}
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ color: med.expiryDate ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                          {med.expiryDate || 'No Expiry'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {med.batchNumber || 'No Batch'}
                        </div>
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <span style={{
                          fontWeight: 700,
                          color: (med.currentStock ?? 0) <= (med.reorderLevel ?? 10) ? 'var(--color-warning)' : 'var(--color-text-primary)'
                        }}>
                          {med.currentStock ?? 0} units
                        </span>
                      </td>

                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenEditModal(med)}
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
                          <button
                            onClick={() => handleOpenDeleteModal(med)}
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
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredMedicines.length > 0 && (
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
                Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredMedicines.length)}</strong> of <strong>{filteredMedicines.length}</strong> medicines
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

      {/* Add / Edit Medicine Modal */}
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
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {/* Modal Header */}
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
                {modalMode === 'add' ? 'Add New Medicine Record' : `Edit Medicine #${currentMedicine.id}`}
              </h3>
              <button onClick={handleCloseModal} style={{ color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Medicine Name <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={currentMedicine.name}
                    onChange={(e) => setCurrentMedicine({ ...currentMedicine, name: e.target.value })}
                    placeholder="e.g. Paracetamol 500mg"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${formErrors.name ? 'var(--color-danger)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  {formErrors.name && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>{formErrors.name}</span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Medicine Code <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={currentMedicine.code}
                    onChange={(e) => setCurrentMedicine({ ...currentMedicine, code: e.target.value })}
                    placeholder="e.g. MED-PCM-500"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${formErrors.code ? 'var(--color-danger)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  {formErrors.code && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>{formErrors.code}</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Generic Name
                  </label>
                  <input
                    type="text"
                    value={currentMedicine.genericName}
                    onChange={(e) => setCurrentMedicine({ ...currentMedicine, genericName: e.target.value })}
                    placeholder="e.g. Acetaminophen"
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
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={currentMedicine.manufacturer}
                    onChange={(e) => setCurrentMedicine({ ...currentMedicine, manufacturer: e.target.value })}
                    placeholder="e.g. Cipla / Sun Pharma"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Price (₹) <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentMedicine.price}
                    onChange={(e) => setCurrentMedicine({ ...currentMedicine, price: e.target.value })}
                    placeholder="25.50"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${formErrors.price ? 'var(--color-danger)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  {formErrors.price && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>{formErrors.price}</span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={currentMedicine.expiryDate}
                    onChange={(e) => setCurrentMedicine({ ...currentMedicine, expiryDate: e.target.value })}
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
                    Batch Number
                  </label>
                  <input
                    type="text"
                    value={currentMedicine.batchNumber}
                    onChange={(e) => setCurrentMedicine({ ...currentMedicine, batchNumber: e.target.value })}
                    placeholder="PCM2026A"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Category
                  </label>
                  <select
                    value={currentMedicine.categoryId}
                    onChange={(e) => setCurrentMedicine({ ...currentMedicine, categoryId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    <option value="">Select Category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Supplier
                  </label>
                  <select
                    value={currentMedicine.supplierId}
                    onChange={(e) => setCurrentMedicine({ ...currentMedicine, supplierId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    <option value="">Select Supplier...</option>
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>{sup.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
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
                  {isSubmitting ? 'Saving...' : modalMode === 'add' ? 'Save Medicine' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
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
              Delete Medicine Record?
            </h3>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Are you sure you want to delete <strong>"{medicineToDelete?.name}"</strong> ({medicineToDelete?.code})?
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
