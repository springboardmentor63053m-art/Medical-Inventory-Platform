import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, X, Search, ShoppingCart, IndianRupee, Truck, PackageCheck, Ban } from "lucide-react";
import Sidebar from "../components/Sidebar";
import MedicineAvatar from "../components/MedicineAvatar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyForm = { medicineId: "", supplierId: "", quantity: "", unitPrice: "", note: "", poNumber: "", invoiceNumber: "" };
const PAGE_SIZE = 100;

const STATUS_STYLES = {
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  DISPATCHED: "bg-indigo-100 text-indigo-700",
  RECEIVED: "bg-[var(--color-mint)] text-[var(--color-primary-dark)]",
  REJECTED: "bg-[var(--color-coral-bg)] text-[var(--color-coral)]",
  CANCELLED: "bg-[var(--color-mint)] text-[var(--color-ink-soft)]",
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-[var(--color-mint)] text-[var(--color-ink-soft)]";
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${style}`}>
      {status?.charAt(0) + status?.slice(1).toLowerCase()}
    </span>
  );
}

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

export default function Purchases() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isPharmacist = user?.role === "PHARMACIST";
  const canManageOrders = isAdmin || isPharmacist; // create/cancel — Admin or Pharmacist can place orders
  const canReceive = isAdmin; // only Admin marks an order received (this is when stock updates)
  const [searchParams, setSearchParams] = useSearchParams();
  const [purchases, setPurchases] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [actioningId, setActioningId] = useState(null);

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

  // Deep link from the Suppliers page ("Purchase from this supplier") —
  // opens the modal pre-filtered to that supplier's catalog.
  useEffect(() => {
    const supplierId = searchParams.get("supplierId");
    if (canManageOrders && supplierId && suppliers.length > 0) {
      setForm((f) => ({ ...f, supplierId }));
      setModalOpen(true);
      searchParams.delete("supplierId");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suppliers]);

  const stats = useMemo(() => {
    const totalValue = purchases.reduce((sum, p) => sum + Number(p.totalAmount), 0);
    const now = new Date();
    const thisMonth = purchases.filter((p) => {
      const d = new Date(p.purchaseDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thisMonthValue = thisMonth.reduce((sum, p) => sum + Number(p.totalAmount), 0);
    const uniqueSuppliers = new Set(purchases.map((p) => p.supplier?.id).filter(Boolean)).size;
    return { total: purchases.length, totalValue, thisMonthCount: thisMonth.length, thisMonthValue, uniqueSuppliers };
  }, [purchases]);

  const filtered = useMemo(() => {
    if (!query.trim()) return purchases;
    const q = query.toLowerCase();
    return purchases.filter((p) =>
      p.medicine?.name?.toLowerCase().includes(q) ||
      p.supplier?.name?.toLowerCase().includes(q) ||
      p.purchasedBy?.fullName?.toLowerCase().includes(q)
    );
  }, [purchases, query]);

  const visible = filtered.slice(0, visibleCount);

  // Purchasing "from a supplier": picking a supplier narrows the medicine
  // list down to what that supplier actually stocks (via Medicine.supplier),
  // and picking a medicine that belongs to a supplier auto-fills the
  // supplier field. Either order of selection works.
  const medicinesForSupplier = useMemo(() => {
    if (!form.supplierId) return medicines;
    return medicines.filter((m) => String(m.supplier?.id) === String(form.supplierId));
  }, [medicines, form.supplierId]);

  const selectedMedicine = useMemo(
    () => medicines.find((m) => String(m.id) === String(form.medicineId)) || null,
    [medicines, form.medicineId]
  );
  const selectedSupplier = useMemo(
    () => suppliers.find((s) => String(s.id) === String(form.supplierId)) || null,
    [suppliers, form.supplierId]
  );

  const orderTotal = (Number(form.quantity) || 0) * (Number(form.unitPrice) || 0);

  const handleSupplierChange = (supplierId) => {
    setForm((f) => {
      // If the currently chosen medicine doesn't belong to the newly chosen
      // supplier, clear it so the form can't submit a mismatched pair.
      const stillValid = !supplierId || medicines.find(
        (m) => String(m.id) === String(f.medicineId) && String(m.supplier?.id) === String(supplierId)
      );
      return { ...f, supplierId, medicineId: stillValid ? f.medicineId : "" };
    });
  };

  const handleMedicineChange = (medicineId) => {
    const med = medicines.find((m) => String(m.id) === String(medicineId));
    setForm((f) => ({
      ...f,
      medicineId,
      supplierId: med?.supplier?.id ? String(med.supplier.id) : f.supplierId,
      unitPrice: f.unitPrice || (med?.price != null ? String(med.price) : f.unitPrice),
    }));
  };

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
      alert(e?.response?.data?.error || "Could not create purchase order");
    }
  };

  const handleReceive = async (id) => {
    setActioningId(id);
    try {
      await api.patch(`/purchases/${id}/receive`);
      load();
    } catch (e) {
      alert(e?.response?.data?.error || "Could not mark this order as received");
    } finally {
      setActioningId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this purchase order? This cannot be undone.")) return;
    setActioningId(id);
    try {
      await api.patch(`/purchases/${id}/cancel`);
      load();
    } catch (e) {
      alert(e?.response?.data?.error || "Could not cancel this order");
    } finally {
      setActioningId(null);
    }
  };

  const field = "mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]";
  const label = "text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]";

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Purchases</h1>
            <p className="text-sm text-[var(--color-ink-soft)] mt-1">Admin or Pharmacist places the order, the supplier accepts and dispatches it, then Admin marks it received — stock updates only at that final step.</p>
          </div>
          {canManageOrders && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[var(--color-primary-dark)]"
            >
              <Plus size={16} /> Create purchase order
            </button>
          )}
        </div>

        {err && <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-4 py-3 mb-4">{err}</p>}

        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            <StatCard icon={ShoppingCart} label="Total purchases" value={stats.total.toLocaleString("en-IN")} />
            <StatCard icon={IndianRupee} label="Total value" value={`₹${stats.totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} />
            <StatCard icon={ShoppingCart} label="This month" value={stats.thisMonthCount.toLocaleString("en-IN")} />
            <StatCard icon={IndianRupee} label="This month value" value={`₹${stats.thisMonthValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} />
            <StatCard icon={Truck} label="Suppliers used" value={stats.uniqueSuppliers} />
          </div>
        )}

        <div className="flex items-center gap-2 mb-4 max-w-sm">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)]" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
              placeholder="Search medicine, supplier, or staff…"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
            />
          </div>
        </div>

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
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Ordered by</th>
                <th className="px-4 py-4">Date</th>
                {(isAdmin || isPharmacist) && <th className="px-4 py-4">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-5 py-8 text-center text-[var(--color-ink-soft)]">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-8 text-center text-[var(--color-ink-soft)]">No purchase orders yet.</td></tr>
              ) : (
                visible.map((p) => {
                  const orderIsOpen = ["PENDING", "ACCEPTED", "DISPATCHED"].includes(p.orderStatus);
                  const showReceive = canReceive && orderIsOpen;
                  const showCancel = canManageOrders && orderIsOpen;
                  return (
                    <tr key={p.id} className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-mint)]/40">
                      <td className="px-5 py-4 font-medium text-[var(--color-ink)]">
                        <div className="flex items-center gap-3">
                          <MedicineAvatar category={p.medicine?.category} name={p.medicine?.name} size="sm" />
                          {p.medicine?.name}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[var(--color-ink-soft)]">{p.supplier?.name || "—"}</td>
                      <td className="px-4 py-4 font-mono">{p.quantity}</td>
                      <td className="px-4 py-4 font-mono">₹{Number(p.unitPrice).toFixed(2)}</td>
                      <td className="px-4 py-4 font-mono font-semibold text-[var(--color-primary)]">₹{Number(p.totalAmount).toFixed(2)}</td>
                      <td className="px-4 py-4"><StatusBadge status={p.orderStatus} /></td>
                      <td className="px-4 py-4 text-[var(--color-ink-soft)]">{p.purchasedBy?.fullName || "—"}</td>
                      <td className="px-4 py-4 text-[var(--color-ink-soft)]">{new Date(p.purchaseDate).toLocaleString()}</td>
                      {(isAdmin || isPharmacist) && (
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {showReceive && (
                              <button
                                disabled={actioningId === p.id}
                                onClick={() => handleReceive(p.id)}
                                title="Mark as received — this is when stock increases"
                                className="flex items-center gap-1 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold px-2.5 py-1.5 hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
                              >
                                <PackageCheck size={13} /> Receive
                              </button>
                            )}
                            {showCancel && (
                              <button
                                disabled={actioningId === p.id}
                                onClick={() => handleCancel(p.id)}
                                title="Cancel this order"
                                className="flex items-center gap-1 rounded-lg border border-[var(--color-line)] text-[var(--color-ink-soft)] text-xs font-semibold px-2.5 py-1.5 hover:bg-[var(--color-canvas)] disabled:opacity-50"
                              >
                                <Ban size={13} />
                              </button>
                            )}
                            {!showReceive && !showCancel && (
                              <span className="text-[var(--color-ink-soft)] text-xs">—</span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-[var(--color-ink-soft)]">
              Showing {visible.length.toLocaleString("en-IN")} of {filtered.length.toLocaleString("en-IN")} purchase{filtered.length === 1 ? "" : "s"}
              {query && ` matching "${query}"`}. Need the full export? Use <span className="font-semibold text-[var(--color-ink)]">Reports</span>.
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

      {canManageOrders && modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-md p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">Create purchase order</h2>
              <button onClick={() => setModalOpen(false)} className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={label}>Supplier</label>
                <select className={field} value={form.supplierId} onChange={(e) => handleSupplierChange(e.target.value)}>
                  <option value="">All suppliers — pick any medicine</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <p className="text-[11px] text-[var(--color-ink-soft)] mt-1">
                  {form.supplierId ? "Medicine list below is narrowed to this supplier's catalog." : "Choose a supplier first to purchase from their catalog, or pick a medicine directly."}
                </p>
              </div>
              <div>
                <label className={label}>Medicine</label>
                <select required className={field} value={form.medicineId} onChange={(e) => handleMedicineChange(e.target.value)}>
                  <option value="">Select medicine…</option>
                  {medicinesForSupplier.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.batchNumber}){!form.supplierId && m.supplier?.name ? ` — ${m.supplier.name}` : ""}
                    </option>
                  ))}
                </select>
                {form.supplierId && medicinesForSupplier.length === 0 && (
                  <p className="text-[11px] text-[var(--color-coral)] mt-1">This supplier has no linked medicines yet — add one from the Medicines page first, or clear the supplier filter.</p>
                )}
              </div>

              {selectedMedicine && (
                <div className="flex items-center gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-canvas)] px-3.5 py-3">
                  <MedicineAvatar category={selectedMedicine.category} name={selectedMedicine.name} size="lg" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{selectedMedicine.name}</p>
                    <p className="text-xs text-[var(--color-ink-soft)]">
                      Batch {selectedMedicine.batchNumber} · Current stock {selectedMedicine.quantity} · {selectedSupplier?.name || selectedMedicine.supplier?.name || "No supplier linked"}
                    </p>
                  </div>
                </div>
              )}

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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>PO number (optional)</label>
                  <input className={field} value={form.poNumber} onChange={(e) => setForm({ ...form, poNumber: e.target.value })} placeholder="e.g. PO-2026-041" />
                </div>
                <div>
                  <label className={label}>Supplier invoice # (optional)</label>
                  <input className={field} value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} placeholder="e.g. INV-88213" />
                </div>
              </div>

              {orderTotal > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-[var(--color-mint)] px-3.5 py-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary-dark)]">Order total</span>
                  <span className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-primary-dark)]">₹{orderTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-lg border border-[var(--color-line)] py-2.5 text-sm font-semibold text-[var(--color-ink-soft)] hover:bg-[var(--color-canvas)]">
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-lg bg-[var(--color-primary)] text-white py-2.5 text-sm font-semibold hover:bg-[var(--color-primary-dark)]">
                  Create order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
