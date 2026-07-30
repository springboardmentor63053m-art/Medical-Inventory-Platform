import React, { useState } from 'react';
import { toast } from 'react-toastify';
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
  AlertTriangle
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

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const handleExportCSV = (reportName) => {
    toast.success(`Exporting ${reportName} report to CSV file...`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Indian Rupee valuation data
  const valuationData = {
    labels: ['Antibiotics', 'Analgesics', 'Cardiovascular', 'Vitamins', 'Pediatrics'],
    datasets: [
      {
        label: 'Stock Value (₹ INR)',
        data: [245000, 182000, 310000, 95000, 148000],
        backgroundColor: 'rgba(37, 99, 235, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const expiryTrendData = {
    labels: ['Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026', 'Jan 2027'],
    datasets: [
      {
        label: 'Expiring Items Count',
        data: [12, 19, 7, 25, 4, 15],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const supplierPieData = {
    labels: ['Apex Health', 'Global Biotech', 'MediLife Wholesale', 'Novartis Logistics'],
    datasets: [
      {
        data: [42, 28, 18, 12],
        backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'],
      },
    ],
  };

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
            onClick={() => handleExportCSV(activeTab)}
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
            <option value="30">Last 30 Days</option>
            <option value="90">Quarterly (90 Days)</option>
            <option value="365">Annual (1 Year)</option>
          </select>
        </div>
      </div>

      {/* Tab 1: Valuation Report */}
      {activeTab === 'VALUATION' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Total Stock Valuation</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{formatINR(980000)}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +8.4% vs last month</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Total Units In Warehouse</span>
              <h3 className="text-2xl font-black text-blue-600 mt-1">14,250 Units</h3>
              <p className="text-[11px] text-slate-400 mt-1">Across 250 inventory batch records</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Average Unit Valuation</span>
              <h3 className="text-2xl font-black text-purple-600 mt-1">{formatINR(184.50)} / unit</h3>
              <p className="text-[11px] text-slate-400 mt-1">Based on catalog standard rate</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1">Stock Value by Category</h3>
            <p className="text-xs text-slate-500 mb-4">Total capital allocation across pharmaceutical categories in INR</p>
            <div className="h-72">
              <Bar data={valuationData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Expiry Risk Report */}
      {activeTab === 'EXPIRY' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
              <span className="text-xs text-rose-700 font-semibold">Immediate Expiry Risk (&lt;90 Days)</span>
              <h3 className="text-2xl font-black text-rose-700 mt-1">12 Batches</h3>
              <p className="text-[11px] text-rose-600 mt-1">Value at risk: {formatINR(34500)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Next 6 Months Forecast</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">92 Batches</h3>
              <p className="text-[11px] text-slate-400 mt-1">Scheduled for restocking cycle</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Waste Prevention Efficiency</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">98.2%</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">High efficiency batch rotation</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1">6-Month Expiration Forecast</h3>
            <p className="text-xs text-slate-500 mb-4">Projected batch expiration dates over upcoming months</p>
            <div className="h-72">
              <Line data={expiryTrendData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Supplier Performance */}
      {activeTab === 'SUPPLIERS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center">
              <h3 className="font-bold text-slate-900 text-sm mb-2 text-center">Supplier Procurement Market Share</h3>
              <div className="w-60 h-60 my-2">
                <Pie data={supplierPieData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Vendor Supply Chain Summary</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-900">Apex Health Pharma</span>
                    <p className="text-slate-500 text-[11px]">Primary Antibiotics &amp; Painkillers Supplier</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-600">42% Orders</span>
                    <span className="block text-[10px] text-emerald-600 font-semibold">Lead Time: 3 Days</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-900">Global Biotech Supplies</span>
                    <p className="text-slate-500 text-[11px]">Specialized Insulin &amp; Critical Care Formulations</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-600">28% Orders</span>
                    <span className="block text-[10px] text-emerald-600 font-semibold">Lead Time: 4 Days</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-900">MediLife Wholesale</span>
                    <p className="text-slate-500 text-[11px]">General OTC &amp; Clinical Supplies</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-600">18% Orders</span>
                    <span className="block text-[10px] text-emerald-600 font-semibold">Lead Time: 2 Days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
