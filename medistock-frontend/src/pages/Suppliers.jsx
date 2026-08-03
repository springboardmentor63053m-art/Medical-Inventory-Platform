import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Plus, Edit2, Trash2, Search, X, Mail, Phone, MapPin, User } from 'lucide-react';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      if (response.data.success) {
        setSuppliers(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch suppliers list');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error fetching suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const openCreateModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Supplier Name is a required field.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (editingSupplier) {
        const response = await api.put(`/suppliers/${editingSupplier.id}`, formData);
        if (response.data.success) {
          setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? response.data.data : s));
          setModalOpen(false);
        } else {
          setFormError(response.data.message || 'Failed to update supplier details');
        }
      } else {
        const response = await api.post('/suppliers', formData);
        if (response.data.success) {
          setSuppliers(prev => [...prev, response.data.data]);
          setModalOpen(false);
        } else {
          setFormError(response.data.message || 'Failed to create supplier entry');
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error saving supplier details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete supplier "${name}" from the system database?`)) {
      try {
        const response = await api.delete(`/suppliers/${id}`);
        if (response.data.success) {
          setSuppliers(prev => prev.filter(s => s.id !== id));
        } else {
          alert(response.data.message || 'Deletion failed');
        }
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Error occurred during deletion');
      }
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.contactPerson && s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading suppliers database...</div>;
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
            placeholder="Search suppliers by name, representative, or contact email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} />
          <span>Add Supplier</span>
        </button>
      </div>

      <div className="card">
        {filteredSuppliers.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>
            No registered suppliers found matching your query.
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th>Supplier / Rep</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>#{supplier.id}</td>
                    <td>
                      <strong style={{ color: 'white' }}>{supplier.name}</strong>
                      {supplier.contactPerson && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <User size={12} /> {supplier.contactPerson}
                        </div>
                      )}
                    </td>
                    <td>
                      {supplier.email ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={12} style={{ color: 'var(--primary)' }} />
                          {supplier.email}
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td>
                      {supplier.phone ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={12} style={{ color: 'var(--success)' }} />
                          {supplier.phone}
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td>
                      {supplier.address ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <MapPin size={12} />
                          {supplier.address}
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-icon edit" 
                          onClick={() => openEditModal(supplier)}
                          title="Edit Supplier Details"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="btn-icon delete" 
                          onClick={() => handleDelete(supplier.id, supplier.name)}
                          title="Remove Supplier"
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

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="card modal-content" style={{ maxWidth: '600px' }}>
            <div className="card-header-flex">
              <h3 style={{ fontFamily: 'Outfit, sans-serif' }}>
                {editingSupplier ? 'Edit Supplier Profile' : 'Register New Supplier'}
              </h3>
              <button className="btn-icon" onClick={() => setModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {formError && <div className="alert alert-danger">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Supplier Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Acme Pharmaceuticals"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contactPerson">Representative Person</label>
                  <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. contact@acme.com"
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
                    placeholder="e.g. +1-555-0199"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Postal Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g. 100 Pharma Way, Suite 400..."
                  rows="3"
                  disabled={submitting}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
