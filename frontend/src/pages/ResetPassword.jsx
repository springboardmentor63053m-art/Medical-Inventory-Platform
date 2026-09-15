import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Cross, ArrowLeft, CheckCircle2 } from "lucide-react";
import api from "../api/axios";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "This reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-canvas)] p-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white">
            <Cross size={18} />
          </div>
          <span className="font-[var(--font-display)] font-semibold text-lg text-[var(--color-ink)]">MediStock</span>
        </div>

        {!token ? (
          <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-3 py-2">
            This reset link is missing its token. Please use the link from your email, or request a new one.
          </p>
        ) : done ? (
          <div className="mt-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] mb-4">
              <CheckCircle2 size={22} />
            </div>
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
              Password updated
            </h1>
            <p className="text-sm text-[var(--color-ink-soft)] mt-2">Redirecting you to sign in…</p>
          </div>
        ) : (
          <>
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
              Choose a new password
            </h1>
            <p className="text-sm text-[var(--color-ink-soft)] mt-1">At least 6 characters.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
                  New password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
                  Confirm new password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          </>
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
  );
}
