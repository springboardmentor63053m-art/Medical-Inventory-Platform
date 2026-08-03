import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Search, Edit2, ShieldAlert, Sliders, RefreshCw, X } from 'lucide-react';

const Inventory = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states for full update
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    quantity: '',
    reorderLevel: '',
    maxQuantity: '',
    locationRack: ''
  });

  // Modal states for delta stock adjustment
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustData, setAdjustData] = useState({
    delta: '',
    type: 'add' // 'add' or 'subtract'
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Only ADMIN and PHARMACIST can edit/adjust inventory
  const canModify = user?.roles?.some(role => ['ROLE_ADMIN', 'ROLE_PHARMACIST'].includes(role));

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const endpoint = showLowStockOnly ? '/inventory/low-stock' : '/inventory';
      const response = await api.get(endpoint);
      if (response.data.success) {
        setInventory(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch inventory');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error loading inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [showLowStockOnly]);

  const openEditModal = (item) => {
    setSelectedItem(item);
    setEditFormData({
      quantity: item.quantity.toString(),
      reorderLevel: item.reorderLevel.toString(),
      maxQuantity: (item.maxQuantity || 100).toString(),
      locationRack: item.locationRack || ''
    });
    setFormError('');
    setEditModalOpen(true);
  };

  const openAdjustModal = (item) => {
    setSelectedItem(item);
    setAdjustData({
      delta: '',
      type: 'add'
    });
    setFormError('');
    setAdjustModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editFormData.quantity === '' || editFormData.reorderLevel === '') {
      setFormError('Quantity and Reorder Level are required.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    const payload = {
      medicineId: selectedItem.medicineId,
      quantity: parseInt(editFormData.quantity),
      reorderLevel: parseInt(editFormData.reorderLevel),
      maxQuantity: parseInt(editFormData.maxQuantity) || 100,
      locationRack: editFormData.locationRack
    };

    try {
      const response = await api.put(`/inventory/${selectedItem.id}`, payload);
      if (response.data.success) {
        setInventory(prev => prev.map(item => item.id === selectedItem.id ? response.data.data : item));
        setEditModalOpen(false);
      } else {
        setFormError(response.data.message || 'Failed to update inventory details');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error updating inventory details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    const parsedDelta = parseInt(adjustData.delta);
    if (!parsedDelta || parsedDelta <= 0) {
      setFormError('Please enter a valid positive quantity.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    // If subtract, delta is negative
    const finalDelta = adjustData.type === 'subtract' ? -parsedDelta : parsedDelta;

    try {
      const response = await api.patch(`/inventory/medicine/${selectedItem.medicineId}/stock`, null, {
        params: { delta: finalDelta }
      });
      
      if (response.data.success) {
        setInventory(prev => prev.map(item => item.id === selectedItem.id ? response.data.data : item));
        setAdjustModalOpen(false);
      } else {
        setFormError(response.data.message || 'Failed to adjust stock');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error adjusting stock levels');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.medicineCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.locationRack && item.locationRack.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && inventory.length === 0) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading inventory data...</div>;
  }

  return (
    <div>
      <div className="search-filter-bar">
        <div className="search-input-wrap">
          <Search />
          <input
            type="text"
            placeholder="Search inventory by medicine name, code, or storage rack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={`btn ${showLowStockOnly ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setShowLowStockOnly(prev => !prev)}
            style={{ height: '42px', gap: '6px' }}
          >
            <ShieldAlert size={16} />
            <span>{showLowStockOnly ? 'Show All Stock' : 'Low Stock Only'}</span>
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        {filteredInventory.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>
            No stock listings found.
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Medicine Name</th>
                  <th>Quantity</th>
                  <th>Min Level</th>
                  <th>Max Level</th>
                  <th>Storage Rack</th>
                  <th>Last Inspected</th>
                  {canModify && <th style={{ width: '150px', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const dateStr = item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : 'N/A';
                  return (
                    <tr key={item.id}>
                      <td><span className="badge badge-info">{item.medicineCode}</span></td>
                      <td>
                        <strong style={{ color: 'white' }}>{item.medicineName}</strong>
                      </td>
                      <td>
                        <span className={`badge ${item.lowStock ? 'badge-danger pulse-red' : 'badge-success'}`}>
                          {item.quantity} unit(s)
                        </span>
                      </td>
                      <td>{item.reorderLevel}</td>
                      <td>{item.maxQuantity || 100}</td>
                      <td>
                        <span className="badge badge-info" style={{ textTransform: 'none' }}>
                          {item.locationRack || 'Not Staged'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{dateStr}</td>
                      {canModify && (
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn-icon edit" 
                              onClick={() => openAdjustModal(item)}
                              title="Adjust Stock Qty"
                              style={{ color: 'var(--success)' }}
                            >
                              <RefreshCw size={14} />
                            </button>
                            <button 
                              className="btn-icon edit" 
                              onClick={() => openEditModal(item)}
                              title="Edit Parameters"
                            >
                              <Edit2 size={14} />
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

      {/* Edit Details Modal */}
      {editModalOpen && (
        <div className="modal-overlay">
          <div className="card modal-content">
            <div className="card-header-flex">
              <h3 style={{ fontFamily: 'Outfit, sans-serif' }}>
                Manage Stock Details: {selectedItem?.medicineName}
              </h3>
              <button className="btn-icon" onClick={() => setEditModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {formError && <div className="alert alert-danger">{formError}</div>}

            <form onSubmit={handleEditSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="quantity">Physical Quantity *</label>
                  <input
                    type="number"
                    id="quantity"
                    value={editFormData.quantity}
                    onChange={(e) => setEditFormData(p => ({ ...p, quantity: e.target.value }))}
                    min="0"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reorderLevel">Reorder Threshold *</label>
                  <input
                    type="number"
                    id="reorderLevel"
                    value={editFormData.reorderLevel}
                    onChange={(e) => setEditFormData(p => ({ ...p, reorderLevel: e.target.value }))}
                    min="0"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="maxQuantity">Maximum Allowed Cap</label>
                  <input
                    type="number"
                    id="maxQuantity"
                    value={editFormData.maxQuantity}
                    onChange={(e) => setEditFormData(p => ({ ...p, maxQuantity: e.target.value }))}
                    min="0"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="locationRack">Rack Location / Bin</label>
                  <input
                    type="text"
                    id="locationRack"
                    value={editFormData.locationRack}
                    onChange={(e) => setEditFormData(p => ({ ...p, locationRack: e.target.value }))}
                    placeholder="e.g. Shelf-A-Row-2"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Apply Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delta Adjust Modal */}
      {adjustModalOpen && (
        <div className="modal-overlay">
          <div className="card modal-content" style={{ maxWidth: '400px' }}>
            <div className="card-header-flex">
              <h3 style={{ fontFamily: 'Outfit, sans-serif' }}>
                Adjust Stock: {selectedItem?.medicineName}
              </h3>
              <button className="btn-icon" onClick={() => setAdjustModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {formError && <div className="alert alert-danger">{formError}</div>}

            <form onSubmit={handleAdjustSubmit}>
              <div className="form-group">
                <label>Adjustment Type</label>
                <div className="checkbox-group" style={{ gap: '20px', marginTop: '6px' }}>
                  <label className="checkbox-label">
                    <input
                      type="radio"
                      name="adjustType"
                      checked={adjustData.type === 'add'}
                      onChange={() => setAdjustData(p => ({ ...p, type: 'add' }))}
                      disabled={submitting}
                    />
                    <span>Add Stock (+)</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="radio"
                      name="adjustType"
                      checked={adjustData.type === 'subtract'}
                      onChange={() => setAdjustData(p => ({ ...p, type: 'subtract' }))}
                      disabled={submitting}
                    />
                    <span>Deduct Stock (-)</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="delta">Quantity Change *</label>
                <input
                  type="number"
                  id="delta"
                  value={adjustData.delta}
                  onChange={(e) => setAdjustData(p => ({ ...p, delta: e.target.value }))}
                  placeholder="Enter change quantity"
                  min="1"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="modal-footer" style={{ marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAdjustModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={submitting}>
                  {submitting ? 'Applying...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
