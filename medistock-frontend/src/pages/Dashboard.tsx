import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

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

const medicines: Medicine[] = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    description: "For fever and mild to moderate pain.",
    price: 45,
    available: true,
  },
  {
    id: 2,
    name: "Azithromycin 500mg",
    category: "Antibiotic",
    description: "Antibiotic medicine requiring prescription.",
    price: 120,
    available: true,
  },
  {
    id: 3,
    name: "Cetirizine 10mg",
    category: "Allergy",
    description: "Helps relieve allergy and cold symptoms.",
    price: 35,
    available: true,
  },
  {
    id: 4,
    name: "Omeprazole 20mg",
    category: "Digestive",
    description: "Helps reduce stomach acid and acidity.",
    price: 65,
    available: true,
  },
  {
    id: 5,
    name: "Vitamin D3",
    category: "Vitamins",
    description: "Daily vitamin D nutritional supplement.",
    price: 150,
    available: true,
  },
  {
    id: 6,
    name: "Amoxicillin 500mg",
    category: "Antibiotic",
    description: "Prescription antibiotic medicine.",
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

export function Dashboard() {
  const { user } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState("All");

  const [cart, setCart] =
    useState<CartItem[]>([]);

  const [showCart, setShowCart] =
    useState(false);

  const [prescription, setPrescription] =
    useState<File | null>(null);

  const [prescriptionPreview, setPrescriptionPreview] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  // ============================================================
  // FILTER MEDICINES
  // ============================================================

  const filteredMedicines =
    medicines.filter((medicine) => {
      const matchesSearch =
        medicine.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        medicine.category
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        medicine.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });

  // ============================================================
  // CART
  // ============================================================

  const addToCart = (
    medicine: Medicine
  ) => {
    setCart((current) => {
      const existing =
        current.find(
          (item) =>
            item.id === medicine.id
        );

      if (existing) {
        return current.map((item) =>
          item.id === medicine.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...current,
        {
          ...medicine,
          quantity: 1,
        },
      ];
    });

    setMessage("");
  };

  const increaseQuantity = (
    id: number
  ) => {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (
    id: number
  ) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  };

  // ============================================================
  // CART TOTAL
  // ============================================================

  const cartCount =
    cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  const cartTotal =
    cart.reduce(
      (total, item) =>
        total +
        item.price *
          item.quantity,
      0
    );

  // ============================================================
  // PRESCRIPTION
  // ============================================================

  const handlePrescription = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.includes("image")
    ) {
      setMessage(
        "Please upload a prescription image."
      );
      return;
    }

    setPrescription(file);

    const preview =
      URL.createObjectURL(file);

    setPrescriptionPreview(preview);

    setMessage(
      "Prescription uploaded successfully."
    );
  };

  const removePrescription = () => {
    setPrescription(null);
    setPrescriptionPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }

    setMessage("");
  };

  // ============================================================
  // PLACE ORDER
  // ============================================================

  const placeOrder = () => {
    if (
      cart.length === 0 &&
      !prescription
    ) {
      setMessage(
        "Please add a medicine or upload a prescription before placing an order."
      );

      return;
    }

    setMessage(
      "Order submitted successfully. The pharmacy will review your request."
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        color: "#172033",
      }}
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header
        style={{
          height: "72px",
          background: "#ffffff",
          borderBottom:
            "1px solid #e5eaf2",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          padding:
            "0 40px",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >

        {/* LOGO */}

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
              justifyContent:
                "center",
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
              Medical Inventory &
              Pharmacy Platform
            </div>
          </div>
        </div>

        {/* HEADER RIGHT */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >

          <button
            onClick={() =>
              setShowCart(true)
            }
            style={{
              border:
                "1px solid #dbe3ef",
              background:
                "#ffffff",
              borderRadius: "10px",
              padding:
                "10px 16px",
              cursor: "pointer",
              color: "#2563eb",
              fontWeight: 700,
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
                background:
                  "#e8efff",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                color: "#2563eb",
                fontWeight: 800,
              }}
            >
              {(user?.username ||
                "U")
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
                {user?.username ||
                  "User"}
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

          </div>
        </div>

      </header>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main
        style={{
          maxWidth:
            "1400px",
          margin:
            "0 auto",
          padding:
            "35px 40px 60px",
        }}
      >

        {/* ====================================================
            WELCOME
        ==================================================== */}

        <section
          style={{
            background:
              "linear-gradient(135deg,#1d4ed8,#2563eb)",
            borderRadius:
              "20px",
            padding:
              "34px",
            color:
              "#ffffff",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            marginBottom:
              "28px",
          }}
        >

          <div>

            <div
              style={{
                fontSize:
                  "12px",
                textTransform:
                  "uppercase",
                letterSpacing:
                  "1px",
                opacity:
                  0.8,
                fontWeight:
                  700,
                marginBottom:
                  "8px",
              }}
            >
              Patient Portal
            </div>

            <h1
              style={{
                margin: 0,
                fontSize:
                  "32px",
                fontWeight:
                  800,
              }}
            >
              Welcome back,{" "}
              {user?.username ||
                "User"} 👋
            </h1>

            <p
              style={{
                margin:
                  "10px 0 0",
                fontSize:
                  "15px",
                opacity:
                  0.9,
              }}
            >
              Order medicines securely
              or upload your prescription
              for pharmacy review.
            </p>

          </div>

          <div
            style={{
              fontSize:
                "65px",
            }}
          >
            🏥
          </div>

        </section>


        {/* ====================================================
            QUICK ACTIONS
        ==================================================== */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(240px,1fr))",
            gap: "18px",
            marginBottom:
              "30px",
          }}
        >

          <QuickCard
            icon="💊"
            title="Order Medicines"
            description="Search and order medicines from the catalog."
          />

          <QuickCard
            icon="📷"
            title="Upload Prescription"
            description="Upload a clear photo of your prescription."
          />

          <QuickCard
            icon="📦"
            title="My Orders"
            description="Track your current medicine orders."
          />

          <QuickCard
            icon="🧾"
            title="Order History"
            description="Review your previous medicine orders."
          />

        </section>


        {/* ====================================================
            MEDICINE SEARCH
        ==================================================== */}

        <section
          style={{
            background:
              "#ffffff",
            border:
              "1px solid #e4e9f1",
            borderRadius:
              "18px",
            padding:
              "25px",
            marginBottom:
              "28px",
          }}
        >

          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap:
                "20px",
              flexWrap:
                "wrap",
            }}
          >

            <div>

              <h2
                style={{
                  margin: 0,
                  fontSize:
                    "22px",
                }}
              >
                Find Medicines
              </h2>

              <p
                style={{
                  margin:
                    "5px 0 0",
                  color:
                    "#718096",
                  fontSize:
                    "14px",
                }}
              >
                Search available medicines
                and add them to your cart.
              </p>

            </div>

            <div
              style={{
                width:
                  "350px",
                maxWidth:
                  "100%",
              }}
            >

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search medicine..."
                style={{
                  width:
                    "100%",
                  boxSizing:
                    "border-box",
                  padding:
                    "13px 16px",
                  border:
                    "1px solid #d8e0eb",
                  borderRadius:
                    "10px",
                  outline:
                    "none",
                  fontSize:
                    "14px",
                }}
              />

            </div>

          </div>


          {/* CATEGORIES */}

          <div
            style={{
              display:
                "flex",
              gap:
                "8px",
              flexWrap:
                "wrap",
              marginTop:
                "20px",
            }}
          >

            {categories.map(
              (item) => (
                <button
                  key={item}
                  onClick={() =>
                    setCategory(
                      item
                    )
                  }
                  style={{
                    padding:
                      "8px 15px",
                    borderRadius:
                      "20px",
                    border:
                      category ===
                      item
                        ? "1px solid #2563eb"
                        : "1px solid #dbe3ef",
                    background:
                      category ===
                      item
                        ? "#eff6ff"
                        : "#ffffff",
                    color:
                      category ===
                      item
                        ? "#2563eb"
                        : "#526174",
                    fontWeight:
                      category ===
                      item
                        ? 700
                        : 500,
                    cursor:
                      "pointer",
                  }}
                >
                  {item}
                </button>
              )
            )}

          </div>

        </section>


        {/* ====================================================
            MEDICINES
        ==================================================== */}

        <section
          style={{
            marginBottom:
              "30px",
          }}
        >

          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              marginBottom:
                "18px",
            }}
          >

            <div>

              <h2
                style={{
                  margin: 0,
                  fontSize:
                    "22px",
                }}
              >
                Available Medicines
              </h2>

              <p
                style={{
                  margin:
                    "5px 0 0",
                  color:
                    "#718096",
                }}
              >
                Choose the medicines
                you need.
              </p>

            </div>

            <span
              style={{
                color:
                  "#718096",
                fontSize:
                  "14px",
              }}
            >
              {filteredMedicines.length}
              {" "}available
            </span>

          </div>


          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fill,minmax(280px,1fr))",
              gap:
                "20px",
            }}
          >

            {filteredMedicines.map(
              (medicine) => (
                <div
                  key={
                    medicine.id
                  }
                  style={{
                    background:
                      "#ffffff",
                    border:
                      "1px solid #e4e9f1",
                    borderRadius:
                      "16px",
                    padding:
                      "22px",
                    boxShadow:
                      "0 4px 14px rgba(15,23,42,0.04)",
                  }}
                >

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                    }}
                  >

                    <div
                      style={{
                        width:
                          "48px",
                        height:
                          "48px",
                        borderRadius:
                          "12px",
                        background:
                          "#eff6ff",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        fontSize:
                          "24px",
                      }}
                    >
                      💊
                    </div>

                    <span
                      style={{
                        background:
                          "#ecfdf5",
                        color:
                          "#047857",
                        padding:
                          "5px 9px",
                        borderRadius:
                          "20px",
                        fontSize:
                          "11px",
                        fontWeight:
                          700,
                      }}
                    >
                      IN STOCK
                    </span>

                  </div>


                  <h3
                    style={{
                      margin:
                        "18px 0 5px",
                      fontSize:
                        "17px",
                    }}
                  >
                    {medicine.name}
                  </h3>

                  <div
                    style={{
                      color:
                        "#2563eb",
                      fontSize:
                        "12px",
                      fontWeight:
                        700,
                    }}
                  >
                    {medicine.category}
                  </div>

                  <p
                    style={{
                      color:
                        "#718096",
                      fontSize:
                        "13px",
                      lineHeight:
                        1.5,
                      minHeight:
                        "40px",
                    }}
                  >
                    {
                      medicine.description
                    }
                  </p>


                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      marginTop:
                        "18px",
                    }}
                  >

                    <strong
                      style={{
                        fontSize:
                          "20px",
                      }}
                    >
                      ₹
                      {
                        medicine.price
                      }
                    </strong>

                    <button
                      onClick={() =>
                        addToCart(
                          medicine
                        )
                      }
                      style={{
                        background:
                          "#2563eb",
                        color:
                          "#ffffff",
                        border:
                          "none",
                        borderRadius:
                          "9px",
                        padding:
                          "10px 15px",
                        cursor:
                          "pointer",
                        fontWeight:
                          700,
                      }}
                    >
                      Add to Cart
                    </button>

                  </div>

                </div>
              )
            )}

          </div>

        </section>


        {/* ====================================================
            PRESCRIPTION
        ==================================================== */}

        <section
          style={{
            background:
              "#ffffff",
            border:
              "1px solid #e4e9f1",
            borderRadius:
              "18px",
            padding:
              "28px",
            marginBottom:
              "28px",
          }}
        >

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap:
                "14px",
              marginBottom:
                "20px",
            }}
          >

            <div
              style={{
                width:
                  "48px",
                height:
                  "48px",
                borderRadius:
                  "12px",
                background:
                  "#eff6ff",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize:
                  "24px",
              }}
            >
              📷
            </div>

            <div>

              <h2
                style={{
                  margin: 0,
                  fontSize:
                    "21px",
                }}
              >
                Upload Prescription
              </h2>

              <p
                style={{
                  margin:
                    "5px 0 0",
                  color:
                    "#718096",
                  fontSize:
                    "14px",
                }}
              >
                Upload a photo of your
                doctor's prescription.
              </p>

            </div>

          </div>


          {!prescription ? (

            <div
              onClick={() =>
                fileInputRef.current?.click()
              }
              style={{
                border:
                  "2px dashed #cbd5e1",
                borderRadius:
                  "14px",
                padding:
                  "38px",
                textAlign:
                  "center",
                cursor:
                  "pointer",
                background:
                  "#fafcff",
              }}
            >

              <div
                style={{
                  fontSize:
                    "42px",
                  marginBottom:
                    "10px",
                }}
              >
                📄
              </div>

              <h3
                style={{
                  margin:
                    "0 0 5px",
                }}
              >
                Upload prescription photo
              </h3>

              <p
                style={{
                  color:
                    "#718096",
                  fontSize:
                    "14px",
                }}
              >
                JPG, JPEG or PNG
              </p>

              <button
                type="button"
                style={{
                  background:
                    "#2563eb",
                  color:
                    "#ffffff",
                  border:
                    "none",
                  borderRadius:
                    "9px",
                  padding:
                    "11px 20px",
                  fontWeight:
                    700,
                  cursor:
                    "pointer",
                }}
              >
                Choose Photo
              </button>

              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={
                  handlePrescription
                }
                style={{
                  display:
                    "none",
                }}
              />

            </div>

          ) : (

            <div
              style={{
                border:
                  "1px solid #dbe3ef",
                borderRadius:
                  "14px",
                padding:
                  "18px",
                display:
                  "flex",
                gap:
                  "20px",
                alignItems:
                  "center",
                flexWrap:
                  "wrap",
              }}
            >

              {prescriptionPreview && (
                <img
                  src={
                    prescriptionPreview
                  }
                  alt="Prescription"
                  style={{
                    width:
                      "200px",
                    height:
                      "140px",
                    objectFit:
                      "cover",
                    borderRadius:
                      "10px",
                  }}
                />
              )}

              <div>

                <strong>
                  {
                    prescription.name
                  }
                </strong>

                <p
                  style={{
                    color:
                      "#718096",
                    fontSize:
                      "13px",
                  }}
                >
                  Prescription
                  uploaded
                  successfully.
                </p>

                <button
                  onClick={
                    removePrescription
                  }
                  style={{
                    border:
                      "1px solid #fecaca",
                    background:
                      "#fff1f2",
                    color:
                      "#dc2626",
                    borderRadius:
                      "8px",
                    padding:
                      "8px 13px",
                    cursor:
                      "pointer",
                    fontWeight:
                      600,
                  }}
                >
                  Remove
                </button>

              </div>

            </div>

          )}

        </section>


        {/* ====================================================
            ORDER
        ==================================================== */}

        <section
          style={{
            background:
              "#ffffff",
            border:
              "1px solid #e4e9f1",
            borderRadius:
              "18px",
            padding:
              "28px",
          }}
        >

          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap:
                "20px",
              flexWrap:
                "wrap",
            }}
          >

            <div>

              <h2
                style={{
                  margin: 0,
                  fontSize:
                    "21px",
                }}
              >
                Ready to place your order?
              </h2>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color:
                    "#718096",
                }}
              >
                {cartCount} medicine
                item(s) selected
                {prescription
                  ? " + prescription attached"
                  : ""}
              </p>

            </div>

            <button
              onClick={
                placeOrder
              }
              style={{
                background:
                  "linear-gradient(135deg,#2563eb,#1d4ed8)",
                color:
                  "#ffffff",
                border:
                  "none",
                borderRadius:
                  "10px",
                padding:
                  "14px 28px",
                cursor:
                  "pointer",
                fontWeight:
                  700,
                fontSize:
                  "15px",
              }}
            >
              Place Order →
            </button>

          </div>


          {message && (
            <div
              style={{
                marginTop:
                  "20px",
                background:
                  "#eff6ff",
                border:
                  "1px solid #bfdbfe",
                color:
                  "#1d4ed8",
                padding:
                  "14px",
                borderRadius:
                  "10px",
                fontSize:
                  "14px",
              }}
            >
              {message}
            </div>
          )}

        </section>

      </main>


      {/* ======================================================
          CART DRAWER
      ====================================================== */}

      {showCart && (

        <div
          onClick={() =>
            setShowCart(false)
          }
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(15,23,42,0.45)",
            zIndex:
              100,
          }}
        >

          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              position:
                "absolute",
              right: 0,
              top: 0,
              height:
                "100%",
              width:
                "420px",
              maxWidth:
                "90%",
              background:
                "#ffffff",
              padding:
                "28px",
              boxSizing:
                "border-box",
              overflowY:
                "auto",
            }}
          >

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  "25px",
              }}
            >

              <h2
                style={{
                  margin: 0,
                }}
              >
                Your Cart
              </h2>

              <button
                onClick={() =>
                  setShowCart(
                    false
                  )
                }
                style={{
                  border:
                    "none",
                  background:
                    "transparent",
                  fontSize:
                    "25px",
                  cursor:
                    "pointer",
                }}
              >
                ×
              </button>

            </div>


            {cart.length ===
            0 ? (

              <div
                style={{
                  textAlign:
                    "center",
                  padding:
                    "60px 20px",
                  color:
                    "#718096",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "45px",
                  }}
                >
                  🛒
                </div>

                <p>
                  Your cart is empty.
                </p>
              </div>

            ) : (

              <>
                {cart.map(
                  (item) => (
                    <div
                      key={
                        item.id
                      }
                      style={{
                        borderBottom:
                          "1px solid #e5e7eb",
                        padding:
                          "15px 0",
                      }}
                    >

                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                        }}
                      >
                        <strong>
                          {
                            item.name
                          }
                        </strong>

                        <span>
                          ₹
                          {item.price *
                            item.quantity}
                        </span>
                      </div>


                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap:
                            "10px",
                          marginTop:
                            "12px",
                        }}
                      >

                        <button
                          onClick={() =>
                            decreaseQuantity(
                              item.id
                            )
                          }
                          style={{
                            width:
                              "30px",
                            height:
                              "30px",
                            border:
                              "1px solid #dbe3ef",
                            background:
                              "#ffffff",
                            borderRadius:
                              "6px",
                            cursor:
                              "pointer",
                          }}
                        >
                          −
                        </button>

                        <span>
                          {
                            item.quantity
                          }
                        </span>

                        <button
                          onClick={() =>
                            increaseQuantity(
                              item.id
                            )
                          }
                          style={{
                            width:
                              "30px",
                            height:
                              "30px",
                            border:
                              "1px solid #dbe3ef",
                            background:
                              "#ffffff",
                            borderRadius:
                              "6px",
                            cursor:
                              "pointer",
                          }}
                        >
                          +
                        </button>

                      </div>

                    </div>
                  )
                )}


                <div
                  style={{
                    marginTop:
                      "25px",
                    paddingTop:
                      "20px",
                    borderTop:
                      "1px solid #e5e7eb",
                  }}
                >

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      fontSize:
                        "20px",
                      fontWeight:
                        800,
                    }}
                  >
                    <span>
                      Total
                    </span>

                    <span>
                      ₹{cartTotal}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setShowCart(
                        false
                      );
                      placeOrder();
                    }}
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "20px",
                      background:
                        "#2563eb",
                      color:
                        "#ffffff",
                      border:
                        "none",
                      borderRadius:
                        "10px",
                      padding:
                        "14px",
                      cursor:
                        "pointer",
                      fontWeight:
                        700,
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
// QUICK CARD
// ============================================================

function QuickCard({
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
        background:
          "#ffffff",
        border:
          "1px solid #e5eaf2",
        borderRadius:
          "15px",
        padding:
          "20px",
        display:
          "flex",
        alignItems:
          "center",
        gap:
          "15px",
        boxShadow:
          "0 2px 8px rgba(15,23,42,0.03)",
      }}
    >

      <div
        style={{
          width:
            "48px",
          height:
            "48px",
          minWidth:
            "48px",
          borderRadius:
            "12px",
          background:
            "#eff6ff",
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          fontSize:
            "23px",
        }}
      >
        {icon}
      </div>

      <div>

        <strong
          style={{
            fontSize:
              "15px",
          }}
        >
          {title}
        </strong>

        <p
          style={{
            margin:
              "5px 0 0",
            color:
              "#718096",
            fontSize:
              "12px",
            lineHeight:
              1.4,
          }}
        >
          {description}
        </p>

      </div>

    </div>
  );
}