import React, { useState, useEffect } from 'react';
import { supplierService } from '../../../services/api/supplierService';
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function SupplierListPage() {
  const { isAdmin } = useAuth();
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

  useEffect(() => {
    fetchSuppliers();
  }, [searchTerm]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    const autoCode = `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
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

  const sortedSuppliers = [...suppliers].sort((a, b) => {
    let valA = (a[sortField] || '').toString().toLowerCase();
    let valB = (b[sortField] || '').toString().toLowerCase();

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600" /> Enterprise Supplier Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Directory of verified pharmaceutical distributors, manufacturers, and medical supply partners
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

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Supplier
          </button>
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
          Showing <span className="font-bold text-slate-800">{sortedSuppliers.length}</span> registered vendor partners
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
          sortedSuppliers.map((sup) => (
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
                      onClick={() => {
                        setViewSupplier(sup);
                        setViewModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(sup)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Supplier"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
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
                <span className="text-slate-400">Verified Partner</span>
                <StatusBadge status="ACTIVE" label="ACTIVE SUPPLY CHAIN" size="small" />
              </div>
            </div>
          ))
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
              <FormField label="Supplier Code" required readOnly={!!editingSupplier} helperText="Unique vendor code">
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
                  placeholder="e.g. Apex Health Pharma Distributors"
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

      {/* View Details Modal */}
      <Modal
        isOpen={viewModalOpen && viewSupplier !== null}
        onClose={() => setViewModalOpen(false)}
        title="Supplier Enterprise Profile"
        subtitle="Complete vendor credentials & logistics parameters"
        icon={Truck}
        maxWidth="max-w-md"
        footerActions={
          <button
            onClick={() => setViewModalOpen(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
          >
            Close Profile
          </button>
        }
      >
        {viewSupplier && (
          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-semibold">Supplier Code:</span>
              <span className="font-mono font-bold text-slate-900">{viewSupplier.supplierCode}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-semibold">Company Name:</span>
              <span className="font-bold text-slate-900">{viewSupplier.supplierName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-semibold">Contact Representative:</span>
              <span>{viewSupplier.contactPerson || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-semibold">Official Phone:</span>
              <span className="font-bold text-slate-800">{viewSupplier.phone}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-semibold">Official Email:</span>
              <span className="text-blue-600 font-semibold">{viewSupplier.email}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-semibold">Headquarters:</span>
              <span>{[viewSupplier.address, viewSupplier.city, viewSupplier.country].filter(Boolean).join(', ') || 'N/A'}</span>
            </div>
          </div>
        )}
      </Modal>

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
