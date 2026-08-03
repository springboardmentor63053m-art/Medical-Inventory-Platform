import React, { useState, useEffect } from 'react';
import { categoryService } from '../../../services/api/categoryService';
import { medicineService } from '../../../services/api/medicineService';
import { inventoryService } from '../../../services/api/inventoryService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  Boxes,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
  Pill,
  AlertTriangle,
  CheckCircle2,
  FolderKanban,
  BarChart2,
  Clock
} from 'lucide-react';

export default function CategoryListPage() {
  const { isAdmin, isPharmacist, isUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      if (isUser) {
        // Normal USER only fetches authorized Category & Medicine data; zero Inventory API calls
        const [cats, meds] = await Promise.all([
          categoryService.getAllCategories(),
          medicineService.getAllMedicines(0, 500).catch(() => [])
        ]);
        setCategories(Array.isArray(cats) ? cats : []);
        const medList = meds?.content ? meds.content : Array.isArray(meds) ? meds : [];
        setMedicines(medList);
        setInventory([]);
      } else {
        const [cats, meds, inv] = await Promise.all([
          categoryService.getAllCategories(),
          medicineService.getAllMedicines(0, 500).catch(() => []),
          inventoryService.getAllInventory().catch(() => [])
        ]);
        setCategories(Array.isArray(cats) ? cats : []);
        const medList = meds?.content ? meds.content : Array.isArray(meds) ? meds : [];
        setMedicines(medList);
        const invList = Array.isArray(inv) ? inv : [];
        setInventory(invList);
      }
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name || '', description: cat.description || '' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await categoryService.createCategory(formData);
        toast.success('Category created successfully');
      }
      setModalOpen(false);
      fetchAllData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save category';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await categoryService.deleteCategory(deleteId);
      toast.success('Category deleted successfully');
      setDeleteId(null);
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  // Compute metric breakdown per category
  const categoryMetrics = categories.map((cat) => {
    const catMeds = medicines.filter((m) => m.category?.id === cat.id || m.category?.name === cat.name);
    const medCount = catMeds.length;

    let lowStockCount = 0;
    let outOfStockCount = 0;

    catMeds.forEach((m) => {
      // Find inventory batch for medicine
      const itemBatches = inventory.filter((inv) => inv.medicine?.id === m.id);
      const totalQty = itemBatches.reduce((acc, b) => acc + (b.quantity || 0), 0);
      const reorderLevel = m.reorderLevel ?? 10;

      if (totalQty === 0) {
        outOfStockCount++;
      } else if (totalQty <= reorderLevel) {
        lowStockCount++;
      }
    });

    return {
      ...cat,
      medCount,
      lowStockCount,
      outOfStockCount,
      lastUpdated: 'Today'
    };
  });

  // KPI Calculations
  const totalCategories = categories.length;
  const totalMedicines = medicines.length;

  const largestCatObj = categoryMetrics.reduce(
    (max, cur) => (cur.medCount > (max?.medCount || 0) ? cur : max),
    null
  );
  const largestCategoryName = largestCatObj ? `${largestCatObj.name} (${largestCatObj.medCount} meds)` : 'N/A';

  const categoriesWithLowStock = categoryMetrics.filter(
    (c) => c.lowStockCount > 0 || c.outOfStockCount > 0
  ).length;

  const filteredMetrics = categoryMetrics.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-blue-600" /> Pharmaceutical Category Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize, monitor stock health, and manage pharmaceutical categories across the medical catalog
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {(isAdmin || isPharmacist) && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          )}
        </div>
      </div>

      {/* KPI Dashboard Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Categories */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Categories</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalCategories}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Active Classifications</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Medicines */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Medicines</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalMedicines}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Categorized Catalog Items</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Pill className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Largest Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Largest Category</p>
            <h3 className="text-base font-bold text-slate-900 mt-1 truncate max-w-[150px]" title={largestCategoryName}>
              {largestCategoryName}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Most Cataloged Items</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <BarChart2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Categories with Low Stock */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Stock Risk Alert</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{categoriesWithLowStock}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Categories with Low Stock</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories by name or description..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
        <div className="text-xs font-medium text-slate-500">
          Showing <span className="font-bold text-slate-800">{filteredMetrics.length}</span> of{' '}
          <span className="font-bold text-slate-800">{categories.length}</span> categories
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Category Name</th>
                <th className="py-3.5 px-6">Number of Medicines</th>
                <th className="py-3.5 px-6">Low Stock Medicines</th>
                <th className="py-3.5 px-6">Out of Stock</th>
                <th className="py-3.5 px-6">Status Health</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Loading category health metrics...
                  </td>
                </tr>
              ) : filteredMetrics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No categories found matching search parameters.
                  </td>
                </tr>
              ) : (
                filteredMetrics.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition">
                    {/* Category Name & Description */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          <Boxes className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{cat.name}</div>
                          <p className="text-[11px] text-slate-400 max-w-xs truncate">
                            {cat.description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Number of Medicines */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <Pill className="w-3.5 h-3.5 text-slate-500" />
                        {cat.medCount} Medicines
                      </span>
                    </td>

                    {/* Low Stock Medicines */}
                    <td className="py-4 px-6">
                      {cat.lowStockCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          {cat.lowStockCount} Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Normal
                        </span>
                      )}
                    </td>

                    {/* Out of Stock Medicines */}
                    <td className="py-4 px-6">
                      {cat.outOfStockCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          {cat.outOfStockCount} Depleted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                        </span>
                      )}
                    </td>

                    {/* Status Health */}
                    <td className="py-4 px-6">
                      {cat.lowStockCount === 0 && cat.outOfStockCount === 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          HEALTHY
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          ATTENTION REQ
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(isAdmin || isPharmacist) && (
                          <button
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Category"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteId(cat.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Boxes className="w-4 h-4 text-blue-600" />
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Antibiotics, Analgesics, Vaccines"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Category purpose or therapeutic details..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-75"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-slate-100 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Delete Category?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to delete category #{deleteId}? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
