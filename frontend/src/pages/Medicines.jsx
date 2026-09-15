import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Minus, Boxes, AlertTriangle, XCircle, Clock3, PackageX } from "lucide-react";
import Sidebar from "../components/Sidebar";
import StatusPill from "../components/StatusPill";
import MedicineThumb from "../components/MedicineThumb";
import MedicineFormModal from "../components/MedicineFormModal";
import RemoveStockModal from "../components/RemoveStockModal";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const PAGE_SIZE = 60;

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

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="label-card p-4">
      <span className="label-punch left" />
      <span className="label-punch right" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">{label}</p>
          <p className="font-[var(--font-display)] text-xl font-semibold mt-1.5 text-[var(--color-ink)]">{value}</p>
        </div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: accent + "20" }}>
          <Icon size={16} style={{ color: accent }} />
        </div>
      </div>
    </div>
  );
}

export default function Medicines() {
  const { user } = useAuth();
  // STAFF can view/search/filter medicines but must never write to them —
  // creating, editing, or adjusting stock are ADMIN/PHARMACIST-only on the
  // backend (see MedicineController), so those controls are hidden here
  // too rather than letting Staff hit a 403 after clicking a visible button.
  const canWrite = user?.role === "ADMIN" || user?.role === "PHARMACIST";
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [removingStockFor, setRemovingStockFor] = useState(null);
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

  const categories = useMemo(
    () => [...new Set(medicines.map((m) => m.category).filter(Boolean))].sort(),
    [medicines]
  );

  const stats = useMemo(() => {
    const low = medicines.filter((m) => medicineStatus(m) === "low").length;
    const out = medicines.filter((m) => medicineStatus(m) === "out").length;
    const expiring = medicines.filter((m) => medicineStatus(m) === "expiring").length;
    const expired = medicines.filter((m) => medicineStatus(m) === "expired").length;
    return { total: medicines.length, low, out, expiring, expired };
  }, [medicines]);

  const filtered = useMemo(() => {
    return medicines.filter((m) => {
      if (query) {
        const q = query.toLowerCase();
        const matches =
          m.name.toLowerCase().includes(q) ||
          m.batchNumber.toLowerCase().includes(q) ||
          (m.category || "").toLowerCase().includes(q) ||
          (m.supplier?.name || "").toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (categoryFilter && m.category !== categoryFilter) return false;
      if (supplierFilter && String(m.supplier?.id) !== supplierFilter) return false;
      if (statusFilter && medicineStatus(m) !== statusFilter) return false;
      return true;
    });
  }, [medicines, query, categoryFilter, supplierFilter, statusFilter]);

  const visible = filtered.slice(0, visibleCount);

  const resetPaging = () => setVisibleCount(PAGE_SIZE);

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

  const removeStock = async ({ quantity, type, reason }) => {
    await api.patch(`/medicines/${removingStockFor.id}/remove-stock`, { quantity, type, reason });
    setRemovingStockFor(null);
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
          {canWrite && (
            <button
              onClick={() => { setEditing(null); setModalOpen(true); }}
              className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[var(--color-primary-dark)]"
            >
              <Plus size={16} /> Add medicine
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <StatCard icon={Boxes} label="Total medicines" value={stats.total} accent="#0f5c56" />
          <StatCard icon={AlertTriangle} label="Low stock" value={stats.low} accent="#d9932e" />
          <StatCard icon={XCircle} label="Out of stock" value={stats.out} accent="#d1503a" />
          <StatCard icon={Clock3} label="Near expiry" value={stats.expiring} accent="#d9932e" />
          <StatCard icon={XCircle} label="Expired" value={stats.expired} accent="#d1503a" />
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-5">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)]" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); resetPaging(); }}
              placeholder="Search by name, batch, category, supplier…"
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); resetPaging(); }}
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={supplierFilter}
            onChange={(e) => { setSupplierFilter(e.target.value); resetPaging(); }}
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="">All suppliers</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); resetPaging(); }}
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="">All stock statuses</option>
            <option value="ok">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
            <option value="expiring">Near expiry</option>
            <option value="expired">Expired</option>
          </select>
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
                visible.map((m) => (
                  <tr key={m.id} className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-mint)]/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <MedicineThumb medicine={m} />
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--color-ink)] truncate">{m.name}</p>
                          <p className="text-xs text-[var(--color-ink-soft)]">{m.category || "Uncategorized"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-[var(--color-ink-soft)]">{m.batchNumber}</td>
                    <td className="px-4 py-4 text-[var(--color-ink-soft)]">{m.supplier?.name || "—"}</td>
                    <td className="px-4 py-4 text-[var(--color-ink-soft)]">{m.expiryDate}</td>
                    <td className="px-4 py-4">
                      {canWrite ? (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => adjustStock(m.id, -1)} className="w-6 h-6 rounded-md border border-[var(--color-line)] flex items-center justify-center hover:bg-[var(--color-canvas)]">
                            <Minus size={12} />
                          </button>
                          <span className="font-mono font-semibold w-8 text-center">{m.quantity}</span>
                          <button onClick={() => adjustStock(m.id, 1)} className="w-6 h-6 rounded-md border border-[var(--color-line)] flex items-center justify-center hover:bg-[var(--color-canvas)]">
                            <Plus size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono font-semibold">{m.quantity}</span>
                      )}
                    </td>
                    <td className="px-4 py-4"><StatusPill status={medicineStatus(m)} /></td>
                    <td className="px-4 py-4 font-mono text-[var(--color-ink)]">₹{Number(m.price).toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {canWrite && (
                          <button onClick={() => { setEditing(m); setModalOpen(true); }} className="text-[var(--color-ink-soft)] hover:text-[var(--color-primary)]">
                            <Pencil size={16} />
                          </button>
                        )}
                        {canWrite && m.quantity > 0 && (
                          <button onClick={() => setRemovingStockFor(m)} title="Remove damaged/expired stock" className="text-[var(--color-ink-soft)] hover:text-[var(--color-coral)]">
                            <PackageX size={16} />
                          </button>
                        )}
                        {user?.role === "ADMIN" && (
                          <button onClick={() => handleDelete(m.id)} className="text-[var(--color-ink-soft)] hover:text-[var(--color-coral)]">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
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
              Showing {visible.length.toLocaleString("en-IN")} of {filtered.length.toLocaleString("en-IN")} medicine{filtered.length === 1 ? "" : "s"}
              {(query || categoryFilter || supplierFilter || statusFilter) ? " matching your filters" : ""}.
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

      <MedicineFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={handleSave}
        suppliers={suppliers}
        initial={editing}
      />

      <RemoveStockModal
        open={!!removingStockFor}
        onClose={() => setRemovingStockFor(null)}
        onSubmit={removeStock}
        medicine={removingStockFor}
      />
    </div>
  );
}
