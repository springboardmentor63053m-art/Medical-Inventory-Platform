import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../../services/api/inventoryService';
import { medicineService } from '../../../services/api/medicineService';
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
  ArrowDown
} from 'lucide-react';

export default function InventoryListPage() {
  const { isAdmin } = useAuth();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
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
    quantity: 50,
    minimumStock: 10,
    batchNumber: '',
    expiryDate: '',
    storageLocation: 'Shelf A1',
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
      const res = await medicineService.getAllMedicines(0, 200);
      const list = res.content || res || [];
      setMedicines(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch medicines dropdown:', err);
    }
  };

  useEffect(() => {
    fetchMedicinesList();
  }, []);

  useEffect(() => {
    fetchInventoryData();
  }, [filterMode]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      ...initialForm,
      medicineId: medicines.length > 0 ? medicines[0].id : '',
      batchNumber: `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      medicineId: item.medicine?.id || item.medicineId || '',
      quantity: item.quantity || 0,
      minimumStock: item.minimumStock || 0,
      batchNumber: item.batchNumber || '',
      expiryDate: item.expiryDate || '',
      storageLocation: item.storageLocation || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.medicineId || !formData.batchNumber || !formData.expiryDate || formData.quantity === '') {
      toast.error('Please fill in required fields: Medicine, Batch, Expiry, and Quantity.');
      return;
    }

    setSubmitting(true);
    const payload = {
      medicineId: Number(formData.medicineId),
      quantity: Number(formData.quantity),
      minimumStock: Number(formData.minimumStock),
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
      setModalOpen(false);
      fetchInventoryData();
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
      setDeleteId(null);
      fetchInventoryData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record');
    } finally {
      setDeleting(false);
    }
  };

  const filteredItems = inventoryItems.filter((item) => {
    const medName = item.medicine?.name || '';
    const batch = item.batchNumber || '';
    const query = searchTerm.toLowerCase();
    return medName.toLowerCase().includes(query) || batch.toLowerCase().includes(query);
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" /> Enterprise Stock & Inventory Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual stock level tracking, shelf location mapping, reorder threshold alerts, and batch expiry surveillance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventoryData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="Refresh stock list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Inventory
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by medicine name or batch number..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              filterMode === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Batches
          </button>
          <button
            onClick={() => setFilterMode('LOW_STOCK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              filterMode === 'LOW_STOCK'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
          </button>
          <button
            onClick={() => setFilterMode('EXPIRING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              filterMode === 'EXPIRING'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Expiring Soon
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th
                  onClick={() => handleSort('batchNumber')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Batch No.</span>
                    {renderSortIcon('batchNumber')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('medicineName')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Medicine Formulation</span>
                    {renderSortIcon('medicineName')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('quantity')}
                  className="py-3.5 px-6 w-56 cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Visual Stock Health Bar</span>
                    {renderSortIcon('quantity')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('storageLocation')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Shelf Location</span>
                    {renderSortIcon('storageLocation')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('expiryDate')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition select-none"
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
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Loading inventory details...
                  </td>
                </tr>
              ) : sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No inventory records match your criteria.
                  </td>
                </tr>
              ) : (
                sortedItems.map((item) => {
                  const isLow = item.isLowStock || (item.quantity <= item.minimumStock);
                  const isExpired = item.isExpired;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 font-mono font-semibold text-slate-900">
                        {item.batchNumber}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{item.medicine?.name || `Medicine #${item.medicineId}`}</div>
                        <div className="text-[11px] text-slate-400">
                          {item.medicine?.category?.name || 'Category N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <ProgressBar current={item.quantity} minThreshold={item.minimumStock} />
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.storageLocation || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono font-medium text-slate-800">
                        {item.expiryDate}
                      </td>
                      <td className="py-4 px-6">
                        {isExpired ? (
                          <StatusBadge status="EXPIRED" label="EXPIRED" />
                        ) : isLow ? (
                          <StatusBadge status="LOW_STOCK" label="LOW STOCK" />
                        ) : (
                          <StatusBadge status="HEALTHY" label="HEALTHY" />
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Stock Record"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setDeleteId(item.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
              {editingItem ? 'Update Stock Record' : 'Add Inventory Batch'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-5">
          {/* SECTION 1: MEDICINE & BATCH IDENTIFICATION */}
          <div className="space-y-3">
            <div className="border-b border-slate-200 pb-1.5">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-blue-600" /> 1. Batch & Medicine Selection
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Medicine Item" required>
                <select
                  required
                  value={formData.medicineId}
                  onChange={(e) => setFormData({ ...formData, medicineId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Medicine</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.medicineCode})
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Batch Number" required helperText="Manufacturer lot or batch number">
                <input
                  type="text"
                  required
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  placeholder="BATCH-2026-X"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </FormField>
            </div>
          </div>

          {/* SECTION 2: STOCK QUANTITY & THRESHOLDS */}
          <div className="space-y-3">
            <div className="border-b border-slate-200 pb-1.5">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 font-bold"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
            </div>
          </div>

          {/* SECTION 3: EXPIRY & STORAGE LOCATION */}
          <div className="space-y-3">
            <div className="border-b border-slate-200 pb-1.5">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </FormField>

              <FormField label="Expiration Date" required helperText="Official batch expiry date">
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 font-mono"
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
              Are you sure you want to remove inventory batch #{deleteId}? This action cannot be undone.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
