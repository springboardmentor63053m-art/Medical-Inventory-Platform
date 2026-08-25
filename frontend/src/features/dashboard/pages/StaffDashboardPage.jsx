import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicineService } from '../../../services/api/medicineService';
import { inventoryService } from '../../../services/api/inventoryService';
import { useAuth } from '../../../contexts/AuthContext';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  Pill,
  Package,
  AlertTriangle,
  Search,
  RefreshCw,
  Boxes,
  Eye,
  Activity,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const [medsRes, invRes] = await Promise.allSettled([
        medicineService.getAllMedicines(0, 500),
        inventoryService.getAllInventory()
      ]);

      const medList = medsRes.status === 'fulfilled' ? (medsRes.value?.content || medsRes.value || []) : [];
      const invList = invRes.status === 'fulfilled' ? (Array.isArray(invRes.value) ? invRes.value : []) : [];

      setMedicines(Array.isArray(medList) ? medList : []);
      setInventory(invList);
    } catch (err) {
      console.error('Failed to load Staff dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const totalMedicines = medicines.length;
  const availableStockCount = inventory.filter((inv) => Number(inv.quantity || 0) > 0).length;
  const lowStockCount = inventory.filter(
    (inv) => Number(inv.quantity || 0) > 0 && Number(inv.quantity || 0) < Number(inv.minimumStock || 10)
  ).length;

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.medicineCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const empId = user?.employeeId || `STF${String(user?.id || '001').padStart(3, '0')}`;

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-10">
      {/* Staff Operational Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 font-mono font-bold text-xs rounded-lg">
              {empId}
            </span>
            <span className="px-2.5 py-0.5 bg-sky-500/20 border border-sky-400/30 text-sky-300 font-bold text-xs rounded-full uppercase">
              Staff Operational Role
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-2">
            Operational Inventory Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time medicine catalog lookup, inventory stock level monitoring, and operational activity tracking
          </p>
        </div>

        <button
          onClick={fetchStaffData}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl border border-slate-700 transition flex items-center gap-2 text-xs font-bold shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Operational View
        </button>
      </div>

{/* Staff KPI Summary Cards */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

  {/* Total Medicines */}
  <button
    type="button"
    onClick={() => navigate('/medicines')}
    className="w-full text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
  >
    <div>
      <p className="text-xs font-semibold text-slate-500">
        Total Medicines
      </p>

      <h3 className="text-2xl font-black text-slate-900 mt-1">
        {totalMedicines}
      </h3>

      <p className="text-[11px] text-slate-400 mt-0.5">
        Master Formulations Catalog
      </p>
    </div>

    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
      <Pill className="w-6 h-6" />
    </div>
  </button>


  {/* Available Stock */}
  <button
    type="button"
    onClick={() => navigate('/inventory')}
    className="w-full text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
  >
    <div>
      <p className="text-xs font-semibold text-slate-500">
        Available Stock Batches
      </p>

      <h3 className="text-2xl font-black text-emerald-700 mt-1">
        {availableStockCount}
      </h3>

      <p className="text-[11px] text-slate-400 mt-0.5">
        Active Inventory Batches
      </p>
    </div>

    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
      <Package className="w-6 h-6" />
    </div>
  </button>


  {/* Low Stock Alerts */}
  <button
    type="button"
    onClick={() => navigate('/inventory')}
    className="w-full text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
  >
    <div>
      <p className="text-xs font-semibold text-amber-700">
        Low Stock Alerts
      </p>

      <h3 className="text-2xl font-black text-amber-700 mt-1">
        {lowStockCount}
      </h3>

      <p className="text-[11px] text-slate-400 mt-0.5">
        At or Below Reorder Threshold
      </p>
    </div>

    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
      <AlertTriangle className="w-6 h-6" />
    </div>
  </button>

</div>

      {/* Main Section: Search & Permitted Medicine List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-blue-600" /> Permitted Medicine Catalog Lookup
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Search formulations by name, generic classification, code, or category
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medicine or code..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table of Permitted Medicines */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Medicine Code</th>
                <th className="py-3 px-4">Name & Generic</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Dosage</th>
                <th className="py-3 px-4">Unit Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                    Loading database medicine inventory...
                  </td>
                </tr>
              ) : filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No medicine formulations found matching query.
                  </td>
                </tr>
              ) : (
                filteredMedicines.slice(0, 8).map((med) => (
                  <tr key={med.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{med.medicineCode}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{med.name}</span>
                      <span className="text-[11px] text-slate-500 italic">{med.genericName || 'Standard Formulation'}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{med.category?.name || 'General'}</td>
                    <td className="py-3 px-4 font-medium text-slate-600">{med.dosage || 'N/A'}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹{Number(med.unitPrice || 0).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permitted Activity & Scope Summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Staff Role Scoping Active</h4>
            <p className="text-slate-500 mt-0.5">
              Access is limited to operational medicine inventory lookup, stock checking, and low-stock monitoring.
            </p>
          </div>
        </div>
        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 shrink-0">
          Role ID: STAFF
        </span>
      </div>
    </div>
  );
}
