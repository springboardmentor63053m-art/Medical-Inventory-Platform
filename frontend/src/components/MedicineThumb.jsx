import { useState } from "react";
import { X, Package, Pill as PillIcon } from "lucide-react";
import MedicineAvatar, { medicineStyleFor } from "./MedicineAvatar";

/**
 * A stylised, colour-matched "box" or "blister sheet" illustration used
 * whenever a medicine doesn't have a real photo yet. MediStock has no photo
 * pipeline of its own — this keeps the catalog looking complete and
 * consistent (never a blank/broken-image state) until real photos are
 * added via the medicine form's Image URL fields.
 */
function IllustratedFallback({ kind, category, name }) {
  const { fg, bg } = medicineStyleFor(category, name);
  if (kind === "sheet") {
    return (
      <svg viewBox="0 0 200 140" className="w-full h-full">
        <rect width="200" height="140" rx="14" fill={bg} />
        {Array.from({ length: 10 }).map((_, i) => {
          const col = i % 5, row = Math.floor(i / 5);
          return (
            <g key={i} transform={`translate(${24 + col * 34}, ${34 + row * 56})`}>
              <ellipse cx="0" cy="0" rx="13" ry="17" fill="white" fillOpacity="0.55" stroke={fg} strokeOpacity="0.5" strokeWidth="1.5" />
              <ellipse cx="0" cy="0" rx="6" ry="9" fill={fg} fillOpacity="0.55" />
            </g>
          );
        })}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 140" className="w-full h-full">
      <rect width="200" height="140" rx="14" fill={bg} />
      <rect x="55" y="24" width="90" height="96" rx="8" fill="white" fillOpacity="0.7" stroke={fg} strokeOpacity="0.4" strokeWidth="1.5" />
      <rect x="70" y="36" width="60" height="16" rx="3" fill={fg} fillOpacity="0.35" />
      <rect x="70" y="58" width="60" height="6" rx="3" fill={fg} fillOpacity="0.25" />
      <rect x="70" y="70" width="44" height="6" rx="3" fill={fg} fillOpacity="0.2" />
      <rect x="70" y="94" width="60" height="18" rx="4" fill={fg} fillOpacity="0.15" />
    </svg>
  );
}

function ImagePane({ label, icon: Icon, src, category, name, kind }) {
  return (
    <div className="flex-1 min-w-[220px]">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)] mb-2">
        <Icon size={13} /> {label}
      </div>
      <div className="aspect-[10/7] rounded-xl overflow-hidden border border-[var(--color-line)] bg-[var(--color-mint)]">
        {src ? (
          <img src={src} alt={`${name} — ${label}`} className="w-full h-full object-cover" />
        ) : (
          <IllustratedFallback kind={kind} category={category} name={name} />
        )}
      </div>
      {!src && (
        <p className="text-[11px] text-[var(--color-ink-soft)] mt-1.5">Illustration — no real photo added yet.</p>
      )}
    </div>
  );
}

/** Same-size clickable thumbnail (photo if set, else the category icon avatar) that opens an enlarged lightbox on click. */
export default function MedicineThumb({ medicine, size = "md" }) {
  const [open, setOpen] = useState(false);
  const hasImage = !!medicine.imageUrl;
  const SIZE_PX = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-14 h-14" }[size] || "w-10 h-10";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Click to enlarge"
        className={`${SIZE_PX} shrink-0 rounded-xl overflow-hidden ring-0 hover:ring-2 hover:ring-[var(--color-primary)] transition-all cursor-zoom-in`}
      >
        {hasImage ? (
          <img src={medicine.imageUrl} alt={medicine.name} className="w-full h-full object-cover" />
        ) : (
          <MedicineAvatar category={medicine.category} name={medicine.name} size={size} />
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-up"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-[var(--color-surface)] rounded-2xl border border-[var(--color-line)] shadow-2xl p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-[var(--font-display)] font-semibold text-lg text-[var(--color-ink)]">{medicine.name}</h3>
                {medicine.category && <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">{medicine.category}</p>}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-ink-soft)] hover:bg-[var(--color-mint)] hover:text-[var(--color-ink)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-wrap gap-5">
              <ImagePane label="Box / packaging" icon={Package} src={medicine.imageUrl} category={medicine.category} name={medicine.name} kind="box" />
              <ImagePane label="Sheet" icon={PillIcon} src={medicine.sheetImageUrl} category={medicine.category} name={medicine.name} kind="sheet" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
