import React, { useEffect, useState } from "react";

import "./PharmacistDashboard.css";

import {
  getPharmacistOrders,
} from "./pharmacistData";

import type {
  PharmacistOrder,
} from "./pharmacistData";


const PharmacistDashboard: React.FC = () => {

  const [orders, setOrders] =
    useState<PharmacistOrder[]>([]);


  useEffect(() => {

    setOrders(
      getPharmacistOrders()
    );

  }, []);


  const pendingOrders =
    orders.filter(
      (order) =>
        order.status === "PENDING"
    );


  const approvedOrders =
    orders.filter(
      (order) =>
        order.status === "APPROVED"
    );


  const dispensedOrders =
    orders.filter(
      (order) =>
        order.status === "DISPENSED"
    );


  const totalOrders =
    orders.length;


  return (
    <div className="pharmacist-dashboard">


      {/* =====================================================
          SUMMARY
          ===================================================== */}

      <section className="pharmacist-summary">

        <div className="pharmacist-card">

          <div className="pharmacist-card-icon blue">
            🛒
          </div>

          <div>
            <p>Pending Orders</p>
            <h2>
              {pendingOrders.length}
            </h2>
          </div>

        </div>


        <div className="pharmacist-card">

          <div className="pharmacist-card-icon green">
            ✓
          </div>

          <div>
            <p>Approved Orders</p>
            <h2>
              {approvedOrders.length}
            </h2>
          </div>

        </div>


        <div className="pharmacist-card">

          <div className="pharmacist-card-icon purple">
            📦
          </div>

          <div>
            <p>Dispensed Orders</p>
            <h2>
              {dispensedOrders.length}
            </h2>
          </div>

        </div>


        <div className="pharmacist-card">

          <div className="pharmacist-card-icon orange">
            📋
          </div>

          <div>
            <p>Total Orders</p>
            <h2>
              {totalOrders}
            </h2>
          </div>

        </div>

      </section>


      {/* =====================================================
          NOTIFICATION
          ===================================================== */}

      {pendingOrders.length > 0 && (

        <section className="pharmacist-notification">

          <div className="notification-icon">
            🔔
          </div>

          <div className="notification-content">

            <strong>
              New medicine order requires review
            </strong>

            <p>
              {pendingOrders.length} customer
              order
              {pendingOrders.length > 1
                ? "s"
                : ""}{" "}
              waiting for pharmacist approval.
            </p>

          </div>

          <a
            href="/pharmacist/orders"
            className="notification-button"
          >
            Review Orders
          </a>

        </section>

      )}


      {/* =====================================================
          PENDING ORDERS
          ===================================================== */}

      <section className="pharmacist-section">

        <div className="pharmacist-section-header">

          <div>
            <h2>
              Orders Requiring Review
            </h2>

            <p>
              Review customer orders before dispensing
            </p>
          </div>

        </div>


        {pendingOrders.length === 0 ? (

          <div className="empty-orders">

            <span>✓</span>

            <h3>
              No pending orders
            </h3>

            <p>
              All customer orders have been reviewed.
            </p>

          </div>

        ) : (

          <div className="dashboard-orders">

            {pendingOrders.map(
              (order) => (

                <div
                  className="dashboard-order"
                  key={order.id}
                >

                  <div className="order-main">

                    <div className="customer-avatar">

                      {order.customerName
                        .charAt(0)
                        .toUpperCase()}

                    </div>


                    <div>

                      <h3>
                        {order.customerName}
                      </h3>

                      <p>
                        Order ID: {order.id}
                      </p>

                    </div>

                  </div>


                  <div className="order-medicines">

                    {order.medicines.map(
                      (medicine, index) => (

                        <div
                          key={index}
                          className="medicine-line"
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


                  <div className="order-actions">

                    <span className="pending-badge">
                      Pending Review
                    </span>

                    <a
                      href="/pharmacist/orders"
                      className="review-button"
                    >
                      Review Order
                    </a>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

    </div>
  );
};


export default PharmacistDashboard;