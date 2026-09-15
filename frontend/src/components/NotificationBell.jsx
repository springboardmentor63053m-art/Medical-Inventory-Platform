import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, AlertTriangle, XCircle, Clock3, ShoppingCart, Info, CheckCheck } from "lucide-react";
import api from "../api/axios";

const iconFor = (type) => {
  switch (type) {
    case "LOW_STOCK": return AlertTriangle;
    case "OUT_OF_STOCK": return XCircle;
    case "EXPIRY_ALERT": return Clock3;
    case "PURCHASE_ALERT": return ShoppingCart;
    default: return Info;
  }
};

const colorFor = (severity) => {
  if (severity === "CRITICAL") return "var(--color-coral)";
  if (severity === "WARNING") return "var(--color-amber)";
  return "var(--color-primary)";
};

const PANEL_WIDTH = 384; // px, matches w-96
const VIEWPORT_MARGIN = 16;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const load = () => {
    api.get("/notifications").then((res) => setNotifications(res.data)).catch(() => {});
    api.get("/notifications/unread-count").then((res) => setUnreadCount(res.data.count)).catch(() => {});
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Recompute a viewport-safe position every time the panel opens (and on resize),
  // so it always renders fully on-screen instead of overflowing past the sidebar
  // edge or the bottom/right of the browser window.
  useEffect(() => {
    if (!open) return;

    const computePosition = () => {
      const btn = buttonRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const maxLeft = window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN;
      const left = Math.max(VIEWPORT_MARGIN, Math.min(rect.right + 8, maxLeft));
      const maxHeight = window.innerHeight - rect.top - VIEWPORT_MARGIN;
      setPosition({ top: rect.top, left, maxHeight: Math.max(240, maxHeight) });
    };

    computePosition();
    window.addEventListener("resize", computePosition);
    window.addEventListener("scroll", computePosition, true);
    return () => {
      window.removeEventListener("resize", computePosition);
      window.removeEventListener("scroll", computePosition, true);
    };
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    load();
  };

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    load();
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Bell size={18} />
        Notifications
        {unreadCount > 0 && (
          <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-coral)] text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && position && createPortal(
        <div
          ref={panelRef}
          style={{ position: "fixed", top: position.top, left: position.left, width: PANEL_WIDTH, maxHeight: position.maxHeight }}
          className="overflow-y-auto bg-[var(--color-surface)] rounded-xl border border-[var(--color-line)] shadow-2xl z-[100] animate-fade-up"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-line)] sticky top-0 bg-[var(--color-surface)]">
            <p className="font-semibold text-sm text-[var(--color-ink)]">Notifications</p>
            <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline">
              <CheckCheck size={13} /> Mark all read
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-soft)] px-4 py-8 text-center">You're all caught up.</p>
          ) : (
            notifications.map((n) => {
              const Icon = iconFor(n.type);
              return (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full text-left flex gap-3 px-4 py-3 border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-canvas)] ${!n.read ? "bg-[var(--color-mint)]/40" : ""}`}
                >
                  <div className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center" style={{ background: colorFor(n.severity) + "20" }}>
                    <Icon size={14} style={{ color: colorFor(n.severity) }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-ink)] truncate">{n.title}</p>
                    <p className="text-xs text-[var(--color-ink-soft)] mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-[var(--color-ink-soft)] mt-1 font-mono">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
