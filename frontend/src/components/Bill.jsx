import { Cross } from "lucide-react";

/** Renders a MediStock invoice for a completed Sale. Print-friendly. */
export default function Bill({ sale }) {
  if (!sale) return null;
  const date = new Date(sale.saleDate);

  return (
    <div className="label-card p-8 bg-white">
      <span className="label-punch left" />
      <span className="label-punch right" />

      <div className="flex items-center justify-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white">
          <Cross size={16} />
        </div>
        <span className="font-[var(--font-display)] font-bold text-xl tracking-wide text-[var(--color-ink)]">MEDISTOCK</span>
      </div>
      <p className="text-center text-xs uppercase tracking-[0.2em] text-[var(--color-ink-soft)] mb-6">Medicine Invoice</p>

      <div className="border-t border-dashed border-[var(--color-line)] pt-4 mb-4 grid grid-cols-2 gap-y-1.5 text-sm">
        <span className="text-[var(--color-ink-soft)]">Bill No.</span>
        <span className="text-right font-mono font-semibold text-[var(--color-ink)]">{sale.billNumber}</span>
        <span className="text-[var(--color-ink-soft)]">Customer</span>
        <span className="text-right font-medium text-[var(--color-ink)]">{sale.customerName}</span>
        {sale.customerPhone && (
          <>
            <span className="text-[var(--color-ink-soft)]">Phone</span>
            <span className="text-right text-[var(--color-ink)]">{sale.customerPhone}</span>
          </>
        )}
        <span className="text-[var(--color-ink-soft)]">Date</span>
        <span className="text-right text-[var(--color-ink)]">{date.toLocaleDateString()}</span>
        <span className="text-[var(--color-ink-soft)]">Time</span>
        <span className="text-right text-[var(--color-ink)]">{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        <span className="text-[var(--color-ink-soft)]">Staff</span>
        <span className="text-right text-[var(--color-ink)]">{sale.soldByName}</span>
        {sale.paymentMethod && (
          <>
            <span className="text-[var(--color-ink-soft)]">Payment</span>
            <span className="text-right text-[var(--color-ink)]">{sale.paymentMethod}{sale.paymentStatus ? ` · ${sale.paymentStatus}` : ""}</span>
          </>
        )}
      </div>

      <table className="w-full text-sm border-t border-dashed border-[var(--color-line)] pt-2">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
            <th className="py-2">Medicine</th>
            <th className="py-2 text-center">Qty</th>
            <th className="py-2 text-right">Unit price</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item) => (
            <tr key={item.medicineId} className="border-t border-[var(--color-line)]">
              <td className="py-2 text-[var(--color-ink)]">{item.medicineName}</td>
              <td className="py-2 text-center font-mono">{item.quantity}</td>
              <td className="py-2 text-right font-mono">₹{Number(item.unitPrice).toFixed(2)}</td>
              <td className="py-2 text-right font-mono">₹{Number(item.subtotal).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t-2 border-[var(--color-ink)] mt-3 pt-3 flex items-center justify-between">
        <span className="font-[var(--font-display)] font-bold text-[var(--color-ink)]">TOTAL</span>
        <span className="font-[var(--font-display)] font-bold text-xl text-[var(--color-primary)]">₹{Number(sale.totalAmount).toFixed(2)}</span>
      </div>

      <p className="text-center text-xs text-[var(--color-ink-soft)] mt-6">Thank you for using MediStock</p>
    </div>
  );
}
