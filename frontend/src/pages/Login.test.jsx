import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "./Login";
import { useAuth } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import api from "../api/axios";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../api/axios", () => ({
  default: { get: vi.fn() },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

function renderLogin() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <Login />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe("Login page", () => {
  let login;

  beforeEach(() => {
    login = vi.fn().mockResolvedValue({ role: "STAFF" });
    useAuth.mockReturnValue({ login });
    api.get.mockResolvedValue({ data: { googleEnabled: false } });
    localStorage.clear();
  });

  it("renders email and password fields and a sign-in button", () => {
    renderLogin();
    expect(screen.getByPlaceholderText("you@pharmacy.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("calls login with the entered credentials on submit", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText("you@pharmacy.com"), "staff@medistock.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(login).toHaveBeenCalledWith("staff@medistock.com", "password123"));
  });

  it("shows the backend error message when login fails", async () => {
    login.mockRejectedValue({ response: { data: { error: "Invalid email or password" } } });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText("you@pharmacy.com"), "wrong@medistock.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "wrongpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
  });

  it("falls back to a generic error message when the backend gives no details", async () => {
    login.mockRejectedValue(new Error("network error"));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText("you@pharmacy.com"), "staff@medistock.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
  });

  it("does not show the Google login option when the backend has it disabled", async () => {
    renderLogin();
    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/auth/oauth2-status"));
    expect(screen.queryByText("Continue with Google")).not.toBeInTheDocument();
  });

  it("shows the Google login option when the backend has it enabled", async () => {
    api.get.mockResolvedValue({ data: { googleEnabled: true } });
    renderLogin();
    expect(await screen.findByText("Continue with Google")).toBeInTheDocument();
  });

  it("remembers the email in localStorage only when 'Remember me' is checked", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText("you@pharmacy.com"), "staff@medistock.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("checkbox", { name: /remember me/i }));
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(localStorage.getItem("medistock_remember_email")).toBe("staff@medistock.com")
    );
  });
});
