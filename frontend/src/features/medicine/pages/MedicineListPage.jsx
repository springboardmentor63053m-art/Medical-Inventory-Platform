import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicineService } from '../../../services/api/medicineService';
import { categoryService } from '../../../services/api/categoryService';
import { supplierService } from '../../../services/api/supplierService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import Modal from '../../../components/common/Modal';
import StatusBadge from '../../../components/common/StatusBadge';
import FormField from '../../../components/common/FormField';
import UnifiedMedicineDetailsModal from '../components/UnifiedMedicineDetailsModal';
import {
  Pill,
  Boxes,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  AlertCircle,
  Package,
  IndianRupee,
  FileText,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function MedicineListPage() {
  const navigate = useNavigate();
  const { isAdmin, isPharmacist, isStaff, isSupplier } = useAuth();
  const canManage = isAdmin || isPharmacist;

  const [masterMedicines, setMasterMedicines] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Column Sorting
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [viewMedicine, setViewMedicine] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State matching MedicineRequest DTO
  const initialForm = {
    categoryId: '',
    medicineCode: '',
    name: '',
    genericName: '',
    manufacturer: '',
    dosage: '',
    unitPrice: '',
    reorderLevel: 10,
    description: '',
    status: 'ACTIVE',
  };
  const [formData, setFormData] = useState(initialForm);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const generateUniqueCode = (existingMeds) => {
    const existingCodes = new Set((existingMeds || []).map((m) => (m.medicineCode || '').toUpperCase()));
    let maxNum = 1000;
    (existingMeds || []).forEach((m) => {
      if (m.medicineCode) {
        const match = m.medicineCode.match(/MED-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    });
    let nextNum = maxNum + 1;
    let code = `MED-${nextNum}`;
    while (existingCodes.has(code.toUpperCase())) {
      nextNum++;
      code = `MED-${nextNum}`;
    }
    return code;
  };

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const data = await medicineService.getAllMedicines(0, 500);
      const list = data && data.content ? data.content : Array.isArray(data) ? data : [];
      setMasterMedicines(list);
      setMedicines(list);
    } catch (err) {
      console.error('Failed to fetch medicines:', err);
      toast.error('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [catsResult, supsResult] = await Promise.allSettled([
        categoryService.getAllCategories(),
        supplierService.getAllSuppliers()
      ]);
      if (catsResult.status === 'fulfilled' && Array.isArray(catsResult.value)) {
        setCategories(catsResult.value);
      }
      if (supsResult.status === 'fulfilled' && Array.isArray(supsResult.value)) {
        setSuppliers(supsResult.value);
      }
    } catch (err) {
      console.error('Failed to fetch dropdown datasets:', err);
    }
  };

  useEffect(() => {
    fetchDropdownData();
    fetchMedicines();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleOpenAddModal = () => {
    setEditingMedicine(null);
    const autoCode = generateUniqueCode(masterMedicines);
    setFormData({
      ...initialForm,
      medicineCode: autoCode,
      categoryId: categories.length > 0 ? categories[0].id : '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (med) => {
    setEditingMedicine(med);
    setFormData({
      categoryId: med.category?.id || '',
      medicineCode: med.medicineCode || '',
      name: med.name || '',
      genericName: med.genericName || '',
      manufacturer: med.manufacturer || '',
      dosage: med.dosage || '',
      unitPrice: med.unitPrice || '',
      reorderLevel: med.reorderLevel ?? 10,
      description: med.description || '',
      status: med.status || 'ACTIVE',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.medicineCode || !formData.categoryId || !formData.manufacturer || !formData.unitPrice) {
      toast.error('Please fill in all required fields marked with *');
      return;
    }

    setSubmitting(true);
    const payload = {
      ...formData,
      categoryId: Number(formData.categoryId),
      unitPrice: Number(formData.unitPrice),
      reorderLevel: Number(formData.reorderLevel),
    };

    try {
      if (editingMedicine) {
        await medicineService.updateMedicine(editingMedicine.id, payload);
        toast.success('Medicine updated successfully');
      } else {
        await medicineService.createMedicine(payload);
        toast.success('Medicine created successfully');
      }
      setModalOpen(false);
      fetchMedicines();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save medicine';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await medicineService.deleteMedicine(deleteId);
      toast.success('Medicine deleted successfully');
      setDeleteId(null);
      fetchMedicines();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete medicine');
    } finally {
      setDeleting(false);
    }
  };

  const filteredMedicines = masterMedicines.filter((m) => {
    if (!m) return false;
    if (selectedStatus && m.status !== selectedStatus) return false;
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

  const sortedMedicines = [...filteredMedicines].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'category') {
      valA = (a.category?.name || '').toLowerCase();
      valB = (b.category?.name || '').toLowerCase();
    } else if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = (valB || '').toLowerCase();
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalElements = filteredMedicines.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const paginatedMedicines = sortedMedicines.slice(page * pageSize, (page + 1) * pageSize);

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
            <Pill className="w-6 h-6 text-blue-600" /> Pharmaceutical Medicine Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise management for medicine pricing, dosage forms, manufacturer specifications, and categories
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMedicines}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="Refresh medicine list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canManage && (
            <button
              onClick={() => navigate('/categories')}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition flex items-center gap-1.5"
            >
              <Boxes className="w-4 h-4 text-blue-600" /> Manage Categories
            </button>
          )}

          {canManage && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Medicine
            </button>
          )}
        </div>
      </div>

{/* Summary KPI Cards */}
<div className="grid grid-cols-1 sm:grid-cols-4 gap-4">

  {/* Total Catalog */}
  <button
    onClick={() => {
      setSelectedStatus('');
      setSelectedCategory('');
      setSearchTerm('');
      setPage(0);
    }}
    className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-left hover:border-blue-300 hover:shadow-md transition cursor-pointer"
  >
    <div>
      <p className="text-xs font-semibold text-slate-500">Total Catalog</p>
      <h3 className="text-xl font-bold text-slate-900 mt-0.5">
        {masterMedicines.length}
      </h3>
    </div>

    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
      <Pill className="w-5 h-5" />
    </div>
  </button>


  {/* Categories */}
  <button
    onClick={() => canManage ? navigate('/categories') : null}
    className={`bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-left hover:border-purple-300 hover:shadow-md transition ${canManage ? 'cursor-pointer' : 'cursor-default'}`}
  >
    <div>
      <p className="text-xs font-semibold text-slate-500">Categories</p>
      <h3 className="text-xl font-bold text-slate-900 mt-0.5">
        {categories.length > 0 ? categories.length : new Set(masterMedicines.map((m) => m.category?.name).filter(Boolean)).size}
      </h3>
    </div>

    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
      <Boxes className="w-5 h-5" />
    </div>
  </button>


  {/* Active Formulations */}
  <button
    onClick={() => {
      setSelectedStatus(selectedStatus === 'ACTIVE' ? '' : 'ACTIVE');
      setPage(0);
    }}
    className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-left hover:border-emerald-300 hover:shadow-md transition cursor-pointer"
  >
    <div>
      <p className="text-xs font-semibold text-slate-500">
        Active Formulations
      </p>

      <h3 className="text-xl font-bold text-emerald-600 mt-0.5">
        {masterMedicines.filter((m) => m.status === 'ACTIVE').length}
      </h3>
    </div>

    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
      <Package className="w-5 h-5" />
    </div>
  </button>


  {/* Manufacturers */}
  <button
    onClick={() => {
      setSelectedStatus('');
      setSelectedCategory('');
      setSearchTerm('');
      setPage(0);
    }}
    className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-left hover:border-amber-300 hover:shadow-md transition cursor-pointer"
  >
    <div>
      <p className="text-xs font-semibold text-slate-500">
        Manufacturers
      </p>

      <h3 className="text-xl font-bold text-slate-900 mt-0.5">
        {new Set(masterMedicines.map((m) => m.manufacturer).filter(Boolean)).size}
      </h3>
    </div>

    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
      <FileText className="w-5 h-5" />
    </div>
  </button>

</div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            placeholder="Search by code, medicine name or generic name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter:
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSupplier}
            onChange={(e) => {
              setSelectedSupplier(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.supplierName} ({s.supplierCode})
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th
                  onClick={() => handleSort('medicineCode')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Medicine Code</span>
                    {renderSortIcon('medicineCode')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Name & Generic</span>
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('category')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    {renderSortIcon('category')}
                  </div>
                </th>
                <th className="py-3.5 px-6">Dosage Form</th>
                <th
                  onClick={() => handleSort('manufacturer')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Manufacturer</span>
                    {renderSortIcon('manufacturer')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('unitPrice')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Unit Price</span>
                    {renderSortIcon('unitPrice')}
                  </div>
                </th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">{canManage ? 'ACTIONS' : 'VIEW'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Loading medicine details...
                  </td>
                </tr>
              ) : paginatedMedicines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No medicine items found.
                  </td>
                </tr>
              ) : (
                paginatedMedicines.map((med) => (
                  <tr key={med.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-mono font-semibold text-slate-800">
                      {med.medicineCode}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{med.name}</div>
                      {med.genericName && (
                        <div className="text-[11px] text-slate-400">{med.genericName}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 font-semibold rounded-full text-[11px] max-w-[220px] truncate" title={med.category?.name || 'Unassigned'}>
                        {med.category?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{med.dosage || 'N/A'}</td>
                    <td className="py-4 px-6 text-slate-600">{med.manufacturer}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {formatINR(med.unitPrice)}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={med.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setViewMedicine(med);
                            setViewModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(isAdmin || isPharmacist) && (
                          <button
                            onClick={() => handleOpenEditModal(med)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Medicine"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteId(med.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Medicine"
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

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing Page <span className="font-bold text-slate-800">{page + 1}</span> of{' '}
            <span className="font-bold text-slate-800">{totalPages}</span> ({totalElements} Total Catalog Items)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sectioned 700px Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMedicine ? 'Edit Pharmaceutical Item' : 'Add New Medicine Formulation'}
        subtitle="Specify product catalog specifications, pricing thresholds, and dosage guidelines"
        icon={Pill}
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
              {editingMedicine ? 'Save Medicine Changes' : 'Create Medicine'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-6">

          {/* SECTION 1: MEDICINE IDENTIFICATION */}
          <div className="space-y-3">
            <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-blue-600" /> 1. Medicine Identification
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Medicine Code"
                readOnly={!!editingMedicine}
                required
                helperText={editingMedicine ? "Medicine Code is fixed" : "Auto-generated unique code"}
              >
                <input
                  type="text"
                  required
                  readOnly={!!editingMedicine}
                  disabled={!!editingMedicine}
                  value={formData.medicineCode}
                  onChange={(e) => setFormData({ ...formData, medicineCode: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold ${
                    editingMedicine
                      ? 'bg-slate-100 border border-slate-200 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
              </FormField>

              <FormField label="Pharmaceutical Category" required>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Brand / Medicine Name" required>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Amoxicillin 500 mg"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </FormField>

              <FormField label="Generic Chemical Name">
                <input
                  type="text"
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  placeholder="e.g. Amoxicillin Trihydrate"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
            </div>
          </div>

          {/* SECTION 2: PRICING & INVENTORY THRESHOLDS */}
          <div className="space-y-3">
            <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-emerald-600" /> 2. Pricing & Stock Thresholds
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Unit Price (₹)" required>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  placeholder="125.00"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </FormField>

              <FormField label="Reorder Threshold" required helperText="Triggers low-stock warnings">
                <input
                  type="number"
                  required
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                  placeholder="10"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </FormField>

              <FormField label="Catalog Status">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </FormField>
            </div>
          </div>

          {/* SECTION 3: DOSAGE & MANUFACTURER */}
          <div className="space-y-3">
            <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-purple-600" /> 3. Manufacturer & Dosage Specification
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Manufacturer / Vendor" required>
                <input
                  type="text"
                  required
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="e.g. Cipla Ltd, Sun Pharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </FormField>

              <FormField label="Dosage Form & Strength">
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="e.g. Tablet, Capsule, Syrup"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
            </div>
          </div>

          {/* SECTION 4: ADDITIONAL INFORMATION */}
          <div className="space-y-3">
            <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-600" /> 4. Clinical Guidance & Medical Usage Notes
              </h4>
            </div>

            <FormField label="Description & Special Warnings" helperText="Increased height text area for comprehensive medical usage guidance">
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter storage conditions, contraindications, or hospital dispensing procedures..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      {viewModalOpen && viewMedicine && (
        <UnifiedMedicineDetailsModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          medicine={viewMedicine}
          allMedicines={medicines}
          onSelectRelated={(rel) => setViewMedicine(rel)}
          onEdit={(med) => {
            setViewModalOpen(false);
            handleOpenEditModal(med);
          }}
          onDelete={(med) => {
            setViewModalOpen(false);
            setDeleteId(med.id);
          }}
        />
      )}

      {/* Delete Modal */}
      {deleteId && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteId(null)}
          title="Delete Medicine Item?"
          subtitle="Permanent catalog deletion"
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
              Are you sure you want to delete medicine item #{deleteId}? This action cannot be undone.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
