import React, { useState, useEffect } from 'react';
import { medicineService } from '../../../services/api/medicineService';
import { inventoryService } from '../../../services/api/inventoryService';
import { prescriptionService } from '../../../services/api/prescriptionService';
import { toast } from 'react-toastify';
import Modal from '../../../components/common/Modal';
import {
  Store,
  ShoppingCart,
  Plus,
  Trash2,
  Receipt,
  User,
  Phone,
  CreditCard,
  CheckCircle2,
  Printer,
  Search,
  Loader2,
  Building2,
  DollarSign,
  AlertTriangle,
  Package
} from 'lucide-react';

export default function StoreCounterPurchasePage() {
  const [medicines, setMedicines] = useState([]);
  const [loadingMeds, setLoadingMeds] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // POS Counter Cart
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [submitting, setSubmitting] = useState(false);

  // Digital Receipt Modal
  const [completedReceipt, setCompletedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // Past Receipts History
  const [pastPurchases, setPastPurchases] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'history'

  useEffect(() => {
    fetchMedicinesAndStock();
    fetchPastPurchases();
  }, []);

  const fetchMedicinesAndStock = async () => {
    setLoadingMeds(true);
    try {
      const [medsRes, invRes] = await Promise.all([
        medicineService.getAllMedicines(0, 200),
        inventoryService.getAllInventory()
      ]);

      const medsList = medsRes.content || medsRes || [];
      const invList = Array.isArray(invRes) ? invRes : [];

      const stockMap = invList.reduce((acc, inv) => {
        const medId = inv.medicine?.id;
        if (medId) {
          acc[medId] = (acc[medId] || 0) + Number(inv.quantity || 0);
        }
        return acc;
      }, {});

      const medsWithStock = medsList.map((m) => ({
        ...m,
        availableStock: stockMap[m.id] !== undefined ? stockMap[m.id] : 0
      }));

      setMedicines(medsWithStock);
    } catch (err) {
      toast.error('Failed to load medicines catalog & stock');
    } finally {
      setLoadingMeds(false);
    }
  };

  const fetchPastPurchases = async () => {
    setLoadingHistory(true);
    try {
      const data = await prescriptionService.getAllStorePurchases();
      setPastPurchases(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.genericName && m.genericName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addToCart = (med) => {
    const stock = Number(med.availableStock || 0);
    if (stock <= 0) {
      toast.error(`'${med.name}' is out of stock!`);
      return;
    }

    const existing = cart.find((item) => item.id === med.id);
    if (existing) {
      if (existing.quantity + 1 > stock) {
        toast.warning(`Cannot add more than available stock (${stock} units) for '${med.name}'`);
        return;
      }
      setCart(cart.map((item) => (item.id === med.id ? { ...item, quantity: item.quantity + 1 } : item)));
    } else {
      setCart([...cart, { ...med, availableStock: stock, quantity: 1 }]);
    }
    toast.info(`Added ${med.name} to counter sale`);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (delta > 0 && newQty > item.availableStock) {
              toast.warning(`Cannot exceed available stock (${item.availableStock} units) for '${item.name}'`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0).toFixed(2);
  };

  const handlePOSCheckout = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Please add at least one medicine to the POS counter sale');
      return;
    }
    if (!customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    for (const item of cart) {
      if (item.quantity > item.availableStock) {
        toast.error(`Requested quantity for '${item.name}' (${item.quantity}) exceeds available stock (${item.availableStock}).`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        paymentMethod,
        items: cart.map((item) => ({
          medicineId: item.id,
          quantity: item.quantity,
        })),
      };

      const res = await prescriptionService.createStorePurchase(payload);
      toast.success(`Walk-in sale completed! Receipt #${res.receiptNumber}`);

      setCompletedReceipt(res);
      setReceiptModalOpen(true);

      // Reset form & update inventory
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setPaymentMethod('CASH');
      fetchMedicinesAndStock();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete store walk-in checkout');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = (receiptToPrint = completedReceipt) => {
    if (!receiptToPrint) return;

    const itemsHtml = (receiptToPrint.items || [])
      .map(
        (item) => `
        <tr>
          <td style="padding: 6px 4px; border-bottom: 1px solid #f1f5f9;">
            <div style="font-weight: 600; color: #0f172a;">${item.medicineName} ${item.medicineCode ? `(${item.medicineCode})` : ''}</div>
            ${item.genericName ? `<div style="font-size: 9.5px; color: #64748b;">${item.genericName}</div>` : ''}
          </td>
          <td style="padding: 6px 4px; border-bottom: 1px solid #f1f5f9; text-align: center; font-weight: 600;">${item.quantity}</td>
          <td style="padding: 6px 4px; border-bottom: 1px solid #f1f5f9; text-align: right;">₹${(item.unitPrice || 0).toFixed(2)}</td>
          <td style="padding: 6px 4px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700;">₹${(item.subtotal || 0).toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt ${receiptToPrint.receiptNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background: #ffffff;
      color: #000000;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      display: flex;
      justify-content: center;
      padding-top: 5mm;
    }
    .receipt-card {
      width: 115mm;
      max-width: 95%;
      margin: 0 auto;
      padding: 18px 20px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background: #ffffff;
      box-shadow: none;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .header {
      text-align: center;
      padding-bottom: 10px;
      border-bottom: 2px solid #000000;
      margin-bottom: 10px;
    }
    .header h1 {
      font-size: 15px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #000000;
      margin-bottom: 2px;
    }
    .header p {
      font-size: 10px;
      color: #334155;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 10px;
      font-size: 10.5px;
      padding-bottom: 10px;
      border-bottom: 1px dashed #cbd5e1;
      margin-bottom: 10px;
    }
    .meta-grid div {
      color: #334155;
    }
    .meta-grid div strong {
      color: #000000;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      font-size: 10.5px;
    }
    .items-table th {
      text-align: left;
      border-bottom: 1.5px solid #000000;
      padding: 5px 4px;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 9.5px;
      color: #0f172a;
    }
    .totals-area {
      border-top: 1.5px solid #000000;
      padding-top: 6px;
      margin-bottom: 12px;
      font-size: 10.5px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 2px 0;
      color: #334155;
    }
    .row.total {
      font-size: 13px;
      font-weight: 800;
      color: #000000;
      border-top: 1px dashed #000000;
      margin-top: 4px;
      padding-top: 6px;
    }
    .footer {
      text-align: center;
      font-size: 9.5px;
      color: #475569;
      border-top: 1px dashed #cbd5e1;
      padding-top: 8px;
      margin-top: 6px;
    }
  </style>
</head>
<body>
  <div class="receipt-card">
    <div class="header">
      <h1>MEDISTOCK PHARMACY STORE</h1>
      <p>Official Pharmacy Counter POS Receipt</p>
      <p style="font-size: 9px; color: #64748b; margin-top: 1px;">License #: PHARM-2026-MED08</p>
    </div>

    <div class="meta-grid">
      <div>Receipt #: <strong>${receiptToPrint.receiptNumber}</strong></div>
      <div>Date: <strong>${new Date(receiptToPrint.createdAt).toLocaleDateString()}</strong></div>
      <div>Time: <strong>${new Date(receiptToPrint.createdAt).toLocaleTimeString()}</strong></div>
      <div>Customer: <strong>${receiptToPrint.customerName || 'Walk-in Customer'}</strong></div>
      ${receiptToPrint.customerPhone ? `<div>Phone: <strong>${receiptToPrint.customerPhone}</strong></div>` : ''}
      <div>Pharmacist: <strong>${receiptToPrint.pharmacistName || 'Store Pharmacist'}</strong></div>
      <div>Payment Method: <strong>${receiptToPrint.paymentMethod}</strong></div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Item Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals-area">
      <div class="row"><span>Subtotal:</span><span>₹${(receiptToPrint.totalAmount || 0).toFixed(2)}</span></div>
      <div class="row"><span>Tax (GST 0%):</span><span>₹0.00</span></div>
      <div class="row"><span>Discount:</span><span>₹0.00</span></div>
      <div class="row total">
        <span>TOTAL PAID (${receiptToPrint.paymentMethod}):</span>
        <span>₹${(receiptToPrint.totalAmount || 0).toFixed(2)}</span>
      </div>
    </div>

    <div class="footer">
      <p style="font-weight: 700; margin-bottom: 2px;">Thank you for your purchase!</p>
      <p>Please retain this receipt for records & health reference.</p>
    </div>
  </div>
</body>
</html>
    `;

    let iframe = document.getElementById('print-receipt-iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'print-receipt-iframe';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 lg:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-white tracking-tight">In-Store Pharmacist POS Counter</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Direct Store Sales
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Process walk-in non-prescription / OTC customer purchases directly at the pharmacy counter with instant digital receipts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'pos' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" /> POS Counter Sale
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'history' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4" /> Store Receipts History ({pastPurchases.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Medicine Selection (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-400" /> Walk-in Stock Selector
                </h2>
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search medicine..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {loadingMeds ? (
                <div className="py-12 flex justify-center text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {filteredMedicines.map((med) => {
                    const isOutOfStock = Number(med.availableStock || 0) <= 0;
                    return (
                      <div
                        key={med.id}
                        className={`p-3.5 rounded-2xl bg-slate-950/40 border transition flex items-center justify-between gap-3 group ${
                          isOutOfStock ? 'border-rose-900/40 opacity-75' : 'border-slate-800/80 hover:border-emerald-500/30'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                              {med.name}
                            </p>
                            {isOutOfStock ? (
                              <span className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold rounded-md">
                                Out of Stock
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold rounded-md">
                                Stock: {med.availableStock}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            Code: {med.medicineCode} • {med.dosage} • {med.manufacturer}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-emerald-400">
                            ₹{med.unitPrice ? med.unitPrice.toFixed(2) : '0.00'}
                          </span>
                          <button
                            onClick={() => addToCart(med)}
                            disabled={isOutOfStock}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                              isOutOfStock
                                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                : 'bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-300 hover:text-white'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" /> Add
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Counter POS Checkout Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShoppingCart className="w-4 h-4 text-emerald-400" /> Walk-in Basket ({cart.length})
              </h2>

              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Counter basket is empty. Select medicines to start walk-in checkout.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-semibold text-slate-200 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400">₹{(item.unitPrice || 0).toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg">
                          <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-0.5 text-slate-400 hover:text-white">-</button>
                          <span className="px-2 text-slate-200 font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-0.5 text-slate-400 hover:text-white">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-rose-400 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 flex justify-between text-sm font-bold text-white border-t border-slate-800">
                    <span>Total Amount:</span>
                    <span className="text-emerald-400">₹{calculateTotal()}</span>
                  </div>
                </div>
              )}

              {/* Customer & Payment Form */}
              <form onSubmit={handlePOSCheckout} className="space-y-3.5 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Customer Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Walk-in Customer / Alex Vance"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Customer Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. +1 800-555-0123"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['CASH', 'CARD', 'UPI'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPaymentMethod(mode)}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${
                          paymentMethod === mode
                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || cart.length === 0}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing Sale...
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4" /> Complete POS Sale & Issue Receipt
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* PAST RECEIPTS HISTORY TAB */
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Receipt className="w-4 h-4 text-emerald-400" /> Walk-in Store Sales History
          </h2>

          {loadingHistory ? (
            <div className="py-12 flex justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : pastPurchases.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No store receipts recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {pastPurchases.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">{p.receiptNumber}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {p.paymentMethod}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Customer: {p.customerName} • Pharmacist: {p.pharmacistName} • {new Date(p.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-emerald-400">₹{(p.totalAmount || 0).toFixed(2)}</span>
                    <button
                      onClick={() => {
                        setCompletedReceipt(p);
                        setReceiptModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" /> View Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* On-Screen Digital Receipt Modal */}
      {receiptModalOpen && completedReceipt && (
        <Modal
          isOpen={true}
          onClose={() => setReceiptModalOpen(false)}
          title="Digital Store Sales Receipt"
          subtitle={`Receipt #${completedReceipt.receiptNumber}`}
          icon={Receipt}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 py-2 font-mono text-slate-800">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="text-center border-b border-slate-300 pb-3">
                <h3 className="font-black text-base text-slate-900 tracking-tight">MediStock Pharmacy Store</h3>
                <p className="text-[10px] text-slate-500">Official Pharmacy Counter POS Receipt</p>
                <p className="text-[11px] font-bold text-emerald-700 mt-1">{completedReceipt.receiptNumber}</p>
              </div>

              <div className="text-xs space-y-1 text-slate-600">
                <p>Customer: <strong>{completedReceipt.customerName}</strong></p>
                {completedReceipt.customerPhone && <p>Phone: {completedReceipt.customerPhone}</p>}
                <p>Pharmacist: {completedReceipt.pharmacistName}</p>
                <p>Date: {new Date(completedReceipt.createdAt).toLocaleString()}</p>
                <p>Payment: <strong className="text-slate-900">{completedReceipt.paymentMethod}</strong></p>
              </div>

              <div className="border-t border-slate-300 pt-2 space-y-1 text-xs">
                {completedReceipt.items?.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.medicineName} x{item.quantity}</span>
                    <span className="font-bold">₹{item.subtotal?.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-400 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>TOTAL PAID:</span>
                <span className="text-emerald-700">₹{completedReceipt.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => handlePrintReceipt(completedReceipt)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
