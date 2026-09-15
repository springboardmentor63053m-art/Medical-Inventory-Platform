import { useEffect, useMemo, useState } from "react";
import { Receipt, X, Search, IndianRupee, ShoppingCart, TrendingUp } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Bill from "../components/Bill";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const PAGE_SIZE = 100;

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="label-card p-4">
      <span className="label-punch left" />
      <span className="label-punch right" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">{label}</p>
          <p className="font-[var(--font-display)] text-xl font-semibold mt-1.5 text-[var(--color-ink)]">{value}</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-[var(--color-mint)] flex items-center justify-center shrink-0">
          <Icon size={16} className="text-[var(--color-primary)]" />
        </div>
      </div>
    </div>
  );
}

export default function SalesHistory() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [viewing, setViewing] = useState(null);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const canSeeAll = user?.role === "ADMIN" || user?.role === "PHARMACIST";

  useEffect(() => {
    api.get(canSeeAll ? "/sales" : "/sales/mine")
      .then((res) => setSales(res.data))
      .catch(() => setErr("Could not load sales history."))
      .finally(() => setLoading(false));
  }, [canSeeAll]);

  const stats = useMemo(() => {
    const totalValue = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const now = new Date();
    const thisMonth = sales.filter((s) => {
      const d = new Date(s.saleDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thisMonthValue = thisMonth.reduce((sum, s) => sum + Number(s.totalAmount), 0);
    return { total: sales.length, totalValue, thisMonthCount: thisMonth.length, thisMonthValue };
  }, [sales]);

  const filtered = useMemo(() => {
    if (!query.trim()) return sales;
    const q = query.toLowerCase();
    return sales.filter((s) =>
      s.customerName?.toLowerCase().includes(q) ||
      s.billNumber?.toLowerCase().includes(q) ||
      s.soldByName?.toLowerCase().includes(q) ||
      s.items?.some((i) => i.medicineName?.toLowerCase().includes(q))
    );
  }, [sales, query]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Sales history</h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">
            {canSeeAll ? "Every bill recorded across the pharmacy." : "Bills you've recorded."}
          </p>
        </div>

        {err && <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-4 py-3 mb-4">{err}</p>}

        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard icon={ShoppingCart} label="Total bills" value={stats.total.toLocaleString("en-IN")} />
            <StatCard icon={IndianRupee} label="Total value" value={`₹${stats.totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} />
            <StatCard icon={TrendingUp} label="This month" value={stats.thisMonthCount.toLocaleString("en-IN")} />
            <StatCard icon={IndianRupee} label="This month value" value={`₹${stats.thisMonthValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} />
          </div>
        )}

        <div className="relative mb-4 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)]" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
            placeholder="Search bill no., customer, staff, medicine…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        <div className="label-card overflow-hidden">
          <span className="label-punch left" />
          <span className="label-punch right" />
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)] border-b border-[var(--color-line)]">
                <th className="px-5 py-4">Bill No.</th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Items</th>
                <th className="px-4 py-4">Total</th>
                {canSeeAll && <th className="px-4 py-4">Staff</th>}
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-[var(--color-ink-soft)]">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-[var(--color-ink-soft)]">No sales recorded yet.</td></tr>
              ) : (
                visible.map((s) => (
                  <tr key={s.id} className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-mint)]/40">
                    <td className="px-5 py-4 font-mono font-semibold text-[var(--color-primary)]">{s.billNumber}</td>
                    <td className="px-4 py-4 font-medium text-[var(--color-ink)]">{s.customerName}</td>
                    <td className="px-4 py-4 text-[var(--color-ink-soft)]">{s.items.length} item(s)</td>
                    <td className="px-4 py-4 font-mono font-semibold">₹{Number(s.totalAmount).toFixed(2)}</td>
                    {canSeeAll && <td className="px-4 py-4 text-[var(--color-ink-soft)]">{s.soldByName}</td>}
                    <td className="px-4 py-4 text-[var(--color-ink-soft)]">{new Date(s.saleDate).toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <button onClick={() => setViewing(s)} className="flex items-center gap-1.5 text-[var(--color-primary)] hover:underline text-xs font-semibold">
                        <Receipt size={13} /> View bill
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-[var(--color-ink-soft)]">
              Showing {visible.length.toLocaleString("en-IN")} of {filtered.length.toLocaleString("en-IN")} bill{filtered.length === 1 ? "" : "s"}
              {query && ` matching "${query}"`}.
            </p>
            {visibleCount < filtered.length && (
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="rounded-lg border border-[var(--color-line)] px-4 py-2 text-xs font-semibold text-[var(--color-ink-soft)] hover:bg-[var(--color-canvas)]"
              >
                Load {Math.min(PAGE_SIZE, filtered.length - visibleCount)} more
              </button>
            )}
          </div>
        )}
      </main>

      {viewing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md relative animate-fade-up">
            <button onClick={() => setViewing(null)} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[var(--color-surface)] shadow flex items-center justify-center text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] print:hidden">
              <X size={16} />
            </button>
            <Bill sale={viewing} />
          </div>
        </div>
      )}
    </div>
  );
}
