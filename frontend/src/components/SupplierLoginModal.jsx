import { useEffect, useState } from "react";
import { X, KeyRound } from "lucide-react";

const empty = { fullName: "", email: "", password: "" };

/** Admin-only: creates a SUPPLIER-role login linked to one supplier record. */
export default function SupplierLoginModal({ open, onClose, onSubmit, supplier }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(empty);
    setError("");
  }, [supplier, open]);

  if (!open) return null;

  const field = "mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]";
  const label = "text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit(supplier.id, form);
    } catch (err) {
      setError(err?.response?.data?.error || "Could not create login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-md p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-mint)] flex items-center justify-center">
              <KeyRound size={16} className="text-[var(--color-primary)]" />
            </div>
            <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
              Create supplier login
            </h2>
          </div>
          <button onClick={onClose} className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-[var(--color-ink-soft)] mb-5">
          Gives <span className="font-semibold text-[var(--color-ink)]">{supplier?.name}</span> their own sign-in,
          scoped to their supplier dashboard only — their profile, supplied medicines, and purchase/order activity.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={label}>Contact person / full name</label>
            <input required className={field} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div>
            <label className={label}>Login email</label>
            <input type="email" required className={field} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className={label}>Temporary password</label>
            <input type="password" required minLength={6} className={field} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
          </div>

          {error && (
            <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-[var(--color-line)] py-2.5 text-sm font-semibold text-[var(--color-ink-soft)] hover:bg-[var(--color-canvas)]">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-[var(--color-primary)] text-white py-2.5 text-sm font-semibold hover:bg-[var(--color-primary-dark)] disabled:opacity-60">
              {loading ? "Creating…" : "Create login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
