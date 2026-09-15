import { useState } from "react";
import { Link } from "react-router-dom";
import { Cross, ArrowLeft, Mail, KeyRound } from "lucide-react";
import api from "../api/axios";
import ThemeToggle from "../components/ThemeToggle";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Backend always responds the same way whether or not the email
      // exists, so the UI never reveals which accounts are registered.
      await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--color-canvas)]">
      {/* Left: brand panel with a friendly "support" illustration */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[var(--color-coral)] via-[var(--color-amber)] to-[var(--color-primary)] text-white relative overflow-hidden">
        <div className="animate-blob animate-float-slower absolute -left-20 -top-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="animate-blob animate-float-slow absolute -right-16 bottom-0 w-80 h-80 rounded-full bg-[var(--color-primary-dark)]/20 blur-3xl" />

        <div className="flex items-center gap-2 relative z-10">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <Cross size={20} />
          </div>
          <span className="font-[var(--font-display)] font-semibold text-xl">MediStock</span>
        </div>

        {/* Illustration: a friendly person at a desk, holding a key — original artwork */}
        <div className="relative z-10 flex justify-center my-8 animate-float-slow">
          <svg width="260" height="240" viewBox="0 0 260 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Desk */}
            <rect x="20" y="190" width="220" height="10" rx="5" fill="white" fillOpacity="0.18" />
            <rect x="35" y="200" width="14" height="30" fill="white" fillOpacity="0.12" />
            <rect x="211" y="200" width="14" height="30" fill="white" fillOpacity="0.12" />
            {/* Laptop on desk */}
            <rect x="150" y="150" width="60" height="40" rx="4" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.3" />
            <rect x="146" y="188" width="68" height="6" rx="3" fill="white" fillOpacity="0.25" />
            {/* Chair back */}
            <rect x="60" y="90" width="60" height="70" rx="14" fill="white" fillOpacity="0.1" />
            {/* Person torso */}
            <rect x="72" y="120" width="36" height="55" rx="16" fill="white" fillOpacity="0.85" />
            {/* Head */}
            <circle cx="90" cy="98" r="20" fill="white" fillOpacity="0.9" />
            {/* Simple smile + eyes */}
            <circle cx="83" cy="96" r="2.2" fill="var(--color-coral)" />
            <circle cx="97" cy="96" r="2.2" fill="var(--color-coral)" />
            <path d="M82 105 Q90 111 98 105" stroke="var(--color-coral)" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Arm raised, holding a key */}
            <path d="M104 130 Q128 118 138 96" stroke="white" strokeOpacity="0.85" strokeWidth="10" strokeLinecap="round" fill="none" />
            <g transform="translate(132,80) rotate(35)">
              <circle cx="0" cy="0" r="11" fill="none" stroke="var(--color-amber)" strokeWidth="5" />
              <rect x="8" y="-3" width="20" height="6" rx="2" fill="var(--color-amber)" />
              <rect x="24" y="3" width="5" height="7" fill="var(--color-amber)" />
            </g>
            {/* Floating shield/lock badges */}
            <g transform="translate(190,50)">
              <circle cx="0" cy="0" r="18" fill="white" fillOpacity="0.15" />
              <rect x="-7" y="-2" width="14" height="11" rx="2" fill="white" fillOpacity="0.7" />
              <path d="M-4 -2 v-4 a4 4 0 0 1 8 0 v4" stroke="white" strokeOpacity="0.7" strokeWidth="2.5" fill="none" />
            </g>
            <g transform="translate(35,55)">
              <circle cx="0" cy="0" r="13" fill="white" fillOpacity="0.12" />
              <path d="M0 -6 L4 -2 L4 6 L-4 6 L-4 -2 Z" fill="white" fillOpacity="0.6" />
            </g>
          </svg>
        </div>

        <div className="relative z-10">
          <p className="font-[var(--font-display)] text-3xl font-semibold leading-tight max-w-md">
            We've got your back — let's get you signed in again.
          </p>
          <p className="mt-4 text-white/70 max-w-sm text-sm leading-relaxed">
            Reset links expire after 30 minutes for your account's security.
          </p>
        </div>

        <p className="text-white/40 text-xs font-mono relative z-10">MediStock — Inventory Platform</p>
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

          {!submitted ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-amber-bg)] flex items-center justify-center text-[var(--color-amber)] mb-5">
                <KeyRound size={22} />
              </div>
              <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
                Reset your password
              </h1>
              <p className="text-sm text-[var(--color-ink-soft)] mt-1">
                Enter your email and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@pharmacy.com"
                    className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                  />
                </div>

                {error && (
                  <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold py-2.5 hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Send reset instructions"}
                </button>
              </form>
            </>
          ) : (
            <div className="mt-4 animate-scale-in">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] mb-4">
                <Mail size={24} />
              </div>
              <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
                Check your email
              </h1>
              <p className="text-sm text-[var(--color-ink-soft)] mt-2 leading-relaxed">
                If an account exists for <span className="font-semibold text-[var(--color-ink)]">{email}</span>, we've
                sent a link to reset your password. It's valid for 30 minutes.
              </p>
              <p className="text-xs text-[var(--color-ink-soft)] mt-3 leading-relaxed bg-[var(--color-mint)] rounded-lg px-3 py-2.5">
                Not configured with real email in this environment? Ask your admin to check the backend logs — the
                reset link is printed there for local/demo use.
              </p>
            </div>
          )}

          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-1.5 text-sm text-[var(--color-primary)] font-semibold hover:underline"
          >
            <ArrowLeft size={15} />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
