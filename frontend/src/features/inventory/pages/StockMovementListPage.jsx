import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../../services/api/inventoryService';
import { toast } from 'react-toastify';
import {
  Layers,
  Search,
  RefreshCw,
  Loader2,
  Package,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Clock,
  ArrowRightLeft
} from 'lucide-react';

export default function StockMovementListPage() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState('ALL'); // 'ALL' | 'ADD' | 'ISSUE' | 'RESTOCK'

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getStockMovements(movementTypeFilter, searchTerm);
      setMovements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load stock movements:', err);
      toast.error('Failed to load stock movement history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [movementTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMovements();
  };

  // Summary Metrics Calculations
  const totalMovements = movements.length;
  const addedCount = movements.filter((m) => m.movementType === 'ADD').length;
  const issuedCount = movements.filter((m) => m.movementType === 'ISSUE').length;
  const restockedCount = movements.filter((m) => m.movementType === 'RESTOCK').length;

  const totalAddedUnits = movements
    .filter((m) => m.movementType === 'ADD' || m.movementType === 'RESTOCK')
    .reduce((sum, m) => sum + (m.quantity > 0 ? m.quantity : 0), 0);

  const totalIssuedUnits = movements
    .filter((m) => m.movementType === 'ISSUE')
    .reduce((sum, m) => sum + Math.abs(m.quantity || 0), 0);

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-600/20">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Stock Movement History
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Track all medicine stock additions, issues, and restocking activities.
            </p>
          </div>
        </div>

        <button
          onClick={fetchMovements}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh History</span>
        </button>
      </div>

      {/* SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Movements</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalMovements}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Database audit trail records</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Added</p>
            <h3 className="text-2xl font-extrabold text-blue-700 mt-1">{addedCount}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Initial catalog batches created</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <PlusCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Issued</p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{issuedCount}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{totalIssuedUnits} units dispensed/issued</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Restocked</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{restockedCount}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">+{totalAddedUnits} total units added</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Type Filter Pills */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Movements' },
            { id: 'ADD', label: 'Added' },
            { id: 'ISSUE', label: 'Issued' },
            { id: 'RESTOCK', label: 'Restocked' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setMovementTypeFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-lg transition text-xs ${
                movementTypeFilter === f.id
                  ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                  : 'hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search medicine, code, batch number..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </form>
      </div>

      {/* STOCK MOVEMENT TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Date & Time</th>
                <th className="py-3.5 px-6">Medicine Item</th>
                <th className="py-3.5 px-6">Batch Number</th>
                <th className="py-3.5 px-6">Movement Type</th>
                <th className="py-3.5 px-6 text-center">Quantity Changed</th>
                <th className="py-3.5 px-6 text-center">Previous Stock</th>
                <th className="py-3.5 px-6 text-center">New Stock</th>
                <th className="py-3.5 px-6">User / Performed By</th>
                <th className="py-3.5 px-6">Reason / Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <p className="font-medium text-slate-600">Loading database stock movements...</p>
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">No stock movement records found</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Stock movement transactions are recorded automatically whenever stock is created, issued, or restocked.
                    </p>
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  const isPositive = m.quantity > 0;
                  const formattedDate = m.timestamp
                    ? new Date(m.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })
                    : '—';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 font-mono text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        <div>{m.medicineName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{m.medicineCode}</div>
                      </td>
                      <td className="py-4 px-6 font-mono font-medium text-slate-700">
                        {m.batchNumber || 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            m.movementType === 'ADD'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : m.movementType === 'RESTOCK'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {m.movementType === 'ADD'
                            ? 'STOCK ADDED'
                            : m.movementType === 'RESTOCK'
                            ? 'RESTOCKED'
                            : 'ISSUED / DEDUCTED'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-mono font-bold">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                            isPositive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPositive ? `+${m.quantity}` : m.quantity}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-slate-500 font-medium">
                        {m.previousQuantity}
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-slate-900 font-bold">
                        {m.newQuantity}
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">
                        {m.performedBy || 'Pharmacist System'}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {m.reason || 'Inventory Adjustment'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
