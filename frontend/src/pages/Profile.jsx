import { useEffect, useState } from "react";
import { User as UserIcon, Save, KeyRound, Truck } from "lucide-react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/profile")
      .then((res) => { setProfile(res.data); setFullName(res.data.fullName); })
      .catch(() => setProfileErr("Could not load your profile. Is the backend running?"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileErr(""); setProfileMsg("");
    setSavingProfile(true);
    try {
      const { data } = await api.put("/profile", { fullName });
      setProfile(data);
      // Keep the sidebar / stored session in sync with the new name.
      const stored = JSON.parse(localStorage.getItem("medistock_user") || "{}");
      localStorage.setItem("medistock_user", JSON.stringify({ ...stored, fullName: data.fullName }));
      setProfileMsg("Profile updated.");
    } catch (err) {
      setProfileErr(err.response?.data?.error || "Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordErr(""); setPasswordMsg("");
    if (newPassword.length < 6) { setPasswordErr("New password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setPasswordErr("New passwords don't match."); return; }
    setSavingPassword(true);
    try {
      await api.post("/profile/change-password", { currentPassword, newPassword });
      setPasswordMsg("Password changed.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setPasswordErr(err.response?.data?.error || "Could not change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">My profile</h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">Manage your account details and password.</p>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
        ) : !profile ? (
          <p className="text-sm text-[var(--color-coral)]">{profileErr}</p>
        ) : (
          <>
            <section className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                  <UserIcon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">Account details</p>
                  <p className="text-xs text-[var(--color-ink-soft)]">
                    {profile.role}{profile.role === "SUPPLIER" && profile.supplierId ? ` · Supplier #${profile.supplierId}` : ""}
                    {!profile.active && " · Deactivated"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">Full name</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">Email</label>
                  <input
                    value={profile.email}
                    disabled
                    className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-canvas)] px-3.5 py-2.5 text-sm text-[var(--color-ink-soft)]"
                  />
                </div>

                {profileErr && <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-3 py-2">{profileErr}</p>}
                {profileMsg && <p className="text-sm text-[var(--color-primary)] bg-[var(--color-primary)]/10 rounded-lg px-3 py-2">{profileMsg}</p>}

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
                >
                  <Save size={16} /> {savingProfile ? "Saving…" : "Save changes"}
                </button>
              </form>
            </section>

            <section className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                  <KeyRound size={18} />
                </div>
                <p className="text-sm font-semibold text-[var(--color-ink)]">Change password</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">Current password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">New password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">Confirm new password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                {passwordErr && <p className="text-sm text-[var(--color-coral)] bg-[var(--color-coral-bg)] rounded-lg px-3 py-2">{passwordErr}</p>}
                {passwordMsg && <p className="text-sm text-[var(--color-primary)] bg-[var(--color-primary)]/10 rounded-lg px-3 py-2">{passwordMsg}</p>}

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
                >
                  <KeyRound size={16} /> {savingPassword ? "Updating…" : "Update password"}
                </button>
              </form>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
