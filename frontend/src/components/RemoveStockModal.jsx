import { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";

/**
 * Damaged/expired stock removal — separate from the +/- quick-adjust
 * buttons so it's always recorded as DAMAGE_REMOVAL/EXPIRED_REMOVAL with a
 * reason, not a generic manual adjustment. Backed by
 * PATCH /medicines/{id}/remove-stock.
 */
export default function RemoveStockModal({ open, onClose, onSubmit, medicine }) {
  const [type, setType] = useState("DAMAGE_REMOVAL");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setType("DAMAGE_REMOVAL");
      setQuantity(1);
      setReason("");
      setError("");
    }
  }, [open, medicine]);

  if (!open || !medicine) return null;

  const field = "mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]";
  const label = "text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const qty = Number(quantity);
    if (!qty || qty <= 0) return setError("Enter a quantity greater than zero.");
    if (qty > medicine.quantity) return setError(`Only ${medicine.quantity} units in stock — can't remove more than that.`);
    try {
      await onSubmit({ quantity: qty, type, reason });
    } catch (err) {
      setError(err?.response?.data?.error || "Could not remove stock.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-sm p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)] flex items-center gap-2">
            <Trash2 size={18} className="text-[var(--color-coral)]" /> Remove stock
          </h2>
          <button onClick={onClose} className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-[var(--color-ink-soft)] mb-4">
          {medicine.name} — {medicine.quantity} units currently in stock.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={label}>Reason</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("DAMAGE_REMOVAL")}
                className={`rounded-lg border py-2 text-sm font-semibold ${type === "DAMAGE_REMOVAL" ? "border-[var(--color-primary)] bg-[var(--color-mint)]/50 text-[var(--color-primary-dark)]" : "border-[var(--color-line)] text-[var(--color-ink-soft)]"}`}
              >
                Damaged
              </button>
              <button
                type="button"
                onClick={() => setType("EXPIRED_REMOVAL")}
                className={`rounded-lg border py-2 text-sm font-semibold ${type === "EXPIRED_REMOVAL" ? "border-[var(--color-primary)] bg-[var(--color-mint)]/50 text-[var(--color-primary-dark)]" : "border-[var(--color-line)] text-[var(--color-ink-soft)]"}`}
              >
                Expired
              </button>
            </div>
          </div>

          <div>
            <label className={label}>Quantity to remove</label>
            <input
              type="number" min="1" max={medicine.quantity} required
              className={field} value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div>
            <label className={label}>Note (optional)</label>
            <input
              className={field} value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Damaged during delivery"
            />
          </div>

          {error && <p className="text-xs text-[var(--color-coral)]">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-[var(--color-line)] py-2.5 text-sm font-semibold text-[var(--color-ink-soft)] hover:bg-[var(--color-canvas)]">
              Cancel
            </button>
            <button type="submit" className="flex-1 rounded-lg bg-[var(--color-coral)] text-white py-2.5 text-sm font-semibold hover:opacity-90">
              Remove stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
