import React, { useState, useEffect } from 'react';
import { medicineService } from '../../../services/api/medicineService';
import { prescriptionService } from '../../../services/api/prescriptionService';
import { toast } from 'react-toastify';
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  AlertCircle,
  Store,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  Search,
  ShoppingCart,
  Loader2,
  FileCheck,
  Building2
} from 'lucide-react';

export default function PrescriptionOrderPage() {
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'my-orders'
  const [medicines, setMedicines] = useState([]);
  const [loadingMeds, setLoadingMeds] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [cart, setCart] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [prescriptionFileUrl, setPrescriptionFileUrl] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // My Orders State
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    fetchMedicines();
    fetchMyOrders();
  }, []);

  const fetchMedicines = async () => {
    setLoadingMeds(true);
    try {
      const data = await medicineService.getAllMedicines(0, 100);
      setMedicines(data.content || []);
    } catch (err) {
      toast.error('Failed to load medicine catalog');
    } finally {
      setLoadingMeds(false);
    }
  };

  const fetchMyOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await prescriptionService.getMyOrders();
      setMyOrders(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.genericName && m.genericName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addToCart = (med) => {
    const existing = cart.find((item) => item.id === med.id);
    if (existing) {
      setCart(cart.map((item) => (item.id === med.id ? { ...item, quantity: item.quantity + 1 } : item)));
    } else {
      setCart([...cart, { ...med, quantity: 1 }]);
    }
    toast.info(`Added ${med.name} to order`);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
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

  const hasNonRxItemInCart = cart.some((item) => item.prescriptionRequired === false);
  const hasRxItemInCart = cart.some((item) => item.prescriptionRequired !== false);
  const requiresStoreVisitNotice = hasNonRxItemInCart && !prescriptionFileUrl.trim() && !hasRxItemInCart;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Please add at least one medicine to your order');
      return;
    }
    if (!patientName.trim() || !deliveryAddress.trim() || !contactPhone.trim()) {
      toast.error('Please fill in Patient Name, Delivery Address, and Contact Phone');
      return;
    }

    // Policy check: If user wants non-prescription medicine without prescription file
    if (requiresStoreVisitNotice) {
      toast.warn('Non-prescription purchases require visiting the nearest physical store to purchase directly through a Pharmacist.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patientName: patientName.trim(),
        doctorName: doctorName.trim(),
        prescriptionFileUrl: prescriptionFileUrl.trim() || 'https://medistock.demo/prescriptions/default_rx.pdf',
        deliveryAddress: deliveryAddress.trim(),
        contactPhone: contactPhone.trim(),
        notes: notes.trim(),
        items: cart.map((item) => ({
          medicineId: item.id,
          quantity: item.quantity,
        })),
      };

      const res = await prescriptionService.createPrescriptionOrder(payload);
      toast.success(`Order ${res.orderNumber} placed successfully! Routed for Pharmacist verification.`);

      // Reset form
      setCart([]);
      setPatientName('');
      setDoctorName('');
      setPrescriptionFileUrl('');
      setNotes('');
      fetchMyOrders();
      setActiveTab('my-orders');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit prescription order';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 w-fit">
            <Clock className="w-3.5 h-3.5" /> Pending Pharmacist Verification
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" /> Prescription Verified
          </span>
        );
      case 'DISPATCHED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5 w-fit">
            <FileCheck className="w-3.5 h-3.5" /> Order Dispatched
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 w-fit">
            <AlertCircle className="w-3.5 h-3.5" /> Prescription Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-xl">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-white tracking-tight">Prescription Ordering Portal</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  Rx Verification Protocol
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Upload your doctor prescription to order online. Non-prescription / OTC purchases without prescription require visiting our physical store counter.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'new' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" /> Place New Order
            </button>
            <button
              onClick={() => setActiveTab('my-orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'my-orders' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" /> Order History ({myOrders.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'new' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Medicine Selection (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-400" /> Select Medicines
                </h2>
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search medicine catalog..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {loadingMeds ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="text-xs font-medium">Loading medicines catalog...</span>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {filteredMedicines.map((med) => (
                    <div
                      key={med.id}
                      className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 hover:border-blue-500/30 transition flex items-center justify-between gap-3 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-blue-400 transition">
                            {med.name}
                          </span>
                          {med.prescriptionRequired ? (
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400">
                              Rx Required
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                              <Store className="w-3 h-3" /> Store OTC
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {med.genericName} • {med.dosage} • {med.manufacturer}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-emerald-400">
                          ${med.unitPrice ? med.unitPrice.toFixed(2) : '0.00'}
                        </span>
                        <button
                          onClick={() => addToCart(med)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 hover:border-blue-500 text-blue-300 hover:text-white text-xs font-bold transition flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Cart & Prescription Upload Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShoppingCart className="w-4 h-4 text-blue-400" /> Order Summary ({cart.length})
              </h2>

              {/* STORE VISIT NOTICE WARNING */}
              {requiresStoreVisitNotice && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
                  <div className="flex items-start gap-2.5">
                    <Store className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-200">Physical Store Visit Required</h4>
                      <p className="text-[11px] text-amber-300/90 leading-relaxed mt-0.5">
                        You have non-prescription medicines in your cart. If you do not have a doctor's prescription to upload, please visit our physical pharmacy store to purchase directly through a Pharmacist.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Your cart is empty. Select medicines from the catalog to build your order.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-semibold text-slate-200 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400">${(item.unitPrice || 0).toFixed(2)} each</p>
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
                    <span className="text-emerald-400">${calculateTotal()}</span>
                  </div>
                </div>
              )}

              {/* Prescription Upload & Patient Details Form */}
              <form onSubmit={handleSubmitOrder} className="space-y-3.5 pt-2 border-t border-slate-800">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Upload Prescription File / Document <span className="text-blue-400">(Image/PDF)</span>
                  </label>
                  <div className="relative">
                    <Upload className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={prescriptionFileUrl}
                      onChange={(e) => setPrescriptionFileUrl(e.target.value)}
                      placeholder="e.g. https://medistock.demo/uploads/rx_001.pdf"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">Patient Name *</label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">Doctor Name</label>
                    <input
                      type="text"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      placeholder="e.g. Dr. A. Smith"
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Delivery Address *</label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. 123 Health Ave, Suite 400"
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +1 800-555-0199"
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || cart.length === 0}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting Order...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Submit Order for Pharmacist Verification
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* MY ORDERS TAB */
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Clock className="w-4 h-4 text-blue-400" /> My Prescription Orders
          </h2>

          {loadingOrders ? (
            <div className="py-12 flex justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : myOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No orders placed yet. Switch to "Place New Order" tab to order medicines.
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((ord) => (
                <div key={ord.id} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-white">{ord.orderNumber}</span>
                        {getStatusBadge(ord.status)}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Patient: <strong className="text-slate-200">{ord.patientName}</strong> • Placed on {new Date(ord.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400">Total:</span>
                      <p className="text-base font-black text-emerald-400">${(ord.totalAmount || 0).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {ord.items?.map((item) => (
                      <div key={item.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-200">{item.medicineName}</p>
                          <p className="text-[10px] text-slate-400">Qty: {item.quantity} × ${item.unitPrice?.toFixed(2)}</p>
                        </div>
                        <span className="font-bold text-slate-300">${item.subtotal?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {ord.pharmacistNotes && (
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                      <strong>Pharmacist Review Note:</strong> {ord.pharmacistNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
