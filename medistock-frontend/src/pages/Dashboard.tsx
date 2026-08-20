import React, { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Medicine = {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  available: boolean;
};

type CartItem = Medicine & { quantity: number };

export default function UserDashboard() {
  const { user } = useAuth();

  const medicinesRef = useRef<HTMLDivElement | null>(null);
  const prescriptionsRef = useRef<HTMLDivElement | null>(null);
  const ordersRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [prescription, setPrescription] = useState<File | null>(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const medicines: Medicine[] = [
    { id: 1, name: "Paracetamol 500mg", category: "Pain Relief", description: "Used for fever and mild to moderate pain.", price: 45, available: true },
    { id: 2, name: "Azithromycin 500mg", category: "Antibiotic", description: "Antibiotic medicine available with prescription.", price: 120, available: true },
    { id: 3, name: "Cetirizine 10mg", category: "Allergy", description: "Helps relieve allergy and cold symptoms.", price: 35, available: true },
    { id: 4, name: "Omeprazole 20mg", category: "Digestive", description: "Helps reduce stomach acid and acidity.", price: 65, available: true },
    { id: 5, name: "Vitamin D3", category: "Vitamins", description: "Vitamin supplement for daily nutritional support.", price: 150, available: true },
    { id: 6, name: "Amoxicillin 500mg", category: "Antibiotic", description: "Prescription antibiotic medicine.", price: 95, available: true },
  ];

  const categories = ["All", "Pain Relief", "Antibiotic", "Allergy", "Digestive", "Vitamins"];

  const filteredMedicines = medicines.filter((m) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q);
    return matchesSearch && (category === "All" || m.category === category);
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const username = user?.username || "User";
  const initial = username.charAt(0).toUpperCase();

  const go = (ref: React.RefObject<HTMLDivElement | null>) =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const addToCart = (medicine: Medicine) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === medicine.id);
      if (existing) {
        return current.map((item) =>
          item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...medicine, quantity: 1 }];
    });
    setMessage("");
  };

  const changeQuantity = (id: number, delta: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const uploadPrescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPrescription(file);
    setPrescriptionPreview(URL.createObjectURL(file));
    setMessage("");
  };

  const placeOrder = () => {
    if (!cart.length && !prescription) {
      setMessage("Please add medicines or upload a prescription before placing an order.");
      return;
    }
    setMessage("Your order has been submitted successfully. The pharmacy will review it shortly.");
  };

  return (
    <div style={styles.app}>
      {/* SIDEBAR — intentionally matches the Pharmacist dashboard style */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          Medi<span>Stock</span>
        </div>

        <nav style={styles.nav}>
          <NavItem active label="Dashboard" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
          <NavItem label="Orders" onClick={() => go(ordersRef)} />
          <NavItem label="Prescriptions" onClick={() => go(prescriptionsRef)} />
          <NavItem label="Medicines" onClick={() => go(medicinesRef)} />
          <NavItem label="Cart" onClick={() => setShowCart(true)} />
          <NavItem label="Activity" onClick={() => go(ordersRef)} />
        </nav>

        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("authToken");
            window.location.href = "/login";
          }}
          style={styles.logout}
        >
          Logout
        </button>
      </aside>

      {/* MAIN AREA */}
      <div style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.pageSubtitle}>Manage your medicines, prescriptions and orders</p>
          </div>

          <div style={styles.profile}>
            <div style={styles.avatar}>{initial}</div>
            <div>
              <div style={styles.profileName}>{username}</div>
              <div style={styles.profileRole}>Customer</div>
            </div>
          </div>
        </header>

        <main style={styles.content}>
          {/* WELCOME CARD */}
          <section style={styles.welcomeCard}>
            <div>
              <h2 style={styles.welcomeTitle}>Welcome back, {username}</h2>
              <p style={styles.welcomeText}>
                Order medicines, upload prescriptions and track your orders from one place.
              </p>
            </div>

            <button type="button" onClick={() => go(medicinesRef)} style={styles.primaryButton}>
              Browse Medicines
            </button>
          </section>

          {/* SUMMARY */}
          <section style={styles.statsGrid}>
            <SummaryCard value={String(cartCount)} label="Cart Items" />
            <SummaryCard value="0" label="Active Orders" />
            <SummaryCard value="0" label="Completed Orders" />
            <SummaryCard value={prescription ? "1" : "0"} label="Prescriptions" />
          </section>

          {/* MEDICINE SECTION */}
          <div ref={medicinesRef} style={styles.anchor}>
            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>Medicine Store</h2>
                  <p style={styles.panelSubtitle}>Browse available medicines and add them to your order</p>
                </div>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search medicines..."
                  style={styles.search}
                />
              </div>

              <div style={styles.filters}>
                {categories.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setCategory(item)}
                    style={{
                      ...styles.filter,
                      ...(category === item ? styles.filterActive : {}),
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div style={styles.medicineGrid}>
                {filteredMedicines.map((medicine) => (
                  <div key={medicine.id} style={styles.medicineCard}>
                    <div style={styles.medicineTop}>
                      <div style={styles.medicineIcon}>💊</div>
                      <span style={styles.available}>IN STOCK</span>
                    </div>

                    <h3 style={styles.medicineName}>{medicine.name}</h3>
                    <div style={styles.medicineCategory}>{medicine.category}</div>
                    <p style={styles.medicineDescription}>{medicine.description}</p>

                    <div style={styles.medicineBottom}>
                      <strong style={styles.price}>₹{medicine.price}</strong>
                      <button
                        type="button"
                        onClick={() => addToCart(medicine)}
                        style={styles.smallButton}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* TWO PANELS */}
          <section style={styles.twoColumns}>
            {/* PRESCRIPTION */}
            <div ref={prescriptionsRef} style={{ ...styles.panel, ...styles.anchor }}>
              <h2 style={styles.panelTitle}>Prescriptions</h2>
              <p style={styles.panelSubtitle}>Upload a prescription for pharmacy review</p>

              {!prescription ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={styles.uploadBox}
                >
                  <div style={styles.uploadIcon}>📄</div>
                  <strong>Upload prescription</strong>
                  <span>JPG, JPEG or PNG</span>
                  <button type="button" style={styles.primaryButton}>
                    Choose File
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={uploadPrescription}
                    style={{ display: "none" }}
                  />
                </div>
              ) : (
                <div style={styles.uploaded}>
                  {prescriptionPreview && (
                    <img src={prescriptionPreview} alt="Prescription" style={styles.preview} />
                  )}
                  <strong>{prescription.name}</strong>
                  <button
                    type="button"
                    onClick={() => {
                      setPrescription(null);
                      setPrescriptionPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    style={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* ORDERS */}
            <div ref={ordersRef} style={{ ...styles.panel, ...styles.anchor }}>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>My Orders</h2>
                  <p style={styles.panelSubtitle}>Review your selected medicines</p>
                </div>

                <span style={styles.orderBadge}>{cartCount} ITEMS</span>
              </div>

              {cart.length === 0 ? (
                <div style={styles.empty}>
                  <div style={{ fontSize: 34 }}>🛒</div>
                  <strong>No active order</strong>
                  <span>Add medicines from the store to begin.</span>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.id} style={styles.orderRow}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>₹{item.price} each</span>
                      </div>

                      <div style={styles.quantity}>
                        <button type="button" onClick={() => changeQuantity(item.id, -1)} style={styles.qtyButton}>−</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => changeQuantity(item.id, 1)} style={styles.qtyButton}>+</button>
                      </div>
                    </div>
                  ))}

                  <div style={styles.total}>
                    <span>Total</span>
                    <strong>₹{cartTotal}</strong>
                  </div>
                </>
              )}

              <button type="button" onClick={placeOrder} style={styles.fullButton}>
                Submit Order
              </button>

              {message && <div style={styles.message}>{message}</div>}
            </div>
          </section>
        </main>
      </div>

      {/* CART */}
      {showCart && (
        <div style={styles.overlay} onClick={() => setShowCart(false)}>
          <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <div>
                <h2 style={{ margin: 0 }}>Cart</h2>
                <span style={styles.panelSubtitle}>{cartCount} item(s)</span>
              </div>
              <button type="button" onClick={() => setShowCart(false)} style={styles.close}>×</button>
            </div>

            {cart.length === 0 ? (
              <div style={styles.emptyDrawer}>🛒<p>Your cart is empty.</p></div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} style={styles.drawerRow}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                    <div style={styles.quantity}>
                      <button type="button" onClick={() => changeQuantity(item.id, -1)} style={styles.qtyButton}>−</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => changeQuantity(item.id, 1)} style={styles.qtyButton}>+</button>
                    </div>
                  </div>
                ))}

                <div style={styles.drawerTotal}>
                  <span>Total</span>
                  <strong>₹{cartTotal}</strong>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowCart(false);
                    placeOrder();
                  }}
                  style={styles.fullButton}
                >
                  Place Order
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.navItem,
        ...(active ? styles.navItemActive : {}),
      }}
    >
      {label}
    </button>
  );
}

