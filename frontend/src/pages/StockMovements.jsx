import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

const typeColor = {
  PURCHASE_IN: "var(--color-primary)",
  DISPENSE_OUT: "var(--color-amber)",
  MANUAL_ADJUSTMENT: "var(--color-ink-soft)",
  DAMAGE_REMOVAL: "var(--color-coral)",
  EXPIRED_REMOVAL: "var(--color-coral)",
};

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/stock-movements")
      .then((res) => setMovements(res.data))
      .catch(() => setErr("Could not load stock movements."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center gap-2 mb-8">
          <Activity size={20} className="text-[var(--color-primary)]" />
          <div>
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Stock Movement Report</h1>
            <p className="text-sm text-[var(--color-ink-soft)] mt-1">Every stock change, in order, with who made it.</p>
          </div>
        </div>

        {err && <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-4 py-3 mb-4">{err}</p>}

        <div className="label-card overflow-hidden">
          <span className="label-punch left" />
          <span className="label-punch right" />
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)] border-b border-[var(--color-line)]">
                <th className="px-5 py-4">Medicine</th>
                <th className="px-4 py-4">Type</th>
                <th className="px-4 py-4">Change</th>
                <th className="px-4 py-4">Before → After</th>
                <th className="px-4 py-4">By</th>
                <th className="px-4 py-4">Note</th>
                <th className="px-4 py-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-[var(--color-ink-soft)]">Loading…</td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-[var(--color-ink-soft)]">No stock movements yet.</td></tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-mint)]/40">
                    <td className="px-5 py-4 font-medium text-[var(--color-ink)]">{m.medicine?.name}</td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-semibold" style={{ color: typeColor[m.type] || "var(--color-ink-soft)" }}>
                        {m.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono">{m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}</td>
                    <td className="px-4 py-4 font-mono text-[var(--color-ink-soft)]">{m.previousQuantity} → {m.newQuantity}</td>
                    <td className="px-4 py-4 text-[var(--color-ink-soft)]">{m.performedBy?.fullName || "System"}</td>
                    <td className="px-4 py-4 text-[var(--color-ink-soft)]">{m.note}</td>
                    <td className="px-4 py-4 text-[var(--color-ink-soft)]">{new Date(m.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
