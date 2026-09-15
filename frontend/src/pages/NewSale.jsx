import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Receipt, ArrowRight, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Bill from "../components/Bill";

export default function NewSale() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [cart, setCart] = useState([]); // { medicineId, name, price, available, quantity }
  const [pickerId, setPickerId] = useState("");
  const [pickerQty, setPickerQty] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  useEffect(() => {
    api.get("/medicines").then((res) => setMedicines(res.data)).catch(() => setError("Could not load medicines."));
  }, []);

  const selectedMedicine = medicines.find((m) => String(m.id) === String(pickerId));
  const isExpired = (m) => m?.expiryDate && new Date(m.expiryDate) < new Date(new Date().toDateString());

  const addItem = () => {
    setError("");
    if (!selectedMedicine) return setError("Select a medicine first.");
    if (isExpired(selectedMedicine)) {
      return setError(`${selectedMedicine.name} expired on ${selectedMedicine.expiryDate} and cannot be dispensed.`);
    }
    const qty = Number(pickerQty);
    if (!qty || qty <= 0) return setError("Quantity must be greater than zero.");
    const alreadyInCart = cart.find((i) => i.medicineId === selectedMedicine.id)?.quantity || 0;
    if (qty + alreadyInCart > selectedMedicine.quantity) {
      return setError(`Insufficient stock for ${selectedMedicine.name}. Available quantity: ${selectedMedicine.quantity}`);
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.medicineId === selectedMedicine.id);
      if (existing) {
        return prev.map((i) => i.medicineId === selectedMedicine.id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, {
        medicineId: selectedMedicine.id,
        name: selectedMedicine.name,
        price: selectedMedicine.price,
        available: selectedMedicine.quantity,
        quantity: qty,
      }];
    });
    setPickerId("");
    setPickerQty(1);
  };

  const removeItem = (medicineId) => setCart((prev) => prev.filter((i) => i.medicineId !== medicineId));

  const total = useMemo(
    () => cart.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0),
    [cart]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!customerName.trim()) return setError("Enter the customer's name.");
    if (cart.length === 0) return setError("Add at least one medicine to the bill.");

    setSubmitting(true);
    try {
      const { data } = await api.post("/sales", {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || null,
        paymentMethod,
        items: cart.map((i) => ({ medicineId: i.medicineId, quantity: i.quantity })),
      });
      setCompletedSale(data);
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setPaymentMethod("CASH");
    } catch (err) {
      setError(err?.response?.data?.error || "Could not complete the sale.");
    } finally {
      setSubmitting(false);
    }
  };

  const field = "mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]";
  const label = "text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]";

  if (completedSale) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 max-w-2xl">
          <div className="flex items-center gap-2 mb-6 text-[var(--color-primary)]">
            <Receipt size={20} />
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Sale completed</h1>
          </div>
          <Bill sale={completedSale} />
          <div className="flex gap-3 mt-6 print:hidden">
            <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] px-4 py-2.5 text-sm font-semibold text-[var(--color-ink-soft)] hover:bg-[var(--color-canvas)]">
              <Printer size={15} /> Print bill
            </button>
            <button onClick={() => setCompletedSale(null)} className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[var(--color-primary-dark)]">
              <Plus size={15} /> New sale
            </button>
            <button onClick={() => navigate("/sales/history")} className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] px-4 py-2.5 text-sm font-semibold text-[var(--color-ink-soft)] hover:bg-[var(--color-canvas)]">
              View sales history <ArrowRight size={15} />
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">New Sale</h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">Build a customer bill — stock updates automatically once you complete the sale.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="label-card p-6 mb-6">
            <span className="label-punch left" />
            <span className="label-punch right" />
            <label className={label}>Customer name</label>
            <input required className={field + " max-w-sm"} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Ravi Kumar" />
            <div className="grid grid-cols-2 gap-3 max-w-sm mt-3">
              <div>
                <label className={label}>Phone (optional)</label>
                <input className={field} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="e.g. 98765 43210" />
              </div>
              <div>
                <label className={label}>Payment method</label>
                <select className={field} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="INSURANCE">Insurance</option>
                </select>
              </div>
            </div>
          </div>

          <div className="label-card p-6 mb-6">
            <span className="label-punch left" />
            <span className="label-punch right" />
            <h2 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)] mb-4">Add medicines</h2>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className={label}>Medicine</label>
                <select className={field} value={pickerId} onChange={(e) => setPickerId(e.target.value)}>
                  <option value="">Select medicine…</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id} disabled={m.quantity === 0 || isExpired(m)}>
                      {m.name} — ₹{Number(m.price).toFixed(2)} ({m.quantity} in stock
                      {m.quantity === 0 ? ", out of stock" : ""}
                      {isExpired(m) ? ", expired" : ""})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-28">
                <label className={label}>Qty</label>
                <input type="number" min="1" className={field} value={pickerQty} onChange={(e) => setPickerQty(e.target.value)} />
              </div>
              <button type="button" onClick={addItem} className="flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[var(--color-primary-dark)] h-[42px]">
                <Plus size={15} /> Add
              </button>
            </div>

            {cart.length > 0 && (
              <table className="w-full text-sm mt-5">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)] border-b border-[var(--color-line)]">
                    <th className="py-2 pr-4">Medicine</th>
                    <th className="py-2 pr-4">Qty</th>
                    <th className="py-2 pr-4">Unit price</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((i) => (
                    <tr key={i.medicineId} className="border-b border-[var(--color-line)] last:border-0">
                      <td className="py-2.5 pr-4 font-medium text-[var(--color-ink)]">{i.name}</td>
                      <td className="py-2.5 pr-4 font-mono">{i.quantity}</td>
                      <td className="py-2.5 pr-4 font-mono">₹{Number(i.price).toFixed(2)}</td>
                      <td className="py-2.5 pr-4 font-mono font-semibold">₹{(i.price * i.quantity).toFixed(2)}</td>
                      <td className="py-2.5">
                        <button type="button" onClick={() => removeItem(i.medicineId)} className="text-[var(--color-ink-soft)] hover:text-[var(--color-coral)]">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="pt-3 text-right font-semibold text-[var(--color-ink)]">Total</td>
                    <td className="pt-3 font-mono font-bold text-[var(--color-primary)]">₹{total.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {error && <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-4 py-3 mb-4">{error}</p>}

          <button
            type="submit"
            disabled={submitting || cart.length === 0}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold px-5 py-3 hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
          >
            <Receipt size={16} /> {submitting ? "Completing sale…" : `Complete sale — ₹${total.toFixed(2)}`}
          </button>
        </form>
      </main>
    </div>
  );
}
