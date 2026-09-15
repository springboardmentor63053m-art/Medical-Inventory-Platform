import React, { useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/api/axios";
import { toast } from "sonner";
import { addPharmacistOrder, addPharmacistActivity } from "../Pharmacist/pharmacistData";

type Medicine = {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  available: boolean;
};

type CartItem = Medicine & {
  quantity: number;
};

export default function UserDashboard() {
  const { user, logout } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [cart, setCart] = useState<CartItem[]>([]);

  const [prescription, setPrescription] =
    useState<File | null>(null);

  const [prescriptionPreview, setPrescriptionPreview] =
    useState<string | null>(null);

  const [showCart, setShowCart] = useState(false);

  const [orderMessage, setOrderMessage] =
    useState("");

  const medicines: Medicine[] = [
    {
      id: 1,
      name: "Paracetamol 500mg",
      category: "Pain Relief",
      description:
        "Used for fever and mild to moderate pain.",
      price: 45,
      available: true,
    },
    {
      id: 2,
      name: "Azithromycin 500mg",
      category: "Antibiotic",
      description:
        "Antibiotic medicine available with prescription.",
      price: 120,
      available: true,
    },
    {
      id: 3,
      name: "Cetirizine 10mg",
      category: "Allergy",
      description:
        "Helps relieve allergy and cold symptoms.",
      price: 35,
      available: true,
    },
    {
      id: 4,
      name: "Omeprazole 20mg",
      category: "Digestive",
      description:
        "Helps reduce stomach acid and acidity.",
      price: 65,
      available: true,
    },
    {
      id: 5,
      name: "Vitamin D3",
      category: "Vitamins",
      description:
        "Vitamin supplement for daily nutritional support.",
      price: 150,
      available: true,
    },
    {
      id: 6,
      name: "Amoxicillin 500mg",
      category: "Antibiotic",
      description:
        "Prescription antibiotic medicine.",
      price: 95,
      available: true,
    },
  ];

  const categories = [
    "All",
    "Pain Relief",
    "Antibiotic",
    "Allergy",
    "Digestive",
    "Vitamins",
  ];

  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch =
      medicine.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      medicine.category
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      medicine.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const addToCart = (medicine: Medicine) => {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === medicine.id
      );

      if (existing) {
        return currentCart.map((item) =>
          item.id === medicine.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...medicine,
          quantity: 1,
        },
      ];
    });

    setOrderMessage("");
  };

  const decreaseQuantity = (id: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const increaseQuantity = (id: number) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const handlePrescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPrescription(file);

    const previewUrl = URL.createObjectURL(file);

    setPrescriptionPreview(previewUrl);

    setOrderMessage("");
  };

  const removePrescription = () => {
    setPrescription(null);
    setPrescriptionPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const placeOrder = async () => {
    if (cart.length === 0 && !prescription) {
      setOrderMessage(
        "Please add medicines or upload a prescription before placing an order."
      );
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");
      let currentUser = user;
      if (!currentUser && storedUser) {
        try {
          currentUser = JSON.parse(storedUser);
        } catch {
          // fallback
        }
      }

      const userName =
        (currentUser as any)?.name ||
        currentUser?.username ||
        (currentUser as any)?.fullName ||
        localStorage.getItem("username") ||
        "Customer";

      const userId = currentUser?.id ? `USR-${currentUser.id}` : "USR-001";
      const orderIdNum = Math.floor(1000 + Math.random() * 9000);
      const orderId = `ORD-${orderIdNum}`;

      const cartSummary =
        cart.length > 0
          ? cart.map((i) => `${i.name} (x${i.quantity})`).join(", ")
          : prescription
          ? "Prescription Upload"
          : "Medicine Order";

      const orderObj = {
        id: orderId,
        customerName: userName,
        customerId: userId,
        medicines: cart.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        prescription: Boolean(prescription),
        prescriptionName: prescription ? prescription.name : undefined,
        status: "PENDING" as const,
        createdAt: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      addPharmacistOrder(orderObj);

      addPharmacistActivity({
        type: "ORDER",
        message: `New medicine order #${orderId} placed by ${userName}`,
        time: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      const hasPrescription = Boolean(prescription);
      const prescriptionText = hasPrescription
        ? "with prescription"
        : "without prescription";

      const message = `New medicine order received ${prescriptionText} from ${userName}. Order ID: #${orderId}. Items: ${cartSummary}. Please review the order.`;

      await axiosInstance.post("/notifications", {
        title: "New Medicine Order",
        type: hasPrescription ? "PRESCRIPTION_ORDER" : "NEW_ORDER",
        message: message,
        isRead: false,
      });

      toast.success(`Order #${orderId} placed successfully! Pharmacist notified.`);
      setCart([]);
      setPrescription(null);
      setOrderMessage(
        `Your order #${orderId} has been submitted successfully. The pharmacy will review it shortly.`
      );
    } catch (err) {
      console.error("Failed to submit order notification:", err);
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f8fc",
        color: "#172033",
      }}
    >
      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <header
        style={{
          height: "72px",
          background: "#ffffff",
          borderBottom: "1px solid #e5eaf2",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg,#2563eb,#1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "22px",
            }}
          >
            💊
          </div>

          <div>
            <div
              style={{
                fontSize: "21px",
                fontWeight: 800,
                color: "#172033",
              }}
            >
              MediStock
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "#718096",
              }}
            >
              Healthcare Marketplace
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "25px",
          }}
        >
          <button
            onClick={() => setShowCart(true)}
            style={{
              border: "1px solid #dbe3ef",
              background: "#ffffff",
              borderRadius: "10px",
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: 600,
              color: "#1d4ed8",
            }}
          >
            🛒 Cart ({cartCount})
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "#e8efff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563eb",
                fontWeight: 700,
              }}
            >
              {(user?.username || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                {user?.username || "User"}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#718096",
                }}
              >
                Customer
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to log out?")) {
                  logout();
                }
              }}
              title="Log out of your account"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                border: "1px solid #fee2e2",
                background: "#fef2f2",
                borderRadius: "10px",
                padding: "9px 16px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
                color: "#dc2626",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fee2e2";
                e.currentTarget.style.borderColor = "#fca5a5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fef2f2";
                e.currentTarget.style.borderColor = "#fee2e2";
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "36px 40px 60px",
        }}
      >
        {/* Welcome */}

        <section
          style={{
            background:
              "linear-gradient(135deg,#1d4ed8,#2563eb)",
            borderRadius: "20px",
            padding: "34px",
            color: "#ffffff",
            marginBottom: "30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "30px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "13px",
                opacity: 0.8,
                marginBottom: "8px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Patient & Customer Portal
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: 800,
              }}
            >
              Welcome back,{" "}
              {user?.username || "User"} 👋
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                opacity: 0.9,
                fontSize: "15px",
              }}
            >
              Order medicines securely or upload
              your prescription for pharmacy review.
            </p>
          </div>

          <div
            style={{
              fontSize: "70px",
              opacity: 0.9,
            }}
          >
            🏥
          </div>
        </section>

        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(230px,1fr))",
            gap: "18px",
            marginBottom: "32px",
          }}
        >
          <QuickAction
            icon="💊"
            title="Order Medicines"
            description="Browse medicines and add them to your cart."
          />

          <QuickAction
            icon="📷"
            title="Upload Prescription"
            description="Upload a clear photo of your prescription."
          />

          <QuickAction
            icon="📦"
            title="My Orders"
            description="Track your medicine orders and status."
          />

          <QuickAction
            icon="🧾"
            title="Order History"
            description="View your previous purchases."
          />
        </div>

        {/* =====================================================
            SEARCH
        ===================================================== */}

        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e5eaf2",
            borderRadius: "18px",
            padding: "24px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "21px",
                }}
              >
                Find Medicines
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#718096",
                  fontSize: "14px",
                }}
              >
                Search our available medicine catalog.
              </p>
            </div>

            <div
              style={{
                position: "relative",
                width: "350px",
                maxWidth: "100%",
              }}
            >
              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search medicines..."
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px 16px 13px 42px",
                  border: "1px solid #d8e0eb",
                  borderRadius: "10px",
                  outline: "none",
                  fontSize: "14px",
                }}
              />

              <span
                style={{
                  position: "absolute",
                  left: "15px",
                  top: "12px",
                  fontSize: "18px",
                }}
              >
                🔍
              </span>
            </div>
          </div>

          {/* Categories */}

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  setSelectedCategory(category)
                }
                style={{
                  border:
                    selectedCategory === category
                      ? "1px solid #2563eb"
                      : "1px solid #dbe3ef",
                  background:
                    selectedCategory === category
                      ? "#eff6ff"
                      : "#ffffff",
                  color:
                    selectedCategory === category
                      ? "#2563eb"
                      : "#526174",
                  padding: "8px 14px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontWeight:
                    selectedCategory === category
                      ? 700
                      : 500,
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* =====================================================
            MEDICINES
        ===================================================== */}

        <section style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "23px",
                }}
              >
                Available Medicines
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#718096",
                }}
              >
                Select medicines you need.
              </p>
            </div>

            <span
              style={{
                fontSize: "14px",
                color: "#718096",
              }}
            >
              {filteredMedicines.length} medicines
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill,minmax(280px,1fr))",
              gap: "20px",
            }}
          >
            {filteredMedicines.map((medicine) => (
              <div
                key={medicine.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e9f1",
                  borderRadius: "16px",
                  padding: "22px",
                  boxShadow:
                    "0 4px 14px rgba(15,23,42,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "#eff6ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "25px",
                    }}
                  >
                    💊
                  </div>

                  <span
                    style={{
                      background: "#ecfdf5",
                      color: "#047857",
                      padding: "5px 9px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    IN STOCK
                  </span>
                </div>

                <h3
                  style={{
                    margin:
                      "18px 0 5px",
                    fontSize: "17px",
                  }}
                >
                  {medicine.name}
                </h3>

                <div
                  style={{
                    color: "#2563eb",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {medicine.category}
                </div>

                <p
                  style={{
                    color: "#718096",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    minHeight: "40px",
                  }}
                >
                  {medicine.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "18px",
                  }}
                >
                  <strong
                    style={{
                      fontSize: "20px",
                    }}
                  >
                    ₹{medicine.price}
                  </strong>

                  <button
                    onClick={() =>
                      addToCart(medicine)
                    }
                    style={{
                      background: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "9px",
                      padding: "10px 15px",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================
            PRESCRIPTION UPLOAD
        ===================================================== */}

        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e4e9f1",
            borderRadius: "18px",
            padding: "28px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              📷
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "21px",
                }}
              >
                Upload Prescription
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#718096",
                  fontSize: "14px",
                }}
              >
                Upload a photo of your doctor's
                prescription.
              </p>
            </div>
          </div>

          {!prescription ? (
            <div
              onClick={() =>
                fileInputRef.current?.click()
              }
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: "14px",
                padding: "38px",
                textAlign: "center",
                cursor: "pointer",
                background: "#fafcff",
              }}
            >
              <div
                style={{
                  fontSize: "42px",
                  marginBottom: "10px",
                }}
              >
                📄
              </div>

              <h3
                style={{
                  margin: 0,
                }}
              >
                Upload prescription photo
              </h3>

              <p
                style={{
                  color: "#718096",
                  fontSize: "14px",
                }}
              >
                JPG, JPEG or PNG
              </p>

              <button
                type="button"
                style={{
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "9px",
                  padding: "11px 20px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Choose Photo
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handlePrescriptionChange}
                style={{ display: "none" }}
              />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                gap: "20px",
                alignItems: "center",
                flexWrap: "wrap",
                border: "1px solid #dbe3ef",
                borderRadius: "14px",
                padding: "18px",
              }}
            >
              {prescriptionPreview && (
                <img
                  src={prescriptionPreview}
                  alt="Prescription preview"
                  style={{
                    width: "180px",
                    height: "130px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: "1px solid #dbe3ef",
                  }}
                />
              )}

              <div>
                <strong>
                  {prescription.name}
                </strong>

                <p
                  style={{
                    color: "#718096",
                    fontSize: "13px",
                  }}
                >
                  Prescription uploaded successfully.
                </p>

                <button
                  onClick={removePrescription}
                  style={{
                    border: "1px solid #fecaca",
                    background: "#fff1f2",
                    color: "#dc2626",
                    borderRadius: "8px",
                    padding: "8px 13px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </section>

        {/* =====================================================
            ORDER SECTION
        ===================================================== */}

        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e4e9f1",
            borderRadius: "18px",
            padding: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "21px",
                }}
              >
                Ready to place your order?
              </h2>

              <p
                style={{
                  color: "#718096",
                  marginBottom: 0,
                }}
              >
                {cartCount} medicine item(s) selected
                {prescription
                  ? " + prescription attached"
                  : ""}
              </p>
            </div>

            <button
              onClick={placeOrder}
              style={{
                background:
                  "linear-gradient(135deg,#2563eb,#1d4ed8)",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                padding: "14px 28px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "15px",
              }}
            >
              Place Order →
            </button>
          </div>

          {orderMessage && (
            <div
              style={{
                marginTop: "20px",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#1d4ed8",
                padding: "14px",
                borderRadius: "10px",
                fontSize: "14px",
              }}
            >
              {orderMessage}
            </div>
          )}
        </section>
      </main>

      {/* =====================================================
          CART DRAWER
      ===================================================== */}

      {showCart && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            zIndex: 100,
          }}
          onClick={() => setShowCart(false)}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              height: "100%",
              width: "420px",
              maxWidth: "90%",
              background: "#ffffff",
              padding: "28px",
              boxSizing: "border-box",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
              }}
            >
              <h2 style={{ margin: 0 }}>
                Your Cart
              </h2>

              <button
                onClick={() =>
                  setShowCart(false)
                }
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "25px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "#718096",
                }}
              >
                <div
                  style={{
                    fontSize: "45px",
                  }}
                >
                  🛒
                </div>

                <p>Your cart is empty.</p>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      borderBottom:
                        "1px solid #e5e7eb",
                      padding: "15px 0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                      }}
                    >
                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        ₹
                        {item.price *
                          item.quantity}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginTop: "12px",
                      }}
                    >
                      <button
                        onClick={() =>
                          decreaseQuantity(
                            item.id
                          )
                        }
                        style={{
                          width: "30px",
                          height: "30px",
                          border:
                            "1px solid #dbe3ef",
                          background: "#ffffff",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(
                            item.id
                          )
                        }
                        style={{
                          width: "30px",
                          height: "30px",
                          border:
                            "1px solid #dbe3ef",
                          background: "#ffffff",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}

                <div
                  style={{
                    marginTop: "25px",
                    paddingTop: "20px",
                    borderTop:
                      "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      fontSize: "20px",
                      fontWeight: 800,
                    }}
                  >
                    <span>Total</span>
                    <span>
                      ₹{cartTotal}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setShowCart(false);
                      placeOrder();
                    }}
                    style={{
                      width: "100%",
                      marginTop: "20px",
                      background: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "14px",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Place Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// ============================================================
// QUICK ACTION COMPONENT
// ============================================================

function QuickAction({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5eaf2",
        borderRadius: "15px",
        padding: "20px",
        display: "flex",
        gap: "15px",
        alignItems: "center",
        boxShadow:
          "0 2px 8px rgba(15,23,42,0.03)",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          minWidth: "48px",
          borderRadius: "12px",
          background: "#eff6ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "23px",
        }}
      >
        {icon}
      </div>

      <div>
        <strong
          style={{
            fontSize: "15px",
          }}
        >
          {title}
        </strong>

        <p
          style={{
            margin: "5px 0 0",
            color: "#718096",
            fontSize: "12px",
            lineHeight: 1.4,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}