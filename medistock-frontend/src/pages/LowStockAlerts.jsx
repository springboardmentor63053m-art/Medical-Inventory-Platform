import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axiosConfig';
import { ToastContext } from '../context/ToastContext';
import { Pagination } from '../components/Pagination';
import { AlertTriangle, PlusCircle, RefreshCcw, MapPin, CheckCircle2 } from 'lucide-react';
import { Modal } from '../components/Modal';

export const LowStockAlerts = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Quick Restock Modal
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedRestockItem, setSelectedRestockItem] = useState(null);
  const [restockQty, setRestockQty] = useState(50);
  const [remarks, setRemarks] = useState('Emergency reorder replenishment');

  const toast = useContext(ToastContext);

  useEffect(() => {
    fetchLowStock();
  }, [page, size]);

  const fetchLowStock = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/inventory/low-stock', { params: { page, size } });
      const data = res.data.data;
      setLowStockItems(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load low stock items');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRestock = (item) => {
    setSelectedRestockItem(item);
    setRestockQty((item.maximumStock || 100) - item.quantity);
    setIsRestockModalOpen(true);
  };

  const handleConfirmRestock = async (e) => {
    e.preventDefault();
    if (!selectedRestockItem) return;
    try {
      await API.post('/api/inventory/stock-in', {
        medicineId: selectedRestockItem.medicineId,
        quantity: Number(restockQty),
        remarks: remarks || 'Restock from Low Stock Alert Center'
      });
      toast.success(`Successfully restocked ${restockQty} units of ${selectedRestockItem.medicineName}`);
      setIsRestockModalOpen(false);
      fetchLowStock();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete restock action');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle color="#d97706" size={28} /> Low Stock & Inventory Replenishment Alert Center
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Medicines running below their designated minimum threshold level requiring urgent purchase reorders</p>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Minimum Required</th>
              <th>Deficit Units</th>
              <th>Location</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Checking inventory thresholds...</td></tr>
            ) : lowStockItems.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  <CheckCircle2 size={40} color="#059669" style={{ display: 'block', margin: '0 auto 12px auto' }} />
                  <div style={{ color: '#1e293b', fontWeight: 700, fontSize: '16px' }}>All Inventory Levels Are Healthy!</div>
                  <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>No items are currently below minimum stock threshold.</div>
                </td>
              </tr>
            ) : (
              lowStockItems.map((item) => {
                const deficit = item.minimumStock - item.quantity;
                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.medicineName}</div>
                      <div style={{ fontSize: '12px', color: '#0284c7' }}>{item.medicineCode}</div>
                    </td>
                    <td style={{ color: '#475569' }}>{item.category || 'General'}</td>
                    <td>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: item.quantity === 0 ? '#dc2626' : '#d97706' }}>
                        {item.quantity} units
                      </span>
                    </td>
                    <td style={{ color: '#475569' }}>{item.minimumStock} units</td>
                    <td style={{ color: '#dc2626', fontWeight: 800 }}>-{deficit > 0 ? deficit : 1} units</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
                        <MapPin size={14} color="#14b8a6" /> {item.location || 'Main Shelf'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleOpenRestock(item)} className="btn btn-primary btn-sm">
                        <PlusCircle size={14} /> Quick Restock
                      </button>
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

      {/* Restock Modal */}
      <Modal isOpen={isRestockModalOpen} onClose={() => setIsRestockModalOpen(false)} title="Restock Medicine Inventory">
        <form onSubmit={handleConfirmRestock} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0284c7' }}>{selectedRestockItem?.medicineName}</div>
            <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
              Current Stock: <strong>{selectedRestockItem?.quantity}</strong> units | Min Threshold: <strong>{selectedRestockItem?.minimumStock}</strong> units
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Restock Quantity to Add
            </label>
            <input
              type="number"
              min="1"
              required
              value={restockQty}
              onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
              className="input-field"
              style={{ fontSize: '16px', fontWeight: 700 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Restock Purchase Remarks
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={() => setIsRestockModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Confirm Restock (+{restockQty} units)</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
