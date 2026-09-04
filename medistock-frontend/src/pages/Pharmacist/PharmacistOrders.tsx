import React, { useEffect, useState } from "react";

import "./PharmacistOrders.css";

import {
  getPharmacistOrders,
  savePharmacistOrders,
} from "./pharmacistData";

import type {
  PharmacistOrder,
} from "./pharmacistData";


const PharmacistOrders: React.FC = () => {

  const [orders, setOrders] =
    useState<PharmacistOrder[]>([]);

  const [selectedOrder, setSelectedOrder] =
    useState<PharmacistOrder | null>(null);


  useEffect(() => {
    setOrders(
      getPharmacistOrders()
    );
  }, []);


  const updateStatus = (
    orderId: string,
    status:
      | "APPROVED"
      | "REJECTED"
  ) => {

    const updated =
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
            }
          : order
      );

    setOrders(updated);

    savePharmacistOrders(updated);

    setSelectedOrder(null);
  };


  const getTotal = (
    order: PharmacistOrder
  ) => {
    return order.medicines.reduce(
      (total, medicine) =>
        total +
        medicine.price *
          medicine.quantity,
      0
    );
  };


  return (
    <div className="pharmacist-orders-page">

      <section className="orders-container">

        <div className="orders-page-header">

          <div>
            <h2>
              Customer Orders
            </h2>

            <p>
              Review medicine orders before approval
            </p>
          </div>

          <div className="pending-count">
            {
              orders.filter(
                (order) =>
                  order.status ===
                  "PENDING"
              ).length
            }{" "}
            Pending
          </div>

        </div>


        <div className="orders-table-wrapper">

          <table className="orders-table">

            <thead>

              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Medicines</th>
                <th>Prescription</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>


            <tbody>

              {orders.map(
                (order) => (

                  <tr key={order.id}>

                    <td>
                      <strong>
                        {order.id}
                      </strong>

                      <span>
                        {order.createdAt}
                      </span>
                    </td>


                    <td>
                      <strong>
                        {order.customerName}
                      </strong>

                      <span>
                        {order.customerId}
                      </span>
                    </td>


                    <td>

                      <div className="order-medicine-list">

                        {order.medicines.map(
                          (medicine, index) => (

                            <span key={index}>
                              {medicine.name}
                              {" × "}
                              {medicine.quantity}
                            </span>

                          )
                        )}

                      </div>

                    </td>


                    <td>

                      {order.prescription ? (

                        <span className="prescription-yes">
                          Attached
                        </span>

                      ) : (

                        <span className="prescription-no">
                          Not Required
                        </span>

                      )}

                    </td>


                    <td>
                      ₹{getTotal(order)}
                    </td>


                    <td>

                      <span
                        className={`order-status ${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>

                    </td>


                    <td>

                      {order.status ===
                        "PENDING" ? (

                        <button
                          className="review-order-button"
                          onClick={() =>
                            setSelectedOrder(
                              order
                            )
                          }
                        >
                          Review
                        </button>

                      ) : (

                        <button
                          className="view-order-button"
                          onClick={() =>
                            setSelectedOrder(
                              order
                            )
                          }
                        >
                          View
                        </button>

                      )}

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* =====================================================
          REVIEW MODAL
          ===================================================== */}

      {selectedOrder && (

        <div className="order-modal-overlay">

          <div className="order-modal">

            <div className="modal-header">

              <div>
                <h2>
                  Review Order
                </h2>

                <p>
                  {selectedOrder.id}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedOrder(null)
                }
              >
                ×
              </button>

            </div>


            <div className="customer-information">

              <h3>
                Customer Information
              </h3>

              <p>
                <strong>
                  Name:
                </strong>{" "}
                {selectedOrder.customerName}
              </p>

              <p>
                <strong>
                  Customer ID:
                </strong>{" "}
                {selectedOrder.customerId}
              </p>

            </div>


            <div className="modal-medicines">

              <h3>
                Medicines
              </h3>

              {selectedOrder.medicines.map(
                (medicine, index) => (

                  <div
                    className="modal-medicine"
                    key={index}
                  >

                    <span>
                      {medicine.name}
                    </span>

                    <span>
                      × {medicine.quantity}
                    </span>

                    <strong>
                      ₹
                      {medicine.price *
                        medicine.quantity}
                    </strong>

                  </div>

                )
              )}

            </div>


            <div className="modal-total">

              <span>
                Total Amount
              </span>

              <strong>
                ₹{getTotal(selectedOrder)}
              </strong>

            </div>


            {selectedOrder.prescription && (

              <div className="prescription-box">

                <div>
                  <span className="document-icon">
                    📄
                  </span>

                  <div>
                    <strong>
                      Prescription Attached
                    </strong>

                    <p>
                      {
                        selectedOrder.prescriptionName
                      }
                    </p>
                  </div>
                </div>

                <button>
                  View
                </button>

              </div>

            )}


            {selectedOrder.status ===
              "PENDING" && (

              <div className="modal-actions">

                <button
                  className="reject-button"
                  onClick={() =>
                    updateStatus(
                      selectedOrder.id,
                      "REJECTED"
                    )
                  }
                >
                  Reject Order
                </button>

                <button
                  className="approve-button"
                  onClick={() =>
                    updateStatus(
                      selectedOrder.id,
                      "APPROVED"
                    )
                  }
                >
                  Approve Order
                </button>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
};


export default PharmacistOrders;