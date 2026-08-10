import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  RefreshCw, 
  FileText, 
  Calendar, 
  User, 
  Phone, 
  X,
  CreditCard,
  DollarSign
} from 'lucide-react';

const SalesHistory = () => {
  const { user } = useAuth();
  
  // Data States
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  
  // Details Modal
  const [selectedSale, setSelectedSale] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/sales');
      if (response.data.success) {
        setSales(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to retrieve sales records.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error loading sales history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const openSaleDetails = async (saleId) => {
    setModalLoading(true);
    try {
      const response = await api.get(`/sales/${saleId}`);
      if (response.data.success) {
        setSelectedSale(response.data.data);
      } else {
        alert(response.data.message || 'Failed to retrieve invoice details.');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error retrieving invoice details.');
    } finally {
      setModalLoading(false);
    }
  };

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;

      return (
        (sale.invoiceNumber && sale.invoiceNumber.toLowerCase().includes(query)) ||
        (sale.customerName && sale.customerName.toLowerCase().includes(query)) ||
        (sale.customerPhone && sale.customerPhone.toLowerCase().includes(query)) ||
        (sale.createdByUsername && sale.createdByUsername.toLowerCase().includes(query)) ||
        (sale.paymentMethod && sale.paymentMethod.toLowerCase().includes(query))
      );
    });
  }, [sales, searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: 'white', marginBottom: '4px' }}>
            Sales History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            View completed transactions, invoice receipts, and pharmacist audit trails.
          </p>
        </div>
        
        <button 
          onClick={fetchSales} 
          className="btn btn-secondary" 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-filter-bar" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div className="search-input-wrap" style={{ flex: 1 }}>
          <Search />
          <input
            type="text"
            placeholder="Search by invoice #, customer name, phone, or staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Card */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <div>Loading sales ledger...</div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="card">
          {filteredSales.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '60px 0' }}>
              No sale transactions matching your query.
            </div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Date & Time</th>
                    <th>Customer</th>
                    <th>Sold By</th>
                    <th style={{ width: '120px' }}>Pay Mode</th>
                    <th style={{ textAlign: 'right' }}>Total Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} style={{ color: 'var(--primary)' }} />
                          <button
                            onClick={() => openSaleDetails(sale.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              color: 'var(--primary)',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: 'inherit',
                              fontFamily: 'inherit',
                              textAlign: 'left'
                            }}
                          >
                            {sale.invoiceNumber}
                          </button>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {formatDate(sale.saleDate)}
                      </td>
                      <td>
                        {sale.customerName ? (
                          <div>
                            <div style={{ color: 'white', fontWeight: 500 }}>{sale.customerName}</div>
                            {sale.customerPhone && (
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{sale.customerPhone}</div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Walk-in Customer</span>
                        )}
                      </td>
                      <td style={{ color: 'white', fontWeight: 500 }}>
                        {sale.createdByUsername || 'N/A'}
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: sale.paymentMethod === 'CASH' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: sale.paymentMethod === 'CASH' ? 'var(--warning)' : 'var(--primary)'
                        }}>
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)', fontSize: '0.95rem' }}>
                        ₹{sale.finalAmount?.toFixed(2)}
                        {sale.discountAmount > 0 && (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 400 }}>
                            Disc: -₹{sale.discountAmount?.toFixed(2)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sale Detail Modal Overlay */}
      {selectedSale && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(5, 7, 13, 0.85)', zIndex: 1000, padding: '20px' }}>
          <div className="card modal-content" style={{
            maxWidth: '600px',
            width: '100%',
            padding: '28px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }}>
            
            {/* Header: Fixed */}
            <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--primary)', margin: 0, letterSpacing: '0.5px' }}>
                  MEDISTOCK
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Medical Inventory Platform
                </p>
              </div>
              <button className="btn-icon" onClick={() => setSelectedSale(null)} style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
              {/* Invoice Info & Metadata Section */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invoice Number</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginTop: '2px' }}>
                  {selectedSale.invoiceNumber}
                </div>
              </div>

              {/* Metadata Section */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px',
                backgroundColor: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <Calendar size={12} />
                    <span>Date & Time</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: 500 }}>
                    {formatDate(selectedSale.saleDate)}
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <User size={12} />
                    <span>Customer Name</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: 500 }}>
                    {selectedSale.customerName || 'Walk-in Customer'}
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <Phone size={12} />
                    <span>Customer Phone</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: 500 }}>
                    {selectedSale.customerPhone || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Medicines List Table */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'white', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ITEMS PURCHASED</h4>
                <div className="table-responsive" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)' }}>
                  <table style={{ width: '100%', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
                        <th>Medicine Name</th>
                        <th style={{ width: '60px', textAlign: 'center' }}>Quantity</th>
                        <th style={{ width: '90px', textAlign: 'right' }}>Unit Price</th>
                        <th style={{ width: '90px', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.items?.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'white' }}>{item.medicineName}</div>
                            {item.medicineCode && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Code: {item.medicineCode}</div>}
                          </td>
                          <td style={{ textAlign: 'center', color: 'white', fontWeight: 500 }}>
                            {item.quantity}
                          </td>
                          <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                            ₹{parseFloat(item.unitPrice).toFixed(2)}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'white' }}>
                            ₹{parseFloat(item.totalPrice).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculations Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Subtotal:</span>
                  <span style={{ color: 'white', fontWeight: 500 }}>₹{selectedSale.totalAmount?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Discount:</span>
                  <span style={{ color: 'var(--danger)', fontWeight: 500 }}>-₹{selectedSale.discountAmount?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Payment Method:</span>
                  <span style={{ color: 'white', fontWeight: 500 }}>{selectedSale.paymentMethod}</span>
                </div>
                
                <hr style={{ border: 'none', borderTop: '1px dashed var(--border-color)', margin: '4px 0' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Grand Total:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--success)' }}>
                    ₹{selectedSale.finalAmount?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer: Fixed */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px', flexShrink: 0 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedSale(null)}
                style={{ padding: '10px 24px', fontSize: '0.9rem' }}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded CSS animation rules */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SalesHistory;
