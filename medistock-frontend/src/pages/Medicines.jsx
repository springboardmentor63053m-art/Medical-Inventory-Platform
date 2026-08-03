import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Search, X, Filter } from 'lucide-react';

const Medicines = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    genericName: '',
    manufacturer: '',
    price: '',
    expiryDate: '',
    batchNumber: '',
    categoryId: '',
    supplierId: '',
    initialQuantity: 0,
    reorderLevel: 10,
    maxQuantity: 100,
    locationRack: ''
  });
  
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Permission Checks: ADMIN and PHARMACIST can modify
  const canModify = user?.roles?.some(role => ['ROLE_ADMIN', 'ROLE_PHARMACIST'].includes(role));

  const fetchData = async () => {
    try {
      setLoading(true);
      const [medRes, catRes, supRes] = await Promise.all([
        api.get('/medicines'),
        api.get('/categories'),
        api.get('/suppliers')
      ]);

      if (medRes.data.success) setMedicines(medRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
      if (supRes.data.success) setSuppliers(supRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error loading medicines catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingMedicine(null);
    setFormData({
      name: '',
      code: '',
      genericName: '',
      manufacturer: '',
      price: '',
      expiryDate: '',
      batchNumber: '',
      categoryId: categories[0]?.id || '',
      supplierId: suppliers[0]?.id || '',
      initialQuantity: 0,
      reorderLevel: 10,
      maxQuantity: 100,
      locationRack: ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      code: medicine.code,
      genericName: medicine.genericName || '',
      manufacturer: medicine.manufacturer || '',
      price: medicine.price.toString(),
      expiryDate: medicine.expiryDate || '',
      batchNumber: medicine.batchNumber || '',
      categoryId: medicine.category?.id || '',
      supplierId: medicine.supplier?.id || '',
      initialQuantity: medicine.currentStock || 0,
      reorderLevel: medicine.reorderLevel || 10,
      maxQuantity: 100, // standard default
      locationRack: '' // updated via inventory
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      // Reload all
      const res = await api.get('/medicines');
      if (res.data.success) setMedicines(res.data.data);
      return;
    }
    try {
      const response = await api.get('/medicines/search', { params: { query } });
      if (response.data.success) {
        setMedicines(response.data.data);
      }
    } catch (err) {
      console.error('Search error', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || !formData.price) {
      setFormError('Name, Code, and Price are required fields.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      supplierId: formData.supplierId ? parseInt(formData.supplierId) : null,
      initialQuantity: parseInt(formData.initialQuantity) || 0,
      reorderLevel: parseInt(formData.reorderLevel) || 0,
      maxQuantity: parseInt(formData.maxQuantity) || 100
    };

    try {
      if (editingMedicine) {
        const response = await api.put(`/medicines/${editingMedicine.id}`, payload);
        if (response.data.success) {
          setMedicines(prev => prev.map(m => m.id === editingMedicine.id ? response.data.data : m));
          setModalOpen(false);
        } else {
          setFormError(response.data.message || 'Failed to update medicine');
        }
      } else {
        const response = await api.post('/medicines', payload);
        if (response.data.success) {
          setMedicines(prev => [...prev, response.data.data]);
          setModalOpen(false);
        } else {
          setFormError(response.data.message || 'Failed to create medicine');
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error saving medicine details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the inventory database?`)) {
      try {
        const response = await api.delete(`/medicines/${id}`);
        if (response.data.success) {
          setMedicines(prev => prev.filter(m => m.id !== id));
        } else {
          alert(response.data.message || 'Deletion failed');
        }
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Error occurred during deletion');
      }
    }
  };

  const filteredMedicines = medicines.filter(m => {
    const matchesCategory = selectedCategory === '' || m.category?.id?.toString() === selectedCategory;
    return matchesCategory;
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading catalog...</div>;
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
            placeholder="Search medicines by code, brand name, or generic formula..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: '180px', height: '42px' }}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {canModify && (
            <button className="btn btn-primary" onClick={openCreateModal} style={{ height: '42px' }}>
              <Plus size={16} />
              <span>Add Medicine</span>
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {filteredMedicines.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>
            No medicines listed.
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Brand Name</th>
                  <th>Generic Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Expiry Date</th>
                  {canModify && <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((med) => {
                  const isLow = med.currentStock <= med.reorderLevel;
                  return (
                    <tr key={med.id}>
                      <td><span className="badge badge-info">{med.code}</span></td>
                      <td>
                        <strong style={{ color: 'white' }}>{med.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{med.manufacturer}</div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{med.genericName || 'N/A'}</td>
                      <td>{med.category?.name || 'Unassigned'}</td>
                      <td><strong>{formatCurrency(med.price)}</strong></td>
                      <td>
                        <span className={`badge ${isLow ? 'badge-danger pulse-red' : 'badge-success'}`}>
                          {med.currentStock || 0} unit(s)
                        </span>
                      </td>
                      <td>{med.expiryDate || 'N/A'}</td>
                      {canModify && (
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn-icon edit" 
                              onClick={() => openEditModal(med)}
                              title="Edit Details"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              className="btn-icon delete" 
                              onClick={() => handleDelete(med.id, med.name)}
                              title="Remove Medicine"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Medicine Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="card modal-content" style={{ maxWidth: '640px' }}>
            <div className="card-header-flex">
              <h3 style={{ fontFamily: 'Outfit, sans-serif' }}>
                {editingMedicine ? 'Edit Medicine Details' : 'Add New Medicine'}
              </h3>
              <button className="btn-icon" onClick={() => setModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {formError && <div className="alert alert-danger">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Brand Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Paracetamol, Amoxicillin"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="code">Unique Code *</label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g. MED-0012"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="genericName">Generic/Chemical Name</label>
                  <input
                    type="text"
                    id="genericName"
                    name="genericName"
                    value={formData.genericName}
                    onChange={handleInputChange}
                    placeholder="e.g. Acetaminophen"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="manufacturer">Manufacturer</label>
                  <input
                    type="text"
                    id="manufacturer"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    placeholder="e.g. Pfizer, GSK"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Unit Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date</label>
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="batchNumber">Batch Number</label>
                  <input
                    type="text"
                    id="batchNumber"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. BATCH-A99"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="categoryId">Category Classification</label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    disabled={submitting}
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="supplierId">Default Supplier</label>
                  <select
                    id="supplierId"
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleInputChange}
                    disabled={submitting}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="locationRack">Storage Location (Rack)</label>
                  <input
                    type="text"
                    id="locationRack"
                    name="locationRack"
                    value={formData.locationRack}
                    onChange={handleInputChange}
                    placeholder="e.g. Rack-B4"
                    disabled={submitting}
                  />
                </div>
              </div>

              {!editingMedicine && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="initialQuantity">Initial Quantity</label>
                    <input
                      type="number"
                      id="initialQuantity"
                      name="initialQuantity"
                      value={formData.initialQuantity}
                      onChange={handleInputChange}
                      min="0"
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reorderLevel">Reorder Warning Level</label>
                    <input
                      type="number"
                      id="reorderLevel"
                      name="reorderLevel"
                      value={formData.reorderLevel}
                      onChange={handleInputChange}
                      min="0"
                      disabled={submitting}
                    />
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicines;
