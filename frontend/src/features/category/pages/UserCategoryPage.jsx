import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../../services/api/categoryService';
import { medicineService } from '../../../services/api/medicineService';
import Modal from '../../../components/common/Modal';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  Boxes,
  Pill,
  Search,
  Eye,
  RefreshCw,
  Sparkles,
  FolderKanban,
  ArrowRight,
  Info,
  CheckCircle2
} from 'lucide-react';

export default function UserCategoryPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected category modal state
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [catsRes, medsRes] = await Promise.all([
        categoryService.getAllCategories().catch(() => []),
        medicineService.getAllMedicines(0, 500).catch(() => [])
      ]);

      const cats = Array.isArray(catsRes) ? catsRes : [];
      const meds = medsRes?.content ? medsRes.content : Array.isArray(medsRes) ? medsRes : [];

      setCategories(cats);
      setMedicines(meds);
    } catch (err) {
      console.error('Failed to load category data for user view:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  // Map category metrics
  const categoryMetrics = categories.map((cat) => {
    const categoryMeds = medicines.filter((m) => m.category?.id === cat.id);
    return {
      ...cat,
      medicineCount: categoryMeds.length,
      medicines: categoryMeds,
    };
  });

  // Calculate Summary Stats
  const totalCategories = categories.length;
  const totalMedicines = medicines.length;

  const popularCategory = [...categoryMetrics].sort(
    (a, b) => b.medicineCount - a.medicineCount
  )[0] || { name: 'N/A', medicineCount: 0 };

  const filteredCategories = categoryMetrics.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenCategoryModal = (cat) => {
    setSelectedCategory(cat);
    setCategorySearch('');
    setCategoryModalOpen(true);
  };

  const modalCategoryMedicines = (selectedCategory?.medicines || []).filter((m) => {
    const q = categorySearch.toLowerCase();
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.genericName || '').toLowerCase().includes(q) ||
      (m.medicineCode || '').toLowerCase().includes(q) ||
      (m.manufacturer || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-blue-600" /> Browse Medicine Categories
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse medicine categories and explore available medicines.
          </p>
        </div>

        <button
          onClick={fetchUserData}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-2 text-xs font-bold shrink-0 self-start sm:self-auto"
          title="Refresh categories"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <p className="text-[11px] text-slate-400 mt-0.5">Formulations in Catalog</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Pill className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Popular Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Popular Category</p>
            <h3 className="text-base font-bold text-purple-900 mt-1 line-clamp-1">
              {popularCategory.name}
            </h3>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">
              {popularCategory.medicineCount} Medicines
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search category by name or therapeutic description..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-7 h-7 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-xs font-medium">Loading medicine categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-3">
          <Boxes className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-800">
            {searchTerm ? 'No categories match your search term.' : 'No medicine categories currently available.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-100 transition"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-110 transition">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-full">
                    {cat.medicineCount} Medicines
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-4 group-hover:text-blue-600 transition">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                  {cat.description || 'Pharmaceutical formulation category for therapeutic care.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenCategoryModal(cat)}
                  className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" /> View Medicines ({cat.medicineCount})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Details & Medicines Modal */}
      {categoryModalOpen && selectedCategory && (
        <Modal
          isOpen={categoryModalOpen}
          onClose={() => setCategoryModalOpen(false)}
          title={`Category: ${selectedCategory.name}`}
        >
          <div className="space-y-4 text-xs text-slate-700 max-h-[75vh] overflow-y-auto pr-1">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-base font-bold text-slate-900">{selectedCategory.name}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {selectedCategory.description || 'Standard therapeutic medicine classification.'}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-100/60 px-3 py-1 rounded-lg">
                <Pill className="w-3.5 h-3.5" /> Total Formulations: {selectedCategory.medicineCount}
              </div>
            </div>

            {/* Filter Search inside Modal */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search medicines within this category..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Medicines List */}
            {modalCategoryMedicines.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <p className="text-xs font-medium">No medicines found matching search in this category.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {modalCategoryMedicines.map((med) => (
                  <div
                    key={med.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-400">
                          {med.medicineCode}
                        </span>
                        <StatusBadge status={med.status} />
                      </div>
                      <div className="font-bold text-slate-900 text-xs mt-0.5">{med.name}</div>
                      {med.genericName && (
                        <div className="text-[11px] text-slate-500 italic">{med.genericName}</div>
                      )}
                      <div className="text-[11px] text-slate-600 mt-1">
                        <span className="font-medium">Dosage:</span> {med.dosage || 'N/A'} • <span className="font-medium">Mfr:</span> {med.manufacturer || 'Standard'}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Price</span>
                      <span className="text-sm font-black text-slate-900">{formatINR(med.unitPrice)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
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
