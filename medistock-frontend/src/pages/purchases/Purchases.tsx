import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Plus,
  RefreshCw,
  Eye,
  Trash2,
  X,
  ShoppingCart,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  CalendarDays,
  IndianRupee,
} from "lucide-react";


// ============================================================
// TYPES
// ============================================================

interface Supplier {
  id?: number;
  name?: string;
  contact?: string;
  email?: string;
}

interface Medicine {
  id?: number;
  name?: string;
  category?: string;
  price?: number;
  stockQuantity?: number;
}

interface PurchaseItem {
  id?: number;

  quantity?: number;

  price?: number;

  medicine?: Medicine;
}

interface PurchaseOrder {
  id?: number;

  orderDate?: string;

  status?: string;

  supplier?: Supplier;

  items?: PurchaseItem[];
}

interface NewPurchaseItem {
  medicineId: string;

  quantity: string;

  price: string;
}


// ============================================================
// API
// ============================================================

const API_BASE =
  import.meta.env.VITE_API_URL || "/api";


// ============================================================
// COMPONENT
// ============================================================

export default function Purchases() {

  // ----------------------------------------------------------
  // DATA
  // ----------------------------------------------------------

  const [purchases, setPurchases] =
    useState<PurchaseOrder[]>([]);

  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [medicines, setMedicines] =
    useState<Medicine[]>([]);


  // ----------------------------------------------------------
  // UI STATES
  // ----------------------------------------------------------

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [showDetailsModal, setShowDetailsModal] =
    useState(false);

  const [selectedPurchase, setSelectedPurchase] =
    useState<PurchaseOrder | null>(null);

  const [saving, setSaving] =
    useState(false);


  // ----------------------------------------------------------
  // FORM
  // ----------------------------------------------------------

  const [supplierId, setSupplierId] =
    useState("");

  const [orderStatus, setOrderStatus] =
    useState("PENDING");

  const [orderItems, setOrderItems] =
    useState<NewPurchaseItem[]>([
      {
        medicineId: "",
        quantity: "",
        price: "",
      },
    ]);


  // ==========================================================
  // AUTH HEADERS
  // ==========================================================

  const getHeaders = (): HeadersInit => {

    const token =
      localStorage.getItem("token");

    return {
      Accept: "application/json",
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization:
              `Bearer ${token}`,
          }
        : {}),
    };
  };


  // ==========================================================
  // LOAD PURCHASES
  // ==========================================================

  const loadPurchases =
    async () => {

      try {

        setLoading(true);

        setError("");

        const response =
          await fetch(
            `${API_BASE}/purchases`,
            {
              method: "GET",
              headers:
                getHeaders(),
            }
          );


        if (!response.ok) {

          throw new Error(
            `Failed to load purchases: ${response.status}`
          );
        }


        const data =
          await response.json();


        setPurchases(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.error(
          "Purchase loading error:",
          err
        );

        setError(
          "Unable to load purchase orders from the server."
        );

        setPurchases([]);

      } finally {

        setLoading(false);
      }
    };


  // ==========================================================
  // LOAD SUPPLIERS
  // ==========================================================

  const loadSuppliers =
    async () => {

      try {

        const response =
          await fetch(
            `${API_BASE}/suppliers`,
            {
              method: "GET",
              headers:
                getHeaders(),
            }
          );


        if (!response.ok) {
          return;
        }


        const data =
          await response.json();


        setSuppliers(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.error(
          "Supplier loading error:",
          err
        );
      }
    };


  // ==========================================================
  // LOAD MEDICINES
  // ==========================================================

  const loadMedicines =
    async () => {

      try {

        const response =
          await fetch(
            `${API_BASE}/medicines`,
            {
              method: "GET",
              headers:
                getHeaders(),
            }
          );


        if (!response.ok) {
          return;
        }


        const data =
          await response.json();


        setMedicines(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.error(
          "Medicine loading error:",
          err
        );
      }
    };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadPurchases();

    loadSuppliers();

    loadMedicines();

  }, []);


  // ==========================================================
  // HELPERS
  // ==========================================================

  const getPurchaseTotal =
    (purchase: PurchaseOrder) => {

      if (
        !purchase.items ||
        purchase.items.length === 0
      ) {
        return 0;
      }

      return purchase.items.reduce(
        (total, item) => {

          const quantity =
            Number(
              item.quantity || 0
            );

          const price =
            Number(
              item.price || 0
            );

          return (
            total +
            quantity * price
          );

        },
        0
      );
    };


  const getPurchaseItemCount =
    (purchase: PurchaseOrder) => {

      if (
        !purchase.items ||
        purchase.items.length === 0
      ) {
        return 0;
      }

      return purchase.items.reduce(
        (total, item) =>
          total +
          Number(
            item.quantity || 0
          ),
        0
      );
    };


  const formatDate =
    (date?: string) => {

      if (!date) {
        return "-";
      }

      const parsed =
        new Date(date);

      if (
        Number.isNaN(
          parsed.getTime()
        )
      ) {
        return date;
      }

      return parsed.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    };


  const formatDateTime =
    (date?: string) => {

      if (!date) {
        return "-";
      }

      const parsed =
        new Date(date);

      if (
        Number.isNaN(
          parsed.getTime()
        )
      ) {
        return date;
      }

      return parsed.toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };


  const formatCurrency =
    (value: number) => {

      return new Intl.NumberFormat(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 2,
        }
      ).format(value);
    };


  const getStatus =
    (status?: string) => {

      return (
        status || "PENDING"
      ).toUpperCase();
    };


  // ==========================================================
  // FILTERED PURCHASES
  // ==========================================================

  const filteredPurchases =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      return purchases.filter(
        (purchase) => {

          const status =
            getStatus(
              purchase.status
            );


          const supplierName =
            purchase
              .supplier
              ?.name
              ?.toLowerCase() || "";


          const purchaseId =
            String(
              purchase.id || ""
            );


          const matchesSearch =
            !query ||
            supplierName.includes(
              query
            ) ||
            purchaseId.includes(
              query
            );


          const matchesStatus =
            statusFilter ===
              "ALL" ||
            status ===
              statusFilter;


          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );

    }, [
      purchases,
      search,
      statusFilter,
    ]);


  // ==========================================================
  // SUMMARY
  // ==========================================================

  const totalPurchases =
    purchases.length;


  const pendingPurchases =
    purchases.filter(
      (purchase) =>
        getStatus(
          purchase.status
        ) === "PENDING"
    ).length;


  const completedPurchases =
    purchases.filter(
      (purchase) =>
        getStatus(
          purchase.status
        ) === "COMPLETED"
    ).length;


  const cancelledPurchases =
    purchases.filter(
      (purchase) =>
        getStatus(
          purchase.status
        ) === "CANCELLED"
    ).length;


  const totalPurchaseValue =
    purchases.reduce(
      (total, purchase) =>
        total +
        getPurchaseTotal(
          purchase
        ),
      0
    );


  // ==========================================================
  // OPEN DETAILS
  // ==========================================================

  const openDetails =
    (purchase: PurchaseOrder) => {

      setSelectedPurchase(
        purchase
      );

      setShowDetailsModal(
        true
      );
    };


  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetForm = () => {

    setSupplierId("");

    setOrderStatus(
      "PENDING"
    );

    setOrderItems([
      {
        medicineId: "",
        quantity: "",
        price: "",
      },
    ]);
  };


  // ==========================================================
  // ADD ITEM
  // ==========================================================

  const addItem = () => {

    setOrderItems(
      [
        ...orderItems,
        {
          medicineId: "",
          quantity: "",
          price: "",
        },
      ]
    );
  };


  // ==========================================================
  // REMOVE ITEM
  // ==========================================================

  const removeItem =
    (index: number) => {

      if (
        orderItems.length === 1
      ) {
        return;
      }

      setOrderItems(
        orderItems.filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
      );
    };


  // ==========================================================
  // UPDATE ITEM
  // ==========================================================

  const updateItem =
    (
      index: number,
      field:
        keyof NewPurchaseItem,
      value: string
    ) => {

      setOrderItems(
        orderItems.map(
          (item, itemIndex) => {

            if (
              itemIndex !== index
            ) {
              return item;
            }

            return {
              ...item,
              [field]: value,
            };
          }
        )
      );
    };


  // ==========================================================
  // CREATE PURCHASE
  // ==========================================================

  const createPurchase =
    async () => {

      if (!supplierId) {

        alert(
          "Please select a supplier."
        );

        return;
      }


      const validItems =
        orderItems.filter(
          (item) =>
            item.medicineId &&
            Number(
              item.quantity
            ) > 0 &&
            Number(
              item.price
            ) >= 0
        );


      if (
        validItems.length === 0
      ) {

        alert(
          "Please add at least one medicine."
        );

        return;
      }


      try {

        setSaving(true);


        const payload = {

          supplier: {
            id: Number(
              supplierId
            ),
          },

          status:
            orderStatus,

          orderDate:
            new Date().toISOString(),

          items:
            validItems.map(
              (item) => ({
                medicine: {
                  id: Number(
                    item.medicineId
                  ),
                },

                quantity:
                  Number(
                    item.quantity
                  ),

                price:
                  Number(
                    item.price
                  ),
              })
            ),
        };


        const response =
          await fetch(
            `${API_BASE}/purchases`,
            {
              method: "POST",
              headers:
                getHeaders(),
              body:
                JSON.stringify(
                  payload
                ),
            }
          );


        if (!response.ok) {

          const message =
            await response
              .text();

          throw new Error(
            message ||
            `Purchase creation failed: ${response.status}`
          );
        }


        await loadPurchases();


        setShowAddModal(
          false
        );

        resetForm();

        alert(
          "Purchase order created successfully."
        );

      } catch (err) {

        console.error(
          "Create purchase error:",
          err
        );

        alert(
          "Unable to create purchase order. Please check the backend server."
        );

      } finally {

        setSaving(false);
      }
    };


  // ==========================================================
  // DELETE PURCHASE
  // ==========================================================

  const deletePurchase =
    async (
      purchase: PurchaseOrder
    ) => {

      if (!purchase.id) {
        return;
      }


      const confirmed =
        window.confirm(
          `Delete purchase order #${purchase.id}?`
        );


      if (!confirmed) {
        return;
      }


      try {

        const response =
          await fetch(
            `${API_BASE}/purchases/${purchase.id}`,
            {
              method: "DELETE",
              headers:
                getHeaders(),
            }
          );


        if (!response.ok) {

          throw new Error(
            `Delete failed: ${response.status}`
          );
        }


        setPurchases(
          purchases.filter(
            (item) =>
              item.id !==
              purchase.id
          )
        );

      } catch (err) {

        console.error(
          "Delete purchase error:",
          err
        );

        alert(
          "Unable to delete this purchase order."
        );
      }
    };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div
      className="purchases-page"
      style={{
        width: "100%",
        minHeight: "100%",
        color: "#172033",
      }}
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "20px",
          marginBottom: "30px",
        }}
      >

        <div>

          <div
            style={{
              color: "#7890ad",
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing:
                "2px",
              textTransform:
                "uppercase",
              marginBottom: "8px",
            }}
          >
            PROCUREMENT
          </div>


          <h2
            style={{
              margin: 0,
              fontSize: "36px",
              fontWeight: 800,
              color: "#172033",
            }}
          >
            Purchase Orders
          </h2>


          <p
            style={{
              margin:
                "8px 0 0",
              color: "#71829b",
              fontSize: "16px",
            }}
          >
            Manage medicine purchases,
            suppliers and purchase history.
          </p>

        </div>


        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >

          <button
            onClick={() => {
              loadPurchases();
              loadSuppliers();
              loadMedicines();
            }}
            style={{
              border:
                "1px solid #dbe4f0",
              background:
                "#ffffff",
              color:
                "#172033",
              padding:
                "13px 18px",
              borderRadius:
                "12px",
              display: "flex",
              alignItems:
                "center",
              gap: "8px",
              cursor:
                "pointer",
              fontWeight: 700,
            }}
          >
            <RefreshCw
              size={18}
            />
            Refresh
          </button>


          <button
            onClick={() => {
              resetForm();
              setShowAddModal(
                true
              );
            }}
            style={{
              border: "none",
              background:
                "#2563eb",
              color:
                "#ffffff",
              padding:
                "13px 20px",
              borderRadius:
                "12px",
              display: "flex",
              alignItems:
                "center",
              gap: "8px",
              cursor:
                "pointer",
              fontWeight: 700,
              boxShadow:
                "0 8px 20px rgba(37,99,235,.20)",
            }}
          >
            <Plus
              size={19}
            />
            New Purchase
          </button>

        </div>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div
          style={{
            background:
              "#fff1f2",
            border:
              "1px solid #fecdd3",
            color:
              "#be123c",
            padding:
              "15px 18px",
            borderRadius:
              "12px",
            marginBottom:
              "20px",
            display: "flex",
            alignItems:
              "center",
            gap: "10px",
          }}
        >
          <XCircle
            size={20}
          />
          {error}
        </div>

      )}


      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: "18px",
          marginBottom:
            "24px",
        }}
      >

        {/* Total */}

        <div
          style={{
            background:
              "#ffffff",
            border:
              "1px solid #e5eaf1",
            borderRadius:
              "18px",
            padding:
              "22px",
            boxShadow:
              "0 6px 20px rgba(15,23,42,.04)",
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
            }}
          >

            <div>

              <div
                style={{
                  color:
                    "#71829b",
                  fontSize:
                    "13px",
                  fontWeight:
                    700,
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    "0.7px",
                }}
              >
                Total Purchases
              </div>

              <div
                style={{
                  fontSize:
                    "32px",
                  fontWeight:
                    800,
                  marginTop:
                    "8px",
                }}
              >
                {totalPurchases}
              </div>

            </div>


            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius:
                  "14px",
                background:
                  "#eff6ff",
                color:
                  "#2563eb",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              <ShoppingCart
                size={23}
              />
            </div>

          </div>

        </div>


        {/* Pending */}

        <div
          style={{
            background:
              "#ffffff",
            border:
              "1px solid #e5eaf1",
            borderRadius:
              "18px",
            padding:
              "22px",
            boxShadow:
              "0 6px 20px rgba(15,23,42,.04)",
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
            }}
          >

            <div>

              <div
                style={{
                  color:
                    "#71829b",
                  fontSize:
                    "13px",
                  fontWeight:
                    700,
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    "0.7px",
                }}
              >
                Pending
              </div>

              <div
                style={{
                  fontSize:
                    "32px",
                  fontWeight:
                    800,
                  marginTop:
                    "8px",
                }}
              >
                {pendingPurchases}
              </div>

            </div>


            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius:
                  "14px",
                background:
                  "#fff7ed",
                color:
                  "#ea580c",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              <Clock
                size={23}
              />
            </div>

          </div>

        </div>


        {/* Completed */}

        <div
          style={{
            background:
              "#ffffff",
            border:
              "1px solid #e5eaf1",
            borderRadius:
              "18px",
            padding:
              "22px",
            boxShadow:
              "0 6px 20px rgba(15,23,42,.04)",
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
            }}
          >

            <div>

              <div
                style={{
                  color:
                    "#71829b",
                  fontSize:
                    "13px",
                  fontWeight:
                    700,
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    "0.7px",
                }}
              >
                Completed
              </div>

              <div
                style={{
                  fontSize:
                    "32px",
                  fontWeight:
                    800,
                  marginTop:
                    "8px",
                }}
              >
                {completedPurchases}
              </div>

            </div>


            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius:
                  "14px",
                background:
                  "#ecfdf5",
                color:
                  "#059669",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              <CheckCircle
                size={23}
              />
            </div>

          </div>

        </div>


        {/* Value */}

        <div
          style={{
            background:
              "#ffffff",
            border:
              "1px solid #e5eaf1",
            borderRadius:
              "18px",
            padding:
              "22px",
            boxShadow:
              "0 6px 20px rgba(15,23,42,.04)",
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
            }}
          >

            <div>

              <div
                style={{
                  color:
                    "#71829b",
                  fontSize:
                    "13px",
                  fontWeight:
                    700,
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    "0.7px",
                }}
              >
                Purchase Value
              </div>

              <div
                style={{
                  fontSize:
                    "24px",
                  fontWeight:
                    800,
                  marginTop:
                    "10px",
                }}
              >
                {formatCurrency(
                  totalPurchaseValue
                )}
              </div>

            </div>


            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius:
                  "14px",
                background:
                  "#f5f3ff",
                color:
                  "#7c3aed",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              <IndianRupee
                size={23}
              />
            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          FILTER BAR
      ====================================================== */}

      <div
        style={{
          background:
            "#ffffff",
          border:
            "1px solid #e5eaf1",
          borderRadius:
            "18px",
          padding:
            "18px",
          marginBottom:
            "20px",
          display: "flex",
          alignItems:
            "center",
          gap: "14px",
        }}
      >

        <div
          style={{
            flex: 1,
            position:
              "relative",
          }}
        >

          <Search
            size={19}
            style={{
              position:
                "absolute",
              left: "16px",
              top: "50%",
              transform:
                "translateY(-50%)",
              color:
                "#94a3b8",
            }}
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search by purchase ID or supplier..."
            style={{
              width: "100%",
              boxSizing:
                "border-box",
              height: "50px",
              border:
                "1px solid #dbe4f0",
              borderRadius:
                "12px",
              padding:
                "0 16px 0 46px",
              fontSize:
                "15px",
              outline: "none",
              color:
                "#172033",
            }}
          />

        </div>


        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          style={{
            height: "50px",
            minWidth:
              "180px",
            border:
              "1px solid #dbe4f0",
            borderRadius:
              "12px",
            padding:
              "0 14px",
            fontSize:
              "15px",
            background:
              "#ffffff",
            color:
              "#172033",
            outline:
              "none",
          }}
        >
          <option value="ALL">
            All Status
          </option>

          <option value="PENDING">
            Pending
          </option>

          <option value="COMPLETED">
            Completed
          </option>

          <option value="CANCELLED">
            Cancelled
          </option>
        </select>

      </div>


      {/* ======================================================
          TABLE
      ====================================================== */}

      <div
        style={{
          background:
            "#ffffff",
          border:
            "1px solid #e5eaf1",
          borderRadius:
            "18px",
          overflow:
            "hidden",
          boxShadow:
            "0 6px 20px rgba(15,23,42,.04)",
        }}
      >

        <div
          style={{
            padding:
              "22px 24px",
            borderBottom:
              "1px solid #edf1f6",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
          }}
        >

          <div>

            <h3
              style={{
                margin: 0,
                fontSize:
                  "20px",
                fontWeight:
                  800,
              }}
            >
              Purchase Orders
            </h3>

            <p
              style={{
                margin:
                  "5px 0 0",
                color:
                  "#71829b",
                fontSize:
                  "14px",
              }}
            >
              Showing{" "}
              {filteredPurchases.length}{" "}
              of{" "}
              {purchases.length}{" "}
              purchase orders
            </p>

          </div>

        </div>


        {loading ? (

          <div
            style={{
              padding:
                "70px 20px",
              textAlign:
                "center",
              color:
                "#71829b",
            }}
          >
            <RefreshCw
              size={28}
              style={{
                animation:
                  "spin 1s linear infinite",
                marginBottom:
                  "12px",
              }}
            />

            <div>
              Loading purchase orders...
            </div>
          </div>

        ) : filteredPurchases.length ===
          0 ? (

          <div
            style={{
              padding:
                "70px 20px",
              textAlign:
                "center",
              color:
                "#71829b",
            }}
          >

            <Package
              size={44}
              style={{
                marginBottom:
                  "12px",
                opacity: 0.5,
              }}
            />

            <div
              style={{
                fontSize:
                  "18px",
                fontWeight:
                  700,
                color:
                  "#334155",
              }}
            >
              No purchase orders found
            </div>

            <div
              style={{
                marginTop:
                  "6px",
              }}
            >
              Create a new purchase order or change your filters.
            </div>

          </div>

        ) : (

          <div
            style={{
              overflowX:
                "auto",
            }}
          >

            <table
              style={{
                width:
                  "100%",
                borderCollapse:
                  "collapse",
              }}
            >

              <thead>

                <tr
                  style={{
                    background:
                      "#f8fafc",
                  }}
                >

                  <th
                    style={headerStyle}
                  >
                    ORDER ID
                  </th>

                  <th
                    style={headerStyle}
                  >
                    SUPPLIER
                  </th>

                  <th
                    style={headerStyle}
                  >
                    ORDER DATE
                  </th>

                  <th
                    style={headerStyle}
                  >
                    ITEMS
                  </th>

                  <th
                    style={headerStyle}
                  >
                    TOTAL
                  </th>

                  <th
                    style={headerStyle}
                  >
                    STATUS
                  </th>

                  <th
                    style={headerStyle}
                  >
                    ACTION
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredPurchases.map(
                  (purchase) => {

                    const status =
                      getStatus(
                        purchase.status
                      );


                    return (

                      <tr
                        key={
                          purchase.id
                        }
                        style={{
                          borderTop:
                            "1px solid #edf1f6",
                        }}
                      >

                        <td
                          style={
                            cellStyle
                          }
                        >
                          <span
                            style={{
                              fontWeight:
                                800,
                              color:
                                "#2563eb",
                            }}
                          >
                            PO-
                            {String(
                              purchase.id ||
                                0
                            ).padStart(
                              4,
                              "0"
                            )}
                          </span>
                        </td>


                        <td
                          style={
                            cellStyle
                          }
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap:
                                "10px",
                            }}
                          >

                            <div
                              style={{
                                width:
                                  "38px",
                                height:
                                  "38px",
                                borderRadius:
                                  "10px",
                                background:
                                  "#eff6ff",
                                color:
                                  "#2563eb",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                              }}
                            >
                              <Truck
                                size={18}
                              />
                            </div>

                            <div>

                              <div
                                style={{
                                  fontWeight:
                                    700,
                                  color:
                                    "#172033",
                                }}
                              >
                                {purchase
                                  .supplier
                                  ?.name ||
                                  "Unknown Supplier"}
                              </div>

                              <div
                                style={{
                                  fontSize:
                                    "12px",
                                  color:
                                    "#94a3b8",
                                  marginTop:
                                    "2px",
                                }}
                              >
                                Supplier
                              </div>

                            </div>

                          </div>

                        </td>


                        <td
                          style={
                            cellStyle
                          }
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap:
                                "8px",
                            }}
                          >
                            <CalendarDays
                              size={17}
                              color="#94a3b8"
                            />

                            {formatDate(
                              purchase.orderDate
                            )}
                          </div>

                        </td>


                        <td
                          style={
                            cellStyle
                          }
                        >
                          <strong>
                            {getPurchaseItemCount(
                              purchase
                            )}
                          </strong>

                          <span
                            style={{
                              marginLeft:
                                "5px",
                              color:
                                "#94a3b8",
                              fontSize:
                                "13px",
                            }}
                          >
                            units
                          </span>
                        </td>


                        <td
                          style={
                            cellStyle
                          }
                        >
                          <strong
                            style={{
                              fontSize:
                                "15px",
                            }}
                          >
                            {formatCurrency(
                              getPurchaseTotal(
                                purchase
                              )
                            )}
                          </strong>
                        </td>


                        <td
                          style={
                            cellStyle
                          }
                        >
                          <StatusBadge
                            status={
                              status
                            }
                          />
                        </td>


                        <td
                          style={
                            cellStyle
                          }
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              gap:
                                "8px",
                            }}
                          >

                            <button
                              onClick={() =>
                                openDetails(
                                  purchase
                                )
                              }
                              title="View details"
                              style={{
                                width:
                                  "40px",
                                height:
                                  "40px",
                                border:
                                  "1px solid #dbe4f0",
                                borderRadius:
                                  "10px",
                                background:
                                  "#ffffff",
                                color:
                                  "#2563eb",
                                cursor:
                                  "pointer",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                              }}
                            >
                              <Eye
                                size={18}
                              />
                            </button>


                            <button
                              onClick={() =>
                                deletePurchase(
                                  purchase
                                )
                              }
                              title="Delete purchase"
                              style={{
                                width:
                                  "40px",
                                height:
                                  "40px",
                                border:
                                  "1px solid #fecdd3",
                                borderRadius:
                                  "10px",
                                background:
                                  "#fff1f2",
                                color:
                                  "#dc2626",
                                cursor:
                                  "pointer",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                              }}
                            >
                              <Trash2
                                size={18}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ======================================================
          ADD PURCHASE MODAL
      ====================================================== */}

      {showAddModal && (

        <div
          style={modalOverlayStyle}
        >

          <div
            style={{
              width:
                "min(900px, 94vw)",
              maxHeight:
                "90vh",
              overflowY:
                "auto",
              background:
                "#ffffff",
              borderRadius:
                "20px",
              boxShadow:
                "0 25px 80px rgba(15,23,42,.25)",
            }}
          >

            {/* Modal header */}

            <div
              style={{
                padding:
                  "24px 28px",
                borderBottom:
                  "1px solid #edf1f6",
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
              }}
            >

              <div>

                <h3
                  style={{
                    margin: 0,
                    fontSize:
                      "24px",
                    fontWeight:
                      800,
                  }}
                >
                  New Purchase Order
                </h3>

                <p
                  style={{
                    margin:
                      "6px 0 0",
                    color:
                      "#71829b",
                  }}
                >
                  Add supplier and medicine purchase details.
                </p>

              </div>


              <button
                onClick={() =>
                  setShowAddModal(
                    false
                  )
                }
                style={closeButtonStyle}
              >
                <X
                  size={20}
                />
              </button>

            </div>


            {/* Modal body */}

            <div
              style={{
                padding:
                  "28px",
              }}
            >

              {/* Supplier */}

              <div
                style={{
                  marginBottom:
                    "22px",
                }}
              >

                <label
                  style={
                    labelStyle
                  }
                >
                  Supplier
                </label>

                <select
                  value={
                    supplierId
                  }
                  onChange={(
                    event
                  ) =>
                    setSupplierId(
                      event.target
                        .value
                    )
                  }
                  style={
                    inputStyle
                  }
                >

                  <option value="">
                    Select supplier
                  </option>

                  {suppliers.map(
                    (supplier) => (

                      <option
                        key={
                          supplier.id
                        }
                        value={
                          supplier.id
                        }
                      >
                        {supplier.name ||
                          `Supplier ${supplier.id}`}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* Status */}

              <div
                style={{
                  marginBottom:
                    "28px",
                }}
              >

                <label
                  style={
                    labelStyle
                  }
                >
                  Order Status
                </label>

                <select
                  value={
                    orderStatus
                  }
                  onChange={(
                    event
                  ) =>
                    setOrderStatus(
                      event.target
                        .value
                    )
                  }
                  style={
                    inputStyle
                  }
                >

                  <option value="PENDING">
                    Pending
                  </option>

                  <option value="COMPLETED">
                    Completed
                  </option>

                  <option value="CANCELLED">
                    Cancelled
                  </option>

                </select>

              </div>


              {/* Medicines */}

              <div>

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    marginBottom:
                      "14px",
                  }}
                >

                  <div>

                    <h4
                      style={{
                        margin:
                          0,
                        fontSize:
                          "18px",
                        fontWeight:
                          800,
                      }}
                    >
                      Medicines
                    </h4>

                    <p
                      style={{
                        margin:
                          "4px 0 0",
                        color:
                          "#71829b",
                        fontSize:
                          "13px",
                      }}
                    >
                      Add medicines included in this purchase.
                    </p>

                  </div>


                  <button
                    type="button"
                    onClick={
                      addItem
                    }
                    style={{
                      border:
                        "1px solid #bfdbfe",
                      background:
                        "#eff6ff",
                      color:
                        "#2563eb",
                      borderRadius:
                        "10px",
                      padding:
                        "9px 13px",
                      cursor:
                        "pointer",
                      fontWeight:
                        700,
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap:
                        "6px",
                    }}
                  >
                    <Plus
                      size={16}
                    />
                    Add Medicine
                  </button>

                </div>


                {orderItems.map(
                  (
                    item,
                    index
                  ) => (

                    <div
                      key={
                        index
                      }
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "2fr 1fr 1fr auto",
                        gap:
                          "10px",
                        marginBottom:
                          "12px",
                      }}
                    >

                      <select
                        value={
                          item.medicineId
                        }
                        onChange={(
                          event
                        ) =>
                          updateItem(
                            index,
                            "medicineId",
                            event
                              .target
                              .value
                          )
                        }
                        style={
                          inputStyle
                        }
                      >

                        <option value="">
                          Select medicine
                        </option>

                        {medicines.map(
                          (
                            medicine
                          ) => (

                            <option
                              key={
                                medicine.id
                              }
                              value={
                                medicine.id
                              }
                            >
                              {medicine.name ||
                                `Medicine ${medicine.id}`}
                            </option>

                          )
                        )}

                      </select>


                      <input
                        type="number"
                        min="1"
                        placeholder="Quantity"
                        value={
                          item.quantity
                        }
                        onChange={(
                          event
                        ) =>
                          updateItem(
                            index,
                            "quantity",
                            event
                              .target
                              .value
                          )
                        }
                        style={
                          inputStyle
                        }
                      />


                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Unit price"
                        value={
                          item.price
                        }
                        onChange={(
                          event
                        ) =>
                          updateItem(
                            index,
                            "price",
                            event
                              .target
                              .value
                          )
                        }
                        style={
                          inputStyle
                        }
                      />


                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            index
                          )
                        }
                        disabled={
                          orderItems.length ===
                          1
                        }
                        style={{
                          width:
                            "46px",
                          border:
                            "1px solid #fecdd3",
                          background:
                            "#fff1f2",
                          color:
                            "#dc2626",
                          borderRadius:
                            "10px",
                          cursor:
                            orderItems.length ===
                            1
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            orderItems.length ===
                            1
                              ? 0.5
                              : 1,
                        }}
                      >
                        <Trash2
                          size={17}
                        />
                      </button>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* Modal footer */}

            <div
              style={{
                padding:
                  "20px 28px",
                borderTop:
                  "1px solid #edf1f6",
                display:
                  "flex",
                justifyContent:
                  "flex-end",
                gap:
                  "10px",
              }}
            >

              <button
                onClick={() =>
                  setShowAddModal(
                    false
                  )
                }
                style={{
                  padding:
                    "12px 18px",
                  border:
                    "1px solid #dbe4f0",
                  borderRadius:
                    "10px",
                  background:
                    "#ffffff",
                  color:
                    "#334155",
                  cursor:
                    "pointer",
                  fontWeight:
                    700,
                }}
              >
                Cancel
              </button>


              <button
                onClick={
                  createPurchase
                }
                disabled={
                  saving
                }
                style={{
                  padding:
                    "12px 20px",
                  border:
                    "none",
                  borderRadius:
                    "10px",
                  background:
                    "#2563eb",
                  color:
                    "#ffffff",
                  cursor:
                    saving
                      ? "not-allowed"
                      : "pointer",
                  fontWeight:
                    700,
                  opacity:
                    saving
                      ? 0.7
                      : 1,
                }}
              >
                {saving
                  ? "Saving..."
                  : "Create Purchase"}
              </button>

            </div>

          </div>

        </div>

      )}


      {/* ======================================================
          DETAILS MODAL
      ====================================================== */}

      {showDetailsModal &&
        selectedPurchase && (

          <div
            style={
              modalOverlayStyle
            }
          >

            <div
              style={{
                width:
                  "min(760px, 94vw)",
                maxHeight:
                  "90vh",
                overflowY:
                  "auto",
                background:
                  "#ffffff",
                borderRadius:
                  "20px",
                boxShadow:
                  "0 25px 80px rgba(15,23,42,.25)",
              }}
            >

              {/* Header */}

              <div
                style={{
                  padding:
                    "24px 28px",
                  borderBottom:
                    "1px solid #edf1f6",
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                }}
              >

                <div>

                  <div
                    style={{
                      color:
                        "#2563eb",
                      fontSize:
                        "13px",
                      fontWeight:
                        800,
                      letterSpacing:
                        "1px",
                    }}
                  >
                    PURCHASE ORDER
                  </div>

                  <h3
                    style={{
                      margin:
                        "5px 0 0",
                      fontSize:
                        "26px",
                      fontWeight:
                        800,
                    }}
                  >
                    PO-
                    {String(
                      selectedPurchase.id ||
                        0
                    ).padStart(
                      4,
                      "0"
                    )}
                  </h3>

                </div>


                <button
                  onClick={() =>
                    setShowDetailsModal(
                      false
                    )
                  }
                  style={
                    closeButtonStyle
                  }
                >
                  <X
                    size={20}
                  />
                </button>

              </div>


              {/* Details */}

              <div
                style={{
                  padding:
                    "28px",
                }}
              >

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(3, 1fr)",
                    gap:
                      "14px",
                    marginBottom:
                      "24px",
                  }}
                >

                  <DetailBox
                    label="Supplier"
                    value={
                      selectedPurchase
                        .supplier
                        ?.name ||
                      "-"
                    }
                  />

                  <DetailBox
                    label="Order Date"
                    value={
                      formatDateTime(
                        selectedPurchase
                          .orderDate
                      )
                    }
                  />

                  <div
                    style={{
                      background:
                        "#f8fafc",
                      borderRadius:
                        "12px",
                      padding:
                        "15px",
                    }}
                  >

                    <div
                      style={{
                        color:
                          "#94a3b8",
                        fontSize:
                          "12px",
                        fontWeight:
                          700,
                        marginBottom:
                          "8px",
                      }}
                    >
                      STATUS
                    </div>

                    <StatusBadge
                      status={getStatus(
                        selectedPurchase
                          .status
                      )}
                    />

                  </div>

                </div>


                {/* Items */}

                <h4
                  style={{
                    margin:
                      "0 0 14px",
                    fontSize:
                      "18px",
                    fontWeight:
                      800,
                  }}
                >
                  Purchased Medicines
                </h4>


                {selectedPurchase
                  .items &&
                selectedPurchase.items
                  .length > 0 ? (

                  <div
                    style={{
                      border:
                        "1px solid #e5eaf1",
                      borderRadius:
                        "14px",
                      overflow:
                        "hidden",
                    }}
                  >

                    <table
                      style={{
                        width:
                          "100%",
                        borderCollapse:
                          "collapse",
                      }}
                    >

                      <thead>

                        <tr
                          style={{
                            background:
                              "#f8fafc",
                          }}
                        >

                          <th
                            style={
                              headerStyle
                            }
                          >
                            MEDICINE
                          </th>

                          <th
                            style={
                              headerStyle
                            }
                          >
                            QUANTITY
                          </th>

                          <th
                            style={
                              headerStyle
                            }
                          >
                            PRICE
                          </th>

                          <th
                            style={
                              headerStyle
                            }
                          >
                            TOTAL
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {selectedPurchase.items.map(
                          (
                            item,
                            index
                          ) => {

                            const quantity =
                              Number(
                                item.quantity ||
                                  0
                              );

                            const price =
                              Number(
                                item.price ||
                                  0
                              );

                            return (

                              <tr
                                key={
                                  item.id ||
                                  index
                                }
                                style={{
                                  borderTop:
                                    "1px solid #edf1f6",
                                }}
                              >

                                <td
                                  style={
                                    cellStyle
                                  }
                                >
                                  {item
                                    .medicine
                                    ?.name ||
                                    "Unknown Medicine"}
                                </td>

                                <td
                                  style={
                                    cellStyle
                                  }
                                >
                                  {quantity}
                                </td>

                                <td
                                  style={
                                    cellStyle
                                  }
                                >
                                  {formatCurrency(
                                    price
                                  )}
                                </td>

                                <td
                                  style={
                                    cellStyle
                                  }
                                >
                                  <strong>
                                    {formatCurrency(
                                      quantity *
                                        price
                                    )}
                                  </strong>
                                </td>

                              </tr>

                            );
                          }
                        )}

                      </tbody>

                    </table>

                  </div>

                ) : (

                  <div
                    style={{
                      padding:
                        "30px",
                      textAlign:
                        "center",
                      background:
                        "#f8fafc",
                      borderRadius:
                        "12px",
                      color:
                        "#71829b",
                    }}
                  >
                    No purchase items available.
                  </div>

                )}


                {/* Total */}

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "flex-end",
                    marginTop:
                      "20px",
                  }}
                >

                  <div
                    style={{
                      background:
                        "#eff6ff",
                      borderRadius:
                        "14px",
                      padding:
                        "18px 22px",
                      minWidth:
                        "230px",
                    }}
                  >

                    <div
                      style={{
                        color:
                          "#64748b",
                        fontSize:
                          "13px",
                        fontWeight:
                          700,
                      }}
                    >
                      TOTAL PURCHASE VALUE
                    </div>

                    <div
                      style={{
                        marginTop:
                          "5px",
                        color:
                          "#172033",
                        fontSize:
                          "24px",
                        fontWeight:
                          800,
                      }}
                    >
                      {formatCurrency(
                        getPurchaseTotal(
                          selectedPurchase
                        )
                      )}
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}


// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({
  status,
}: {
  status: string;
}) {

  const normalized =
    status.toUpperCase();


  let background =
    "#fff7ed";

  let color =
    "#c2410c";

  let icon =
    <Clock size={14} />;


  if (
    normalized ===
    "COMPLETED"
  ) {

    background =
      "#ecfdf5";

    color =
      "#047857";

    icon =
      <CheckCircle
        size={14}
      />;
  }


  if (
    normalized ===
    "CANCELLED"
  ) {

    background =
      "#fff1f2";

    color =
      "#dc2626";

    icon =
      <XCircle
        size={14}
      />;
  }


  return (

    <span
      style={{
        display:
          "inline-flex",
        alignItems:
          "center",
        gap:
          "6px",
        padding:
          "7px 11px",
        borderRadius:
          "999px",
        background,
        color,
        fontSize:
          "12px",
        fontWeight:
          800,
      }}
    >

      {icon}

      {normalized}

    </span>
  );
}


// ============================================================
// DETAIL BOX
// ============================================================

function DetailBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (

    <div
      style={{
        background:
          "#f8fafc",
        borderRadius:
          "12px",
        padding:
          "15px",
      }}
    >

      <div
        style={{
          color:
            "#94a3b8",
          fontSize:
            "12px",
          fontWeight:
            700,
          marginBottom:
            "8px",
        }}
      >
        {label.toUpperCase()}
      </div>

      <div
        style={{
          color:
            "#172033",
          fontSize:
            "15px",
          fontWeight:
            700,
        }}
      >
        {value}
      </div>

    </div>
  );
}


