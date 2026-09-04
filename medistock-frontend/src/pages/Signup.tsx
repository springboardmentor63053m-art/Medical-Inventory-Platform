import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pill,
  User,
  BriefcaseBusiness,
  Truck,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";

const API_URL = "http://localhost:8081/api/auth";

type Role =
  | "USER"
  | "STAFF"
  | "PHARMACIST"
  | "SUPPLIER";

const roles = [
  {
    id: "USER" as Role,
    title: "User",
    description: "Order medicines & upload prescriptions",
    icon: User,
  },
  {
    id: "STAFF" as Role,
    title: "Staff",
    description: "Manage inventory and operations",
    icon: BriefcaseBusiness,
  },
  {
    id: "PHARMACIST" as Role,
    title: "Pharmacist",
    description: "Manage medicines & prescriptions",
    icon: Pill,
  },
  {
    id: "SUPPLIER" as Role,
    title: "Supplier",
    description: "Manage medicine supplies & orders",
    icon: Truck,
  },
];

export default function Signup() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] =
    useState<Role>("USER");

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleSignup = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
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

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

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
            role: `ROLE_${selectedRole}`,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Registration failed."
        );
      }

      setSuccess(
        data?.message ||
          `${selectedRole} account created successfully!`
      );

      setUsername("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");

      /*
       * After successful registration,
       * send the user to login.
       */
      setTimeout(() => {
        navigate(
          `/login?role=${selectedRole}`
        );
      }, 1500);

    } catch (err: any) {
      console.error(
        "SIGNUP ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to create account."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "#ffffff",
      }}
    >

      {/* ==========================================
          LEFT SIDE
      ========================================== */}

      <div
        style={{
          background:
            "linear-gradient(135deg, #2563eb, #1d4ed8)",
          color: "#ffffff",
          padding: "70px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >

        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "18px",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "25px",
          }}
        >
          <Pill
            size={34}
            color="#2563eb"
          />
        </div>

        <h1
          style={{
            fontSize: "54px",
            fontWeight: 800,
            margin: "0 0 15px",
          }}
        >
          MediStock
        </h1>

        <p
          style={{
            fontSize: "21px",
            opacity: 0.95,
            marginBottom: "45px",
          }}
        >
          Medical Inventory & Pharmacy
          Management Platform
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >

          <Feature
            icon="💊"
            title="Medicine Management"
            description="Manage medicines efficiently"
          />

          <Feature
            icon="📦"
            title="Inventory Control"
            description="Monitor stock and expiry"
          />

          <Feature
            icon="🛡️"
            title="Role-Based Security"
            description="Secure access for every role"
          />

        </div>
      </div>

      {/* ==========================================
          RIGHT SIDE
      ========================================== */}

      <div
        style={{
          padding: "40px 70px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflowY: "auto",
        }}
      >

        <div
          style={{
            width: "100%",
            maxWidth: "620px",
            margin: "0 auto",
          }}
        >

          <h2
            style={{
              fontSize: "32px",
              fontWeight: 750,
              margin: "0 0 8px",
            }}
          >
            Create your account
          </h2>

          <p
            style={{
              color: "#64748b",
              marginBottom: "25px",
            }}
          >
            Register for the MediStock platform.
          </p>

          {/* ROLE */}

          <label
            style={{
              display: "block",
              fontWeight: 650,
              marginBottom: "10px",
            }}
          >
            Select Account Type
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "12px",
              marginBottom: "22px",
            }}
          >

            {roles.map((role) => {
              const Icon = role.icon;

              const active =
                selectedRole === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() =>
                    setSelectedRole(
                      role.id
                    )
                  }
                  style={{
                    padding: "13px",
                    borderRadius: "11px",
                    border: active
                      ? "2px solid #2563eb"
                      : "1px solid #dbe3ef",
                    background: active
                      ? "#eff6ff"
                      : "#ffffff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: "10px",
                    }}
                  >

                    <Icon
                      size={22}
                      color={
                        active
                          ? "#2563eb"
                          : "#64748b"
                      }
                    />

                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "14px",
                        }}
                      >
                        {role.title}
                      </div>

                      <div
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          marginTop: "2px",
                        }}
                      >
                        {role.description}
                      </div>
                    </div>

                  </div>

                </button>
              );
            })}

          </div>

          {/* ERROR */}

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "13px",
                marginBottom: "18px",
                borderRadius: "10px",
                background: "#fff1f2",
                border:
                  "1px solid #fecdd3",
                color: "#dc2626",
                fontSize: "14px",
              }}
            >
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div
              style={{
                padding: "13px",
                marginBottom: "18px",
                borderRadius: "10px",
                background: "#ecfdf5",
                border:
                  "1px solid #bbf7d0",
                color: "#15803d",
                fontSize: "14px",
              }}
            >
              ✓ {success}
            </div>
          )}

          <form
            onSubmit={handleSignup}
          >

            {/* USERNAME */}

            <Input
              label="Username"
              value={username}
              onChange={setUsername}
              placeholder="Enter username"
            />

            {/* EMAIL */}

            <Input
              label="Email"
              value={email}
              onChange={setEmail}
              placeholder="Enter email address"
              type="email"
            />

            {/* PHONE */}

            <Input
              label="Phone"
              value={phone}
              onChange={(value) =>
                setPhone(
                  value
                    .replace(/\D/g, "")
                    .slice(0, 10)
                )
              }
              placeholder="Enter 10-digit phone number"
            />

            {/* PASSWORD */}

            <label
              style={{
                display: "block",
                fontWeight: 650,
                marginBottom: "8px",
              }}
            >
              Password
            </label>

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
                placeholder="Create password"
                style={{
                  width: "100%",
                  height: "50px",
                  padding:
                    "0 48px 0 14px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "14px",
                  boxSizing:
                    "border-box",
                  marginBottom: "18px",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                style={{
                  position:
                    "absolute",
                  right: "14px",
                  top: "14px",
                  border: "none",
                  background:
                    "transparent",
                  cursor: "pointer",
                }}
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>

            </div>

            {/* CONFIRM PASSWORD */}

            <label
              style={{
                display: "block",
                fontWeight: 650,
                marginBottom: "8px",
              }}
            >
              Confirm Password
            </label>

            <div
              style={{
                position: "relative",
              }}
            >

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={
                  confirmPassword
                }
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Confirm password"
                style={{
                  width: "100%",
                  height: "50px",
                  padding:
                    "0 48px 0 14px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "14px",
                  boxSizing:
                    "border-box",
                  marginBottom: "22px",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                style={{
                  position:
                    "absolute",
                  right: "14px",
                  top: "14px",
                  border: "none",
                  background:
                    "transparent",
                  cursor: "pointer",
                }}
              >
                {showConfirmPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "54px",
                border: "none",
                borderRadius: "11px",
                background:
                  loading
                    ? "#93c5fd"
                    : "#2563eb",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 700,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {loading
                ? "Creating account..."
                : `Create ${
                    selectedRole.charAt(0) +
                    selectedRole
                      .slice(1)
                      .toLowerCase()
                  } Account`}
            </button>

          </form>

          {/* LOGIN LINK */}

          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Already have an account?{" "}

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/login?role=${selectedRole}`
                )
              }
              style={{
                border: "none",
                background:
                  "transparent",
                color: "#2563eb",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Sign In
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

/* ==========================================
   INPUT COMPONENT
========================================== */

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <>
      <label
        style={{
          display: "block",
          fontWeight: 650,
          marginBottom: "8px",
        }}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        style={{
          width: "100%",
          height: "50px",
          padding: "0 14px",
          border:
            "1px solid #cbd5e1",
          borderRadius: "10px",
          fontSize: "14px",
          boxSizing: "border-box",
          marginBottom: "18px",
        }}
      />
    </>
  );
}

/* ==========================================
   FEATURE
========================================== */

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "18px",
        padding: "20px 25px",
        borderRadius: "16px",
        background:
          "rgba(255,255,255,0.10)",
        border:
          "1px solid rgba(255,255,255,0.20)",
      }}
    >
      <span
        style={{
          fontSize: "25px",
        }}
      >
        {icon}
      </span>

      <div>
        <div
          style={{
            fontSize: "17px",
            fontWeight: 700,
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: "4px",
            opacity: 0.85,
            fontSize: "14px",
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
}