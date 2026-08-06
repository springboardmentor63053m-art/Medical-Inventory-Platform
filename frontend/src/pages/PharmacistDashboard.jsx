import { useEffect, useState } from "react";
import { ShoppingCart, IndianRupee, Clock3, XCircle, AlertTriangle, Truck } from "lucide-react";
import Sidebar from "../components/Sidebar";
import StatusPill from "../components/StatusPill";
import api from "../api/axios";

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="label-card p-5 animate-fade-up">
      <span className="label-punch left" />
      <span className="label-punch right" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">{label}</p>
          <p className="font-[var(--font-display)] text-2xl font-semibold mt-2 text-[var(--color-ink)]">{value}</p>
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: accent + "20" }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
      </div>
    </div>
  );
}

function medStatus(m) {
  const today = new Date();
  const expiry = new Date(m.expiryDate);
  return expiry < today ? "expired" : "expiring";
}

export default function PharmacistDashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/pharmacist")
      .then((res) => setStats(res.data))
      .catch(() => setErr("Could not load pharmacist dashboard. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Pharmacist Dashboard</h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">Purchase summary, supply insight, and expiry monitoring.</p>
        </div>

        {err && <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-4 py-3 mb-6">{err}</p>}

        {loading ? (
          <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
        ) : stats && (
          <>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-soft)] mb-3">Purchase summary</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={ShoppingCart} label="Purchases this month" value={stats.purchasesThisMonth} accent="#0f5c56" />
              <StatCard icon={IndianRupee} label="Spend this month" value={`₹${Number(stats.spendThisMonth || 0).toLocaleString("en-IN")}`} accent="#0f5c56" />
              <StatCard icon={AlertTriangle} label="Low stock items" value={stats.lowStockCount} accent="#d9932e" />
              <StatCard icon={XCircle} label="Expired items" value={stats.expiredCount} accent="#d1503a" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Supply insight */}
              <div className="label-card p-6">
                <span className="label-punch left" />
                <span className="label-punch right" />
                <div className="flex items-center gap-2 mb-4">
                  <Truck size={16} className="text-[var(--color-ink-soft)]" />
                  <h2 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">Supply insight</h2>
                </div>
                {(!stats.topSuppliers || stats.topSuppliers.length === 0) ? (
                  <p className="text-sm text-[var(--color-ink-soft)]">No purchase history yet.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.topSuppliers.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-[var(--color-ink)]">{s.supplierName}</p>
                          <p className="text-xs text-[var(--color-ink-soft)]">{s.purchaseCount} purchases</p>
                        </div>
                        <p className="font-mono font-semibold text-[var(--color-primary)]">₹{Number(s.totalSpend).toLocaleString("en-IN")}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expiry report */}
              <div className="label-card p-6">
                <span className="label-punch left" />
                <span className="label-punch right" />
                <div className="flex items-center gap-2 mb-4">
                  <Clock3 size={16} className="text-[var(--color-ink-soft)]" />
                  <h2 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">Expiry report — next 30 days</h2>
                </div>
                {(!stats.expiringMedicines || stats.expiringMedicines.length === 0) ? (
                  <p className="text-sm text-[var(--color-ink-soft)]">Nothing expiring soon. 🎉</p>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {stats.expiringMedicines.map((m) => (
                      <div key={m.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-[var(--color-ink)]">{m.name}</p>
                          <p className="text-xs text-[var(--color-ink-soft)] font-mono">{m.batchNumber} · exp {m.expiryDate}</p>
                        </div>
                        <StatusPill status={medStatus(m)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
