import { useEffect, useState } from "react";
import { Building2, Phone, Mail, MapPin, Pill, AlertTriangle, ShoppingCart, IndianRupee, Activity, Check, X as XIcon, Truck as TruckIcon } from "lucide-react";
import Sidebar from "../components/Sidebar";
import StatusPill from "../components/StatusPill";
import api from "../api/axios";

const STATUS_STYLES = {
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  DISPATCHED: "bg-indigo-100 text-indigo-700",
  RECEIVED: "bg-[var(--color-mint)] text-[var(--color-primary-dark)]",
  REJECTED: "bg-[var(--color-coral-bg)] text-[var(--color-coral)]",
  CANCELLED: "bg-[var(--color-mint)] text-[var(--color-ink-soft)]",
};

function OrderStatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-[var(--color-mint)] text-[var(--color-ink-soft)]";
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${style}`}>
      {status ? status.charAt(0) + status.slice(1).toLowerCase() : "—"}
    </span>
  );
}

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
    <div className="label-card p-5 animate-fade-up">
      <span className="label-punch left" />
      <span className="label-punch right" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">{label}</p>
          <p className="font-[var(--font-display)] text-2xl font-semibold mt-2 text-[var(--color-ink)]">{value}</p>
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: accent + "20" }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
      </div>
    </div>
  );
}

export default function SupplierDashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  const load = () => {
    api.get("/dashboard/supplier")
      .then((res) => setStats(res.data))
      .catch((e) => setErr(e?.response?.data?.error || "Could not load your supplier dashboard."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const respond = async (id, accept) => {
    setActioningId(id);
    try {
      await api.patch(`/purchases/${id}/respond`, { accept });
      load();
    } catch (e) {
      alert(e?.response?.data?.error || "Could not respond to this order");
    } finally {
      setActioningId(null);
    }
  };

  const dispatch = async (id) => {
    setActioningId(id);
    try {
      await api.patch(`/purchases/${id}/dispatch`, {});
      load();
    } catch (e) {
      alert(e?.response?.data?.error || "Could not mark this order dispatched");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Supplier Dashboard</h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">
            Your profile, supplied medicines, and purchase/order activity — visible only to you.
          </p>
        </div>

        {err && <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-4 py-3 mb-6">{err}</p>}

        {loading ? (
          <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
        ) : stats && (
          <>
            {/* Supplier Profile */}
            <div className="label-card p-6 mb-6">
              <span className="label-punch left" />
              <span className="label-punch right" />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-mint)] flex items-center justify-center shrink-0">
                  <Building2 size={22} className="text-[var(--color-primary)]" />
                </div>
                <div>
                  <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">{stats.supplierName}</h2>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-[var(--color-ink-soft)]">
                    {stats.contactNumber && <span className="flex items-center gap-1.5"><Phone size={14} /> {stats.contactNumber}</span>}
                    {stats.email && <span className="flex items-center gap-1.5"><Mail size={14} /> {stats.email}</span>}
                    {stats.address && <span className="flex items-center gap-1.5"><MapPin size={14} /> {stats.address}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary cards: supplied medicines + purchase/order summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Pill} label="Medicines supplied" value={stats.suppliedMedicineCount} accent="#0f5c56" />
              <StatCard icon={AlertTriangle} label="Low stock among yours" value={stats.lowStockAmongSupplied} accent="#d9932e" />
              <StatCard icon={ShoppingCart} label="Total orders" value={stats.totalOrders} accent="#0f5c56" />
              <StatCard icon={IndianRupee} label="Total order value" value={`₹${Number(stats.totalOrderValue || 0).toFixed(2)}`} accent="#0f5c56" />
            </div>

            {/* Supplied Medicines */}
            <div className="label-card p-6 mb-6">
              <span className="label-punch left" />
              <span className="label-punch right" />
              <h2 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)] mb-4">Supplied medicines</h2>
              {(!stats.suppliedMedicines || stats.suppliedMedicines.length === 0) ? (
                <p className="text-sm text-[var(--color-ink-soft)]">No medicines are currently linked to you as supplier.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)] border-b border-[var(--color-line)]">
                      <th className="py-2 pr-4">Medicine</th>
                      <th className="py-2 pr-4">Category</th>
                      <th className="py-2 pr-4">Quantity</th>
                      <th className="py-2 pr-4">Reorder level</th>
                      <th className="py-2 pr-4">Expiry</th>
                      <th className="py-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.suppliedMedicines.map((m) => (
                      <tr key={m.id} className="border-b border-[var(--color-line)] last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-[var(--color-ink)]">{m.name}</td>
                        <td className="py-2.5 pr-4 text-[var(--color-ink-soft)]">{m.category || "—"}</td>
                        <td className="py-2.5 pr-4 font-mono">{m.quantity}</td>
                        <td className="py-2.5 pr-4 font-mono">{m.reorderLevel}</td>
                        <td className="py-2.5 pr-4 text-[var(--color-ink-soft)]">{m.expiryDate}</td>
                        <td className="py-2.5 pr-4"><StatusPill status={medicineStatus(m)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Supply Activity */}
            <div className="label-card p-6">
              <span className="label-punch left" />
              <span className="label-punch right" />
              <div className="flex items-center gap-2 mb-4">
                <Activity size={16} className="text-[var(--color-primary)]" />
                <h2 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">Purchase orders</h2>
              </div>
              {(!stats.recentActivity || stats.recentActivity.length === 0) ? (
                <p className="text-sm text-[var(--color-ink-soft)]">No orders placed with you yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)] border-b border-[var(--color-line)]">
                      <th className="py-2 pr-4">Medicine</th>
                      <th className="py-2 pr-4">Qty</th>
                      <th className="py-2 pr-4">Total</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentActivity.map((p) => (
                      <tr key={p.id} className="border-b border-[var(--color-line)] last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-[var(--color-ink)]">{p.medicine?.name}</td>
                        <td className="py-2.5 pr-4 font-mono">{p.quantity}</td>
                        <td className="py-2.5 pr-4 font-mono">₹{Number(p.totalAmount).toFixed(2)}</td>
                        <td className="py-2.5 pr-4"><OrderStatusBadge status={p.orderStatus} /></td>
                        <td className="py-2.5 pr-4 text-[var(--color-ink-soft)]">{new Date(p.purchaseDate).toLocaleDateString()}</td>
                        <td className="py-2.5 pr-4">
                          {p.orderStatus === "PENDING" && (
                            <div className="flex items-center gap-2">
                              <button
                                disabled={actioningId === p.id}
                                onClick={() => respond(p.id, true)}
                                className="flex items-center gap-1 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold px-2.5 py-1.5 hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
                              >
                                <Check size={13} /> Accept
                              </button>
                              <button
                                disabled={actioningId === p.id}
                                onClick={() => respond(p.id, false)}
                                className="flex items-center gap-1 rounded-lg border border-[var(--color-line)] text-[var(--color-coral)] text-xs font-semibold px-2.5 py-1.5 hover:bg-[var(--color-coral-bg)] disabled:opacity-50"
                              >
                                <XIcon size={13} /> Reject
                              </button>
                            </div>
                          )}
                          {p.orderStatus === "ACCEPTED" && (
                            <button
                              disabled={actioningId === p.id}
                              onClick={() => dispatch(p.id)}
                              className="flex items-center gap-1 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold px-2.5 py-1.5 hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
                            >
                              <TruckIcon size={13} /> Mark dispatched
                            </button>
                          )}
                          {!["PENDING", "ACCEPTED"].includes(p.orderStatus) && (
                            <span className="text-[var(--color-ink-soft)] text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
