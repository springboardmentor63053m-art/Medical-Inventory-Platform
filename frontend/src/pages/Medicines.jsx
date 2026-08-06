import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Minus } from "lucide-react";
import Sidebar from "../components/Sidebar";
import StatusPill from "../components/StatusPill";
import MedicineFormModal from "../components/MedicineFormModal";
import api from "../api/axios";

function medicineStatus(m) {
  const today = new Date();
  const expiry = new Date(m.expiryDate);
  const daysToExpiry = (expiry - today) / (1000 * 60 * 60 * 24);

  if (expiry < today) return "expired";
  if (daysToExpiry <= 30) return "expiring";
  if (m.quantity === 0) return "out";
  if (m.quantity <= m.reorderLevel) return "low";
  return "ok";
}

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [medRes, supRes] = await Promise.all([api.get("/medicines"), api.get("/suppliers")]);
      setMedicines(medRes.data);
      setSuppliers(supRes.data);
    } catch {
      setErr("Could not load inventory. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    if (!query) return medicines;
    const q = query.toLowerCase();
    return medicines.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.batchNumber.toLowerCase().includes(q) ||
        (m.category || "").toLowerCase().includes(q) ||
        (m.supplier?.name || "").toLowerCase().includes(q)
    );
  }, [medicines, query]);

  const handleSave = async (payload) => {
    try {
      if (editing) {
        await api.put(`/medicines/${editing.id}`, payload);
      } else {
        await api.post("/medicines", payload);
      }
      setModalOpen(false);
      setEditing(null);
      loadData();
    } catch (e) {
      alert(e?.response?.data?.error || "Could not save medicine");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this medicine record?")) return;
    await api.delete(`/medicines/${id}`);
    loadData();
  };

  const adjustStock = async (id, delta) => {
    await api.patch(`/medicines/${id}/adjust-stock`, { delta });
    loadData();
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Medicines</h1>
            <p className="text-sm text-[var(--color-ink-soft)] mt-1">{medicines.length} items tracked across your inventory.</p>
          </div>
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[var(--color-primary-dark)]"
          >
            <Plus size={16} /> Add medicine
          </button>
        </div>

        <div className="relative mb-5 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, batch, category, supplier…"
            className="w-full rounded-lg border border-[var(--color-line)] bg-white pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        {err && <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-4 py-3 mb-4">{err}</p>}

        <div className="label-card overflow-hidden">
          <span className="label-punch left" />
          <span className="label-punch right" />
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)] border-b border-[var(--color-line)]">
                <th className="px-5 py-4">Medicine</th>
                <th className="px-4 py-4">Batch</th>
                <th className="px-4 py-4">Supplier</th>
                <th className="px-4 py-4">Expiry</th>
                <th className="px-4 py-4">Stock</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Price</th>
                <th className="px-4 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-[var(--color-ink-soft)]">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-[var(--color-ink-soft)]">No medicines match your search.</td></tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-mint)]/40">
                    <td className="px-5 py-4">
                      <p className="font-medium text-[var(--color-ink)]">{m.name}</p>
                      <p className="text-xs text-[var(--color-ink-soft)]">{m.category || "Uncategorized"}</p>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-[var(--color-ink-soft)]">{m.batchNumber}</td>
                    <td className="px-4 py-4 text-[var(--color-ink-soft)]">{m.supplier?.name || "—"}</td>
                    <td className="px-4 py-4 text-[var(--color-ink-soft)]">{m.expiryDate}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => adjustStock(m.id, -1)} className="w-6 h-6 rounded-md border border-[var(--color-line)] flex items-center justify-center hover:bg-[var(--color-canvas)]">
                          <Minus size={12} />
                        </button>
                        <span className="font-mono font-semibold w-8 text-center">{m.quantity}</span>
                        <button onClick={() => adjustStock(m.id, 1)} className="w-6 h-6 rounded-md border border-[var(--color-line)] flex items-center justify-center hover:bg-[var(--color-canvas)]">
                          <Plus size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4"><StatusPill status={medicineStatus(m)} /></td>
                    <td className="px-4 py-4 font-mono text-[var(--color-ink)]">₹{Number(m.price).toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditing(m); setModalOpen(true); }} className="text-[var(--color-ink-soft)] hover:text-[var(--color-primary)]">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(m.id)} className="text-[var(--color-ink-soft)] hover:text-[var(--color-coral)]">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <MedicineFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={handleSave}
        suppliers={suppliers}
        initial={editing}
      />
    </div>
  );
}
