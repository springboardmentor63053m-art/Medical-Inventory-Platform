import React, { useEffect, useState } from "react";
import axiosInstance from "@/api/axios";
import "./StaffStock.css";

interface StockItem {
  id: number;
  medicine: string;
  category: string;
  stock: number;
  minimum: number;
  status: string;
}

const StaffStock: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([
    {
      id: 1,
      medicine: "Paracetamol 500mg",
      category: "Tablet",
      stock: 450,
      minimum: 100,
      status: "Available",
    },
    {
      id: 2,
      medicine: "Amoxicillin 250mg",
      category: "Capsule",
      stock: 32,
      minimum: 50,
      status: "Low Stock",
    },
    {
      id: 3,
      medicine: "Cough Syrup",
      category: "Syrup",
      stock: 120,
      minimum: 50,
      status: "Available",
    },
    {
      id: 4,
      medicine: "Azithromycin 500mg",
      category: "Tablet",
      stock: 15,
      minimum: 40,
      status: "Low Stock",
    },
    {
      id: 5,
      medicine: "Cetirizine 10mg",
      category: "Tablet",
      stock: 210,
      minimum: 80,
      status: "Available",
    },
  ]);

  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [staffNote, setStaffNote] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await axiosInstance.get("/medicines");
      if (Array.isArray(response.data) && response.data.length > 0) {
        const mapped: StockItem[] = response.data.map((m: any) => {
          const qty = Number(m.stockQuantity ?? 10);
          const min = Number(m.reorderLevel ?? 50);
          return {
            id: m.id,
            medicine: m.name || "Medicine",
            category: m.category || "General",
            stock: qty,
            minimum: min,
            status: qty <= min ? "Low Stock" : "Available",
          };
        });
        setStockItems(mapped);
      }
    } catch {
      // Fallback to static
    }
  };

  const handleOpenNotifyModal = (item: StockItem) => {
    setSelectedItem(item);
    setStaffNote(`Urgent reorder recommended for ${item.medicine}. Current stock is ${item.stock} units.`);
    setShowNotifyModal(true);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const message = `Staff report: Low stock alert for ${selectedItem.medicine}. Current Stock: ${selectedItem.stock} Units (Minimum: ${selectedItem.minimum}). Note: ${staffNote.trim()}`;

    try {
      await axiosInstance.post("/notifications", {
        title: "Low Stock Report from Staff",
        type: "LOW_STOCK",
        message: message,
        isRead: false,
        timestamp: new Date().toISOString(),
      });

      setNotice(`Notification for ${selectedItem.medicine} sent to Admin successfully!`);
      setShowNotifyModal(false);
      setSelectedItem(null);
    } catch (err) {
      setNotice("Could not send notification to Admin.");
    }
  };

  const totalStock = stockItems.reduce((total, item) => total + item.stock, 0);
  const availableCount = stockItems.filter((item) => item.status === "Available").length;
  const lowStockCount = stockItems.filter((item) => item.status === "Low Stock").length;

  return (
    <div className="staff-stock-page">
      {notice && (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          ✓ {notice}
        </div>
      )}

      {/* Summary */}
      <section className="stock-summary">
        <div className="stock-summary-card">
          <div className="stock-icon blue">📦</div>
          <div>
            <p>Total Stock</p>
            <h2>{totalStock}</h2>
          </div>
        </div>

        <div className="stock-summary-card">
          <div className="stock-icon green">✓</div>
          <div>
            <p>Available Items</p>
            <h2>{availableCount}</h2>
          </div>
        </div>

        <div className="stock-summary-card">
          <div className="stock-icon orange">⚠️</div>
          <div>
            <p>Low Stock</p>
            <h2>{lowStockCount}</h2>
          </div>
        </div>
      </section>

      {/* Stock table */}
      <section className="stock-table-card">
        <div className="stock-heading">
          <div>
            <h2>Stock Overview & Alerts</h2>
            <p>Current medicine stock available in inventory. Select low-stock medicines to notify Admin.</p>
          </div>
        </div>

        <div className="stock-table-wrapper">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Minimum Stock</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {stockItems.map((item) => {
                const percentage = Math.min((item.stock / Math.max(item.minimum, 1)) * 100, 100);

                return (
                  <tr key={item.id}>
                    <td>
                      <strong className="stock-medicine-name">{item.medicine}</strong>
                    </td>
                    <td>{item.category}</td>
                    <td>
                      <strong>{item.stock}</strong>
                    </td>
                    <td>{item.minimum}</td>
                    <td>
                      <div className="stock-progress">
                        <div className="stock-progress-background">
                          <div
                            className={`stock-progress-bar ${item.status === "Available" ? "normal" : "warning"}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span>{Math.round(percentage)}%</span>
                      </div>
                    </td>

                    <td>
                      <span className={`stock-status ${item.status === "Available" ? "available" : "low"}`}>
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => handleOpenNotifyModal(item)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "none",
                          background: item.status === "Low Stock" ? "#ea580c" : "#0284c7",
                          color: "#ffffff",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        🔔 Notify Admin
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* NOTIFY ADMIN MODAL */}
      {showNotifyModal && selectedItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "12px",
                marginBottom: "16px",
              }}
            >
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#ea580c", textTransform: "uppercase" }}>
                  Staff Alert Dispatch
                </span>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
                  Notify Admin of Low Stock
                </h3>
              </div>
              <button
                onClick={() => setShowNotifyModal(false)}
                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#64748b" }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSendNotification}>
              <div style={{ background: "#fff7ed", border: "1px solid #ffedd5", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
                <strong style={{ fontSize: "14px", color: "#9a3412", display: "block" }}>
                  {selectedItem.medicine}
                </strong>
                <span style={{ fontSize: "12px", color: "#c2410c" }}>
                  Category: {selectedItem.category} | Current Stock: <strong>{selectedItem.stock} Units</strong> (Min: {selectedItem.minimum})
                </span>
              </div>

              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                Staff Recommendation / Note for Admin
              </label>
              <textarea
                rows={3}
                value={staffNote}
                onChange={(e) => setStaffNote(e.target.value)}
                placeholder="Add custom notes for admin regarding reorder urgency..."
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  marginBottom: "20px",
                }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowNotifyModal(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#ea580c",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ✉ Send Alert to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffStock;