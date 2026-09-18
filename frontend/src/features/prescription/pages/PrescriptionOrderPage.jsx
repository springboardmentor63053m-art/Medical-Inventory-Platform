import React, { useState, useEffect } from 'react';
import { medicineService } from '../../../services/api/medicineService';
import { prescriptionService } from '../../../services/api/prescriptionService';
import { inventoryService } from '../../../services/api/inventoryService';
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
  const [inventoryByMedicine, setInventoryByMedicine] = useState({});
  const [loadingMeds, setLoadingMeds] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [cart, setCart] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState(null);
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
      const [data, inventory] = await Promise.all([
        medicineService.getAllMedicines(0, 250),
        inventoryService.getAllInventory()
      ]);
      setMedicines(data.content || []);
      const inventoryMap = (Array.isArray(inventory) ? inventory : []).reduce((map, row) => {
        const id = String(row.medicine?.id || row.medicineId);
        map[id] = (map[id] || 0) + Number(row.quantity || 0);
        return map;
      }, {});
      setInventoryByMedicine(inventoryMap);
    } catch (err) {
      toast.error('Failed to load medicine catalog', { toastId: 'load-meds-error' });
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
    const available = inventoryByMedicine[String(med.id)] || 0;
    if (available <= 0) {
      toast.warn(`${med.name} is out of stock`);
      return;
    }
    if (existing) {
      if (existing.quantity >= available) {
        toast.warn(`Maximum available stock reached for ${med.name}`);
        return;
      }
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
            const available = inventoryByMedicine[String(item.id)] || 0;
            return newQty > 0 && newQty <= available ? { ...item, quantity: newQty } : (newQty <= 0 ? null : item);
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0).toFixed(2);
  };

  const rxItemsInCart = cart.filter((item) => item.prescriptionRequired !== false);
  const hasRxItemInCart = rxItemsInCart.length > 0;
  const rxItemNames = rxItemsInCart.map((i) => i.name).join(', ');
  const requiresPrescription = hasRxItemInCart;

  const isFormValid =
    cart.length > 0 &&
    patientName.trim().length >= 2 &&
    deliveryAddress.trim().length >= 5 &&
    /^[+]?[0-9\s\-\(\)]{7,20}$/.test(contactPhone.trim()) &&
    (!hasRxItemInCart || (prescriptionFile && doctorName.trim().length > 0));

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Please add at least one medicine to your order');
      return;
    }
    if (patientName.trim().length < 2) {
      toast.error('Please enter a valid Patient Name (at least 2 characters)');
      return;
    }
    if (deliveryAddress.trim().length < 5) {
      toast.error('Please enter a valid Delivery Address (at least 5 characters)');
      return;
    }
    if (!/^[+]?[0-9\s\-\(\)]{7,20}$/.test(contactPhone.trim())) {
      toast.error('Please enter a valid Contact Phone number');
      return;
    }

    if (hasRxItemInCart) {
      if (!prescriptionFile) {
        toast.error(`Prescription required for: ${rxItemNames}`);
        return;
      }
      if (!doctorName.trim()) {
        toast.error('Doctor Name is required when ordering prescription medicines');
        return;
      }
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        patientName: patientName.trim(),
        doctorName: doctorName.trim(),
        deliveryAddress: deliveryAddress.trim(),
        contactPhone: contactPhone.trim(),
        notes: notes.trim(),
        items: cart.map((item) => ({
          medicineId: item.id,
          quantity: item.quantity,
        })),
      };

      const formData = new FormData();
      formData.append('order', new Blob([JSON.stringify(orderPayload)], { type: 'application/json' }));
      if (prescriptionFile) formData.append('prescriptionFile', prescriptionFile);
      const res = await prescriptionService.createPrescriptionOrder(formData);
      toast.success(`Order ${res.orderNumber} placed successfully! Routed for Pharmacist verification.`);

      // Reset form
      setCart([]);
      setPatientName('');
      setDoctorName('');
      setPrescriptionFile(null);
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
      case 'PENDING_REVIEW':
      case 'PENDING_VERIFICATION':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 w-fit">
            <Clock className="w-3.5 h-3.5" /> Pending Pharmacist Review
          </span>
        );
      case 'APPROVED':
      case 'VERIFIED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" /> Prescription Approved
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" /> Order Completed
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
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 rounded-3xl p-6 lg:p-8 border border-blue-100 dark:border-slate-800 shadow-xs dark:shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Prescription Ordering Portal</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  Rx Verification Protocol
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Upload your doctor prescription to order online. Non-prescription / OTC purchases without prescription require visiting our physical store counter.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'new' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" /> Place New Order
            </button>
            <button
              onClick={() => setActiveTab('my-orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'my-orders' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 dark:border-slate-800/80 shadow-xs dark:shadow-xl">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Select Medicines
                </h2>
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search medicine catalog..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  {searchQuery && filteredMedicines.length > 0 && filteredMedicines.some(med => med.prescriptionRequired === false) && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-200">
                      {filteredMedicines.find(med => med.prescriptionRequired === false)?.name} is an Over-The-Counter (OTC) medicine and does not require prescription verification. Please purchase it through the store counter.
                    </div>
                  )}
                  {filteredMedicines.map((med) => (
                    <div
                      key={med.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 hover:border-blue-500/50 dark:hover:border-blue-500/30 transition flex items-center justify-between gap-3 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                            {med.name}
                          </span>
                          {med.prescriptionRequired ? (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                              Rx Required
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> OTC / No Prescription Required
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {med.genericName} • {med.dosage} • {med.manufacturer}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{med.unitPrice ? med.unitPrice.toFixed(2) : '0.00'}
                        </span>
                        {inventoryByMedicine[String(med.id)] > 0 ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                            Available
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                            Out of Stock
                          </span>
                        )}
                        <button
                          onClick={() => addToCart(med)}
                          disabled={!inventoryByMedicine[String(med.id)] || (inventoryByMedicine[String(med.id)] || 0) <= 0}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-600 dark:hover:bg-blue-600 border border-blue-200 dark:border-blue-500/30 hover:border-blue-600 text-blue-600 dark:text-blue-300 hover:text-white dark:hover:text-white text-xs font-bold transition flex items-center gap-1 disabled:opacity-40 disabled:hover:bg-blue-50 disabled:hover:border-blue-200 disabled:hover:text-blue-600"
                        >
                          <Plus className="w-3.5 h-3.5" /> {(inventoryByMedicine[String(med.id)] || 0) > 0 ? 'Add' : 'Unavailable'}
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
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 dark:border-slate-800/80 shadow-xs dark:shadow-xl space-y-5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <ShoppingCart className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Order Summary ({cart.length})
              </h2>

              {/* DYNAMIC PRESCRIPTION STATUS BANNER */}
              {cart.length > 0 && (
                hasRxItemInCart ? (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Prescription Required
                    </div>
                    <p className="text-[11px] text-amber-700/90 dark:text-amber-300/90 leading-relaxed">
                      Your order contains prescription medicines: <strong>{rxItemNames}</strong>. Upload a valid prescription from your doctor before submitting.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> No Prescription Required
                    </div>
                    <p className="text-[11px] text-emerald-700/90 dark:text-emerald-300/90 leading-relaxed">
                      All selected medicines in your cart are available as Over-The-Counter (OTC) products.
                    </p>
                  </div>
                )
              )}

              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  Your cart is empty. Select medicines from the catalog to build your order.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                          {item.name}
                          {item.prescriptionRequired !== false ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">Rx</span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">OTC</span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">₹{(item.unitPrice || 0).toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                          <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-0.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">-</button>
                          <span className="px-2 text-slate-800 dark:text-slate-200 font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-0.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 flex justify-between text-sm font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800">
                    <span>Total Amount:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">₹{calculateTotal()}</span>
                  </div>
                </div>
              )}

              {/* Prescription Upload & Patient Details Form */}
              <form onSubmit={handleSubmitOrder} className="space-y-3.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Upload Prescription File / Document {hasRxItemInCart && <span className="text-rose-500">*</span>} <span className="text-blue-600 dark:text-blue-400">(Image/PDF)</span>
                  </label>
                  <div className="relative">
                    <Upload className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
                          toast.error('Prescription must be a PDF, JPG, JPEG, or PNG');
                          e.target.value = '';
                          return;
                        }
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error('Prescription file must be 10 MB or smaller');
                          e.target.value = '';
                          return;
                        }
                        setPrescriptionFile(file);
                      }}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {prescriptionFile && (
                    <div className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/80 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="truncate flex items-center gap-1.5 text-blue-600 dark:text-blue-300">
                        <FileCheck className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> {prescriptionFile.name}
                      </span>
                      <button type="button" onClick={() => setPrescriptionFile(null)} className="text-rose-500 hover:text-rose-600 font-bold ml-2">Remove</button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Patient Name *</label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Doctor Name {hasRxItemInCart ? '*' : '(Optional)'}</label>
                    <input
                      type="text"
                      required={hasRxItemInCart}
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      placeholder="e.g. Dr. A. Smith"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Delivery Address *</label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. 123 Health Ave, Suite 400"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +1 800-555-0199"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || cart.length === 0 || (hasRxItemInCart && !prescriptionFile)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting Order...
                    </>
                  ) : hasRxItemInCart && !prescriptionFile ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-300" /> Prescription Required to Place Order
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
        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 dark:border-slate-800/80 shadow-xs dark:shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" /> My Prescription Orders
          </h2>

          {loadingOrders ? (
            <div className="py-12 flex justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : myOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
              No orders placed yet. Switch to "Place New Order" tab to order medicines.
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((ord) => (
                <div key={ord.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-slate-900 dark:text-white">{ord.orderNumber}</span>
                        {getStatusBadge(ord.status)}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Patient: <strong className="text-slate-700 dark:text-slate-200">{ord.patientName || ord.userFullName || 'Patient information unavailable'}</strong> • Placed on {new Date(ord.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Total:</span>
                      <p className="text-base font-black text-emerald-600 dark:text-emerald-400">₹{(ord.totalAmount || 0).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {ord.items?.map((item) => (
                      <div key={item.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{item.medicineName}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Qty: {item.quantity} × ₹{item.unitPrice?.toFixed(2)}</p>
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">₹{item.subtotal?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {ord.pharmacistNotes && (
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
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
