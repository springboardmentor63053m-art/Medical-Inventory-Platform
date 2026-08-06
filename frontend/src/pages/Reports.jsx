import { FileDown, Boxes, Clock3, ShoppingCart, Activity } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const ALL_REPORTS = [
  { key: "inventory", label: "Inventory report", desc: "Full stock list with status (OK / low / out / near-expiry / expired).", icon: Boxes, roles: ["ADMIN"], endpoint: "/reports/inventory" },
  { key: "expiry", label: "Expiry report", desc: "Medicines expired or expiring within 30 days.", icon: Clock3, roles: ["ADMIN", "PHARMACIST"], endpoint: "/reports/expiry" },
  { key: "purchases", label: "Purchase history report", desc: "Every recorded purchase with supplier, quantity, and cost.", icon: ShoppingCart, roles: ["ADMIN", "STAFF", "PHARMACIST"], endpoint: "/reports/purchases" },
  { key: "stock-movements", label: "Stock movement report", desc: "Full audit trail of every stock change, by whom and when.", icon: Activity, roles: ["ADMIN"], endpoint: "/reports/stock-movements" },
];

export default function Reports() {
  const { user } = useAuth();
  const available = ALL_REPORTS.filter((r) => r.roles.includes(user?.role));

  const download = async (report) => {
    try {
      const res = await api.get(report.endpoint, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${report.key}-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Could not generate report. You may not have permission for this report.");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Reports</h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">Generate and download CSV reports — opens cleanly in Excel or Google Sheets.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {available.map((r) => (
            <div key={r.key} className="label-card p-5 flex flex-col">
              <span className="label-punch left" />
              <span className="label-punch right" />
              <div className="w-9 h-9 rounded-lg bg-[var(--color-mint)] flex items-center justify-center mb-3">
                <r.icon size={18} className="text-[var(--color-primary)]" />
              </div>
              <h3 className="font-semibold text-[var(--color-ink)]">{r.label}</h3>
              <p className="text-xs text-[var(--color-ink-soft)] mt-1 flex-1">{r.desc}</p>
              <button
                onClick={() => download(r)}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold py-2.5 hover:bg-[var(--color-primary-dark)]"
              >
                <FileDown size={15} /> Download CSV
              </button>
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
