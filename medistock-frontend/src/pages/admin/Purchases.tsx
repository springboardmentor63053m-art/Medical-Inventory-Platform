import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/api/axios";
import "../../styles/purchases.css";

interface Supplier {
  id: number;
  name: string;
}

interface PurchaseOrder {
  id: number;
  supplier: Supplier;
  orderDate: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  expectedDelivery: string;
  totalAmount: number;
  items: number;
}

const SAMPLE_PURCHASES: PurchaseOrder[] = [
  {
    id: 1001,
    supplier: { id: 1, name: "HealthCare Pvt Ltd" },
    orderDate: "2026-08-08",
    status: "PENDING",
    expectedDelivery: "2026-08-15",
    totalAmount: 28500,
    items: 4,
  },
  {
    id: 1002,
    supplier: { id: 2, name: "MedPlus Distributors" },
    orderDate: "2026-08-05",
    status: "COMPLETED",
    expectedDelivery: "2026-08-10",
    totalAmount: 42600,
    items: 6,
  },
  {
    id: 1003,
    supplier: { id: 3, name: "LifeLine Suppliers" },
    orderDate: "2026-08-02",
    status: "PENDING",
    expectedDelivery: "2026-08-12",
    totalAmount: 18950,
    items: 3,
  },
  {
    id: 1004,
    supplier: { id: 4, name: "CareWell Pharma" },
    orderDate: "2026-07-28",
    status: "CANCELLED",
    expectedDelivery: "2026-08-04",
    totalAmount: 12750,
    items: 2,
  },
  {
    id: 1005,
    supplier: { id: 5, name: "MediCorp Solutions" },
    orderDate: "2026-07-24",
    status: "COMPLETED",
    expectedDelivery: "2026-07-30",
    totalAmount: 56300,
    items: 8,
  },
];

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const dateLabel = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function Purchases() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(SAMPLE_PURCHASES);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [availableSuppliers, setAvailableSuppliers] = useState<any[]>([]);
  const [availableMedicines, setAvailableMedicines] = useState<any[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>("");
  const [medicineQuantity, setMedicineQuantity] = useState<string>("10");
  const [newAmount, setNewAmount] = useState("15000");
  const [newDate, setNewDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [newDelivery, setNewDelivery] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  interface SelectedOrderItem {
    medicineId: number;
    medicineName: string;
    quantity: number;
    price: number;
  }

  const [orderItems, setOrderItems] = useState<SelectedOrderItem[]>([]);
  const [notice, setNotice] = useState("");

  const currentSelectedMed = useMemo(() => {
    return availableMedicines.find(
      (m) => String(m.id) === String(selectedMedicineId)
    );
  }, [availableMedicines, selectedMedicineId]);

  const currentUnitPrice = currentSelectedMed?.price
    ? Number(currentSelectedMed.price)
    : 50;

  useEffect(() => {
    if (orderItems.length > 0) {
      const total = orderItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
      );
      setNewAmount(String(total));
    } else {
      const qty = Number(medicineQuantity) || 0;
      const total = currentUnitPrice * qty;
      setNewAmount(String(total));
    }
  }, [orderItems, medicineQuantity, currentUnitPrice]);

  const addMedicineToOrder = () => {
    const med = availableMedicines.find(
      (m) => String(m.id) === String(selectedMedicineId)
    );
    const medName = med?.name || "Medicine";
    const medPrice = med?.price ? Number(med.price) : 50;
    const qty = Number(medicineQuantity) || 10;
    const medId = selectedMedicineId ? Number(selectedMedicineId) : 1;

    setOrderItems((prev) => [
      ...prev,
      {
        medicineId: medId,
        medicineName: medName,
        quantity: qty,
        price: medPrice,
      },
    ]);
  };

  const removeMedicineFromOrder = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const loadSuppliersAndMedicines = async () => {
    try {
      const supRes = await axiosInstance.get("/suppliers");
      if (Array.isArray(supRes.data)) {
        setAvailableSuppliers(supRes.data);
        if (supRes.data.length > 0) {
          setSelectedSupplierId(String(supRes.data[0].id));
        }
      }
    } catch {
      // Fallback
    }

    try {
      const medRes = await axiosInstance.get("/medicines");
      if (Array.isArray(medRes.data)) {
        setAvailableMedicines(medRes.data);
        if (medRes.data.length > 0) {
          setSelectedMedicineId(String(medRes.data[0].id));
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openModal = () => {
    loadSuppliersAndMedicines();
    setShowModal(true);
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const supName = order?.supplier?.name || "";
      const matchesSearch =
        !query ||
        String(order?.id || "").includes(query) ||
        supName.toLowerCase().includes(query);

      const matchesStatus =
        status === "ALL" || order?.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, status]);

  const summary = useMemo(() => {
    const pending = orders.filter(
      (order) => order.status === "PENDING"
    ).length;

    const completed = orders.filter(
      (order) => order.status === "COMPLETED"
    ).length;

    const cancelled = orders.filter(
      (order) => order.status === "CANCELLED"
    ).length;

    const value = orders.reduce(
      (total, order) => total + order.totalAmount,
      0
    );

    return {
      total: orders.length,
      pending,
      completed,
      cancelled,
      value,
    };
  }, [orders]);

  const refresh = async () => {
    setNotice("");

    try {
      const token = localStorage.getItem("token");

      const apiBase = import.meta.env.VITE_API_URL || "/api";
      const response = await fetch(
        `${apiBase}/purchaseorders`,
        {
          headers: {
            Accept: "application/json",
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Purchase API unavailable");
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const mapped: PurchaseOrder[] = data.map(
          (item: any, index: number) => ({
            id: Number(item.id ?? 1001 + index),
            supplier: {
              id: Number(item.supplier?.id ?? 0),
              name:
                item.supplier?.name ??
                item.supplierName ??
                "Supplier",
            },
            orderDate:
              String(item.orderDate ?? "").slice(0, 10) ||
              new Date().toISOString().slice(0, 10),
            status:
              item.status === "COMPLETED" ||
              item.status === "CANCELLED"
                ? item.status
                : "PENDING",
            expectedDelivery:
              String(
                item.expectedDelivery ??
                  item.deliveryDate ??
                  item.orderDate ??
                  ""
              ).slice(0, 10) ||
              new Date().toISOString().slice(0, 10),
            totalAmount: Number(
              item.totalAmount ??
                (Array.isArray(item.items) && item.items.length > 0
                  ? item.items.reduce(
                      (sum: number, row: any) =>
                        sum +
                        Number(row.quantity ?? 0) *
                          Number(row.price ?? row.medicine?.price ?? 0),
                      0
                    )
                  : 0)
            ),
            items: Array.isArray(item.items) && item.items.length > 0
              ? item.items.length
              : 1,
          })
        );

        setOrders(mapped);
        setNotice("Purchase orders refreshed from the server.");
      } else {
        setOrders(SAMPLE_PURCHASES);
      }
    } catch {
      setOrders(SAMPLE_PURCHASES);
    }
  };

  const createPurchase = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const selectedSupObj = availableSuppliers.find(
      (s) => String(s.id) === String(selectedSupplierId)
    );
    const supName = selectedSupObj?.name || "Supplier";
    const supId = selectedSupplierId ? Number(selectedSupplierId) : 1;

    const payloadItems =
      orderItems.length > 0
        ? orderItems.map((item) => ({
            medicine: { id: item.medicineId },
            quantity: item.quantity,
            price: item.price > 0 ? item.price : currentUnitPrice,
          }))
        : [
            {
              medicine: { id: selectedMedicineId ? Number(selectedMedicineId) : 1 },
              quantity: Number(medicineQuantity) || 10,
              price: currentUnitPrice > 0 ? currentUnitPrice : 50,
            },
          ];

    try {
      const response = await axiosInstance.post("/purchaseorders", {
        supplier: { id: supId },
        orderDate: `${newDate}T09:00:00`,
        status: "PENDING",
        items: payloadItems,
      });

      if (response.data) {
        setNotice(
          `Stock Order #PO-${response.data.id} created successfully for ${supName} with ${payloadItems.length} medicine(s)! Supplier notified.`
        );
        setOrderItems([]);
        refresh();
      }
    } catch (err) {
      setNotice("Could not save purchase order to backend.");
    }

    setShowModal(false);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("ALL");
  };

  return (
    <div className="purchases-page">
      <div className="purchases-heading">
        <div>
          <div className="purchases-eyebrow">PROCUREMENT</div>
          <h1>Purchase Orders</h1>
          <p>
            Create, monitor and manage medicine purchases,
            suppliers and procurement history.
          </p>
        </div>

        <div className="purchases-heading-actions">
          <button
            className="purchase-refresh"
            onClick={refresh}
          >
            ↻ Refresh
          </button>

          <button
            className="purchase-primary"
            onClick={openModal}
          >
            + New Purchase
          </button>
        </div>
      </div>

      {notice && (
        <div className="purchase-notice">
          <span>ⓘ</span>
          {notice}
        </div>
      )}

      <div className="purchase-summary-grid">
        <div className="purchase-stat">
          <div className="purchase-stat-icon blue">🛒</div>
          <div>
            <span>Total Purchases</span>
            <strong>{summary.total}</strong>
            <small>Purchase orders</small>
          </div>
        </div>

        <div className="purchase-stat">
          <div className="purchase-stat-icon orange">◷</div>
          <div>
            <span>Pending</span>
            <strong>{summary.pending}</strong>
            <small>Awaiting delivery</small>
          </div>
        </div>

        <div className="purchase-stat">
          <div className="purchase-stat-icon green">✓</div>
          <div>
            <span>Completed</span>
            <strong>{summary.completed}</strong>
            <small>Successfully received</small>
          </div>
        </div>

        <div className="purchase-stat">
          <div className="purchase-stat-icon purple">₹</div>
          <div>
            <span>Purchase Value</span>
            <strong>{money(summary.value)}</strong>
            <small>Total order value</small>
          </div>
        </div>
      </div>

      <section className="purchase-filter-card">
        <div className="purchase-search">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by purchase ID or supplier..."
          />
          {search && (
            <button
              className="purchase-search-clear"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}
        </div>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        {(search || status !== "ALL") && (
          <button
            className="purchase-clear"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}
      </section>

      <section className="purchase-table-card">
        <div className="purchase-table-header">
          <div>
            <h2>Purchase Orders</h2>
            <p>
              Showing {filteredOrders.length} of{" "}
              {orders.length} purchase orders
            </p>
          </div>
        </div>

        <div className="purchase-table-scroll">
          <table className="purchase-table">
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>SUPPLIER</th>
                <th>ORDER DATE</th>
                <th>EXPECTED DELIVERY</th>
                <th>ITEMS</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="purchase-empty"
                  >
                    <div>⌕</div>
                    <strong>No purchase orders found</strong>
                    <span>
                      Try changing your search or status
                      filter.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong className="purchase-id">
                        PO-{order.id}
                      </strong>
                    </td>

                    <td>
                      <div className="purchase-supplier">
                        <strong>
                          {order.supplier?.name || "Supplier"}
                        </strong>
                        <span>
                          Supplier #{order.supplier?.id || "—"}
                        </span>
                      </div>
                    </td>

                    <td>{dateLabel(order.orderDate)}</td>

                    <td>
                      {dateLabel(order.expectedDelivery)}
                    </td>

                    <td>
                      <span className="purchase-items">
                        {order.items} items
                      </span>
                    </td>

                    <td>
                      <strong className="purchase-amount">
                        {money(order.totalAmount)}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`purchase-status ${order.status.toLowerCase()}`}
                      >
                        <i />
                        {order.status === "PENDING"
                          ? "Pending"
                          : order.status === "COMPLETED"
                          ? "Completed"
                          : "Cancelled"}
                      </span>
                    </td>

                    <td>
                      <button
                        className="purchase-view"
                        onClick={() =>
                          window.alert(
                            `Purchase Order: PO-${order.id}\nSupplier: ${order.supplier.name}\nOrder Date: ${dateLabel(order.orderDate)}\nExpected Delivery: ${dateLabel(order.expectedDelivery)}\nItems: ${order.items}\nAmount: ${money(order.totalAmount)}\nStatus: ${order.status}`
                          )
                        }
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <div
          className="purchase-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="purchase-modal">
            <div className="purchase-modal-header">
              <div>
                <div className="purchases-eyebrow">
                  PROCUREMENT
                </div>
                <h2>Create Stock Order</h2>
                <p>
                  Create a new stock/purchase order for a supplier.
                </p>
              </div>

              <button
                className="purchase-modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={createPurchase}>
              <label>
                Select Supplier
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    marginTop: "4px",
                    marginBottom: "16px",
                  }}
                >
                  {availableSuppliers.length === 0 ? (
                    <option value="1">ABC Suppliers</option>
                  ) : (
                    availableSuppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.email || "Supplier"})
                      </option>
                    ))
                  )}
                </select>
              </label>

              <div className="purchase-form-grid">
                <label>
                  Select Medicine
                  <select
                    value={selectedMedicineId}
                    onChange={(e) => setSelectedMedicineId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      marginTop: "4px",
                    }}
                  >
                    {availableMedicines.length === 0 ? (
                      <option value="1">Paracetamol 500mg</option>
                    ) : (
                      availableMedicines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.category || "Medicine"}) — ₹{m.price ? Number(m.price).toFixed(2) : "50.00"}
                        </option>
                      ))
                    )}
                  </select>
                  <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
                    Unit Price: <strong>₹{currentUnitPrice.toFixed(2)}</strong>
                  </span>
                </label>

                <label>
                  Requested Quantity
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <input
                      type="number"
                      min="1"
                      value={medicineQuantity}
                      onChange={(e) => setMedicineQuantity(e.target.value)}
                      placeholder="Qty"
                      style={{ width: "80px" }}
                    />
                    <button
                      type="button"
                      onClick={addMedicineToOrder}
                      style={{
                        padding: "8px 14px",
                        background: "#059669",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      + Add Medicine
                    </button>
                  </div>
                  <span style={{ fontSize: "11px", color: "#2563eb", marginTop: "4px", display: "block" }}>
                    Subtotal: <strong>₹{(currentUnitPrice * (Number(medicineQuantity) || 0)).toLocaleString("en-IN")}</strong>
                  </span>
                </label>
              </div>

              {/* ADDED MEDICINES LIST IN MODAL */}
              {orderItems.length > 0 && (
                <div style={{ marginTop: "16px", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "8px" }}>
                    Selected Medicines ({orderItems.length})
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {orderItems.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}>
                        <span>
                          <strong>{item.medicineName}</strong> — {item.quantity} Units
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMedicineFromOrder(idx)}
                          style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: "16px", cursor: "pointer", fontWeight: "bold" }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="purchase-form-grid" style={{ marginTop: "16px" }}>
                <label>
                  Order Date
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </label>

                <label>
                  Expected Delivery
                  <input
                    type="date"
                    value={newDelivery}
                    onChange={(e) => setNewDelivery(e.target.value)}
                  />
                </label>
              </div>

              <label style={{ marginTop: "16px", display: "block" }}>
                Total Order Amount (₹)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="Enter purchase amount"
                />
              </label>

              <div className="purchase-modal-actions" style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  className="purchase-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="purchase-primary"
                >
                  Create Stock Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
