import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Phone, Mail, MapPin } from "lucide-react";
import Sidebar from "../components/Sidebar";
import SupplierFormModal from "../components/SupplierFormModal";
import api from "../api/axios";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/suppliers")
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

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Suppliers</h1>
            <p className="text-sm text-[var(--color-ink-soft)] mt-1">{suppliers.length} supplier records on file.</p>
          </div>
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[var(--color-primary-dark)]"
          >
            <Plus size={16} /> Add supplier
          </button>
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
                  <h3 className="font-semibold text-[var(--color-ink)]">{s.name}</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditing(s); setModalOpen(true); }} className="text-[var(--color-ink-soft)] hover:text-[var(--color-primary)]">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="text-[var(--color-ink-soft)] hover:text-[var(--color-coral)]">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-[var(--color-ink-soft)]">
                  {s.contactNumber && <p className="flex items-center gap-2"><Phone size={14} /> {s.contactNumber}</p>}
                  {s.email && <p className="flex items-center gap-2"><Mail size={14} /> {s.email}</p>}
                  {s.address && <p className="flex items-center gap-2"><MapPin size={14} /> {s.address}</p>}
                </div>
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
    </div>
  );
}
