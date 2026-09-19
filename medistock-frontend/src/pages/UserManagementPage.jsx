import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import {
  Users, Plus, Search, Edit, Trash2, Eye, Shield,
  UserCheck, UserX, Mail, Phone, Calendar, RefreshCcw
} from 'lucide-react';

const ROLE_MAP = {
  1: 'ADMIN',
  2: 'PHARMACIST',
  4: 'STAFF',
  5: 'SUPPLIER'
};

const ROLE_COLORS = {
  ADMIN: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' },
  PHARMACIST: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' },
  STAFF: { bg: 'rgba(100, 116, 139, 0.12)', color: '#64748b', border: '1px solid rgba(100, 116, 139, 0.3)' },
  SUPPLIER: { bg: 'rgba(20, 184, 166, 0.12)', color: '#14b8a6', border: '1px solid rgba(20, 184, 166, 0.3)' },
};

export const UserManagementPage = () => {
  const { user: currentUser } = useContext(AuthContext);
  const toast = useContext(ToastContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Create / Edit Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    roleId: 4,
    status: 'ACTIVE',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // View Details Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailUser, setDetailUser] = useState(null);

  // Delete Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTargetUser, setDeleteTargetUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [search, page, size]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/users', {
        params: { search: search || undefined, page, size, sortBy: 'createdAt', sortDir: 'DESC' }
      });
      const data = res.data?.data;
      if (data?.content) {
        setUsers(data.content);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateForm = () => {
    setSelectedUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      roleId: 4,
      status: 'ACTIVE',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditForm = (u) => {
    setSelectedUser(u);
    setFormData({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email || '',
      password: '',
      phone: u.phone || '',
      roleId: u.roleId || 4,
      status: u.status || 'ACTIVE',
    });
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (selectedUser) {
        // Update existing user
        await API.put(`/api/users/${selectedUser.id}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          status: formData.status,
          roleId: formData.roleId,
        });
        toast.success('User updated successfully!');
      } else {
        // Create new user
        if (!formData.email || !formData.password) {
          toast.error('Email and password are required for new users');
          setFormSubmitting(false);
          return;
        }
        await API.post('/api/users', {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || '0000000000',
          roleId: formData.roleId,
        });
        toast.success('User created successfully!');
      }
      setIsFormModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetUser) return;
    try {
      await API.delete(`/api/users/${deleteTargetUser.id}`);
      toast.success('User deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleBadge = (roleName) => {
    const style = ROLE_COLORS[roleName] || ROLE_COLORS.STAFF;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
        background: style.bg, color: style.color, border: style.border
      }}>
        <Shield size={12} />
        {roleName}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const isActive = status === 'ACTIVE';
    return (
      <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {isActive ? <UserCheck size={12} /> : <UserX size={12} />}
        {status || 'ACTIVE'}
      </span>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users color="#3b82f6" size={28} /> User Management & Role Control
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Manage system users, assign roles, and control access permissions</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchUsers} className="btn btn-secondary">
            <RefreshCcw size={16} /> Refresh
          </button>
          <button onClick={handleOpenCreateForm} className="btn btn-primary">
            <Plus size={16} /> Add New User
          </button>
        </div>
      </div>

      {/* Search Panel */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
        padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '16px',
        flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="input-field"
            style={{ paddingLeft: '42px' }}
          />
        </div>
        {search && (
          <button onClick={() => { setSearch(''); setPage(0); }} className="btn btn-secondary btn-sm">
            Clear Search
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No users found.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 800, fontSize: '14px', flexShrink: 0
                      }}>
                        {(u.firstName || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>
                          {u.firstName} {u.lastName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
                      <Mail size={14} color="#3b82f6" /> {u.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
                      <Phone size={14} color="#14b8a6" /> {u.phone || '—'}
                    </div>
                  </td>
                  <td>{getRoleBadge(u.roleName)}</td>
                  <td>{getStatusBadge(u.status)}</td>
                  <td style={{ color: '#94a3b8', fontSize: '13px' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => { setDetailUser(u); setIsDetailsModalOpen(true); }}
                        className="btn btn-secondary btn-sm" title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenEditForm(u)}
                        className="btn btn-secondary btn-sm" title="Edit User"
                      >
                        <Edit size={14} />
                      </button>
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => { setDeleteTargetUser(u); setIsDeleteDialogOpen(true); }}
                          className="btn btn-danger btn-sm" title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          pageSize={size}
          onPageSizeChange={(s) => { setSize(s); setPage(0); }}
        />
      </div>

      {/* Create / Edit User Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedUser ? `Edit User — ${selectedUser.firstName} ${selectedUser.lastName}` : 'Create New User'}
      >
        <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input-field"
                placeholder="John"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input-field"
                placeholder="Doe"
              />
            </div>
          </div>

          {!selectedUser && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="user@medistock.com"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="9876543210"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Assign Role *</label>
              <select
                value={formData.roleId}
                onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                className="input-field"
              >
                <option value={1}>Admin</option>
                <option value={2}>Pharmacist</option>
                <option value={4}>Staff</option>
                <option value={5}>Supplier</option>
              </select>
            </div>
          </div>

          {selectedUser && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={formSubmitting} className="btn btn-primary">
              {formSubmitting ? 'Saving...' : (selectedUser ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </Modal>

      {/* View User Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="User Profile Details">
        {detailUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: '22px', margin: '0 auto 10px'
              }}>
                {(detailUser.firstName || 'U')[0].toUpperCase()}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
                {detailUser.firstName} {detailUser.lastName}
              </div>
              <div style={{ marginTop: '6px' }}>{getRoleBadge(detailUser.roleName)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
              <div><strong>Email:</strong> {detailUser.email}</div>
              <div><strong>Phone:</strong> {detailUser.phone || '—'}</div>
              <div><strong>Status:</strong> {getStatusBadge(detailUser.status)}</div>
              <div><strong>User ID:</strong> #{detailUser.id}</div>
              <div><strong>Created:</strong> {detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleDateString() : '—'}</div>
              <div><strong>Updated:</strong> {detailUser.updatedAt ? new Date(detailUser.updatedAt).toLocaleDateString() : '—'}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete "${deleteTargetUser?.firstName} ${deleteTargetUser?.lastName}" (${deleteTargetUser?.email})? This action cannot be undone.`}
      />
    </div>
  );
};
