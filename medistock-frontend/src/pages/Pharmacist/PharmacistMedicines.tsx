import React, { useEffect, useState } from "react";
import axiosInstance from "@/api/axios";
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



const PharmacistMedicines: React.FC = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [medicineList, setMedicineList] = useState<Medicine[]>([]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axiosInstance.get("/medicines");
        if (Array.isArray(response.data)) {
          const mapped: Medicine[] = response.data.map((item: any) => {
            const stockQty = item.stockQuantity ?? item.quantity ?? 0;
            const computedStatus: "Available" | "Low Stock" | "Out of Stock" =
              stockQty <= 0 ? "Out of Stock" : stockQty <= 10 ? "Low Stock" : "Available";
            return {
              id: item.id,
              name: item.name,
              category: item.category || "General",
              supplier: item.supplier?.name || item.supplierName || "Standard Supplier",
              stock: stockQty,
              price: item.price || 0,
              expiry: item.expiryDate || "12/2027",
              status: computedStatus,
            };
          });
          setMedicineList(mapped);
        }
      } catch (err) {
        console.warn("Could not load backend medicines:", err);
      }
    };
    fetchMedicines();
  }, []);

  const filteredMedicines = medicineList.filter((medicine) => {
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
            <h2>{medicineList.length}</h2>
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
                medicineList.filter(
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
                medicineList.filter(
                  (medicine) =>
                    medicine.status === "Low Stock"
                ).length
              }
            </h2>
          </div>

        </div>


        <div className="medicine-summary-card">

          <div className="medicine-summary-icon red">
            🚫
          </div>

          <div>
            <p>Out of Stock</p>
            <h2>
              {
                medicineList.filter(
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