import { useEffect, useState } from "react";
import { X } from "lucide-react";

const empty = {
  name: "",
  batchNumber: "",
  category: "",
  supplierId: "",
  quantity: 0,
  reorderLevel: 20,
  manufacturingDate: "",
  expiryDate: "",
  price: "",
};

export default function MedicineFormModal({ open, onClose, onSubmit, suppliers, initial }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || "",
        batchNumber: initial.batchNumber || "",
        category: initial.category || "",
        supplierId: initial.supplier?.id || "",
        quantity: initial.quantity ?? 0,
        reorderLevel: initial.reorderLevel ?? 20,
        manufacturingDate: initial.manufacturingDate || "",
        expiryDate: initial.expiryDate || "",
        price: initial.price ?? "",
      });
    } else {
      setForm(empty);
    }
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      supplierId: form.supplierId || null,
      quantity: Number(form.quantity),
      reorderLevel: Number(form.reorderLevel),
      price: Number(form.price),
    });
  };

  const field = "mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]";
  const label = "text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
            {initial ? "Edit medicine" : "Add medicine"}
          </h2>
          <button onClick={onClose} className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={label}>Medicine name</label>
            <input required className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Batch number</label>
              <input required className={field + " font-mono"} value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} />
            </div>
            <div>
              <label className={label}>Category</label>
              <input className={field} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Analgesic" />
            </div>
          </div>

          <div>
            <label className={label}>Supplier</label>
            <select className={field} value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
              <option value="">— None —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={label}>Quantity</label>
              <input required type="number" min="0" className={field} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div>
              <label className={label}>Reorder level</label>
              <input required type="number" min="0" className={field} value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} />
            </div>
            <div>
              <label className={label}>Price (₹)</label>
              <input required type="number" min="0" step="0.01" className={field} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Manufacturing date</label>
              <input type="date" className={field} value={form.manufacturingDate} onChange={(e) => setForm({ ...form, manufacturingDate: e.target.value })} />
            </div>
            <div>
              <label className={label}>Expiry date</label>
              <input required type="date" className={field} value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-[var(--color-line)] py-2.5 text-sm font-semibold text-[var(--color-ink-soft)] hover:bg-[var(--color-canvas)]">
              Cancel
            </button>
            <button type="submit" className="flex-1 rounded-lg bg-[var(--color-primary)] text-white py-2.5 text-sm font-semibold hover:bg-[var(--color-primary-dark)]">
              {initial ? "Save changes" : "Add medicine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
