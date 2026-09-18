import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { medicineService } from '../../../services/api/medicineService';
import { categoryService } from '../../../services/api/categoryService';
import { useAuth } from '../../../contexts/AuthContext';
import UnifiedMedicineDetailsModal from '../../medicine/components/UnifiedMedicineDetailsModal';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  Pill,
  Boxes,
  Search,
  Eye,
  RefreshCw,
  Activity,
  HeartPulse,
  ShieldCheck,
  User,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMedicine, setViewMedicine] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [medsRes, catsRes] = await Promise.all([
        medicineService.getAllMedicines(0, 50).catch(() => []),
        categoryService.getAllCategories().catch(() => [])
      ]);

      const medList = medsRes?.content ? medsRes.content : Array.isArray(medsRes) ? medsRes : [];
      setMedicines(medList);
      setCategories(Array.isArray(catsRes) ? catsRes : []);
    } catch (err) {
      console.error('Failed to load user portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const filteredMedicines = medicines.filter((m) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (m.name || '').toLowerCase().includes(q) ||
      (m.genericName || '').toLowerCase().includes(q) ||
      (m.manufacturer || '').toLowerCase().includes(q) ||
      (m.medicineCode || '').toLowerCase().includes(q);

    const matchesCategory = selectedCategory
      ? m.category?.id === Number(selectedCategory)
      : true;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-sans text-slate-900 dark:text-slate-100 pb-10">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-indigo-50 to-white dark:from-blue-950 dark:via-slate-900 dark:to-indigo-950 p-8 rounded-3xl text-slate-900 dark:text-white shadow-xs dark:shadow-xl border border-blue-100 dark:border-slate-800">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-400/30 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Patient & Public Medicine Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Welcome, {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            Search medicine formulations, view active dosage specifications, browse verified categories, and stay informed on health guidelines.
          </p>

          {/* Quick Search inside Hero */}
          <div className="mt-6 relative max-w-xl">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medicine by brand name, generic formulation, or code..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/medicines')}
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold group-hover:scale-110 transition">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Browse Medicines</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Explore full medicine catalog</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
        </div>

        <div
          onClick={() => navigate('/categories')}
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold group-hover:scale-110 transition">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Browse Categories</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Pharmaceutical classifications</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
        </div>

        <div
          onClick={() => navigate('/profile')}
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 transition">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">My Profile</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Manage personal information</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
        </div>
      </div>

      {/* Main Section: Medicine Search & Catalog */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Medicine Formulations Catalog
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified pharmaceutical list with dosage, manufacturer details, and pricing
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Formulations
            </button>
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === String(cat.id) ? '' : String(cat.id))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedCategory === String(cat.id)
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Medicines Grid */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-xs font-medium">Loading medicine formulations catalog...</p>
          </div>
        ) : medicines.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <Pill className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No medicine formulations currently available in the catalog.</p>
            <button
              onClick={fetchUserData}
              className="mt-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition"
            >
              Refresh Catalog
            </button>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No medicines match your search criteria or category filter.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
              className="mt-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition"
            >
              Clear Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMedicines.slice(0, 9).map((med) => (
              <div
                key={med.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition bg-slate-50/50 dark:bg-slate-950/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                      {med.medicineCode}
                    </span>
                    <StatusBadge status={med.status === 'INACTIVE' ? 'OUT_OF_STOCK' : 'ACTIVE'} label={med.status === 'INACTIVE' ? 'Out of Stock' : 'Available'} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{med.name}</h3>
                  {med.genericName && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5">{med.genericName}</p>
                  )}

                  <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Category:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{med.category?.name || 'General'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dosage:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{med.dosage || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Manufacturer:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{med.manufacturer || 'Standard'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Unit Price</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{formatINR(med.unitPrice)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setViewMedicine(med);
                      setViewModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredMedicines.length > 9 && (
          <div className="text-center pt-2">
            <Link
              to="/medicines"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition"
            >
              View Full Catalog ({filteredMedicines.length} items) <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Health Awareness & Information Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 rounded-2xl text-white border border-emerald-800 shadow-md">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Healthcare Notice & Safety Guidelines
            </h3>
            <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
              Always consult a certified healthcare professional before taking prescription medicines. Verify dosage requirements, check manufacturer expiration dates, and store medicines as directed on packaging.
            </p>
          </div>
        </div>
      </div>

      {/* View Medicine Details Modal */}
      {viewModalOpen && viewMedicine && (
        <UnifiedMedicineDetailsModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          medicine={viewMedicine}
          allMedicines={medicines}
          onSelectRelated={(rel) => setViewMedicine(rel)}
        />
      )}
    </div>
  );
}
