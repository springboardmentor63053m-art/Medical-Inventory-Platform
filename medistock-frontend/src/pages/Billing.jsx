import React, { useState, useEffect, useRef } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  User,
  Phone,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw
} from 'lucide-react';

const Billing = () => {
  const { user } = useAuth();

  // Cart & Invoice State
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [discountAmount, setDiscountAmount] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // App States
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Success / Receipt Modal
  const [receipt, setReceipt] = useState(null);

  const searchRef = useRef(null);

  // Close search results if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search autocomplete handler
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async () => {
    setSearching(true);
    setError(null);
    try {
      const response = await api.get(`/medicines/search?query=${encodeURIComponent(searchQuery)}`);
      if (response.data.success) {
        setSearchResults(response.data.data || []);
      }
    } catch (err) {
      console.error('Error searching medicines:', err);
    } finally {
      setSearching(false);
    }
  };

  const addToCart = (medicine) => {
    const stock = medicine.currentStock || 0;
    if (stock <= 0) {
      alert(`"${medicine.name}" is out of stock!`);
      return;
    }

    const existingIndex = cart.findIndex((item) => item.id === medicine.id);

    if (existingIndex > -1) {
      const existingItem = cart[existingIndex];
      const currentQty = parseInt(existingItem.quantity) || 0;
      if (currentQty >= stock) {
        alert(`Cannot add more. Only ${stock} units available in inventory.`);
        return;
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity = currentQty + 1;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          id: medicine.id,
          name: medicine.name,
          code: medicine.code,
          price: medicine.price || 0,
          stock: stock,
          quantity: 1
        }
      ]);
    }
    setSearchQuery('');
    setSearchResults([]);
    setSearchFocused(false);
  };

  const updateQuantity = (itemId, newQty) => {
    // Only allow digits/integers (or empty string for clearing during typing)
    if (newQty !== '' && !/^\d+$/.test(newQty)) {
      return;
    }
    const updated = cart.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCart(updated);
  };

  const adjustQtyByStep = (itemId, step) => {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    const currentQty = parseInt(item.quantity) || 0;
    const targetQty = currentQty + step;

    if (targetQty <= 0) {
      removeFromCart(itemId);
      return;
    }

    if (targetQty > item.stock) {
      alert(`Cannot exceed available stock of ${item.stock}.`);
      return;
    }

    updateQuantity(itemId, targetQty);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  // Calculations
  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (parseFloat(item.price) * (parseInt(item.quantity) || 0)), 0);
  };

  const getDiscount = () => {
    const disc = parseFloat(discountAmount);
    return isNaN(disc) || disc < 0 ? 0 : disc;
  };

  const calculateGrandTotal = () => {
    const sub = calculateSubtotal();
    const disc = getDiscount();
    const final = sub - disc;
    return final < 0 ? 0 : final;
  };

  const handleConfirmSale = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Validate quantities
    const invalidItems = cart.filter(item => !item.quantity || parseInt(item.quantity) <= 0);
    if (invalidItems.length > 0) {
      setError('Please enter valid quantities for all items in the cart.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const salePayload = {
      customerName: customerName.trim() || null,
      customerPhone: customerPhone.trim() || null,
      paymentMethod: paymentMethod,
      discountAmount: getDiscount(),
      items: cart.map(item => ({
        medicineId: item.id,
        quantity: parseInt(item.quantity)
      }))
    };

    try {
      const response = await api.post('/sales', salePayload);
      if (response.data.success) {
        setReceipt(response.data.data);
        // Reset POS fields
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setDiscountAmount('');
      } else {
        setError(response.data.message || 'Sale confirmation failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error occurred while confirming sale.');
    } finally {
      setSubmitting(false);
    }
  };

  // Validate cart quantities
  const isCartInvalid = cart.length === 0 || cart.some(item => {
    const qVal = parseInt(item.quantity);
    return isNaN(qVal) || qVal <= 0 || qVal > item.stock;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: 'white', marginBottom: '4px' }}>
            Point of Sale
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Create customer invoices and update medicine inventory instantly.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* POS Two-Column Workspace */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>

        {/* Left Column: Cart items & Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Medicine Search Card */}
          <div className="card" style={{ padding: '24px', position: 'relative', overflow: 'visible', zIndex: 20 }} ref={searchRef}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}>
              Add Medicines to Bill
            </h3>

            <div className="search-input-wrap" style={{ width: '100%', position: 'relative' }}>
              <Search style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Type medicine name or code (min 2 chars)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchFocused(true);
                }}
                onFocus={() => setSearchFocused(true)}
              />
              {searching && (
                <RefreshCw
                  size={16}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    color: 'var(--primary)',
                    animation: 'spin 1s linear infinite'
                  }}
                />
              )}

              {/* Autocomplete Dropdown List */}
              {searchFocused && (searchQuery.trim().length >= 2 || searchResults.length > 0) && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  backgroundColor: '#121829',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-md)',
                  boxShadow: 'var(--card-shadow)',
                  zIndex: 100,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  padding: '8px'
                }}>
                  {searchResults.length === 0 ? (
                    <div style={{ padding: '12px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
                      {searching ? 'Searching...' : 'No medicines found.'}
                    </div>
                  ) : (
                    searchResults.map((med) => {
                      const isLowStock = med.currentStock <= med.reorderLevel;
                      const isOutOfStock = med.currentStock === 0;

                      return (
                        <div
                          key={med.id}
                          onClick={() => !isOutOfStock && addToCart(med)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 12px',
                            borderRadius: 'var(--border-radius-sm)',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                            backgroundColor: 'transparent',
                            transition: 'background 0.2s',
                            opacity: isOutOfStock ? 0.5 : 1
                          }}
                          onMouseOver={(e) => !isOutOfStock && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div>
                            <div style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{med.name}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                              Code: {med.code} | Exp: {med.expiryDate || 'N/A'}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.95rem' }}>
                              ₹{med.price?.toFixed(2)}
                            </div>
                            <div style={{
                              fontSize: '0.8rem',
                              fontWeight: 500,
                              color: isOutOfStock ? 'var(--danger)' : isLowStock ? 'var(--warning)' : 'var(--text-muted)'
                            }}>
                              Stock: {med.currentStock}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart Details Card */}
          <div className="card" style={{ padding: '24px', zIndex: 1 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}>
              Current Invoice Items
            </h3>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <Receipt size={40} style={{ strokeWidth: 1.5, marginBottom: '12px', color: 'rgba(255,255,255,0.15)' }} />
                <p style={{ fontSize: '0.95rem' }}>POS Cart is empty. Search and add medicines above.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th style={{ width: '100px', textAlign: 'right' }}>Price</th>
                      <th style={{ width: '140px', textAlign: 'center' }}>Quantity</th>
                      <th style={{ width: '100px', textAlign: 'right' }}>Total</th>
                      <th style={{ width: '50px', textAlign: 'right' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ color: 'white', fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Code: {item.code} | Stock: <span style={{ color: 'var(--text-secondary)' }}>{item.stock}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 500, color: 'white' }}>
                          ₹{parseFloat(item.price).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {(() => {
                            const qVal = parseInt(item.quantity);
                            const isQtyError = item.quantity === '' || isNaN(qVal) || qVal <= 0 || qVal > item.stock;
                            return (
                              <>
                                <div style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  border: isQtyError ? '1px solid var(--danger)' : '1px solid var(--border-color)',
                                  borderRadius: 'var(--border-radius-sm)',
                                  overflow: 'hidden'
                                }}>
                                  <button
                                    type="button"
                                    onClick={() => adjustQtyByStep(item.id, -1)}
                                    style={{ border: 'none', background: 'rgba(255,255,255,0.02)', color: 'white', padding: '6px 10px', cursor: 'pointer' }}
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <input
                                    type="text"
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.id, e.target.value)}
                                    style={{
                                      width: '45px',
                                      border: 'none',
                                      borderLeft: isQtyError ? '1px solid var(--danger)' : '1px solid var(--border-color)',
                                      borderRight: isQtyError ? '1px solid var(--danger)' : '1px solid var(--border-color)',
                                      background: 'transparent',
                                      color: 'white',
                                      textAlign: 'center',
                                      padding: '6px 0',
                                      fontSize: '0.85rem',
                                      outline: 'none'
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => adjustQtyByStep(item.id, 1)}
                                    style={{ border: 'none', background: 'rgba(255,255,255,0.02)', color: 'white', padding: '6px 10px', cursor: 'pointer' }}
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                                {item.quantity === '' && (
                                  <div style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '4px' }}>Required</div>
                                )}
                                {item.quantity !== '' && (isNaN(qVal) || qVal <= 0) && (
                                  <div style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '4px' }}>Must be &ge; 1</div>
                                )}
                                {item.quantity !== '' && !isNaN(qVal) && qVal > item.stock && (
                                  <div style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '4px' }}>Exceeds stock ({item.stock})</div>
                                )}
                              </>
                            );
                          })()}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>
                          ₹{(parseFloat(item.price) * (parseInt(item.quantity) || 0)).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn-icon delete"
                            onClick={() => removeFromCart(item.id)}
                            style={{ padding: '6px', opacity: 0.8 }}
                            title="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout Summary & Customer Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Customer & Checkout Details Card */}
          <form className="card" onSubmit={handleConfirmSale} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', fontFamily: 'Outfit, sans-serif' }}>
              Checkout Details
            </h3>

            {/* Customer Name */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                <User size={14} />
                <span>Customer Name (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Customer Phone */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                <Phone size={14} />
                <span>Customer Phone (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Payment Method */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                <CreditCard size={14} />
                <span>Payment Method</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              >
                <option value="CASH">Cash Payment</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="UPI">UPI Digital Payment</option>
              </select>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

            {/* Checkout Pricing Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal:</span>
                <span style={{ color: 'white', fontWeight: 500 }}>₹{calculateSubtotal().toFixed(2)}</span>
              </div>

              {/* Discount Input */}
              <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Discount Amount:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'white', fontSize: '0.9rem', marginRight: '2px' }}>₹</span>
                  <input
                    type="number"
                    min="0"
                    max={calculateSubtotal()}
                    step="0.01"
                    placeholder="0.00"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    disabled={submitting || cart.length === 0}
                    style={{
                      width: '90px',
                      padding: '6px 8px',
                      borderRadius: 'var(--border-radius-sm)',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      color: 'white',
                      textAlign: 'right',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px dashed var(--border-color)', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>Grand Total:</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--success)' }}>
                  ₹{calculateGrandTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Confirm Checkout Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || isCartInvalid}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--border-radius-md)',
                fontWeight: 600,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '10px',
                cursor: isCartInvalid ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? (
                <>
                  <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Processing Checkout...</span>
                </>
              ) : (
                <>
                  <Receipt size={18} />
                  <span>Confirm Sale & Print</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Invoice Receipt Modal Overlay */}
      {receipt && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(5, 7, 13, 0.85)', zIndex: 1000, padding: '20px' }}>
          <div className="card modal-content" style={{ maxWidth: '480px', width: '100%', padding: '28px', position: 'relative', border: '1px solid rgba(16, 185, 129, 0.25)', boxShadow: '0 0 30px rgba(16, 185, 129, 0.1)' }}>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--success-glow)', color: 'var(--success)' }}>
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: 'white' }}>
                  Sale Complete
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
                  Invoice generated and stock updated successfully.
                </p>
              </div>
            </div>

            {/* Receipt Summary Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', borderRadius: 'var(--border-radius-md)', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Invoice Number:</span>
                <strong style={{ color: 'white' }}>{receipt.invoiceNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Invoice Date:</span>
                <span style={{ color: 'white' }}>{new Date(receipt.saleDate).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Customer Name:</span>
                <span style={{ color: 'white' }}>{receipt.customerName || 'Walk-in Customer'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Mode:</span>
                <span style={{ color: 'white', fontWeight: 500 }}>{receipt.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Billed By:</span>
                <span style={{ color: 'white' }}>{receipt.createdByUsername || user?.username}</span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px dashed var(--border-color)', margin: '4px 0' }} />

              {/* Items Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <span>Medicine</span>
                  <span>Qty × Price</span>
                  <span style={{ textAlign: 'right' }}>Total</span>
                </div>
                {receipt.items?.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'white', fontWeight: 500 }}>{item.medicineName}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {item.quantity} × ₹{parseFloat(item.unitPrice).toFixed(2)}
                    </span>
                    <span style={{ color: 'white', textAlign: 'right' }}>₹{parseFloat(item.totalPrice).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Discount:</span>
                <span style={{ color: 'var(--danger)' }}>-₹{parseFloat(receipt.discountAmount).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700 }}>
                <span style={{ color: 'white' }}>Total Paid:</span>
                <span style={{ color: 'var(--success)' }}>₹{parseFloat(receipt.finalAmount).toFixed(2)}</span>
              </div>
            </div>

            {/* Modal Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setReceipt(null)}
                style={{ flex: 1, padding: '12px', fontSize: '0.9rem' }}
              >
                Close Invoice
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
      `}</style>
    </div>
  );
};

export default Billing;
