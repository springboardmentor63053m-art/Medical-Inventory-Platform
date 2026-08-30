import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./PharmacistPrescriptions.css";

import { getPharmacistOrders } from "./pharmacistData";
import type { PharmacistOrder } from "./pharmacistData";


const PharmacistPrescriptions: React.FC = () => {
  const [orders, setOrders] = useState<PharmacistOrder[]>([]);
  const [selectedPrescription, setSelectedPrescription] =
    useState<PharmacistOrder | null>(null);

  const navigate = useNavigate();


  useEffect(() => {
    const prescriptionOrders = getPharmacistOrders().filter(
      (order) => order.prescription
    );

    setOrders(prescriptionOrders);
  }, []);


  /*
   * View Prescription
   *
   * Displays the uploaded customer prescription in a modal.
   */
  const handleViewPrescription = (
    order: PharmacistOrder
  ) => {
    setSelectedPrescription(order);
  };


  /*
   * Review Order
   *
   * Navigate to the existing pharmacist orders page.
   */
  const handleReviewOrder = () => {
    navigate("/pharmacist/orders");
  };


  return (
    <div className="prescriptions-page">

      <section className="prescriptions-section">

        {/* =====================================================
            HEADER
           ===================================================== */}

        <div className="prescriptions-header">

          <div>
            <h2>
              Prescription Review
            </h2>

            <p>
              Review prescriptions attached to customer orders
            </p>
          </div>

        </div>


        {/* =====================================================
            PRESCRIPTION GRID
           ===================================================== */}

        <div className="prescription-grid">

          {orders.length === 0 ? (

            <div className="empty-prescriptions">

              <div className="document-icon-large">
                📄
              </div>

              <h3>
                No Prescriptions
              </h3>

              <p>
                There are no customer prescriptions to review.
              </p>

            </div>

          ) : (

            orders.map((order) => (

              <div
                className="prescription-card"
                key={order.id}
              >

                {/* =================================================
                    CUSTOMER
                   ================================================= */}

                <div className="prescription-card-top">

                  <div className="prescription-avatar">
                    {order.customerName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>

                    <strong>
                      {order.customerName}
                    </strong>

                    <span>
                      {order.id}
                    </span>

                  </div>

                </div>


                {/* =================================================
                    PRESCRIPTION DOCUMENT
                   ================================================= */}

                <div className="prescription-document">

                  <div className="document-icon-large">
                    📄
                  </div>

                  <div>

                    <strong>
                      Prescription
                    </strong>

                    <p>
                      {order.prescriptionName ||
                        "Prescription attached"}
                    </p>

                  </div>

                </div>


                {/* =================================================
                    MEDICINES
                   ================================================= */}

                <div className="prescription-medicines">

                  <strong>
                    Requested Medicines
                  </strong>

                  {order.medicines.map(
                    (medicine, index) => (

                      <div
                        key={`${order.id}-${index}`}
                        className="prescription-medicine"
                      >

                        <span>
                          {medicine.name}
                        </span>

                        <span>
                          × {medicine.quantity}
                        </span>

                      </div>

                    )
                  )}

                </div>


                {/* =================================================
                    ORDER STATUS
                   ================================================= */}

                <div className="prescription-status">

                  <span>
                    Order Status
                  </span>

                  <strong
                    className={`status-${order.status.toLowerCase()}`}
                  >
                    {order.status}
                  </strong>

                </div>


                {/* =================================================
                    ACTIONS
                   ================================================= */}

                <div className="prescription-actions">

                  <button
                    type="button"
                    className="view-prescription"
                    onClick={() =>
                      handleViewPrescription(order)
                    }
                  >
                    View Prescription
                  </button>


                  <button
                    type="button"
                    className="review-prescription"
                    onClick={handleReviewOrder}
                  >
                    Review Order
                  </button>

                </div>

              </div>

            ))

          )}

        </div>

      </section>


      {/* =========================================================
          PRESCRIPTION VIEW MODAL
         ========================================================= */}

      {selectedPrescription && (

        <div
          className="prescription-modal-overlay"
          onClick={() =>
            setSelectedPrescription(null)
          }
        >

          <div
            className="prescription-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* =================================================
                MODAL HEADER
               ================================================= */}

            <div className="prescription-modal-header">

              <div>

                <h2>
                  Prescription
                </h2>

                <p>
                  {selectedPrescription.id}
                </p>

              </div>

              <button
                type="button"
                className="prescription-modal-close"
                onClick={() =>
                  setSelectedPrescription(null)
                }
              >
                ×
              </button>

            </div>


            {/* =================================================
                CUSTOMER INFORMATION
               ================================================= */}

            <div className="prescription-modal-section">

              <h3>
                Customer Information
              </h3>

              <p>
                <strong>
                  Name:
                </strong>{" "}
                {selectedPrescription.customerName}
              </p>

              <p>
                <strong>
                  Customer ID:
                </strong>{" "}
                {selectedPrescription.customerId}
              </p>

              <p>
                <strong>
                  Order ID:
                </strong>{" "}
                {selectedPrescription.id}
              </p>

            </div>


            {/* =================================================
                PRESCRIPTION FILE
               ================================================= */}

            <div className="prescription-file-preview">

              <div className="document-icon-large">
                📄
              </div>

              <div>

                <strong>
                  Prescription Attached
                </strong>

                <p>
                  {selectedPrescription.prescriptionName ||
                    "Prescription attached"}
                </p>

              </div>

            </div>


            {/* =================================================
                REQUESTED MEDICINES
               ================================================= */}

            <div className="prescription-modal-section">

              <h3>
                Requested Medicines
              </h3>

              {selectedPrescription.medicines.map(
                (medicine, index) => (

                  <div
                    className="modal-medicine-row"
                    key={`${selectedPrescription.id}-${index}`}
                  >

                    <span>
                      {medicine.name}
                    </span>

                    <span>
                      × {medicine.quantity}
                    </span>

                  </div>

                )
              )}

            </div>


            {/* =================================================
                STATUS
               ================================================= */}

            <div className="prescription-modal-status">

              <span>
                Order Status
              </span>

              <strong>
                {selectedPrescription.status}
              </strong>

            </div>


            {/* =================================================
                MODAL ACTIONS
               ================================================= */}

            <div className="prescription-modal-actions">

              <button
                type="button"
                className="modal-close-button"
                onClick={() =>
                  setSelectedPrescription(null)
                }
              >
                Close
              </button>

              <button
                type="button"
                className="modal-review-button"
                onClick={() => {
                  setSelectedPrescription(null);
                  navigate("/pharmacist/orders");
                }}
              >
                Review Order
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};


export default PharmacistPrescriptions;