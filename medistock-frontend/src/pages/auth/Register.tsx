import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  Pill,
  User,
  Truck,
  BriefcaseBusiness,
  Shield,
  Package,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL || "/api") + "/auth";

type Role =
  | "USER"
  | "STAFF"
  | "PHARMACIST"
  | "SUPPLIER";

const accountTypes = [
  {
    id: "USER" as Role,
    name: "User",
    description: "Order medicines and manage prescriptions",
    icon: User,
  },
  {
    id: "STAFF" as Role,
    name: "Staff",
    description: "Manage inventory and pharmacy operations",
    icon: BriefcaseBusiness,
  },
  {
    id: "PHARMACIST" as Role,
    name: "Pharmacist",
    description: "Manage medicines and prescriptions",
    icon: Pill,
  },
  {
    id: "SUPPLIER" as Role,
    name: "Supplier",
    description: "Manage medicine supply and orders",
    icon: Truck,
  },
];

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("USER");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =========================================================
  // REGISTER
  // =========================================================

  const register = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      setError(
        "Phone number must contain exactly 10 digits."
      );
      return;
    }

    try {
      setLoading(true);

      // -------------------------------------------------------
      // SEND REGISTRATION REQUEST
      // -------------------------------------------------------

      const response = await fetch(
        `${API_URL}/register`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept: "application/json",
          },

          body: JSON.stringify({
            username: username.trim(),

            email: email.trim(),

            password: password,

            phone: phone.trim(),

            role: `ROLE_${role}`,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "REGISTER RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Registration failed."
        );
      }

      // -------------------------------------------------------
      // SUCCESS
      // -------------------------------------------------------

      setSuccess(
        data?.message ||
          `${getRoleName(role)} account created successfully!`
      );

      // Clear fields

      setUsername("");
      setEmail("");
      setPhone("");
      setPassword("");

      // -------------------------------------------------------
      // REDIRECT TO LOGIN
      // -------------------------------------------------------

      setTimeout(() => {
        navigate("/login");
      }, 1800);

    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ROLE NAME
  // =========================================================

  const getRoleName = (selectedRole: Role) => {
    switch (selectedRole) {
      case "STAFF":
        return "Staff";

      case "PHARMACIST":
        return "Pharmacist";

      case "SUPPLIER":
        return "Supplier";

      default:
        return "User";
    }
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        background: "#f8fafc",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >

      {/* =====================================================
          LEFT BRANDING PANEL
          ===================================================== */}

      <section
        style={{
          width: "44%",
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          padding: "50px",
          color: "#ffffff",
          background:
            "linear-gradient(145deg, #2563eb 0%, #1d4ed8 55%, #1e40af 100%)",
        }}
      >

        {/* Decorative circles */}

        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            left: "-320px",
            top: "80px",
            borderRadius: "50%",
            border:
              "1px solid rgba(255,255,255,0.12)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            right: "-400px",
            bottom: "-350px",
            borderRadius: "50%",
            background:
              "rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        />

        {/* =================================================
            BRAND
            ================================================= */}

        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "45px",
          }}
        >

          <div
            style={{
              width: "58px",
              height: "58px",
              minWidth: "58px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "15px",
              background:
                "rgba(255,255,255,0.98)",
              boxShadow:
                "0 10px 30px rgba(15,23,42,0.18)",
            }}
          >
            <Pill
              size={32}
              color="#2563eb"
              strokeWidth={2.5}
            />
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "36px",
                lineHeight: "1",
                fontWeight: 800,
                letterSpacing: "-1px",
              }}
            >
              MediStock
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                fontSize: "14px",
                color:
                  "rgba(255,255,255,0.78)",
              }}
            >
              Medical Inventory & Pharmacy
              <br />
              Management Platform
            </p>
          </div>

        </div>


        {/* =================================================
            LEFT HEADING
            ================================================= */}

        <div
          style={{
            position: "relative",
            zIndex: 2,
            marginBottom: "28px",
          }}
        >

          <h2
            style={{
              margin: 0,
              fontSize: "30px",
              lineHeight: "1.2",
              fontWeight: 800,
            }}
          >
            Join MediStock
          </h2>

          <p
            style={{
              margin: "10px 0 0",
              fontSize: "15px",
              lineHeight: "1.6",
              color:
                "rgba(255,255,255,0.78)",
            }}
          >
            Create a secure account and
            access the right tools for your
            healthcare role.
          </p>

        </div>


        {/* =================================================
            FEATURE CARDS
            ================================================= */}

        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >

          {/* Medicine */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              padding: "17px 18px",
              border:
                "1px solid rgba(255,255,255,0.22)",
              borderRadius: "14px",
              background:
                "rgba(255,255,255,0.10)",
              backdropFilter: "blur(10px)",
            }}
          >

            <div
              style={{
                width: "46px",
                height: "46px",
                minWidth: "46px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "11px",
                background:
                  "rgba(255,255,255,0.14)",
              }}
            >
              <Pill
                size={23}
                color="#ffffff"
              />
            </div>

            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                Medicine Management
              </h3>

              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: "13px",
                  color:
                    "rgba(255,255,255,0.72)",
                }}
              >
                Track medicines and stock
              </p>
            </div>

          </div>


          {/* Inventory */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              padding: "17px 18px",
              border:
                "1px solid rgba(255,255,255,0.22)",
              borderRadius: "14px",
              background:
                "rgba(255,255,255,0.10)",
              backdropFilter: "blur(10px)",
            }}
          >

            <div
              style={{
                width: "46px",
                height: "46px",
                minWidth: "46px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "11px",
                background:
                  "rgba(255,255,255,0.14)",
              }}
            >
              <Package
                size={23}
                color="#ffffff"
              />
            </div>

            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                Inventory Control
              </h3>

              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: "13px",
                  color:
                    "rgba(255,255,255,0.72)",
                }}
              >
                Monitor stock and expiry
              </p>
            </div>

          </div>


          {/* Security */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              padding: "17px 18px",
              border:
                "1px solid rgba(255,255,255,0.22)",
              borderRadius: "14px",
              background:
                "rgba(255,255,255,0.10)",
              backdropFilter: "blur(10px)",
            }}
          >

            <div
              style={{
                width: "46px",
                height: "46px",
                minWidth: "46px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "11px",
                background:
                  "rgba(255,255,255,0.14)",
              }}
            >
              <Shield
                size={23}
                color="#ffffff"
              />
            </div>

            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                Role-Based Security
              </h3>

              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: "13px",
                  color:
                    "rgba(255,255,255,0.72)",
                }}
              >
                Secure access for every role
              </p>
            </div>

          </div>

        </div>


        {/* =================================================
            FOOTER
            ================================================= */}

        <div
          style={{
            position: "relative",
            zIndex: 2,
            marginTop: "auto",
            paddingTop: "35px",
            fontSize: "12px",
            color:
              "rgba(255,255,255,0.58)",
          }}
        >
          Secure Healthcare Operations
          <span style={{ margin: "0 8px" }}>
            •
          </span>
          MediStock Enterprise
        </div>

      </section>


      {/* =====================================================
          RIGHT REGISTER PANEL
          ===================================================== */}

      <section
        style={{
          width: "56%",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#ffffff",
          padding: "35px 55px",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >

        <div
          style={{
            width: "100%",
            maxWidth: "650px",
          }}
        >

          {/* =================================================
              HEADER
              ================================================= */}

          <div
            style={{
              marginBottom: "24px",
            }}
          >

            <h2
              style={{
                margin: 0,
                fontSize: "32px",
                lineHeight: "1.2",
                fontWeight: 800,
                color: "#172033",
              }}
            >
              Create your account
            </h2>

            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                color: "#64748b",
              }}
            >
              Join MediStock and access
              healthcare management tools.
            </p>

          </div>


          {/* =================================================
              ACCOUNT TYPE
              ================================================= */}

          <label
            style={{
              display: "block",
              marginBottom: "10px",
              fontSize: "15px",
              fontWeight: 700,
              color: "#172033",
            }}
          >
            Account type
          </label>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "10px",
              marginBottom: "20px",
            }}
          >

            {accountTypes.map((item) => {

              const Icon = item.icon;

              const selected =
                role === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setRole(item.id)
                  }
                  style={{
                    minHeight: "76px",
                    padding:
                      "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    border:
                      selected
                        ? "2px solid #2563eb"
                        : "1px solid #dbe3ef",
                    borderRadius: "11px",
                    background:
                      selected
                        ? "#eff6ff"
                        : "#ffffff",
                    cursor: "pointer",
                    textAlign: "left",
                    boxSizing: "border-box",
                  }}
                >

                  <span
                    style={{
                      width: "40px",
                      height: "40px",
                      minWidth: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "9px",
                      background:
                        selected
                          ? "#dbeafe"
                          : "#f8fafc",
                    }}
                  >
                    <Icon
                      size={20}
                      color={
                        selected
                          ? "#2563eb"
                          : "#64748b"
                      }
                    />
                  </span>

                  <span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#172033",
                      }}
                    >
                      {item.name}
                    </span>

                    <span
                      style={{
                        display: "block",
                        marginTop: "3px",
                        fontSize: "11px",
                        lineHeight: "1.3",
                        color: "#64748b",
                      }}
                    >
                      {item.description}
                    </span>
                  </span>

                </button>
              );
            })}

          </div>


          {/* =================================================
              SUCCESS MESSAGE
              ================================================= */}

          {success && (
            <div
              style={{
                marginBottom: "15px",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: "9px",
                borderRadius: "9px",
                background: "#f0fdf4",
                border:
                  "1px solid #bbf7d0",
                color: "#15803d",
                fontSize: "13px",
              }}
            >
              <CheckCircle
                size={18}
              />

              <span>
                {success}
              </span>
            </div>
          )}


          {/* =================================================
              ERROR MESSAGE
              ================================================= */}

          {error && (
            <div
              style={{
                marginBottom: "15px",
                padding: "12px 14px",
                borderRadius: "9px",
                background: "#fff1f2",
                border:
                  "1px solid #fecdd3",
                color: "#dc2626",
                fontSize: "13px",
              }}
            >
              ⚠️ {error}
            </div>
          )}


          {/* =================================================
              FORM
              ================================================= */}

          <form onSubmit={register}>

            {/* USERNAME */}

            <label
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "14px",
                fontWeight: 700,
                color: "#172033",
              }}
            >
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              placeholder="Choose a username"
              autoComplete="username"
              style={{
                width: "100%",
                height: "50px",
                padding: "0 15px",
                boxSizing: "border-box",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "9px",
                background: "#ffffff",
                color: "#172033",
                fontSize: "15px",
                outline: "none",
                marginBottom: "15px",
              }}
            />


            {/* EMAIL */}

            <label
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "14px",
                fontWeight: 700,
                color: "#172033",
              }}
            >
              Email address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="example@medistock.com"
              autoComplete="email"
              style={{
                width: "100%",
                height: "50px",
                padding: "0 15px",
                boxSizing: "border-box",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "9px",
                background: "#ffffff",
                color: "#172033",
                fontSize: "15px",
                outline: "none",
                marginBottom: "15px",
              }}
            />


            {/* PHONE */}

            <label
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "14px",
                fontWeight: 700,
                color: "#172033",
              }}
            >
              Phone number
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                const value =
                  e.target.value.replace(
                    /\D/g,
                    ""
                  );

                if (value.length <= 10) {
                  setPhone(value);
                }
              }}
              placeholder="9876543210"
              autoComplete="tel"
              maxLength={10}
              style={{
                width: "100%",
                height: "50px",
                padding: "0 15px",
                boxSizing: "border-box",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "9px",
                background: "#ffffff",
                color: "#172033",
                fontSize: "15px",
                outline: "none",
                marginBottom: "15px",
              }}
            />


            {/* PASSWORD */}

            <label
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "14px",
                fontWeight: 700,
                color: "#172033",
              }}
            >
              Password
            </label>

            <div
              style={{
                position: "relative",
                marginBottom: "18px",
              }}
            >

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Create a password"
                autoComplete="new-password"
                style={{
                  width: "100%",
                  height: "50px",
                  padding:
                    "0 50px 0 15px",
                  boxSizing:
                    "border-box",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "9px",
                  background: "#ffffff",
                  color: "#172033",
                  fontSize: "15px",
                  outline: "none",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                style={{
                  position:
                    "absolute",
                  right: "14px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  padding: 0,
                  border: "none",
                  background:
                    "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                {showPassword ? (
                  <EyeOff
                    size={20}
                    color="#64748b"
                  />
                ) : (
                  <Eye
                    size={20}
                    color="#64748b"
                  />
                )}
              </button>

            </div>


            {/* =================================================
                CREATE ACCOUNT BUTTON
                ================================================= */}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "52px",
                border: "none",
                borderRadius: "9px",
                background:
                  loading
                    ? "#93c5fd"
                    : "#2563eb",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 700,
                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer",
                boxShadow:
                  loading
                    ? "none"
                    : "0 7px 18px rgba(37,99,235,0.20)",
              }}
            >
              {loading
                ? "Creating account..."
                : `Create ${getRoleName(role)} Account`}
            </button>

          </form>


          {/* =================================================
              LOGIN LINK
              ================================================= */}

          <div
            style={{
              marginTop: "20px",
              paddingTop: "18px",
              borderTop:
                "1px solid #e5e7eb",
              textAlign: "center",
            }}
          >

            <p
              style={{
                margin:
                  "0 0 10px",
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              Already have a
              MediStock account?
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
              style={{
                width: "100%",
                height: "46px",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                gap: "8px",
                border:
                  "1px solid #2563eb",
                borderRadius: "9px",
                background:
                  "#ffffff",
                color: "#2563eb",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <ArrowLeft
                size={17}
              />

              Back to Sign In
            </button>

          </div>


          {/* =================================================
              SECURITY NOTICE
              ================================================= */}

          <div
            style={{
              marginTop: "15px",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              borderRadius: "9px",
              background: "#f8fafc",
              border:
                "1px solid #e2e8f0",
            }}
          >

            <Shield
              size={19}
              color="#2563eb"
            />

            <div>

              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                Secure registration
              </div>

              <div
                style={{
                  marginTop: "2px",
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                Your account is protected
                with role-based access.
              </div>

            </div>

          </div>


          {/* =================================================
              ADMIN NOTICE
              ================================================= */}

          <div
            style={{
              marginTop: "12px",
              textAlign: "center",
              fontSize: "11px",
              color: "#94a3b8",
            }}
          >
            🔒 Admin accounts cannot be
            created through public registration.
          </div>

        </div>

      </section>

    </div>
  );
}