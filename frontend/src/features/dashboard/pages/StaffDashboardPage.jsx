import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { inventoryService } from '../../../services/api/inventoryService';
import { useAuth } from '../../../contexts/AuthContext';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  Package,
  AlertTriangle,
  Clock,
  Bell,
  RefreshCw,
  ArrowRight,
  Building2,
  CheckCircle2,
  Search,
  Pill,
  BarChart2
} from 'lucide-react';

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inventoryList, setInventoryList] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const [invRes, lowStockRes, expiringRes] = await Promise.allSettled([
        inventoryService.getAllInventory(),
        inventoryService.getLowStockInventory(),
        inventoryService.getExpiringInventory(90)
      ]);

      const invs = invRes.status === 'fulfilled' && Array.isArray(invRes.value) ? invRes.value : [];
      const lows = lowStockRes.status === 'fulfilled' && Array.isArray(lowStockRes.value) ? lowStockRes.value : [];
      const exps = expiringRes.status === 'fulfilled' && Array.isArray(expiringRes.value) ? expiringRes.value : [];

      setInventoryList(invs);
      setLowStockItems(lows);
      setExpiringItems(exps);
    } catch (err) {
      console.error('Failed to load staff inventory dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const totalStock = inventoryList.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  const lowStockCount = lowStockItems.length;
  const expiringCount = expiringItems.length;
  const healthyCount = inventoryList.length - lowStockCount;

  const empId = user?.employeeId || `STF${String(user?.id || '001').padStart(3, '0')}`;

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-10">
      {/* Employee Staff Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 font-mono font-bold text-xs rounded-lg">
              {empId}
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold text-xs rounded-full uppercase">
              Staff Role
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-2">
            Inventory Operations Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time stock monitoring, low-stock alerts, and inventory dispatch management
          </p>
        </div>

        <button
          onClick={fetchStaffData}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl border border-slate-700 transition flex items-center gap-2 text-xs font-bold shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Stock Data
        </button>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Formulations</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{inventoryList.length}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{totalStock} total units in stock</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Healthy Stock</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{healthyCount < 0 ? 0 : healthyCount}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Sufficient inventory levels</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Low Stock Alerts</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{lowStockCount}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Reorder threshold reached</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Expiring Soon</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{expiringCount}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Expires within 90 days</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock & Reorder List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Stock Replenishment Priority List
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Items needing stock update or batch restocking</p>
            </div>
            <Link
              to="/inventory"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Full Inventory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-xs">Loading inventory monitoring dataset...</p>
            </div>
          ) : lowStockItems.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">All stock levels are optimal!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">No immediate low-stock reorders required.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-2.5 px-3">Medicine</th>
                    <th className="py-2.5 px-3">Batch</th>
                    <th className="py-2.5 px-3 text-right">Current Qty</th>
                    <th className="py-2.5 px-3 text-right">Min Threshold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {lowStockItems.slice(0, 6).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.medicine?.name || 'Medicine'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.medicine?.medicineCode}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                        {item.batchNumber || 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-amber-600">
                        {item.quantity} units
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 font-medium">
                        {item.minimumStock || 10} units
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Links & Notifications Card */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" /> Operational Actions
            </h2>

            <div className="space-y-2.5">
              <Link
                to="/inventory"
                className="w-full p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900">Manage Stock Levels</div>
                    <div className="text-[10px] text-slate-500">Update item quantities & batches</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                to="/expiring"
                className="w-full p-3.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-xl transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-rose-600" />
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900">Expiring Batches</div>
                    <div className="text-[10px] text-slate-500">Inspect near-expiry inventory</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                to="/notifications"
                className="w-full p-3.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-amber-600" />
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900">Stock Notifications</div>
                    <div className="text-[10px] text-slate-500">View low stock alerts</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
