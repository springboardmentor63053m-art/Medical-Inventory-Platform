import { useEffect, useState } from "react";
import { AlertTriangle, Boxes, Package, PlusCircle, Receipt } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
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

export default function StaffDashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/staff")
      .then((res) => setStats(res.data))
      .catch(() => setErr("Could not load staff dashboard. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Staff Dashboard</h1>
            <p className="text-sm text-[var(--color-ink-soft)] mt-1">Inventory checks and your sales activity.</p>
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Boxes} label="Total medicines" value={stats.totalMedicines} accent="#0f5c56" />
              <StatCard icon={Package} label="Available stock (units)" value={Number(stats.availableStock || 0).toLocaleString("en-IN")} accent="#0f5c56" />
              <StatCard icon={AlertTriangle} label="Low stock items" value={stats.lowStockCount} accent="#d9932e" />
              <StatCard icon={Receipt} label="My sales recorded" value={stats.mySalesCount} accent="#0f5c56" />
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

              {/* My sales total */}
              <div className="label-card p-6">
                <span className="label-punch left" />
                <span className="label-punch right" />
                <div className="flex items-center gap-2 mb-4">
                  <Receipt size={16} className="text-[var(--color-ink-soft)]" />
                  <h2 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">My sales total</h2>
                </div>
                <p className="font-[var(--font-display)] text-3xl font-bold text-[var(--color-primary)]">
                  ₹{Number(stats.mySalesTotal || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-[var(--color-ink-soft)] mt-1">across {stats.mySalesCount} bill(s) you've recorded</p>
              </div>
            </div>

            <div className="label-card p-6">
              <span className="label-punch left" />
              <span className="label-punch right" />
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">My recent sales</h2>
                <Link to="/sales/history" className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline">
                  <Receipt size={14} /> View all
                </Link>
              </div>
              {(!stats.recentSales || stats.recentSales.length === 0) ? (
                <p className="text-sm text-[var(--color-ink-soft)]">
                  No sales recorded yet. Go to <Link to="/sales/new" className="text-[var(--color-primary)] font-semibold hover:underline">New sale</Link> to create a bill.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)] border-b border-[var(--color-line)]">
                      <th className="py-2 pr-4">Bill No.</th>
                      <th className="py-2 pr-4">Customer</th>
                      <th className="py-2 pr-4">Total</th>
                      <th className="py-2 pr-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentSales.map((s) => (
                      <tr key={s.id} className="border-b border-[var(--color-line)] last:border-0">
                        <td className="py-2.5 pr-4 font-mono font-semibold text-[var(--color-primary)]">{s.billNumber}</td>
                        <td className="py-2.5 pr-4 font-medium text-[var(--color-ink)]">{s.customerName}</td>
                        <td className="py-2.5 pr-4 font-mono">₹{Number(s.totalAmount).toFixed(2)}</td>
                        <td className="py-2.5 pr-4 text-[var(--color-ink-soft)]">{new Date(s.saleDate).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
