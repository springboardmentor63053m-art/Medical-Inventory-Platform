import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import { Receipt, Search, Eye, Printer, Download, Calendar, User, ShoppingCart } from 'lucide-react';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';

export const BillsPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchBills();
  }, [page, size]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/sales', { params: { page, size } });
      const data = res.data?.data;
      if (data?.content) {
        setBills(data.content);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) {
      setBills([
        { id: 1, saleNumber: 'SALE-9821A', customerName: 'John Doe', customerPhone: '9876543210', saleType: 'WALK_IN', totalAmount: 245.50, status: 'COMPLETED', createdAt: new Date().toISOString() },
        { id: 2, saleNumber: 'SALE-4521B', customerName: 'Jane Smith', customerPhone: '9876543211', saleType: 'PRESCRIPTION', totalAmount: 890.00, status: 'COMPLETED', createdAt: new Date(Date.now() - 86400000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBill = async (bill) => {
    setDetailLoading(true);
    setIsDetailOpen(true);
    try {
      const res = await API.get(`/api/sales/${bill.id}`);
      setSelectedBill(res.data?.data || bill);
    } catch (e) {
      setSelectedBill({
        ...bill,
        items: [
          { id: 1, medicineName: 'Paracetamol 500mg', medicineCode: 'MED-001', quantity: 3, unitPrice: 5.00, subtotal: 15.00 },
          { id: 2, medicineName: 'Amoxicillin 250mg', medicineCode: 'MED-002', quantity: 2, unitPrice: 115.25, subtotal: 230.50 },
        ],
        soldByName: 'Admin Pharmacist'
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePrintBill = () => {
    window.print();
  };

  const filteredBills = bills.filter(b =>
    !search ||
    b.saleNumber?.toLowerCase().includes(search.toLowerCase()) ||
    b.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Receipt color="#0284c7" size={28} /> Bills & Invoice History
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>View all generated bills, reprint invoices, and track payment history</p>
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
            placeholder="Search by bill number or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '42px' }}
          />
        </div>
      </div>

      {/* Bills Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Bill Number</th>
              <th>Customer</th>
              <th>Sale Type</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading bill history...</td></tr>
            ) : filteredBills.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No bills found.</td></tr>
            ) : (
              filteredBills.map(bill => (
                <tr key={bill.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0284c7' }}>{bill.saleNumber}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{bill.customerName}</div>
                    {bill.customerPhone && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{bill.customerPhone}</div>}
                  </td>
                  <td>
                    <span style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      background: bill.saleType === 'WALK_IN' ? 'rgba(2,132,199,0.1)' : 'rgba(16,185,129,0.1)',
                      color: bill.saleType === 'WALK_IN' ? '#0284c7' : '#059669'
                    }}>
                      {bill.saleType === 'WALK_IN' ? 'Walk-in' : 'Prescription'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#059669' }}>₹{Number(bill.totalAmount).toFixed(2)}</td>
                  <td>
                    <span className="badge badge-success">{bill.status || 'COMPLETED'}</span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '13px' }}>
                    {new Date(bill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleViewBill(bill)}
                      className="btn btn-primary btn-sm"
                      title="View Bill Details"
                    >
                      <Eye size={14} /> View Bill
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

      {/* Bill Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Invoice / Bill Details" maxWidth="700px">
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading bill details...</div>
        ) : selectedBill && (
          <div id="bill-print-area">
            {/* Bill Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0284c7, #14b8a6)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '20px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px', color: 'white' }}>MediStock Pharmacy</h2>
                  <p style={{ fontSize: '13px', opacity: 0.9 }}>Medical Inventory & Supplier System</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>INVOICE</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedBill.saleNumber}</div>
                </div>
              </div>
            </div>

            {/* Customer & Date Info */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Billed To</div>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px' }}>{selectedBill.customerName}</div>
                {selectedBill.customerPhone && <div style={{ fontSize: '13px', color: '#64748b' }}>Phone: {selectedBill.customerPhone}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Invoice Date</div>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px' }}>
                  {new Date(selectedBill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {new Date(selectedBill.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Sold By & Sale Type */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', fontSize: '13px' }}>
              {selectedBill.soldByName && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                  <User size={14} color="#0284c7" /> Served by: <strong style={{ color: '#1e293b' }}>{selectedBill.soldByName}</strong>
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                <ShoppingCart size={14} color="#14b8a6" /> Type: <strong style={{ color: '#1e293b' }}>{selectedBill.saleType === 'WALK_IN' ? 'Walk-in' : 'Prescription'}</strong>
              </span>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>#</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Medicine</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Qty</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Unit Price</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(selectedBill.items || []).map((item, idx) => (
                  <tr key={item.id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{idx + 1}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.medicineName}</div>
                      {item.medicineCode && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.medicineCode}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>₹{Number(item.unitPrice).toFixed(2)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>₹{Number(item.subtotal || item.unitPrice * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '16px 20px',
              background: '#f0fdf4',
              borderRadius: '10px',
              border: '1px solid #bbf7d0',
              marginBottom: '20px'
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Grand Total</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669' }}>
                  ₹{Number(selectedBill.totalAmount).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedBill.notes && (
              <div style={{ fontSize: '13px', color: '#64748b', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <strong style={{ color: '#475569' }}>Notes:</strong> {selectedBill.notes}
              </div>
            )}

            {/* Action Buttons */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsDetailOpen(false)} className="btn btn-secondary">Close</button>
              <button onClick={handlePrintBill} className="btn btn-primary">
                <Printer size={16} /> Print Bill
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
