import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Building2, CalendarClock, ClipboardList, Package, Pill, RefreshCw, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { CrudService } from "@/api/crudService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Inventory = { quantity?: number; medicine?: { price?: number } };
type Counts = { medicines: number; suppliers: number; inventory: number; purchases: number; unread: number; upcoming: number; value: number };
const initial: Counts = { medicines: 0, suppliers: 0, inventory: 0, purchases: 0, unread: 0, upcoming: 0, value: 0 };

export function Dashboard() {
  const [counts, setCounts] = useState<Counts>(initial);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [medicines, suppliers, inventory, purchases, notifications, expiries] = await Promise.all([
        new CrudService<Record<string, unknown>>("/medicines").getAll(), new CrudService<Record<string, unknown>>("/suppliers").getAll(),
        new CrudService<Inventory>("/inventories").getAll(), new CrudService<Record<string, unknown>>("/purchaseorders").getAll(),
        new CrudService<{ isRead?: boolean }>("/notifications").getAll(), new CrudService<Record<string, unknown>>("/expirys").getAll(),
      ]);
      setCounts({ medicines: medicines.length, suppliers: suppliers.length, inventory: inventory.length, purchases: purchases.length, unread: notifications.filter(n => !n.isRead).length, upcoming: expiries.length, value: inventory.reduce((sum, item) => sum + (item.quantity ?? 0) * (item.medicine?.price ?? 0), 0) });
    } catch { toast.error("Unable to refresh dashboard data. Please try again."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); window.addEventListener("medistock:data-changed", load); return () => window.removeEventListener("medistock:data-changed", load); }, [load]);
  const cards = [
    ["Medicines", counts.medicines, Pill, "text-cyan-700 bg-cyan-100"], ["Suppliers", counts.suppliers, Building2, "text-violet-700 bg-violet-100"],
    ["Stock batches", counts.inventory, Package, "text-amber-700 bg-amber-100"], ["Purchase orders", counts.purchases, ShoppingCart, "text-blue-700 bg-blue-100"],
    ["Unread notifications", counts.unread, Bell, "text-rose-700 bg-rose-100"], ["Expiry records", counts.upcoming, CalendarClock, "text-orange-700 bg-orange-100"],
  ] as const;
  return <div className="space-y-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-cyan-700">Live operational overview</p><h2 className="text-3xl font-bold tracking-tight text-slate-950">Good to see you</h2><p className="mt-1 text-slate-500">A real-time summary of your inventory workspace.</p></div><Button variant="outline" onClick={load} disabled={loading} className="rounded-xl"><RefreshCw className={loading ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"}/>Refresh</Button></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value, Icon, color]) => <Card key={label} className="border-slate-200/80 shadow-sm"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-950">{loading ? "—" : value}</p></div><div className={`grid h-11 w-11 place-items-center rounded-xl ${color}`}><Icon className="h-5 w-5"/></div></CardContent></Card>)}</div><div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]"><Card className="border-slate-200/80"><CardContent className="p-6"><p className="text-sm font-semibold text-slate-500">Current inventory value</p><p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">{loading ? "—" : new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(counts.value)}</p><p className="mt-2 text-sm text-slate-500">Calculated from the quantity and medicine price returned by the inventory API.</p></CardContent></Card><Card className="border-slate-200/80"><CardContent className="p-6"><p className="font-bold text-slate-950">Quick actions</p><div className="mt-4 grid gap-2"><Link className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50" to="/inventory">Manage stock batches</Link><Link className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50" to="/medicines">Manage medicines</Link><Link className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50" to="/expiries">Review expiry tracking</Link></div></CardContent></Card></div></div>;
}
