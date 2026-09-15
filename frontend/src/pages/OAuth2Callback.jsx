import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Cross } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("No token received from Google sign-in.");
      return;
    }
    loginWithToken(token)
      .then(() => navigate("/"))
      .catch(() => setError("Could not complete Google sign-in. Please try again."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-canvas)]">
      <div className="text-center">
        <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white mx-auto mb-4">
          <Cross size={20} />
        </div>
        {error ? (
          <>
            <p className="text-sm text-[var(--color-coral)]">{error}</p>
            <a href="/login" className="text-sm text-[var(--color-primary)] font-semibold hover:underline mt-2 inline-block">
              Back to sign in
            </a>
          </>
        ) : (
          <p className="text-sm text-[var(--color-ink-soft)]">Signing you in…</p>
        )}
      </div>
    </div>
  );
}
