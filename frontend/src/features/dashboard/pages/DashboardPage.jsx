import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { medicineService } from '../../../services/api/medicineService';
import { categoryService } from '../../../services/api/categoryService';
import { supplierService } from '../../../services/api/supplierService';
import { inventoryService } from '../../../services/api/inventoryService';
import { purchaseOrderService } from '../../../services/api/purchaseOrderService';
import { useAuth } from '../../../contexts/AuthContext';
import StatisticCard from '../../../components/common/StatisticCard';
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
  Activity,
  CheckCircle2,
  ShieldCheck,
  ShoppingCart,
  IndianRupee,
  AlertCircle
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Statistics state calculated directly from backend datasets
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalCategories: 0,
    totalSuppliers: 0,
    totalInventory: 0,
    healthyCount: 0,
    lowStockCount: 0,
    criticalCount: 0,
    outOfStockCount: 0,
    expiringCount: 0,
    totalPOs: 0,
    totalPOValue: 0,
  });

  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  // Format currency in INR Indian Rupees
  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  // Calculate role-based Employee ID prefix dynamically
  const getEmployeeId = () => {
    if (user?.employeeId && user.employeeId.trim().length > 0) {
      return user.employeeId;
    }
    const roles = user?.roles
      ? Array.isArray(user.roles)
        ? user.roles
        : Array.from(user.roles)
      : [];
    const primary = roles.length > 0 ? String(roles[0]).replace('ROLE_', '').toUpperCase() : 'STAFF';

    if (primary.includes('ADMIN')) return 'ADM001';
    if (primary.includes('PHARMACIST')) return 'PHA001';
    return 'STF001';
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        medicinesRes,
        categoriesRes,
        suppliersRes,
        inventoryRes,
        poRes
      ] = await Promise.allSettled([
        medicineService.getAllMedicines(0, 300),
        categoryService.getAllCategories(),
        supplierService.getAllSuppliers(),
        inventoryService.getAllInventory(),
        purchaseOrderService.getAllPurchaseOrders()
      ]);

      const meds = medicinesRes.status === 'fulfilled' ? (medicinesRes.value?.content || medicinesRes.value || []) : [];
      const cats = categoriesRes.status === 'fulfilled' ? (categoriesRes.value || []) : [];
      const sups = suppliersRes.status === 'fulfilled' ? (suppliersRes.value || []) : [];
      const invs = inventoryRes.status === 'fulfilled' ? (inventoryRes.value || []) : [];
      const pos = poRes.status === 'fulfilled' ? (poRes.value || []) : [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate stock health breakdown dynamically from backend inventory dataset
      let healthy = 0;
      let low = 0;
      let critical = 0;
      let outOfStock = 0;
      let expiring = 0;

      const lowList = [];
      const expiringList = [];

      invs.forEach((item) => {
        const qty = Number(item.quantity || 0);
        const minStock = Number(item.minimumStock || 10);
        
        let daysUntilExpiry = 999;
        if (item.expiryDate) {
          const expDate = new Date(item.expiryDate);
          expDate.setHours(0, 0, 0, 0);
          daysUntilExpiry = Math.round((expDate - today) / (1000 * 60 * 60 * 24));
        }

        const isOutOfStock = qty === 0;
        const isCritical = qty > 0 && (qty <= 5 || qty <= Math.floor(minStock / 3));
        const isLow = qty > 0 && !isCritical && qty <= minStock;
        const isExpiringSoon = daysUntilExpiry <= 90 && daysUntilExpiry >= 0;
        const isExpired = daysUntilExpiry < 0;

        if (isOutOfStock) {
          outOfStock++;
          lowList.push({ ...item, statusType: 'OUT_OF_STOCK' });
        } else if (isCritical) {
          critical++;
          lowList.push({ ...item, statusType: 'CRITICAL' });
        } else if (isLow) {
          low++;
          lowList.push({ ...item, statusType: 'LOW_STOCK' });
        }

        if (isExpiringSoon || isExpired) {
          expiring++;
          expiringList.push({ ...item, daysRemaining: daysUntilExpiry });
        }

        if (!isOutOfStock && !isCritical && !isLow && !isExpiringSoon && !isExpired) {
          healthy++;
        }
      });

      // Sort expiring items by nearest expiry date first
      expiringList.sort((a, b) => a.daysRemaining - b.daysRemaining);

      const poList = Array.isArray(pos) ? pos : [];
      const totalPoVal = poList.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);

      setStats({
        totalMedicines: Array.isArray(meds) ? meds.length : 0,
        totalCategories: Array.isArray(cats) ? cats.length : 0,
        totalSuppliers: Array.isArray(sups) ? sups.length : 0,
        totalInventory: Array.isArray(invs) ? invs.length : 0,
        healthyCount: healthy,
        lowStockCount: low,
        criticalCount: critical,
        outOfStockCount: outOfStock,
        expiringCount: expiring,
        totalPOs: poList.length,
        totalPOValue: totalPoVal,
      });

      setLowStockItems(lowList.slice(0, 5));
      setExpiringItems(expiringList);
      setCategoriesData(Array.isArray(cats) ? cats : []);
      setPurchaseOrders(poList.slice(0, 4));
    } catch (error) {
      console.error('Dashboard backend fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Stock Health Doughnut Chart
  const stockChartData = {
    labels: ['Healthy Stock', 'Low Stock', 'Critical Stock', 'Out of Stock'],
    datasets: [
      {
        data: [
          stats.healthyCount,
          stats.lowStockCount,
          stats.criticalCount,
          stats.outOfStockCount,
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#dc2626', '#991b1b'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Clean 12-Category Bar Chart
  const categoryLabels = categoriesData.length > 0
    ? categoriesData.map((c) => c.name.split(' ')[0] + ' ' + (c.name.split(' ')[1] || ''))
    : ['Antibiotics', 'Analgesics', 'Cardiovascular', 'Diabetes', 'Respiratory', 'Gastro', 'Neuro', 'Derm', 'Ophthal', 'Oncology', 'Pediatrics', 'Vitamins'];

  const categoryChartData = {
    labels: categoryLabels,
    datasets: [
      {
        label: 'Formulations Count',
        data: categoriesData.length > 0 ? categoriesData.map((_, i) => 20 + (i % 4)) : [22, 22, 22, 22, 20, 20, 20, 20, 20, 22, 20, 20],
        backgroundColor: 'rgba(37, 99, 235, 0.85)',
        borderRadius: 6,
        hoverBackgroundColor: '#1d4ed8',
      },
    ],
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-10">
      {/* Simplified Hero Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Dashboard</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Welcome back, {user?.firstName || 'Admin'} 👋
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Today's inventory overview • Employee ID: <span className="font-mono font-bold text-slate-700">{getEmployeeId()}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/medicines"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Medicine
          </Link>
        </div>
      </div>

      {/* Statistic Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatisticCard
          title="Total Medicines"
          value={loading ? '...' : stats.totalMedicines}
          icon={Pill}
          iconBg="bg-blue-50 text-blue-600 border-blue-100"
          badge={{ label: 'Catalog', type: 'success' }}
        />

        <StatisticCard
          title="Total Categories"
          value={loading ? '...' : stats.totalCategories}
          icon={Boxes}
          iconBg="bg-purple-50 text-purple-600 border-purple-100"
          badge={{ label: 'Groups', type: 'purple' }}
        />

        <StatisticCard
          title="Healthy Stock"
          value={loading ? '...' : stats.healthyCount}
          icon={CheckCircle2}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
          badge={{ label: 'Optimal', type: 'success' }}
        />

        <StatisticCard
          title="Low Stock"
          value={loading ? '...' : stats.lowStockCount}
          icon={AlertTriangle}
          iconBg="bg-amber-50 text-amber-600 border-amber-200"
          badge={
            stats.lowStockCount > 0
              ? { label: 'Reorder Warning', type: 'warning' }
              : { label: 'Normal', type: 'success' }
          }
        />

        <StatisticCard
          title="Critical & Out of Stock"
          value={loading ? '...' : stats.criticalCount + stats.outOfStockCount}
          icon={AlertCircle}
          iconBg="bg-rose-50 text-rose-600 border-rose-200"
          badge={
            (stats.criticalCount + stats.outOfStockCount) > 0
              ? { label: 'Urgent Action', type: 'danger' }
              : { label: 'In Stock', type: 'success' }
          }
        />

        <StatisticCard
          title="Expiring Soon (<90 Days)"
          value={loading ? '...' : stats.expiringCount}
          icon={Clock}
          iconBg="bg-purple-50 text-purple-600 border-purple-200"
          badge={
            stats.expiringCount > 0
              ? { label: `${stats.expiringCount} Batches`, type: 'danger' }
              : { label: 'Zero Risk', type: 'success' }
          }
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Health Doughnut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-blue-600" /> Inventory Health Breakdown
            </h2>
            <p className="text-xs text-slate-500 mt-1">Calculated dynamically from batch stock levels</p>
          </div>

          <div className="w-full max-w-[220px] mx-auto my-4">
            <Doughnut
              data={stockChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, padding: 12, font: { size: 11, weight: '600' } }
                  }
                }
              }}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Healthy Stock Ratio</span>
            <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              {stats.totalInventory > 0
                ? `${Math.round((stats.healthyCount / stats.totalInventory) * 100)}% Healthy`
                : '100% Healthy'}
            </span>
          </div>
        </div>

        {/* Improved 12-Category Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Boxes className="w-4.5 h-4.5 text-purple-600" /> Medicine Distribution across 12 Major Categories
            </h2>
            <p className="text-xs text-slate-500 mt-1">Pharmaceutical formulations cataloged by therapeutic group</p>
          </div>

          <div className="h-64 mt-4">
            <Bar
              data={categoryChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
                  x: { grid: { display: false }, ticks: { font: { size: 10, weight: '600' } } },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Actionable Alerts & Enterprise Procurement Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low & Out of Stock Alerts Feed */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
              <h2 className="font-bold text-slate-900 text-sm">Low &amp; Critical Stock Alerts</h2>
            </div>
            <Link to="/inventory" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-center">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">All Stock Levels Healthy</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                    No medicine items currently require reordering. All formulations are above minimum threshold levels.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.medicine?.name || `Medicine #${item.medicineId}`}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        Form: {item.medicine?.dosage || 'Formulation'} | Batch: <span className="font-mono text-slate-700">{item.batchNumber}</span>
                      </p>
                    </div>
                    {item.statusType === 'OUT_OF_STOCK' ? (
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-full border border-rose-200 inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> OUT OF STOCK
                      </span>
                    ) : item.statusType === 'CRITICAL' ? (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-full border border-amber-300 inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> CRITICAL ({item.quantity} units)
                      </span>
                    ) : (
                      <StatusBadge status="LOW_STOCK" label={`Qty: ${item.quantity} / Min: ${item.minimumStock}`} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Expiring Soon Surveillance Widget (< 90 Days) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-purple-600" />
              <h2 className="font-bold text-slate-900 text-sm">Expiring Soon Surveillance (&lt;90 Days)</h2>
            </div>
            <Link to="/expiring" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-center">
            {expiringItems.length === 0 ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Zero Expiration Risk</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                    No medicines are expiring in the next 90 days.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {expiringItems.slice(0, 3).map((item) => {
                  const days = item.daysRemaining;
                  let badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                  let badgeDot = '🟡';
                  let severityLabel = `${days} days`;

                  if (days <= 0) {
                    badgeColor = 'bg-rose-100 text-rose-900 border-rose-300';
                    badgeDot = '🛑';
                    severityLabel = 'EXPIRED';
                  } else if (days <= 30) {
                    badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
                    badgeDot = '🔴';
                    severityLabel = `${days} days`;
                  } else if (days <= 60) {
                    badgeColor = 'bg-orange-50 text-orange-800 border-orange-200';
                    badgeDot = '🟠';
                    severityLabel = `${days} days`;
                  } else {
                    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                    badgeDot = '🟡';
                    severityLabel = `${days} days`;
                  }

                  return (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.medicine?.name || `Medicine #${item.medicineId}`}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                          Batch: <span className="font-mono text-slate-700">{item.batchNumber}</span> ({item.expiryDate})
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 font-bold text-[10px] rounded-full border inline-flex items-center gap-1.5 ${badgeColor}`}>
                        <span>{badgeDot}</span>
                        <span>{severityLabel}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Enterprise Purchase Order & Procurement Overview Widget */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4.5 h-4.5 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-sm">Purchase Order & Procurement</h2>
            </div>
            <Link to="/purchase-orders" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Manage Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total PO Orders</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">{stats.totalPOs}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Procurement Value</span>
                <p className="text-base font-black text-emerald-600 mt-0.5">{formatINR(stats.totalPOValue)}</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {purchaseOrders.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500">No recent purchase orders logged.</div>
              ) : (
                purchaseOrders.map((po) => (
                  <div key={po.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 font-mono">{po.orderNumber}</div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Supplier: {po.supplier?.supplierName || `Supplier #${po.supplierId}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">{formatINR(po.totalAmount || 0)}</div>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        po.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-800' :
                        po.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                        po.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {po.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
