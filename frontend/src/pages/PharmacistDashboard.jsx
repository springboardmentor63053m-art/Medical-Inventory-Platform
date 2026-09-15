import { useEffect, useState } from "react";
import { Clock3, XCircle, AlertTriangle, Boxes, Package, Receipt, PlusCircle, Activity } from "lucide-react";
import { Link } from "react-router-dom";
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Pharmacist Dashboard</h1>
            <p className="text-sm text-[var(--color-ink-soft)] mt-1">Inventory health, expiry monitoring, and your sales activity.</p>
          </div>
          <Link
            to="/sales/new"
            className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[var(--color-primary-dark)]"
          >
            <PlusCircle size={16} /> New sale
          </Link>
        </div>

        {err && <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-4 py-3 mb-6">{err}</p>}

        {loading ? (
          <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
        ) : stats && (
          <>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-soft)] mb-3">Inventory summary</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={Boxes} label="Total medicines" value={stats.totalMedicines} accent="#0f5c56" />
              <StatCard icon={Package} label="Available stock (units)" value={Number(stats.availableStock || 0).toLocaleString("en-IN")} accent="#0f5c56" />
              <StatCard icon={AlertTriangle} label="Low stock items" value={stats.lowStockCount} accent="#d9932e" />
              <StatCard icon={XCircle} label="Out of stock" value={stats.outOfStockCount} accent="#d1503a" />
            </div>

            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-soft)] mb-3">My sales</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <StatCard icon={Receipt} label="Sales recorded" value={stats.mySalesCount} accent="#0f5c56" />
              <StatCard icon={Package} label="Sales total" value={`₹${Number(stats.mySalesTotal || 0).toLocaleString("en-IN")}`} accent="#0f5c56" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Low stock watchlist */}
              <div className="label-card p-6">
                <span className="label-punch left" />
                <span className="label-punch right" />
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-[var(--color-amber)]" />
                  <h2 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">Low stock watchlist</h2>
                </div>
                {(!stats.lowStockMedicines || stats.lowStockMedicines.length === 0) ? (
                  <p className="text-sm text-[var(--color-ink-soft)]">Nothing low on stock right now. 🎉</p>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {stats.lowStockMedicines.map((m) => (
                      <div key={m.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-[var(--color-ink)]">{m.name}</p>
                          <p className="text-xs text-[var(--color-ink-soft)] font-mono">{m.batchNumber} · reorder at {m.reorderLevel}</p>
                        </div>
                        <span className="font-mono font-semibold text-[var(--color-amber)]">{m.quantity} left</span>
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

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent sales */}
              <div className="label-card p-6">
                <span className="label-punch left" />
                <span className="label-punch right" />
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">My recent sales</h2>
                  <Link to="/sales/history" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">View all</Link>
                </div>
                {(!stats.recentSales || stats.recentSales.length === 0) ? (
                  <p className="text-sm text-[var(--color-ink-soft)]">
                    No sales recorded yet. Go to <Link to="/sales/new" className="text-[var(--color-primary)] font-semibold hover:underline">New sale</Link> to create a bill.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentSales.map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-sm border-b border-[var(--color-line)] last:border-0 pb-2.5 last:pb-0">
                        <div>
                          <p className="font-medium text-[var(--color-ink)]">{s.billNumber} — {s.customerName}</p>
                          <p className="text-xs text-[var(--color-ink-soft)]">{new Date(s.saleDate).toLocaleString()}</p>
                        </div>
                        <span className="font-mono font-semibold text-[var(--color-primary)]">₹{Number(s.totalAmount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent stock movements */}
              <div className="label-card p-6">
                <span className="label-punch left" />
                <span className="label-punch right" />
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={16} className="text-[var(--color-ink-soft)]" />
                  <h2 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">Recent stock movements</h2>
                </div>
                {(!stats.recentStockMovements || stats.recentStockMovements.length === 0) ? (
                  <p className="text-sm text-[var(--color-ink-soft)]">No recent activity.</p>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {stats.recentStockMovements.map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-[var(--color-ink)]">{m.medicineName}</p>
                          <p className="text-xs text-[var(--color-ink-soft)] font-mono">{m.type} · {m.timestamp}</p>
                        </div>
                        <span className={`font-mono font-semibold ${m.quantityChange >= 0 ? "text-[var(--color-primary)]" : "text-[var(--color-coral)]"}`}>
                          {m.quantityChange >= 0 ? "+" : ""}{m.quantityChange}
                        </span>
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
