import React from "react";
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

  const stockItems: StockItem[] = [
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
  ];

  const totalStock = stockItems.reduce(
    (total, item) => total + item.stock,
    0
  );

  const availableCount = stockItems.filter(
    (item) => item.status === "Available"
  ).length;

  const lowStockCount = stockItems.filter(
    (item) => item.status === "Low Stock"
  ).length;

  return (
    <div className="staff-stock-page">

      {/* Summary */}
      <section className="stock-summary">

        <div className="stock-summary-card">
          <div className="stock-icon blue">
            📦
          </div>

          <div>
            <p>Total Stock</p>
            <h2>{totalStock}</h2>
          </div>
        </div>

        <div className="stock-summary-card">
          <div className="stock-icon green">
            ✓
          </div>

          <div>
            <p>Available Items</p>
            <h2>{availableCount}</h2>
          </div>
        </div>

        <div className="stock-summary-card">
          <div className="stock-icon orange">
            ⚠️
          </div>

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
            <h2>Stock Overview</h2>
            <p>
              Current medicine stock available in inventory
            </p>
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
              </tr>
            </thead>

            <tbody>

              {stockItems.map((item) => {

                const percentage = Math.min(
                  (item.stock / item.minimum) * 100,
                  100
                );

                return (
                  <tr key={item.id}>

                    <td>
                      <strong className="stock-medicine-name">
                        {item.medicine}
                      </strong>
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
                            className={`stock-progress-bar ${
                              item.status === "Available"
                                ? "normal"
                                : "warning"
                            }`}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        <span>
                          {Math.round(percentage)}%
                        </span>

                      </div>

                    </td>

                    <td>
                      <span
                        className={`stock-status ${
                          item.status === "Available"
                            ? "available"
                            : "low"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
};

export default StaffStock;