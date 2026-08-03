import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Plus, Edit2, Trash2, Search, X, Shield, ToggleLeft, ToggleRight } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    active: true,
    roles: []
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Hardcoded standard roles for admin selection checkbox options
  const roleOptions = [
    { value: 'ROLE_ADMIN', label: 'Admin' },
    { value: 'ROLE_PHARMACIST', label: 'Pharmacist' },
    { value: 'ROLE_DOCTOR', label: 'Doctor' },
    { value: 'ROLE_SUPPLIER', label: 'Supplier' },
    { value: 'ROLE_USER', label: 'User Standard' }
  ];

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch users catalog');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error loading users catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      phone: '',
      active: true,
      roles: ['ROLE_USER']
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Leave blank to avoid re-writing password unless updated
      fullName: user.fullName || '',
      phone: user.phone || '',
      active: user.active,
      roles: Array.from(user.roles || [])
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalVal = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: finalVal }));
  };

  const handleRoleToggle = (role) => {
    setFormData(prev => {
      const currentRoles = prev.roles;
      if (currentRoles.includes(role)) {
        return { ...prev, roles: currentRoles.filter(r => r !== role) };
      } else {
        return { ...prev, roles: [...currentRoles, role] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim()) {
      setFormError('Username and Email are required.');
      return;
    }

    if (!editingUser && !formData.password) {
      setFormError('Password is required for new user creation.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    const payload = {
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName,
      phone: formData.phone,
      active: formData.active,
      roles: formData.roles
    };

    // Only inject password if provided
    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      if (editingUser) {
        const response = await api.put(`/users/${editingUser.id}`, payload);
        if (response.data.success) {
          setUsers(prev => prev.map(u => u.id === editingUser.id ? response.data.data : u));
          setModalOpen(false);
        } else {
          setFormError(response.data.message || 'Failed to update user');
        }
      } else {
        const response = await api.post('/users', payload);
        if (response.data.success) {
          setUsers(prev => [...prev, response.data.data]);
          setModalOpen(false);
        } else {
          setFormError(response.data.message || 'Failed to create user');
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error processing request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (window.confirm(`Are you sure you want to permanently delete user account "${username}"?`)) {
      try {
        const response = await api.delete(`/users/${id}`);
        if (response.data.success) {
          setUsers(prev => prev.filter(u => u.id !== id));
        } else {
          alert(response.data.message || 'Failed to delete user');
        }
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Error deleting user');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.fullName && u.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading user directory...</div>;
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
            placeholder="Search accounts by username, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} />
          <span>New User Account</span>
        </button>
      </div>

      <div className="card">
        {filteredUsers.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>
            No accounts found.
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Assigned Roles</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td><strong style={{ color: 'white' }}>{item.username}</strong></td>
                    <td style={{ color: 'var(--text-main)' }}>{item.fullName || 'N/A'}</td>
                    <td>{item.email}</td>
                    <td>
                      <span className={`badge ${item.active ? 'badge-success' : 'badge-danger'}`}>
                        {item.active ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {Array.from(item.roles || []).map(role => (
                          <span key={role} className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                            {role.replace('ROLE_', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-icon edit" 
                          onClick={() => openEditModal(item)}
                          title="Edit Account Details"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="btn-icon delete" 
                          onClick={() => handleDelete(item.id, item.username)}
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="card modal-content" style={{ maxWidth: '640px' }}>
            <div className="card-header-flex">
              <h3 style={{ fontFamily: 'Outfit, sans-serif' }}>
                {editingUser ? 'Edit User Credentials' : 'Create User Account'}
              </h3>
              <button className="btn-icon" onClick={() => setModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {formError && <div className="alert alert-danger">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">Username *</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter login username"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter contact email"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +1-555-0100"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">
                    {editingUser ? 'Change Password (Leave blank to keep current)' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required={!editingUser}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group" style={{ justifyContent: 'center' }}>
                  <label htmlFor="active" className="checkbox-label" style={{ marginTop: '24px' }}>
                    <input
                      type="checkbox"
                      id="active"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                    <span>Account Active</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={16} /> Assign Security Roles (Select all that apply)
                </label>
                <div className="checkbox-group" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {roleOptions.map((opt) => (
                    <label key={opt.value} className="checkbox-label" style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(opt.value)}
                        onChange={() => handleRoleToggle(opt.value)}
                        disabled={submitting}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
