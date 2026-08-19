import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { purchaseOrderService } from '../../../services/api/purchaseOrderService';
import { supplierService } from '../../../services/api/supplierService';
import { inventoryService } from '../../../services/api/inventoryService';
import { reportsApi } from '../services/api/reportsApi';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  BarChart2,
  TrendingUp,
  PieChart,
  IndianRupee,
  Package,
  AlertTriangle,
  Loader2
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
import { Bar, Line, Pie } from 'react-chartjs-2';

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

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('VALUATION'); // 'VALUATION' | 'EXPIRY' | 'SUPPLIERS'
  const [dateRange, setDateRange] = useState('30');
  const [supplierShareData, setSupplierShareData] = useState(null);
  const [supplierSummary, setSupplierSummary] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const handleExportCSV = async () => {
    try {
      if (activeTab === 'VALUATION') {
        await reportsApi.downloadInventoryReport();

        toast.success(
          'Inventory report downloaded successfully'
        );

        return;
      }

      if (activeTab === 'EXPIRY') {
        await reportsApi.downloadExpiryReport(dateRange);

        toast.success(
          'Expiry report downloaded successfully'
        );

        return;
      }

      const escapeCsv = (value) => {
        const text = String(value ?? '')
          .replace(/"/g, '""');

        return `"${text}"`;
      };

      const rows = [
        [
          'Supplier Name',
          'Procurement Share (%)',
          'Category',
        ],
        ...supplierSummary.map((supplier) => [
          supplier.name,
          supplier.share,
          supplier.category,
        ]),
      ];

      const csvContent =
        '\uFEFF' +
        rows
          .map((row) =>
            row.map(escapeCsv).join(',')
          )
          .join('\r\n');

      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8',
      });

      const downloadUrl =
        window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      const today =
        new Date().toISOString().slice(0, 10);

      link.href = downloadUrl;
      link.download =
        `medistock-supplier-performance-${today}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);

      toast.success(
        'Supplier report downloaded successfully'
      );
    } catch (error) {
      console.error('Report export failed:', error);

      toast.error(
        'Unable to download the report. Please try again.'
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Fetch real supplier share data from backend APIs
  useEffect(() => {
    inventoryService.getAllInventory().then(data => setInventoryItems(Array.isArray(data) ? data : [])).catch(() => setInventoryItems([]));
  }, []);

  useEffect(() => {
    if (activeTab !== 'SUPPLIERS') return;
    const fetchSupplierShare = async () => {
      setLoadingSuppliers(true);
      try {
        const [orders, suppliers] = await Promise.all([
          purchaseOrderService.getAllPurchaseOrders().catch(() => []),
          supplierService.getAllSuppliers().catch(() => [])
        ]);

        const orderList = Array.isArray(orders) ? orders : [];
        const supplierList = Array.isArray(suppliers) ? suppliers : [];

        // Build supplier ID → name lookup from actual supplier records
        const supplierMap = {};
        supplierList.forEach(s => {
          supplierMap[s.id] = s.supplierName;
        });

        // Aggregate total procurement value per supplier from actual PO data
        const supplierTotals = {};
        let grandTotal = 0;
        orderList.forEach(po => {
          const supName = po.supplier?.supplierName || supplierMap[po.supplierId] || 'Unknown Supplier';
          const amount = po.totalAmount || 0;
          supplierTotals[supName] = (supplierTotals[supName] || 0) + amount;
          grandTotal += amount;
        });

        // Sort by procurement value descending
        const sorted = Object.entries(supplierTotals)
          .sort((a, b) => b[1] - a[1]);

        const chartColors = [
          '#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444',
          '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
        ];

        const labels = sorted.map(([name]) => name);
        const data = sorted.map(([, val]) =>
          grandTotal > 0 ? parseFloat(((val / grandTotal) * 100).toFixed(1)) : 0
        );

        setSupplierShareData({
          labels,
          datasets: [{
            data,
            backgroundColor: chartColors.slice(0, labels.length),
          }],
        });

        // Top suppliers summary (up to 5)
        setSupplierSummary(
          sorted.slice(0, 5).map(([name, val], idx) => ({
            name,
            share: grandTotal > 0 ? ((val / grandTotal) * 100).toFixed(1) : '0',
            category: 'Purchase order supplier',
          }))
        );
      } catch (err) {
        console.error('Failed to load supplier share data:', err);
      } finally {
        setLoadingSuppliers(false);
      }
    };
    fetchSupplierShare();
  }, [activeTab]);

  const categoryTotals = inventoryItems.reduce((totals, item) => {
    const category = item.medicine?.category?.name || 'Uncategorised';
    totals[category] = (totals[category] || 0) + Number(item.quantity || 0) * Number(item.medicine?.unitPrice || 0);
    return totals;
  }, {});
  const valuationData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: 'Stock Value (₹ INR)',
        data: Object.values(categoryTotals),
        backgroundColor: 'rgba(37, 99, 235, 0.8)',
        borderRadius: 8,
      },
    ],
  };

    const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedExpiryDays =
    Number(dateRange) || 30;

  const getDaysUntilExpiry = (expiryDateValue) => {
    if (!expiryDateValue) {
      return null;
    }

    const expiryDate =
      new Date(`${expiryDateValue}T00:00:00`);

    return Math.round(
      (expiryDate - today) / 86400000
    );
  };

  const expiredItems = inventoryItems.filter((item) => {
    const daysUntilExpiry =
      getDaysUntilExpiry(item.expiryDate);

    return (
      item.expiryStatus === 'EXPIRED' ||
      (
        daysUntilExpiry !== null &&
        daysUntilExpiry < 0
      )
    );
  });

  const expiringWithinSelectedRange =
    inventoryItems.filter((item) => {
      const daysUntilExpiry =
        getDaysUntilExpiry(item.expiryDate);

      return (
        item.expiryStatus !== 'EXPIRED' &&
        daysUntilExpiry !== null &&
        daysUntilExpiry >= 0 &&
        daysUntilExpiry <= selectedExpiryDays
      );
    });

  const expiringWithinSixMonths =
    inventoryItems.filter((item) => {
      const daysUntilExpiry =
        getDaysUntilExpiry(item.expiryDate);

      return (
        item.expiryStatus !== 'EXPIRED' &&
        daysUntilExpiry !== null &&
        daysUntilExpiry >= 0 &&
        daysUntilExpiry <= 180
      );
    });

  const expiryByMonth =
    expiringWithinSixMonths.reduce((totals, item) => {
      const month = item.expiryDate.slice(0, 7);

      totals[month] = (totals[month] || 0) + 1;

      return totals;
    }, {});

  const expiryMonths =
    Object.keys(expiryByMonth).sort();

  const expiryTrendData = {
    labels: expiryMonths,
    datasets: [
      {
        label: 'Expiring Items Count',
        data: expiryMonths.map(
          (month) => expiryByMonth[month]
        ),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const totalUnits = inventoryItems.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  const totalValue = inventoryItems.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0) *
      Number(item.medicine?.unitPrice || 0),
    0
  );

  const averageUnitValue =
    totalUnits > 0 ? totalValue / totalUnits : 0;

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" /> Executive Stock Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data insights, inventory valuation, expiry audits, and vendor supply chain analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Tabs and Date Range Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('VALUATION')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'VALUATION'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <IndianRupee className="w-4 h-4" /> Inventory Valuation
          </button>

          <button
            onClick={() => setActiveTab('EXPIRY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'EXPIRY'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Expiry Risk Audit
          </button>

          <button
            onClick={() => setActiveTab('SUPPLIERS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'SUPPLIERS'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PieChart className="w-4 h-4" /> Supplier Share
          </button>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Calendar className="w-4 h-4 text-slate-400" /> Date Window:
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="30">Next 30 Days</option>
            <option value="90">Next 90 Days</option>
            <option value="365">Next 1 Year</option>
          </select>
        </div>
      </div>
      {/* Tab 1: Valuation Report */}
      {activeTab === 'VALUATION' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">
                Total Stock Valuation
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {formatINR(totalValue)}
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Based on current inventory quantities
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">
                Total Units In Warehouse
              </span>
              <h3 className="text-2xl font-black text-blue-600 mt-1">
                {totalUnits.toLocaleString('en-IN')} Units
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Across {inventoryItems.length} inventory records
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">
                Average Unit Valuation
              </span>
              <h3 className="text-2xl font-black text-purple-600 mt-1">
                {formatINR(averageUnitValue)} / unit
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Based on current catalog prices
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Stock Value by Category
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Total capital allocation across pharmaceutical
              categories in INR
            </p>
            <div className="h-72">
              <Bar
                data={valuationData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Expiry Risk Report */}
      {activeTab === 'EXPIRY' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50/20 shadow-xs">
              <span className="text-xs text-red-700 font-semibold">
                Expired Batches
              </span>

              <h3 className="text-2xl font-black text-red-700 mt-1">
                {expiredItems.length} Batches
              </h3>

              <p className="text-[11px] text-red-600 mt-1">
                Expired stock value:{' '}
                {formatINR(
                  expiredItems.reduce(
                    (sum, item) =>
                      sum +
                      Number(item.quantity || 0) *
                        Number(item.medicine?.unitPrice || 0),
                    0
                  )
                )}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-orange-200 bg-orange-50/20 shadow-xs">
              <span className="text-xs text-orange-700 font-semibold">
                Expiring Within {selectedExpiryDays} Days
              </span>

              <h3 className="text-2xl font-black text-orange-700 mt-1">
                {expiringWithinSelectedRange.length} Batches
              </h3>

              <p className="text-[11px] text-orange-600 mt-1">
                Value at risk:{' '}
                {formatINR(
                  expiringWithinSelectedRange.reduce(
                    (sum, item) =>
                      sum +
                      Number(item.quantity || 0) *
                        Number(item.medicine?.unitPrice || 0),
                    0
                  )
                )}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">
                Non-Expired Inventory
              </span>

              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {inventoryItems.length > 0
                  ? `${Math.round(
                      ((inventoryItems.length -
                        expiredItems.length) /
                        inventoryItems.length) *
                        100
                    )}%`
                  : '0%'}
              </h3>

              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                Inventory records safe from expiry
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              6-Month Expiration Forecast
            </h3>

            <p className="text-xs text-slate-500 mb-4">
              Projected batch expiration dates over the upcoming
              six months
            </p>

            <div className="h-72">
              <Line
                data={expiryTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Supplier Performance — Dynamic from API */}
      {activeTab === 'SUPPLIERS' && (
        <div className="space-y-6">
          {loadingSuppliers ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-500">
                Loading supplier procurement data...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center">
                <h3 className="font-bold text-slate-900 text-sm mb-2 text-center">
                  Supplier Procurement Market Share
                </h3>

                <div className="w-60 h-60 my-2">
                  {supplierShareData ? (
                    <Pie
                      data={supplierShareData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <p className="text-xs text-slate-400 text-center pt-20">
                      No procurement data available
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
                <h3 className="font-bold text-slate-900 text-sm mb-4">
                  Vendor Supply Chain Summary
                </h3>

                <div className="space-y-3 text-xs">
                  {supplierSummary.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      No supplier data available
                    </p>
                  ) : (
                    supplierSummary.map((supplier, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100"
                      >
                        <div>
                          <span className="font-bold text-slate-900">
                            {supplier.name}
                          </span>
                          <p className="text-slate-500 text-[11px]">
                            {supplier.category}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-blue-600">
                            {supplier.share}% Orders
                          </span>
                          <span className="block text-[10px] text-emerald-600 font-semibold">
                            Value share from actual purchase orders
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
  );
}