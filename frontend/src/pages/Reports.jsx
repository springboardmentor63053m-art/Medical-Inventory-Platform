import { useState } from "react";
import { FileDown, Boxes, Clock3, ShoppingCart, Receipt, Activity, BarChart3, Loader2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const ALL_REPORTS = [
  { key: "inventory", label: "Inventory report", desc: "Full stock list with status (OK / low / out / near-expiry / expired).", icon: Boxes, roles: ["ADMIN"], endpoint: "/reports/inventory" },
  { key: "expiry", label: "Expiry report", desc: "Medicines expired or expiring within 30 days.", icon: Clock3, roles: ["ADMIN", "PHARMACIST"], endpoint: "/reports/expiry" },
  { key: "purchases", label: "Purchase history report", desc: "Every recorded purchase with supplier, quantity, and cost.", icon: ShoppingCart, roles: ["ADMIN", "STAFF", "PHARMACIST"], endpoint: "/reports/purchases" },
  { key: "sales", label: "Sales report", desc: "Every sold line item, tied to its bill number and customer.", icon: Receipt, roles: ["ADMIN", "STAFF", "PHARMACIST"], endpoint: "/reports/sales" },
  { key: "stock-movements", label: "Stock movement report", desc: "Full audit trail of every stock change, by whom and when.", icon: Activity, roles: ["ADMIN"], endpoint: "/reports/stock-movements" },
  {
    key: "analytics",
    label: "Advanced analytics report",
    desc: "KPI summary, category-wise stock valuation, low-stock & expiry watchlists and top suppliers by spend — all in one download.",
    icon: BarChart3,
    roles: ["ADMIN", "PHARMACIST"],
    endpoint: "/reports/analytics",
    advanced: true,
  },
];

const FORMATS = [
  { key: "csv", label: "CSV", ext: "csv" },
  { key: "xlsx", label: "Excel", ext: "xlsx" },
  { key: "pdf", label: "PDF", ext: "pdf" },
];

export default function Reports() {
  const { user } = useAuth();
  const available = ALL_REPORTS.filter((r) => r.roles.includes(user?.role));
  const [loadingKey, setLoadingKey] = useState(null);

  const download = async (report, format) => {
    const jobKey = `${report.key}-${format.key}`;
    setLoadingKey(jobKey);
    try {
      const res = await api.get(report.endpoint, {
        params: { format: format.key },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${report.key}-${new Date().toISOString().slice(0, 10)}.${format.ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Could not generate report. You may not have permission for this report.");
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Reports</h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">
            Generate and download reports as CSV, Excel, or PDF.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {available.map((r) => (
            <div
              key={r.key}
              className={`label-card p-5 flex flex-col ${r.advanced ? "sm:col-span-2 ring-1 ring-[var(--color-primary)]/30" : ""}`}
            >
              <span className="label-punch left" />
              <span className="label-punch right" />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--color-mint)] flex items-center justify-center">
                  <r.icon size={18} className="text-[var(--color-primary)]" />
                </div>
                {r.advanced && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-primary)] bg-[var(--color-mint)] px-2 py-0.5 rounded-full">
                    Advanced
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-[var(--color-ink)]">{r.label}</h3>
              <p className="text-xs text-[var(--color-ink-soft)] mt-1 flex-1">{r.desc}</p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {FORMATS.map((format) => {
                  const jobKey = `${r.key}-${format.key}`;
                  const isLoading = loadingKey === jobKey;
                  return (
                    <button
                      key={format.key}
                      onClick={() => download(r, format)}
                      disabled={loadingKey !== null}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold py-2.5 hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
                    >
                      {isLoading ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
                      {format.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {available.length === 0 && (
          <p className="text-sm text-[var(--color-ink-soft)]">No reports available for your role.</p>
        )}
      </main>
    </div>
  );
}
