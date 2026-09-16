import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { purchaseOrderService } from '../../../services/api/purchaseOrderService';
import { medicineService } from '../../../services/api/medicineService';
import StatisticCard from '../../../components/common/StatisticCard';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  Truck,
  Package,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Building2,
  FileText,
  Loader2,
  Search,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function SupplierDashboardPage() {
  const { user } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSupplierData = async () => {
      try {
        setLoading(true);
        const [ordersData, medsData] = await Promise.all([
          purchaseOrderService.getAllPurchaseOrders().catch(() => []),
          medicineService.getAllMedicines(0, 50).catch(() => ({ content: [] }))
        ]);

        setPurchaseOrders(Array.isArray(ordersData) ? ordersData : []);
        setMedicines(medsData.content || Array.isArray(medsData) ? medsData.content || medsData : []);
      } catch (err) {
        console.error('Failed to load supplier portal data:', err);
        toast.error('Unable to fetch supplier metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierData();
  }, []);

  const totalOrders = purchaseOrders.length;
  const pendingOrders = purchaseOrders.filter((o) => o.status === 'PENDING' || o.status === 'APPROVED').length;
  const fulfilledOrders = purchaseOrders.filter((o) => o.status === 'RECEIVED' || o.status === 'COMPLETED').length;
  const totalCatalogMeds = medicines.length;

  const filteredOrders = purchaseOrders.filter(
    (order) =>
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" /> Supplier Partner Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {user?.employeeId || 'SUP001'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, <span className="text-blue-400">{user?.firstName || 'Partner'}</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Manage incoming pharmaceutical purchase orders, track supply fulfillment statuses, and streamline enterprise deliveries.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 backdrop-blur-sm self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Supply Network</p>
              <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Active Logistics Partner
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticCard
          title="Total Purchase Orders"
          value={totalOrders}
          icon={ShoppingCart}
          color="blue"
          trend="+12% this month"
        />
        <StatisticCard
          title="Pending Deliveries"
          value={pendingOrders}
          icon={Clock}
          color="amber"
          trend="Action required"
        />
        <StatisticCard
          title="Fulfilled Shipments"
          value={fulfilledOrders}
          icon={CheckCircle2}
          color="emerald"
          trend="Verified received"
        />
        <StatisticCard
          title="Catalog Medicines"
          value={totalCatalogMeds}
          icon={Package}
          color="purple"
          trend="Supplied items"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Purchase Orders List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> Active Purchase Orders
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Orders dispatched by healthcare network facilities
                </p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search POs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-xs font-medium">Loading purchase order data...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-10 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">No purchase orders found</p>
                <p className="text-xs text-slate-400 mt-1">Check back soon for new procurement requests.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="pb-3 font-semibold">PO Number</th>
                      <th className="pb-3 font-semibold">Order Date</th>
                      <th className="pb-3 font-semibold">Expected Delivery</th>
                      <th className="pb-3 font-semibold">Total Amount</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.slice(0, 8).map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 font-bold text-slate-900 font-mono">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 text-slate-600">{order.orderDate || 'N/A'}</td>
                        <td className="py-3 text-slate-600">{order.expectedDelivery || 'N/A'}</td>
                        <td className="py-3 font-bold text-slate-800">
                          ₹{Number(order.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Supplier Quick Guidelines & Supply Catalog Highlights */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl p-5 text-white border border-blue-800/50 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Supply SLA & Guidelines</h3>
                <p className="text-[11px] text-blue-200">Enterprise fulfillment standards</p>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                <span>Confirm order receipt within <strong>24 hours</strong> of purchase order dispatch.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <span>Maintain cold-chain compliance for temperature-sensitive biopharmaceuticals.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                <span>Attach valid batch COA (Certificate of Analysis) with every shipment.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Pharmaceutical Catalog Quick Access
            </h3>
            <div className="space-y-2">
              {medicines.slice(0, 5).map((med) => (
                <div key={med.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{med.name}</p>
                    <p className="text-[10px] text-slate-500">{med.manufacturer || 'Enterprise Supplier'}</p>
                  </div>
                  <span className="font-mono text-slate-700 font-semibold">
                    ₹{Number(med.costPrice ?? med.unitPrice ?? 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
