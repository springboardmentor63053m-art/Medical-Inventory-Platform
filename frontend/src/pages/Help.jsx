import { useState } from "react";
import {
  HelpCircle, LayoutDashboard, Pill, ShoppingCart, Receipt, Truck,
  Bell, Sun, ChevronDown, LifeBuoy, Mail,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

function Section({ icon: Icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="label-card overflow-hidden animate-fade-up">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-mint)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
            <Icon size={17} />
          </div>
          <h2 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">{title}</h2>
        </div>
        <ChevronDown size={18} className={`text-[var(--color-ink-soft)] shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 -mt-1 text-sm text-[var(--color-ink-soft)] leading-relaxed space-y-2.5">
          {children}
        </div>
      )}
    </div>
  );
}

const ROLE_TOPICS = {
  ADMIN: [
    {
      icon: ShoppingCart, title: "How purchase orders work", defaultOpen: true, body: (
        <>
          <p>Placing an order never changes stock by itself. The flow is:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>You or a Pharmacist create a purchase order for a supplier — status starts as <b>Pending</b>.</li>
            <li>The supplier logs into their own account and accepts or rejects it.</li>
            <li>Once accepted, the supplier marks it <b>Dispatched</b> when it ships.</li>
            <li>You mark it <b>Received</b> on the Purchases page — <b>this is the only step that actually increases stock.</b></li>
          </ol>
        </>
      )
    },
    { icon: Pill, title: "Managing medicines", body: <p>Add, edit, or deactivate medicines from the Medicines page. Deleting a medicine that already has sales/purchase history deactivates it instead of removing it, so past bills and reports stay accurate. Add a photo URL when editing a medicine to replace its default icon with a real product photo — click any thumbnail to see it enlarged.</p> },
    { icon: Truck, title: "Supplier accounts", body: <p>Add a supplier's business details on the Suppliers page first, then use the key icon on that supplier's card to create their login (a unique email + password you set). Each supplier can only ever see their own medicines, orders, and history.</p> },
  ],
  PHARMACIST: [
    { icon: ShoppingCart, title: "Placing purchase orders", defaultOpen: true, body: <p>You can create purchase orders the same way Admin does — the supplier accepts/rejects and dispatches it, then Admin marks it received (that's the step that updates stock). You can cancel an order you placed before it's received.</p> },
    { icon: Pill, title: "Recording a sale", body: <p>Use "New sale" to bill a customer — pick medicines, quantities, and it totals automatically. Stock is checked and reduced immediately; the app won't let a sale push any medicine below zero.</p> },
  ],
  STAFF: [
    { icon: Pill, title: "Recording a sale", defaultOpen: true, body: <p>Use "New sale" to bill a customer. Pick each medicine and quantity — the system prevents selling more than what's in stock.</p> },
    { icon: Receipt, title: "What you can and can't see", body: <p>Your account is scoped to selling and viewing medicines/sales history. Purchases and the supplier directory are managed by Admin/Pharmacist and aren't part of your account.</p> },
  ],
  SUPPLIER: [
    {
      icon: ShoppingCart, title: "Responding to orders", defaultOpen: true, body: (
        <>
          <p>Orders placed with you appear on your dashboard as <b>Pending</b>. For each one:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li><b>Accept</b> it if you can fulfil it, or <b>Reject</b> if you can't.</li>
            <li>Once accepted, click <b>Mark dispatched</b> once you've shipped it.</li>
            <li>The pharmacy marks it received on their end — that's when it leaves your open-orders list as complete.</li>
          </ol>
        </>
      )
    },
    { icon: Bell, title: "Your data is private", body: <p>You only ever see your own medicines, orders, and history — never another supplier's or the pharmacy's internal data.</p> },
  ],
};

export default function Help() {
  const { user } = useAuth();
  const roleTopics = ROLE_TOPICS[user?.role] || ROLE_TOPICS.STAFF;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-[var(--color-mint)] flex items-center justify-center text-[var(--color-primary)]">
            <HelpCircle size={22} />
          </div>
          <div>
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">Help &amp; guide</h1>
            <p className="text-sm text-[var(--color-ink-soft)]">Quick answers for your role — {user?.role?.charAt(0)}{user?.role?.slice(1).toLowerCase()}</p>
          </div>
        </div>

        <div className="space-y-3 mt-8">
          {roleTopics.map((t) => (
            <Section key={t.title} icon={t.icon} title={t.title} defaultOpen={t.defaultOpen}>
              {t.body}
            </Section>
          ))}

          <Section icon={Sun} title="Light &amp; dark mode">
            <p>Toggle the sun/moon button at the bottom of the sidebar to switch themes any time — your choice is remembered on this device.</p>
          </Section>

          <Section icon={LayoutDashboard} title="Notifications">
            <p>The bell icon in the sidebar shows low-stock, expiry, and purchase-order alerts relevant to your role. Click any notification to mark it read, or "Mark all read" to clear the badge.</p>
          </Section>
        </div>

        <div className="label-card p-5 mt-6 flex items-start gap-4 animate-fade-up">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-amber-bg)] flex items-center justify-center text-[var(--color-amber)] shrink-0">
            <LifeBuoy size={18} />
          </div>
          <div>
            <p className="font-semibold text-[var(--color-ink)] text-sm">Still stuck?</p>
            <p className="text-sm text-[var(--color-ink-soft)] mt-1 flex items-center gap-1.5">
              <Mail size={13} /> Reach out to your MediStock administrator for account or access issues.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
