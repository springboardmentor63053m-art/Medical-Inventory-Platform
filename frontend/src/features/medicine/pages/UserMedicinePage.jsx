import React, { useState, useEffect } from 'react';
import { medicineService } from '../../../services/api/medicineService';
import { categoryService } from '../../../services/api/categoryService';
import { inventoryService } from '../../../services/api/inventoryService';
import { useAuth } from '../../../contexts/AuthContext';
import { supplierService } from '../../../services/api/supplierService';
import StatusBadge from '../../../components/common/StatusBadge';
import UserMedicineDetailsModal from '../components/UserMedicineDetailsModal';
import SupplierAddMedicineModal from '../components/SupplierAddMedicineModal';
import { toast } from 'react-toastify';
import {
  Pill,
  Boxes,
  Search,
  Eye,
  RefreshCw,
  Info,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Truck
} from 'lucide-react';

export default function UserMedicinePage() {
  const { isSupplier } = useAuth();
  const [masterMedicines, setMasterMedicines] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inventoryByMedicine, setInventoryByMedicine] = useState({});

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');

  // Pagination State
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  // View Modal State
  const [viewMedicine, setViewMedicine] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [errorMsg, setErrorMsg] = useState(null);

  const handleRemoveMedicine = async (med) => {
    if (!window.confirm(`Are you sure you want to remove "${med.name}" from your supplier catalog?`)) return;
    try {
      await supplierService.removeMyMedicine(med.id);
      toast.success(`Removed "${med.name}" from your supplier catalog.`);
      fetchMedicines();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to remove "${med.name}"`);
    }
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const fetchMedicines = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [data, inventory] = await Promise.all([
        medicineService.getAllMedicines(0, 500),
        inventoryService.getAllInventory()
      ]);
      const list = data && data.content ? data.content : Array.isArray(data) ? data : [];
      setMasterMedicines(list);
      setMedicines(list);

      const inventoryMap = (Array.isArray(inventory) ? inventory : []).reduce((map, row) => {
        const id = String(row.medicine?.id || row.medicineId);
        const current = map[id] || { quantity: 0, minimumStock: 0 };
        map[id] = {
          quantity: current.quantity + Number(row.quantity || 0),
          minimumStock: Math.max(current.minimumStock, Number(row.minimumStock || 0))
        };
        return map;
      }, {});
      setInventoryByMedicine(inventoryMap);
    } catch (err) {
      console.error('Failed to load medicines for user view:', err);
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        setErrorMsg('You do not have permission to access the medicine catalog.');
      } else if (status >= 500) {
        setErrorMsg('Unable to load the medicine catalog. Please try again.');
      } else if (!err.response) {
        setErrorMsg('Unable to connect to the server.');
      } else {
        setErrorMsg('Unable to load the medicine catalog. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [cats, sups] = await Promise.all([
        categoryService.getAllCategories(),
        supplierService.getAllSuppliers()
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setSuppliers(Array.isArray(sups) ? sups : []);
    } catch (err) {
      console.error('Failed to load categories/suppliers for filter:', err);
    }
  };

  useEffect(() => {
    fetchDropdownData();
    fetchMedicines();
  }, []);

  const filteredMedicines = masterMedicines.filter((m) => {
    if (!m) return false;
    if (selectedCategory && String(m.category?.id) !== String(selectedCategory)) return false;
    if (selectedSupplier) {
      const linkedSuppliers = m.suppliers || [];
      const hasSupplier = linkedSuppliers.some((s) => String(s.id) === String(selectedSupplier) || s.supplierCode === selectedSupplier);
      if (!hasSupplier) return false;
    }
    if (searchTerm.trim()) {
      const query = searchTerm.trim().toLowerCase();
      const codeMatch = (m.medicineCode || '').toLowerCase().includes(query);
      const nameMatch = (m.name || '').toLowerCase().includes(query);
      const genericMatch = (m.genericName || '').toLowerCase().includes(query);
      const manufacturerMatch = (m.manufacturer || '').toLowerCase().includes(query);
      const dosageMatch = (m.dosage || '').toLowerCase().includes(query);
      const catMatch = (m.category?.name || '').toLowerCase().includes(query);
      return codeMatch || nameMatch || genericMatch || manufacturerMatch || dosageMatch || catMatch;
    }
    return true;
  });

  const totalElements = filteredMedicines.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const paginatedMedicines = filteredMedicines.slice(page * pageSize, (page + 1) * pageSize);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-6 h-6 text-blue-600" /> {isSupplier ? 'Supplier Medicine Catalog' : 'Browse Medicines'}
            </h1>
            <span className="px-3 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">
              {isSupplier ? `My Medicines: ${masterMedicines.length}` : `Total Catalog: ${masterMedicines.length}`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isSupplier
              ? 'View and manage medicines associated with your supplier account.'
              : 'Search medicine formulations, view active dosage specifications, generic names, and pricing.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          {isSupplier && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Medicine
            </button>
          )}
          <button
            onClick={fetchMedicines}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-2 text-xs font-bold"
            title="Refresh medicines"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              placeholder="Search by medicine brand name, generic name, code, or manufacturer..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shrink-0 shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          <button
            onClick={() => {
              setSelectedCategory('');
              setPage(0);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
              selectedCategory === ''
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(selectedCategory === String(cat.id) ? '' : String(cat.id));
                setPage(0);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedCategory === String(cat.id)
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Supplier Filter Dropdown */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
            <Truck className="w-3.5 h-3.5 text-slate-400" /> Supplier:
          </span>
          <select
            value={selectedSupplier}
            onChange={(e) => {
              setSelectedSupplier(e.target.value);
              setPage(0);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.supplierName} ({s.supplierCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Medicines Display Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-7 h-7 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-xs font-medium">Loading medicine formulations...</p>
        </div>
      ) : errorMsg ? (
        <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-rose-200 space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-rose-800">{errorMsg}</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setPage(0);
              fetchMedicines();
            }}
            className="px-4 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-100 transition"
          >
            Retry Connection
          </button>
        </div>
      ) : paginatedMedicines.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-4">
          <Pill className="w-10 h-10 text-slate-300 mx-auto" />
          {isSupplier && !searchTerm && !selectedCategory ? (
            <>
              <h3 className="text-base font-bold text-slate-900">No Medicines in Your Catalog</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You are not currently supplying any medicines. Add medicines from the MediStock master catalog to start supplying.
              </p>
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Medicine
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-slate-800">
                {searchTerm || selectedCategory
                  ? 'No medicines match the selected search criteria or category filter.'
                  : 'No medicine formulations currently available in the catalog.'}
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setPage(0);
                  fetchMedicines();
                }}
                className="px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-100 transition"
              >
                {searchTerm || selectedCategory ? 'Clear Search & Filters' : 'Refresh Catalog'}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedMedicines.map((med) => {
            const stock = inventoryByMedicine[String(med.id)] || { quantity: 0 };
            const isAvailable = Number(stock.quantity || 0) > 0;
            return (
            <div
              key={med.id}
              className="p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition bg-white flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                    {med.medicineCode}
                  </span>
                  <StatusBadge status={isAvailable ? 'ACTIVE' : 'OUT_OF_STOCK'} label={isAvailable ? 'Available' : 'Out of Stock'} />
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-1.5 line-clamp-1">{med.name}</h3>
                {med.genericName && (
                  <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">{med.genericName}</p>
                )}

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Category:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 font-semibold rounded-full text-[11px] max-w-[180px] truncate" title={med.category?.name || 'General'}>
                      {med.category?.name || 'General'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dosage:</span>
                    <span className="font-medium text-slate-700">{med.dosage || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Manufacturer:</span>
                    <span className="font-medium text-slate-700 line-clamp-1">{med.manufacturer || 'Standard'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Unit Price</span>
                  <span className="text-sm font-black text-slate-900">{formatINR(med.unitPrice)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isSupplier && (
                    <button
                      onClick={() => handleRemoveMedicine(med)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition border border-rose-100"
                      title="Remove from your supplier catalog"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setViewMedicine({
                        ...med,
                        status: isAvailable ? 'ACTIVE' : 'OUT_OF_STOCK',
                        stockQuantity: stock.quantity,
                        minimumStock: stock.minimumStock
                      });
                      setViewModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 text-xs">
          <span className="text-slate-500">
            Page <span className="font-bold text-slate-900">{page + 1}</span> of{' '}
            <span className="font-bold text-slate-900">{totalPages}</span> ({totalElements} filtered / {masterMedicines.length} total medicines)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* View Medicine Details Modal */}
      {viewModalOpen && viewMedicine && (
        <UserMedicineDetailsModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          medicine={viewMedicine}
          allMedicines={medicines}
          onSelectRelated={(rel) => setViewMedicine(rel)}
        />
      )}

      {/* Supplier Add Medicine Modal */}
      {isSupplier && (
        <SupplierAddMedicineModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          suppliedMedicineIds={medicines.map((m) => m.id)}
          onSuccess={() => {
            fetchMedicines();
            fetchCategories();
          }}
        />
      )}
    </div>
  );
}
