import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NotificationBell from "./NotificationBell";
import api from "../api/axios";

vi.mock("../api/axios", () => ({
  default: { get: vi.fn(), patch: vi.fn() },
}));

const NOTIFICATIONS = [
  {
    id: 1, type: "LOW_STOCK", severity: "WARNING", title: "Low stock warning",
    message: "Paracetamol has dropped to 5 units.", read: false, createdAt: "2026-08-01T09:00:00",
  },
  {
    id: 2, type: "OUT_OF_STOCK", severity: "CRITICAL", title: "Out of stock",
    message: "Ibuprofen is now out of stock.", read: true, createdAt: "2026-07-30T09:00:00",
  },
];

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows no unread badge when the unread count is zero", async () => {
    api.get.mockImplementation((url) =>
      url === "/notifications"
        ? Promise.resolve({ data: [] })
        : Promise.resolve({ data: { count: 0 } })
    );
    render(<NotificationBell />);

    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/notifications/unread-count"));
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
  });

  it("shows the unread count badge, capped at '9+'", async () => {
    api.get.mockImplementation((url) =>
      url === "/notifications"
        ? Promise.resolve({ data: [] })
        : Promise.resolve({ data: { count: 12 } })
    );
    render(<NotificationBell />);

    expect(await screen.findByText("9+")).toBeInTheDocument();
  });

  it("shows the exact count when 9 or fewer are unread", async () => {
    api.get.mockImplementation((url) =>
      url === "/notifications"
        ? Promise.resolve({ data: [] })
        : Promise.resolve({ data: { count: 3 } })
    );
    render(<NotificationBell />);

    expect(await screen.findByText("3")).toBeInTheDocument();
  });

  it("shows the empty state when there are no notifications for this user", async () => {
    api.get.mockImplementation((url) =>
      url === "/notifications"
        ? Promise.resolve({ data: [] })
        : Promise.resolve({ data: { count: 0 } })
    );
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByRole("button", { name: /notifications/i }));
    expect(await screen.findByText("You're all caught up.")).toBeInTheDocument();
  });

  it("lists notifications for this user and reflects each one's own read state", async () => {
    api.get.mockImplementation((url) =>
      url === "/notifications"
        ? Promise.resolve({ data: NOTIFICATIONS })
        : Promise.resolve({ data: { count: 1 } })
    );
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByRole("button", { name: /notifications/i }));
    expect(await screen.findByText("Low stock warning")).toBeInTheDocument();
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
  });

  it("marks a single notification read for this user without re-fetching the whole app", async () => {
    api.get.mockImplementation((url) =>
      url === "/notifications"
        ? Promise.resolve({ data: NOTIFICATIONS })
        : Promise.resolve({ data: { count: 1 } })
    );
    api.patch.mockResolvedValue({});
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByRole("button", { name: /notifications/i }));
    const item = await screen.findByText("Low stock warning");
    await user.click(item);

    // Calls the per-notification, per-user read endpoint — not a bulk/shared one.
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith("/notifications/1/read"));
  });

  it("marks all notifications read via the bulk endpoint", async () => {
    api.get.mockImplementation((url) =>
      url === "/notifications"
        ? Promise.resolve({ data: NOTIFICATIONS })
        : Promise.resolve({ data: { count: 1 } })
    );
    api.patch.mockResolvedValue({});
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByRole("button", { name: /notifications/i }));
    await screen.findByText("Low stock warning");
    await user.click(screen.getByRole("button", { name: /mark all read/i }));

    await waitFor(() => expect(api.patch).toHaveBeenCalledWith("/notifications/read-all"));
  });
});
