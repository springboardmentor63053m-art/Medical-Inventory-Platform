import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  Eye,
  EyeOff,
  Pill,
  Shield,
  BriefcaseBusiness,
  User,
  Truck,
  Package,
} from "lucide-react";

const API_URL = "http://localhost:8081/api/auth";

type Role =
  | "ADMIN"
  | "STAFF"
  | "PHARMACIST"
  | "SUPPLIER"
  | "USER";

const roles = [
  {
    id: "ADMIN" as Role,
    name: "Administrator",
    icon: Shield,
  },
  {
    id: "STAFF" as Role,
    name: "Staff",
    icon: BriefcaseBusiness,
  },
  {
    id: "PHARMACIST" as Role,
    name: "Pharmacist",
    icon: Pill,
  },
  {
    id: "SUPPLIER" as Role,
    name: "Supplier",
    icon: Truck,
  },
  {
    id: "USER" as Role,
    name: "User",
    icon: User,
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [role, setRole] = useState<Role>("ADMIN");

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================================================
  // LOGIN
  // =========================================================

  const login = async (e: FormEvent) => {
    e.preventDefault();

    setError("");

    if (!username.trim()) {
      setError("Please enter username.");
      return;
    }

    if (!password) {
      setError("Please enter password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "LOGIN RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Invalid username or password."
        );
      }

      const backendRoles: string[] =
        Array.isArray(data.roles)
          ? data.roles.map((r: unknown) =>
              String(r).toUpperCase()
            )
          : [];

      const expectedRole =
        `ROLE_${role}`;

      // The selected login role must match the role
      // returned by the backend.
      if (
        backendRoles.length === 0 ||
        !backendRoles.includes(expectedRole)
      ) {
        setError(
          `This account does not have ${role} access.`
        );

        return;
      }

      // =====================================================
      // SAVE THE ACTUAL BACKEND USER IN AUTH CONTEXT
      // =====================================================

      const loggedInUser = {
        id: data.id,
        username: data.username || username.trim(),
        email: data.email || "",
        roles: backendRoles,
      };

      // This is important because App.tsx uses AuthProvider
      // and ProtectedRoute checks the authenticated role.
      authLogin(
        data.token,
        loggedInUser
      );

      // Also keep localStorage synchronized.
      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "isAuthenticated",
        "true"
      );

      localStorage.setItem(
        "username",
        loggedInUser.username
      );

      localStorage.setItem(
        "roles",
        JSON.stringify(backendRoles)
      );

      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      localStorage.setItem(
        "role",
        role
      );

      // =====================================================
      // ROLE BASED NAVIGATION
      // =====================================================

      const actualRole = backendRoles[0];

      switch (actualRole) {
        case "ROLE_ADMIN":
          navigate("/admin/dashboard", {
            replace: true,
          });
          break;

        case "ROLE_USER":
          navigate("/user/dashboard", {
            replace: true,
          });
          break;

        case "ROLE_PHARMACIST":
          navigate("/pharmacist/dashboard", {
            replace: true,
          });
          break;

        case "ROLE_SUPPLIER":
          navigate("/supplier/dashboard", {
            replace: true,
          });
          break;

        case "ROLE_STAFF":
          navigate("/staff/dashboard", {
            replace: true,
          });
          break;

        default:
          setError(
            `Unsupported account role: ${actualRole}`
          );
      }

    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        minHeight: "100vh",

        display: "flex",

        overflow: "hidden",

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
          width: "50%",
          height: "100vh",
          minHeight: 0,

          position: "relative",

          display: "flex",
          flexDirection: "column",

          justifyContent: "space-between",

          boxSizing: "border-box",

          padding:
            "42px 55px",

          color: "#ffffff",

          background:
            "linear-gradient(145deg, #2563eb 0%, #1d4ed8 55%, #1e40af 100%)",

          overflow: "hidden",
        }}
      >

        {/* ===================================================
            DECORATIVE CIRCLES
            =================================================== */}

        <div
          style={{
            position: "absolute",

            width: "430px",
            height: "430px",

            left: "-300px",
            top: "30px",

            borderRadius: "50%",

            border:
              "1px solid rgba(255,255,255,0.10)",

            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",

            width: "580px",
            height: "580px",

            right: "-360px",
            bottom: "-330px",

            borderRadius: "50%",

            background:
              "rgba(255,255,255,0.055)",

            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",

            width: "260px",
            height: "260px",

            left: "-160px",
            bottom: "-110px",

            borderRadius: "50%",

            border:
              "1px solid rgba(255,255,255,0.07)",

            pointerEvents: "none",
          }}
        />

        {/* ===================================================
            LEFT CONTENT
            =================================================== */}

        <div
          style={{
            position: "relative",
            zIndex: 2,

            width: "100%",

            maxWidth: "580px",

            display: "flex",
            flexDirection: "column",

            flex: 1,
          }}
        >

          {/* =================================================
              BRAND
              ================================================= */}

          <div
            style={{
              display: "flex",

              alignItems: "center",

              gap: "15px",

              marginBottom: "38px",
            }}
          >

            <div
              style={{
                width: "56px",
                height: "56px",

                minWidth: "56px",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                borderRadius: "14px",

                background:
                  "rgba(255,255,255,0.98)",

                boxShadow:
                  "0 10px 30px rgba(15,23,42,0.16)",
              }}
            >
              <Pill
                size={31}
                color="#2563eb"
                strokeWidth={2.5}
              />
            </div>

            <div>
              <h1
                style={{
                  margin: 0,

                  fontSize: "34px",

                  lineHeight: "1",

                  fontWeight: 800,

                  letterSpacing:
                    "-1px",

                  color: "#ffffff",
                }}
              >
                MediStock
              </h1>

              <p
                style={{
                  margin:
                    "7px 0 0",

                  fontSize: "14px",

                  lineHeight: "1.4",

                  color:
                    "rgba(255,255,255,0.78)",
                }}
              >
                Medical Inventory &amp;
                Pharmacy Management
                Platform
              </p>
            </div>

          </div>


          {/* =================================================
              FEATURE CARDS
              ================================================= */}

          <div
            style={{
              display: "flex",

              flexDirection: "column",

              gap: "14px",

              width: "100%",
            }}
          >

            {/* MEDICINE MANAGEMENT */}

            <div
              style={{
                width: "100%",

                minHeight: "82px",

                display: "flex",

                alignItems: "center",

                gap: "16px",

                padding:
                  "16px 20px",

                boxSizing:
                  "border-box",

                border:
                  "1px solid rgba(255,255,255,0.22)",

                borderRadius: "14px",

                background:
                  "rgba(255,255,255,0.10)",

                backdropFilter:
                  "blur(10px)",

                WebkitBackdropFilter:
                  "blur(10px)",

                boxShadow:
                  "0 8px 25px rgba(15,23,42,0.08)",
              }}
            >

              <div
                style={{
                  width: "46px",
                  height: "46px",

                  minWidth: "46px",

                  display: "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

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

                    color: "#ffffff",
                  }}
                >
                  Medicine Management
                </h3>

                <p
                  style={{
                    margin:
                      "5px 0 0",

                    fontSize: "13px",

                    color:
                      "rgba(255,255,255,0.72)",
                  }}
                >
                  Track medicines and
                  stock
                </p>
              </div>

            </div>


            {/* INVENTORY CONTROL */}

            <div
              style={{
                width: "100%",

                minHeight: "82px",

                display: "flex",

                alignItems: "center",

                gap: "16px",

                padding:
                  "16px 20px",

                boxSizing:
                  "border-box",

                border:
                  "1px solid rgba(255,255,255,0.22)",

                borderRadius: "14px",

                background:
                  "rgba(255,255,255,0.10)",

                backdropFilter:
                  "blur(10px)",

                WebkitBackdropFilter:
                  "blur(10px)",

                boxShadow:
                  "0 8px 25px rgba(15,23,42,0.08)",
              }}
            >

              <div
                style={{
                  width: "46px",
                  height: "46px",

                  minWidth: "46px",

                  display: "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

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

                    color: "#ffffff",
                  }}
                >
                  Inventory Control
                </h3>

                <p
                  style={{
                    margin:
                      "5px 0 0",

                    fontSize: "13px",

                    color:
                      "rgba(255,255,255,0.72)",
                  }}
                >
                  Monitor stock and
                  expiry
                </p>
              </div>

            </div>


            {/* ROLE BASED SECURITY */}

            <div
              style={{
                width: "100%",

                minHeight: "82px",

                display: "flex",

                alignItems: "center",

                gap: "16px",

                padding:
                  "16px 20px",

                boxSizing:
                  "border-box",

                border:
                  "1px solid rgba(255,255,255,0.22)",

                borderRadius: "14px",

                background:
                  "rgba(255,255,255,0.10)",

                backdropFilter:
                  "blur(10px)",

                WebkitBackdropFilter:
                  "blur(10px)",

                boxShadow:
                  "0 8px 25px rgba(15,23,42,0.08)",
              }}
            >

              <div
                style={{
                  width: "46px",
                  height: "46px",

                  minWidth: "46px",

                  display: "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

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

                    color: "#ffffff",
                  }}
                >
                  Role-Based Security
                </h3>

                <p
                  style={{
                    margin:
                      "5px 0 0",

                    fontSize: "13px",

                    color:
                      "rgba(255,255,255,0.72)",
                  }}
                >
                  Secure access for
                  every role
                </p>
              </div>

            </div>

          </div>


          {/* =================================================
              LEFT BOTTOM INFO
              ================================================= */}

          <div
            style={{
              marginTop: "auto",

              paddingTop: "24px",

              fontSize: "12px",

              color:
                "rgba(255,255,255,0.58)",
            }}
          >
            Secure Healthcare Operations

            <span
              style={{
                margin:
                  "0 8px",
              }}
            >
              •
            </span>

            MediStock Enterprise
          </div>

        </div>

      </section>


      {/* =====================================================
          RIGHT LOGIN PANEL
          ===================================================== */}

      <section
        style={{
          width: "50%",

          height: "100vh",

          minHeight: 0,

          background: "#ffffff",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          boxSizing: "border-box",

          padding:
            "35px 55px",

          overflowY: "auto",
        }}
      >

        <div
          style={{
            width: "100%",

            maxWidth: "560px",

            display: "flex",

            flexDirection: "column",

            justifyContent:
              "center",

            boxSizing: "border-box",

            padding:
              "10px 0",
          }}
        >

          {/* =================================================
              HEADER
              ================================================= */}

          <div
            style={{
              marginBottom: "22px",
            }}
          >
            <h2
              style={{
                margin: 0,

                fontSize: "34px",

                lineHeight: "1.15",

                fontWeight: 800,

                letterSpacing:
                  "-0.7px",

                color: "#172033",
              }}
            >
              Welcome back
            </h2>

            <p
              style={{
                margin:
                  "8px 0 0",

                fontSize: "16px",

                color: "#64748b",
              }}
            >
              Sign in to your
              MediStock account
            </p>
          </div>


          {/* =================================================
              ROLE TITLE
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
            Sign in as
          </label>


          {/* =================================================
              ROLE CARDS
              ================================================= */}

          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                "1fr 1fr",

              gap: "10px",
            }}
          >

            {roles.map((item) => {

              const Icon =
                item.icon;

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
                    minHeight: "58px",

                    padding:
                      "10px 13px",

                    display: "flex",

                    alignItems:
                      "center",

                    gap: "11px",

                    border:
                      selected
                        ? "2px solid #2563eb"
                        : "1px solid #dbe3ef",

                    borderRadius:
                      "11px",

                    background:
                      selected
                        ? "#eff6ff"
                        : "#ffffff",

                    cursor:
                      "pointer",

                    textAlign: "left",

                    boxSizing:
                      "border-box",

                    transition:
                      "all 0.15s ease",
                  }}
                >

                  <span
                    style={{
                      width: "36px",
                      height: "36px",

                      minWidth: "36px",

                      display: "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      borderRadius:
                        "9px",

                      background:
                        selected
                          ? "#dbeafe"
                          : "#f8fafc",
                    }}
                  >
                    <Icon
                      size={19}
                      color={
                        selected
                          ? "#2563eb"
                          : "#64748b"
                      }
                    />
                  </span>

                  <span
                    style={{
                      fontSize: "14px",

                      fontWeight: 650,

                      color: "#172033",
                    }}
                  >
                    {item.name}
                  </span>

                </button>
              );
            })}

          </div>


          {/* =================================================
              ERROR
              ================================================= */}

          {error && (
            <div
              style={{
                marginTop: "14px",

                padding:
                  "11px 13px",

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
              LOGIN FORM
              ================================================= */}

          <form
            onSubmit={login}

            style={{
              marginTop: "18px",
            }}
          >

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

              placeholder="Enter username"

              autoComplete="username"

              style={{
                width: "100%",

                height: "50px",

                padding:
                  "0 15px",

                boxSizing:
                  "border-box",

                border:
                  "1px solid #cbd5e1",

                borderRadius: "9px",

                background:
                  "#ffffff",

                color: "#172033",

                fontSize: "15px",

                outline: "none",
              }}
            />


            {/* PASSWORD HEADER */}

            <div
              style={{
                display: "flex",

                alignItems:
                  "center",

                justifyContent:
                  "space-between",

                marginTop: "16px",

                marginBottom: "7px",
              }}
            >

              <label
                style={{
                  fontSize: "14px",

                  fontWeight: 700,

                  color: "#172033",
                }}
              >
                Password
              </label>

              <button
                type="button"

                onClick={() =>
                  navigate(
                    "/forgot-password"
                  )
                }

                style={{
                  padding: 0,

                  border: "none",

                  background:
                    "transparent",

                  color: "#2563eb",

                  fontSize: "13px",

                  fontWeight: 600,

                  cursor: "pointer",
                }}
              >
                Forgot password?
              </button>

            </div>


            {/* PASSWORD INPUT */}

            <div
              style={{
                position: "relative",
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

                placeholder="Enter password"

                autoComplete="current-password"

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

                  background:
                    "#ffffff",

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
                LOGIN BUTTON
                ================================================= */}

            <button
              type="submit"

              disabled={loading}

              style={{
                width: "100%",

                height: "52px",

                marginTop: "18px",

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
                ? "Signing in..."
                : `Sign in as ${
                    role === "ADMIN"
                      ? "Administrator"
                      : role.charAt(0) +
                        role
                          .slice(1)
                          .toLowerCase()
                  }`}
            </button>

          </form>


          {/* =================================================
              SIGN UP
              ================================================= */}

          <div
            style={{
              marginTop: "18px",

              paddingTop: "17px",

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
              Don't have a
              MediStock account?
            </p>

            <button
              type="button"

              onClick={() =>
                navigate("/register")
              }

              style={{
                width: "100%",

                height: "46px",

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
              Create New Account
            </button>

          </div>


          {/* =================================================
              SECURITY NOTICE
              ================================================= */}

          <div
            style={{
              marginTop: "14px",

              padding:
                "11px 13px",

              display: "flex",

              alignItems:
                "center",

              gap: "10px",

              borderRadius: "9px",

              background: "#f8fafc",

              border:
                "1px solid #e2e8f0",

              boxSizing:
                "border-box",
            }}
          >

            <Shield
              size={18}
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
                Secure access
              </div>

              <div
                style={{
                  marginTop: "2px",

                  fontSize: "11px",

                  color: "#64748b",
                }}
              >
                Role-based authentication
                protects your account.
              </div>

            </div>

          </div>


          {/* =================================================
              FOOTER
              ================================================= */}

          <div
            style={{
              textAlign: "center",

              marginTop: "12px",

              fontSize: "11px",

              color: "#94a3b8",
            }}
          >
            MediStock Medical
            Inventory Platform
          </div>

        </div>

      </section>

    </div>
  );
}
