import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Users,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";

interface Supplier {
  id?: number;
  name?: string;
  contact?: string;
  email?: string;
}

const API_BASE = "http://localhost:8080/api";

export function SuppliersList() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/suppliers`, {
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
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to load suppliers (${response.status})`);
      }

      const data = await response.json();

      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Supplier loading error:", err);
      setError("Unable to load supplier data from the server.");
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const filteredSuppliers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return suppliers;
    }

    return suppliers.filter((supplier) => {
      return (
        supplier.name?.toLowerCase().includes(value) ||
        supplier.contact?.toLowerCase().includes(value) ||
        supplier.email?.toLowerCase().includes(value)
      );
    });
  }, [suppliers, search]);

  const clearSearch = () => {
    setSearch("");
  };

  const handleDelete = async (supplier: Supplier) => {
    if (!supplier.id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${supplier.name || "this supplier"}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(supplier.id);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE}/suppliers/${supplier.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      if (response.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`Delete failed (${response.status})`);
      }

      setSuppliers((current) =>
        current.filter((item) => item.id !== supplier.id)
      );
    } catch (err) {
      console.error("Supplier delete error:", err);
      setError("Unable to delete the supplier. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={styles.page}>
      {/* PAGE HEADER */}
      <div style={styles.pageHeader}>
        <div>
          <div style={styles.eyebrow}>SUPPLIER MANAGEMENT</div>

          <h2 style={styles.title}>Suppliers</h2>

          <p style={styles.subtitle}>
            Manage supplier contacts and medicine procurement partners.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={loadSuppliers}
            disabled={loading}
            style={styles.refreshButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#eff6ff";
              e.currentTarget.style.borderColor = "#bfdbfe";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.borderColor = "#dbe3ef";
            }}
          >
            <RefreshCw
              size={17}
              style={{
                animation: loading ? "spin 1s linear infinite" : "none",
              }}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/suppliers/new")}
            style={styles.addButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1d4ed8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#2563eb";
            }}
          >
            <Plus size={19} />
            Add Supplier
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryIcon, background: "#eff6ff", color: "#2563eb" }}>
            <Users size={22} />
          </div>

          <div>
            <div style={styles.summaryLabel}>TOTAL SUPPLIERS</div>
            <div style={styles.summaryValue}>{suppliers.length}</div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryIcon, background: "#ecfdf5", color: "#059669" }}>
            <Search size={22} />
          </div>

          <div>
            <div style={styles.summaryLabel}>MATCHING SUPPLIERS</div>
            <div style={styles.summaryValue}>{filteredSuppliers.length}</div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryIcon, background: "#f5f3ff", color: "#7c3aed" }}>
            <Mail size={22} />
          </div>

          <div>
            <div style={styles.summaryLabel}>EMAIL CONTACTS</div>
            <div style={styles.summaryValue}>
              {suppliers.filter((supplier) => Boolean(supplier.email)).length}
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH / FILTER AREA */}
      <div style={styles.filterCard}>
        <div style={styles.searchWrapper}>
          <Search size={20} color="#64748b" style={styles.searchIcon} />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers by name, contact or email..."
            style={styles.searchInput}
          />

          {search && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear supplier search"
              style={styles.clearSearchButton}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div style={styles.resultText}>
          {search ? (
            <>
              Showing <strong>{filteredSuppliers.length}</strong> of{" "}
              <strong>{suppliers.length}</strong> suppliers
            </>
          ) : (
            <>
              <strong>{suppliers.length}</strong> supplier records
            </>
          )}
        </div>

        {search && filteredSuppliers.length === 0 && (
          <button
            type="button"
            onClick={clearSearch}
            style={styles.clearFilterButton}
          >
            Clear search
          </button>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={19} />
          <span>{error}</span>

          <button
            type="button"
            onClick={loadSuppliers}
            style={styles.retryButton}
          >
            Try again
          </button>
        </div>
      )}

      {/* TABLE CARD */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div>
            <h3 style={styles.tableTitle}>Supplier Directory</h3>
            <p style={styles.tableSubtitle}>
              Supplier contact information and management actions
            </p>
          </div>

          {search && (
            <div style={styles.searchBadge}>
              <Search size={14} />
              {search}
              <button type="button" onClick={clearSearch} style={styles.badgeClose}>
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div style={styles.emptyState}>
            <RefreshCw
              size={30}
              color="#2563eb"
              style={{ animation: "spin 1s linear infinite" }}
            />
            <div style={styles.emptyTitle}>Loading suppliers...</div>
            <div style={styles.emptySubtitle}>
              Fetching supplier records from the server.
            </div>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <Users size={28} />
            </div>

            <div style={styles.emptyTitle}>
              {search ? "No suppliers found" : "No suppliers available"}
            </div>

            <div style={styles.emptySubtitle}>
              {search
                ? "Try a different supplier name, contact number or email."
                : "Add your first supplier to start managing supplier records."}
            </div>

            {search ? (
              <button
                type="button"
                onClick={clearSearch}
                style={styles.emptyAction}
              >
                Clear Search
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/admin/suppliers/new")}
                style={styles.emptyAction}
              >
                <Plus size={17} />
                Add Supplier
              </button>
            )}
          </div>
        ) : (
          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: "32%" }}>SUPPLIER</th>
                  <th style={{ ...styles.th, width: "22%" }}>CONTACT</th>
                  <th style={{ ...styles.th, width: "28%" }}>EMAIL</th>
                  <th style={{ ...styles.th, width: "18%", textAlign: "right" }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredSuppliers.map((supplier, index) => (
                  <tr
                    key={supplier.id ?? `${supplier.name}-${index}`}
                    style={styles.tr}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8fbff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#ffffff";
                    }}
                  >
                    <td style={styles.td}>
                      <div style={styles.supplierCell}>
                        <div style={styles.avatar}>
                          {(supplier.name || "S").charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div style={styles.supplierName}>
                            {supplier.name || "Unnamed Supplier"}
                          </div>
                          <div style={styles.supplierId}>
                            Supplier ID:{" "}
                            {supplier.id ? `SUP-${String(supplier.id).padStart(4, "0")}` : "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.contactCell}>
                        <Phone size={16} color="#64748b" />
                        <span>{supplier.contact || "Not provided"}</span>
                      </div>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.contactCell}>
                        <Mail size={16} color="#64748b" />
                        <span>{supplier.email || "Not provided"}</span>
                      </div>
                    </td>

                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <div style={styles.actionGroup}>
                        <button
                          type="button"
                          title="Edit supplier"
                          onClick={() =>
                            navigate(`/admin/suppliers/${supplier.id}/edit`)
                          }
                          style={styles.editButton}
                        >
                          <Pencil size={16} />
                          Edit
                        </button>

                        <button
                          type="button"
                          title="Delete supplier"
                          disabled={deletingId === supplier.id}
                          onClick={() => handleDelete(supplier)}
                          style={styles.deleteButton}
                        >
                          <Trash2 size={16} />
                          {deletingId === supplier.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredSuppliers.length > 0 && (
          <div style={styles.tableFooter}>
            <span>
              Showing <strong>{filteredSuppliers.length}</strong> of{" "}
              <strong>{suppliers.length}</strong> suppliers
            </span>

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                style={styles.footerClear}
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 900px) {
          .supplier-summary-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 760px) {
          .supplier-page-header {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .supplier-header-actions {
            width: 100%;
          }

          .supplier-header-actions button {
            flex: 1;
          }
        }

        @media (max-width: 650px) {
          .supplier-table {
            min-width: 760px;
          }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    color: "#172033",
  },

  pageHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "24px",
    marginBottom: "26px",
  },

  eyebrow: {
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "1.7px",
    color: "#64748b",
    marginBottom: "8px",
  },

  title: {
    margin: 0,
    fontSize: "36px",
    lineHeight: 1.1,
    fontWeight: 800,
    letterSpacing: "-0.8px",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#7c8da6",
    fontSize: "15px",
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  refreshButton: {
    height: "46px",
    padding: "0 17px",
    borderRadius: "11px",
    border: "1px solid #dbe3ef",
    background: "#ffffff",
    color: "#334155",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  addButton: {
    height: "46px",
    padding: "0 19px",
    borderRadius: "11px",
    border: "1px solid #2563eb",
    background: "#2563eb",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 5px 14px rgba(37, 99, 235, 0.18)",
    transition: "all 0.2s ease",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e3eaf3",
    borderRadius: "16px",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 3px 14px rgba(15, 23, 42, 0.035)",
  },

  summaryIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  summaryLabel: {
    fontSize: "11px",
    letterSpacing: "1px",
    fontWeight: 800,
    color: "#8a9ab1",
    marginBottom: "4px",
  },

  summaryValue: {
    fontSize: "26px",
    lineHeight: 1,
    fontWeight: 800,
    color: "#172033",
  },

  filterCard: {
    background: "#ffffff",
    border: "1px solid #e3eaf3",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "18px",
    boxShadow: "0 3px 14px rgba(15, 23, 42, 0.035)",
  },

  searchWrapper: {
    height: "50px",
    border: "1px solid #d9e2ee",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    background: "#fbfdff",
    transition: "all 0.2s ease",
  },

  searchIcon: {
    marginLeft: "16px",
    flexShrink: 0,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "0 13px",
    fontSize: "15px",
    color: "#172033",
  },

  clearSearchButton: {
    width: "34px",
    height: "34px",
    marginRight: "7px",
    border: "none",
    borderRadius: "8px",
    background: "#eef2f7",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  resultText: {
    marginTop: "12px",
    color: "#718198",
    fontSize: "13px",
  },

  clearFilterButton: {
    marginTop: "10px",
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
  },

  errorBox: {
    background: "#fff7f7",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    padding: "13px 15px",
    color: "#b91c1c",
    display: "flex",
    alignItems: "center",
    gap: "9px",
    marginBottom: "18px",
    fontSize: "14px",
    fontWeight: 600,
  },

  retryButton: {
    marginLeft: "auto",
    border: "none",
    background: "#b91c1c",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "8px 12px",
    fontWeight: 700,
    cursor: "pointer",
  },

  tableCard: {
    background: "#ffffff",
    border: "1px solid #e3eaf3",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 3px 14px rgba(15, 23, 42, 0.035)",
  },

  tableHeader: {
    padding: "21px 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    borderBottom: "1px solid #edf1f6",
  },

  tableTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 800,
    color: "#172033",
  },

  tableSubtitle: {
    margin: "5px 0 0",
    fontSize: "13px",
    color: "#8a9ab1",
  },

  searchBadge: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #dbeafe",
    borderRadius: "999px",
    padding: "7px 10px 7px 11px",
    fontSize: "12px",
    fontWeight: 700,
  },

  badgeClose: {
    width: "20px",
    height: "20px",
    border: "none",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  tableScroll: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "15px 22px",
    background: "#f8fafc",
    color: "#667991",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1px",
    borderBottom: "1px solid #e8edf4",
    whiteSpace: "nowrap",
  },

  tr: {
    background: "#ffffff",
    transition: "background 0.15s ease",
  },

  td: {
    padding: "17px 22px",
    borderBottom: "1px solid #edf1f6",
    fontSize: "14px",
    color: "#42536b",
    verticalAlign: "middle",
  },

  supplierCell: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "16px",
    flexShrink: 0,
  },

  supplierName: {
    color: "#172033",
    fontWeight: 750,
    fontSize: "15px",
  },

  supplierId: {
    marginTop: "3px",
    color: "#94a3b8",
    fontSize: "11px",
  },

  contactCell: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#52637a",
  },

  actionGroup: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "8px",
  },

  editButton: {
    height: "36px",
    padding: "0 11px",
    borderRadius: "9px",
    border: "1px solid #dbeafe",
    background: "#eff6ff",
    color: "#2563eb",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
  },

  deleteButton: {
    height: "36px",
    padding: "0 11px",
    borderRadius: "9px",
    border: "1px solid #fee2e2",
    background: "#fff5f5",
    color: "#dc2626",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
  },

  emptyState: {
    minHeight: "300px",
    padding: "50px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  emptyIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "17px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "14px",
  },

  emptyTitle: {
    fontSize: "17px",
    fontWeight: 800,
    color: "#172033",
    marginBottom: "6px",
  },

  emptySubtitle: {
    color: "#8a9ab1",
    fontSize: "13px",
    maxWidth: "420px",
  },

  emptyAction: {
    marginTop: "18px",
    height: "40px",
    padding: "0 15px",
    border: "none",
    borderRadius: "9px",
    background: "#2563eb",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontWeight: 700,
    cursor: "pointer",
  },

  tableFooter: {
    minHeight: "52px",
    padding: "0 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    color: "#7c8da6",
    fontSize: "12px",
    background: "#fbfcfe",
  },

  footerClear: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default SuppliersList;
