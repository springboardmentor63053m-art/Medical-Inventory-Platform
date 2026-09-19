import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axiosConfig';
import { ToastContext } from '../context/ToastContext';
import { Pagination } from '../components/Pagination';
import { XCircle, PlusCircle, RefreshCcw, MapPin, PackageX, ArrowRight } from 'lucide-react';
import { Modal } from '../components/Modal';

export const OutOfStockPage = () => {
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Quick Restock Modal
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedRestockItem, setSelectedRestockItem] = useState(null);
  const [restockQty, setRestockQty] = useState(50);
  const [remarks, setRemarks] = useState('Emergency restock — out of stock replenishment');

  const toast = useContext(ToastContext);

  useEffect(() => {
    fetchOutOfStock();
  }, [page, size]);

  const fetchOutOfStock = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/inventory/out-of-stock', { params: { page, size } });
      const data = res.data.data;
      setOutOfStockItems(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load out of stock items');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRestock = (item) => {
    setSelectedRestockItem(item);
    setRestockQty(item.maximumStock || 100);
    setIsRestockModalOpen(true);
  };

  const handleConfirmRestock = async (e) => {
    e.preventDefault();
    if (!selectedRestockItem) return;
    try {
      await API.post('/api/inventory/stock-in', {
        medicineId: selectedRestockItem.medicineId,
        quantity: Number(restockQty),
        remarks: remarks || 'Restock from Out of Stock Alert Center'
      });
      toast.success(`Successfully restocked ${restockQty} units of ${selectedRestockItem.medicineName}`);
      setIsRestockModalOpen(false);
      fetchOutOfStock();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete restock action');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <XCircle color="#dc2626" size={28} /> Out of Stock — Critical Inventory Alerts
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Medicines with zero stock requiring immediate procurement or restock action</p>
        </div>
        <button onClick={fetchOutOfStock} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Code</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Location</th>
              <th>Last Updated</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Checking inventory for out of stock items...</td></tr>
            ) : outOfStockItems.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  <PackageX size={40} color="#059669" style={{ display: 'block', margin: '0 auto 12px auto' }} />
                  <div style={{ color: '#1e293b', fontWeight: 700, fontSize: '16px' }}>No Out of Stock Items!</div>
                  <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>All medicines currently have available stock in inventory.</div>
                </td>
              </tr>
            ) : (
              outOfStockItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.medicineName}</div>
                    {item.manufacturer && <div style={{ fontSize: '12px', color: '#64748b' }}>{item.manufacturer}</div>}
                  </td>
                  <td style={{ fontSize: '13px', color: '#0284c7', fontWeight: 600 }}>{item.medicineCode}</td>
                  <td style={{ color: '#475569' }}>{item.category || 'General'}</td>
                  <td style={{ color: '#475569' }}>{item.supplierName || 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
                      <MapPin size={14} color="#14b8a6" /> {item.location || 'Main Shelf'}
                    </div>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '13px' }}>
                    {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => handleOpenRestock(item)} className="btn btn-primary btn-sm">
                      <PlusCircle size={14} /> Quick Restock
                    </button>
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

      {/* Restock Modal */}
      <Modal isOpen={isRestockModalOpen} onClose={() => setIsRestockModalOpen(false)} title="Emergency Restock — Out of Stock Medicine">
        <form onSubmit={handleConfirmRestock} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#dc2626' }}>{selectedRestockItem?.medicineName}</div>
            <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
              Code: <strong>{selectedRestockItem?.medicineCode}</strong> | Current Stock: <strong style={{ color: '#dc2626' }}>0 units</strong> | Max Capacity: <strong>{selectedRestockItem?.maximumStock || 500}</strong> units
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
              Restock Remarks
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
