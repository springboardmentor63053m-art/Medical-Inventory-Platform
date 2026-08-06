import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

const emptyForm = { medicineId: "", supplierId: "", quantity: "", unitPrice: "", note: "" };

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, mRes, sRes] = await Promise.all([
        api.get("/purchases"),
        api.get("/medicines"),
        api.get("/suppliers"),
      ]);
      setPurchases(pRes.data);
      setMedicines(mRes.data);
      setSuppliers(sRes.data);
    } catch {
      setErr("Could not load purchases. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/purchases", {
        ...form,
        supplierId: form.supplierId || null,
        quantity: Number(form.quantity),
        unitPrice: Number(form.unitPrice),
      });
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (e) {
      alert(e?.response?.data?.error || "Could not record purchase");
    }
  };

  const field = "mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]";
  const label = "text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]";

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Purchases</h1>
            <p className="text-sm text-[var(--color-ink-soft)] mt-1">Record restocks — each purchase updates stock and the movement log automatically.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[var(--color-primary-dark)]"
          >
            <Plus size={16} /> Record purchase
          </button>
        </div>

        {err && <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-4 py-3 mb-4">{err}</p>}

        <div className="label-card overflow-hidden">
          <span className="label-punch left" />
          <span className="label-punch right" />
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)] border-b border-[var(--color-line)]">
                <th className="px-5 py-4">Medicine</th>
                <th className="px-4 py-4">Supplier</th>
                <th className="px-4 py-4">Qty</th>
                <th className="px-4 py-4">Unit price</th>
                <th className="px-4 py-4">Total</th>
                <th className="px-4 py-4">Purchased by</th>
                <th className="px-4 py-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-[var(--color-ink-soft)]">Loading…</td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-[var(--color-ink-soft)]">No purchases recorded yet.</td></tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-mint)]/40">
                    <td className="px-5 py-4 font-medium text-[var(--color-ink)]">{p.medicine?.name}</td>
                    <td className="px-4 py-4 text-[var(--color-ink-soft)]">{p.supplier?.name || "—"}</td>
                    <td className="px-4 py-4 font-mono">{p.quantity}</td>
                    <td className="px-4 py-4 font-mono">₹{Number(p.unitPrice).toFixed(2)}</td>
                    <td className="px-4 py-4 font-mono font-semibold text-[var(--color-primary)]">₹{Number(p.totalAmount).toFixed(2)}</td>
                    <td className="px-4 py-4 text-[var(--color-ink-soft)]">{p.purchasedBy?.fullName || "—"}</td>
                    <td className="px-4 py-4 text-[var(--color-ink-soft)]">{new Date(p.purchaseDate).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">Record purchase</h2>
              <button onClick={() => setModalOpen(false)} className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={label}>Medicine</label>
                <select required className={field} value={form.medicineId} onChange={(e) => setForm({ ...form, medicineId: e.target.value })}>
                  <option value="">Select medicine…</option>
                  {medicines.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.batchNumber})</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Supplier</label>
                <select className={field} value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                  <option value="">— None —</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Quantity</label>
                  <input required type="number" min="1" className={field} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div>
                  <label className={label}>Unit price (₹)</label>
                  <input required type="number" min="0" step="0.01" className={field} value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
                </div>
              </div>
              <div>
                <label className={label}>Note (optional)</label>
                <input className={field} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. Monthly restock" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-lg border border-[var(--color-line)] py-2.5 text-sm font-semibold text-[var(--color-ink-soft)] hover:bg-[var(--color-canvas)]">
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-lg bg-[var(--color-primary)] text-white py-2.5 text-sm font-semibold hover:bg-[var(--color-primary-dark)]">
                  Record purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
