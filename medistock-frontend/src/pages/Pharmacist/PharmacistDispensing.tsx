import React, { useEffect, useState } from "react";

import "./PharmacistDispensing.css";

import {
  getPharmacistOrders,
  savePharmacistOrders,
  type PharmacistOrder,
} from "./pharmacistData";
const PharmacistDispensing: React.FC = () => {

  const [orders, setOrders] =
    useState<PharmacistOrder[]>([]);


  useEffect(() => {

    setOrders(
      getPharmacistOrders()
        .filter(
          (order) =>
            order.status ===
              "APPROVED" ||
            order.status ===
              "DISPENSED"
        )
    );

  }, []);


  const markAsDispensed = (
    orderId: string
  ) => {

    const allOrders =
      getPharmacistOrders();

    const updated =
      allOrders.map(
        (order) =>
          order.id === orderId
            ? {
                ...order,
                status:
                  "DISPENSED" as const,
              }
            : order
      );

    savePharmacistOrders(
      updated
    );

    setOrders(
      updated.filter(
        (order) =>
          order.status ===
            "APPROVED" ||
          order.status ===
            "DISPENSED"
      )
    );
  };


  return (
    <div className="dispensing-page">

      <section className="dispensing-section">

        <div className="dispensing-header">

          <div>
            <h2>
              Medicine Dispensing
            </h2>

            <p>
              Give approved medicines to customers
            </p>
          </div>

        </div>


        <div className="dispensing-list">

          {orders.map(
            (order) => (

              <div
                className="dispensing-card"
                key={order.id}
              >

                <div className="dispensing-customer">

                  <div className="dispensing-avatar">
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


                <div className="dispensing-medicines">

                  {order.medicines.map(
                    (medicine, index) => (

                      <div
                        className="dispensing-medicine"
                        key={index}
                      >

                        <span>
                          {medicine.name}
                        </span>

                        <strong>
                          × {medicine.quantity}
                        </strong>

                      </div>

                    )
                  )}

                </div>


                <div className="dispensing-status">

                  <span
                    className={`dispensing-badge ${order.status.toLowerCase()}`}
                  >
                    {order.status}
                  </span>


                  {order.status ===
                    "APPROVED" && (

                    <button
                      onClick={() =>
                        markAsDispensed(
                          order.id
                        )
                      }
                    >
                      Mark as Dispensed
                    </button>

                  )}

                </div>

              </div>

            )
          )}

        </div>

      </section>

    </div>
  );
};


export default PharmacistDispensing;