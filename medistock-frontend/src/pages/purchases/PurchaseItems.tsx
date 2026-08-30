import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/api/axios";
import {
  Package,
  ShoppingCart,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Edit2,
  X,
  IndianRupee,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import "./PurchaseItems.css";

interface Supplier {
  id: number;
  name: string;
  contact?: string;
  email?: string;
}

interface Medicine {
  id: number;
  name: string;
  category?: string;
  price?: number;
  stockQuantity?: number;
  supplier?: Supplier;
}

interface PurchaseOrder {
  id: number;
  supplier?: Supplier;
  orderDate?: string;
  status?: string;
}

interface PurchaseItem {
  id: number;
  medicine?: Medicine;
  purchaseOrder?: PurchaseOrder;
  quantity: number;
  price: number;
}

export default function PurchaseItems() {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [medicineFilter, setMedicineFilter] = useState("all");

  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editingItem, setEditingItem] = useState<PurchaseItem | null>(null);

  // Form State
  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [itemsRes, medsRes, suppsRes, ordersRes] = await Promise.all([
        axiosInstance.get("/purchaseorderitems").catch(() => ({ data: [] })),
        axiosInstance.get("/medicines").catch(() => ({ data: [] })),
        axiosInstance.get("/suppliers").catch(() => ({ data: [] })),
        axiosInstance.get("/purchaseorders").catch(() => ({ data: [] })),
      ]);

      setItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
      setMedicines(Array.isArray(medsRes.data) ? medsRes.data : []);
      setSuppliers(Array.isArray(suppsRes.data) ? suppsRes.data : []);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
    } catch (err) {
      console.error("Failed to load purchase items:", err);
      setError("Unable to load purchase items from the server.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // OPEN MODALS
  // ============================================================

  const handleOpenAdd = () => {
    setEditingItem(null);
    setSelectedMedicineId("");
    setSelectedOrderId("");
    setSelectedSupplierId("");
    setQuantity("");
    setPrice("");
    setFormError("");
    setModal("add");
  };

  const handleOpenEdit = (item: PurchaseItem) => {
    setEditingItem(item);
    setSelectedMedicineId(item.medicine?.id ? String(item.medicine.id) : "");
    setSelectedOrderId(item.purchaseOrder?.id ? String(item.purchaseOrder.id) : "");
    setSelectedSupplierId(item.purchaseOrder?.supplier?.id ? String(item.purchaseOrder.supplier.id) : "");
    setQuantity(String(item.quantity || ""));
    setPrice(String(item.price || ""));
    setFormError("");
    setModal("edit");
  };

  const handleCloseModal = () => {
    setModal(null);
    setEditingItem(null);
    setFormError("");
  };

  // ============================================================
  // AUTO-POPULATE PRICE WHEN MEDICINE CHANGES
  // ============================================================

  const handleMedicineChange = (medId: string) => {
    setSelectedMedicineId(medId);
    if (medId) {
      const foundMed = medicines.find((m) => String(m.id) === medId);
      if (foundMed) {
        if (!price && foundMed.price) {
          setPrice(String(foundMed.price));
        }
        if (foundMed.supplier?.id) {
          setSelectedSupplierId(String(foundMed.supplier.id));
        }
      }
    }
  };

  // ============================================================
  // SUBMIT FORM
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedMedicineId) {
      setFormError("Please select a medicine.");
      return;
    }

    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      setFormError("Quantity must be a positive number greater than 0.");
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError("Price must be a positive number greater than 0.");
      return;
    }

    try {
      setSubmitting(true);

      const payload: any = {
        medicine: { id: Number(selectedMedicineId) },
        quantity: numQty,
        price: numPrice,
      };

      if (selectedOrderId) {
        payload.purchaseOrder = { id: Number(selectedOrderId) };
      }

      if (modal === "edit" && editingItem) {
        await axiosInstance.put(`/purchaseorderitems/${editingItem.id}`, payload);
        setSuccessMsg("Purchase item updated successfully!");
      } else {
        await axiosInstance.post("/purchaseorderitems", payload);
        setSuccessMsg("Purchase item added successfully!");
      }

      handleCloseModal();
      await loadData();

      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      console.error("Failed to save purchase item:", err);
      setFormError(err.response?.data?.message || "Failed to save purchase item to backend.");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // DELETE ITEM
  // ============================================================

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this purchase item?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/purchaseorderitems/${id}`);
      setSuccessMsg("Purchase item deleted successfully!");
      await loadData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      console.error("Failed to delete purchase item:", err);
      alert("Unable to delete purchase item.");
    }
  };

  // ============================================================
  // FILTERED ITEMS & CALCULATED STATS
  // ============================================================

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const medName = item.medicine?.name?.toLowerCase() || "";
      const suppName = item.purchaseOrder?.supplier?.name?.toLowerCase() || "";
      const orderId = String(item.purchaseOrder?.id || "");
      const searchTerm = search.toLowerCase().trim();

      const matchesSearch =
        !searchTerm ||
        medName.includes(searchTerm) ||
        suppName.includes(searchTerm) ||
        orderId.includes(searchTerm);

      const matchesMedicine =
        medicineFilter === "all" || String(item.medicine?.id) === medicineFilter;

      return matchesSearch && matchesMedicine;
    });
  }, [items, search, medicineFilter]);

  const stats = useMemo(() => {
    const totalItems = filteredItems.length;
    const totalQuantity = filteredItems.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
    const totalValue = filteredItems.reduce(
      (sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.price) || 0),
      0
    );
    const uniqueMedicines = new Set(filteredItems.map((i) => i.medicine?.id).filter(Boolean)).size;

    return { totalItems, totalQuantity, totalValue, uniqueMedicines };
  }, [filteredItems]);

  return (
    <div className="purchase-items-page">
      {/* HEADER BANNER */}
      <div className="purchase-items-header">
        <div>
          <h1 className="purchase-items-title">
            <ShoppingCart className="inline-icon" size={26} /> Purchase Items
          </h1>
          <p className="purchase-items-subtitle">
            Manage individual medicine purchase items, unit pricing, and supplier order links.
          </p>
        </div>

        <div className="purchase-items-actions">
          <button
            type="button"
            onClick={loadData}
            title="Refresh Data"
            className="purchase-btn-secondary"
          >
            <RefreshCw size={18} className={loading ? "spin" : ""} /> Refresh
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="purchase-btn-primary"
          >
            <Plus size={18} /> Add Purchase Item
          </button>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION */}
      {successMsg && (
        <div className="purchase-toast-success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SUMMARY STATS CARDS */}
      <div className="purchase-stats-grid">
        <div className="purchase-stat-card">
          <div className="stat-icon blue">
            <Package size={22} />
          </div>
          <div>
            <p className="stat-label">Total Purchase Items</p>
            <h3 className="stat-value">{stats.totalItems}</h3>
          </div>
        </div>

        <div className="purchase-stat-card">
          <div className="stat-icon green">
            <ShoppingCart size={22} />
          </div>
          <div>
            <p className="stat-label">Total Purchased Units</p>
            <h3 className="stat-value">{stats.totalQuantity.toLocaleString("en-IN")}</h3>
          </div>
        </div>

        <div className="purchase-stat-card">
          <div className="stat-icon purple">
            <IndianRupee size={22} />
          </div>
          <div>
            <p className="stat-label">Total Purchase Value</p>
            <h3 className="stat-value">
              ₹{stats.totalValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div className="purchase-stat-card">
          <div className="stat-icon orange">
            <Building2 size={22} />
          </div>
          <div>
            <p className="stat-label">Medicines Purchased</p>
            <h3 className="stat-value">{stats.uniqueMedicines}</h3>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="purchase-controls-card">
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by medicine name, supplier, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-select-wrapper">
          <select
            value={medicineFilter}
            onChange={(e) => setMedicineFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Medicines</option>
            {medicines.map((med) => (
              <option key={med.id} value={med.id}>
                {med.name}
              </option>
            ))}
          </select>
        </div>

        {(search || medicineFilter !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setMedicineFilter("all");
            }}
            className="btn-clear-filters"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="purchase-error-card">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={loadData} className="btn-retry">
            Try Again
          </button>
        </div>
      )}

      {/* PURCHASE ITEMS TABLE */}
      <div className="purchase-table-card">
        <div className="table-responsive">
          <table className="purchase-table">
            <thead>
              <tr>
                <th>ITEM ID</th>
                <th>MEDICINE</th>
                <th>PURCHASE ORDER / SUPPLIER</th>
                <th>QUANTITY</th>
                <th>UNIT PRICE</th>
                <th>TOTAL AMOUNT</th>
                <th style={{ textAlign: "right" }}>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="table-status-cell">
                    <RefreshCw size={24} className="spin status-icon" />
                    <span>Loading purchase items...</span>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-status-cell empty">
                    <Package size={38} className="empty-icon" />
                    <strong>No purchase items found</strong>
                    <p>Try adding a purchase item or adjusting your search filters.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const qty = Number(item.quantity) || 0;
                  const unitPrice = Number(item.price) || 0;
                  const totalAmt = qty * unitPrice;
                  const supplierName = item.purchaseOrder?.supplier?.name || item.medicine?.supplier?.name || "Not Assigned";

                  return (
                    <tr key={item.id}>
                      <td className="font-mono-id">#PI-{String(item.id).padStart(4, "0")}</td>

                      <td>
                        <div className="cell-medicine">
                          <strong className="medicine-title">{item.medicine?.name || "Unmapped Medicine"}</strong>
                          <span className="medicine-category">{item.medicine?.category || "General"}</span>
                        </div>
                      </td>

                      <td>
                        <div className="cell-supplier">
                          <span className="supplier-name">
                            <Building2 size={14} className="icon-sub" /> {supplierName}
                          </span>
                          {item.purchaseOrder?.id && (
                            <span className="po-badge">PO #{item.purchaseOrder.id}</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="cell-quantity">
                          <strong className="qty-value">{qty.toLocaleString("en-IN")}</strong>
                          <span className="qty-unit">units</span>
                        </div>
                      </td>

                      <td>
                        <span className="price-tag">₹{unitPrice.toFixed(2)}</span>
                      </td>

                      <td>
                        <strong className="total-amount">₹{totalAmt.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div className="action-buttons-wrapper">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Purchase Item"
                            className="btn-action-edit"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            title="Delete Purchase Item"
                            className="btn-action-delete"
                          >
                            <Trash2 size={16} />
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

      {/* ADD / EDIT MODAL */}
      {modal && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{modal === "edit" ? "Edit Purchase Item" : "Add Purchase Item"}</h3>
              <button type="button" onClick={handleCloseModal} className="btn-close-modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {formError && (
                <div className="modal-error-banner">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {/* MEDICINE SELECTION */}
              <div className="form-group">
                <label className="form-label">
                  Medicine <span className="required-star">*</span>
                </label>
                <select
                  value={selectedMedicineId}
                  onChange={(e) => handleMedicineChange(e.target.value)}
                  className="form-control"
                  required
                >
                  <option value="">-- Select Medicine --</option>
                  {medicines.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.name} {med.category ? `(${med.category})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* PURCHASE ORDER / SUPPLIER */}
              <div className="form-group">
                <label className="form-label">
                  Purchase Order / Supplier <span className="optional-badge">(Optional)</span>
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="form-control"
                >
                  <option value="">-- Auto-Assign Purchase Order --</option>
                  {orders.map((po) => (
                    <option key={po.id} value={po.id}>
                      PO #{po.id} - {po.supplier?.name || "General Supplier"} ({po.status || "COMPLETED"})
                    </option>
                  ))}
                </select>
              </div>

              {/* QUANTITY & PRICE ROW */}
              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">
                    Quantity <span className="required-star">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">
                    Unit Price (₹) <span className="required-star">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g. 45.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              {/* TOTAL COST CALCULATION */}
              {Number(quantity) > 0 && Number(price) > 0 && (
                <div className="total-calculation-box">
                  <span>Calculated Total Amount:</span>
                  <strong>
                    ₹{(Number(quantity) * Number(price)).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </div>
              )}

              {/* MODAL ACTIONS */}
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-cancel"
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={16} className="spin" /> Saving...
                    </>
                  ) : modal === "edit" ? (
                    "Update Purchase Item"
                  ) : (
                    "Save Purchase Item"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
