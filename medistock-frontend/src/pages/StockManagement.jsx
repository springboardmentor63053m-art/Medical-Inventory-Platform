import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axiosConfig';
import { ToastContext } from '../context/ToastContext';
import { ArrowDownUp, ArrowUpRight, ArrowDownRight, RefreshCw, Layers } from 'lucide-react';

export const StockManagement = () => {
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [currentInventory, setCurrentInventory] = useState(null);
  const [actionType, setActionType] = useState('IN'); // IN, OUT, ADJUSTMENT
  const [quantity, setQuantity] = useState(10);
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [location, setLocation] = useState('Main Pharmacy Shelf A');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const toast = useContext(ToastContext);

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (selectedMedicineId) {
      fetchMedicineInventory(selectedMedicineId);
    } else {
      setCurrentInventory(null);
    }
  }, [selectedMedicineId]);

  const fetchMedicines = async () => {
    try {
      const res = await API.get('/api/medicines', { params: { size: 100 } });
      const data = res.data?.data;
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data?.content && Array.isArray(data.content)) {
        list = data.content;
      } else if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data?.content && Array.isArray(res.data.content)) {
        list = res.data.content;
      }
      setMedicines(list);
      if (list.length > 0) {
        setSelectedMedicineId(list[0].id);
      }
    } catch (err) {
      console.error('Fetch medicines error:', err);
      toast.error('Failed to load medicine list');
    }
  };

  const fetchMedicineInventory = async (medId) => {
    try {
      const res = await API.get(`/api/inventory/medicine/${medId}`);
      setCurrentInventory(res.data?.data || res.data);
    } catch (err) {
      setCurrentInventory(null);
    }
  };

  const handleExecuteStockOp = async (e) => {
    e.preventDefault();
    if (!selectedMedicineId) {
      toast.error('Please select a medicine');
      return;
    }
    if (quantity <= 0) {
      toast.error('Quantity must be greater than zero');
      return;
    }

    setLoading(true);
    try {
      let endpoint = '/api/inventory/stock-in';
      if (actionType === 'OUT') endpoint = '/api/inventory/stock-out';
      if (actionType === 'ADJUSTMENT') endpoint = '/api/inventory/adjust';

      await API.post(endpoint, {
        medicineId: Number(selectedMedicineId),
        quantity: Number(quantity),
        batchNumber,
        expiryDate,
        location,
        storageLocation: location,
        remarks: remarks || `Manual Stock ${actionType} performed via Stock Portal`
      });

      toast.success(`Stock ${actionType} recorded successfully!`);
      setRemarks('');
      fetchMedicineInventory(selectedMedicineId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process stock operation');
    } finally {
      setLoading(false);
    }
  };

  const currentQty = currentInventory?.quantity || 0;
  let projectedQty = currentQty;
  if (actionType === 'IN') projectedQty = currentQty + Number(quantity || 0);
  if (actionType === 'OUT') projectedQty = Math.max(0, currentQty - Number(quantity || 0));
  if (actionType === 'ADJUSTMENT') projectedQty = Number(quantity || 0);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Stock Operations Portal</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Execute Stock IN (Purchase/Received), Stock OUT (Dispensed/Sales), or Inventory Adjustments</p>
      </div>

      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
      }}>
        {/* Action Type Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '28px' }}>
          <button
            type="button"
            onClick={() => setActionType('IN')}
            className={`btn ${actionType === 'IN' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'center', padding: '14px', borderRadius: '12px' }}
          >
            <ArrowUpRight size={18} color="#059669" /> Stock IN (+)
          </button>
          <button
            type="button"
            onClick={() => setActionType('OUT')}
            className={`btn ${actionType === 'OUT' ? 'btn-danger' : 'btn-secondary'}`}
            style={{ justifyContent: 'center', padding: '14px', borderRadius: '12px' }}
          >
            <ArrowDownRight size={18} color="#dc2626" /> Stock OUT (-)
          </button>
          <button
            type="button"
            onClick={() => setActionType('ADJUSTMENT')}
            className={`btn ${actionType === 'ADJUSTMENT' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'center', padding: '14px', borderRadius: '12px', background: actionType === 'ADJUSTMENT' ? '#d97706' : '' }}
          >
            <RefreshCw size={18} color="#d97706" /> Set Exact Stock
          </button>
        </div>

        <form onSubmit={handleExecuteStockOp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
              Select Medicine
            </label>
            <select
              value={selectedMedicineId}
              onChange={(e) => setSelectedMedicineId(e.target.value)}
              className="input-field"
              style={{ fontSize: '15px', padding: '12px' }}
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.medicineName} ({m.medicineCode}) — Category: {m.category}
                </option>
              ))}
            </select>
          </div>

          {/* Current vs Projected Live Preview */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Current Stock Qty</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>
                {currentQty} units
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Projected New Stock</div>
              <div style={{
                fontSize: '24px',
                fontWeight: 800,
                color: actionType === 'IN' ? '#059669' : (actionType === 'OUT' ? '#dc2626' : '#d97706'),
                marginTop: '4px'
              }}>
                {projectedQty} units
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="input-field"
                style={{ fontSize: '16px', fontWeight: 700 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                Batch Number
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="input-field"
                placeholder="e.g. BATCH-99201"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                Storage Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-field"
                placeholder="e.g. Shelf A-12"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                Reason / Audit Remarks
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="input-field"
                placeholder="e.g. Received shipment batch #PZ-882"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '14px', justifyContent: 'center', fontSize: '16px', marginTop: '12px' }}
          >
            {loading ? 'Processing...' : `Confirm Stock ${actionType} Operation`}
          </button>
        </form>
      </div>
    </div>
  );
};
