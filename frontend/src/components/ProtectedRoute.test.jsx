import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

// Mock the auth hook directly rather than wrapping in a real AuthProvider —
// this lets each test control exactly which user (or none) is "signed in"
// without going through localStorage/login API calls.
vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

function renderProtected(roles, atPath = "/protected") {
  return render(
    <MemoryRouter initialEntries={[atPath]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/" element={<div>Home / role redirect page</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute roles={roles}>
              <div>Protected content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("redirects to /login when no user is signed in", () => {
    useAuth.mockReturnValue({ user: null });
    renderProtected(["ADMIN"]);
    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders the protected content when the user's role is allowed", () => {
    useAuth.mockReturnValue({ user: { role: "ADMIN" } });
    renderProtected(["ADMIN"]);
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("redirects an unauthorized role to /", () => {
    // e.g. a STAFF user trying to reach an ADMIN-only route (Admin dashboard,
    // User Management, Stock Movements) never sees the content.
    useAuth.mockReturnValue({ user: { role: "STAFF" } });
    renderProtected(["ADMIN"]);
    expect(screen.getByText("Home / role redirect page")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("allows access when no roles restriction is given", () => {
    useAuth.mockReturnValue({ user: { role: "STAFF" } });
    renderProtected(undefined);
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it.each(["ADMIN", "PHARMACIST", "STAFF", "SUPPLIER"])(
    "allows a %s user through a route that permits their own role",
    (role) => {
      useAuth.mockReturnValue({ user: { role } });
      renderProtected(["ADMIN", "PHARMACIST", "STAFF", "SUPPLIER"]);
      expect(screen.getByText("Protected content")).toBeInTheDocument();
    }
  );

  it("blocks a SUPPLIER from an internal-only route (e.g. Medicines, Reports)", () => {
    useAuth.mockReturnValue({ user: { role: "SUPPLIER" } });
    renderProtected(["ADMIN", "PHARMACIST", "STAFF"]);
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(screen.getByText("Home / role redirect page")).toBeInTheDocument();
  });
});
