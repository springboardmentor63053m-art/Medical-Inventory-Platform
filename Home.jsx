import "./App.css";

function Home() {
  return (
    <div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">

          <h1>MediStock</h1>

          <h3>Medical Inventory Management Platform</h3>

          <p>
            Manage medicine inventory, monitor expiry dates,
            track suppliers and generate reports from one secure platform.
          </p>

          <div className="buttons">
            <button className="primary-btn">Get Started</button>

            <button className="secondary-btn">Login</button>
          </div>

        </div>
      </section>

      {/* Features */}

      <section className="features">

        <h2>Our Features</h2>

        <div className="feature-container">

          <div className="card">
            <h3>Medicine Management</h3>
            <p>Add, Update and Delete Medicines.</p>
          </div>

          <div className="card">
            <h3>Inventory Tracking</h3>
            <p>Real-Time Stock Monitoring.</p>
          </div>

          <div className="card">
            <h3>Expiry Tracking</h3>
            <p>Track Near Expiry Medicines.</p>
          </div>

          <div className="card">
            <h3>Supplier Management</h3>
            <p>Manage Supplier Information.</p>
          </div>

          <div className="card">
            <h3>Reports</h3>
            <p>Download PDF & Excel Reports.</p>
          </div>

          <div className="card">
            <h3>Secure Login</h3>
            <p>JWT Authentication & Role Based Access.</p>
          </div>

        </div>

      </section>

      {/* Why Choose */}

      <section className="why">

        <h2>Why Choose MediStock?</h2>

        <div className="why-box">

          <div>✔ Real-Time Inventory</div>

          <div>✔ Low Stock Alerts</div>

          <div>✔ Expiry Notifications</div>

          <div>✔ Fast Medicine Search</div>

          <div>✔ Dashboard Analytics</div>

          <div>✔ Secure Authentication</div>

        </div>

      </section>

      {/* Working */}

      <section className="working">

        <h2>How It Works</h2>

        <div className="steps">

          <div>Login</div>

          <span>➜</span>

          <div>Add Medicines</div>

          <span>➜</span>

          <div>Manage Stock</div>

          <span>➜</span>

          <div>Track Expiry</div>

          <span>➜</span>

          <div>Generate Reports</div>

        </div>

      </section>

      {/* Statistics */}

      <section className="stats">

        <div className="stat">
          <h2>10,000+</h2>
          <p>Medicines</p>
        </div>

        <div className="stat">
          <h2>500+</h2>
          <p>Suppliers</p>
        </div>

        <div className="stat">
          <h2>99%</h2>
          <p>Inventory Accuracy</p>
        </div>

        <div className="stat">
          <h2>24/7</h2>
          <p>Availability</p>
        </div>

      </section>

      {/* Call To Action */}

      <section className="cta">

        <h2>Ready to Manage Your Medical Inventory?</h2>

        <button className="primary-btn">
          Get Started
        </button>

      </section>

    </div>
  );
}

export default Home;