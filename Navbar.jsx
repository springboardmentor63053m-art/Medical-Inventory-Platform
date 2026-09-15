import "./Layout.css";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="logo">
        💊 MediStock
      </div>

      <ul className="nav-links">

        <li><a href="/">Home</a></li>

        <li><a href="#features">Features</a></li>

        <li><a href="#about">About</a></li>

        <li><a href="#contact">Contact</a></li>

      </ul>

      <div className="nav-buttons">

        <button className="login-btn">
          Login
        </button>

        <button className="register-btn">
          Register
        </button>

      </div>

    </nav>
  );
}

export default Navbar;