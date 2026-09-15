import { useEffect, useState } from "react";
import { Search, ShieldCheck, ShieldOff, UserCog } from "lucide-react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ROLES = ["ADMIN", "PHARMACIST", "STAFF", "SUPPLIER"];

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    api.get("/admin/users", { params })
      .then((res) => setUsers(res.data))
      .catch(() => setErr("Could not load users. Is the backend running?"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [roleFilter]);
  useEffect(() => {
    const t = setTimeout(load, 300); // debounce free-text search
    return () => clearTimeout(t);
  }, [search]);

  const runAction = async (fn) => {
    setErr("");
    try {
      await fn();
      load();
    } catch (e) {
      setErr(e.response?.data?.error || "That action couldn't be completed.");
    }
  };

  const toggleActive = (u) => {
    setBusyId(u.id);
    runAction(() => api.patch(`/admin/users/${u.id}/${u.active ? "deactivate" : "activate"}`))
      .finally(() => setBusyId(null));
  };

  const changeRole = (u, role) => {
    if (role === u.role) return;
    setBusyId(u.id);
    runAction(() => api.patch(`/admin/users/${u.id}/role`, { role }))
      .finally(() => setBusyId(null));
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">User management</h1>
            <p className="text-sm text-[var(--color-ink-soft)] mt-1">{users.length} accounts on file.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email"
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="">All roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {err && <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-3 py-2 mb-4">{err}</p>}

        <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl overflow-hidden">
          {loading ? (
            <p className="text-sm text-[var(--color-ink-soft)] p-6">Loading…</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-soft)] p-6">No users match this search.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)] border-b border-[var(--color-line)]">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Last login</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  return (
                    <tr key={u.id} className="border-b border-[var(--color-line)] last:border-0">
                      <td className="px-5 py-3 font-medium text-[var(--color-ink)]">{u.fullName}{isSelf && <span className="ml-1.5 text-xs text-[var(--color-ink-soft)]">(you)</span>}</td>
                      <td className="px-5 py-3 text-[var(--color-ink-soft)]">{u.email}</td>
                      <td className="px-5 py-3">
                        <select
                          value={u.role}
                          disabled={isSelf || busyId === u.id}
                          onChange={(e) => changeRole(u, e.target.value)}
                          className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-1 text-xs font-semibold disabled:opacity-50"
                          title={isSelf ? "You cannot change your own role" : "Change role"}
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${u.active ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "bg-[var(--color-coral-bg)] text-[var(--color-coral)]"}`}>
                          {u.active ? "Active" : "Deactivated"}
                        </span>
                        {u.online && <span className="ml-2 text-[11px] text-[var(--color-ink-soft)]">● online</span>}
                      </td>
                      <td className="px-5 py-3 text-[var(--color-ink-soft)]">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => toggleActive(u)}
                          disabled={isSelf || busyId === u.id}
                          title={isSelf ? "You cannot deactivate your own account" : (u.active ? "Deactivate" : "Activate")}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40 ${
                            u.active
                              ? "text-[var(--color-coral)] hover:bg-[var(--color-coral-bg)]"
                              : "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                          }`}
                        >
                          {u.active ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                          {u.active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
