import React, { useState } from "react";
import "./PharmacistMedicines.css";

interface Medicine {
  id: number;
  name: string;
  category: string;
  supplier: string;
  stock: number;
  price: number;
  expiry: string;
  status: "Available" | "Low Stock" | "Out of Stock";
}

const medicines: Medicine[] = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    category: "Tablet",
    supplier: "ABC Pharma",
    stock: 450,
    price: 25,
    expiry: "12/2027",
    status: "Available",
  },
  {
    id: 2,
    name: "Amoxicillin 250mg",
    category: "Capsule",
    supplier: "MediCare Ltd",
    stock: 32,
    price: 80,
    expiry: "08/2027",
    status: "Low Stock",
  },
  {
    id: 3,
    name: "Azithromycin 500mg",
    category: "Tablet",
    supplier: "HealthPlus",
    stock: 120,
    price: 95,
    expiry: "10/2028",
    status: "Available",
  },
  {
    id: 4,
    name: "Cough Syrup",
    category: "Syrup",
    supplier: "HealthPlus",
    stock: 85,
    price: 65,
    expiry: "05/2027",
    status: "Available",
  },
  {
    id: 5,
    name: "Cetirizine 10mg",
    category: "Tablet",
    supplier: "ABC Pharma",
    stock: 8,
    price: 35,
    expiry: "03/2027",
    status: "Low Stock",
  },
  {
    id: 6,
    name: "Ibuprofen 400mg",
    category: "Tablet",
    supplier: "MediCare Ltd",
    stock: 210,
    price: 45,
    expiry: "11/2028",
    status: "Available",
  },
  {
    id: 7,
    name: "Omeprazole 20mg",
    category: "Capsule",
    supplier: "ABC Pharma",
    stock: 0,
    price: 55,
    expiry: "06/2027",
    status: "Out of Stock",
  },
  {
    id: 8,
    name: "ORS Solution",
    category: "Syrup",
    supplier: "HealthPlus",
    stock: 65,
    price: 30,
    expiry: "09/2027",
    status: "Available",
  },
];

const PharmacistMedicines: React.FC = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const filteredMedicines = medicines.filter((medicine) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      medicine.name.toLowerCase().includes(searchValue) ||
      medicine.supplier.toLowerCase().includes(searchValue);

    const matchesCategory =
      category === "" || medicine.category === category;

    const matchesStatus =
      status === "" || medicine.status === status;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setStatus("");
  };

  return (
    <div className="pharmacist-medicines-page">

      {/* =====================================================
          TOP SUMMARY
          ===================================================== */}

      <section className="medicine-summary">

        <div className="medicine-summary-card">

          <div className="medicine-summary-icon blue">
            💊
          </div>

          <div>
            <p>Total Medicines</p>
            <h2>{medicines.length}</h2>
          </div>

        </div>


        <div className="medicine-summary-card">

          <div className="medicine-summary-icon green">
            📦
          </div>

          <div>
            <p>Available</p>
            <h2>
              {
                medicines.filter(
                  (medicine) =>
                    medicine.status === "Available"
                ).length
              }
            </h2>
          </div>

        </div>


        <div className="medicine-summary-card">

          <div className="medicine-summary-icon orange">
            ⚠️
          </div>

          <div>
            <p>Low Stock</p>
            <h2>
              {
                medicines.filter(
                  (medicine) =>
                    medicine.status === "Low Stock"
                ).length
              }
            </h2>
          </div>

        </div>


        <div className="medicine-summary-card">

          <div className="medicine-summary-icon red">
            ❌
          </div>

          <div>
            <p>Out of Stock</p>
            <h2>
              {
                medicines.filter(
                  (medicine) =>
                    medicine.status === "Out of Stock"
                ).length
              }
            </h2>
          </div>

        </div>

      </section>


      {/* =====================================================
          SEARCH / FILTER
          ===================================================== */}

      <section className="medicine-search-section">

        <div className="medicine-section-header">

          <div>
            <h2>
              Medicine Inventory
            </h2>

            <p>
              Search and check medicines before approving customer orders
            </p>
          </div>

        </div>


        <div className="medicine-search-box">

          <input
            type="text"
            placeholder="Search medicine by name or supplier..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />


          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
          >

            <option value="">
              All Categories
            </option>

            <option value="Tablet">
              Tablets
            </option>

            <option value="Capsule">
              Capsules
            </option>

            <option value="Syrup">
              Syrups
            </option>

            <option value="Injection">
              Injections
            </option>

          </select>


          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
          >

            <option value="">
              All Status
            </option>

            <option value="Available">
              Available
            </option>

            <option value="Low Stock">
              Low Stock
            </option>

            <option value="Out of Stock">
              Out of Stock
            </option>

          </select>


          <button
            className="clear-medicine-button"
            onClick={clearFilters}
          >
            Clear
          </button>

        </div>

      </section>


      {/* =====================================================
          MEDICINE TABLE
          ===================================================== */}

      <section className="medicine-results-section">

        <div className="medicine-results-header">

          <div>
            <h2>
              Medicines
            </h2>

            <p>
              {filteredMedicines.length} medicine
              {filteredMedicines.length !== 1
                ? "s"
                : ""} found
            </p>
          </div>

        </div>


        <div className="pharmacist-medicine-table-wrapper">

          <table className="pharmacist-medicine-table">

            <thead>

              <tr>
                <th>Medicine</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Expiry</th>
                <th>Status</th>
              </tr>

            </thead>


            <tbody>

              {filteredMedicines.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="no-medicines"
                  >
                    <div>
                      <span>🔎</span>

                      <strong>
                        No medicines found
                      </strong>

                      <p>
                        Try changing your search or filters.
                      </p>
                    </div>
                  </td>

                </tr>

              ) : (

                filteredMedicines.map(
                  (medicine) => (

                    <tr key={medicine.id}>

                      {/* MEDICINE */}

                      <td>

                        <div className="medicine-name-cell">

                          <div className="medicine-pill-icon">
                            💊
                          </div>

                          <div>

                            <strong>
                              {medicine.name}
                            </strong>

                            <span>
                              MED-{String(
                                medicine.id
                              ).padStart(4, "0")}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* CATEGORY */}

                      <td>
                        {medicine.category}
                      </td>


                      {/* SUPPLIER */}

                      <td>
                        {medicine.supplier}
                      </td>


                      {/* STOCK */}

                      <td>

                        <strong
                          className={
                            medicine.stock === 0
                              ? "stock-number out"
                              : medicine.stock <= 50
                              ? "stock-number low"
                              : "stock-number"
                          }
                        >
                          {medicine.stock}
                        </strong>

                      </td>


                      {/* PRICE */}

                      <td>
                        ₹{medicine.price}
                      </td>


                      {/* EXPIRY */}

                      <td>
                        {medicine.expiry}
                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={`medicine-status ${medicine.status
                            .toLowerCase()
                            .replace(
                              " ",
                              "-"
                            )}`}
                        >
                          {medicine.status}
                        </span>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
};

export default PharmacistMedicines;