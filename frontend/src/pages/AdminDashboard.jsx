import { useEffect, useState } from "react";
import {
  Boxes, Truck, Users, AlertTriangle, XCircle, Clock3, PackageSearch,
  IndianRupee, ShoppingCart, Activity, Server,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

function StatCard({ icon: Icon, label, value, accent, sub }) {
  return (
    <div className="label-card p-5 animate-fade-up">
      <span className="label-punch left" />
      <span className="label-punch right" />
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">{label}</p>
          <p className="font-[var(--font-display)] text-2xl font-semibold mt-2 text-[var(--color-ink)] truncate">{value}</p>
          {sub && <p className="text-xs text-[var(--color-ink-soft)] mt-1">{sub}</p>}
        </div>
        <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center" style={{ background: accent + "20" }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/admin")
      .then((res) => setStats(res.data))
      .catch(() => setErr("Could not load admin dashboard. Is the backend running and are you signed in as Admin?"))
      .finally(() => setLoading(false));
  }, []);

  const supplierChart = (stats?.supplierInsights || []).map((s) => ({
    name: s.supplierName,
    spend: Number(s.totalSpend),
  }));

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Admin Dashboard</h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">Full inventory, supplier, and system analytics.</p>
        </div>

        {err && <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-4 py-3 mb-6">{err}</p>}

        {loading ? (
          <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
        ) : stats && (
          <>
            {/* Inventory analytics */}
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-soft)] mb-3">Inventory analytics</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Boxes} label="Total medicines" value={stats.totalMedicines} accent="#0f5c56" />
              <StatCard icon={Truck} label="Suppliers" value={stats.totalSuppliers} accent="#0f5c56" />
              <StatCard icon={Users} label="Users" value={stats.totalUsers} accent="#0f5c56" />
              <StatCard icon={IndianRupee} label="Inventory value" value={`₹${Number(stats.totalInventoryValue || 0).toLocaleString("en-IN")}`} accent="#0f5c56" />
              <StatCard icon={AlertTriangle} label="Low stock" value={stats.lowStockCount} accent="#d9932e" />
              <StatCard icon={XCircle} label="Out of stock" value={stats.outOfStockCount} accent="#d1503a" />
              <StatCard icon={Clock3} label="Near expiry" value={stats.nearExpiryCount} accent="#d9932e" sub="Within 30 days" />
              <StatCard icon={PackageSearch} label="Expired" value={stats.expiredCount} accent="#d1503a" />
            </div>

            {/* Purchases + system monitoring */}
            <div className="grid lg:grid-cols-3 gap-4 mb-8">
              <StatCard icon={ShoppingCart} label="Purchases this month" value={stats.purchasesThisMonth} accent="#0f5c56" />
              <StatCard icon={IndianRupee} label="Spend this month" value={`₹${Number(stats.totalSpendThisMonth || 0).toLocaleString("en-IN")}`} accent="#0f5c56" />
              <div className="label-card p-5">
                <span className="label-punch left" />
                <span className="label-punch right" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">System status</p>
                    <p className="font-[var(--font-display)] text-xl font-semibold mt-2 text-[var(--color-primary)]">{stats.systemStatus}</p>
                    <p className="text-xs text-[var(--color-ink-soft)] mt-1 font-mono">{stats.serverTime}</p>
                  </div>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--color-mint)]">
                    <Server size={18} className="text-[var(--color-primary)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Supplier analytics */}
            <div className="label-card p-6 mb-8">
              <span className="label-punch left" />
              <span className="label-punch right" />
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">Supplier analytics — spend by supplier</h2>
                <Activity size={16} className="text-[var(--color-ink-soft)]" />
              </div>
              {supplierChart.length === 0 ? (
                <p className="text-sm text-[var(--color-ink-soft)]">No purchases recorded yet.</p>
              ) : (
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={supplierChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
                      <XAxis dataKey="name" fontSize={12} stroke="var(--color-ink-soft)" />
                      <YAxis fontSize={12} stroke="var(--color-ink-soft)" />
                      <Tooltip />
                      <Bar dataKey="spend" fill="#0f5c56" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <p className="text-xs text-[var(--color-ink-soft)]">
              Looking for detailed logs? See <span className="font-semibold text-[var(--color-ink)]">User activity</span> and{" "}
              <span className="font-semibold text-[var(--color-ink)]">Stock movements</span> in the sidebar, or download a full
              report from <span className="font-semibold text-[var(--color-ink)]">Reports</span>.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
