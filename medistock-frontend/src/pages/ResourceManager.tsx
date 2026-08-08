import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, DatabaseZap, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/api/axios";
import { CrudService } from "@/api/crudService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FieldType = "text" | "number" | "date" | "datetime-local" | "boolean" | "select";
export type Field = { key: string; label: string; type?: FieldType; required?: boolean; options?: string[]; reference?: { endpoint: string; label: string } };
export type FilterConfig = { key: string; label: string; endpoint: string; param: string; type: "select" | "reference" | "dynamic"; options?: { label: string; value: string }[]; reference?: { endpoint: string; label: string }; dynamicKey?: string };
export type ResourceConfig = { title: string; singular: string; endpoint: string; fields: Field[]; searchEndpoint?: string; special?: "inventory" | "notifications" | "expiries"; filters?: FilterConfig[] };

const valueForInput = (value: unknown, type?: FieldType) => {
  if (value === null || value === undefined) return type === "boolean" ? false : "";
  if (type === "date") return String(value).slice(0, 10);
  if (type === "datetime-local") return String(value).slice(0, 16);
  if (typeof value === "object") return String((value as { id?: unknown }).id ?? "");
  return String(value);
};

const displayValue = (value: unknown, field: Field) => {
  if (value === null || value === undefined || value === "") return "—";
  if (field.type === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return String((value as Record<string, unknown>).name ?? (value as Record<string, unknown>).username ?? `#${(value as Record<string, unknown>).id}`);
  if (field.key === "price") return `$${Number(value).toFixed(2)}`;
  return String(value);
};

const asRows = (value: unknown): Record<string, unknown>[] => {
  if (Array.isArray(value)) return value as Record<string, unknown>[];
  if (value && typeof value === "object") {
    const candidate = value as { content?: unknown; data?: unknown };
    if (Array.isArray(candidate.content)) return candidate.content as Record<string, unknown>[];
    if (Array.isArray(candidate.data)) return candidate.data as Record<string, unknown>[];
  }
  return [];
};

export function ResourceManager({ config }: { config: ResourceConfig }) {
  const service = useMemo(() => new CrudService<Record<string, unknown>>(config.endpoint), [config.endpoint]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeFilterKey, setActiveFilterKey] = useState<string>("");
  const [activeFilterVal, setActiveFilterVal] = useState<string>("");
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({});
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [references, setReferences] = useState<Record<string, Record<string, unknown>[]>>({});
  const [saving, setSaving] = useState(false);

  const extractError = (err: unknown, fallback: string) => {
    if (err && typeof err === "object" && "response" in err) {
      const res = (err as { response?: { status?: number; data?: { message?: string } | string } }).response;
      if (res) {
        const msg = typeof res.data === "object" ? res.data?.message : res.data;
        return `${fallback} (${res.status}${msg ? `: ${msg}` : ""})`;
      }
    }
    return fallback;
  };

  const load = useCallback(async () => {
    try { 
      setLoading(true); 
      const data = asRows(await service.getAll());
      setRows(data);
      setQuery("");
      setActiveFilterKey("");
      setActiveFilterVal("");
      if (config.filters) {
        const dyn: Record<string, string[]> = {};
        config.filters.forEach(f => {
          if (f.type === "dynamic" && f.dynamicKey) {
            dyn[f.key] = Array.from(new Set(data.map(r => String(r[f.dynamicKey!])).filter(Boolean))) as string[];
            dyn[f.key].sort();
          }
        });
        setDynamicOptions(dyn);
      }
    }
    catch (err) { toast.error(extractError(err, `Unable to load ${config.title.toLowerCase()}`)); }
    finally { setLoading(false); }
  }, [config.title, service, config.filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const allRefs = [...config.fields.filter(f => f.reference).map(f => f.reference!), ...(config.filters || []).filter(f => f.reference).map(f => f.reference!)];
    const refs = [...new Map(allRefs.map(r => [r.endpoint, r])).entries()];
    Promise.all(refs.map(async ([endpoint, ref]) => [endpoint, await new CrudService<Record<string, unknown>>(endpoint).getAll()] as const))
      .then(items => setReferences(Object.fromEntries(items))).catch(() => toast.error("Unable to load form choices"));
  }, [config.fields, config.filters]);

  const open = (mode: "create" | "edit", row?: Record<string, unknown>) => {
    setEditing(row ?? null);
    setForm(Object.fromEntries(config.fields.map(f => [f.key, valueForInput(row?.[f.key], f.type)])));
    setModal(mode);
  };
  const payload = () => Object.fromEntries(config.fields.map(field => {
    const raw = form[field.key];
    if (field.reference) return [field.key, raw ? { id: Number(raw) } : null];
    if (field.type === "number") return [field.key, raw === "" ? null : Number(raw)];
    if (field.type === "boolean") return [field.key, Boolean(raw)];
    return [field.key, raw || null];
  }));
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (config.fields.some(f => f.required && !form[f.key])) return toast.error("Please complete all required fields");
    try {
      setSaving(true);
      if (modal === "edit" && editing?.id) await service.update(String(editing.id), payload()); else await service.create(payload());
      toast.success(`${config.singular} ${modal === "edit" ? "updated" : "created"}`); setModal(null); window.dispatchEvent(new Event("medistock:data-changed")); load();
    } catch (err) { toast.error(extractError(err, `Unable to save ${config.singular.toLowerCase()}`)); }
    finally { setSaving(false); }
  };
  const remove = async (row: Record<string, unknown>) => {
    if (!window.confirm(`Delete this ${config.singular.toLowerCase()}?`)) return;
    try { await service.delete(String(row.id)); toast.success(`${config.singular} deleted`); window.dispatchEvent(new Event("medistock:data-changed")); load(); }
    catch (err) { toast.error(extractError(err, "Unable to delete — the item may still be referenced by other records")); }
  };
  const applyData = async (q: string, fKey: string, fVal: string) => {
    setLoading(true);
    try {
      if (fKey && fVal) {
        const f = config.filters!.find(x => x.key === fKey)!;
        const res = await axiosInstance.get(f.endpoint, { params: { [f.param]: fVal } });
        setRows(asRows(res.data));
      } else if (q.trim() && config.searchEndpoint) {
        const res = await axiosInstance.get(config.searchEndpoint, { params: { name: q } });
        setRows(asRows(res.data));
      } else {
        setRows(asRows(await service.getAll()));
      }
    } catch (err) {
      toast.error(extractError(err, "Search or filter failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (fKey: string, val: string) => {
    setActiveFilterKey(fKey);
    setActiveFilterVal(val);
    applyData(query, fKey, val);
  };

  const performSearch = () => applyData(query, activeFilterKey, activeFilterVal);
  const specialAction = async (row: Record<string, unknown>) => {
    try {
      if (config.special === "notifications") { await axiosInstance.put(`${config.endpoint}/${row.id}/read`); toast.success("Notification marked as read"); }
      if (config.special === "inventory") { const amount = window.prompt("New stock quantity:", String(row.quantity ?? "")); if (amount === null || amount === "") return; await axiosInstance.put(`${config.endpoint}/${row.id}/stock`, null, { params: { quantity: Number(amount) } }); toast.success("Stock updated"); }
      window.dispatchEvent(new Event("medistock:data-changed")); load();
    } catch (err) { toast.error(extractError(err, "Action could not be completed")); }
  };
  const safeRows = asRows(rows);
  const filtered = (config.searchEndpoint && !activeFilterKey) ? safeRows : safeRows.filter(row => Object.values(row).some(v => String(typeof v === "object" ? displayValue(v, { key: "", label: "" }) : v).toLowerCase().includes(query.toLowerCase())));

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-sm font-medium text-cyan-700">Management center</p><h2 className="text-3xl font-bold tracking-tight text-slate-950">{config.title}</h2><p className="mt-1 text-slate-500">Create, update and keep your {config.title.toLowerCase()} accurate.</p></div>
      <Button onClick={() => open("create")} className="rounded-xl shadow-lg shadow-cyan-600/20"><Plus className="mr-2 h-4 w-4"/>New {config.singular}</Button>
    </div>
    <Card className="border-slate-200/80 shadow-sm"><CardContent className="p-0">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><Input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && performSearch()} placeholder={`Search ${config.title.toLowerCase()}...`} className="h-10 rounded-xl pl-9" /></div>
        <Button variant="outline" onClick={performSearch} className="rounded-xl"><Search className="mr-2 h-4 w-4"/>Search</Button><Button variant="ghost" size="icon" onClick={load} title="Refresh"><RefreshCw className="h-4 w-4"/></Button>
      </div>
      {config.filters && config.filters.length > 0 && (
        <div className="flex flex-wrap gap-3 border-b border-slate-100 p-4 bg-slate-50/50">
          {config.filters.map(f => (
             <select key={f.key} value={activeFilterKey === f.key ? activeFilterVal : ""} onChange={(e) => handleFilterChange(f.key, e.target.value)} className="h-9 min-w-[150px] rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500">
               <option value="">All {f.label}</option>
               {f.type === "dynamic" && (dynamicOptions[f.key] || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
               {f.type === "select" && f.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
               {f.type === "reference" && (references[f.reference!.endpoint] || []).map(refItem => <option key={String(refItem.id)} value={String(refItem.id)}>{String(refItem[f.reference!.label] ?? `#${refItem.id}`)}</option>)}
             </select>
          ))}
        </div>
      )}
      {config.special === "expiries" && <div className="px-4 pt-3"><Button size="sm" variant="outline" onClick={async () => { try { setRows(asRows((await axiosInstance.get(`${config.endpoint}/upcoming`)).data)); } catch { toast.error("Unable to load upcoming expiries"); } }}>Show upcoming expiries</Button></div>}
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr>{config.fields.map(f => <th className="px-5 py-3 font-semibold" key={f.key}>{f.label}</th>)}<th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={config.fields.length + 1} className="p-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-cyan-600"/></td></tr> : filtered.length === 0 ? <tr><td colSpan={config.fields.length + 1} className="p-16 text-center"><div className="flex flex-col items-center gap-3 text-slate-400"><DatabaseZap className="h-10 w-10 opacity-40"/><p className="text-sm font-medium">No {config.title.toLowerCase()} found.</p><p className="text-xs">Add one using the button above, or check that the backend is running.</p></div></td></tr> : filtered.map(row => <tr className="transition-colors hover:bg-cyan-50/30" key={String(row.id)}>{config.fields.map(f => <td className="max-w-52 truncate px-5 py-4 text-slate-700" key={f.key}>{displayValue(row[f.key], f)}</td>)}<td className="whitespace-nowrap px-5 py-3 text-right">{config.special && <Button variant="ghost" size="icon" title="Run action" onClick={() => specialAction(row)}><Check className="h-4 w-4 text-emerald-600"/></Button>}<Button variant="ghost" size="icon" onClick={() => open("edit", row)}><Pencil className="h-4 w-4 text-cyan-700"/></Button><Button variant="ghost" size="icon" onClick={() => remove(row)}><Trash2 className="h-4 w-4 text-rose-600"/></Button></td></tr>)}</tbody></table></div>
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500"><span>{filtered.length} record{filtered.length === 1 ? "" : "s"}</span><span className="flex gap-1"><ChevronLeft className="h-4 w-4"/><ChevronRight className="h-4 w-4"/></span></div>
    </CardContent></Card>
    {modal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><form onSubmit={save} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-5"><div><h3 className="text-xl font-bold">{modal === "edit" ? "Edit" : "New"} {config.singular}</h3><p className="text-sm text-slate-500">Fields marked * are required.</p></div><Button type="button" variant="ghost" size="icon" onClick={() => setModal(null)}><X/></Button></div><div className="grid gap-5 p-6 sm:grid-cols-2">{config.fields.map(field => <label className={field.type === "boolean" ? "flex items-center gap-3 pt-7" : "space-y-2"} key={field.key}><span className="text-sm font-semibold text-slate-700">{field.label}{field.required && <span className="text-rose-600"> *</span>}</span>{field.type === "boolean" ? <input type="checkbox" checked={Boolean(form[field.key])} onChange={e => setForm(x => ({ ...x, [field.key]: e.target.checked }))} className="h-4 w-4 accent-cyan-600"/> : field.reference || field.type === "select" ? <select value={String(form[field.key] ?? "")} required={field.required} onChange={e => setForm(x => ({ ...x, [field.key]: e.target.value }))} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"><option value="">Select {field.label}</option>{field.reference ? (references[field.reference.endpoint] ?? []).map(item => <option key={String(item.id)} value={String(item.id)}>{String(item[field.reference!.label] ?? `#${item.id}`)}</option>) : field.options?.map(option => <option key={option} value={option}>{option}</option>)}</select> : <Input type={field.type ?? "text"} required={field.required} value={String(form[field.key] ?? "")} onChange={e => setForm(x => ({ ...x, [field.key]: e.target.value }))} className="rounded-lg"/>}</label>)}</div><div className="flex justify-end gap-3 border-t px-6 py-4"><Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button><Button disabled={saving} type="submit" className="rounded-xl">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Save {config.singular}</Button></div></form></div>}
  </div>;
}
