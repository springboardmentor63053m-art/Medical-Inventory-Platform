import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Phone, Mail, MapPin, KeyRound, Pill, ShoppingCart, IndianRupee, Clock3, CheckCircle2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import SupplierFormModal from "../components/SupplierFormModal";
import SupplierLoginModal from "../components/SupplierLoginModal";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Suppliers() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loginModalSupplier, setLoginModalSupplier] = useState(null);
  const [err, setErr] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/suppliers/summary")
      .then((res) => setSuppliers(res.data))
      .catch(() => setErr("Could not load suppliers. Is the backend running?"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSave = async (payload) => {
    try {
      if (editing) {
        await api.put(`/suppliers/${editing.id}`, payload);
      } else {
        await api.post("/suppliers", payload);
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } catch (e) {
      alert(e?.response?.data?.error || "Could not save supplier");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this supplier?")) return;
    await api.delete(`/suppliers/${id}`);
    load();
  };

  const handleCreateLogin = async (supplierId, payload) => {
    await api.post(`/admin/suppliers/${supplierId}/create-login`, payload);
    setLoginModalSupplier(null);
    alert("Login created. Share the email and temporary password with the supplier.");
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Suppliers</h1>
            <p className="text-sm text-[var(--color-ink-soft)] mt-1">{suppliers.length} supplier records on file.</p>
          </div>
          {(user?.role === "ADMIN" || user?.role === "PHARMACIST") && (
            <button
              onClick={() => { setEditing(null); setModalOpen(true); }}
              className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[var(--color-primary-dark)]"
            >
              <Plus size={16} /> Add supplier
            </button>
          )}
        </div>

        {err && <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-4 py-3 mb-4">{err}</p>}

        {loading ? (
          <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((s) => (
              <div key={s.id} className="label-card p-5">
                <span className="label-punch left" />
                <span className="label-punch right" />
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--color-ink)]">{s.name}</h3>
                    {s.performanceScore != null && (
                      <span
                        title="Composite score from acceptance rate + response/fulfillment speed"
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.performanceScore >= 80 ? "bg-emerald-100 text-emerald-700"
                          : s.performanceScore >= 50 ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                        }`}
                      >
                        {s.performanceScore}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {(user?.role === "ADMIN" || user?.role === "PHARMACIST") && (
                      <Link
                        to={`/purchases?supplierId=${s.id}`}
                        title="Create purchase order with this supplier"
                        className="text-[var(--color-ink-soft)] hover:text-[var(--color-primary)]"
                      >
                        <ShoppingCart size={15} />
                      </Link>
                    )}
                    {user?.role === "ADMIN" && (
                      <button
                        onClick={() => setLoginModalSupplier(s)}
                        title="Create supplier login"
                        className="text-[var(--color-ink-soft)] hover:text-[var(--color-primary)]"
                      >
                        <KeyRound size={15} />
                      </button>
                    )}
                    {(user?.role === "ADMIN" || user?.role === "PHARMACIST") && (
                      <button onClick={() => { setEditing(s); setModalOpen(true); }} className="text-[var(--color-ink-soft)] hover:text-[var(--color-primary)]">
                        <Pencil size={15} />
                      </button>
                    )}
                    {user?.role === "ADMIN" && (
                      <button onClick={() => handleDelete(s.id)} className="text-[var(--color-ink-soft)] hover:text-[var(--color-coral)]">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-[var(--color-ink-soft)] mb-4">
                  {s.contactNumber && <p className="flex items-center gap-2"><Phone size={14} /> {s.contactNumber}</p>}
                  {s.email && <p className="flex items-center gap-2"><Mail size={14} /> {s.email}</p>}
                  {s.address && <p className="flex items-center gap-2"><MapPin size={14} /> {s.address}</p>}
                  {s.hasLogin && (
                    <p className="flex items-center gap-2 text-[var(--color-primary)] font-medium">
                      <CheckCircle2 size={14} /> Has portal login
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[var(--color-line)]">
                  <div className="flex items-center gap-2">
                    <Pill size={14} className="text-[var(--color-primary)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">{s.medicinesSuppliedCount}</p>
                      <p className="text-[10px] uppercase tracking-wide text-[var(--color-ink-soft)]">Medicines</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={14} className="text-[var(--color-primary)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">{s.totalPurchaseCount}</p>
                      <p className="text-[10px] uppercase tracking-wide text-[var(--color-ink-soft)]">Purchases</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee size={14} className="text-[var(--color-primary)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">₹{Number(s.totalPurchaseValue || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                      <p className="text-[10px] uppercase tracking-wide text-[var(--color-ink-soft)]">Total value</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 size={14} className="text-[var(--color-ink-soft)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">{s.lastPurchaseDate || "—"}</p>
                      <p className="text-[10px] uppercase tracking-wide text-[var(--color-ink-soft)]">Last purchase</p>
                    </div>
                  </div>
                  {s.acceptanceRatePercent != null && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-[var(--color-primary)]" />
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-ink)]">{Math.round(s.acceptanceRatePercent)}%</p>
                        <p className="text-[10px] uppercase tracking-wide text-[var(--color-ink-soft)]">Order acceptance</p>
                      </div>
                    </div>
                  )}
                </div>

                {(s.lowStockAmongSupplied > 0 || s.outOfStockAmongSupplied > 0) && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {s.lowStockAmongSupplied > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-amber-bg)] text-[var(--color-amber)]">
                        {s.lowStockAmongSupplied} low stock
                      </span>
                    )}
                    {s.outOfStockAmongSupplied > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-coral-bg)] text-[var(--color-coral)]">
                        {s.outOfStockAmongSupplied} out of stock
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
            {suppliers.length === 0 && (
              <p className="text-sm text-[var(--color-ink-soft)]">No suppliers yet. Add your first one to get started.</p>
            )}
          </div>
        )}
      </main>

      <SupplierFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={handleSave}
        initial={editing}
      />

      <SupplierLoginModal
        open={!!loginModalSupplier}
        onClose={() => setLoginModalSupplier(null)}
        onSubmit={handleCreateLogin}
        supplier={loginModalSupplier}
      />
    </div>
  );
}
