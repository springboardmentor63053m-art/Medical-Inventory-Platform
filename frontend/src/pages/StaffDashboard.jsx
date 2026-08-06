import { useEffect, useState } from "react";
import { ShoppingCart, AlertTriangle, Boxes, FileDown } from "lucide-react";
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
        <div className="mb-8">
          <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Staff Dashboard</h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">Your purchase activity and quick inventory checks.</p>
        </div>

        {err && <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-4 py-3 mb-6">{err}</p>}

        {loading ? (
          <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
        ) : stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <StatCard icon={ShoppingCart} label="My purchases recorded" value={stats.myPurchasesCount} accent="#0f5c56" />
              <StatCard icon={AlertTriangle} label="Low stock items" value={stats.lowStockCount} accent="#d9932e" />
              <StatCard icon={Boxes} label="Total medicines" value={stats.totalMedicines} accent="#0f5c56" />
            </div>

            <div className="label-card p-6">
              <span className="label-punch left" />
              <span className="label-punch right" />
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">My purchase history</h2>
                <Link to="/reports" className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline">
                  <FileDown size={14} /> Download full report
                </Link>
              </div>
              {(!stats.recentPurchases || stats.recentPurchases.length === 0) ? (
                <p className="text-sm text-[var(--color-ink-soft)]">
                  You haven't recorded any purchases yet. Go to <Link to="/purchases" className="text-[var(--color-primary)] font-semibold hover:underline">Purchases</Link> to log a restock.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)] border-b border-[var(--color-line)]">
                      <th className="py-2 pr-4">Medicine</th>
                      <th className="py-2 pr-4">Qty</th>
                      <th className="py-2 pr-4">Total</th>
                      <th className="py-2 pr-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentPurchases.map((p) => (
                      <tr key={p.id} className="border-b border-[var(--color-line)] last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-[var(--color-ink)]">{p.medicine?.name}</td>
                        <td className="py-2.5 pr-4 font-mono">{p.quantity}</td>
                        <td className="py-2.5 pr-4 font-mono">₹{Number(p.totalAmount).toFixed(2)}</td>
                        <td className="py-2.5 pr-4 text-[var(--color-ink-soft)]">{new Date(p.purchaseDate).toLocaleDateString()}</td>
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
