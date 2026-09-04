import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/api/axios";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  Package,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

type ActivityType = "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT";

type StockActivityRecord = {
  id: number;
  medicine: string;
  batchNo: string;
  user: string;
  action: ActivityType;
  quantity: number;
  time: string;
};

const actionLabels: Record<ActivityType, string> = {
  STOCK_IN: "Stock In",
  STOCK_OUT: "Stock Out",
  ADJUSTMENT: "Adjustment",
};

export default function StockActivity() {
  const [activities, setActivities] = useState<StockActivityRecord[]>([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | ActivityType>("ALL");

  const [showModal, setShowModal] = useState(false);

  const [medicine, setMedicine] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [action, setAction] = useState<ActivityType>("STOCK_IN");
  const [quantity, setQuantity] = useState("");
  const [user, setUser] = useState("Admin");

  useEffect(() => {
    fetchStockLogs();
  }, []);

  const fetchStockLogs = async () => {
    try {
      const response = await axiosInstance.get("/stocklogs");
      if (Array.isArray(response.data)) {
        const mapped: StockActivityRecord[] = response.data.map((item: any) => ({
          id: item.id,
          medicine: item.medicine?.name || item.medicineName || "Medicine",
          batchNo: item.inventory?.batchNumber || item.batchNo || item.batchNumber || `MED-${String(item.id).padStart(4, "0")}`,
          user: item.user?.username || item.performedBy || "Admin",
          action: (item.actionType || item.action || "STOCK_IN").toUpperCase() as ActivityType,
          quantity: item.quantityChanged || item.quantity || 0,
          time: item.timestamp ? new Date(item.timestamp).toLocaleString("en-IN") : "Just now",
        }));
        setActivities(mapped);
      }
    } catch (err) {
      console.warn("Could not fetch stock logs:", err);
    }
  };

  const filteredActivities = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return activities.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.medicine.toLowerCase().includes(keyword) ||
        item.batchNo.toLowerCase().includes(keyword) ||
        item.user.toLowerCase().includes(keyword);

      const matchesFilter =
        filter === "ALL" || item.action === filter;

      return matchesSearch && matchesFilter;
    });
  }, [activities, search, filter]);

  const totalActivities = activities.length;

  const stockInActivities = activities.filter(
    (item) => item.action === "STOCK_IN"
  );

  const stockOutActivities = activities.filter(
    (item) => item.action === "STOCK_OUT"
  );

  const adjustmentActivities = activities.filter(
    (item) => item.action === "ADJUSTMENT"
  );

  const totalStockIn = stockInActivities.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalStockOut = stockOutActivities.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const resetForm = () => {
    setMedicine("");
    setBatchNo("");
    setAction("STOCK_IN");
    setQuantity("");
    setUser("Admin");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleNewStockLog = () => {
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!medicine.trim()) {
      alert("Please enter medicine name.");
      return;
    }

    if (!batchNo.trim()) {
      alert("Please enter batch number.");
      return;
    }

    const numericQuantity = Number(quantity);

    if (!numericQuantity || numericQuantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    try {
      await axiosInstance.post("/stocklogs", {
        medicineName: medicine.trim(),
        batchNumber: batchNo.trim(),
        actionType: action,
        quantityChanged: numericQuantity,
        performedBy: user.trim() || "Admin",
      });
    } catch (err) {
      console.warn("Posting to backend stocklogs failed, adding locally:", err);
    }

    const newActivity: StockActivityRecord = {
      id: Date.now(),
      medicine: medicine.trim(),
      batchNo: batchNo.trim(),
      user: user.trim() || "Admin",
      action,
      quantity: numericQuantity,
      time: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setActivities((previous) => [newActivity, ...previous]);
    handleCloseModal();
  };

  const handleRefresh = () => {
    setSearch("");
    setFilter("ALL");
    fetchStockLogs();
  };

  return (
    <>
      <style>{`
        .stock-page {
          width: 100%;
          min-height: calc(100vh - 104px);
          background: #f5f8fd;
          padding: 30px 36px 60px;
          box-sizing: border-box;
          color: #17233d;
        }

        .stock-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
          margin-bottom: 28px;
        }

        .stock-card {
          background: #ffffff;
          border: 1px solid #e1e9f5;
          border-radius: 22px;
          padding: 26px;
          display: flex;
          align-items: center;
          gap: 18px;
          box-shadow: 0 10px 30px rgba(38, 74, 125, 0.06);
        }

        .stock-card-icon {
          width: 66px;
          height: 66px;
          min-width: 66px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stock-card-icon.blue {
          background: #edf4ff;
          color: #2563eb;
        }

        .stock-card-icon.green {
          background: #e9faf2;
          color: #0aa66f;
        }

        .stock-card-icon.red {
          background: #fff0f1;
          color: #ef4b5b;
        }

        .stock-card-icon.purple {
          background: #f1edff;
          color: #6947dc;
        }

        .stock-card-label {
          color: #7186a3;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .stock-card-value {
          margin-top: 6px;
          font-size: 34px;
          line-height: 1;
          font-weight: 800;
          color: #17233d;
        }

        .stock-card-description {
          margin-top: 7px;
          color: #8da0b9;
          font-size: 13px;
        }

        .stock-toolbar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #ffffff;
          border: 1px solid #e1e9f5;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(38, 74, 125, 0.05);
          margin-bottom: 26px;
        }

        .stock-search {
          flex: 1;
          position: relative;
        }

        .stock-search svg {
          position: absolute;
          left: 17px;
          top: 50%;
          transform: translateY(-50%);
          color: #7890ad;
        }

        .stock-search input {
          width: 100%;
          height: 54px;
          box-sizing: border-box;
          padding: 0 18px 0 50px;
          border: 1px solid #d9e4f2;
          border-radius: 13px;
          outline: none;
          font-size: 15px;
          color: #17233d;
          background: #ffffff;
        }

        .stock-search input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
        }

        .stock-filter {
          height: 54px;
          min-width: 190px;
          padding: 0 16px;
          border: 1px solid #d9e4f2;
          border-radius: 13px;
          background: #ffffff;
          color: #344b69;
          font-size: 15px;
          outline: none;
        }

        .stock-refresh {
          height: 54px;
          padding: 0 22px;
          border: 1px solid #d9e4f2;
          border-radius: 13px;
          background: #ffffff;
          color: #344b69;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .stock-refresh:hover {
          background: #f5f8fd;
        }

        .stock-table-card {
          background: #ffffff;
          border: 1px solid #e1e9f5;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(38, 74, 125, 0.05);
        }

        .stock-table-header {
          padding: 28px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          border-bottom: 1px solid #e7edf5;
        }

        .stock-table-header h2 {
          margin: 0;
          font-size: 24px;
          color: #17233d;
        }

        .stock-table-header p {
          margin: 7px 0 0;
          color: #7890ad;
          font-size: 14px;
        }

        .new-stock-button {
          border: none;
          border-radius: 13px;
          background: #2563eb;
          color: #ffffff;
          padding: 15px 24px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 9px;
          box-shadow: 0 12px 25px rgba(37, 99, 235, 0.22);
        }

        .new-stock-button:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .stock-table-scroll {
          overflow-x: auto;
        }

        .stock-table {
          width: 100%;
          min-width: 950px;
          border-collapse: collapse;
        }

        .stock-table th {
          padding: 18px 24px;
          background: #f8fafd;
          color: #7186a3;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-align: left;
          text-transform: uppercase;
        }

        .stock-table td {
          padding: 21px 24px;
          border-top: 1px solid #edf1f6;
          color: #344b69;
          font-size: 14px;
        }

        .stock-table tbody tr:hover {
          background: #fbfdff;
        }

        .medicine-name {
          color: #17233d;
          font-weight: 800;
          font-size: 15px;
        }

        .batch-badge {
          display: inline-flex;
          padding: 8px 11px;
          border-radius: 9px;
          background: #f1f5fb;
          color: #315477;
          font-weight: 700;
          font-size: 12px;
        }

        .action-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
        }

        .action-badge.stock-in {
          background: #e9faf2;
          color: #008f61;
        }

        .action-badge.stock-out {
          background: #fff0f1;
          color: #d64551;
        }

        .action-badge.adjustment {
          background: #f1edff;
          color: #6947d9;
        }

        .quantity {
          font-weight: 800;
          color: #17233d;
          font-size: 16px;
        }

        .empty-state {
          padding: 70px 30px;
          text-align: center;
        }

        .empty-state-icon {
          width: 65px;
          height: 65px;
          border-radius: 18px;
          background: #edf4ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
        }

        .empty-state h3 {
          margin: 0;
          color: #344b69;
        }

        .empty-state p {
          margin: 8px 0 0;
          color: #91a3bb;
        }

        /* MODAL */

        .stock-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(15, 31, 55, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .stock-modal {
          width: min(570px, 100%);
          max-height: calc(100vh - 48px);
          overflow-y: auto;
          background: #ffffff;
          border-radius: 22px;
          box-shadow: 0 30px 80px rgba(15, 35, 65, 0.25);
        }

        .stock-modal-header {
          padding: 25px 28px;
          border-bottom: 1px solid #e7edf5;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .stock-modal-header h2 {
          margin: 0;
          color: #17233d;
          font-size: 25px;
        }

        .stock-modal-header p {
          margin: 6px 0 0;
          color: #7890ad;
          font-size: 14px;
        }

        .modal-close {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 10px;
          background: #f2f5f9;
          color: #61758f;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          background: #e8edf4;
        }

        .stock-form {
          padding: 28px;
          display: grid;
          gap: 19px;
        }

        .form-group {
          display: grid;
          gap: 8px;
        }

        .form-group label {
          color: #344b69;
          font-size: 13px;
          font-weight: 800;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          height: 50px;
          box-sizing: border-box;
          border: 1px solid #d9e4f2;
          border-radius: 11px;
          padding: 0 14px;
          outline: none;
          color: #17233d;
          background: #ffffff;
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .stock-modal-actions {
          padding: 20px 28px 28px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid #edf1f6;
        }

        .modal-cancel {
          min-height: 48px;
          padding: 0 20px;
          border: 1px solid #d9e4f2;
          border-radius: 11px;
          background: #ffffff;
          color: #526b8b;
          font-weight: 700;
          cursor: pointer;
        }

        .modal-save {
          min-height: 48px;
          padding: 0 23px;
          border: none;
          border-radius: 11px;
          background: #2563eb;
          color: #ffffff;
          font-weight: 800;
          cursor: pointer;
        }

        .modal-save:hover {
          background: #1d4ed8;
        }

        @media (max-width: 1100px) {
          .stock-summary {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 760px) {
          .stock-page {
            padding: 24px 16px 40px;
          }

          .stock-summary {
            grid-template-columns: 1fr;
          }

          .stock-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .stock-filter,
          .stock-refresh {
            width: 100%;
          }

          .stock-table-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .new-stock-button {
            width: 100%;
            justify-content: center;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="stock-page">

        {/* SUMMARY CARDS */}
        <div className="stock-summary">

          <div className="stock-card">
            <div className="stock-card-icon blue">
              <Activity size={30} />
            </div>

            <div>
              <div className="stock-card-label">
                Total Activities
              </div>

              <div className="stock-card-value">
                {totalActivities}
              </div>

              <div className="stock-card-description">
                All stock transactions
              </div>
            </div>
          </div>

          <div className="stock-card">
            <div className="stock-card-icon green">
              <ArrowDownToLine size={30} />
            </div>

            <div>
              <div className="stock-card-label">
                Stock In
              </div>

              <div className="stock-card-value">
                {stockInActivities.length}
              </div>

              <div className="stock-card-description">
                {totalStockIn} units received
              </div>
            </div>
          </div>

          <div className="stock-card">
            <div className="stock-card-icon red">
              <ArrowUpFromLine size={30} />
            </div>

            <div>
              <div className="stock-card-label">
                Stock Out
              </div>

              <div className="stock-card-value">
                {stockOutActivities.length}
              </div>

              <div className="stock-card-description">
                {totalStockOut} units issued
              </div>
            </div>
          </div>

          <div className="stock-card">
            <div className="stock-card-icon purple">
              <SlidersHorizontal size={30} />
            </div>

            <div>
              <div className="stock-card-label">
                Adjustments
              </div>

              <div className="stock-card-value">
                {adjustmentActivities.length}
              </div>

              <div className="stock-card-description">
                Stock corrections
              </div>
            </div>
          </div>

        </div>

        {/* SEARCH / FILTER */}
        <div className="stock-toolbar">

          <div className="stock-search">
            <Search size={24} />

            <input
              type="text"
              placeholder="Search medicine, batch, user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="stock-filter"
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "ALL" | ActivityType)
            }
          >
            <option value="ALL">All Activities</option>
            <option value="STOCK_IN">Stock In</option>
            <option value="STOCK_OUT">Stock Out</option>
            <option value="ADJUSTMENT">Adjustments</option>
          </select>

          <button
            className="stock-refresh"
            type="button"
            onClick={handleRefresh}
          >
            <RefreshCw size={18} />
            Refresh
          </button>

        </div>

        {/* TABLE */}
        <div className="stock-table-card">

          <div className="stock-table-header">

            <div>
              <h2>Recent Stock Activity</h2>

              <p>
                Showing {filteredActivities.length} of{" "}
                {activities.length} stock activities
              </p>
            </div>

            {/* THIS BUTTON NOW WORKS */}
            <button
              type="button"
              className="new-stock-button"
              onClick={handleNewStockLog}
            >
              <Plus size={22} />
              New Stock Log
            </button>

          </div>

          <div className="stock-table-scroll">

            {filteredActivities.length === 0 ? (

              <div className="empty-state">

                <div className="empty-state-icon">
                  <Package size={30} />
                </div>

                <h3>No stock activity found</h3>

                <p>
                  Add a new stock log using the button above.
                </p>

              </div>

            ) : (

              <table className="stock-table">

                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Batch No.</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Quantity</th>
                    <th>Time</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredActivities.map((item) => (

                    <tr key={item.id}>

                      <td>
                        <div className="medicine-name">
                          {item.medicine}
                        </div>
                      </td>

                      <td>
                        <span className="batch-badge">
                          {item.batchNo}
                        </span>
                      </td>

                      <td>
                        {item.user}
                      </td>

                      <td>
                        <span
                          className={`action-badge ${
                            item.action === "STOCK_IN"
                              ? "stock-in"
                              : item.action === "STOCK_OUT"
                              ? "stock-out"
                              : "adjustment"
                          }`}
                        >
                          {item.action === "STOCK_IN" && (
                            <ArrowDownToLine size={14} />
                          )}

                          {item.action === "STOCK_OUT" && (
                            <ArrowUpFromLine size={14} />
                          )}

                          {item.action === "ADJUSTMENT" && (
                            <SlidersHorizontal size={14} />
                          )}

                          {actionLabels[item.action]}
                        </span>
                      </td>

                      <td>
                        <span className="quantity">
                          {item.quantity}
                        </span>
                      </td>

                      <td>
                        {item.time}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

        </div>

      </div>

      {/* NEW STOCK LOG MODAL */}
      {showModal && (

        <div
          className="stock-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >

          <div className="stock-modal">

            <div className="stock-modal-header">

              <div>
                <h2>New Stock Log</h2>

                <p>
                  Record a stock movement or adjustment.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={handleCloseModal}
              >
                <X size={20} />
              </button>

            </div>

            <form
              className="stock-form"
              onSubmit={handleSubmit}
            >

              <div className="form-group">
                <label htmlFor="medicine">
                  Medicine Name
                </label>

                <input
                  id="medicine"
                  type="text"
                  placeholder="Example: Paracetamol 500mg"
                  value={medicine}
                  onChange={(e) =>
                    setMedicine(e.target.value)
                  }
                />
              </div>

              <div className="form-grid">

                <div className="form-group">
                  <label htmlFor="batchNo">
                    Batch Number
                  </label>

                  <input
                    id="batchNo"
                    type="text"
                    placeholder="MED-0025"
                    value={batchNo}
                    onChange={(e) =>
                      setBatchNo(e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="quantity">
                    Quantity
                  </label>

                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="50"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(e.target.value)
                    }
                  />
                </div>

              </div>

              <div className="form-grid">

                <div className="form-group">
                  <label htmlFor="action">
                    Activity Type
                  </label>

                  <select
                    id="action"
                    value={action}
                    onChange={(e) =>
                      setAction(
                        e.target.value as ActivityType
                      )
                    }
                  >
                    <option value="STOCK_IN">
                      Stock In
                    </option>

                    <option value="STOCK_OUT">
                      Stock Out
                    </option>

                    <option value="ADJUSTMENT">
                      Adjustment
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="user">
                    User
                  </label>

                  <input
                    id="user"
                    type="text"
                    value={user}
                    onChange={(e) =>
                      setUser(e.target.value)
                    }
                  />
                </div>

              </div>

              <div className="stock-modal-actions">

                <button
                  type="button"
                  className="modal-cancel"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-save"
                >
                  <Check
                    size={17}
                    style={{
                      verticalAlign: "middle",
                      marginRight: "6px",
                    }}
                  />
                  Save Stock Log
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </>
  );
}