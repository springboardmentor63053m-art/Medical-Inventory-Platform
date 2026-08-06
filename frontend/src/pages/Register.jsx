import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Cross, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "PHARMACIST" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.error || "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-canvas)] p-8">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white">
            <Cross size={18} />
          </div>
          <span className="font-[var(--font-display)] font-semibold text-lg text-[var(--color-ink)]">MediStock</span>
        </div>

        <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Create your account</h1>
        <p className="text-sm text-[var(--color-ink-soft)] mt-1">Set up access for your pharmacy team.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">Full name</label>
            <input
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Asha Patil"
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@pharmacy.com"
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
            >
              <option value="ADMIN">Admin</option>
              <option value="PHARMACIST">Pharmacist</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold py-2.5 hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-sm text-[var(--color-ink-soft)] mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-[var(--color-primary)] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
