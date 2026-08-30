import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/api/axios";
import "./expiry-tracking.css";
import {
  Search,
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

type ExpiryStatus =
  | "Expired"
  | "Expiring Soon"
  | "Near Expiry"
  | "Safe";

type MedicineExpiry = {
  id: number;
  medicine: string;
  batchNo: string;
  supplier: string;
  quantity: number;
  expiryDate: string;
};



const getToday = () => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
};

const getDaysRemaining = (expiryDate: string) => {
  const today = getToday();

  const expiry = new Date(`${expiryDate}T00:00:00`);

  const difference =
    expiry.getTime() - today.getTime();

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
};

const getExpiryStatus = (
  expiryDate: string
): ExpiryStatus => {
  const daysRemaining = getDaysRemaining(expiryDate);

  if (daysRemaining < 0) {
    return "Expired";
  }

  if (daysRemaining <= 30) {
    return "Expiring Soon";
  }

  if (daysRemaining <= 60) {
    return "Near Expiry";
  }

  return "Safe";
};

const formatDate = (date: string) => {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const getStatusClass = (status: ExpiryStatus) => {
  switch (status) {
    case "Expired":
      return "expired";

    case "Expiring Soon":
      return "expiring-soon";

    case "Near Expiry":
      return "near-expiry";

    case "Safe":
      return "safe";

    default:
      return "";
  }
};

const getStatusIcon = (status: ExpiryStatus) => {
  switch (status) {
    case "Expired":
      return <XCircle size={17} />;

    case "Expiring Soon":
      return <AlertTriangle size={17} />;

    case "Near Expiry":
      return <CalendarClock size={17} />;

    case "Safe":
      return <CheckCircle2 size={17} />;

    default:
      return null;
  }
};

const getDaysText = (days: number) => {
  if (days < 0) {
    const expiredDays = Math.abs(days);

    return `${expiredDays} day${
      expiredDays === 1 ? "" : "s"
    } ago`;
  }

  if (days === 0) {
    return "Expires today";
  }

  return `${days} day${
    days === 1 ? "" : "s"
  } left`;
};

export const ExpiryTracking = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "All" | ExpiryStatus
  >("All");
  const [realExpiryData, setRealExpiryData] = useState<MedicineExpiry[]>([]);

  useEffect(() => {
    const fetchExpiryData = async () => {
      try {
        const response = await axiosInstance.get("/expirys/upcoming");
        if (Array.isArray(response.data)) {
          const mapped: MedicineExpiry[] = response.data.map((item: any) => ({
            id: item.id,
            medicine: item.medicineName || item.medicine || "Unknown Medicine",
            batchNo: item.batchNo || item.batchNumber || `BATCH-${item.id}`,
            supplier: item.supplier || "Standard Supplier",
            quantity: item.quantity ?? 100,
            expiryDate: item.expiryDate || new Date().toISOString().split("T")[0],
          }));
          setRealExpiryData(mapped);
        }
      } catch (err) {
        console.warn("Could not fetch expiry data:", err);
      }
    };
    fetchExpiryData();
  }, []);

  const processedData = useMemo(() => {
    return realExpiryData.map((item) => {
      const daysRemaining = getDaysRemaining(
        item.expiryDate
      );

      const status = getExpiryStatus(
        item.expiryDate
      );

      return {
        ...item,
        daysRemaining,
        status,
      };
    });
  }, [realExpiryData]);

  const filteredData = useMemo(() => {
    return processedData.filter((item) => {
      const matchesSearch =
        item.medicine
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.batchNo
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.supplier
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" ||
        item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [processedData, search, filter]);

  const expiredCount = processedData.filter(
    (item) => item.status === "Expired"
  ).length;

  const expiringSoonCount = processedData.filter(
    (item) => item.status === "Expiring Soon"
  ).length;

  const nearExpiryCount = processedData.filter(
    (item) => item.status === "Near Expiry"
  ).length;

  const safeCount = processedData.filter(
    (item) => item.status === "Safe"
  ).length;

  const totalQuantity = processedData.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div className="expiry-page">

      {/* PAGE HEADER */}
      <div className="expiry-header">
        <div>
          <div className="expiry-eyebrow">
            MEDISTOCK • INVENTORY MONITORING
          </div>

          <h1>Expiry Tracking</h1>

          <p>
            Monitor medicine expiry dates and prevent
            expired stock from being used.
          </p>
        </div>

        <button
          className="expiry-refresh"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* BLUE HERO */}
      <div className="expiry-hero">
        <div className="expiry-hero-content">
          <div className="expiry-hero-label">
            EXPIRY MONITORING
          </div>

          <h2>
            Keep your medicine stock
            <br />
            safe and up to date.
          </h2>

          <p>
            Track expired, near-expiry and safe medicines
            from one place.
          </p>
        </div>

        <div className="expiry-hero-icon">
          <CalendarClock size={70} />
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="expiry-summary-grid">

        <button
          className={`expiry-stat-card ${
            filter === "Expired"
              ? "selected"
              : ""
          }`}
          onClick={() => setFilter("Expired")}
        >
          <div className="expiry-stat-icon red">
            <XCircle size={26} />
          </div>

          <div>
            <span>Expired</span>
            <strong>{expiredCount}</strong>
            <small>Medicines expired</small>
          </div>
        </button>

        <button
          className={`expiry-stat-card ${
            filter === "Expiring Soon"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            setFilter("Expiring Soon")
          }
        >
          <div className="expiry-stat-icon orange">
            <AlertTriangle size={26} />
          </div>

          <div>
            <span>Expiring Soon</span>
            <strong>{expiringSoonCount}</strong>
            <small>Within 30 days</small>
          </div>
        </button>

        <button
          className={`expiry-stat-card ${
            filter === "Near Expiry"
              ? "selected"
              : ""
          }`}
          onClick={() => setFilter("Near Expiry")}
        >
          <div className="expiry-stat-icon yellow">
            <CalendarClock size={26} />
          </div>

          <div>
            <span>Near Expiry</span>
            <strong>{nearExpiryCount}</strong>
            <small>31–60 days</small>
          </div>
        </button>

        <button
          className={`expiry-stat-card ${
            filter === "Safe"
              ? "selected"
              : ""
          }`}
          onClick={() => setFilter("Safe")}
        >
          <div className="expiry-stat-icon green">
            <CheckCircle2 size={26} />
          </div>

          <div>
            <span>Safe</span>
            <strong>{safeCount}</strong>
            <small>More than 60 days</small>
          </div>
        </button>

      </div>

      {/* ADDITIONAL SUMMARY */}
      <div className="expiry-overview">
        <div>
          <span>Total Medicines</span>
          <strong>{processedData.length}</strong>
        </div>

        <div>
          <span>Total Stock</span>
          <strong>{totalQuantity}</strong>
          <small>Units tracked</small>
        </div>

        <div>
          <span>Attention Required</span>
          <strong>
            {expiredCount + expiringSoonCount}
          </strong>
          <small>Expired + Expiring Soon</small>
        </div>
      </div>

      {/* FILTER / SEARCH */}
      <div className="expiry-filter-card">

        <div className="expiry-search">
          <Search size={21} />

          <input
            type="text"
            placeholder="Search medicine, batch or supplier..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <select
          value={filter}
          onChange={(e) =>
            setFilter(
              e.target.value as
                | "All"
                | ExpiryStatus
            )
          }
        >
          <option value="All">
            All Status
          </option>

          <option value="Expired">
            Expired
          </option>

          <option value="Expiring Soon">
            Expiring Soon
          </option>

          <option value="Near Expiry">
            Near Expiry
          </option>

          <option value="Safe">
            Safe
          </option>
        </select>

        <button
          className="expiry-clear"
          onClick={() => {
            setSearch("");
            setFilter("All");
          }}
        >
          Clear
        </button>

      </div>

      {/* TABLE */}
      <div className="expiry-table-card">

        <div className="expiry-table-header">
          <div>
            <h2>Medicine Expiry Status</h2>

            <p>
              Showing {filteredData.length} of{" "}
              {processedData.length} medicines
            </p>
          </div>

          <div className="expiry-legend">
            <span className="legend-red">
              ● Expired
            </span>

            <span className="legend-orange">
              ● Expiring Soon
            </span>

            <span className="legend-yellow">
              ● Near Expiry
            </span>

            <span className="legend-green">
              ● Safe
            </span>
          </div>
        </div>

        <div className="expiry-table-scroll">

          <table className="expiry-table">

            <thead>
              <tr>
                <th>MEDICINE</th>
                <th>BATCH NO.</th>
                <th>SUPPLIER</th>
                <th>QUANTITY</th>
                <th>EXPIRY DATE</th>
                <th>DAYS REMAINING</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>

              {filteredData.length === 0 ? (

                <tr>
                  <td
                    colSpan={7}
                    className="expiry-empty"
                  >
                    <Search size={40} />

                    <strong>
                      No medicines found
                    </strong>

                    <span>
                      Try changing your search or
                      status filter.
                    </span>
                  </td>
                </tr>

              ) : (

                filteredData.map((item) => (

                  <tr key={item.id}>

                    <td>
                      <div className="medicine-name">
                        {item.medicine}
                      </div>

                      <div className="medicine-id">
                        ID #{item.id}
                      </div>
                    </td>

                    <td>
                      <span className="batch-badge">
                        {item.batchNo}
                      </span>
                    </td>

                    <td>
                      <span className="supplier-name">
                        {item.supplier}
                      </span>
                    </td>

                    <td>
                      <strong className="quantity">
                        {item.quantity}
                      </strong>
                      <span className="quantity-label">
                        units
                      </span>
                    </td>

                    <td>
                      <span className="expiry-date">
                        {formatDate(
                          item.expiryDate
                        )}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`days-remaining ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {getDaysText(
                          item.daysRemaining
                        )}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`expiry-status ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {getStatusIcon(
                          item.status
                        )}

                        {item.status}
                      </span>
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* STATUS INFORMATION */}
      <div className="expiry-rules">

        <div className="expiry-rules-header">
          <div>
            <h2>Expiry Status Rules</h2>

            <p>
              Medicine status is automatically
              calculated from today's date.
            </p>
          </div>
        </div>

        <div className="expiry-rules-grid">

          <div className="expiry-rule expired-rule">
            <XCircle size={22} />

            <div>
              <strong>Expired</strong>
              <span>
                Expiry date is before today
              </span>
            </div>
          </div>

          <div className="expiry-rule soon-rule">
            <AlertTriangle size={22} />

            <div>
              <strong>Expiring Soon</strong>
              <span>
                0–30 days remaining
              </span>
            </div>
          </div>

          <div className="expiry-rule near-rule">
            <CalendarClock size={22} />

            <div>
              <strong>Near Expiry</strong>
              <span>
                31–60 days remaining
              </span>
            </div>
          </div>

          <div className="expiry-rule safe-rule">
            <CheckCircle2 size={22} />

            <div>
              <strong>Safe</strong>
              <span>
                More than 60 days remaining
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ExpiryTracking;