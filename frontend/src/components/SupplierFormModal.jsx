import { useEffect, useState } from "react";
import { X } from "lucide-react";

const empty = { name: "", contactNumber: "", email: "", address: "" };

export default function SupplierFormModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    setForm(initial ? { name: initial.name, contactNumber: initial.contactNumber || "", email: initial.email || "", address: initial.address || "" } : empty);
  }, [initial, open]);

  if (!open) return null;

  const field = "mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]";
  const label = "text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
            {initial ? "Edit supplier" : "Add supplier"}
          </h2>
          <button onClick={onClose} className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
          <div>
            <label className={label}>Supplier name</label>
            <input required className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className={label}>Contact number</label>
            <input className={field} value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
          </div>
          <div>
            <label className={label}>Email</label>
            <input type="email" className={field} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className={label}>Address</label>
            <textarea rows={2} className={field} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-[var(--color-line)] py-2.5 text-sm font-semibold text-[var(--color-ink-soft)] hover:bg-[var(--color-canvas)]">
              Cancel
            </button>
            <button type="submit" className="flex-1 rounded-lg bg-[var(--color-primary)] text-white py-2.5 text-sm font-semibold hover:bg-[var(--color-primary-dark)]">
              {initial ? "Save changes" : "Add supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
