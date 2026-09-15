import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("medistock_user");
    return raw ? JSON.parse(raw) : null;
  });

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("medistock_token", data.token);
    localStorage.setItem("medistock_user", JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  // Used by the OAuth2 (Google) callback: the backend redirect only carries
  // a bare JWT, so we store it first, then hydrate the rest of the profile
  // from /auth/me the same way a normal login response would.
  const loginWithToken = useCallback(async (token) => {
    localStorage.setItem("medistock_token", token);
    const { data } = await api.get("/auth/me");
    const full = { ...data, token };
    localStorage.setItem("medistock_user", JSON.stringify(full));
    setUser(full);
    return full;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("medistock_token", data.token);
    localStorage.setItem("medistock_user", JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    // Best-effort: tell the backend this session ended (marks OFFLINE right
    // away in the Active Users panel instead of waiting for the inactivity
    // timeout). Never block the client-side logout on this.
    api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("medistock_token");
    localStorage.removeItem("medistock_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, loginWithToken, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
