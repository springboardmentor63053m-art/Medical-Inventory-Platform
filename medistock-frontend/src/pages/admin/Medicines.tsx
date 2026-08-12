import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CrudService } from "@/api/crudService";
import { toast } from "sonner";
import {
  Search,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  CalendarDays,
  IndianRupee,
} from "lucide-react";

interface Supplier {
  id?: number;
  name?: string;
}

interface Medicine {
  id: number;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  supplier?: Supplier;
  supplierId?: number;

  batchNumber?: string;
  batchNo?: string;

  quantity?: number;
  stockQuantity?: number;
  stock?: number;

  expiryDate?: string;
  expiry?: string;

  dosage?: string;
  ageGroup?: string;
}

type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

const LOW_STOCK_LIMIT = 10;

export default function Medicines() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all");

  const medicineService = new CrudService<Medicine>("/medicines");

  const loadMedicines = async () => {
    try {
      setLoading(true);

      const data = await medicineService.getAll();

      setMedicines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load medicines:", error);
      toast.error("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const getQuantity = (medicine: Medicine) => {
    if (typeof medicine.quantity === "number") {
      return medicine.quantity;
    }

    if (typeof medicine.stockQuantity === "number") {
      return medicine.stockQuantity;
    }

    if (typeof medicine.stock === "number") {
      return medicine.stock;
    }

    return 0;
  };

  const getBatchNumber = (medicine: Medicine) => {
    return (
      medicine.batchNumber ||
      medicine.batchNo ||
      `MED-${String(medicine.id).padStart(4, "0")}`
    );
  };

  const getExpiryDate = (medicine: Medicine) => {
    return medicine.expiryDate || medicine.expiry || "";
  };

  const getStockStatus = (medicine: Medicine): StockStatus => {
    const quantity = getQuantity(medicine);

    if (quantity <= 0) {
      return "Out of Stock";
    }

    if (quantity <= LOW_STOCK_LIMIT) {
      return "Low Stock";
    }

    return "In Stock";
  };

  const formatDate = (date?: string) => {
    if (!date) {
      return "Not set";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isExpired = (date?: string) => {
    if (!date) {
      return false;
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return false;
    }

    return parsedDate < new Date();
  };

  const getExpiryStatus = (medicine: Medicine) => {
    const date = getExpiryDate(medicine);

    if (!date) {
      return "Not Set";
    }

    if (isExpired(date)) {
      return "Expired";
    }

    return "Valid";
  };

  const categories = useMemo(() => {
    const values = medicines
      .map((medicine) => medicine.category)
      .filter(
        (category): category is string =>
          typeof category === "string" && category.trim().length > 0
      );

    return Array.from(new Set(values)).sort();
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return medicines.filter((medicine) => {
      const medicineName = medicine.name?.toLowerCase() || "";
      const description = medicine.description?.toLowerCase() || "";
      const category = medicine.category?.toLowerCase() || "";
      const batch = getBatchNumber(medicine).toLowerCase();
      const supplier = medicine.supplier?.name?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        medicineName.includes(searchValue) ||
        description.includes(searchValue) ||
        category.includes(searchValue) ||
        batch.includes(searchValue) ||
        supplier.includes(searchValue);

      const matchesCategory =
        categoryFilter === "all" ||
        (medicine.category || "").toLowerCase() ===
          categoryFilter.toLowerCase();

      const matchesStock =
        stockFilter === "all" ||
        getStockStatus(medicine) === stockFilter;

      const expiryStatus = getExpiryStatus(medicine);

      const matchesExpiry =
        expiryFilter === "all" ||
        expiryStatus.toLowerCase() === expiryFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock &&
        matchesExpiry
      );
    });
  }, [
    medicines,
    search,
    categoryFilter,
    stockFilter,
    expiryFilter,
  ]);

  const stockCounts = useMemo(() => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    medicines.forEach((medicine) => {
      const status = getStockStatus(medicine);

      if (status === "In Stock") {
        inStock++;
      } else if (status === "Low Stock") {
        lowStock++;
      } else {
        outOfStock++;
      }
    });

    return {
      inStock,
      lowStock,
      outOfStock,
    };
  }, [medicines]);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this medicine?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await medicineService.delete(id);

      toast.success("Medicine deleted successfully");

      await loadMedicines();
    } catch (error) {
      console.error("Failed to delete medicine:", error);
      toast.error("Failed to delete medicine");
    }
  };

  /*
   * IMPORTANT:
   * The Admin Medicines page is inside /admin.
   * Therefore the edit route must also remain inside /admin.
   */
  const handleEdit = (id: number) => {
    navigate(`/admin/medicines/${id}/edit`);
  };

  const handleAddMedicine = () => {
    navigate("/admin/medicines/new");
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStockFilter("all");
    setExpiryFilter("all");
  };

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#f5f7fb",
        padding: "28px 32px 50px",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          marginBottom: "28px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#8b9ab5",
              marginBottom: "8px",
            }}
          >
            INVENTORY LEDGER
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "36px",
              fontWeight: 800,
              color: "#14213d",
            }}
          >
            Medicines
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              fontSize: "16px",
              color: "#71809a",
            }}
          >
            Manage medicine stock, suppliers, expiry and pricing.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddMedicine}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: "none",
            borderRadius: "10px",
            padding: "12px 18px",
            background: "#2563eb",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <Plus size={18} />
          Add Medicine
        </button>
      </div>

      {/* STOCK CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "18px",
          marginBottom: "24px",
        }}
      >
        <StockCard
          title="In Stock"
          value={stockCounts.inStock}
          description="Medicines available"
          icon={<CheckCircle2 size={25} color="#10b981" />}
          background="#ecfdf5"
        />

        <StockCard
          title="Low Stock"
          value={stockCounts.lowStock}
          description="Needs attention"
          icon={<AlertTriangle size={25} color="#f59e0b" />}
          background="#fff7ed"
        />

        <StockCard
          title="Out of Stock"
          value={stockCounts.outOfStock}
          description="Currently unavailable"
          icon={<XCircle size={25} color="#ef4444" />}
          background="#fef2f2"
        />
      </div>

      {/* TABLE CARD */}

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5eaf2",
          borderRadius: "16px",
          boxShadow: "0 3px 12px rgba(15,23,42,0.04)",
          overflow: "hidden",
        }}
      >
        {/* FILTERS */}

        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #edf0f5",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(280px, 2fr) repeat(3, minmax(160px, 1fr)) auto",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={19}
                color="#8a98ad"
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search medicine, category, batch..."
                style={{
                  width: "100%",
                  height: "46px",
                  boxSizing: "border-box",
                  border: "1px solid #dce3ed",
                  borderRadius: "10px",
                  padding: "0 14px 0 42px",
                  fontSize: "14px",
                  color: "#1e293b",
                  outline: "none",
                  background: "#ffffff",
                }}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              style={selectStyle}
            >
              <option value="all">All Categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value)}
              style={selectStyle}
            >
              <option value="all">All Stock</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>

            <select
              value={expiryFilter}
              onChange={(event) => setExpiryFilter(event.target.value)}
              style={selectStyle}
            >
              <option value="all">All Expiry</option>
              <option value="Valid">Valid</option>
              <option value="Expired">Expired</option>
              <option value="Not Set">Not Set</option>
            </select>

            <button
              type="button"
              onClick={loadMedicines}
              title="Refresh"
              style={{
                height: "46px",
                minWidth: "46px",
                border: "1px solid #dce3ed",
                borderRadius: "10px",
                background: "#ffffff",
                color: "#52647e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "16px",
            }}
          >
            <div
              style={{
                color: "#71809a",
                fontSize: "14px",
              }}
            >
              Showing{" "}
              <strong style={{ color: "#1e293b" }}>
                {filteredMedicines.length}
              </strong>{" "}
              of{" "}
              <strong style={{ color: "#1e293b" }}>
                {medicines.length}
              </strong>{" "}
              medicines
            </div>

            {(search ||
              categoryFilter !== "all" ||
              stockFilter !== "all" ||
              expiryFilter !== "all") && (
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#2563eb",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}

        <div
          style={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "1050px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={headerStyle}>MEDICINE</th>
                <th style={headerStyle}>BATCH NO.</th>
                <th style={headerStyle}>SUPPLIER</th>
                <th style={headerStyle}>QUANTITY</th>
                <th style={headerStyle}>STOCK</th>
                <th style={headerStyle}>EXPIRY</th>
                <th style={headerStyle}>PRICE</th>
                <th style={headerStyle}>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={emptyStyle}>
                    Loading medicines...
                  </td>
                </tr>
              ) : filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={8} style={emptyStyle}>
                    <Package
                      size={38}
                      style={{
                        margin: "0 auto 12px",
                        opacity: 0.5,
                      }}
                    />

                    <div
                      style={{
                        fontWeight: 700,
                        color: "#475569",
                        marginBottom: "5px",
                      }}
                    >
                      No medicines found
                    </div>

                    <div style={{ fontSize: "14px" }}>
                      Try changing your search or filters.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((medicine) => {
                  const quantity = getQuantity(medicine);
                  const stockStatus = getStockStatus(medicine);
                  const expiryDate = getExpiryDate(medicine);
                  const expiryStatus = getExpiryStatus(medicine);

                  return (
                    <tr
                      key={medicine.id}
                      style={{
                        borderTop: "1px solid #edf0f5",
                      }}
                    >
                      <td style={cellStyle}>
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
                              borderRadius: "10px",
                              background: "#eff6ff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Package size={21} color="#2563eb" />
                          </div>

                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                color: "#172033",
                                fontSize: "14px",
                              }}
                            >
                              {medicine.name}
                            </div>

                            <div
                              style={{
                                marginTop: "4px",
                                color: "#8290a7",
                                fontSize: "12px",
                              }}
                            >
                              {medicine.category || "General Medicine"}
                            </div>

                            {medicine.dosage && (
                              <div
                                style={{
                                  marginTop: "2px",
                                  color: "#9aa6b8",
                                  fontSize: "12px",
                                }}
                              >
                                {medicine.dosage}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={cellStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "7px 10px",
                            borderRadius: "8px",
                            background: "#f8fafc",
                            border: "1px solid #e5eaf2",
                            color: "#334155",
                            fontWeight: 600,
                            fontSize: "13px",
                          }}
                        >
                          {getBatchNumber(medicine)}
                        </span>
                      </td>

                      <td style={cellStyle}>
                        <div
                          style={{
                            color: "#40516b",
                            fontSize: "14px",
                            fontWeight: 600,
                          }}
                        >
                          {medicine.supplier?.name || "Not assigned"}
                        </div>
                      </td>

                      <td style={cellStyle}>
                        <div
                          style={{
                            color: "#172033",
                            fontSize: "18px",
                            fontWeight: 800,
                          }}
                        >
                          {quantity}
                        </div>

                        <div
                          style={{
                            color: "#8a98ad",
                            fontSize: "12px",
                          }}
                        >
                          units
                        </div>
                      </td>

                      <td style={cellStyle}>
                        <StockBadge status={stockStatus} />
                      </td>

                      <td style={cellStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "7px",
                          }}
                        >
                          <CalendarDays
                            size={16}
                            color={
                              expiryStatus === "Expired"
                                ? "#ef4444"
                                : "#71809a"
                            }
                          />

                          <div>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color:
                                  expiryStatus === "Expired"
                                    ? "#dc2626"
                                    : "#40516b",
                              }}
                            >
                              {formatDate(expiryDate)}
                            </div>

                            <div
                              style={{
                                fontSize: "11px",
                                marginTop: "2px",
                                color:
                                  expiryStatus === "Expired"
                                    ? "#ef4444"
                                    : "#8a98ad",
                              }}
                            >
                              {expiryStatus}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={cellStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            color: "#172033",
                            fontWeight: 800,
                            fontSize: "14px",
                          }}
                        >
                          <IndianRupee size={14} />
                          {Number(medicine.price || 0).toFixed(2)}
                        </div>
                      </td>

                      {/* EDIT + DELETE */}

                      <td style={cellStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleEdit(medicine.id)}
                            title="Edit medicine"
                            style={{
                              width: "38px",
                              height: "38px",
                              border: "1px solid #dbe4f0",
                              borderRadius: "9px",
                              background: "#ffffff",
                              color: "#2563eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(medicine.id)}
                            title="Delete medicine"
                            style={{
                              width: "38px",
                              height: "38px",
                              border: "1px solid #fee2e2",
                              borderRadius: "9px",
                              background: "#fffafa",
                              color: "#ef4444",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================
   STOCK CARD
============================ */

function StockCard({
  title,
  value,
  description,
  icon,
  background,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  background: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5eaf2",
        borderRadius: "16px",
        padding: "20px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 3px 12px rgba(15,23,42,0.04)",
      }}
    >
      <div>
        <div
          style={{
            color: "#60718d",
            fontSize: "15px",
            fontWeight: 600,
            marginBottom: "8px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: "#14213d",
            fontSize: "30px",
            fontWeight: 800,
          }}
        >
          {value}
        </div>

        <div
          style={{
            marginTop: "4px",
            color: "#8a98ad",
            fontSize: "13px",
          }}
        >
          {description}
        </div>
      </div>

      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
    </div>
  );
}

/* ============================
   STOCK BADGE
============================ */

function StockBadge({ status }: { status: StockStatus }) {
  let background = "#ecfdf5";
  let color = "#047857";
  let dot = "#10b981";

  if (status === "Low Stock") {
    background = "#fff7ed";
    color = "#c2410c";
    dot = "#f59e0b";
  }

  if (status === "Out of Stock") {
    background = "#fef2f2";
    color = "#b91c1c";
    dot = "#ef4444";
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "7px 11px",
        borderRadius: "999px",
        background,
        color,
        fontSize: "12px",
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: dot,
        }}
      />

      {status}
    </span>
  );
}

/* ============================
   STYLES
============================ */

const selectStyle: React.CSSProperties = {
  height: "46px",
  border: "1px solid #dce3ed",
  borderRadius: "10px",
  padding: "0 12px",
  fontSize: "14px",
  color: "#334155",
  background: "#ffffff",
  outline: "none",
  cursor: "pointer",
};

const headerStyle: React.CSSProperties = {
  padding: "16px 18px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: 800,
  color: "#687993",
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
};

const cellStyle: React.CSSProperties = {
  padding: "18px",
  verticalAlign: "middle",
  color: "#40516b",
};

const emptyStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "60px 20px",
  color: "#71809a",
};