// ============================================================
// STYLES
// ============================================================

const headerStyle:
  React.CSSProperties = {

  textAlign:
    "left",

  padding:
    "15px 18px",

  color:
    "#64748b",

  fontSize:
    "12px",

  fontWeight:
    800,

  letterSpacing:
    "0.7px",

  whiteSpace:
    "nowrap",
};


const cellStyle:
  React.CSSProperties = {

  padding:
    "18px",

  color:
    "#334155",

  fontSize:
    "14px",

  verticalAlign:
    "middle",
};


const inputStyle:
  React.CSSProperties = {

  width:
    "100%",

  height:
    "48px",

  boxSizing:
    "border-box",

  border:
    "1px solid #dbe4f0",

  borderRadius:
    "10px",

  padding:
    "0 13px",

  fontSize:
    "14px",

  color:
    "#172033",

  background:
    "#ffffff",

  outline:
    "none",
};


const labelStyle:
  React.CSSProperties = {

  display:
    "block",

  marginBottom:
    "8px",

  color:
    "#334155",

  fontSize:
    "14px",

  fontWeight:
    700,
};


const modalOverlayStyle:
  React.CSSProperties = {

  position:
    "fixed",

  inset: 0,

  zIndex:
    1000,

  background:
    "rgba(15,23,42,.55)",

  display:
    "flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  padding:
    "20px",
};


const closeButtonStyle:
  React.CSSProperties = {

  width:
    "40px",

  height:
    "40px",

  border:
    "1px solid #dbe4f0",

  borderRadius:
    "10px",

  background:
    "#ffffff",

  color:
    "#64748b",

  cursor:
    "pointer",

  display:
    "flex",

  alignItems:
    "center",

  justifyContent:
    "center",
};