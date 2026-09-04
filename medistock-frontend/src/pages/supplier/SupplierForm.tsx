import React, { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Truck,
  Phone,
  Mail,
  Save,
  Info,
  Loader2,
  Building2,
} from "lucide-react";
import { CrudService } from "@/api/crudService";

interface Supplier {
  id?: number;
  name?: string;
  contact?: string;
  contactNumber?: string;
  email?: string;
}

interface SupplierFormData {
  name: string;
  contact: string;
  email: string;
}

const supplierService = new CrudService<Supplier>("/suppliers");

const SupplierForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditMode = Boolean(id);

  const [form, setForm] = useState<SupplierFormData>({
    name: "",
    contact: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // LOAD SUPPLIER FOR EDIT
  // ============================================================

  useEffect(() => {
    if (isEditMode && id) {
      loadSupplier(Number(id));
    }
  }, [id, isEditMode]);

  const loadSupplier = async (supplierId: number) => {
    try {
      setFetching(true);
      setError("");

      /*
       * Use the existing CrudService instead of direct fetch.
       *
       * Your SuppliersList already works through the same API
       * configuration, so this keeps the edit page consistent.
       */

      const data = await supplierService.getById(supplierId);

      setForm({
        name: data?.name || "",
        contact:
          data?.contact ||
          data?.contactNumber ||
          "",
        email: data?.email || "",
      });
    } catch (err) {
      console.error("Unable to load supplier:", err);

      setError(
        "Unable to load supplier details. Please try again."
      );
    } finally {
      setFetching(false);
    }
  };

  // ============================================================
  // INPUT HANDLERS
  // ============================================================

  const handleNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((previous) => ({
      ...previous,
      name: event.target.value,
    }));

    setError("");
    setSuccess("");
  };

  const handleContactChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    setForm((previous) => ({
      ...previous,
      contact: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleEmailChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((previous) => ({
      ...previous,
      email: event.target.value,
    }));

    setError("");
    setSuccess("");
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = (): boolean => {
    const name = form.name.trim();
    const contact = form.contact.trim();
    const email = form.email.trim();

    if (!name) {
      setError("Supplier name is required.");
      return false;
    }

    if (name.length < 2) {
      setError(
        "Supplier name must contain at least 2 characters."
      );
      return false;
    }

    if (contact && contact.length !== 10) {
      setError(
        "Contact number must contain exactly 10 digits."
      );
      return false;
    }

    if (email) {
      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        setError(
          "Please enter a valid email address."
        );
        return false;
      }
    }

    return true;
  };

  // ============================================================
  // SAVE / UPDATE SUPPLIER
  // ============================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const payload: Supplier = {
        name: form.name.trim(),
        contact: form.contact.trim(),
        email: form.email.trim(),
      };

      if (isEditMode && id) {
        await supplierService.update(
          Number(id),
          payload
        );
      } else {
        await supplierService.create(payload);
      }

      setSuccess(
        isEditMode
          ? "Supplier updated successfully."
          : "Supplier added successfully."
      );

      setTimeout(() => {
        navigate("/admin/suppliers");
      }, 700);
    } catch (err) {
      console.error(
        "Unable to save supplier:",
        err
      );

      setError(
        isEditMode
          ? "Unable to update supplier. Please try again."
          : "Unable to add supplier. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CANCEL / BACK
  // ============================================================

  const handleCancel = () => {
    navigate("/admin/suppliers");
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <>
      <style>{`
        .supplier-form-page {
          min-height: calc(100vh - 90px);
          width: 100%;
          background: #f5f7fb;
          padding: 38px 42px 60px;
        }

        .supplier-form-container {
          width: 100%;
          max-width: 1050px;
          margin: 0 auto;
        }

        .supplier-back-button {
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #dbe3ee;
          border-radius: 11px;
          background: #ffffff;
          color: #334155;
          cursor: pointer;
          margin-bottom: 25px;
          transition: all 0.2s ease;
        }

        .supplier-back-button:hover {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #2563eb;
          transform: translateX(-2px);
        }

        .supplier-page-heading {
          margin-bottom: 28px;
        }

        .supplier-page-title {
          margin: 0;
          color: #172033;
          font-size: 34px;
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: -0.8px;
        }

        .supplier-page-subtitle {
          margin: 8px 0 0;
          color: #8290a5;
          font-size: 15px;
          line-height: 1.5;
        }

        .supplier-form-card {
          background: #ffffff;
          border: 1px solid #e3eaf3;
          border-radius: 18px;
          box-shadow:
            0 4px 12px rgba(15, 23, 42, 0.03),
            0 12px 35px rgba(15, 23, 42, 0.04);
          overflow: hidden;
        }

        .supplier-card-top {
          padding: 28px 32px 24px;
          border-bottom: 1px solid #edf1f6;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .supplier-card-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eff6ff;
          color: #2563eb;
          border-radius: 13px;
          flex-shrink: 0;
        }

        .supplier-card-title {
          margin: 0;
          color: #172033;
          font-size: 21px;
          font-weight: 800;
        }

        .supplier-card-description {
          margin: 5px 0 0;
          color: #94a3b8;
          font-size: 13px;
        }

        .supplier-form-content {
          padding: 32px;
        }

        .supplier-form-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 24px;
        }

        .supplier-form-group {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .supplier-form-group.full-width {
          grid-column: 1 / -1;
        }

        .supplier-label {
          margin-bottom: 9px;
          color: #334155;
          font-size: 13px;
          font-weight: 750;
        }

        .supplier-required {
          color: #ef4444;
          margin-left: 3px;
        }

        .supplier-input-wrapper {
          position: relative;
          width: 100%;
        }

        .supplier-input-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .supplier-input {
          width: 100%;
          height: 50px;
          padding: 0 15px 0 45px;
          border: 1px solid #d8e1ec;
          border-radius: 11px;
          background: #fbfdff;
          color: #172033;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .supplier-input::placeholder {
          color: #a6b2c2;
        }

        .supplier-input:hover {
          border-color: #b8c5d5;
          background: #ffffff;
        }

        .supplier-input:focus {
          border-color: #2563eb;
          background: #ffffff;
          box-shadow:
            0 0 0 3px
            rgba(37, 99, 235, 0.10);
        }

        .supplier-helper {
          margin-top: 7px;
          color: #94a3b8;
          font-size: 11px;
        }

        .supplier-alert {
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 16px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.5;
        }

        .supplier-alert-error {
          color: #b91c1c;
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .supplier-alert-success {
          color: #15803d;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
        }

        .supplier-info-box {
          margin-top: 28px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px 17px;
          border: 1px solid #dbeafe;
          border-radius: 11px;
          background: #f8fbff;
          color: #64748b;
          font-size: 12px;
          line-height: 1.55;
        }

        .supplier-info-icon {
          flex-shrink: 0;
          color: #2563eb;
        }

        .supplier-form-footer {
          margin-top: 30px;
          padding-top: 24px;
          border-top: 1px solid #edf1f6;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
        }

        .supplier-cancel-button {
          height: 46px;
          padding: 0 21px;
          border: 1px solid #d8e1ec;
          border-radius: 10px;
          background: #ffffff;
          color: #475569;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .supplier-cancel-button:hover {
          background: #f8fafc;
          border-color: #b9c5d5;
        }

        .supplier-save-button {
          height: 46px;
          min-width: 145px;
          padding: 0 22px;
          border: 1px solid #2563eb;
          border-radius: 10px;
          background: #2563eb;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow:
            0 5px 14px
            rgba(37, 99, 235, 0.18);
          transition: all 0.2s ease;
        }

        .supplier-save-button:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow:
            0 7px 18px
            rgba(37, 99, 235, 0.24);
        }

        .supplier-save-button:disabled,
        .supplier-cancel-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .supplier-loading-container {
          min-height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          color: #64748b;
        }

        .supplier-loading-spinner {
          animation:
            supplier-spin 1s linear infinite;
          color: #2563eb;
        }

        @keyframes supplier-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 800px) {
          .supplier-form-page {
            padding: 28px 20px 45px;
          }

          .supplier-form-grid {
            grid-template-columns: 1fr;
          }

          .supplier-form-group.full-width {
            grid-column: auto;
          }

          .supplier-page-title {
            font-size: 28px;
          }

          .supplier-card-top {
            padding: 23px;
          }

          .supplier-form-content {
            padding: 23px;
          }
        }

        @media (max-width: 550px) {
          .supplier-form-page {
            padding: 20px 14px 35px;
          }

          .supplier-page-title {
            font-size: 25px;
          }

          .supplier-card-title {
            font-size: 18px;
          }

          .supplier-form-footer {
            flex-direction: column-reverse;
            align-items: stretch;
          }

          .supplier-cancel-button,
          .supplier-save-button {
            width: 100%;
          }
        }
      `}</style>

      <div className="supplier-form-page">
        <div className="supplier-form-container">

          {/* BACK BUTTON */}
          <button
            type="button"
            className="supplier-back-button"
            onClick={handleCancel}
            title="Back to Suppliers"
          >
            <ArrowLeft size={22} />
          </button>

          {/* PAGE HEADER */}
          <div className="supplier-page-heading">
            <h1 className="supplier-page-title">
              {isEditMode
                ? "Edit Supplier"
                : "Add Supplier"}
            </h1>

            <p className="supplier-page-subtitle">
              {isEditMode
                ? "Update supplier information and contact details."
                : "Register a new medicine supplier in MediStock."}
            </p>
          </div>

          {/* CARD */}
          <div className="supplier-form-card">

            {/* CARD HEADER */}
            <div className="supplier-card-top">
              <div className="supplier-card-icon">
                <Building2 size={23} />
              </div>

              <div>
                <h2 className="supplier-card-title">
                  Supplier Details
                </h2>

                <p className="supplier-card-description">
                  Enter the supplier's basic contact information.
                </p>
              </div>
            </div>

            {/* FORM CONTENT */}
            <div className="supplier-form-content">

              {fetching ? (
                <div className="supplier-loading-container">
                  <Loader2
                    size={32}
                    className="supplier-loading-spinner"
                  />

                  <span>
                    Loading supplier details...
                  </span>
                </div>
              ) : (
                <>
                  {/* ERROR */}
                  {error && (
                    <div
                      className="
                        supplier-alert
                        supplier-alert-error
                      "
                    >
                      <Info size={18} />

                      <span>
                        {error}
                      </span>
                    </div>
                  )}

                  {/* SUCCESS */}
                  {success && (
                    <div
                      className="
                        supplier-alert
                        supplier-alert-success
                      "
                    >
                      <Save size={18} />

                      <span>
                        {success}
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>

                    <div className="supplier-form-grid">

                      {/* SUPPLIER NAME */}
                      <div className="supplier-form-group">

                        <label
                          htmlFor="supplier-name"
                          className="supplier-label"
                        >
                          Supplier Name
                          <span className="supplier-required">
                            *
                          </span>
                        </label>

                        <div className="supplier-input-wrapper">

                          <Truck
                            size={18}
                            className="supplier-input-icon"
                          />

                          <input
                            id="supplier-name"
                            type="text"
                            className="supplier-input"
                            value={form.name}
                            onChange={handleNameChange}
                            placeholder="Enter supplier name"
                            autoComplete="organization"
                            required
                          />

                        </div>
                      </div>

                      {/* CONTACT */}
                      <div className="supplier-form-group">

                        <label
                          htmlFor="supplier-contact"
                          className="supplier-label"
                        >
                          Contact Number
                        </label>

                        <div className="supplier-input-wrapper">

                          <Phone
                            size={18}
                            className="supplier-input-icon"
                          />

                          <input
                            id="supplier-contact"
                            type="tel"
                            className="supplier-input"
                            value={form.contact}
                            onChange={handleContactChange}
                            placeholder="Enter 10-digit number"
                            inputMode="numeric"
                            maxLength={10}
                            autoComplete="tel"
                          />

                        </div>

                        <span className="supplier-helper">
                          Enter a 10-digit contact number.
                        </span>
                      </div>

                      {/* EMAIL */}
                      <div
                        className="
                          supplier-form-group
                          full-width
                        "
                      >

                        <label
                          htmlFor="supplier-email"
                          className="supplier-label"
                        >
                          Email Address
                        </label>

                        <div className="supplier-input-wrapper">

                          <Mail
                            size={18}
                            className="supplier-input-icon"
                          />

                          <input
                            id="supplier-email"
                            type="email"
                            className="supplier-input"
                            value={form.email}
                            onChange={handleEmailChange}
                            placeholder="supplier@example.com"
                            autoComplete="email"
                          />

                        </div>
                      </div>

                    </div>

                    {/* INFORMATION */}
                    <div className="supplier-info-box">

                      <Info
                        size={18}
                        className="supplier-info-icon"
                      />

                      <span>
                        Make sure the supplier contact
                        information is accurate. This
                        information is used for medicine
                        procurement and supplier management.
                      </span>

                    </div>

                    {/* FOOTER */}
                    <div className="supplier-form-footer">

                      <button
                        type="button"
                        className="supplier-cancel-button"
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="supplier-save-button"
                        disabled={loading}
                      >

                        {loading ? (
                          <>
                            <Loader2
                              size={17}
                              className="
                                supplier-loading-spinner
                              "
                            />

                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={17} />

                            {isEditMode
                              ? "Save Changes"
                              : "Add Supplier"}
                          </>
                        )}

                      </button>

                    </div>

                  </form>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { SupplierForm };
export default SupplierForm;