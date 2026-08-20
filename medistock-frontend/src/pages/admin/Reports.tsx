import { useMemo } from "react";
import {
  BarChart3,
  Package,
  AlertTriangle,
  XCircle,
  Clock3,
  CheckCircle2,
  Download,
  Printer,
  FileText,
} from "lucide-react";
import "./Reports.css";

interface MedicineReport {
  id: number;
  name: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  expiryDate: string;
  price: number;
}

const medicineData: MedicineReport[] = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    category: "Tablet",
    quantity: 450,
    reorderLevel: 50,
    expiryDate: "2027-06-15",
    price: 25,
  },
  {
    id: 2,
    name: "Amoxicillin 250mg",
    category: "Capsule",
    quantity: 32,
    reorderLevel: 50,
    expiryDate: "2026-09-20",
    price: 80,
  },
  {
    id: 3,
    name: "Azithromycin 500mg",
    category: "Tablet",
    quantity: 120,
    reorderLevel: 40,
    expiryDate: "2027-01-12",
    price: 95,
  },
  {
    id: 4,
    name: "Cough Syrup",
    category: "Syrup",
    quantity: 85,
    reorderLevel: 30,
    expiryDate: "2026-10-18",
    price: 65,
  },
  {
    id: 5,
    name: "Cetirizine 10mg",
    category: "Tablet",
    quantity: 8,
    reorderLevel: 25,
    expiryDate: "2026-08-10",
    price: 35,
  },
  {
    id: 6,
    name: "Insulin 10ml",
    category: "Injection",
    quantity: 0,
    reorderLevel: 20,
    expiryDate: "2027-03-20",
    price: 450,
  },
  {
    id: 7,
    name: "Vitamin C 500mg",
    category: "Tablet",
    quantity: 75,
    reorderLevel: 30,
    expiryDate: "2026-10-05",
    price: 55,
  },
  {
    id: 8,
    name: "Metformin 500mg",
    category: "Tablet",
    quantity: 18,
    reorderLevel: 30,
    expiryDate: "2027-02-25",
    price: 40,
  },
];

