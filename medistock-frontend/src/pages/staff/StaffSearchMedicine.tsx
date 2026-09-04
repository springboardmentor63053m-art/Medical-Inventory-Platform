import React, { useState } from "react";
import "./StaffSearchMedicine.css";

interface Medicine {
  id: number;
  name: string;
  category: string;
  supplier: string;
  stock: number;
  status: string;
  expiry: string;
}

const StaffSearchMedicine: React.FC = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const medicines: Medicine[] = [
    {
      id: 1,
      name: "Paracetamol 500mg",
      category: "Tablet",
      supplier: "ABC Pharma",
      stock: 450,
      status: "Available",
      expiry: "12/2027",
    },
    {
      id: 2,
      name: "Amoxicillin 250mg",
      category: "Capsule",
      supplier: "MediCare Ltd",
      stock: 32,
      status: "Low Stock",
      expiry: "08/2027",
    },
    {
      id: 3,
      name: "Cough Syrup",
      category: "Syrup",
      supplier: "HealthPlus",
      stock: 120,
      status: "Available",
      expiry: "11/2027",
    },
    {
      id: 4,
      name: "Azithromycin 500mg",
      category: "Tablet",
      supplier: "MediCare Ltd",
      stock: 15,
      status: "Low Stock",
      expiry: "06/2027",
    },
    {
      id: 5,
      name: "Cetirizine 10mg",
      category: "Tablet",
      supplier: "ABC Pharma",
      stock: 210,
      status: "Available",
      expiry: "09/2028",
    },
  ];

  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch =
      medicine.name.toLowerCase().includes(search.toLowerCase()) ||
      medicine.supplier.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "" || medicine.category === category;

    const matchesStatus =
      status === "" || medicine.status === status;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="staff-search-page">

      <section className="search-medicine-card">

        <div className="search-page-heading">
          <h2>Search Medicine</h2>
          <p>
            Find medicines quickly using name, category or stock status
          </p>
        </div>

        <div className="search-medicine-controls">

          <input
            type="text"
            placeholder="Search medicine by name or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Tablet">Tablet</option>
            <option value="Capsule">Capsule</option>
            <option value="Syrup">Syrup</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Low Stock">Low Stock</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setCategory("");
              setStatus("");
            }}
          >
            Clear
          </button>

        </div>

      </section>

      <section className="search-results-card">

        <div className="search-results-header">
          <div>
            <h2>Search Results</h2>
            <p>
              {filteredMedicines.length} medicine(s) found
            </p>
          </div>
        </div>

        <div className="search-table-wrapper">

          <table className="search-medicine-table">

            <thead>
              <tr>
                <th>Medicine</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Expiry</th>
              </tr>
            </thead>

            <tbody>

              {filteredMedicines.length > 0 ? (
                filteredMedicines.map((medicine) => (
                  <tr key={medicine.id}>

                    <td>
                      <div className="search-medicine-name">
                        <span>💊</span>
                        <strong>{medicine.name}</strong>
                      </div>
                    </td>

                    <td>{medicine.category}</td>

                    <td>{medicine.supplier}</td>

                    <td>
                      <strong>{medicine.stock}</strong>
                    </td>

                    <td>
                      <span
                        className={`search-status ${
                          medicine.status === "Available"
                            ? "available"
                            : "low"
                        }`}
                      >
                        {medicine.status}
                      </span>
                    </td>

                    <td>{medicine.expiry}</td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="search-no-results"
                  >
                    No medicines found
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
};

export default StaffSearchMedicine;