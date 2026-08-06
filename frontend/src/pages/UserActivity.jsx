import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

export default function UserActivity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/admin/user-activity")
      .then((res) => setLogs(res.data))
      .catch(() => setErr("Could not load user activity. Admin access required."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center gap-2 mb-8">
          <Users size={20} className="text-[var(--color-primary)]" />
          <div>
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">User Activity</h1>
            <p className="text-sm text-[var(--color-ink-soft)] mt-1">Audit trail of actions across your team.</p>
          </div>
        </div>

        {err && <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-4 py-3 mb-4">{err}</p>}

        <div className="label-card overflow-hidden">
          <span className="label-punch left" />
          <span className="label-punch right" />
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)] border-b border-[var(--color-line)]">
                <th className="px-5 py-4">User</th>
                <th className="px-4 py-4">Action</th>
                <th className="px-4 py-4">Details</th>
                <th className="px-4 py-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-[var(--color-ink-soft)]">Loading…</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-[var(--color-ink-soft)]">No activity recorded yet.</td></tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-mint)]/40">
                    <td className="px-5 py-4 font-medium text-[var(--color-ink)]">{l.user?.fullName}</td>
                    <td className="px-4 py-4 font-mono text-xs">{l.action}</td>
                    <td className="px-4 py-4 text-[var(--color-ink-soft)]">{l.details}</td>
                    <td className="px-4 py-4 text-[var(--color-ink-soft)]">{new Date(l.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
