export default function StatusPill({ status }) {
  const map = {
    ok: { label: "In stock", bg: "var(--color-mint)", fg: "var(--color-primary-dark)" },
    low: { label: "Low stock", bg: "var(--color-amber-bg)", fg: "var(--color-amber)" },
    out: { label: "Out of stock", bg: "var(--color-coral-bg)", fg: "var(--color-coral)" },
    expiring: { label: "Near expiry", bg: "var(--color-amber-bg)", fg: "var(--color-amber)" },
    expired: { label: "Expired", bg: "var(--color-coral-bg)", fg: "var(--color-coral)" },
  };
  const s = map[status] || map.ok;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold font-mono tracking-wide"
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.fg }} />
      {s.label}
    </span>
  );
}
