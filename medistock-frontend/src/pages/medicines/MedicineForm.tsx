import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { CrudService } from "@/api/crudService";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  Pill,
  DollarSign,
  Building2,
  FileText,
  Save,
  PlusCircle,
  AlertCircle,
} from "lucide-react";

const medicineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  supplier: z.object({ id: z.coerce.number() }).optional().nullable(),
});

type MedicineFormValues = z.infer<typeof medicineSchema>;

export const MedicineForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const isEditMode = Boolean(id);

  const medicineService = new CrudService<any>("/medicines");
  const supplierService = new CrudService<any>("/suppliers");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Load suppliers for the dropdown
        const supplierData = await supplierService.getAll();
        setSuppliers(Array.isArray(supplierData) ? supplierData : []);

        if (isEditMode && id) {
          const data = await medicineService.getById(id);
          reset({
            name: data.name || "",
            description: data.description || "",
            price: data.price || 0,
            supplier: data.supplier ? { id: data.supplier.id } : null,
          });
        }
      } catch (error) {
        toast.error("Failed to load data");
        if (isEditMode) navigate("/admin/medicines");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, isEditMode, navigate, reset]);

  const onSubmit = async (data: MedicineFormValues) => {
    try {
      setIsSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        navigate("/login");
        return;
      }

      const payload = {
        name: data.name.trim(),
        description: data.description?.trim() || "",
        price: Number(data.price),
        supplier: data.supplier?.id
          ? { id: Number(data.supplier.id) }
          : null,
      };

      const apiBase = import.meta.env.VITE_API_URL || "/api";
      const url = isEditMode && id
        ? `${apiBase}/medicines/${id}`
        : `${apiBase}/medicines`;

      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        toast.error("Your session has expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }

      if (response.status === 403) {
        toast.error("You do not have permission to manage medicines.");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Medicine API Error:", response.status, errorText);
        throw new Error(`Failed to ${isEditMode ? "update" : "create"} medicine`);
      }

      toast.success(
        isEditMode
          ? "Medicine updated successfully"
          : "Medicine created successfully"
      );

      navigate("/admin/medicines");
    } catch (error) {
      console.error("Medicine save error:", error);
      toast.error(`Failed to ${isEditMode ? "update" : "create"} medicine`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/medicines");
  };

  return (
    <>
      <style>{`
        .med-form-page {
          min-height: calc(100vh - 90px);
          width: 100%;
          background: #f5f7fb;
          padding: 38px 42px 60px;
          box-sizing: border-box;
        }

        .med-form-container {
          width: 100%;
          max-width: 950px;
          margin: 0 auto;
        }

        .med-back-button {
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

        .med-back-button:hover {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #2563eb;
          transform: translateX(-2px);
        }

        .med-page-heading {
          margin-bottom: 28px;
        }

        .med-page-title {
          margin: 0;
          color: #172033;
          font-size: 34px;
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: -0.8px;
        }

        .med-page-subtitle {
          margin: 8px 0 0;
          color: #8290a5;
          font-size: 15px;
          line-height: 1.5;
        }

        .med-form-card {
          background: #ffffff;
          border: 1px solid #e3eaf3;
          border-radius: 18px;
          box-shadow:
            0 4px 12px rgba(15, 23, 42, 0.03),
            0 12px 35px rgba(15, 23, 42, 0.04);
          overflow: hidden;
        }

        .med-card-top {
          padding: 28px 32px 24px;
          border-bottom: 1px solid #edf1f6;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .med-card-icon {
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

        .med-card-title {
          margin: 0;
          color: #172033;
          font-size: 21px;
          font-weight: 800;
        }

        .med-card-description {
          margin: 5px 0 0;
          color: #94a3b8;
          font-size: 13px;
        }

        .med-form-content {
          padding: 32px;
        }

        .med-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
        }

        .med-form-group {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .med-form-group.full-width {
          grid-column: 1 / -1;
        }

        .med-label {
          margin-bottom: 9px;
          color: #334155;
          font-size: 13px;
          font-weight: 750;
        }

        .med-required {
          color: #ef4444;
          margin-left: 3px;
        }

        .med-input-wrapper {
          position: relative;
          width: 100%;
        }

        .med-input-icon {
          position: absolute;
          left: 15px;
          top: 16px;
          color: #94a3b8;
          pointer-events: none;
        }

        .med-input-icon.centered {
          top: 50%;
          transform: translateY(-50%);
        }

        .med-input {
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
          box-sizing: border-box;
        }

        .med-textarea {
          width: 100%;
          min-height: 100px;
          padding: 14px 15px 14px 45px;
          border: 1px solid #d8e1ec;
          border-radius: 11px;
          background: #fbfdff;
          color: #172033;
          font-size: 14px;
          outline: none;
          resize: vertical;
          transition: all 0.2s ease;
          box-sizing: border-box;
          font-family: inherit;
        }

        .med-select {
          width: 100%;
          height: 50px;
          padding: 0 15px 0 45px;
          border: 1px solid #d8e1ec;
          border-radius: 11px;
          background: #fbfdff;
          color: #172033;
          font-size: 14px;
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2094a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 15px center;
          background-size: 16px;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .med-input::placeholder,
        .med-textarea::placeholder {
          color: #a6b2c2;
        }

        .med-input:hover,
        .med-textarea:hover,
        .med-select:hover {
          border-color: #b8c5d5;
          background-color: #ffffff;
        }

        .med-input:focus,
        .med-textarea:focus,
        .med-select:focus {
          border-color: #2563eb;
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
        }

        .med-input.error,
        .med-textarea.error,
        .med-select.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.10);
        }

        .med-error-msg {
          margin-top: 6px;
          color: #ef4444;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .med-form-footer {
          margin-top: 30px;
          padding-top: 24px;
          border-top: 1px solid #edf1f6;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
        }

        .med-cancel-button {
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

        .med-cancel-button:hover {
          background: #f8fafc;
          border-color: #b9c5d5;
        }

        .med-save-button {
          height: 46px;
          min-width: 155px;
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
          box-shadow: 0 5px 14px rgba(37, 99, 235, 0.18);
          transition: all 0.2s ease;
        }

        .med-save-button:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 7px 18px rgba(37, 99, 235, 0.24);
        }

        .med-save-button:disabled,
        .med-cancel-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .med-loading-container {
          min-height: 380px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          color: #64748b;
        }

        .med-loading-spinner {
          animation: med-spin 1s linear infinite;
          color: #2563eb;
        }

        @keyframes med-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .med-form-page {
            padding: 28px 20px 45px;
          }
          .med-form-grid {
            grid-template-columns: 1fr;
          }
          .med-form-group.full-width {
            grid-column: auto;
          }
          .med-page-title {
            font-size: 28px;
          }
          .med-card-top, .med-form-content {
            padding: 23px;
          }
        }

        @media (max-width: 550px) {
          .med-form-page {
            padding: 20px 14px 35px;
          }
          .med-page-title {
            font-size: 25px;
          }
          .med-form-footer {
            flex-direction: column-reverse;
            align-items: stretch;
          }
          .med-cancel-button, .med-save-button {
            width: 100%;
          }
        }
      `}</style>

      <div className="med-form-page">
        <div className="med-form-container">
          {/* BACK BUTTON */}
          <button
            type="button"
            className="med-back-button"
            onClick={handleCancel}
            title="Back to Medicines"
          >
            <ArrowLeft size={22} />
          </button>

          {/* PAGE HEADER */}
          <div className="med-page-heading">
            <h1 className="med-page-title">
              {isEditMode ? "Edit Medicine" : "Add Medicine"}
            </h1>
            <p className="med-page-subtitle">
              {isEditMode
                ? "Update medicine details, pricing, and supplier information."
                : "Register a new medicine item in MediStock inventory."}
            </p>
          </div>

          {/* MAIN CARD */}
          <div className="med-form-card">
            {/* CARD HEADER */}
            <div className="med-card-top">
              <div className="med-card-icon">
                <Pill size={23} />
              </div>
              <div>
                <h2 className="med-card-title">Medicine Details</h2>
                <p className="med-card-description">
                  Enter medicine information, pricing, and assigned supplier.
                </p>
              </div>
            </div>

            {/* FORM CONTENT */}
            <div className="med-form-content">
              {isLoading ? (
                <div className="med-loading-container">
                  <Loader2 size={32} className="med-loading-spinner" />
                  <span>Loading medicine details...</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="med-form-grid">
                    {/* MEDICINE NAME */}
                    <div className="med-form-group">
                      <label htmlFor="name" className="med-label">
                        Medicine Name
                        <span className="med-required">*</span>
                      </label>
                      <div className="med-input-wrapper">
                        <Pill size={18} className="med-input-icon centered" />
                        <input
                          id="name"
                          type="text"
                          className={`med-input ${errors.name ? "error" : ""}`}
                          placeholder="e.g. Paracetamol 500mg"
                          {...register("name")}
                        />
                      </div>
                      {errors.name && (
                        <div className="med-error-msg">
                          <AlertCircle size={13} />
                          <span>{errors.name.message}</span>
                        </div>
                      )}
                    </div>

                    {/* PRICE */}
                    <div className="med-form-group">
                      <label htmlFor="price" className="med-label">
                        Price (₹)
                        <span className="med-required">*</span>
                      </label>
                      <div className="med-input-wrapper">
                        <DollarSign size={18} className="med-input-icon centered" />
                        <input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          className={`med-input ${errors.price ? "error" : ""}`}
                          placeholder="e.g. 15.50"
                          {...register("price")}
                        />
                      </div>
                      {errors.price && (
                        <div className="med-error-msg">
                          <AlertCircle size={13} />
                          <span>{errors.price.message}</span>
                        </div>
                      )}
                    </div>

                    {/* SUPPLIER */}
                    <div className="med-form-group full-width">
                      <label htmlFor="supplier" className="med-label">
                        Supplier
                      </label>
                      <div className="med-input-wrapper">
                        <Building2 size={18} className="med-input-icon centered" />
                        <select
                          id="supplier"
                          className="med-select"
                          {...register("supplier.id")}
                        >
                          <option value="">Select a supplier...</option>
                          {suppliers.map((sup) => (
                            <option key={sup.id} value={sup.id}>
                              {sup.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="med-form-group full-width">
                      <label htmlFor="description" className="med-label">
                        Description
                      </label>
                      <div className="med-input-wrapper">
                        <FileText size={18} className="med-input-icon" />
                        <textarea
                          id="description"
                          className="med-textarea"
                          placeholder="Provide usage information, fever/pain relief details, etc."
                          {...register("description")}
                        />
                      </div>
                    </div>
                  </div>

                  {/* FORM FOOTER */}
                  <div className="med-form-footer">
                    <button
                      type="button"
                      className="med-cancel-button"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="med-save-button"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={18} className="med-loading-spinner" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          {isEditMode ? (
                            <Save size={18} />
                          ) : (
                            <PlusCircle size={18} />
                          )}
                          <span>{isEditMode ? "Save Changes" : "Create Medicine"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};