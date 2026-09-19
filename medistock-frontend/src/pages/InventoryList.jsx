import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { Boxes, Search, AlertTriangle, CheckCircle, Sliders, ArrowDownUp, MapPin, Edit3, Shield } from 'lucide-react';

export const InventoryList = () => {
  const { user } = useContext(AuthContext);
  const isStaff = user?.role === 'STAFF' || user?.role === 'VIEWER';

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Threshold modal
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [thresholdForm, setThresholdForm] = useState({
    minimumStock: 10,
    maximumStock: 500,
    location: 'Main Pharmacy',
  });

  const toast = useContext(ToastContext);

  useEffect(() => {
    fetchInventory();
  }, [search, page, size]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/inventory', {
        params: { search, page, size, sortBy: 'medicine.medicineName', sortDir: 'ASC' }
      });
      const data = res.data?.data;
      let list = [];
      let pages = 1;
      if (Array.isArray(data)) {
        list = data;
      } else if (data?.content && Array.isArray(data.content)) {
        list = data.content;
        pages = data.totalPages || 1;
      } else if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data?.content && Array.isArray(res.data.content)) {
        list = res.data.content;
        pages = res.data.totalPages || 1;
      }
      setInventory(list);
      setTotalPages(pages);
    } catch (err) {
      console.error('Fetch inventory error:', err);
      toast.error('Failed to load inventory stock levels');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenThreshold = (item) => {
    setSelectedItem(item);
    setThresholdForm({
      minimumStock: item.minThreshold !== undefined ? item.minThreshold : (item.minimumStock || 10),
      maximumStock: item.maxThreshold !== undefined ? item.maxThreshold : (item.maximumStock || 500),
      location: item.storageLocation || item.location || 'Main Pharmacy Shelf A',
    });
    setIsThresholdModalOpen(true);
  };

  const handleSaveThresholds = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      await API.put(`/api/inventory/medicine/${selectedItem.medicineId || selectedItem.id}/thresholds`, null, {
        params: {
          minimumStock: thresholdForm.minimumStock,
          maximumStock: thresholdForm.maximumStock,
          location: thresholdForm.location,
        }
      });
      toast.success('Inventory thresholds and storage location updated!');
      setIsThresholdModalOpen(false);
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update thresholds');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Stock & Inventory Management</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Monitor current stock quantities, reorder thresholds, and shelf locations</p>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search inventory by medicine name or code..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="input-field"
            style={{ paddingLeft: '42px' }}
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Category</th>
              <th>Available Qty</th>
              <th>Min / Max Threshold</th>
              <th>Status</th>
              <th>Storage Location</th>
              <th style={{ textAlign: 'right' }}>Configure</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Loading inventory...</td></tr>
            ) : inventory.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No inventory records found.</td></tr>
            ) : (
              inventory.map((item) => {
                const qty = item.availableQty !== undefined ? item.availableQty : (item.quantity !== undefined ? item.quantity : 0);
                const minT = item.minThreshold !== undefined ? item.minThreshold : (item.minimumStock !== undefined ? item.minimumStock : 10);
                const maxT = item.maxThreshold !== undefined ? item.maxThreshold : (item.maximumStock !== undefined ? item.maximumStock : 500);
                const locStr = item.storageLocation || item.location || 'Main Shelf';

                let statusLabel = item.status;
                if (!statusLabel) {
                  if (qty === 0) statusLabel = 'Out of Stock';
                  else if (qty <= minT) statusLabel = 'Low Stock';
                  else statusLabel = 'In Stock';
                }

                const isOut = statusLabel === 'Out of Stock' || qty === 0;
                const isLow = statusLabel === 'Low Stock' || (qty > 0 && qty <= minT);

                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.medicineName}</div>
                      <div style={{ fontSize: '12px', color: '#0284c7' }}>
                        {item.medicineCode} {item.supplierName ? `· ${item.supplierName}` : ''}
                      </div>
                    </td>
                    <td style={{ color: '#475569' }}>{item.category || 'General'}</td>
                    <td>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: isOut ? '#dc2626' : (isLow ? '#d97706' : '#059669') }}>
                        {qty} units
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '13px' }}>
                      Min: {minT} | Max: {maxT}
                    </td>
                    <td>
                      <span className={`badge ${isOut ? 'badge-danger' : (isLow ? 'badge-warning' : 'badge-success')}`}>
                        {isOut ? <AlertTriangle size={14} /> : (isLow ? <AlertTriangle size={14} /> : <CheckCircle size={14} />)}
                        {statusLabel}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
                        <MapPin size={14} color="#14b8a6" /> {locStr}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {!isStaff ? (
                        <button onClick={() => handleOpenThreshold(item)} className="btn btn-secondary btn-sm" title="Edit Min/Max & Location">
                          <Sliders size={14} /> Configure
                        </button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>Read-only</span>
                      )}
                    </td>
                  </tr>
                );
              })
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

      {/* Threshold Modal */}
      <Modal isOpen={isThresholdModalOpen} onClose={() => setIsThresholdModalOpen(false)} title="Configure Stock Thresholds">
        <form onSubmit={handleSaveThresholds} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#0284c7' }}>{selectedItem?.medicineName}</div>
            <div style={{ fontSize: '13px', color: '#475569' }}>Current Stock: {selectedItem?.quantity} units</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Minimum Reorder Threshold
              </label>
              <input
                type="number"
                min="1"
                required
                value={thresholdForm.minimumStock}
                onChange={(e) => setThresholdForm({ ...thresholdForm, minimumStock: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Maximum Stock Capacity
              </label>
              <input
                type="number"
                min="1"
                required
                value={thresholdForm.maximumStock}
                onChange={(e) => setThresholdForm({ ...thresholdForm, maximumStock: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Pharmacy Shelf / Storage Location
            </label>
            <input
              type="text"
              required
              value={thresholdForm.location}
              onChange={(e) => setThresholdForm({ ...thresholdForm, location: e.target.value })}
              className="input-field"
              placeholder="e.g. Main Pharmacy Shelf B3"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={() => setIsThresholdModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Configuration</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
