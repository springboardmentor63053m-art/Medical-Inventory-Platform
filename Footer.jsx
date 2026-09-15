import "./Layout.css";

function Footer() {
  return (

    <footer className="footer">

      <div className="footer-container">

        <div className="footer-box">

          <h2>💊 MediStock</h2>

          <p>
            Medical Inventory Management Platform for
            pharmacies, hospitals and healthcare organizations.
          </p>

        </div>

        <div className="footer-box">

          <h3>Quick Links</h3>

          <ul>

            <li><a href="/">Home</a></li>

            <li><a href="#features">Features</a></li>

            <li><a href="#about">About</a></li>

            <li><a href="#contact">Contact</a></li>

          </ul>

        </div>

        <div className="footer-box">

          <h3>Our Services</h3>

          <ul>

            <li>Medicine Management</li>

            <li>Inventory Tracking</li>

            <li>Supplier Management</li>

            <li>Expiry Monitoring</li>

            <li>Reports & Analytics</li>

          </ul>

        </div>

        <div className="footer-box">

          <h3>Contact</h3>

          <p>Email : support@medistock.com</p>

          <p>Phone : +91 9876543210</p>

          <p>Pune, Maharashtra</p>

        </div>

      </div>

      <hr />

      <div className="copyright">

        © 2026 MediStock | All Rights Reserved

      </div>

    </footer>

  );
}

export default Footer;