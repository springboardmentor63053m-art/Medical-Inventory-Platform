import React, { useState, useEffect, useMemo } from 'react';
import { userApi } from '../../api/userApi';
import { Loader } from '../../components/common/Loader';
import { 
  Users, 
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
  Shield,
  Mail,
  Phone,
  User as UserIcon,
  Check,
  Ban
} from 'lucide-react';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentUser, setCurrentUser] = useState({
    id: null,
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    active: true,
    role: 'ROLE_PHARMACIST'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userApi.getAll();
      if (response && response.success) {
        setUsers(response.data || []);
      } else {
        setError(response?.message || 'Failed to fetch users list.');
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err.response?.data?.message || 'Failed to load user accounts from backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Search Filtering
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase().trim();
    return users.filter(
      (u) =>
        (u.username && u.username.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.fullName && u.fullName.toLowerCase().includes(query)) ||
        (u.phone && u.phone.toLowerCase().includes(query))
    );
  }, [users, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!currentUser.username.trim()) errors.username = 'Username is required.';
    if (!currentUser.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentUser.email)) {
      errors.email = 'Invalid email format.';
    }
    if (modalMode === 'add' && !currentUser.password) {
      errors.password = 'Password is required for new accounts.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Modal Handlers
  const handleOpenAddModal = () => {
    setModalMode('add');
    setCurrentUser({
      id: null,
      username: '',
      email: '',
      password: '',
      fullName: '',
      phone: '',
      active: true,
      role: 'ROLE_PHARMACIST'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u) => {
    setModalMode('edit');
    const primaryRole = u.roles && u.roles.length > 0 ? (Array.isArray(u.roles) ? u.roles[0] : Array.from(u.roles)[0]) : 'ROLE_PHARMACIST';
    setCurrentUser({
      id: u.id,
      username: u.username || '',
      email: u.email || '',
      password: '',
      fullName: u.fullName || '',
      phone: u.phone || '',
      active: u.active ?? true,
      role: primaryRole
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormErrors({});
  };

  // Submit Handler
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        username: currentUser.username.trim(),
        email: currentUser.email.trim(),
        fullName: currentUser.fullName.trim() || null,
        phone: currentUser.phone.trim() || null,
        active: currentUser.active,
        roles: [currentUser.role]
      };
      if (currentUser.password) {
        payload.password = currentUser.password;
      }

      if (modalMode === 'add') {
        const response = await userApi.create(payload);
        if (response && response.success) {
          showNotification('User account created successfully!');
          handleCloseModal();
          fetchUsers();
        } else {
          showNotification(response?.message || 'Failed to create user.', 'error');
        }
      } else {
        const response = await userApi.update(currentUser.id, payload);
        if (response && response.success) {
          showNotification('User account updated successfully!');
          handleCloseModal();
          fetchUsers();
        } else {
          showNotification(response?.message || 'Failed to update user.', 'error');
        }
      }
    } catch (err) {
      console.error('Save user error:', err);
      const msg = err.response?.data?.message || 'An error occurred while saving user account.';
      showNotification(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const handleOpenDeleteModal = (u) => {
    setUserToDelete(u);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const response = await userApi.delete(userToDelete.id);
      if (response && response.success) {
        showNotification(`User "${userToDelete.username}" deleted successfully!`);
        setDeleteModalOpen(false);
        setUserToDelete(null);
        fetchUsers();
      } else {
        showNotification(response?.message || 'Failed to delete user account.', 'error');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      const msg = err.response?.data?.message || 'Failed to delete user account.';
      showNotification(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={28} style={{ color: 'var(--color-primary)' }} />
            User Account Management
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            System user accounts, credentials, authority roles (`ROLE_ADMIN`, `ROLE_PHARMACIST`), and access control.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={fetchUsers}
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
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <Plus size={18} />
            Add New User
          </button>
        </div>
      </div>

      {/* Toast Notification */}
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

      {/* Controls Bar */}
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
        {/* Search */}
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
            placeholder="Search users by username, email, full name, or phone..."
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

        {/* Page size */}
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
        <Loader fullScreen={false} message="Loading user accounts..." />
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
            onClick={fetchUsers}
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
                  <th style={{ padding: '16px 20px' }}>User & Username</th>
                  <th style={{ padding: '16px 20px' }}>Full Name</th>
                  <th style={{ padding: '16px 20px' }}>Contact Info</th>
                  <th style={{ padding: '16px 20px' }}>Assigned Roles</th>
                  <th style={{ padding: '16px 20px' }}>Account Status</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No user accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => {
                    const rolesArr = Array.isArray(u.roles) ? u.roles : Array.from(u.roles || []);
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)', display: 'block' }}>
                            {u.username}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            ID: #{u.id}
                          </span>
                        </td>

                        <td style={{ padding: '16px 20px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                          {u.fullName || 'N/A'}
                        </td>

                        <td style={{ padding: '16px 20px', color: 'var(--color-text-secondary)' }}>
                          <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={12} style={{ color: 'var(--color-text-muted)' }} />
                            {u.email}
                          </div>
                          {u.phone && (
                            <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <Phone size={12} style={{ color: 'var(--color-text-muted)' }} />
                              {u.phone}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {rolesArr.map((r, idx) => (
                              <span key={idx} style={{
                                backgroundColor: r === 'ROLE_ADMIN' ? 'var(--color-primary-light)' : 'var(--color-accent-light)',
                                color: r === 'ROLE_ADMIN' ? 'var(--color-primary)' : 'var(--color-accent)',
                                padding: '3px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontWeight: 700,
                                fontSize: '0.75rem'
                              }}>
                                {r.replace('ROLE_', '')}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          {u.active ? (
                            <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={14} /> Active
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-danger)', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Ban size={14} /> Disabled
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenEditModal(u)}
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
                              onClick={() => handleOpenDeleteModal(u)}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
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
                Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</strong> of <strong>{filteredUsers.length}</strong> users
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

      {/* Add / Edit Modal */}
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
            maxWidth: '540px',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                {modalMode === 'add' ? 'Create User Account' : `Edit User #${currentUser.id}`}
              </h3>
              <button onClick={handleCloseModal} style={{ color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Username <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={currentUser.username}
                    onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
                    placeholder="e.g. rahul"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${formErrors.username ? 'var(--color-danger)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Email Address <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={currentUser.email}
                    onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                    placeholder="e.g. rahul@gmail.com"
                    required
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
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  Password {modalMode === 'edit' && '(Leave blank to keep unchanged)'}
                </label>
                <input
                  type="password"
                  value={currentUser.password}
                  onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                  placeholder="••••••••"
                  required={modalMode === 'add'}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${formErrors.password ? 'var(--color-danger)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={currentUser.fullName}
                    onChange={(e) => setCurrentUser({ ...currentUser, fullName: e.target.value })}
                    placeholder="Rahul Kumar"
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
                    value={currentUser.phone}
                    onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                    placeholder="9876543210"
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
                    Role Authority
                  </label>
                  <select
                    value={currentUser.role}
                    onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
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
                    <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                    <option value="ROLE_PHARMACIST">ROLE_PHARMACIST</option>
                    <option value="ROLE_STAFF">ROLE_STAFF</option>
                    <option value="ROLE_DOCTOR">ROLE_DOCTOR</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input
                      type="checkbox"
                      checked={currentUser.active}
                      onChange={(e) => setCurrentUser({ ...currentUser, active: e.target.checked })}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    Account Active Status
                  </label>
                </div>
              </div>

              {/* Actions */}
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
                  {isSubmitting ? 'Saving...' : modalMode === 'add' ? 'Create Account' : 'Update Account'}
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
              Delete User Account?
            </h3>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Are you sure you want to delete user account <strong>"{userToDelete?.username}"</strong>?
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
