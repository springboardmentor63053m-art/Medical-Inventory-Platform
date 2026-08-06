import { useState } from "react";
import { Link } from "react-router-dom";
import { Cross, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
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

        {!submitted ? (
          <>
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
              Reset your password
            </h1>
            <p className="text-sm text-[var(--color-ink-soft)] mt-1">
              Enter your email and an admin will help you regain access.
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
                  className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold py-2.5 hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                Send reset instructions
              </button>
            </form>
          </>
        ) : (
          <div className="mt-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] mb-4">
              <Mail size={22} />
            </div>
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
              Check with your admin
            </h1>
            <p className="text-sm text-[var(--color-ink-soft)] mt-2 leading-relaxed">
              Password resets are currently handled by your system administrator.
              Please reach out to them with the email <span className="font-semibold text-[var(--color-ink)]">{email}</span> to
              regain access to your account.
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
  );
}
