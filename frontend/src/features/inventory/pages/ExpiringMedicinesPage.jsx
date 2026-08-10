import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryService } from '../../../services/api/inventoryService';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  Clock,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  MapPin,
  Pill,
  ArrowLeft,
  Filter,
  CheckCircle2,
  ShieldCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function ExpiringMedicinesPage() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRange, setFilterRange] = useState('ALL'); // 'ALL' | 'EXPIRED' | '30_DAYS' | '60_DAYS' | '90_DAYS'
  const [sortField, setSortField] = useState('daysRemaining');
  const [sortDirection, setSortDirection] = useState('asc');

  const fetchExpiryData = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getAllInventory();
      const list = Array.isArray(data) ? data : [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const itemsWithDays = list.map((item) => {
        let days = 999;
        if (item.expiryDate) {
          const expDate = new Date(item.expiryDate);
          expDate.setHours(0, 0, 0, 0);
          days = Math.round((expDate - today) / (1000 * 60 * 60 * 24));
        }
        return { ...item, daysRemaining: days };
      });

      const expiringList = itemsWithDays.filter(
        (item) => item.daysRemaining <= 90
      );

      setInventoryItems(expiringList);
    } catch (err) {
      console.error('Failed to load expiring inventory items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiryData();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter items based on active tab and search query
  const filteredItems = inventoryItems.filter((item) => {
    const days = item.daysRemaining;
    const nameMatch = (item.medicine?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const batchMatch = (item.batchNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const catMatch = (item.medicine?.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSearch = nameMatch || batchMatch || catMatch;

    if (!matchesSearch) return false;

    if (filterRange === 'EXPIRED') return days < 0;
    if (filterRange === '30_DAYS') return days >= 0 && days <= 30;
    if (filterRange === '60_DAYS') return days >= 0 && days <= 60;
    if (filterRange === '90_DAYS') return days >= 0 && days <= 90;
    return true; // 'ALL'
  });

  // Apply sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'medicineName') {
      valA = (a.medicine?.name || '').toLowerCase();
      valB = (b.medicine?.name || '').toLowerCase();
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-purple-600 font-bold" /> : <ArrowDown className="w-3 h-3 text-purple-600 font-bold" />;
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Link to="/dashboard" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <span>/</span>
            <span>Surveillance Module</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-600" /> Enterprise Batch Expiration Surveillance (&lt;90 Days)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time batch expiration surveillance for items expiring within 30, 60, and 90 days.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchExpiryData}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
            title="Refresh Expiry List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/inventory"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            Manage Inventory
          </Link>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by medicine name, batch, or category..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterRange('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              filterRange === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Expiries (&lt;90d &amp; Expired)
          </button>

          <button
            onClick={() => setFilterRange('EXPIRED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              filterRange === 'EXPIRED'
                ? 'bg-rose-900 text-white border-rose-900'
                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span>🛑</span> Expired
          </button>

          <button
            onClick={() => setFilterRange('30_DAYS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              filterRange === '30_DAYS'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span>🔴</span> &lt; 30 Days
          </button>

          <button
            onClick={() => setFilterRange('60_DAYS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              filterRange === '60_DAYS'
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
            }`}
          >
            <span>🟠</span> &lt; 60 Days
          </button>

          <button
            onClick={() => setFilterRange('90_DAYS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              filterRange === '90_DAYS'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span>🟡</span> &lt; 90 Days
          </button>
        </div>
      </div>

      {/* Expiry Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Batch No.</th>
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
                  onClick={() => handleSort('expiryDate')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Expiry Date</span>
                    {renderSortIcon('expiryDate')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('daysRemaining')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Days Remaining</span>
                    {renderSortIcon('daysRemaining')}
                  </div>
                </th>
                <th className="py-3.5 px-6">Severity Level</th>
                <th className="py-3.5 px-6">Shelf Location</th>
                <th
                  onClick={() => handleSort('quantity')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Stock Level</span>
                    {renderSortIcon('quantity')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600 mb-2" />
                    Calculating expiry timelines...
                  </td>
                </tr>
              ) : sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                      <p className="font-bold text-slate-900">No medicines are expiring in the next 90 days.</p>
                      <p className="text-xs text-slate-500">All batch expiration dates satisfy the 90-day threshold requirement.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedItems.map((item) => {
                  const days = item.daysRemaining;
                  let badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                  let badgeDot = '🟡';
                  let severityLabel = 'Expiring in 90 Days';

                  if (days < 0) {
                    badgeColor = 'bg-rose-100 text-rose-900 border-rose-300';
                    badgeDot = '🛑';
                    severityLabel = 'EXPIRED';
                  } else if (days <= 30) {
                    badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
                    badgeDot = '🔴';
                    severityLabel = 'Critical (< 30 Days)';
                  } else if (days <= 60) {
                    badgeColor = 'bg-orange-50 text-orange-800 border-orange-200';
                    badgeDot = '🟠';
                    severityLabel = 'Warning (< 60 Days)';
                  } else {
                    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                    badgeDot = '🟡';
                    severityLabel = 'Notice (< 90 Days)';
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 font-mono font-semibold text-slate-900">
                        {item.batchNumber}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{item.medicine?.name || `Medicine #${item.medicineId}`}</div>
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span>Medicine Code: <span className="font-mono font-semibold text-purple-700">{item.medicine?.medicineCode || 'N/A'}</span></span>
                          <span>•</span>
                          <span>{item.medicine?.category?.name || 'Category N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono font-medium text-slate-900">
                        {item.expiryDate}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-800">
                        {days < 0 ? 'Expired' : `${days} days`}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 font-bold text-[10px] rounded-full border inline-flex items-center gap-1.5 ${badgeColor}`}>
                          <span>{badgeDot}</span>
                          <span>{severityLabel}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.storageLocation || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-slate-900">{item.quantity} units</span>
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
