import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supplierService } from '../../../services/api/supplierService';
import { medicineService } from '../../../services/api/medicineService';
import { purchaseOrderService } from '../../../services/api/purchaseOrderService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import Modal from '../../../components/common/Modal';
import StatusBadge from '../../../components/common/StatusBadge';
import FormField from '../../../components/common/FormField';
import {
  Truck,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Loader2,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  User,
  AlertCircle,
  Building2,
  Pill,
  Link as LinkIcon,
  Unlink,
  ExternalLink,
  CheckCircle2,
  ShoppingCart,
  Calendar,
  ArrowLeft
} from 'lucide-react';

import { getMedicinesSupplied } from '../../../utils/dataHelpers';

export default function SupplierListPage() {
  const navigate = useNavigate();
  const { isAdmin, isPharmacist, isSupplier } = useAuth();
  const canManage = isAdmin ;

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Column Sorting
  const [sortField, setSortField] = useState('supplierName');
  const [sortDirection, setSortDirection] = useState('asc');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [viewSupplier, setViewSupplier] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Link medicine state
  const [availableMedicines, setAvailableMedicines] = useState([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [linking, setLinking] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState(null);

  // Multi-Medicine Order state with Review Confirmation step
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderStep, setOrderStep] = useState('EDIT'); // 'EDIT' | 'REVIEW' | 'SUCCESS'
  const [selectedLineItems, setSelectedLineItems] = useState([]);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('');
  const [orderExpectedDate, setOrderExpectedDate] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [createdPoResult, setCreatedPoResult] = useState(null);

  const initialForm = {
    supplierCode: '',
    supplierName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      if (searchTerm.trim()) {
        const results = await supplierService.searchSuppliers(searchTerm.trim());
        setSuppliers(Array.isArray(results) ? results : []);
      } else {
        const data = await supplierService.getAllSuppliers();
        setSuppliers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMedicines = async () => {
    try {
      const res = await medicineService.getAllMedicines(0, 500);
      const meds = res?.content ? res.content : Array.isArray(res) ? res : [];
      setAvailableMedicines(meds);
    } catch (err) {
      console.error('Failed to load medicines for supplier dropdown:', err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchAvailableMedicines();
  }, [searchTerm]);

  const handleOpenViewModal = async (sup) => {
    setViewSupplier(sup);
    setViewModalOpen(true);
    if (availableMedicines.length === 0) {
      fetchAvailableMedicines();
    }
    // Fetch full fresh details including linked medicines
    try {
      const full = await supplierService.getSupplierById(sup.id);
      setViewSupplier(full);
    } catch (err) {
      console.error('Failed to load supplier details:', err);
    }
  };

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    const autoCode = `SUP-${Date.now().toString().slice(-4)}`;
    setFormData({ ...initialForm, supplierCode: autoCode });
    setModalOpen(true);
  };

  const handleOpenEditModal = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      supplierCode: sup.supplierCode || '',
      supplierName: sup.supplierName || '',
      contactPerson: sup.contactPerson || '',
      phone: sup.phone || '',
      email: sup.email || '',
      address: sup.address || '',
      city: sup.city || '',
      state: sup.state || '',
      country: sup.country || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.supplierCode || !formData.supplierName || !formData.phone || !formData.email) {
      toast.error('Please fill in required fields: Code, Name, Phone, and Email.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingSupplier) {
        await supplierService.updateSupplier(editingSupplier.id, formData);
        toast.success('Supplier updated successfully');
      } else {
        await supplierService.createSupplier(formData);
        toast.success('Supplier created successfully');
      }
      setModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save supplier';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await supplierService.deleteSupplier(deleteId);
      toast.success('Supplier deleted successfully');
      setDeleteId(null);
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete supplier');
    } finally {
      setDeleting(false);
    }
  };

  const handleLinkMedicine = async () => {
    if (!viewSupplier || !selectedMedicineId) {
      toast.error('Please select a medicine to link');
      return;
    }
    setLinking(true);
    try {
      const updated = await supplierService.linkMedicine(viewSupplier.id, selectedMedicineId);
      setViewSupplier(updated);
      toast.success('Medicine linked to supplier successfully');
      setSelectedMedicineId('');
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to link medicine to supplier');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkMedicine = async (medicineId) => {
    if (!viewSupplier || !medicineId) return;
    setUnlinkingId(medicineId);
    try {
      const updated = await supplierService.unlinkMedicine(viewSupplier.id, medicineId);
      setViewSupplier(updated);
      toast.success('Medicine unlinked from supplier');
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unlink medicine');
    } finally {
      setUnlinkingId(null);
    }
  };

  const handleOpenMultiOrderModal = (suppliedMeds = []) => {
    if (!suppliedMeds || suppliedMeds.length === 0) {
      toast.error('No medicines are currently linked to this supplier');
      return;
    }
    const initial = suppliedMeds.length > 0 ? [{ ...suppliedMeds[0], quantity: 100 }] : [];
    setSelectedLineItems(initial);
    setMedicineSearchTerm('');
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setOrderExpectedDate(defaultDate.toISOString().split('T')[0]);
    setOrderStep('EDIT');
    setCreatedPoResult(null);
    setOrderModalOpen(true);
  };

  const handleToggleSelectMedicine = (med) => {
    setSelectedLineItems((prev) => {
      const exists = prev.some((item) => Number(item.id) === Number(med.id));
      if (exists) {
        return prev.filter((item) => Number(item.id) !== Number(med.id));
      } else {
        return [...prev, { ...med, quantity: 100 }];
      }
    });
  };

  const handleUpdateLineItemQty = (medicineId, qty) => {
    const parsed = Math.max(1, Number(qty) || 1);
    setSelectedLineItems((prev) =>
      prev.map((item) => (Number(item.id) === Number(medicineId) ? { ...item, quantity: parsed } : item))
    );
  };

  const handleRemoveLineItem = (medicineId) => {
    setSelectedLineItems((prev) => prev.filter((item) => Number(item.id) !== Number(medicineId)));
  };

  const handleProceedToReview = (e) => {
    if (e) e.preventDefault();
    if (!viewSupplier || selectedLineItems.length === 0 || !orderExpectedDate) {
      toast.error('Please select at least one formulation and specify a delivery date.');
      return;
    }

    if (selectedLineItems.some((item) => !item.quantity || Number(item.quantity) <= 0)) {
      toast.error('Quantities for all selected line items must be greater than 0.');
      return;
    }

    // Proceed to Step 2 (Review) without calling database/API
    setOrderStep('REVIEW');
  };

  const handleConfirmAndSubmitOrder = async () => {
    if (!viewSupplier || selectedLineItems.length === 0 || !orderExpectedDate) {
      toast.error('Please select at least one formulation and specify a delivery date.');
      return;
    }

    setOrderSubmitting(true);
    try {
      const payload = {
        supplierId: Number(viewSupplier.id),
        expectedDelivery: orderExpectedDate,
        status: 'PENDING',
        items: selectedLineItems.map((item) => ({
          medicineId: Number(item.id),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice || 0),
        })),
      };

      const res = await purchaseOrderService.createPurchaseOrder(payload);
      setCreatedPoResult(res);
      setOrderStep('SUCCESS');
      toast.success(
        `Purchase Order ${res.orderNumber || ''} created successfully with ${selectedLineItems.length} line items!`
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit purchase order';
      toast.error(msg);
    } finally {
      setOrderSubmitting(false);
    }
  };

  const sortedSuppliers = [...suppliers].sort((a, b) => {
    let valA = (a[sortField] || '').toString().toLowerCase();
    let valB = (b[sortField] || '').toString().toLowerCase();

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600" /> {isSupplier ? 'My Supplier Profile' : 'Enterprise Supplier Directory'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isSupplier
              ? 'View and manage your supplier account details and supplied formulations.'
              : 'Directory of verified pharmaceutical distributors, manufacturers, and medical supply partners'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSuppliers}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="Refresh supplier list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canManage && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Supplier
            </button>
          )}
        </div>
      </div>

      {/* Search & Sorting Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search suppliers by code, name, or contact person..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
        <div className="text-xs font-medium text-slate-500">
          Showing <span className="font-bold text-slate-800">{sortedSuppliers.length}</span> {isSupplier ? 'vendor profile' : 'registered vendor partners'}
        </div>
      </div>

      {/* Supplier Cards View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            Loading registered suppliers...
          </div>
        ) : sortedSuppliers.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            No suppliers found matching your query.
          </div>
        ) : (
          sortedSuppliers.map((sup) => {
            const suppliedMedsCount = getMedicinesSupplied(sup, availableMedicines).length;
            return (
              <div
                key={sup.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100 font-mono">
                        {sup.supplierCode}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1 leading-tight">
                        {sup.supplierName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenViewModal(sup)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                        title="View Supplier & Supplied Medicines"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canManage && (
                        <button
                          onClick={() => handleOpenEditModal(sup)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Supplier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => setDeleteId(sup.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Supplier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    {sup.contactPerson && (
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{sup.contactPerson}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{sup.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{sup.email}</span>
                    </div>
                    {(sup.city || sup.country) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">
                          {[sup.city, sup.state, sup.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                    <Pill className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-bold text-slate-800">{suppliedMedsCount}</span> Medicines Supplied
                  </span>
                  <StatusBadge status="ACTIVE" label="ACTIVE SUPPLY CHAIN" size="small" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier Profile' : 'Register New Medical Supplier'}
        subtitle="Manage vendor contact credentials, company address, and supply chain details"
        icon={Building2}
        footerActions={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingSupplier ? 'Update Supplier' : 'Register Supplier'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-5">
          {/* SECTION 1: VENDOR IDENTIFICATION */}
          <div className="space-y-3">
            <div className="border-b border-slate-200 pb-1.5">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" /> 1. Vendor Organization & Contact Person
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Supplier Code" required readOnly={!!editingSupplier} helperText="Unique vendor code e.g. SUP-101">
                <input
                  type="text"
                  required
                  readOnly={!!editingSupplier}
                  disabled={!!editingSupplier}
                  value={formData.supplierCode}
                  onChange={(e) => setFormData({ ...formData, supplierCode: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold ${
                    editingSupplier
                      ? 'bg-slate-100 border border-slate-200 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
              </FormField>

              <FormField label="Company / Supplier Name" required>
                <input
                  type="text"
                  required
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  placeholder="e.g. Aurobindo Pharma Ltd"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </FormField>

              <FormField label="Primary Contact Representative">
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="e.g. Dr. Jane Smith"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </FormField>

              <FormField label="Official Phone Number" required>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="Official Email Address" required>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="orders@pharma-distributor.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* SECTION 2: ADDRESS & LOGISTICS */}
          <div className="space-y-3">
            <div className="border-b border-slate-200 pb-1.5">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-purple-600" /> 2. Address & Geographical Location
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormField label="Street Address">
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Pharmaceutical Hub, Sector 62"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>
              </div>

              <FormField label="City">
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Mumbai"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </FormField>

              <FormField label="State / Country">
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="India"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
            </div>
          </div>
        </form>
      </Modal>

      {/* View Details Modal with Medicines Supplied */}
      <Modal
        isOpen={viewModalOpen && viewSupplier !== null}
        onClose={() => setViewModalOpen(false)}
        title={viewSupplier ? viewSupplier.supplierName : 'Supplier Details'}
        subtitle={`Supplier Code: ${viewSupplier?.supplierCode || ''} • Verified Supply Partner`}
        icon={Truck}
        maxWidth="max-w-2xl"
        footerActions={
          <button
            onClick={() => setViewModalOpen(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
          >
            Close Profile
          </button>
        }
      >
        {viewSupplier && (() => {
          const viewSupplierMedicines = getMedicinesSupplied(viewSupplier, availableMedicines);
          return (
            <div className="space-y-6 text-xs text-slate-700">
              {/* SECTION 1: SUPPLIER COMPANY DETAILS */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Building2 className="w-4 h-4 text-blue-600" /> 1. Supplier Company & Contact Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Supplier Code</span>
                    <span className="font-bold text-slate-900 font-mono">{viewSupplier.supplierCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Company Name</span>
                    <span className="font-bold text-slate-900">{viewSupplier.supplierName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Person</span>
                    <span className="font-bold text-slate-900">{viewSupplier.contactPerson || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
                    <span className="font-bold text-slate-900">{viewSupplier.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Email</span>
                    <span className="font-bold text-blue-600">{viewSupplier.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                    <span className="font-bold text-slate-900">
                      {[viewSupplier.address, viewSupplier.city, viewSupplier.state, viewSupplier.country].filter(Boolean).join(', ') || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: SUPPLIER USER ACCOUNT DETAILS */}
              <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-purple-200/60 pb-2">
                  <User className="w-4 h-4 text-purple-600" /> 2. Linked Supplier User Account
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee ID</span>
                    <span className="font-mono font-bold text-purple-800">{viewSupplier.employeeId || 'SUP001'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Login Account Email</span>
                    <span className="font-bold text-slate-900">{viewSupplier.accountEmail || viewSupplier.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Role</span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-extrabold text-[10px] rounded-md border border-purple-200 inline-block">
                      SUPPLIER
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: MEDICINES SUPPLIED (REAL DATABASE RELATIONSHIP) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-2">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <Pill className="w-4 h-4 text-blue-600" /> 3. Medicines Supplied by this Supplier
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                      {viewSupplierMedicines.length} Linked
                    </span>
                  </h4>
                  {canManage && viewSupplierMedicines.length > 0 && (
                    <button
                      onClick={() => handleOpenMultiOrderModal(viewSupplierMedicines)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition self-start sm:self-auto"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> + Create Purchase Order
                    </button>
                  )}
                </div>

                {/* LINK MEDICINE BAR (Admin & Pharmacist) */}
                {canManage && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-center gap-2">
                    <div className="flex-1 w-full">
                      <select
                        value={selectedMedicineId}
                        onChange={(e) => setSelectedMedicineId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Select a medicine to link to {viewSupplier.supplierName} --</option>
                        {availableMedicines
                          .filter(m => !viewSupplierMedicines.some(sm => Number(sm.id) === Number(m.id)))
                          .map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.medicineCode}) - {m.manufacturer} [{formatINR(m.unitPrice)}]
                            </option>
                          ))}
                      </select>
                    </div>
                    <button
                      onClick={handleLinkMedicine}
                      disabled={linking || !selectedMedicineId}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs shrink-0 transition"
                    >
                      {linking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LinkIcon className="w-3.5 h-3.5" />}
                      Link Medicine
                    </button>
                  </div>
                )}

                {/* MEDICINES LIST TABLE / CARDS */}
                {viewSupplierMedicines.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                    <Pill className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-700">No medicines are currently linked to this supplier.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Use the dropdown above to link medicines supplied by {viewSupplier.supplierName}.</p>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {viewSupplierMedicines.map((med) => (
                      <div
                        key={med.id}
                        className="p-3 bg-white border border-slate-200 hover:border-blue-300 rounded-xl flex items-center justify-between gap-3 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                            <Pill className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{med.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Code: <span className="font-bold text-slate-700">{med.medicineCode}</span> • Generic: {med.genericName || 'N/A'} • Mfg: {med.manufacturer || 'Mfg'} • Dosage: {med.dosage || 'Form'} • <span className="font-bold text-blue-600">{formatINR(med.unitPrice)}</span>
                            </div>
                          </div>
                        </div>

                        {canManage && (
                          <button
                            onClick={() => handleUnlinkMedicine(med.id)}
                            disabled={unlinkingId === med.id}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition shrink-0"
                            title="Unlink Medicine from Supplier"
                          >
                            {unlinkingId === med.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Multi-Medicine Purchase Order Modal with Final Confirmation Step */}
      {orderModalOpen && viewSupplier && (() => {
        const viewSupplierMedicines = getMedicinesSupplied(viewSupplier, availableMedicines);
        const filteredFormulations = viewSupplierMedicines.filter((m) => {
          if (!medicineSearchTerm.trim()) return true;
          const q = medicineSearchTerm.toLowerCase();
          return (m.name || '').toLowerCase().includes(q) || (m.medicineCode || '').toLowerCase().includes(q) || (m.genericName || '').toLowerCase().includes(q);
        });

        const grandTotal = selectedLineItems.reduce((sum, item) => sum + (Number(item.unitPrice || 0) * Number(item.quantity || 0)), 0);
        const totalUnits = selectedLineItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

        // STEP 3: SUCCESS CONFIRMATION SCREEN
        if (orderStep === 'SUCCESS') {
          return (
            <Modal
              isOpen={true}
              onClose={() => setOrderModalOpen(false)}
              title="Purchase Order Created Successfully"
              subtitle="PO header and line items have been persisted in PostgreSQL database"
              icon={CheckCircle2}
              maxWidth="max-w-lg"
              footerActions={
                <>
                  <button
                    onClick={() => {
                      setOrderModalOpen(false);
                      navigate('/purchase-orders');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    View Purchase Orders
                  </button>
                  <button
                    onClick={() => setOrderModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                  >
                    Close
                  </button>
                </>
              }
            >
              <div className="space-y-4 text-xs text-slate-700 py-2">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Purchase Order Number</span>
                    <span className="font-mono font-extrabold text-sm text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-300">
                      {createdPoResult?.orderNumber || 'PO-2026-XXX'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Supplier</span>
                      <span className="font-bold text-slate-900">{viewSupplier.supplierName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Supplier Code</span>
                      <span className="font-bold font-mono text-slate-900">{viewSupplier.supplierCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Formulations Ordered</span>
                      <span className="font-bold text-slate-900">{selectedLineItems.length} Formulations</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-md border border-amber-200 inline-block">
                        PENDING
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs">Total Purchase Value (PostgreSQL):</span>
                  <span className="text-lg font-black text-blue-600">{formatINR(createdPoResult?.totalAmount || grandTotal)}</span>
                </div>
              </div>
            </Modal>
          );
        }

        // STEP 2: BILL REVIEW & CONFIRMATION SCREEN
        if (orderStep === 'REVIEW') {
          return (
            <Modal
              isOpen={true}
              onClose={() => setOrderModalOpen(false)}
              title="Review Purchase Order"
              subtitle="Step 2 of 2: Verify bill details before submitting to PostgreSQL database"
              icon={ShoppingCart}
              maxWidth="max-w-2xl"
              footerActions={
                <>
                  <button
                    type="button"
                    onClick={() => setOrderStep('EDIT')}
                    disabled={orderSubmitting}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back / Edit Order
                  </button>
                  <button
                    onClick={handleConfirmAndSubmitOrder}
                    disabled={orderSubmitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    {orderSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Confirm & Create Purchase Order
                  </button>
                </>
              }
            >
              <div className="space-y-4 text-xs text-slate-700">
                {/* SUPPLIER SUMMARY HEADER */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Supplier</span>
                    <span className="font-bold text-slate-900">{viewSupplier.supplierName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Supplier Code</span>
                    <span className="font-mono font-bold text-slate-900">{viewSupplier.supplierCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Expected Delivery</span>
                    <span className="font-bold text-blue-600">{orderExpectedDate}</span>
                  </div>
                </div>

                {/* BILL TABLE */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 font-extrabold text-slate-700 uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5 text-center w-8">#</th>
                        <th className="p-2.5">Medicine</th>
                        <th className="p-2.5 text-center">Quantity</th>
                        <th className="p-2.5 text-right">Unit Price</th>
                        <th className="p-2.5 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {selectedLineItems.map((item, idx) => {
                        const lineTotal = Number(item.unitPrice || 0) * Number(item.quantity || 0);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-2.5">
                              <span className="font-bold text-slate-900 block">{item.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{item.medicineCode}</span>
                            </td>
                            <td className="p-2.5 text-center font-bold text-slate-900">{item.quantity}</td>
                            <td className="p-2.5 text-right font-mono text-slate-700">{formatINR(item.unitPrice)}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-slate-900">{formatINR(lineTotal)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* BILL TOTAL SUMMARY */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                    <span>Number of Medicines:</span>
                    <span>{selectedLineItems.length} Formulations</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900 border-t border-blue-200/60 pt-1.5">
                    <span>Total Quantity:</span>
                    <span>{totalUnits} Units</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-black text-blue-900 border-t border-blue-200 pt-2">
                    <span className="uppercase tracking-wider text-xs">TOTAL PURCHASE VALUE:</span>
                    <span className="text-xl text-blue-900">{formatINR(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </Modal>
          );
        }

        // STEP 1: EDIT / SELECTION SCREEN
        return (
          <Modal
            isOpen={true}
            onClose={() => setOrderModalOpen(false)}
            title="Create Multi-Medicine Purchase Order"
            subtitle={`Step 1 of 2: Select formulations and configure order quantities for ${viewSupplier.supplierName}`}
            icon={ShoppingCart}
            maxWidth="max-w-2xl"
            footerActions={
              <>
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedToReview}
                  disabled={selectedLineItems.length === 0}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  Review Order ({selectedLineItems.length})
                </button>
              </>
            }
          >
            <form onSubmit={handleProceedToReview} className="space-y-5 text-xs text-slate-700">
              {/* SECTION 1: FORMULATION SELECTOR */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-blue-600" /> Select Approved Formulations ({viewSupplierMedicines.length})
                  </h4>
                  <span className="text-[11px] font-bold text-blue-600">
                    {selectedLineItems.length} Selected
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={medicineSearchTerm}
                    onChange={(e) => setMedicineSearchTerm(e.target.value)}
                    placeholder={`Search formulations supplied by ${viewSupplier.supplierName}...`}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                  {filteredFormulations.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 text-xs">No formulations match your search query</div>
                  ) : (
                    filteredFormulations.map((med) => {
                      const isSelected = selectedLineItems.some((item) => Number(item.id) === Number(med.id));
                      return (
                        <div
                          key={med.id}
                          onClick={() => handleToggleSelectMedicine(med)}
                          className={`p-2.5 flex items-center justify-between cursor-pointer transition select-none ${
                            isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-100/80'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                              <span className="font-bold text-slate-900">{med.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono ml-2">({med.medicineCode})</span>
                            </div>
                          </div>
                          <span className="font-bold text-blue-600 font-mono">{formatINR(med.unitPrice)}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* SECTION 2: CONFIGURED LINE ITEMS TABLE */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <ShoppingCart className="w-4 h-4 text-purple-600" /> Line Items in this Purchase Order ({selectedLineItems.length})
                </h4>

                {selectedLineItems.length === 0 ? (
                  <div className="py-6 text-center bg-amber-50/70 border border-amber-200 rounded-xl text-amber-800 text-xs">
                    Please select at least one formulation above to include in this purchase order.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {selectedLineItems.map((item) => {
                      const lineTotal = Number(item.unitPrice || 0) * Number(item.quantity || 0);
                      return (
                        <div
                          key={item.id}
                          className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex-1">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Unit Price: <span className="font-bold text-slate-700">{formatINR(item.unitPrice)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400 uppercase font-bold">Qty:</span>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                required
                                value={item.quantity}
                                onChange={(e) => handleUpdateLineItemQty(item.id, e.target.value)}
                                className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                              />
                            </div>

                            <div className="w-28 text-right font-bold text-slate-900">
                              {formatINR(lineTotal)}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(item.id)}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION 3: ORDER EXPECTED DATE & TOTAL SUMMARY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <FormField label="Expected Delivery Date" required helperText="Projected shipment arrival date">
                  <input
                    type="date"
                    required
                    value={orderExpectedDate}
                    onChange={(e) => setOrderExpectedDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-col justify-center">
                  <span className="text-[10px] font-extrabold uppercase text-blue-800">Total Purchase Order Value:</span>
                  <span className="text-lg font-black text-blue-900 mt-0.5">{formatINR(grandTotal)}</span>
                </div>
              </div>
            </form>
          </Modal>
        );
      })()}

      {/* Delete Modal */}
      {deleteId && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteId(null)}
          title="Delete Supplier Partner?"
          subtitle="Permanent supplier removal"
          icon={AlertCircle}
          maxWidth="max-w-md"
          footerActions={
            <>
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Delete
              </button>
            </>
          }
        >
          <div className="text-center py-3">
            <p className="text-xs text-slate-600">
              Are you sure you want to delete supplier partner #{deleteId}?
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
