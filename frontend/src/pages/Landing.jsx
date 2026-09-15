import { useNavigate } from "react-router-dom";
import { ArrowRight, Cross, Pill, ShieldCheck, Activity, Truck, BarChart3 } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

const FEATURES = [
  { icon: Activity, label: "Real-time stock" },
  { icon: ShieldCheck, label: "Expiry & low-stock alerts" },
  { icon: Truck, label: "Supplier order workflow" },
  { icon: BarChart3, label: "Purchase & sales analytics" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--color-canvas)] flex flex-col">
      {/* Animated gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob animate-float-slow absolute -top-32 -left-24 w-[26rem] h-[26rem] bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-primary-light)]/10 blur-3xl" />
        <div className="animate-blob animate-float-slower absolute top-1/3 -right-32 w-[30rem] h-[30rem] bg-gradient-to-br from-[var(--color-amber)]/25 to-[var(--color-coral)]/10 blur-3xl" style={{ animationDelay: "-3s" }} />
        <div className="animate-blob absolute bottom-0 left-1/4 w-80 h-80 bg-gradient-to-br from-[var(--color-coral)]/20 to-transparent blur-3xl" style={{ animationDelay: "-6s" }} />
      </div>

      {/* Floating medical icons, decorative */}
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <Pill size={38} className="animate-float-slow absolute top-28 left-[14%] text-[var(--color-primary)]/30 rotate-12" />
        <Cross size={30} className="animate-float-slower absolute top-1/2 right-[12%] text-[var(--color-amber)]/40" />
        <ShieldCheck size={34} className="animate-float-slow absolute bottom-24 left-[20%] text-[var(--color-coral)]/30" style={{ animationDelay: "-2s" }} />
        <Activity size={30} className="animate-float-slower absolute top-40 right-[22%] text-[var(--color-primary-light)]/40" style={{ animationDelay: "-4s" }} />
      </div>

      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white">
            <Cross size={18} />
          </div>
          <span className="font-[var(--font-display)] font-semibold text-lg text-[var(--color-ink)]">MediStock</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 -mt-10">
        <div className="relative inline-block animate-scale-in">
          <div className="animate-pulse-ring absolute -inset-4 rounded-full bg-[var(--color-primary)]/10" />
          <div className="relative w-20 h-20 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center text-white shadow-xl shadow-[var(--color-primary)]/20">
            <Cross size={36} />
          </div>
        </div>

        <h1 className="font-[var(--font-display)] font-bold text-[var(--color-ink)] text-4xl sm:text-6xl mt-8 leading-[1.05] animate-fade-up" style={{ animationDelay: ".05s" }}>
          Medical Inventory
          <br />
          <span className="bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-amber)] bg-clip-text text-transparent">
            Platform
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-[var(--color-ink-soft)] text-base sm:text-lg leading-relaxed animate-fade-up" style={{ animationDelay: ".12s" }}>
          Track stock, catch expiries before they cost you, and manage suppliers and
          purchase orders — all in one clean, real-time dashboard.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="mt-9 group inline-flex items-center gap-2.5 rounded-full bg-[var(--color-primary)] text-white font-semibold px-8 py-3.5 text-base hover:bg-[var(--color-primary-dark)] hover:scale-[1.03] active:scale-[0.98] transition-all shadow-lg shadow-[var(--color-primary)]/25 animate-fade-up"
          style={{ animationDelay: ".2s" }}
        >
          Get Started
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: ".28s" }}>
          {FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 rounded-full bg-[var(--color-surface)]/80 backdrop-blur border border-[var(--color-line)] px-4 py-2 text-xs font-medium text-[var(--color-ink-soft)]">
              <Icon size={14} className="text-[var(--color-primary)]" />
              {label}
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 text-center pb-6 text-xs text-[var(--color-ink-soft)] font-mono">
        MediStock — Inventory Platform
      </footer>
    </div>
  );
}
