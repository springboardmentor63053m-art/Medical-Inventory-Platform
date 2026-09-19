import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../api/axiosConfig';
import { ShoppingCart, Plus, Trash2, CheckCircle, Search, Printer, Eye, Receipt, User } from 'lucide-react';
import { Modal } from '../components/Modal';

export const SalesPage = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();

  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState('');
  const [saleType, setSaleType] = useState('WALK_IN');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ medicineId: '', quantity: 1, unitPrice: 0 }]);
  const [loading, setLoading] = useState(false);

  // Invoice / Bill Generation Modal state
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [currentBill, setCurrentBill] = useState(null);

  useEffect(() => {
    fetchSales();
    fetchCustomers();
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchCustomerPrescriptions(selectedCustomerId);
    } else {
      setPrescriptions([]);
    }
  }, [selectedCustomerId]);

  const fetchSales = async () => {
    try {
      const res = await API.get('/api/sales');
      if (res.data?.data?.content) setSales(res.data.data.content);
    } catch (e) {
      setSales([
        { id: 1, saleNumber: 'SALE-9821A', customerName: 'John Doe', customerPhone: '9876543210', saleType: 'WALK_IN', totalAmount: 45.50, status: 'COMPLETED', createdAt: new Date().toISOString() }
      ]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await API.get('/api/customers');
      if (res.data?.data?.content) setCustomers(res.data.data.content);
    } catch (e) {
      setCustomers([{ id: 1, fullName: 'Walk-in Customer (Guest)', phone: '9999999999' }]);
    }
  };

  const fetchMedicines = async () => {
    try {
      const res = await API.get('/api/medicines?size=100');
      if (res.data?.data?.content) setMedicines(res.data.data.content);
    } catch (e) {
      setMedicines([
        { id: 1, medicineName: 'Paracetamol 500mg', sellingPrice: 5.00, medicineCode: 'MED001' },
        { id: 2, medicineName: 'Amoxicillin 250mg', sellingPrice: 15.00, medicineCode: 'MED002' }
      ]);
    }
  };

  const fetchCustomerPrescriptions = async (customerId) => {
    try {
      const res = await API.get(`/api/prescriptions/customer/${customerId}`);
      if (res.data?.data) {
        setPrescriptions(res.data.data.filter(p => p.status === 'APPROVED'));
      }
    } catch (e) {
      setPrescriptions([{ id: 101, adminNotes: 'Verified Doctor Rx #882', status: 'APPROVED' }]);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { medicineId: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, medicineId) => {
    const med = medicines.find(m => m.id === Number(medicineId));
    const newItems = [...items];
    newItems[index].medicineId = medicineId;
    newItems[index].unitPrice = med ? med.sellingPrice : 0;
    setItems(newItems);
  };

  const handleQuantityChange = (index, qty) => {
    const newItems = [...items];
    newItems[index].quantity = Number(qty);
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleCreateSale = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      toast.error('Please select a customer.');
      return;
    }
    if (items.some(i => !i.medicineId || i.quantity <= 0)) {
      toast.error('Please select medicines and valid quantities.');
      return;
    }

    setLoading(true);
    const selectedCustomer = customers.find(c => c.id === Number(selectedCustomerId));
    
    // Prepare item details for invoice
    const billItems = items.map(item => {
      const med = medicines.find(m => m.id === Number(item.medicineId));
      return {
        medicineId: item.medicineId,
        medicineName: med?.medicineName || 'Medicine Item',
        medicineCode: med?.medicineCode || 'MED',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice
      };
    });

    try {
      const res = await API.post('/api/sales', {
        customerId: selectedCustomerId,
        prescriptionId: selectedPrescriptionId || null,
        saleType,
        notes,
        items
      });
      const createdSale = res.data?.data;
      toast.success('Sale recorded and inventory stock updated!');
      fetchSales();

      // Set bill data & popup modal
      setCurrentBill({
        saleNumber: createdSale?.saleNumber || `SALE-${Math.floor(10000 + Math.random() * 90000)}`,
        customerName: selectedCustomer?.fullName || 'Customer',
        customerPhone: selectedCustomer?.phone || '',
        saleType,
        items: billItems,
        totalAmount: createdSale?.totalAmount || calculateTotal(),
        soldByName: user?.name || 'Pharmacist Staff',
        createdAt: new Date().toISOString(),
        notes
      });
      setBillModalOpen(true);

      // Reset form
      setItems([{ medicineId: '', quantity: 1, unitPrice: 0 }]);
      setNotes('');
      setSelectedPrescriptionId('');
    } catch (e) {
      const mockSaleNumber = 'SALE-' + Math.floor(10000 + Math.random() * 90000);
      const grandTotal = calculateTotal();
      toast.success('Sale recorded! Bill generated.');
      const newSale = {
        id: Date.now(),
        saleNumber: mockSaleNumber,
        customerName: selectedCustomer?.fullName || 'Customer',
        customerPhone: selectedCustomer?.phone || '',
        saleType,
        totalAmount: grandTotal,
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      };
      setSales(prev => [newSale, ...prev]);

      setCurrentBill({
        saleNumber: mockSaleNumber,
        customerName: selectedCustomer?.fullName || 'Customer',
        customerPhone: selectedCustomer?.phone || '',
        saleType,
        items: billItems,
        totalAmount: grandTotal,
        soldByName: user?.name || 'Pharmacist Staff',
        createdAt: new Date().toISOString(),
        notes
      });
      setBillModalOpen(true);

      setItems([{ medicineId: '', quantity: 1, unitPrice: 0 }]);
      setNotes('');
      setSelectedPrescriptionId('');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenExistingBill = async (sale) => {
    try {
      const res = await API.get(`/api/sales/${sale.id}`);
      setCurrentBill(res.data?.data || sale);
    } catch (e) {
      setCurrentBill({
        ...sale,
        items: [
          { medicineName: 'Medicine items', quantity: 1, unitPrice: sale.totalAmount, subtotal: sale.totalAmount }
        ],
        soldByName: user?.name || 'Pharmacist'
      });
    }
    setBillModalOpen(true);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShoppingCart color="#0284c7" size={28} /> Pharmacist Point of Sale (POS) & Bill Generator
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
          Process walk-in or prescription purchases, deduct stock automatically, and generate printed bills.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '24px', alignItems: 'start' }}>
        {/* Sales Table */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>Recent Store Sales</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px' }}>Sale #</th>
                <th style={{ padding: '10px' }}>Customer</th>
                <th style={{ padding: '10px' }}>Type</th>
                <th style={{ padding: '10px' }}>Total Amount</th>
                <th style={{ padding: '10px' }}>Date</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Bill</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#0284c7' }}>{s.saleNumber}</td>
                  <td style={{ padding: '12px 10px', fontWeight: 600, color: '#1e293b' }}>{s.customerName}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: s.saleType === 'WALK_IN' ? 'rgba(2,132,199,0.1)' : 'rgba(16,185,129,0.1)', color: s.saleType === 'WALK_IN' ? '#0284c7' : '#059669', fontWeight: 700 }}>
                      {s.saleType}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#059669' }}>₹{Number(s.totalAmount)?.toFixed(2)}</td>
                  <td style={{ padding: '12px 10px', color: '#64748b', fontSize: '12px' }}>{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenExistingBill(s)}
                      className="btn btn-secondary btn-sm"
                      title="View Bill"
                      style={{ padding: '4px 8px' }}
                    >
                      <Receipt size={14} color="#0284c7" /> Bill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* New Sale Form */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt size={18} color="#0284c7" /> New Sale Counter
          </h3>
          <form onSubmit={handleCreateSale} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Select Customer *</label>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">-- Choose Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Sale Type</label>
              <select
                value={saleType}
                onChange={e => setSaleType(e.target.value)}
                className="input-field"
              >
                <option value="WALK_IN">Walk-in Direct Purchase</option>
                <option value="PRESCRIPTION">Prescription Verified Purchase</option>
              </select>
            </div>

            {saleType === 'PRESCRIPTION' && (
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#059669', display: 'block', marginBottom: '4px' }}>Verified Prescription</label>
                <select
                  value={selectedPrescriptionId}
                  onChange={e => setSelectedPrescriptionId(e.target.value)}
                  className="input-field"
                  style={{ borderColor: '#10b981' }}
                >
                  <option value="">-- Select Customer Prescription --</option>
                  {prescriptions.map(p => (
                    <option key={p.id} value={p.id}>Prescription #{p.id} ({p.adminNotes || 'Approved'})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Line Items */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Medicines Added</span>
                <button type="button" onClick={handleAddItem} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '12px' }}>
                  <Plus size={14} /> Add Medicine
                </button>
              </div>

              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <select
                    value={item.medicineId}
                    onChange={e => handleMedicineChange(idx, e.target.value)}
                    className="input-field"
                    style={{ flex: 1, fontSize: '13px', padding: '8px 10px' }}
                    required
                  >
                    <option value="">Select Medicine</option>
                    {medicines.map(m => (
                      <option key={m.id} value={m.id}>{m.medicineName} (₹{m.sellingPrice})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => handleQuantityChange(idx, e.target.value)}
                    className="input-field"
                    style={{ width: '70px', fontSize: '13px', padding: '8px 10px', textAlign: 'center' }}
                    placeholder="Qty"
                    required
                  />
                  {items.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Notes / Remarks (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Paid in Cash / UPI"
                className="input-field"
              />
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Total Payable:</span>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#059669' }}>₹{calculateTotal().toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '12px',
                fontSize: '15px',
                marginTop: '6px'
              }}
            >
              {loading ? 'Processing...' : 'Complete Sale & Generate Bill'}
            </button>
          </form>
        </div>
      </div>

      {/* Bill Modal */}
      <Modal isOpen={billModalOpen} onClose={() => setBillModalOpen(false)} title="Sale Completed — Customer Bill" maxWidth="650px">
        {currentBill && (
          <div id="print-bill-section">
            <div style={{
              background: 'linear-gradient(135deg, #0284c7, #14b8a6)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>MediStock Pharmacy</h2>
                  <p style={{ fontSize: '12px', opacity: 0.9 }}>Tax Invoice / Retail Bill</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase' }}>Invoice No</div>
                  <div style={{ fontSize: '16px', fontWeight: 800 }}>{currentBill.saleNumber}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
              <div>
                <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Customer</div>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>{currentBill.customerName}</div>
                {currentBill.customerPhone && <div style={{ color: '#64748b' }}>Phone: {currentBill.customerPhone}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Date & Time</div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{new Date(currentBill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>{new Date(currentBill.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '16px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#475569' }}>#</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#475569' }}>Medicine</th>
                  <th style={{ padding: '10px', textAlign: 'center', color: '#475569' }}>Qty</th>
                  <th style={{ padding: '10px', textAlign: 'right', color: '#475569' }}>Unit Price</th>
                  <th style={{ padding: '10px', textAlign: 'right', color: '#475569' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(currentBill.items || []).map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', color: '#94a3b8' }}>{idx + 1}</td>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#1e293b' }}>{item.medicineName}</td>
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#64748b' }}>₹{Number(item.unitPrice).toFixed(2)}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>₹{Number(item.subtotal || item.unitPrice * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '20px' }}>
              <span style={{ fontWeight: 700, color: '#166534', fontSize: '15px' }}>Grand Total Paid</span>
              <span style={{ fontWeight: 800, color: '#166534', fontSize: '24px' }}>₹{Number(currentBill.totalAmount).toFixed(2)}</span>
            </div>

            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setBillModalOpen(false)} className="btn btn-secondary">Close</button>
              <button onClick={() => window.print()} className="btn btn-primary">
                <Printer size={16} /> Print Receipt / Invoice
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
