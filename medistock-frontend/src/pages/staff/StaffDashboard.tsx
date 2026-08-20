import React from "react";
import "./StaffDashboard.css";

const StaffDashboard: React.FC = () => {
  return (
    <div className="staff-dashboard-content">

      {/* =====================================================
          SUMMARY CARDS
          ===================================================== */}

      <section className="staff-summary">

        <div className="staff-card">
          <div className="card-icon">
            💊
          </div>

          <div>
            <p>Total Medicines</p>
            <h2>245</h2>
          </div>
        </div>

        <div className="staff-card">
          <div className="card-icon">
            📦
          </div>

          <div>
            <p>Available Stock</p>
            <h2>1,240</h2>
          </div>
        </div>

        <div className="staff-card low-stock-card">
          <div className="card-icon">
            ⚠️
          </div>

          <div>
            <p>Low Stock</p>
            <h2>18</h2>
          </div>
        </div>

      </section>


      {/* =====================================================
          ACTIVITY ANALYTICS
          ===================================================== */}

      <section className="staff-section">

        <div className="section-header">
          <div>
            <h2>Activity Overview</h2>

            <p>
              Overview of your recent inventory activities
            </p>
          </div>
        </div>


        <div className="activity-analytics">


          {/* =================================================
              ACTIVITY PIE CHART
              ================================================= */}

          <div className="chart-card">

            <div className="chart-card-header">

              <div>
                <h3>Activity Distribution</h3>

                <p>
                  Your activity by type
                </p>
              </div>

            </div>


            <div className="pie-chart-area">

              <div className="activity-pie-chart">
                <div className="pie-center">
                  <strong>50</strong>
                  <span>Activities</span>
                </div>
              </div>


              <div className="pie-legend">

                <div className="legend-item">
                  <span className="legend-dot searched"></span>

                  <div>
                    <strong>Searches</strong>
                    <span>20 activities</span>
                  </div>

                  <b>40%</b>
                </div>


                <div className="legend-item">
                  <span className="legend-dot viewed"></span>

                  <div>
                    <strong>Medicine Views</strong>
                    <span>18 activities</span>
                  </div>

                  <b>36%</b>
                </div>


                <div className="legend-item">
                  <span className="legend-dot stock"></span>

                  <div>
                    <strong>Stock Checks</strong>
                    <span>12 activities</span>
                  </div>

                  <b>24%</b>
                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              STOCK ACTIVITY PIE CHART
              ================================================= */}

          <div className="chart-card">

            <div className="chart-card-header">

              <div>
                <h3>Inventory Activity</h3>

                <p>
                  Activity performed this month
                </p>
              </div>

            </div>


            <div className="pie-chart-area">

              <div className="inventory-pie-chart">
                <div className="pie-center">
                  <strong>100%</strong>
                  <span>Activity</span>
                </div>
              </div>


              <div className="pie-legend">

                <div className="legend-item">
                  <span className="legend-dot inventory-view"></span>

                  <div>
                    <strong>Inventory Viewed</strong>
                    <span>45 activities</span>
                  </div>

                  <b>45%</b>
                </div>


                <div className="legend-item">
                  <span className="legend-dot inventory-search"></span>

                  <div>
                    <strong>Medicine Search</strong>
                    <span>35 activities</span>
                  </div>

                  <b>35%</b>
                </div>


                <div className="legend-item">
                  <span className="legend-dot inventory-stock"></span>

                  <div>
                    <strong>Stock Checked</strong>
                    <span>20 activities</span>
                  </div>

                  <b>20%</b>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          RECENT ACTIVITY
          ===================================================== */}

      <section className="staff-section">

        <div className="section-header">

          <div>
            <h2>Recent Activity</h2>

            <p>
              Your latest inventory activities
            </p>
          </div>

        </div>


        <div className="activity-list">


          {/* Activity 1 */}

          <div className="activity-item">

            <span className="activity-icon">
              🔎
            </span>

            <div className="activity-content">

              <strong>
                Searched Amoxicillin
              </strong>

              <p>
                Medicine search performed
              </p>

            </div>

            <span className="activity-time">
              Today, 09:42 AM
            </span>

          </div>


          {/* Activity 2 */}

          <div className="activity-item">

            <span className="activity-icon">
              👁️
            </span>

            <div className="activity-content">

              <strong>
                Viewed Paracetamol 500mg
              </strong>

              <p>
                Medicine details were viewed
              </p>

            </div>

            <span className="activity-time">
              Today, 10:15 AM
            </span>

          </div>


          {/* Activity 3 */}

          <div className="activity-item">

            <span className="activity-icon">
              📦
            </span>

            <div className="activity-content">

              <strong>
                Checked stock availability
              </strong>

              <p>
                Inventory stock information viewed
              </p>

            </div>

            <span className="activity-time">
              Today, 10:30 AM
            </span>

          </div>


          {/* Activity 4 */}

          <div className="activity-item">

            <span className="activity-icon">
              🔎
            </span>

            <div className="activity-content">

              <strong>
                Searched Azithromycin
              </strong>

              <p>
                Medicine search performed
              </p>

            </div>

            <span className="activity-time">
              Yesterday, 02:18 PM
            </span>

          </div>


        </div>

      </section>

    </div>
  );
};

export default StaffDashboard;