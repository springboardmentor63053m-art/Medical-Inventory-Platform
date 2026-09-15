import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Boxes, Truck, Users, AlertTriangle, XCircle, Clock3, PackageSearch,
  IndianRupee, ShoppingCart, Activity, Receipt, TrendingUp, UserCheck,
  Plus, PlusCircle, FileDown, HeartPulse, PackageX,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, LineChart, Line } from "recharts";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

function StatCard({ icon: Icon, label, value, accent, sub }) {
  return (
    <div className="label-card p-5 animate-fade-up">
      <span className="label-punch left" />
      <span className="label-punch right" />
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">{label}</p>
          <p className="font-[var(--font-display)] text-2xl font-semibold mt-2 text-[var(--color-ink)] truncate">{value}</p>
          {sub && <p className="text-xs text-[var(--color-ink-soft)] mt-1">{sub}</p>}
        </div>
        <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center" style={{ background: accent + "20" }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, sub }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      {Icon && (
        <div className="w-6 h-6 rounded-md bg-[var(--color-mint)] flex items-center justify-center shrink-0">
          <Icon size={13} className="text-[var(--color-primary)]" />
        </div>
      )}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-soft)] leading-none">{title}</h2>
        {sub && <p className="text-[11px] text-[var(--color-ink-soft)]/70 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function Panel({ title, icon, children, action, className = "" }) {
  return (
    <div className={`label-card p-6 ${className}`}>
      <span className="label-punch left" />
      <span className="label-punch right" />
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)] flex items-center gap-2">
          {icon}{title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

const QUICK_ACTIONS = [
  { to: "/medicines", label: "Add medicine", icon: Plus },
  { to: "/purchases", label: "Purchase from supplier", icon: ShoppingCart },
  { to: "/suppliers", label: "Add supplier", icon: PlusCircle },
  { to: "/reports", label: "Export report", icon: FileDown },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/admin")
      .then((res) => setStats(res.data))
      .catch(() => setErr("Could not load admin dashboard. Is the backend running and are you signed in as Admin?"))
      .finally(() => setLoading(false));
    api.get("/dashboard/inventory-health").then((res) => setHealth(res.data)).catch(() => {});
  }, []);

  const supplierChart = (stats?.supplierInsights || []).map((s) => ({
    name: s.supplierName,
    spend: Number(s.totalSpend),
  }));

  const quarterlySalesChart = (stats?.quarterlySales || []).map((q) => ({ name: q.label, value: Number(q.value) }));
  const quarterlyPurchaseChart = (stats?.quarterlyPurchaseValue || []).map((q) => ({ name: q.label, value: Number(q.value) }));

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-7xl">
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Admin Dashboard</h1>
            <p className="text-sm text-[var(--color-ink-soft)] mt-1">Full inventory, supplier, and system analytics.</p>
          </div>
          {!loading && stats && (
            <div className="flex items-center gap-2 rounded-full bg-[var(--color-mint)] px-3.5 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
              <span className="text-xs font-semibold text-[var(--color-primary-dark)]">{stats.systemStatus}</span>
              <span className="text-[11px] text-[var(--color-ink-soft)] font-mono">{stats.serverTime}</span>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          {QUICK_ACTIONS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
            >
              <Icon size={15} /> {label}
            </Link>
          ))}
        </div>

        {err && <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-4 py-3 mb-6">{err}</p>}

        {loading ? (
          <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
        ) : stats && (
          <>
            {/* Inventory analytics */}
            <SectionHeader icon={Boxes} title="Inventory analytics" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Boxes} label="Total medicines" value={stats.totalMedicines} accent="#0f5c56" />
              <StatCard icon={Truck} label="Suppliers" value={stats.totalSuppliers} accent="#0f5c56" />
              <StatCard icon={Users} label="Users" value={stats.totalUsers} accent="#0f5c56" />
              <StatCard icon={IndianRupee} label="Inventory value" value={`₹${Number(stats.totalInventoryValue || 0).toLocaleString("en-IN")}`} accent="#0f5c56" />
              <StatCard icon={AlertTriangle} label="Low stock" value={stats.lowStockCount} accent="#d9932e" />
              <StatCard icon={XCircle} label="Out of stock" value={stats.outOfStockCount} accent="#d1503a" />
              <StatCard icon={Clock3} label="Near expiry" value={stats.nearExpiryCount} accent="#d9932e" sub="Within 30 days" />
              <StatCard icon={PackageSearch} label="Expired" value={stats.expiredCount} accent="#d1503a" />
            </div>

            {/* Inventory health score + dead stock */}
            {health && (
              <>
                <SectionHeader icon={HeartPulse} title="Inventory health" sub="Composite score: stock availability, reorder compliance, expiry risk, and dead stock" />
                <div className="grid lg:grid-cols-3 gap-4 mb-8">
                  <Panel title="Health score" className="lg:col-span-1">
                    <div className="flex flex-col items-center justify-center py-4">
                      <p
                        className="font-[var(--font-display)] text-5xl font-bold"
                        style={{ color: health.healthScore >= 80 ? "#0f5c56" : health.healthScore >= 50 ? "#d9932e" : "#d1503a" }}
                      >
                        {health.healthScore}%
                      </p>
                      <p className="text-sm font-semibold text-[var(--color-ink-soft)] mt-1">{health.healthLabel}</p>
                    </div>
                  </Panel>
                  <Panel title="Dead stock" icon={<PackageX size={16} />} className="lg:col-span-2"
                    action={<Link to="/admin/inventory-settings" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">Adjust window</Link>}>
                    <p className="text-xs text-[var(--color-ink-soft)] mb-3">
                      {health.deadStockCount} medicine{health.deadStockCount === 1 ? "" : "s"} in stock with no sale in {health.deadStockWindowDays}+ days.
                    </p>
                    {health.deadStockItems.length === 0 ? (
                      <p className="text-sm text-[var(--color-ink-soft)]">No dead stock right now — nice.</p>
                    ) : (
                      <div className="max-h-56 overflow-y-auto divide-y divide-[var(--color-line)]">
                        {health.deadStockItems.slice(0, 8).map((d) => (
                          <div key={d.medicineId} className="flex items-center justify-between py-2 text-sm">
                            <div>
                              <p className="font-medium text-[var(--color-ink)]">{d.medicineName}</p>
                              <p className="text-xs text-[var(--color-ink-soft)]">
                                {d.neverSold ? "Never sold" : `No sale in ${d.daysSinceLastSale} days`} · {d.quantity} units
                              </p>
                            </div>
                            <p className="font-mono text-[var(--color-ink-soft)]">₹{Number(d.value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Panel>
                </div>
              </>
            )}

            {/* Purchases (Admin-only — full financial/supplier detail) */}
            <SectionHeader icon={ShoppingCart} title="Purchases" sub="Order -> supplier accepts -> dispatch -> received (stock updates on receipt)" />
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <StatCard icon={ShoppingCart} label="Purchases this month" value={stats.purchasesThisMonth} accent="#0f5c56" />
              <StatCard icon={IndianRupee} label="Spend this month" value={`₹${Number(stats.totalSpendThisMonth || 0).toLocaleString("en-IN")}`} accent="#0f5c56" />
              <StatCard icon={Clock3} label="Orders awaiting action" value={stats.ordersAwaitingAction || 0} accent="#d9932e" sub="Pending / accepted / dispatched" />
              <StatCard icon={Receipt} label="Total purchases (all time)" value={stats.totalPurchasesAllTime} accent="#0f5c56" />
              <StatCard icon={IndianRupee} label="Total purchase value" value={`₹${Number(stats.totalPurchaseValueAllTime || 0).toLocaleString("en-IN")}`} accent="#0f5c56" sub="All time" />
            </div>

            {/* Sales overview */}
            <SectionHeader icon={TrendingUp} title="Sales overview" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={IndianRupee} label="Today's sales" value={`₹${Number(stats.salesToday || 0).toLocaleString("en-IN")}`} accent="#0f5c56" />
              <StatCard icon={TrendingUp} label="This month" value={`₹${Number(stats.salesThisMonth || 0).toLocaleString("en-IN")}`} accent="#0f5c56" />
              <StatCard icon={Boxes} label="Medicines sold" value={stats.medicinesSoldThisMonth} accent="#0f5c56" sub="This month" />
              <StatCard icon={Receipt} label="Bills generated" value={stats.billsGeneratedThisMonth} accent="#0f5c56" sub="This month" />
            </div>

            {/* Quarterly graphs */}
            <SectionHeader icon={Activity} title="Trends" sub={`Quarterly view — ${new Date().getFullYear()}`} />
            <div className="grid lg:grid-cols-2 gap-4 mb-8">
              <Panel title="Quarterly sales">
                {quarterlySalesChart.every((q) => q.value === 0) ? (
                  <p className="text-sm text-[var(--color-ink-soft)]">No sales recorded yet.</p>
                ) : (
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <BarChart data={quarterlySalesChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
                        <XAxis dataKey="name" fontSize={12} stroke="var(--color-ink-soft)" />
                        <YAxis fontSize={12} stroke="var(--color-ink-soft)" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#0f5c56" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Panel>
              <Panel title="Quarterly purchase value">
                {quarterlyPurchaseChart.every((q) => q.value === 0) ? (
                  <p className="text-sm text-[var(--color-ink-soft)]">No purchases recorded yet.</p>
                ) : (
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <LineChart data={quarterlyPurchaseChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
                        <XAxis dataKey="name" fontSize={12} stroke="var(--color-ink-soft)" />
                        <YAxis fontSize={12} stroke="var(--color-ink-soft)" />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#0f5c56" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Panel>
            </div>

            {/* Supplier analytics */}
            <SectionHeader icon={Truck} title="Supplier analytics" sub="Spend by supplier" />
            <Panel title="Spend by supplier" className="mb-8">
              {supplierChart.length === 0 ? (
                <p className="text-sm text-[var(--color-ink-soft)]">No purchases recorded yet.</p>
              ) : (
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={supplierChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
                      <XAxis dataKey="name" fontSize={12} stroke="var(--color-ink-soft)" />
                      <YAxis fontSize={12} stroke="var(--color-ink-soft)" />
                      <Tooltip />
                      <Bar dataKey="spend" fill="#0f5c56" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>

            {/* Top selling medicines */}
            <Panel title="Top selling medicines" className="mb-8">
              {(!stats.topSellingMedicines || stats.topSellingMedicines.length === 0) ? (
                <p className="text-sm text-[var(--color-ink-soft)]">No sales recorded yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)] border-b border-[var(--color-line)]">
                      <th className="py-2 pr-4">Medicine</th>
                      <th className="py-2 pr-4">Quantity sold</th>
                      <th className="py-2 pr-4">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topSellingMedicines.map((m, i) => (
                      <tr key={m.medicineName} className="border-b border-[var(--color-line)] last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-[var(--color-ink)]">{i + 1}. {m.medicineName}</td>
                        <td className="py-2.5 pr-4 font-mono">{m.quantitySold}</td>
                        <td className="py-2.5 pr-4 font-mono text-[var(--color-primary)] font-semibold">₹{Number(m.revenue).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>

            {/* Active users */}
            <SectionHeader icon={Users} title="Team & activity" />
            <Panel
              title="Active users"
              className="mb-8"
              action={
                <div className="flex items-center gap-1.5 text-sm text-[var(--color-primary)] font-semibold">
                  <UserCheck size={15} /> {stats.activeUsers?.totalActive || 0} online
                </div>
              }
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(stats.activeUsers?.byRole || {}).map(([role, count]) => (
                  <span key={role} className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[var(--color-mint)] text-[var(--color-primary-dark)]">
                    {role}: {count}
                  </span>
                ))}
              </div>
              {(!stats.activeUsers?.users || stats.activeUsers.users.length === 0) ? (
                <p className="text-sm text-[var(--color-ink-soft)]">No user accounts yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)] border-b border-[var(--color-line)]">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Last login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.activeUsers.users.map((u) => (
                      <tr key={u.userId} className="border-b border-[var(--color-line)] last:border-0">
                        <td className="py-2.5 pr-4">
                          <p className="font-medium text-[var(--color-ink)]">{u.fullName}</p>
                          <p className="text-xs text-[var(--color-ink-soft)]">{u.email}</p>
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-xs">{u.role}</td>
                        <td className="py-2.5 pr-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${u.status === "ONLINE" ? "text-[var(--color-primary)]" : "text-[var(--color-ink-soft)]"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === "ONLINE" ? "bg-[var(--color-primary)]" : "bg-[var(--color-ink-soft)]"}`} />
                            {u.status}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-[var(--color-ink-soft)]">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>

            {/* Recent sales + recent purchases */}
            <div className="grid lg:grid-cols-2 gap-4 mb-8">
              <Panel title="Recent sales">
                {(!stats.recentSales || stats.recentSales.length === 0) ? (
                  <p className="text-sm text-[var(--color-ink-soft)]">No sales recorded yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {stats.recentSales.map((s) => (
                      <li key={s.id} className="flex items-center justify-between text-sm border-b border-[var(--color-line)] last:border-0 pb-2.5 last:pb-0">
                        <div>
                          <p className="font-medium text-[var(--color-ink)]">{s.billNumber} — {s.customerName}</p>
                          <p className="text-xs text-[var(--color-ink-soft)]">{new Date(s.saleDate).toLocaleString()} · {s.soldByName}</p>
                        </div>
                        <span className="font-mono font-semibold text-[var(--color-primary)]">₹{Number(s.totalAmount).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
              <Panel title="Recent purchases">
                {(!stats.recentPurchases || stats.recentPurchases.length === 0) ? (
                  <p className="text-sm text-[var(--color-ink-soft)]">No purchase records available.</p>
                ) : (
                  <ul className="space-y-3">
                    {stats.recentPurchases.map((p) => (
                      <li key={p.id} className="flex items-center justify-between text-sm border-b border-[var(--color-line)] last:border-0 pb-2.5 last:pb-0">
                        <div>
                          <p className="font-medium text-[var(--color-ink)]">{p.medicineName} × {p.quantity}</p>
                          <p className="text-xs text-[var(--color-ink-soft)]">{p.purchaseDate} · {p.supplierName}
                            {p.orderStatus && <span className="ml-2 font-mono text-[10px] uppercase text-[var(--color-primary-dark)]">{p.orderStatus}</span>}
                          </p>
                        </div>
                        <span className="font-mono font-semibold text-[var(--color-primary)]">₹{Number(p.totalAmount).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>

            {/* Recent stock movements */}
            <Panel title="Recent stock movements" className="mb-8">
              {(!stats.recentStockMovements || stats.recentStockMovements.length === 0) ? (
                <p className="text-sm text-[var(--color-ink-soft)]">No recent activity.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)] border-b border-[var(--color-line)]">
                      <th className="py-2 pr-4">Medicine</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Change</th>
                      <th className="py-2 pr-4">New qty</th>
                      <th className="py-2 pr-4">By</th>
                      <th className="py-2 pr-4">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentStockMovements.map((m, i) => (
                      <tr key={i} className="border-b border-[var(--color-line)] last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-[var(--color-ink)]">{m.medicineName}</td>
                        <td className="py-2.5 pr-4 font-mono text-xs">{m.type}</td>
                        <td className={`py-2.5 pr-4 font-mono ${m.quantityChange >= 0 ? "text-[var(--color-primary)]" : "text-[var(--color-coral)]"}`}>
                          {m.quantityChange >= 0 ? "+" : ""}{m.quantityChange}
                        </td>
                        <td className="py-2.5 pr-4 font-mono">{m.newQuantity}</td>
                        <td className="py-2.5 pr-4 text-[var(--color-ink-soft)]">{m.performedBy}</td>
                        <td className="py-2.5 pr-4 text-[var(--color-ink-soft)]">{m.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>

            <p className="text-xs text-[var(--color-ink-soft)]">
              Looking for detailed logs? See <span className="font-semibold text-[var(--color-ink)]">User activity</span> and{" "}
              <span className="font-semibold text-[var(--color-ink)]">Stock movements</span> in the sidebar, or download a full
              report from <span className="font-semibold text-[var(--color-ink)]">Reports</span>.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