function SummaryCard({ value, label }: { value: string; label: string }) {
  return (
    <div style={styles.summaryCard}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: "100vh",
    background: "#f7f9fc",
    color: "#172033",
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  sidebar: {
    position: "fixed",
    inset: "0 auto 0 0",
    width: "342px",
    background: "#ffffff",
    borderRight: "1px solid #e3e8ef",
    padding: "34px 24px 26px",
    boxSizing: "border-box",
    zIndex: 20,
  },

  logo: {
    fontSize: "38px",
    lineHeight: 1,
    fontWeight: 850,
    letterSpacing: "-1.7px",
    padding: "0 16px",
    marginBottom: "62px",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  navItem: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#63748c",
    borderRadius: "14px",
    padding: "17px 21px",
    textAlign: "left",
    fontSize: "22px",
    fontWeight: 700,
    cursor: "pointer",
  },

  navItemActive: {
    background: "#edf4ff",
    color: "#2563eb",
    borderLeft: "4px solid #2563eb",
    paddingLeft: "17px",
  },

  logout: {
    position: "absolute",
    left: "24px",
    right: "24px",
    bottom: "26px",
    height: "59px",
    border: "none",
    background: "#fff0f1",
    color: "#e1262f",
    borderRadius: "13px",
    fontSize: "19px",
    fontWeight: 800,
    cursor: "pointer",
  },

  main: {
    marginLeft: "342px",
    minHeight: "100vh",
  },

  header: {
    minHeight: "145px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "28px 52px",
    boxSizing: "border-box",
  },

  pageTitle: {
    margin: 0,
    fontSize: "42px",
    lineHeight: 1.1,
    letterSpacing: "-1px",
  },

  pageSubtitle: {
    margin: "8px 0 0",
    color: "#667b96",
    fontSize: "19px",
  },

  profile: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  avatar: {
    width: "67px",
    height: "67px",
    borderRadius: "50%",
    background: "#2867e8",
    color: "#ffffff",
    display: "grid",
    placeItems: "center",
    fontSize: "29px",
    fontWeight: 800,
  },

  profileName: {
    fontSize: "19px",
    fontWeight: 800,
  },

  profileRole: {
    color: "#8a9bb0",
    fontSize: "17px",
    marginTop: "3px",
  },

  content: {
    padding: "5px 52px 55px",
    maxWidth: "1370px",
  },

  welcomeCard: {
    background: "#ffffff",
    border: "1px solid #e0e7ef",
    borderRadius: "18px",
    padding: "28px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "18px",
  },

  welcomeTitle: {
    margin: 0,
    fontSize: "28px",
  },

  welcomeText: {
    color: "#667b96",
    fontSize: "15px",
    margin: "8px 0 0",
  },

  primaryButton: {
    border: "none",
    background: "#2867e8",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "12px 18px",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
    marginBottom: "20px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e0e7ef",
    borderRadius: "14px",
    padding: "19px 22px",
  },

  panel: {
    background: "#ffffff",
    border: "1px solid #e0e7ef",
    borderRadius: "17px",
    padding: "28px 30px",
    marginBottom: "20px",
  },

  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap",
  },

  panelTitle: {
    margin: 0,
    fontSize: "25px",
  },

  panelSubtitle: {
    color: "#667b96",
    fontSize: "15px",
    margin: "5px 0 0",
  },

  search: {
    width: "330px",
    maxWidth: "100%",
    padding: "12px 14px",
    border: "1px solid #d9e1eb",
    borderRadius: "9px",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    margin: "22px 0",
  },

  filter: {
    border: "1px solid #d8e1ec",
    background: "#ffffff",
    color: "#64758d",
    borderRadius: "20px",
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: 650,
  },

  filterActive: {
    borderColor: "#2867e8",
    background: "#edf4ff",
    color: "#2867e8",
  },

  medicineGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "14px",
  },

  medicineCard: {
    border: "1px solid #e0e7ef",
    borderRadius: "13px",
    padding: "18px",
    background: "#ffffff",
  },

  medicineTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  medicineIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    background: "#edf4ff",
    display: "grid",
    placeItems: "center",
    fontSize: "22px",
  },

  available: {
    color: "#087e58",
    background: "#e9fbf3",
    padding: "5px 8px",
    borderRadius: "14px",
    fontSize: "10px",
    fontWeight: 800,
  },

  medicineName: {
    margin: "15px 0 5px",
    fontSize: "17px",
  },

  medicineCategory: {
    color: "#2867e8",
    fontWeight: 750,
    fontSize: "12px",
  },

  medicineDescription: {
    color: "#7789a0",
    fontSize: "12px",
    lineHeight: 1.5,
    minHeight: "36px",
  },

  medicineBottom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "15px",
  },

  price: {
    fontSize: "19px",
  },

  smallButton: {
    border: "none",
    background: "#2867e8",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "9px 14px",
    cursor: "pointer",
    fontWeight: 800,
  },

  twoColumns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },

  anchor: {
    scrollMarginTop: "20px",
  },

  uploadBox: {
    marginTop: "22px",
    border: "1px dashed #b9c7d8",
    borderRadius: "13px",
    background: "#fbfcfe",
    minHeight: "190px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
    color: "#5f7189",
  },

  uploadIcon: {
    fontSize: "35px",
  },

  uploaded: {
    marginTop: "22px",
    border: "1px solid #dce4ed",
    borderRadius: "12px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "9px",
  },

  preview: {
    width: "100%",
    height: "130px",
    objectFit: "cover",
    borderRadius: "9px",
  },

  removeButton: {
    width: "fit-content",
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#dc2626",
    borderRadius: "7px",
    padding: "7px 11px",
    cursor: "pointer",
    fontWeight: 700,
  },

  orderBadge: {
    background: "#edf4ff",
    color: "#2867e8",
    padding: "7px 10px",
    borderRadius: "14px",
    fontSize: "10px",
    fontWeight: 800,
  },

  empty: {
    minHeight: "170px",
    border: "1px dashed #ccd6e3",
    borderRadius: "12px",
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    color: "#71849b",
    fontSize: "13px",
  },

  orderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    padding: "14px 0",
    borderBottom: "1px solid #edf0f4",
  },

  quantity: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  qtyButton: {
    width: "29px",
    height: "29px",
    border: "1px solid #d8e1eb",
    background: "#ffffff",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: 800,
  },

  total: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "20px",
    marginTop: "18px",
  },

  fullButton: {
    width: "100%",
    border: "none",
    background: "#2867e8",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "12px",
    marginTop: "17px",
    cursor: "pointer",
    fontWeight: 800,
  },

  message: {
    marginTop: "12px",
    background: "#edf4ff",
    color: "#1d55c4",
    border: "1px solid #c8dcff",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "12px",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,.42)",
    zIndex: 100,
  },

  drawer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "420px",
    maxWidth: "92%",
    background: "#ffffff",
    padding: "26px",
    boxSizing: "border-box",
    overflowY: "auto",
  },

  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "17px",
    borderBottom: "1px solid #edf0f4",
  },

  close: {
    width: "34px",
    height: "34px",
    border: "none",
    borderRadius: "8px",
    background: "#f1f4f8",
    fontSize: "22px",
    cursor: "pointer",
  },

  emptyDrawer: {
    textAlign: "center",
    padding: "80px 10px",
    color: "#8798ad",
    fontSize: "35px",
  },

  drawerRow: {
    padding: "16px 0",
    borderBottom: "1px solid #edf0f4",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },

  drawerTotal: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "24px",
    fontSize: "20px",
  },
};
