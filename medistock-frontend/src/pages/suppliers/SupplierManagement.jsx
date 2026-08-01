import React, { useState, useEffect, useMemo } from 'react';
import { supplierApi } from '../../api/supplierApi';
import { Loader } from '../../components/common/Loader';
import { 
  Truck, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

export const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [currentSupplier, setCurrentSupplier] = useState({
    id: null,
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await supplierApi.getAll();
      if (response && response.success) {
        setSuppliers(response.data || []);
      } else {
        setError(response?.message || 'Failed to fetch suppliers list.');
      }
    } catch (err) {
      console.error('Fetch suppliers error:', err);
      setError(err.response?.data?.message || 'Failed to load suppliers from backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Search Filter
  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return suppliers;
    const query = searchQuery.toLowerCase().trim();
    return suppliers.filter(
      (sup) =>
        (sup.name && sup.name.toLowerCase().includes(query)) ||
        (sup.contactPerson && sup.contactPerson.toLowerCase().includes(query)) ||
        (sup.email && sup.email.toLowerCase().includes(query)) ||
        (sup.phone && sup.phone.toLowerCase().includes(query)) ||
        (sup.address && sup.address.toLowerCase().includes(query))
    );
  }, [suppliers, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage) || 1;
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSuppliers.slice(start, start + itemsPerPage);
  }, [filteredSuppliers, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!currentSupplier.name.trim()) {
      errors.name = 'Supplier name is required.';
    }
    if (currentSupplier.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentSupplier.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Modal Handlers
  const handleOpenAddModal = () => {
    setModalMode('add');
    setCurrentSupplier({
      id: null,
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sup) => {
    setModalMode('edit');
    setCurrentSupplier({
      id: sup.id,
      name: sup.name || '',
      contactPerson: sup.contactPerson || '',
      email: sup.email || '',
      phone: sup.phone || '',
      address: sup.address || ''
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
        name: currentSupplier.name.trim(),
        contactPerson: currentSupplier.contactPerson.trim() || null,
        email: currentSupplier.email.trim() || null,
        phone: currentSupplier.phone.trim() || null,
        address: currentSupplier.address.trim() || null
      };

      if (modalMode === 'add') {
        const response = await supplierApi.create(payload);
        if (response && response.success) {
          showNotification('Supplier created successfully!');
          handleCloseModal();
          fetchSuppliers();
        } else {
          showNotification(response?.message || 'Failed to create supplier.', 'error');
        }
      } else {
        const response = await supplierApi.update(currentSupplier.id, payload);
        if (response && response.success) {
          showNotification('Supplier updated successfully!');
          handleCloseModal();
          fetchSuppliers();
        } else {
          showNotification(response?.message || 'Failed to update supplier.', 'error');
        }
      }
    } catch (err) {
      console.error('Save supplier error:', err);
      const msg = err.response?.data?.message || 'An error occurred while saving supplier.';
      showNotification(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const handleOpenDeleteModal = (sup) => {
    setSupplierToDelete(sup);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;
    setIsDeleting(true);
    try {
      const response = await supplierApi.delete(supplierToDelete.id);
      if (response && response.success) {
        showNotification('Supplier deleted successfully!');
        setDeleteModalOpen(false);
        setSupplierToDelete(null);
        fetchSuppliers();
      } else {
        showNotification(response?.message || 'Failed to delete supplier.', 'error');
      }
    } catch (err) {
      console.error('Delete supplier error:', err);
      const msg = err.response?.data?.message || 'Failed to delete supplier.';
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
            <Truck size={28} style={{ color: 'var(--color-primary)' }} />
            Supplier Management
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Manage pharmaceutical vendors, contact details, and procurement partners.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={fetchSuppliers}
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
            Add New Supplier
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

      {/* Search & Pagination Control */}
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
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
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
            placeholder="Search by supplier name, contact person, email, phone..."
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

        {/* Page Size Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          <span>Show per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              fontSize: '0.85rem'
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <Loader fullScreen={false} message="Loading suppliers directory..." />
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
            onClick={fetchSuppliers}
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
                  <th style={{ padding: '16px 20px', width: '80px' }}>ID</th>
                  <th style={{ padding: '16px 20px' }}>Supplier Company</th>
                  <th style={{ padding: '16px 20px' }}>Contact Person</th>
                  <th style={{ padding: '16px 20px' }}>Email & Phone</th>
                  <th style={{ padding: '16px 20px' }}>Address</th>
                  <th style={{ padding: '16px 20px', width: '140px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No suppliers found matching your query.
                    </td>
                  </tr>
                ) : (
                  paginatedSuppliers.map((sup) => (
                    <tr key={sup.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        #{sup.id}
                      </td>

                      <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {sup.name}
                      </td>

                      <td style={{ padding: '16px 20px', color: 'var(--color-text-secondary)' }}>
                        {sup.contactPerson ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={14} style={{ color: 'var(--color-primary)' }} />
                            {sup.contactPerson}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>N/A</span>
                        )}
                      </td>

                      <td style={{ padding: '16px 20px', color: 'var(--color-text-secondary)' }}>
                        {sup.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                            <Mail size={12} style={{ color: 'var(--color-text-muted)' }} />
                            {sup.email}
                          </div>
                        )}
                        {sup.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', marginTop: '2px' }}>
                            <Phone size={12} style={{ color: 'var(--color-text-muted)' }} />
                            {sup.phone}
                          </div>
                        )}
                        {!sup.email && !sup.phone && <span style={{ color: 'var(--color-text-muted)' }}>N/A</span>}
                      </td>

                      <td style={{ padding: '16px 20px', color: 'var(--color-text-secondary)' }}>
                        {sup.address ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} style={{ color: 'var(--color-accent)' }} />
                            {sup.address}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>N/A</span>
                        )}
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenEditModal(sup)}
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
                            onClick={() => handleOpenDeleteModal(sup)}
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

          {/* Pagination */}
          {filteredSuppliers.length > 0 && (
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
                Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredSuppliers.length)}</strong> of <strong>{filteredSuppliers.length}</strong> suppliers
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

      {/* Add / Edit Supplier Modal */}
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
            maxWidth: '560px',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                {modalMode === 'add' ? 'Create Supplier Record' : `Edit Supplier #${currentSupplier.id}`}
              </h3>
              <button onClick={handleCloseModal} style={{ color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  Supplier / Company Name <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={currentSupplier.name}
                  onChange={(e) => setCurrentSupplier({ ...currentSupplier, name: e.target.value })}
                  placeholder="e.g. Apollo Pharma Distributors"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={currentSupplier.contactPerson}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, contactPerson: e.target.value })}
                    placeholder="e.g. Dr. Ramesh"
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
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={currentSupplier.phone}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
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

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={currentSupplier.email}
                  onChange={(e) => setCurrentSupplier({ ...currentSupplier, email: e.target.value })}
                  placeholder="e.g. apollo@gmail.com"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${formErrors.email ? 'var(--color-danger)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                {formErrors.email && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>{formErrors.email}</span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  Office Address
                </label>
                <textarea
                  rows={3}
                  value={currentSupplier.address}
                  onChange={(e) => setCurrentSupplier({ ...currentSupplier, address: e.target.value })}
                  placeholder="e.g. Hyderabad Main Branch, Sector 4..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
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
                  {isSubmitting ? 'Saving...' : modalMode === 'add' ? 'Save Supplier' : 'Update Record'}
                </button>
              </div>
            </form>
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
              Delete Supplier Record?
            </h3>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Are you sure you want to delete <strong>"{supplierToDelete?.name}"</strong>?
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
