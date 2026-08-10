import React, { useState, useEffect } from 'react';
import { medicineService } from '../../../services/api/medicineService';
import { categoryService } from '../../../services/api/categoryService';
import { supplierService } from '../../../services/api/supplierService';
import { toast } from 'react-toastify';
import {
  X,
  Search,
  Plus,
  CheckCircle2,
  Loader2,
  Pill,
  Filter,
  PackageCheck
} from 'lucide-react';

export default function SupplierAddMedicineModal({ isOpen, onClose, suppliedMedicineIds = [], onSuccess }) {
  const [masterMedicines, setMasterMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchMasterCatalog = async () => {
    setLoading(true);
    try {
      const [masterRes, catRes] = await Promise.all([
        medicineService.getMasterCatalog(0, 250, searchTerm.trim(), selectedCategory),
        categoryService.getAllCategories()
      ]);
      const list = masterRes?.content ? masterRes.content : Array.isArray(masterRes) ? masterRes : [];
      setMasterMedicines(list);
      setCategories(Array.isArray(catRes) ? catRes : []);
    } catch (err) {
      console.error('Failed to load master medicine catalog:', err);
      toast.error('Failed to load master medicine catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMasterCatalog();
    }
  }, [isOpen, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMasterCatalog();
  };

  const handleAddMedicine = async (med) => {
    setAddingId(med.id);
    try {
      await supplierService.addMyMedicine(med.id);
      toast.success(`Successfully added "${med.name}" to your supplier catalog!`);
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to add "${med.name}" to catalog`;
      toast.error(msg);
    } finally {
      setAddingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 rounded-2xl border border-blue-400/30 text-blue-400">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Add Medicines from MediStock Master Catalog</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Browse all platform master formulations and add items to your active supplier portfolio.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by medicine name, generic name, or code (e.g. Amoxicillin)..."
              className="w-full pl-10 pr-20 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs font-medium"
            >
              <option value="">All Master Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Catalog List Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-16 text-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
              <p className="text-xs font-semibold">Loading Master Catalog...</p>
            </div>
          ) : masterMedicines.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No Master Formulations Found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your query or category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {masterMedicines.map((med) => {
                const isAlreadySupplied = suppliedMedicineIds.includes(med.id);
                const isAdding = addingId === med.id;

                return (
                  <div
                    key={med.id}
                    className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                      isAlreadySupplied
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200 font-mono">
                          {med.medicineCode || `MED-${med.id}`}
                        </span>
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          {med.category?.name || 'General'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{med.name}</h4>
                      <p className="text-xs text-slate-500 italic mt-0.5">
                        {med.genericName ? `Generic: ${med.genericName}` : 'Pharmaceutical Formulation'}
                      </p>
                      {med.dosage && (
                        <p className="text-[11px] text-slate-600 mt-1 font-medium">
                          Dosage: <span className="text-slate-800">{med.dosage}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-900">
                        ₹{Number(med.unitPrice || 0).toFixed(2)}
                      </span>

                      {isAlreadySupplied ? (
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-xl inline-flex items-center gap-1.5 border border-emerald-200">
                          <PackageCheck className="w-3.5 h-3.5" /> Supplied
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddMedicine(med)}
                          disabled={isAdding}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                          {isAdding ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          Add to Catalog
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing master catalog medicines. Adding items automatically links them to your active supplier portfolio.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
