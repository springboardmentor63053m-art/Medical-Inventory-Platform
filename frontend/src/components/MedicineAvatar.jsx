import {
  Pill, Syringe, Droplet, Wind, Thermometer, Bug, Brain, Heart,
  ShieldPlus, Sparkles, FlaskConical, Bandage, Zap, Moon, Stethoscope,
} from "lucide-react";

/**
 * MediStock has no photo-upload pipeline (and pulling live product photography
 * for arbitrary medicine names isn't reliable at runtime), so instead every
 * medicine gets a deterministic, category-aware "visual" — an icon + colour
 * pairing that stays consistent for that category everywhere in the app.
 * This is the same pattern real pharmacy/inventory products (Practo, 1mg,
 * Netmeds) use for generic-looking stock photography.
 */
const CATEGORY_STYLES = {
  "Analgesic": { icon: Pill, bg: "#e4f1ea", fg: "#0f5c56" },
  "Topical Analgesic": { icon: Bandage, bg: "#e4f1ea", fg: "#16786f" },
  "Neuropathic Analgesic": { icon: Zap, bg: "#fbf0dd", fg: "#d9932e" },
  "Antacid": { icon: FlaskConical, bg: "#eef2fb", fg: "#3956a8" },
  "Antibiotic": { icon: ShieldPlus, bg: "#e4f1ea", fg: "#0f5c56" },
  "Topical Antibacterial": { icon: Bandage, bg: "#e4f1ea", fg: "#0f5c56" },
  "Antidepressant": { icon: Brain, bg: "#f1e9fb", fg: "#7a4fc9" },
  "Anxiolytic": { icon: Moon, bg: "#f1e9fb", fg: "#7a4fc9" },
  "Antidiabetic": { icon: Droplet, bg: "#fbe7e2", fg: "#d1503a" },
  "Antidiarrheal": { icon: FlaskConical, bg: "#fbf0dd", fg: "#d9932e" },
  "Antiemetic": { icon: Sparkles, bg: "#fbf0dd", fg: "#d9932e" },
  "Antifungal": { icon: Bug, bg: "#fbe7e2", fg: "#d1503a" },
  "Antihistamine": { icon: Wind, bg: "#eef2fb", fg: "#3956a8" },
  "Antihypertensive": { icon: Heart, bg: "#fbe7e2", fg: "#d1503a" },
  "Antiparasitic": { icon: Bug, bg: "#fbe7e2", fg: "#d1503a" },
  "Antiseptic": { icon: ShieldPlus, bg: "#e4f1ea", fg: "#0f5c56" },
  "Bronchodilator": { icon: Wind, bg: "#eef2fb", fg: "#3956a8" },
  "Cold & Flu": { icon: Thermometer, bg: "#fbf0dd", fg: "#d9932e" },
  "Diuretic": { icon: Droplet, bg: "#eef2fb", fg: "#3956a8" },
  "Injectable Supplement": { icon: Syringe, bg: "#e4f1ea", fg: "#0f5c56" },
  "Mucolytic": { icon: Wind, bg: "#eef2fb", fg: "#3956a8" },
  "Rehydration": { icon: Droplet, bg: "#eef2fb", fg: "#3956a8" },
  "Respiratory": { icon: Stethoscope, bg: "#eef2fb", fg: "#3956a8" },
  "Steroid": { icon: FlaskConical, bg: "#fbf0dd", fg: "#d9932e" },
  "Topical Steroid": { icon: Bandage, bg: "#fbf0dd", fg: "#d9932e" },
  "Supplement": { icon: Sparkles, bg: "#e4f1ea", fg: "#0f5c56" },
  "Thyroid Hormone": { icon: FlaskConical, bg: "#f1e9fb", fg: "#7a4fc9" },
};

const FALLBACK_PALETTE = [
  { bg: "#e4f1ea", fg: "#0f5c56" },
  { bg: "#fbf0dd", fg: "#d9932e" },
  { bg: "#fbe7e2", fg: "#d1503a" },
  { bg: "#eef2fb", fg: "#3956a8" },
  { bg: "#f1e9fb", fg: "#7a4fc9" },
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function styleFor(category, name) {
  if (category && CATEGORY_STYLES[category]) return CATEGORY_STYLES[category];
  const seed = category || name || "medicine";
  const palette = FALLBACK_PALETTE[hashString(seed) % FALLBACK_PALETTE.length];
  return { icon: Pill, ...palette };
}

export function medicineStyleFor(category, name) {
  return styleFor(category, name);
}

const SIZE_MAP = { sm: { box: "w-8 h-8", icon: 14 }, md: { box: "w-10 h-10", icon: 17 }, lg: { box: "w-14 h-14", icon: 24 } };

export default function MedicineAvatar({ category, name, size = "md", className = "" }) {
  const { icon: Icon, bg, fg } = styleFor(category, name);
  const { box, icon } = SIZE_MAP[size] || SIZE_MAP.md;
  return (
    <div
      className={`${box} shrink-0 rounded-xl flex items-center justify-center ${className}`}
      style={{ background: bg }}
      title={category || "Medicine"}
    >
      <Icon size={icon} style={{ color: fg }} strokeWidth={2.1} />
    </div>
  );
}
