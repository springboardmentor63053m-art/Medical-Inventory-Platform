import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../../services/api/inventoryService';
import { medicineService } from '../../../services/api/medicineService';
import { supplierService } from '../../../services/api/supplierService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import Modal from '../../../components/common/Modal';
import StatusBadge from '../../../components/common/StatusBadge';
import ProgressBar from '../../../components/common/ProgressBar';
import FormField from '../../../components/common/FormField';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Clock,
  Edit3,
  Trash2,
  Loader2,
  RefreshCw,
  AlertCircle,
  Pill,
  MapPin,
  Calendar,
  Layers,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Truck,
  IndianRupee,
  TrendingUp
} from 'lucide-react';

export default function InventoryListPage() {
  const { isAdmin, isPharmacist } = useAuth();
  const canAddEdit = isAdmin || isPharmacist;
  const [inventoryItems, setInventoryItems] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [resolvingMedicine, setResolvingMedicine] = useState(false);
  const [medicineError, setMedicineError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stock Movements State
  const [movements, setMovements] = useState([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementTypeFilter, setMovementTypeFilter] = useState('ALL'); // 'ALL' | 'ADD' | 'ISSUE' | 'RESTOCK'

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'LOW_STOCK' | 'EXPIRING' | 'EXPIRED'

  // Sorting
  const [sortField, setSortField] = useState('batchNumber');
  const [sortDirection, setSortDirection] = useState('asc');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const initialForm = {
    medicineId: '',
    quantity: '',
    minimumStock: '',
    batchNumber: '',
    expiryDate: '',
    storageLocation: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      let data = [];
      if (filterMode === 'LOW_STOCK') {
        data = await inventoryService.getLowStockInventory();
      } else if (filterMode === 'EXPIRED') {
        data = await inventoryService.getExpiredInventory();
      } else if (filterMode === 'EXPIRING') {
        data = await inventoryService.getExpiringInventory(30);
      } else {
        data = await inventoryService.getAllInventory();
      }
      setInventoryItems(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load inventory records');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicinesList = async () => {
    try {
      const res = await medicineService.getAllMedicines(0, 500);
      const list = res && res.content ? res.content : Array.isArray(res) ? res : [];
      const validList = Array.isArray(list) ? list : [];
      setMedicines(validList);
      return validList;
    } catch (err) {
      console.error('Failed to fetch medicines dropdown:', err);
      return [];
    }
  };

  const generateUniqueBatchNumber = (existingItems) => {
    const year = new Date().getFullYear();
    const existingBatches = new Set((existingItems || []).map((i) => (i.batchNumber || '').toUpperCase()));
    
    let maxSeq = 0;
    (existingItems || []).forEach((item) => {
      if (item.batchNumber) {
        const match = item.batchNumber.match(/(?:BATCH|BAT)-(?:20\d\d-)?(\d+)/i);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq;
          }
        }
      }
    });

    let nextSeq = maxSeq + 1;
    let batchNo = `BATCH-${year}-${String(nextSeq).padStart(3, '0')}`;
    
    while (existingBatches.has(batchNo.toUpperCase())) {
      nextSeq++;
      batchNo = `BATCH-${year}-${String(nextSeq).padStart(3, '0')}`;
    }

    return batchNo;
  };

  const handleMedicineChange = async (medId) => {
    if (!medId) {
      setSelectedMedicine(null);
      setMedicineError('Please select a medicine item');
      setFormData((prev) => ({
        ...prev,
        medicineId: '',
        minimumStock: '',
        storageLocation: '',
      }));
      return;
    }

    setResolvingMedicine(true);
    setMedicineError(null);

    try {
      let med = medicines.find((m) => String(m.id) === String(medId));
      if (!med) {
        med = await medicineService.getMedicineById(medId);
      }

      if (!med || !med.id) {
        setSelectedMedicine(null);
        setMedicineError('Selected medicine was not found in catalog');
        toast.error('Medicine not found in catalog');
        setFormData((prev) => ({
          ...prev,
          medicineId: String(medId),
          storageLocation: '',
        }));
      } else {
        const existingInv = inventoryItems.find((i) => String(i.medicine?.id || i.medicineId) === String(med.id));
        const resolvedShelf = med.storageLocation || existingInv?.storageLocation || '';

        setSelectedMedicine(med);
        setMedicineError(null);
        setFormData((prev) => ({
          ...prev,
          medicineId: String(med.id),
          minimumStock: med.reorderLevel !== undefined && med.reorderLevel !== null ? med.reorderLevel : '',
          storageLocation: resolvedShelf,
        }));
      }
    } catch (err) {
      console.error('Failed to resolve medicine details:', err);
      setSelectedMedicine(null);
      setMedicineError('Failed to retrieve medicine details from catalog');
      toast.error('Failed to retrieve medicine details from catalog');
    } finally {
      setResolvingMedicine(false);
    }
  };

  const fetchMovements = async () => {
    setMovementsLoading(true);
    try {
      const data = await inventoryService.getStockMovements(movementTypeFilter, searchTerm);
      setMovements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load stock movements:', err);
    } finally {
      setMovementsLoading(false);
    }
  };

  const fetchSuppliersList = async () => {
    try {
      const sups = await supplierService.getAllSuppliers();
      setSuppliers(Array.isArray(sups) ? sups : []);
    } catch (err) {
      console.error('Failed to fetch suppliers dropdown:', err);
    }
  };

  useEffect(() => {
    fetchMedicinesList();
    fetchSuppliersList();
    fetchMovements();
  }, []);

  useEffect(() => {
    fetchInventoryData();
  }, [filterMode]);

  useEffect(() => {
    fetchMovements();
  }, [movementTypeFilter]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleOpenAddModal = async () => {
    setEditingItem(null);
    setMedicineError(null);
    setResolvingMedicine(false);
    const currentMeds = await fetchMedicinesList();
    const defaultMed = currentMeds.length > 0 ? currentMeds[0] : null;
    const newBatchNo = generateUniqueBatchNumber(inventoryItems);

    let defaultShelf = '';
    if (defaultMed) {
      const existingInv = inventoryItems.find((i) => String(i.medicine?.id || i.medicineId) === String(defaultMed.id));
      defaultShelf = defaultMed.storageLocation || existingInv?.storageLocation || '';
    }

    setFormData({
      medicineId: defaultMed ? String(defaultMed.id) : '',
      quantity: '',
      minimumStock: defaultMed?.reorderLevel !== undefined && defaultMed?.reorderLevel !== null ? defaultMed.reorderLevel : '',
      batchNumber: newBatchNo,
      expiryDate: '',
      storageLocation: defaultShelf,
    });
    setSelectedMedicine(defaultMed);
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setMedicineError(null);
    const medId = item.medicine?.id || item.medicineId || '';
    const med = item.medicine || medicines.find((m) => String(m.id) === String(medId)) || null;

    setFormData({
      medicineId: medId ? String(medId) : '',
      quantity: item.quantity !== undefined && item.quantity !== null ? item.quantity : '',
      minimumStock: item.minimumStock !== undefined && item.minimumStock !== null ? item.minimumStock : (med?.reorderLevel ?? ''),
      batchNumber: item.batchNumber || '',
      expiryDate: item.expiryDate || '',
      storageLocation: item.storageLocation || '',
    });
    setSelectedMedicine(med);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (resolvingMedicine) {
      toast.warning('Please wait while medicine catalog details are being resolved');
      return;
    }
    if (!formData.medicineId) {
      toast.error('Please select a valid medicine item from catalog.');
      return;
    }
    if (medicineError || !selectedMedicine) {
      toast.error('Cannot create batch: Selected medicine does not exist in catalog.');
      return;
    }
    if (!formData.batchNumber || !formData.expiryDate || formData.quantity === '' || formData.quantity === null) {
      toast.error('Please fill in required fields: Medicine, Batch Number, Expiration Date, and Quantity.');
      return;
    }

    setSubmitting(true);
    const payload = {
      medicineId: Number(formData.medicineId),
      quantity: Number(formData.quantity),
      minimumStock: Number(formData.minimumStock !== '' ? formData.minimumStock : selectedMedicine.reorderLevel),
      batchNumber: formData.batchNumber,
      expiryDate: formData.expiryDate,
      storageLocation: formData.storageLocation,
    };

    try {
      if (editingItem) {
        await inventoryService.updateInventory(editingItem.id, payload);
        toast.success('Inventory record updated');
      } else {
        await inventoryService.createInventory(payload);
        toast.success('Inventory record added');
      }
      window.dispatchEvent(new Event('medistock-inventory-updated'));
      setModalOpen(false);
      fetchInventoryData();
      fetchMovements();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save inventory record';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await inventoryService.deleteInventory(deleteId);
      toast.success('Inventory record deleted');
      window.dispatchEvent(new Event('medistock-inventory-updated'));
      setDeleteId(null);
      fetchInventoryData();
      fetchMovements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record');
    } finally {
      setDeleting(false);
    }
  };

  const filteredItems = inventoryItems.filter((item) => {
    if (selectedSupplier) {
      const linkedSups = item.medicine?.suppliers || [];
      const hasSup = linkedSups.some((s) => String(s.id) === String(selectedSupplier) || s.supplierCode === selectedSupplier);
      if (!hasSup) return false;
    }
    const medName = item.medicine?.name || '';
    const medCode = item.medicine?.medicineCode || '';
    const batch = item.batchNumber || '';
    const query = searchTerm.toLowerCase();
    return medName.toLowerCase().includes(query) || batch.toLowerCase().includes(query) || medCode.toLowerCase().includes(query);
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'medicineName') {
      valA = (a.medicine?.name || '').toLowerCase();
      valB = (b.medicine?.name || '').toLowerCase();
    } else if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = (valB || '').toLowerCase();
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600 font-bold" /> : <ArrowDown className="w-3 h-3 text-blue-600 font-bold" />;
  };

  const totalStockUnits = inventoryItems.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  const totalRetailValue = inventoryItems.reduce((acc, curr) => {
    const qty = Number(curr.quantity) || 0;
    const price = Number(curr.medicine?.sellingPrice ?? curr.medicine?.unitPrice ?? 0);
    return acc + (qty * price);
  }, 0);
  const totalCostValue = inventoryItems.reduce((acc, curr) => {
    const qty = Number(curr.quantity) || 0;
    const cost = Number(curr.medicine?.costPrice ?? ((curr.medicine?.sellingPrice ?? curr.medicine?.unitPrice ?? 0) * 0.7));
    return acc + (qty * cost);
  }, 0);
  const estimatedProfit = totalRetailValue - totalCostValue;
  const lowStockCount = inventoryItems.filter((i) => (Number(i.quantity) || 0) <= (Number(i.minimumStock) || 0)).length;
  const expiringCount = inventoryItems.filter((i) => {
    if (!i.expiryDate) return false;
    const exp = new Date(`${i.expiryDate}T00:00:00`);
    const today = new Date();
    const limit = new Date(today);
    limit.setDate(limit.getDate() + 30);
    return exp <= limit;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" /> Enterprise Stock & Inventory Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time batch tracking, procurement valuation, selling price thresholds, and shelf location surveillance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventoryData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition"
            title="Refresh stock list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canAddEdit && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Inventory
            </button>
          )}
        </div>
      </div>

      {/* Valuation & Operational KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total In-Stock Units</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{totalStockUnits.toLocaleString()} units</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{inventoryItems.length} active batches</div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Retail Inventory Value</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">₹{totalRetailValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Selling price total asset valuation</div>
          </div>
        </div>

        {canAddEdit ? (
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Procurement Cost & Profit</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">₹{totalCostValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Est. Profit: ₹{estimatedProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Catalog Formulations</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{medicines.length} SKUs</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Available for dispensing</div>
            </div>
          </div>
        )}

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Stock Warnings</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              <span className={lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}>{lowStockCount} low</span>
              {' • '}
              <span className={expiringCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}>{expiringCount} expiring</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Requires replenishment or disposal</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by medicine name, Medicine Code, or Batch Number..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.supplierName} ({s.supplierCode})
              </option>
            ))}
          </select>

          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              filterMode === 'ALL'
                ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            All Batches
          </button>
          <button
            onClick={() => setFilterMode('LOW_STOCK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              filterMode === 'LOW_STOCK'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
          </button>
          <button
            onClick={() => setFilterMode('EXPIRING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              filterMode === 'EXPIRING'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Expiring Soon
          </button>
          <button
            onClick={() => setFilterMode('EXPIRED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              filterMode === 'EXPIRED'
                ? 'bg-red-700 text-white border-red-700'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/60'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" /> Expired
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th
                  onClick={() => handleSort('batchNumber')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Batch No.</span>
                    {renderSortIcon('batchNumber')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('medicineName')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Medicine Formulation</span>
                    {renderSortIcon('medicineName')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('quantity')}
                  className="py-3.5 px-6 w-48 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Visual Stock Health Bar</span>
                    {renderSortIcon('quantity')}
                  </div>
                </th>
                <th className="py-3.5 px-6">
                  <span>Unit Pricing (SP / CP)</span>
                </th>
                <th className="py-3.5 px-6">
                  <span>Batch Value</span>
                </th>
                <th
                  onClick={() => handleSort('storageLocation')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Shelf</span>
                    {renderSortIcon('storageLocation')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('expiryDate')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Expiry Date</span>
                    {renderSortIcon('expiryDate')}
                  </div>
                </th>
                <th className="py-3.5 px-6">Status Badge</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Loading inventory details...
                  </td>
                </tr>
              ) : sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No inventory records match your criteria.
                  </td>
                </tr>
              ) : (
                sortedItems.map((item) => {
                  const quantity = Number(item.quantity ?? 0);
                  const minimumStock = Number(item.minimumStock ?? 0);

                  const sellingPrice = Number(item.medicine?.sellingPrice ?? item.medicine?.unitPrice ?? 0);
                  const costPrice = Number(item.medicine?.costPrice ?? (sellingPrice * 0.7));
                  const batchRetailValue = quantity * sellingPrice;

                  const isOutOfStock = item.isOutOfStock || quantity === 0;
                  const isLowStock =
                    !isOutOfStock &&
                    (item.isLowStock || quantity <= minimumStock);

                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  const expiryDate = item.expiryDate
                    ? new Date(`${item.expiryDate}T00:00:00`)
                    : null;

                  const expiringLimit = new Date(today);
                  expiringLimit.setDate(expiringLimit.getDate() + 30);

                  const isExpired =
                    item.isExpired ||
                    (expiryDate !== null && expiryDate < today);

                  const isExpiringSoon =
                    !isExpired &&
                    expiryDate !== null &&
                    expiryDate >= today &&
                    expiryDate <= expiringLimit;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-4 px-6 font-mono font-semibold text-slate-900 dark:text-white">
                        {item.batchNumber}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 dark:text-white">{item.medicine?.name || `Medicine #${item.medicineId}`}</div>
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span>Medicine Code: <span className="font-mono font-semibold text-blue-700 dark:text-blue-400">{item.medicine?.medicineCode || 'N/A'}</span></span>
                          <span>•</span>
                          <span>{item.medicine?.category?.name || 'Category N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <ProgressBar current={item.quantity} minThreshold={item.minimumStock} />
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{sellingPrice.toFixed(2)}
                        </div>
                        {canAddEdit && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Cost: ₹{costPrice.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 dark:text-white">
                          ₹{batchRetailValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {quantity} × ₹{sellingPrice.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.storageLocation || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono font-medium text-slate-800 dark:text-slate-200">
                        {item.expiryDate}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col items-start gap-1.5">
                        {isOutOfStock ? (
                          <StatusBadge status="OUT_OF_STOCK" label="OUT OF STOCK" />
                        ) : isLowStock ? (
                          <StatusBadge status="LOW_STOCK" label="LOW STOCK" />
                        ) : (
                          <StatusBadge status="HEALTHY" label="NORMAL" />
                        )}

                        {isExpired ? (
                          <StatusBadge status="EXPIRED" label="EXPIRED" />
                        ) : isExpiringSoon ? (
                          <StatusBadge status="EXPIRING SOON" label="EXPIRING SOON" />
                        ) : (
                          <StatusBadge status="HEALTHY" label="VALID" />
                        )}
                      </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canAddEdit && (
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition"
                              title="Edit Stock Record"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => setDeleteId(item.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Standardized 700px Add/Edit Inventory Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Inventory Batch Stock' : 'Add Inventory Stock Batch'}
        subtitle="Configure medicine batch, shelf location, current units, and reorder thresholds"
        icon={Package}
        footerActions={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingItem ? 'Update Stock Record' : 'Add Inventory Batch'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-5">
          {/* SECTION 1: MEDICINE & BATCH IDENTIFICATION */}
          <div className="space-y-3">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-blue-600" /> 1. Batch & Medicine Selection
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Medicine Item" required>
                <select
                  required
                  value={formData.medicineId}
                  onChange={(e) => handleMedicineChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Medicine</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Medicine Code: {m.medicineCode})
                    </option>
                  ))}
                </select>
                {resolvingMedicine && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 mt-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Resolving medicine catalog details...
                  </p>
                )}
                {medicineError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {medicineError}
                  </p>
                )}
                {selectedMedicine && !resolvingMedicine && !medicineError && (
                  <div className="mt-2 p-2.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-xl text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>{selectedMedicine.name} ({selectedMedicine.medicineCode})</span>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 rounded-full font-semibold">
                        {selectedMedicine.category?.name || 'General'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Manufacturer: <strong className="text-slate-700 dark:text-slate-200">{selectedMedicine.manufacturer || 'Standard'}</strong></span>
                      <span>Catalog Reorder Level: <strong className="text-blue-700 dark:text-blue-400">{selectedMedicine.reorderLevel ?? 10}</strong></span>
                    </div>
                  </div>
                )}
              </FormField>

              <FormField label="Batch Number" required helperText="Manufacturer lot or batch number">
                <input
                  type="text"
                  required
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  placeholder="BATCH-2026-X"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </FormField>
            </div>
          </div>

          {/* SECTION 2: STOCK QUANTITY & THRESHOLDS */}
          <div className="space-y-3">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" /> 2. Quantity & Alert Thresholds
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Quantity in Stock" required helperText="Current physical unit count">
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="100"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </FormField>

              <FormField label="Minimum Reorder Threshold" required helperText="Triggers low stock alert when quantity drops below">
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.minimumStock}
                  onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                  placeholder="10"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
            </div>
          </div>

          {/* SECTION 3: EXPIRY & STORAGE LOCATION */}
          <div className="space-y-3">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-purple-600" /> 3. Storage Location & Expiry
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Storage Location / Shelf" helperText="Warehouse shelf or refrigeration unit ID">
                <input
                  type="text"
                  value={formData.storageLocation}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                  placeholder="e.g. Shelf A1, Fridge #2"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </FormField>

              <FormField label="Expiration Date" required helperText="Official batch expiry date">
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </FormField>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteId(null)}
          title="Delete Stock Record?"
          subtitle="Permanent batch record removal"
          icon={AlertCircle}
          maxWidth="max-w-md"
          footerActions={
            <>
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
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
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to remove inventory batch #{deleteId}? This action cannot be undone.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
