import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Categories = () => {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setFormError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (editingCategory) {
        // Update operation
        const response = await api.put(`/categories/${editingCategory.id}`, formData);
        if (response.data.success) {
          setCategories(prev => prev.map(c => c.id === editingCategory.id ? response.data.data : c));
          setModalOpen(false);
        } else {
          setFormError(response.data.message || 'Failed to update category');
        }
      } else {
        // Create operation
        const response = await api.post('/categories', formData);
        if (response.data.success) {
          setCategories(prev => [...prev, response.data.data]);
          setModalOpen(false);
        } else {
          setFormError(response.data.message || 'Failed to create category');
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error saving category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the category "${name}"? This operation cannot be undone.`)) {
      try {
        const response = await api.delete(`/categories/${id}`);
        if (response.data.success) {
          setCategories(prev => prev.filter(c => c.id !== id));
        } else {
          alert(response.data.message || 'Failed to delete category');
        }
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Error deleting category');
      }
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading categories...</div>;
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
            placeholder="Search categories by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      <div className="card">
        {filteredCategories.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>
            No categories found matching your query.
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  {isAdmin && <th style={{ width: '120px', textAlignment: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category, index) => (
                  <tr key={category.id}>
                    <td>#{index + 1}</td>
                    <td><strong style={{ color: 'white' }}>{category.name}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{category.description || 'No description provided'}</td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn-icon edit" 
                            onClick={() => openEditModal(category)}
                            title="Edit Category"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="btn-icon delete" 
                            onClick={() => handleDelete(category.id, category.name)}
                            title="Delete Category"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
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
          <div className="card modal-content">
            <div className="card-header-flex">
              <h3 style={{ fontFamily: 'Outfit, sans-serif' }}>
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button className="btn-icon" onClick={handleCloseModal}>
                <X size={16} />
              </button>
            </div>

            {formError && <div className="alert alert-danger">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Category Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Antibiotics, Analgesics"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe classification purposes, storage rules, or medical domains..."
                  rows="4"
                  disabled={submitting}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
