import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Cross, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("medistock_remember_email");
    if (savedEmail) {
      setForm((f) => ({ ...f, email: savedEmail }));
      setRememberMe(true);
    }
    // Only show "Continue with Google" if the backend actually has OAuth2
    // credentials configured — otherwise it's a button that always errors.
    api.get("/auth/oauth2-status")
      .then((res) => setGoogleEnabled(!!res.data?.googleEnabled))
      .catch(() => setGoogleEnabled(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      if (rememberMe) {
        localStorage.setItem("medistock_remember_email", form.email);
      } else {
        localStorage.removeItem("medistock_remember_email");
      }
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--color-canvas)]">
      {/* Left: brand panel with illustration */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[var(--color-primary-dark)] via-[var(--color-primary)] to-[var(--color-primary-light)] text-white relative overflow-hidden">
        <div className="animate-blob animate-float-slow absolute -right-24 -top-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="animate-blob animate-float-slower absolute -left-16 bottom-0 w-72 h-72 rounded-full bg-[var(--color-amber)]/20 blur-3xl" />

        <div className="flex items-center gap-2 relative z-10">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center">
            <Cross size={20} />
          </div>
          <span className="font-[var(--font-display)] font-semibold text-xl">MediStock</span>
        </div>

        {/* Illustration */}
        <div className="relative z-10 flex justify-center my-8 animate-float-slow">
          <svg width="280" height="220" viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Shelf */}
            <rect x="20" y="170" width="240" height="8" rx="4" fill="white" fillOpacity="0.15" />
            {/* Bottle 1 */}
            <rect x="45" y="90" width="42" height="80" rx="8" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
            <rect x="55" y="75" width="22" height="18" rx="3" fill="white" fillOpacity="0.25" />
            <rect x="52" y="115" width="28" height="30" rx="3" fill="var(--color-primary-light)" fillOpacity="0.4" />
            {/* Bottle 2 (taller) */}
            <rect x="105" y="60" width="48" height="110" rx="8" fill="white" fillOpacity="0.16" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" />
            <rect x="117" y="42" width="24" height="20" rx="3" fill="white" fillOpacity="0.3" />
            <rect x="113" y="95" width="32" height="38" rx="3" fill="var(--color-amber)" fillOpacity="0.4" />
            <circle cx="129" cy="145" r="10" fill="white" fillOpacity="0.2" />
            {/* Bottle 3 */}
            <rect x="172" y="100" width="40" height="70" rx="8" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
            <rect x="181" y="86" width="22" height="16" rx="3" fill="white" fillOpacity="0.25" />
            <rect x="178" y="122" width="26" height="26" rx="3" fill="var(--color-coral)" fillOpacity="0.35" />
            {/* Pill capsule floating */}
            <g transform="translate(215,55) rotate(30)">
              <rect x="0" y="0" width="34" height="16" rx="8" fill="white" fillOpacity="0.9" />
              <rect x="0" y="0" width="17" height="16" rx="8" fill="var(--color-primary-light)" />
            </g>
            {/* Small cross badge */}
            <g transform="translate(28,40)">
              <circle cx="14" cy="14" r="14" fill="white" fillOpacity="0.15" />
              <rect x="11" y="6" width="6" height="16" rx="2" fill="white" fillOpacity="0.7" />
              <rect x="6" y="11" width="16" height="6" rx="2" fill="white" fillOpacity="0.7" />
            </g>
          </svg>
        </div>

        <div className="relative z-10">
          <p className="font-[var(--font-display)] text-4xl font-semibold leading-tight max-w-md">
            Every batch tracked. Every expiry caught before it costs you.
          </p>
          <p className="mt-4 text-white/60 max-w-sm text-sm leading-relaxed">
            Real-time stock, expiry monitoring, and supplier records for
            pharmacies, hospitals, and clinics — in one dashboard.
          </p>
        </div>

        <p className="text-white/40 text-xs font-mono relative z-10">MediStock v1.0 — Inventory Platform</p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-8 relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm animate-fade-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white">
              <Cross size={18} />
            </div>
            <span className="font-[var(--font-display)] font-semibold text-lg text-[var(--color-ink)]">MediStock</span>
          </div>

          <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Welcome back</h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">Sign in to manage your inventory.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@pharmacy.com"
                className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[var(--color-ink-soft)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--color-line)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-[var(--color-primary)] font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            {error && (
              <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold py-2.5 hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {googleEnabled && (
            <>
              <div className="flex items-center gap-3 my-5">
                <span className="flex-1 h-px bg-[var(--color-line)]" />
                <span className="text-xs text-[var(--color-ink-soft)]">or</span>
                <span className="flex-1 h-px bg-[var(--color-line)]" />
              </div>

              <a
                href={`${(import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/api\/?$/, "")}/oauth2/authorization/google`}
                className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] text-sm font-semibold text-[var(--color-ink)] py-2.5 hover:bg-[var(--color-canvas)] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 16 3 9.1 7.5 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 45c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6c-2 1.4-4.7 2.2-7.7 2.2-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9 40.4 15.9 45 24 45z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C41.8 36 45 30.5 45 24c0-1.2-.1-2.4-.4-3.5z" />
                </svg>
                Continue with Google
              </a>
            </>
          )}

          <p className="text-sm text-[var(--color-ink-soft)] mt-6 text-center">
            New to MediStock?{" "}
            <Link to="/register" className="text-[var(--color-primary)] font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}