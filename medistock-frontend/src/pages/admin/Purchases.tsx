import { useMemo, useState } from "react";
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
  const [newSupplier, setNewSupplier] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDate, setNewDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [newDelivery, setNewDelivery] = useState("");
  const [notice, setNotice] = useState("");

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        String(order.id).includes(query) ||
        order.supplier.name.toLowerCase().includes(query);

      const matchesStatus =
        status === "ALL" || order.status === status;

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

      const response = await fetch(
        "http://localhost:8080/api/purchaseorders",
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
                item.items?.reduce(
                  (sum: number, row: any) =>
                    sum +
                    Number(row.quantity ?? 0) *
                      Number(row.price ?? 0),
                  0
                ) ??
                0
            ),
            items: Array.isArray(item.items)
              ? item.items.length
              : Number(item.itemCount ?? 0),
          })
        );

        setOrders(mapped);
        setNotice("Purchase orders refreshed from the server.");
      } else {
        setOrders(SAMPLE_PURCHASES);
        setNotice(
          "No purchase orders were returned, so sample purchase data is displayed."
        );
      }
    } catch {
      setOrders(SAMPLE_PURCHASES);
      setNotice(
        "Purchase service is unavailable, so sample purchase data is displayed."
      );
    }
  };

  const createPurchase = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!newSupplier.trim() || !newAmount || !newDelivery) {
      setNotice("Please complete supplier, amount and delivery date.");
      return;
    }

    const nextId =
      Math.max(...orders.map((order) => order.id), 1000) + 1;

    const order: PurchaseOrder = {
      id: nextId,
      supplier: {
        id: 0,
        name: newSupplier.trim(),
      },
      orderDate: newDate,
      status: "PENDING",
      expectedDelivery: newDelivery,
      totalAmount: Number(newAmount),
      items: 1,
    };

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8080/api/purchaseorders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
          body: JSON.stringify({
            supplier: { id: order.supplier.id },
            orderDate: `${newDate}T09:00:00`,
            status: "PENDING",
          }),
        }
      );

      if (response.ok) {
        const saved = await response.json();

        order.id = Number(saved.id ?? nextId);
        setOrders((current) => [order, ...current]);
        setNotice("Purchase order created successfully.");
      } else {
        setOrders((current) => [order, ...current]);
        setNotice(
          "Purchase order added to the current screen. Backend rejected the request."
        );
      }
    } catch {
      setOrders((current) => [order, ...current]);
      setNotice(
        "Purchase order added to the current screen. Start the backend to save it permanently."
      );
    }

    setNewSupplier("");
    setNewAmount("");
    setNewDate(new Date().toISOString().slice(0, 10));
    setNewDelivery("");
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
            onClick={() => setShowModal(true)}
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
                          {order.supplier.name}
                        </strong>
                        <span>
                          Supplier #{order.supplier.id || "—"}
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
                <h2>Create Purchase Order</h2>
                <p>
                  Add a new medicine procurement order.
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
                Supplier
                <input
                  value={newSupplier}
                  onChange={(event) =>
                    setNewSupplier(event.target.value)
                  }
                  placeholder="Enter supplier name"
                />
              </label>

              <div className="purchase-form-grid">
                <label>
                  Order Date
                  <input
                    type="date"
                    value={newDate}
                    onChange={(event) =>
                      setNewDate(event.target.value)
                    }
                  />
                </label>

                <label>
                  Expected Delivery
                  <input
                    type="date"
                    value={newDelivery}
                    onChange={(event) =>
                      setNewDelivery(event.target.value)
                    }
                  />
                </label>
              </div>

              <label>
                Total Amount
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newAmount}
                  onChange={(event) =>
                    setNewAmount(event.target.value)
                  }
                  placeholder="Enter purchase amount"
                />
              </label>

              <div className="purchase-modal-actions">
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
                  Create Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
