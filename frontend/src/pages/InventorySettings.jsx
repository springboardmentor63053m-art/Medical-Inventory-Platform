import { useEffect, useState } from "react";
import { Plus, Trash2, Settings2, Tags } from "lucide-react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

/**
 * Admin-only screen for the two configuration gaps flagged repeatedly
 * against the original spec: a real category master list (previously
 * category was just free text on Medicine) and admin-tunable alert
 * thresholds (previously the near-expiry window was hardcoded to 30 days).
 */
export default function InventorySettings() {
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [newName, setNewName] = useState("");
  const [newReorder, setNewReorder] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/categories/all"), api.get("/settings")])
      .then(([catRes, settingsRes]) => {
        setCategories(catRes.data);
        setSettings(settingsRes.data);
      })
      .catch(() => setErr("Could not load settings. Is the backend running?"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await api.post("/categories", { name: newName.trim(), defaultReorderLevel: newReorder ? Number(newReorder) : null });
      setNewName("");
      setNewReorder("");
      load();
    } catch (e) {
      alert(e?.response?.data?.error || "Could not add category");
    }
  };

  const deactivate = async (id) => {
    if (!confirm("Remove this category from the add-medicine list? Existing medicines keep their category text.")) return;
    await api.delete(`/categories/${id}`);
    load();
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.put("/settings", {
        nearExpiryWindowDays: Number(settings.nearExpiryWindowDays),
        deadStockWindowDays: Number(settings.deadStockWindowDays),
      });
    } catch (e) {
      alert(e?.response?.data?.error || "Could not save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const field = "mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]";
  const label = "text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]";

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-3xl">
        <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)] mb-1">Inventory settings</h1>
        <p className="text-sm text-[var(--color-ink-soft)] mb-6">Manage the category list and tune alert thresholds — no code changes or redeploys needed.</p>

        {err && <p className="text-sm text-[var(--color-coral)] mb-4">{err}</p>}
        {loading ? (
          <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
        ) : (
          <div className="space-y-8">
            <section className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-line)] p-6">
              <h2 className="font-semibold text-[var(--color-ink)] flex items-center gap-2 mb-4">
                <Settings2 size={18} /> Alert thresholds
              </h2>
              {settings && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={label}>Near-expiry warning window (days)</label>
                    <input
                      type="number" min="1" className={field}
                      value={settings.nearExpiryWindowDays}
                      onChange={(e) => setSettings({ ...settings, nearExpiryWindowDays: e.target.value })}
                    />
                    <p className="text-[11px] text-[var(--color-ink-soft)] mt-1">Medicines expiring within this many days trigger a warning alert.</p>
                  </div>
                  <div>
                    <label className={label}>Dead-stock window (days)</label>
                    <input
                      type="number" min="1" className={field}
                      value={settings.deadStockWindowDays}
                      onChange={(e) => setSettings({ ...settings, deadStockWindowDays: e.target.value })}
                    />
                    <p className="text-[11px] text-[var(--color-ink-soft)] mt-1">In-stock medicines with no sale for this long show up as dead stock on the dashboard.</p>
                  </div>
                </div>
              )}
              <button
                onClick={saveSettings}
                disabled={savingSettings}
                className="mt-4 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
              >
                {savingSettings ? "Saving…" : "Save thresholds"}
              </button>
            </section>

            <section className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-line)] p-6">
              <h2 className="font-semibold text-[var(--color-ink)] flex items-center gap-2 mb-4">
                <Tags size={18} /> Categories
              </h2>

              <form onSubmit={addCategory} className="flex items-end gap-3 mb-5">
                <div className="flex-1">
                  <label className={label}>New category name</label>
                  <input className={field} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Antibiotic" />
                </div>
                <div className="w-40">
                  <label className={label}>Default reorder level</label>
                  <input type="number" min="0" className={field} value={newReorder} onChange={(e) => setNewReorder(e.target.value)} placeholder="optional" />
                </div>
                <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[var(--color-primary-dark)]">
                  <Plus size={16} /> Add
                </button>
              </form>

              <div className="divide-y divide-[var(--color-line)]">
                {categories.length === 0 ? (
                  <p className="text-sm text-[var(--color-ink-soft)] py-3">No categories yet.</p>
                ) : categories.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className={`text-sm font-medium ${c.active ? "text-[var(--color-ink)]" : "text-[var(--color-ink-soft)] line-through"}`}>{c.name}</p>
                      {c.defaultReorderLevel != null && (
                        <p className="text-xs text-[var(--color-ink-soft)]">Default reorder level: {c.defaultReorderLevel}</p>
                      )}
                    </div>
                    {c.active && (
                      <button onClick={() => deactivate(c.id)} className="text-[var(--color-ink-soft)] hover:text-[var(--color-coral)]">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