const Reports = () => {
  const today = new Date();

  const getExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const difference =
      (expiry.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24);

    if (difference < 0) {
      return "Expired";
    }

    if (difference <= 30) {
      return "Expiring Soon";
    }

    if (difference <= 60) {
      return "Near Expiry";
    }

    return "Safe";
  };

  const totalMedicines = medicineData.length;

  const totalStock = medicineData.reduce(
    (sum, medicine) => sum + medicine.quantity,
    0
  );

  const lowStock = medicineData.filter(
    (medicine) =>
      medicine.quantity > 0 &&
      medicine.quantity <= medicine.reorderLevel
  ).length;

  const outOfStock = medicineData.filter(
    (medicine) => medicine.quantity === 0
  ).length;

  const expired = medicineData.filter(
    (medicine) =>
      getExpiryStatus(medicine.expiryDate) === "Expired"
  ).length;

  const expiringSoon = medicineData.filter(
    (medicine) =>
      getExpiryStatus(medicine.expiryDate) ===
      "Expiring Soon"
  ).length;

  const nearExpiry = medicineData.filter(
    (medicine) =>
      getExpiryStatus(medicine.expiryDate) ===
      "Near Expiry"
  ).length;

  const safeMedicines = medicineData.filter(
    (medicine) =>
      getExpiryStatus(medicine.expiryDate) === "Safe"
  ).length;

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};

    medicineData.forEach((medicine) => {
      categories[medicine.category] =
        (categories[medicine.category] || 0) +
        medicine.quantity;
    });

    return Object.entries(categories);
  }, []);

  const stockChartData = [
    {
      label: "Available",
      value:
        totalMedicines - lowStock - outOfStock,
    },
    {
      label: "Low Stock",
      value: lowStock,
    },
    {
      label: "Out of Stock",
      value: outOfStock,
    },
  ];

  const expiryChartData = [
    {
      label: "Safe",
      value: safeMedicines,
    },
    {
      label: "Near Expiry",
      value: nearExpiry,
    },
    {
      label: "Expiring Soon",
      value: expiringSoon,
    },
    {
      label: "Expired",
      value: expired,
    },
  ];

  const handleExport = () => {
    const headers = [
      "Medicine",
      "Category",
      "Quantity",
      "Reorder Level",
      "Expiry Date",
      "Expiry Status",
      "Price",
    ];

    const rows = medicineData.map((medicine) => [
      medicine.name,
      medicine.category,
      medicine.quantity,
      medicine.reorderLevel,
      medicine.expiryDate,
      getExpiryStatus(medicine.expiryDate),
      medicine.price,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "medistock-inventory-report.csv";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const maxCategoryStock = Math.max(
    ...categoryData.map(([, value]) => value),
    1
  );

  const maxStockChart = Math.max(
    ...stockChartData.map((item) => item.value),
    1
  );

  const maxExpiryChart = Math.max(
    ...expiryChartData.map((item) => item.value),
    1
  );

  return (
    <div className="reports-page">

      {/* HEADER */}
      <div className="reports-header">

        <div>
          <div className="reports-eyebrow">
            MEDISTOCK • ANALYTICS
          </div>

          <h1>Inventory Reports</h1>

          <p>
            Monitor inventory performance, stock
            conditions and medicine expiry status.
          </p>
        </div>

        <div className="reports-actions">

          <button
            className="report-print-button"
            onClick={handlePrint}
          >
            <Printer size={18} />
            Print
          </button>

          <button
            className="report-export-button"
            onClick={handleExport}
          >
            <Download size={18} />
            Export CSV
          </button>

        </div>

      </div>

      {/* REPORT BANNER */}
      <div className="reports-banner">

        <div className="reports-banner-icon">
          <BarChart3 size={30} />
        </div>

        <div>
          <span>INVENTORY ANALYTICS REPORT</span>

          <h2>
            Complete inventory overview
          </h2>

          <p>
            Stock levels, expiry conditions and
            inventory health at a glance.
          </p>
        </div>

        <div className="report-date">
          <FileText size={18} />
          <span>
            Generated:{" "}
            {today.toLocaleDateString()}
          </span>
        </div>

      </div>

      {/* STAT CARDS */}
      <div className="report-stat-grid">

        <div className="report-stat-card">
          <div className="report-stat-icon blue">
            <Package size={24} />
          </div>

          <div>
            <span>Total Medicines</span>
            <strong>{totalMedicines}</strong>
            <small>Registered medicines</small>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon purple">
            <BarChart3 size={24} />
          </div>

          <div>
            <span>Total Stock</span>
            <strong>{totalStock}</strong>
            <small>Units in inventory</small>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon orange">
            <AlertTriangle size={24} />
          </div>

          <div>
            <span>Low Stock</span>
            <strong>{lowStock}</strong>
            <small>Need replenishment</small>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon red">
            <XCircle size={24} />
          </div>

          <div>
            <span>Out of Stock</span>
            <strong>{outOfStock}</strong>
            <small>Currently unavailable</small>
          </div>
        </div>

      </div>

      {/* EXPIRY SUMMARY */}
      <div className="expiry-summary">

        <div className="expiry-summary-title">
          <Clock3 size={21} />
          <div>
            <h2>Expiry Monitoring</h2>
            <p>
              Medicine expiry condition summary
            </p>
          </div>
        </div>

        <div className="expiry-summary-items">

          <div className="expiry-summary-item safe">
            <CheckCircle2 size={20} />
            <div>
              <span>Safe</span>
              <strong>{safeMedicines}</strong>
              <small>&gt; 60 days</small>
            </div>
          </div>

          <div className="expiry-summary-item near">
            <Clock3 size={20} />
            <div>
              <span>Near Expiry</span>
              <strong>{nearExpiry}</strong>
              <small>31–60 days</small>
            </div>
          </div>

          <div className="expiry-summary-item soon">
            <AlertTriangle size={20} />
            <div>
              <span>Expiring Soon</span>
              <strong>{expiringSoon}</strong>
              <small>0–30 days</small>
            </div>
          </div>

          <div className="expiry-summary-item expired">
            <XCircle size={20} />
            <div>
              <span>Expired</span>
              <strong>{expired}</strong>
              <small>Past expiry date</small>
            </div>
          </div>

        </div>

      </div>

      {/* CHARTS */}
      <div className="charts-grid">

        {/* STOCK CHART */}
        <div className="chart-card">

          <div className="chart-header">
            <div>
              <h2>Stock Status</h2>
              <p>
                Current medicine availability
              </p>
            </div>

            <div className="chart-header-icon blue">
              <Package size={20} />
            </div>
          </div>

          <div className="bar-chart">

            {stockChartData.map((item) => (

              <div
                className="bar-chart-column"
                key={item.label}
              >

                <div className="bar-value">
                  {item.value}
                </div>

                <div className="bar-wrapper">

                  <div
                    className={`bar-fill ${
                      item.label === "Available"
                        ? "available"
                        : item.label ===
                          "Low Stock"
                        ? "low"
                        : "empty"
                    }`}
                    style={{
                      height: `${
                        (item.value /
                          maxStockChart) *
                        100
                      }%`,
                    }}
                  />

                </div>

                <span>{item.label}</span>

              </div>

            ))}

          </div>

        </div>

        {/* EXPIRY CHART */}
        <div className="chart-card">

          <div className="chart-header">

            <div>
              <h2>Expiry Status</h2>
              <p>
                Medicine expiry distribution
              </p>
            </div>

            <div className="chart-header-icon orange">
              <Clock3 size={20} />
            </div>

          </div>

          <div className="horizontal-chart">

            {expiryChartData.map((item) => (

              <div
                className="horizontal-chart-row"
                key={item.label}
              >

                <div className="horizontal-chart-label">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>

                <div className="horizontal-bar">
                  <div
                    className={`horizontal-fill ${
                      item.label
                        .toLowerCase()
                        .replace(" ", "-")
                    }`}
                    style={{
                      width: `${
                        (item.value /
                          maxExpiryChart) *
                        100
                      }%`,
                    }}
                  />
                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* CATEGORY CHART */}
      <div className="category-chart-card">

        <div className="chart-header">

          <div>
            <h2>Stock by Category</h2>
            <p>
              Total inventory units by medicine
              category
            </p>
          </div>

          <div className="chart-header-icon purple">
            <BarChart3 size={20} />
          </div>

        </div>

        <div className="category-bars">

          {categoryData.map(
            ([category, quantity]) => (

              <div
                className="category-row"
                key={category}
              >

                <div className="category-row-info">
                  <span>{category}</span>
                  <strong>
                    {quantity} units
                  </strong>
                </div>

                <div className="category-track">
                  <div
                    className="category-fill"
                    style={{
                      width: `${
                        (quantity /
                          maxCategoryStock) *
                        100
                      }%`,
                    }}
                  />
                </div>

              </div>

            )
          )}

        </div>

      </div>

      {/* MEDICINE TABLE */}
      <div className="report-table-card">

        <div className="report-table-header">

          <div>
            <h2>Inventory Details</h2>
            <p>
              Detailed medicine stock and expiry
              information
            </p>
          </div>

          <span className="report-table-count">
            {medicineData.length} medicines
          </span>

        </div>

        <div className="report-table-scroll">

          <table className="report-table">

            <thead>
              <tr>
                <th>MEDICINE</th>
                <th>CATEGORY</th>
                <th>STOCK</th>
                <th>REORDER LEVEL</th>
                <th>EXPIRY DATE</th>
                <th>EXPIRY STATUS</th>
                <th>PRICE</th>
              </tr>
            </thead>

            <tbody>

              {medicineData.map(
                (medicine) => {

                  const stockStatus =
                    medicine.quantity === 0
                      ? "Out of Stock"
                      : medicine.quantity <=
                        medicine.reorderLevel
                      ? "Low Stock"
                      : "Available";

                  const expiryStatus =
                    getExpiryStatus(
                      medicine.expiryDate
                    );

                  return (
                    <tr key={medicine.id}>

                      <td>
                        <strong className="medicine-name">
                          {medicine.name}
                        </strong>
                      </td>

                      <td>
                        <span className="category-badge">
                          {medicine.category}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {medicine.quantity}
                        </strong>
                      </td>

                      <td>
                        {medicine.reorderLevel}
                      </td>

                      <td>
                        {medicine.expiryDate}
                      </td>

                      <td>
                        <span
                          className={`status-badge expiry-${expiryStatus
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          <i />
                          {expiryStatus}
                        </span>
                      </td>

                      <td>
                        ₹{medicine.price}
                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* REPORT FOOTER */}
      <div className="report-footer">

        <div>
          <strong>
            MediStock Inventory Report
          </strong>

          <span>
            Generated from current inventory
            monitoring data.
          </span>
        </div>

        <div className="report-footer-summary">
          <span>
            Total stock:{" "}
            <strong>{totalStock}</strong>
          </span>

          <span>
            Alerts:{" "}
            <strong>
              {lowStock + outOfStock}
            </strong>
          </span>

          <span>
            Expiry issues:{" "}
            <strong>
              {expired + expiringSoon}
            </strong>
          </span>
        </div>

      </div>

    </div>
  );
};

export default Reports;