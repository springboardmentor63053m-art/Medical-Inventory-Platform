import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { medicineService } from '../../../services/api/medicineService';
import { categoryService } from '../../../services/api/categoryService';
import { supplierService } from '../../../services/api/supplierService';
import { inventoryService } from '../../../services/api/inventoryService';
import { purchaseOrderService } from '../../../services/api/purchaseOrderService';
import { useAuth } from '../../../contexts/AuthContext';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  Pill,
  Boxes,
  Truck,
  Package,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  RefreshCw,
  ShoppingCart,
  FileText,
  Stethoscope
} from 'lucide-react';

export default function PharmacistDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalCategories: 0,
    totalSuppliers: 0,
    totalInventory: 0,
    lowStockCount: 0,
    expiringCount: 0,
    totalPOs: 0,
  });

  const [lowStockItems, setLowStockItems] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  const fetchPharmacistData = async () => {
    setLoading(true);
    try {
      const [
        medsRes,
        catsRes,
        supsRes,
        invRes,
        poRes
      ] = await Promise.allSettled([
        medicineService.getAllMedicines(0, 200),
        categoryService.getAllCategories(),
        supplierService.getAllSuppliers(),
        inventoryService.getAllInventory(),
        purchaseOrderService.getAllPurchaseOrders()
      ]);

      const meds = medsRes.status === 'fulfilled' ? (medsRes.value?.content || medsRes.value || []) : [];
      const cats = catsRes.status === 'fulfilled' ? (catsRes.value || []) : [];
      const sups = supsRes.status === 'fulfilled' ? (supsRes.value || []) : [];
      const invs = invRes.status === 'fulfilled' ? (invRes.value || []) : [];
      const pos = poRes.status === 'fulfilled' ? (poRes.value || []) : [];

      const lowList = invs.filter((item) => Number(item.quantity || 0) > 0 && Number(item.quantity || 0) < Number(item.minimumStock || 10));

      // Calculate monthly purchases and total spend from real POs
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const posThisMonth = pos.filter((po) => {
        if (!po.orderDate) return false;
        const d = new Date(po.orderDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      const spendThisMonth = posThisMonth.reduce((sum, po) => sum + Number(po.totalAmount || 0), 0);

      setStats({
        totalMedicines: Array.isArray(meds) ? meds.length : 0,
        totalCategories: Array.isArray(cats) ? cats.length : 0,
        totalSuppliers: Array.isArray(sups) ? sups.length : 0,
        totalInventory: Array.isArray(invs) ? invs.length : 0,
        lowStockCount: lowList.length,
        expiringCount: 0,
        totalPOs: Array.isArray(pos) ? pos.length : 0,
        purchasesThisMonth: posThisMonth.length,
        spendThisMonth: spendThisMonth
      });

      setLowStockItems(lowList.slice(0, 5));
      setPurchaseOrders(Array.isArray(pos) ? pos.slice(0, 4) : []);
    } catch (error) {
      console.error('Pharmacist dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacistData();
  }, []);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const empId = user?.employeeId || `PHA${String(user?.id || '001').padStart(3, '0')}`;

  return (
    <div className="space-y-6 font-sans text-slate-900 dark:text-slate-100 pb-10">
      {/* Pharmacist Header Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white dark:from-blue-950 dark:via-slate-900 dark:to-indigo-950 p-6 rounded-3xl text-slate-900 dark:text-white shadow-xs dark:shadow-xl border border-blue-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-400/30 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs rounded-lg">
              {empId}
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-400/30 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-full uppercase">
              Pharmacist Role
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
            Pharmacy Operational & Purchasing Hub
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Day-to-day medicine inventory management, purchase requisitions, Rx verification, and store counter checkout
          </p>
        </div>

        <button
          onClick={fetchPharmacistData}
          className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-2 text-xs font-bold shrink-0 shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Pharmacy Hub
        </button>
      </div>

      {/* Purchase & Inventory Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Purchases This Month</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.purchasesThisMonth || 0} Orders</h3>
            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">{formatINR(stats.spendThisMonth)} Spend</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Medicines Catalog</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalMedicines}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{stats.totalCategories} Active Categories</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Pill className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Inventory</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalInventory}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{stats.lowStockCount} Low stock alerts</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Low Stock Alerts</p>
            <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">{stats.lowStockCount}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Reorder Needed</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Operational Grid Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/pharmacist/verify')}
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold group-hover:scale-110 transition">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">Rx Verification Queue</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review &amp; verify uploaded customer prescriptions</p>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
            <span>Verify Orders</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        <div
          onClick={() => navigate('/store-counter')}
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 transition">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">In-Store POS Counter</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Process walk-in sales &amp; print receipts</p>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>Open POS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        <div
          onClick={() => navigate('/medicines')}
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold group-hover:scale-110 transition">
              <Pill className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">Medicine Management</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Browse catalog, check stock &amp; generic info</p>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
            <span>View Medicines</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        <div
          onClick={() => navigate('/purchase-orders')}
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold group-hover:scale-110 transition">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">Purchase Orders</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Requisition purchase orders &amp; track receipts</p>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
            <span>Manage Orders</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>
    </div>
  );
}
