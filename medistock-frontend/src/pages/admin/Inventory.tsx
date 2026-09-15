import { useEffect, useMemo, useState } from "react";
import "./Inventory.css";

interface Supplier {
  id?: number;
  name?: string;
  contact?: string;
  email?: string;
}

interface Medicine {
  id?: number;
  name?: string;
  description?: string;
  category?: string;

  price?: number;

  stockQuantity?: number;
  stock_quantity?: number;

  expiryDate?: string;
  expiry_date?: string;

  dosage?: string;
  supplier?: Supplier | null;
}

interface InventoryItem {
  id: number;

  medicine?: Medicine;
  supplier?: Supplier | null;

  batchNumber?: string;

  quantity?: number;
  stockQuantity?: number;

  reorderLevel?: number;

  expiryDate?: string;

  purchasePrice?: number;
  sellingPrice?: number;

  location?: string;
}

type StockStatus = "available" | "low" | "out";

function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [stockStatus, setStockStatus] = useState("all");
  

  const API_URL = (import.meta.env.VITE_API_URL || "/api") + "/medicines";

  // ============================================================
  // LOAD INVENTORY FROM MEDICINES DATABASE
  // ============================================================

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(API_URL, {
        method: "GET",

        headers: {
          Accept: "application/json",

          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      });

      if (response.status === 401) {
        setError(
          "Authentication required. Please log in again."
        );

        setInventory([]);

        return;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to load medicines (${response.status})`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        setInventory([]);

        setError(
          "Invalid medicine data received from server."
        );

        return;
      }

      // ========================================================
      // CONVERT MEDICINE DATA INTO INVENTORY DATA
      // ========================================================

      const inventoryData: InventoryItem[] =
        data.map((medicine: Medicine) => {
          const quantity = Number(
            medicine.stockQuantity ??
              medicine.stock_quantity ??
              0
          );

          const expiryDate =
            medicine.expiryDate ??
            medicine.expiry_date;

          const supplier =
            medicine.supplier ?? null;

          return {
            id: Number(medicine.id),

            medicine: medicine,

            supplier: supplier,

            batchNumber:
              `MED-${String(
                medicine.id
              ).padStart(4, "0")}`,

            quantity: quantity,

            stockQuantity: quantity,

            reorderLevel: 20,

            expiryDate: expiryDate,

            purchasePrice: medicine.price,

            sellingPrice: medicine.price,

            location: "Main Store",
          };
        });

      setInventory(inventoryData);

    } catch (err) {
      console.error(
        "Failed to load inventory:",
        err
      );

      setError(
        "Unable to load inventory from the medicine service."
      );

      setInventory([]);

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadInventory();
  }, []);

  // ============================================================
  // GET QUANTITY
  // ============================================================

  const getQuantity = (
    item: InventoryItem
  ) => {
    return Number(
      item.quantity ??
        item.stockQuantity ??
        item.medicine?.stockQuantity ??
        item.medicine?.stock_quantity ??
        0
    );
  };

  // ============================================================
  // GET REORDER LEVEL
  // ============================================================

  const getReorderLevel = (
    item: InventoryItem
  ) => {
    return Number(
      item.reorderLevel ?? 20
    );
  };

  // ============================================================
  // STOCK STATUS
  // ============================================================

  const getStockStatus = (
    item: InventoryItem
  ): StockStatus => {
    const quantity =
      getQuantity(item);

    const reorderLevel =
      getReorderLevel(item);

    if (quantity <= 0) {
      return "out";
    }

    if (quantity <= reorderLevel) {
      return "low";
    }

    return "available";
  };

  // ============================================================
  // STOCK LABEL
  // ============================================================

  const getStockLabel = (
    item: InventoryItem
  ) => {
    const status =
      getStockStatus(item);

    if (status === "out") {
      return "Out of Stock";
    }

    if (status === "low") {
      return "Low Stock";
    }

    return "In Stock";
  };

  // ============================================================
  // EXPIRY STATUS
  // ============================================================

  const getExpiryStatus = (
    date?: string
  ) => {
    if (!date) {
      return "unknown";
    }

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const expiry =
      new Date(date);

    expiry.setHours(
      0,
      0,
      0,
      0
    );

    if (
      Number.isNaN(
        expiry.getTime()
      )
    ) {
      return "unknown";
    }

    if (expiry < today) {
      return "expired";
    }

    const difference =
      (expiry.getTime() -
        today.getTime()) /
      (1000 * 60 * 60 * 24);

    if (difference <= 30) {
      return "soon";
    }

    return "valid";
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (
    date?: string
  ) => {
    if (!date) {
      return "Not provided";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "Not provided";
    }

    return parsed.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ============================================================
  // GET MEDICINE NAME
  // ============================================================

  const getMedicineName = (
    item: InventoryItem
  ) => {
    return (
      item.medicine?.name ||
      "Medicine not provided"
    );
  };

  // ============================================================
  // GET SUPPLIER NAME
  // ============================================================

  const getSupplierName = (
    item: InventoryItem
  ) => {
    return (
      item.supplier?.name ||
      item.medicine?.supplier?.name ||
      "Not provided"
    );
  };

  // ============================================================
  // GET EXPIRY DATE
  // ============================================================

  const getItemExpiryDate = (
    item: InventoryItem
  ) => {
    return (
      item.expiryDate ??
      item.medicine?.expiryDate ??
      item.medicine?.expiry_date
    );
  };

  // ============================================================
  // FILTER INVENTORY
  // ============================================================

  const filteredInventory =
    useMemo(() => {
      return inventory.filter(
        (item) => {

          const searchText =
            search
              .trim()
              .toLowerCase();

          const medicineName =
            getMedicineName(
              item
            ).toLowerCase();

          const supplierName =
            getSupplierName(
              item
            ).toLowerCase();

          const batchNumber =
            item.batchNumber
              ?.toLowerCase() ||
            "";

          const category =
            item.medicine?.category
              ?.toLowerCase() ||
            "";

          const matchesSearch =
            !searchText ||
            medicineName.includes(
              searchText
            ) ||
            supplierName.includes(
              searchText
            ) ||
            batchNumber.includes(
              searchText
            ) ||
            category.includes(
              searchText
            );

          const stock =
            getStockStatus(item);

          const matchesStock =
            stockStatus === "all" ||
            stock === stockStatus;

          return (
            matchesSearch &&
            matchesStock
          );
        }
      );
    }, [
      inventory,
      search,
      stockStatus,
    ]);

  // ============================================================
  // SUMMARY
  // ============================================================

  const summary =
    useMemo(() => {

      let totalUnits = 0;

      let available = 0;

      let low = 0;

      let out = 0;

      inventory.forEach(
        (item) => {

          totalUnits +=
            getQuantity(item);

          const status =
            getStockStatus(item);

          if (
            status ===
            "available"
          ) {
            available++;
          }

          if (
            status === "low"
          ) {
            low++;
          }

          if (
            status === "out"
          ) {
            out++;
          }
        }
      );

      return {
        total:
          inventory.length,

        totalUnits,

        available,

        low,

        out,
      };

    }, [inventory]);

  // ============================================================
  // VIEW DETAILS
  // ============================================================

  const handleView = (
    item: InventoryItem
  ) => {

    window.alert(
      [
        `Medicine: ${getMedicineName(
          item
        )}`,

        `Category: ${
          item.medicine?.category ||
          "Not provided"
        }`,

        `Batch: ${
          item.batchNumber ||
          "Not provided"
        }`,

        `Quantity: ${getQuantity(
          item
        )}`,

        `Reorder Level: ${getReorderLevel(
          item
        )}`,

        `Supplier: ${getSupplierName(
          item
        )}`,

        `Expiry: ${formatDate(
          getItemExpiryDate(item)
        )}`,

        `Price: ₹${
          Number(
            item.medicine?.price ??
              item.sellingPrice ??
              0
          ).toFixed(2)
        }`,

        `Location: ${
          item.location ||
          "Main Store"
        }`,
      ].join("\n")
    );
  };

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {
    setSearch("");
    setStockStatus("all");
  };

  const hasFilters = Boolean(search) || stockStatus !== "all";

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="inventory-content-only">

      {/* PAGE HEADER */}

      <div className="inventory-heading">

        <div>

          <div className="inventory-eyebrow">
            STOCK CONTROL
          </div>

          <h1>
            Inventory
          </h1>

          <p>
            Monitor stock levels,
            batches, expiry dates
            and reorder requirements.
          </p>

        </div>

        <button
          className="inventory-refresh"
          onClick={loadInventory}
          disabled={loading}
        >
          <span>↻</span>

          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>

      {/* FILTER BAR */}

      <section className="inventory-filter-panel">

        <div className="inventory-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search medicine, batch or supplier..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

          {search && (
            <button
              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>
          )}

        </div>

        <select
          value={stockStatus}
          onChange={(e) =>
            setStockStatus(
              e.target.value
            )
          }
        >

          <option value="all">
            All stock
          </option>

          <option value="available">
            In stock
          </option>

          <option value="low">
            Low stock
          </option>

          <option value="out">
            Out of stock
          </option>

        </select>

      </section>

      {/* SUMMARY */}

      <div className="inventory-summary">

        <div className="inventory-summary-left">

          <strong>
            {filteredInventory.length}
          </strong>

          <span>
            inventory records
          </span>

        </div>

        <div className="inventory-summary-right">

          <button
            onClick={() =>
              setStockStatus(
                stockStatus ===
                  "available"
                  ? "all"
                  : "available"
              )
            }
          >
            <i className="dot green"></i>

            {summary.available}
            {" "}In stock
          </button>

          <button
            onClick={() =>
              setStockStatus(
                stockStatus ===
                  "low"
                  ? "all"
                  : "low"
              )
            }
          >
            <i className="dot amber"></i>

            {summary.low}
            {" "}Low stock
          </button>

          <button
            onClick={() =>
              setStockStatus(
                stockStatus ===
                  "out"
                  ? "all"
                  : "out"
              )
            }
          >
            <i className="dot red"></i>

            {summary.out}
            {" "}Out of stock
          </button>

          {hasFilters && (
            <button
              className="inventory-clear"
              onClick={
                clearFilters
              }
            >
              Clear filters
            </button>
          )}

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="inventory-error">

          <div className="inventory-error-icon">
            !
          </div>

          <div>

            <strong>
              Unable to load inventory
            </strong>

            <p>
              {error}
            </p>

          </div>

          <button
            onClick={
              loadInventory
            }
          >
            Try again
          </button>

        </div>
      )}

      {/* INVENTORY TABLE */}

      <section className="inventory-table-card">

        <div className="inventory-table-scroll">

          <table>

            <thead>

              <tr>

                <th>
                  MEDICINE
                </th>

                <th>
                  BATCH NO.
                </th>

                <th>
                  SUPPLIER
                </th>

                <th>
                  QUANTITY
                </th>

                <th>
                  STOCK
                </th>

                <th>
                  LOCATION
                </th>

                <th>
                  ACTION
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan={7}
                    className="inventory-message"
                  >
                    Loading inventory...
                  </td>

                </tr>

              ) : filteredInventory.length ===
                0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="inventory-message empty"
                  >

                    <div>
                      ⌕
                    </div>

                    <strong>
                      No inventory found
                    </strong>

                    <span>
                      Try changing your
                      search or filters.
                    </span>

                  </td>

                </tr>

              ) : (

                filteredInventory.map(
                  (item) => {

                    const quantity =
                      getQuantity(item);

                    const stock =
                      getStockStatus(item);

                    const expiry =
                      getExpiryStatus(
                        getItemExpiryDate(
                          item
                        )
                      );

                    return (

                      <tr
                        key={item.id}
                      >

                        {/* MEDICINE */}

                        <td>

                          <div className="inventory-medicine">

                            <strong>
                              {getMedicineName(
                                item
                              )}
                            </strong>

                            <span>
                              ID #
                              {item.medicine?.id ??
                                item.id}
                            </span>

                            {item.medicine
                              ?.category && (
                              <small>
                                {
                                  item
                                    .medicine
                                    .category
                                }
                              </small>
                            )}

                          </div>

                        </td>

                        {/* BATCH */}

                        <td>

                          <span className="inventory-batch">

                            {item.batchNumber ||
                              `MED-${String(
                                item.id
                              ).padStart(
                                4,
                                "0"
                              )}`}

                          </span>

                        </td>

                        {/* SUPPLIER */}

                        <td>

                          <span className="inventory-supplier">

                            {getSupplierName(
                              item
                            )}

                          </span>

                        </td>

                        {/* QUANTITY */}

                        <td>

                          <div className="inventory-quantity">

                            <strong>
                              {quantity}
                            </strong>

                            <span>
                              Reorder:{" "}
                              {getReorderLevel(
                                item
                              )}
                            </span>

                          </div>

                        </td>

                        {/* STOCK */}

                        <td>

                          <span
                            className={`inventory-stock ${stock}`}
                          >

                            <i></i>

                            {getStockLabel(
                              item
                            )}

                          </span>

                        </td>

                        {/* LOCATION */}

                        <td>

                          <span className="inventory-location">

                            {item.location ||
                              "Main Store"}

                          </span>

                        </td>

                        {/* ACTION */}

                        <td>

                          <button
                            className="inventory-view"
                            onClick={() =>
                              handleView(
                                item
                              )
                            }
                          >

                            View

                            <span>
                              →
                            </span>

                          </button>

                        </td>

                      </tr>

                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

        {/* FOOTER */}

        {!loading &&
          filteredInventory.length >
            0 && (

            <div className="inventory-footer">

              <span>

                Showing{" "}

                <strong>
                  {
                    filteredInventory.length
                  }
                </strong>

                {" "}of{" "}

                <strong>
                  {inventory.length}
                </strong>

                {" "}records

              </span>

              <span>

                Total units:{" "}

                <strong>
                  {summary.totalUnits}
                </strong>

              </span>

            </div>

          )}

      </section>

    </div>
  );
}

export default Inventory;
