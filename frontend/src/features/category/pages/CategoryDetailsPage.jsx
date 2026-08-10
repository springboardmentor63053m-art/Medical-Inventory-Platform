import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { categoryService } from '../../../services/api/categoryService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import Modal from '../../../components/common/Modal';
import {
  ArrowLeft,
  Boxes,
  Pill,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Edit3,
  Trash2,
  Loader2,
  RefreshCw,
  Info,
  Layers,
  Building2,
  IndianRupee,
  ShieldAlert
} from 'lucide-react';

export default function CategoryDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isPharmacist } = useAuth();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state inside category
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | IN_STOCK | LOW_STOCK | OUT_OF_STOCK

  // Edit category modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  // Medicine Details Modal State
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const fetchCategoryDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getCategoryDetails(id);
      setDetails(data);
      setEditForm({ name: data.name || '', description: data.description || '' });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to load category details';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryDetails();
  }, [id]);

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    setSubmittingEdit(true);
    try {
      await categoryService.updateCategory(id, editForm);
      toast.success('Category details updated successfully');
      setEditModalOpen(false);
      fetchCategoryDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update category');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeleteCategory = async () => {
    setSubmittingDelete(true);
    try {
      await categoryService.deleteCategory(id);
      toast.success('Category deleted successfully');
      navigate('/categories');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
      setDeleteModalOpen(false);
    } finally {
      setSubmittingDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-500 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-xs font-semibold">Loading real PostgreSQL category details...</p>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="p-8 max-w-2xl mx-auto font-sans text-center">
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <h2 className="text-base font-bold">Category Not Found</h2>
          <p className="text-xs text-rose-700">{error || 'Unable to retrieve category details.'}</p>
          <button
            onClick={() => navigate('/categories')}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Categories
          </button>
        </div>
      </div>
    );
  }

  // Filtering medicines
  const filteredMedicines = (details.medicines || []).filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (med.genericName && med.genericName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (med.medicineCode && med.medicineCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || med.stockStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-12">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Categories
        </Link>

        <button
          onClick={fetchCategoryDetails}
          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Category Details Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-2xs">
            <Boxes className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{details.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVE CATEGORY
              </span>
              <span className="text-xs font-semibold text-slate-400">ID: #{details.id}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {details.description || 'No specific description documented for this category classification.'}
            </p>
          </div>
        </div>

        {(isAdmin || isPharmacist) && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setEditModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Category
            </button>
            {isAdmin && (
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Category Summary Metrics (Calculated from Real PostgreSQL Database) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Medicines */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Total Medicines</p>
          <h3 className="text-xl font-bold text-slate-900 mt-0.5">{details.totalMedicines}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Formulations</p>
        </div>

        {/* In Stock */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-emerald-600">In Stock</p>
          <h3 className="text-xl font-bold text-emerald-700 mt-0.5">{details.inStockCount}</h3>
          <p className="text-[10px] text-emerald-600/70 mt-0.5">Healthy Inventory</p>
        </div>

        {/* Low Stock */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-amber-600">Low Stock</p>
          <h3 className="text-xl font-bold text-amber-700 mt-0.5">{details.lowStockCount}</h3>
          <p className="text-[10px] text-amber-600/70 mt-0.5">Below Threshold</p>
        </div>

        {/* Out of Stock */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-rose-600">Out of Stock</p>
          <h3 className="text-xl font-bold text-rose-700 mt-0.5">{details.outOfStockCount}</h3>
          <p className="text-[10px] text-rose-600/70 mt-0.5">Depleted Items</p>
        </div>

        {/* Active Catalog */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-blue-600">Active Formulations</p>
          <h3 className="text-xl font-bold text-blue-700 mt-0.5">{details.activeCount}</h3>
          <p className="text-[10px] text-blue-600/70 mt-0.5">Available for Sale</p>
        </div>

        {/* Inactive Catalog */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Inactive Items</p>
          <h3 className="text-xl font-bold text-slate-700 mt-0.5">{details.inactiveCount}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Archived</p>
        </div>
      </div>

      {/* Section 1: Low Stock Medicines Alert (If Any) */}
      {details.lowStockMedicines && details.lowStockMedicines.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Low Stock Medicines ({details.lowStockMedicines.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {details.lowStockMedicines.map((item) => (
              <div key={item.id} className="bg-white p-3.5 rounded-2xl border border-amber-200/80 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-[11px] text-slate-500">{item.medicineCode} • {item.dosage}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-700">Stock: {item.currentStock}</span>
                  <p className="text-[10px] text-slate-400">Min: {item.reorderLevel} (Short: {item.shortage})</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Out of Stock Medicines Alert */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" /> Out of Stock Medicines
        </h3>

        {!details.outOfStockMedicines || details.outOfStockMedicines.length === 0 ? (
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/70 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            No medicines are currently out of stock in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {details.outOfStockMedicines.map((item) => (
              <div key={item.id} className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-rose-950">{item.name}</p>
                  <p className="text-[11px] text-rose-700">{item.medicineCode} • {item.dosage}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-rose-700">Stock: 0</span>
                  <p className="text-[10px] text-rose-600">Reorder Req: {item.reorderLevel}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Expiring Soon Batches (If Any) */}
      {details.expiringBatches && details.expiringBatches.length > 0 && (
        <div className="bg-purple-50/60 border border-purple-200 rounded-3xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" /> Expiring Soon Batches (Next 90 Days)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {details.expiringBatches.map((batch) => (
              <div key={batch.inventoryId} className="bg-white p-3.5 rounded-2xl border border-purple-200 text-xs flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">{batch.medicineName}</p>
                  <p className="text-[11px] text-slate-500">Batch: {batch.batchNumber} • Loc: {batch.storageLocation || 'Main Store'}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-purple-700">{batch.quantity} units</span>
                  <p className="text-[10px] text-rose-600 font-semibold">Exp: {batch.expiryDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Category Medicines Table & Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Pill className="w-4 h-4 text-blue-600" /> Medicines in "{details.name}" ({filteredMedicines.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Real database inventory and formulations categorized under this class</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search formulation, code..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Stock Health</option>
              <option value="IN_STOCK">In Stock / Healthy</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Medicine Code</th>
                <th className="py-3 px-4">Name & Generic Name</th>
                <th className="py-3 px-4">Dosage / Form</th>
                <th className="py-3 px-4">Manufacturer</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-center">Real Inventory Stock</th>
                <th className="py-3 px-4 text-center">Stock Health</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No medicines found in this category matching search filters.
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => (
                  <tr
                    key={med.id}
                    onClick={() => setSelectedMedicine(med)}
                    className="hover:bg-blue-50/40 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-slate-600">
                      {med.medicineCode}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 hover:text-blue-600 transition">{med.name}</p>
                      <p className="text-[11px] text-slate-400">{med.genericName || 'N/A'}</p>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-600">{med.dosage}</td>
                    <td className="py-3.5 px-4 text-slate-600">{med.manufacturer}</td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ₹{med.unitPrice ? med.unitPrice.toFixed(2) : '0.00'}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold">
                      <span className="text-slate-900">{med.currentStock} units</span>
                      <p className="text-[10px] text-slate-400 font-normal">Min: {med.reorderLevel}</p>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {med.stockStatus === 'IN_STOCK' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          IN STOCK
                        </span>
                      )}
                      {med.stockStatus === 'LOW_STOCK' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          LOW STOCK
                        </span>
                      )}
                      {med.stockStatus === 'OUT_OF_STOCK' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          OUT OF STOCK
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          med.status === 'ACTIVE'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {med.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Edit Category Modal */}
      {editModalOpen && (
        <Modal title="Edit Category" isOpen={editModalOpen} onClose={() => setEditModalOpen(false)}>
          <form onSubmit={handleUpdateCategory} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1.5"
              >
                {submittingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 2: Delete Category Confirmation Modal */}
      {deleteModalOpen && (
        <Modal title="Delete Category" isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
          <div className="space-y-4 text-xs text-slate-700">
            <div className="flex items-center gap-3 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl">
              <ShieldAlert className="w-6 h-6 text-rose-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Are you sure you want to delete this category?</p>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Category: <strong>{details.name}</strong>
                </p>
              </div>
            </div>

            <p className="text-slate-600">
              This action checks real database relationships. If any medicines are assigned to this category, deletion will be blocked safely to preserve inventory stock integrity.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={submittingDelete}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition flex items-center gap-1.5"
              >
                {submittingDelete && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 3: Selected Medicine Quick Details Modal */}
      {selectedMedicine && (
        <Modal title="Medicine Details" isOpen={Boolean(selectedMedicine)} onClose={() => setSelectedMedicine(null)}>
          <div className="space-y-4 font-sans text-xs text-slate-700">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedMedicine.name}</h3>
                <p className="text-[11px] text-slate-500">Generic: {selectedMedicine.genericName || 'N/A'}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 font-mono font-bold text-[10px] rounded">
                  {selectedMedicine.medicineCode}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-600">₹{selectedMedicine.unitPrice ? selectedMedicine.unitPrice.toFixed(2) : '0.00'}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Unit Price</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <p className="text-slate-400 text-[10px]">Dosage / Formulation</p>
                <p className="font-semibold text-slate-800">{selectedMedicine.dosage}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <p className="text-slate-400 text-[10px]">Manufacturer</p>
                <p className="font-semibold text-slate-800">{selectedMedicine.manufacturer}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <p className="text-slate-400 text-[10px]">Real Inventory Stock</p>
                <p className="font-bold text-slate-900">{selectedMedicine.currentStock} units</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <p className="text-slate-400 text-[10px]">Minimum Threshold</p>
                <p className="font-bold text-slate-900">{selectedMedicine.reorderLevel} units</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedMedicine(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
