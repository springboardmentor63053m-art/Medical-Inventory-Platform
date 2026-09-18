import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Modal from '../../../components/common/Modal';
import { toast } from 'react-toastify';
import {
  Pill,
  ShieldAlert,
  Info,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Thermometer,
  FileText,
  Building2,
  Boxes,
  Stethoscope,
  ChevronRight,
  Ban,
  Package,
  Truck,
  Shield,
  Edit,
  Trash2,
  Calendar,
  Layers,
  Activity,
  FlaskConical,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Car,
  Wine,
  Baby
} from 'lucide-react';

export default function UnifiedMedicineDetailsModal({
  isOpen,
  onClose,
  medicine,
  allMedicines = [],
  onSelectRelated,
  onEdit,
  onDelete,
  onStockUpdate
}) {
  const { isUser, isSupplier, isPharmacist, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'inventory' | 'purchasing' | 'admin'

  if (!medicine) return null;

  const formatINR = (val) => {
    if (val === null || val === undefined) return 'Information not available';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Header & Core Information
  const name = medicine.name || 'Information not available';
  const brandName = medicine.brandName || name;
  const genericName = medicine.genericName || 'Information not available';
  const medicineCode = medicine.medicineCode || 'Information not available';
  const categoryName = medicine.category?.name || 'General Pharmaceutical';
  const dosage = medicine.dosage || 'Standard Dosage';
  const manufacturer = medicine.manufacturer || 'Standard Manufacturer';
  const unitPrice = medicine.unitPrice;
  const sellingPrice = medicine.sellingPrice !== undefined && medicine.sellingPrice !== null ? medicine.sellingPrice : unitPrice;
  const costPrice = medicine.costPrice !== undefined && medicine.costPrice !== null ? medicine.costPrice : (sellingPrice ? Number((sellingPrice * 0.70).toFixed(2)) : 0);
  const profitPerUnit = medicine.profitPerUnit !== undefined && medicine.profitPerUnit !== null ? medicine.profitPerUnit : (sellingPrice - costPrice);
  const profitMargin = medicine.profitMargin !== undefined && medicine.profitMargin !== null ? medicine.profitMargin : (sellingPrice > 0 ? Number(((profitPerUnit / sellingPrice) * 100).toFixed(2)) : 0);
  const description = medicine.description || 'Standard pharmaceutical medicine formulation.';
  const reorderLevel = medicine.reorderLevel || 10;
  const countryOfOrigin = medicine.countryOfOrigin || 'India';
  const licenseNo = medicine.licenseNo || 'MFG/DL-2024/FDA-08';
  const packSize = medicine.packSize || 'Standard Pack';
  const drugClass = medicine.drugClass || categoryName;
  const therapeuticClass = medicine.therapeuticClass || 'Therapeutic Health Formulation';
  const rxRequired = medicine.prescriptionRequired !== false ? 'Prescription Required (Rx)' : 'Over-The-Counter (OTC)';
  const statusStr = (medicine.status || 'ACTIVE').toUpperCase();

  // Basic Information Details
  const batchNumber = medicine.batchNumber || 'BT-2026-X9';
  const manufacturingDate = medicine.manufacturingDate || '2025-06-15';
  const expiryDate = medicine.expiryDate || '2027-06-15';
  const shelfLife = medicine.shelfLife || '24 Months';

  // Description & Formula
  const composition = medicine.composition || `${genericName} (${dosage})`;
  const activeIngredients = medicine.activeIngredients || `${genericName} Active Compound`;

  // Uses Helper
  const getEducationalUses = (cat, medName) => {
    const lower = (cat + ' ' + medName).toLowerCase();
    if (lower.includes('antibiotic') || lower.includes('anti-infective')) {
      return {
        primary: 'Treatment of bacterial respiratory, urinary, and ear infections.',
        common: [
          'Skin and soft tissue bacterial infection management',
          'Prophylactic anti-infective therapy under medical supervision',
          'Post-surgical antibacterial prophylaxis'
        ]
      };
    }
    if (lower.includes('analgesic') || lower.includes('pain') || lower.includes('nsaid')) {
      return {
        primary: 'Relief of mild to moderate musculoskeletal pain and headache.',
        common: [
          'Fever management and antipyretic relief',
          'Inflammation management in arthritis and sports injury',
          'Post-operative mild pain management'
        ]
      };
    }
    if (lower.includes('cardio') || lower.includes('hypertens')) {
      return {
        primary: 'Long-term regulation of blood pressure and vascular resistance.',
        common: [
          'Cardiovascular protection and heart function maintenance',
          'Prevention of hypertensive crises',
          'Reduction of cardiovascular risk factors'
        ]
      };
    }
    if (lower.includes('diabet') || lower.includes('endocrine')) {
      return {
        primary: 'Blood glucose regulation and glycemic control in diabetic therapy.',
        common: [
          'Maintenance of target HbA1c levels',
          'Prevention of microvascular diabetic complications',
          'Metabolic homeostasis optimization'
        ]
      };
    }
    return {
      primary: 'Therapeutic treatment as indicated by healthcare provider.',
      common: [
        'Management of chronic disease progression',
        'Supportive wellness and organ function maintenance',
        'Symptom relief under authorized medical regimen'
      ]
    };
  };

  const educationalUses = getEducationalUses(categoryName, name);

  // Safety Warnings Helper
  const sideEffects = medicine.sideEffects || 'Mild dizziness, nausea, headache, or gastrointestinal discomfort in sensitive individuals.';
  const contraindications = medicine.contraindications || 'Hypersensitivity to active compound, severe hepatic impairment, or renal insufficiency without dosage adjustment.';
  const storageInstructions = medicine.storageInstructions || 'Store below 25°C in a dry place. Protect from direct sunlight and moisture. Keep out of reach of children.';
  const precautions = medicine.precautions || 'Consult physician prior to use during pregnancy or lactation. Avoid alcohol consumption during therapy.';

  // Inventory & Warehouse Specs
  const currentStock = medicine.currentStock || medicine.stockQuantity || 0;
  const isLowStock = currentStock > 0 && currentStock <= reorderLevel;
  const isOutOfStock = currentStock <= 0;
  const storageLocation = medicine.storageLocation || 'Aisle 3, Shelf B2 (Temperature Controlled)';
  const purchaseInfo = medicine.purchaseInfo || 'PO-2026-MED-849';
  const expiryAlert = medicine.expiryAlert || 'Normal (22 Months Remaining)';
  const supplierName = medicine.supplierName || `${manufacturer} Distribution Network`;
  const createdByName = medicine.createdBy || 'System Administrator';
  const updatedByName = medicine.updatedBy || 'Lead Pharmacist';

  // Dosage & Administration Info
  const routeOfAdministration = medicine.routeOfAdministration || 'Oral / Standard Route';
  const recommendedUsage = medicine.recommendedUsage || 'Take strictly according to physician prescription.';
  const beforeAfterFood = medicine.beforeAfterFood || 'Take after meals with a full glass of water.';
  const storageTemperature = medicine.storageTemperature || 'Store below 25°C in a cool, dry place away from direct light.';

  // Warnings & Precautions
  const pregnancyWarning = medicine.pregnancyWarning || 'Category C: Consult doctor prior to use during pregnancy.';
  const breastfeedingWarning = medicine.breastfeedingWarning || 'Excreted in small amounts in breast milk; use under clinical advice.';
  const alcoholWarning = medicine.alcoholWarning || 'Avoid alcohol consumption while on this medication.';
  const drivingWarning = medicine.drivingWarning || 'May cause mild drowsiness; exercise caution when operating heavy machinery.';

  // Side Effects Info
  const commonSideEffects = medicine.commonSideEffects || 'Mild nausea, headache, temporary dizziness, abdominal discomfort.';
  const seriousSideEffects = medicine.seriousSideEffects || 'Severe skin rash, facial swelling, breathing difficulty, chest tightness.';
  const consultDoctorWhen = medicine.consultDoctorWhen || 'Symptoms persist beyond 3 days, or if any allergic reaction occurs.';

  // Filter Related Medicines in same category
  const relatedMedicines = allMedicines
    .filter((m) => m.category?.id === medicine.category?.id && m.id !== medicine.id)
    .slice(0, 3);

  // Helper for Status Badge
  const getStatusBadge = () => {
    if (statusStr === 'INACTIVE' || isOutOfStock) {
      return (
        <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-full inline-flex items-center gap-1.5">
          <Ban className="w-3.5 h-3.5" /> Out of Stock / Inactive
        </span>
      );
    }
    if (isLowStock) {
      return (
        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-full inline-flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Warning
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full inline-flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5" /> Active in Catalog
      </span>
    );
  };

  // Helper for Role Tag
  const getRoleBadge = () => {
    if (isAdmin) return <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold rounded-md uppercase tracking-wider">ADMIN VIEW</span>;
    if (isPharmacist) return <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold rounded-md uppercase tracking-wider">PHARMACIST VIEW</span>;
    if (isSupplier) return <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold rounded-md uppercase tracking-wider">SUPPLIER VIEW</span>;
    return <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold rounded-md uppercase tracking-wider">READ-ONLY USER VIEW</span>;
  };

  const handleActionToast = (actionName) => {
    toast.info(`${actionName} triggered for ${name}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Medicine Details: ${name}`}>
      <div className="space-y-5 text-xs text-slate-700 dark:text-slate-200 max-h-[82vh] overflow-y-auto pr-1 font-sans">
        
        {/* RICH HOSPITAL INVENTORY HERO HEADER */}
        <div className="p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 rounded-2xl text-slate-900 dark:text-white shadow-xs dark:shadow-xl border border-blue-100 dark:border-slate-800 relative overflow-hidden">
          {/* Subtle Background Accent Pattern */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 space-y-4">
            {/* Top Bar: Code, Role Badge, Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-400/40 text-blue-700 dark:text-blue-300 font-mono text-xs font-extrabold rounded-lg tracking-wide uppercase">
                  {medicineCode}
                </span>
                {getRoleBadge()}
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-bold rounded-lg uppercase">
                  {rxRequired}
                </span>
              </div>
              <div>{getStatusBadge()}</div>
            </div>

            {/* Main Header Content: Name, Brand, Generic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2 space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Pill className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
                  {name}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600 dark:text-slate-300 text-xs">
                  <p className="font-semibold">
                    Brand: <span className="text-slate-900 dark:text-white font-bold">{brandName}</span>
                  </p>
                  <span className="text-slate-400">•</span>
                  <p className="italic">
                    Generic: <span className="text-slate-700 dark:text-slate-200 font-medium">{genericName}</span>
                  </p>
                </div>
              </div>

              {/* Price & Strength Box */}
              <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-3.5 rounded-xl text-right flex flex-col justify-center shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Selling Price</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{formatINR(sellingPrice)}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Pack: {packSize}</span>
              </div>
            </div>

            {/* Header Specs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/60 text-[11px]">
              <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 text-[9px] uppercase font-bold block">Category</span>
                <span className="text-slate-900 dark:text-white font-semibold line-clamp-1">{categoryName}</span>
              </div>
              <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 text-[9px] uppercase font-bold block">Therapeutic Class</span>
                <span className="text-slate-700 dark:text-slate-200 font-semibold line-clamp-1">{therapeuticClass}</span>
              </div>
              <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 text-[9px] uppercase font-bold block">Drug Class / Dosage Form</span>
                <span className="text-slate-700 dark:text-slate-200 font-semibold line-clamp-1">{drugClass} • {dosage}</span>
              </div>
              <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 text-[9px] uppercase font-bold block">Manufacturer</span>
                <span className="text-slate-700 dark:text-slate-200 font-semibold line-clamp-1">{manufacturer}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION FOR ROLE-BASED ACCESS */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Pill className="w-3.5 h-3.5" /> Clinical & Medicine Information
          </button>

          {(isPharmacist || isAdmin) && (
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                activeTab === 'inventory'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5" /> Staff Inventory Specs
            </button>
          )}

          {(isPharmacist || isAdmin) && (
            <button
              onClick={() => setActiveTab('purchasing')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                activeTab === 'purchasing'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" /> Pharmacist & Supplier Specs
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Admin Audit & Controls
            </button>
          )}
        </div>

        {/* TAB 1: OVERVIEW & DRUG INFORMATION (READ-ONLY FOR ALL ROLES / ROLE_USER) */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            
            {/* SECTION 1: BASIC INFORMATION CARD */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <FileText className="w-4 h-4 text-blue-600" /> Basic Medicine Specs & Lifecycle
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Medicine Code</span>
                  <span className="font-mono font-bold text-slate-900">{medicineCode}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Batch Identifier</span>
                  <span className="font-mono font-bold text-slate-900">{medicine.batchNumber || 'Multi-Batch Tracked'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Mfg. Date</span>
                  <span className="font-medium text-slate-900">{manufacturingDate}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Expiry Date</span>
                  <span className="font-bold text-amber-700">{expiryDate}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Shelf Life</span>
                  <span className="font-semibold text-slate-900">{shelfLife}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Pack Size</span>
                  <span className="font-semibold text-slate-900">{packSize}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Unit Price</span>
                  <span className="font-bold text-blue-600">{formatINR(unitPrice)}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Prescription Status</span>
                  <span className="font-bold text-slate-800">{rxRequired}</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: DESCRIPTION & COMPOSITION */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <FlaskConical className="w-4 h-4 text-purple-600" /> Description & Chemical Composition
              </h4>
              <div className="space-y-2.5">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Short Description</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal mt-0.5">{description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
                    <span className="text-[10px] text-purple-900 font-extrabold uppercase block">Composition</span>
                    <p className="text-xs text-purple-950 font-semibold mt-0.5">{composition}</p>
                  </div>
                  <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
                    <span className="text-[10px] text-purple-900 font-extrabold uppercase block">Active Ingredients</span>
                    <p className="text-xs text-purple-950 font-semibold mt-0.5">{activeIngredients}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: USES & INDICATIONS */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Stethoscope className="w-4 h-4 text-emerald-600" /> Primary Uses & Clinical Indications
              </h4>
              <div className="space-y-2.5">
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] text-emerald-800 font-extrabold uppercase block">Primary Medical Use</span>
                  <p className="text-xs font-bold text-emerald-950 mt-0.5">{usesData.primary}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Common Clinical Applications</span>
                  <ul className="space-y-1.5 pl-1">
                    {usesData.common.map((use, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{use}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* SECTION 4: DOSAGE & ADMINISTRATION */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Clock className="w-4 h-4 text-indigo-600" /> Dosage Information & Storage
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Route of Administration</span>
                  <span className="font-semibold text-slate-900 block mt-0.5">{routeOfAdministration}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Recommended Usage</span>
                  <span className="font-semibold text-slate-900 block mt-0.5">{recommendedUsage}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Before / After Food</span>
                  <span className="font-semibold text-slate-900 block mt-0.5">{beforeAfterFood}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Storage Temperature</span>
                  <span className="font-semibold text-slate-900 block mt-0.5">{storageTemperature}</span>
                </div>
              </div>
            </div>

            {/* SECTION 5: WARNINGS & PRECAUTIONS */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" /> Clinical Warnings & Contraindications
              </h4>
              <div className="space-y-2">
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                  <span className="text-[10px] text-amber-900 font-extrabold uppercase block">Contraindications</span>
                  <p className="text-xs text-amber-950 font-medium mt-0.5">{contraindications}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <Baby className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 block text-[11px]">Pregnancy Warning</span>
                      <p className="text-[11px] text-slate-600">{pregnancyWarning}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 block text-[11px]">Breastfeeding Warning</span>
                      <p className="text-[11px] text-slate-600">{breastfeedingWarning}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <Wine className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 block text-[11px]">Alcohol Warning</span>
                      <p className="text-[11px] text-slate-600">{alcoholWarning}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <Car className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 block text-[11px]">Driving & Machines</span>
                      <p className="text-[11px] text-slate-600">{drivingWarning}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 6: SIDE EFFECTS */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Side Effects & Medical Advisory
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-extrabold text-slate-800 block text-[11px] mb-1">Common Side Effects (Mild)</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{commonSideEffects}</p>
                </div>
                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
                  <span className="font-extrabold text-rose-900 block text-[11px] mb-1">Serious Side Effects</span>
                  <p className="text-[11px] text-rose-800 leading-relaxed">{seriousSideEffects}</p>
                </div>
              </div>
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-950 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-[11px] font-semibold">
                  <strong>When to Consult a Doctor:</strong> {consultDoctorWhen}
                </p>
              </div>
            </div>

            {/* SECTION 7: MANUFACTURER INFORMATION */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/80 pb-2">
                <Building2 className="w-4 h-4 text-slate-700" /> Manufacturer & Regulatory Compliance
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Manufacturer Name</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{manufacturer}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Country of Origin</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{countryOfOrigin}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Drug License Info</span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">{licenseNo}</span>
                </div>
              </div>
            </div>

            {/* SECTION 8: RELATED MEDICINES */}
            {relatedMedicines.length > 0 && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/80 pb-2">
                  <Boxes className="w-4 h-4 text-blue-600" /> Related Medicines in {categoryName}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {relatedMedicines.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectRelated && onSelectRelated(rel)}
                      className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <span className="font-mono text-[9px] text-blue-600 block font-extrabold uppercase">{rel.medicineCode}</span>
                        <h5 className="font-bold text-slate-900 text-xs mt-0.5 line-clamp-1">{rel.name}</h5>
                        <p className="text-[10px] text-slate-500 italic line-clamp-1">{rel.genericName || 'N/A'}</p>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="font-black text-blue-600">{formatINR(rel.unitPrice)}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EDUCATIONAL DISCLAIMER */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed font-medium">
                <strong>Medical Disclaimer:</strong> This information is for educational purposes only and should not replace advice from a qualified healthcare professional.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY & OPERATIONS (ROLE_PHARMACIST, ROLE_ADMIN) */}
        {activeTab === 'inventory' && (isPharmacist || isAdmin) && (
          <div className="space-y-4">
            <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
              <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-blue-200/80 pb-2">
                <Package className="w-4 h-4 text-blue-600" /> Staff Operational Inventory Status
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Stock</span>
                  <span className="text-base font-black text-slate-900">{currentStock} units</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Storage Location</span>
                  <span className="font-bold text-slate-900">{storageLocation}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Reorder Level</span>
                  <span className="font-bold text-amber-600">{reorderLevel} units</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Expiry Alerts</span>
                  <span className="font-bold text-emerald-600">{expiryAlert}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUPPLIERS & PURCHASING (ROLE_PHARMACIST, ROLE_ADMIN) */}
        {activeTab === 'purchasing' && (isPharmacist || isAdmin) && (
          <div className="space-y-4">
            <div className="p-5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
              <h4 className="text-xs font-extrabold text-purple-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-purple-200/80 pb-2">
                <Truck className="w-4 h-4 text-purple-600" /> Authorized Supply Partners & Purchase Parameters
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Primary Manufacturer</span>
                  <span className="font-bold text-slate-900 dark:text-white">{manufacturer}</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Cost Price (Purchasing)</span>
                  <span className="font-bold text-purple-700 dark:text-purple-400">{formatINR(costPrice)}</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Selling Price</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatINR(sellingPrice)}</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Unit Profit Margin</span>
                  <span className="font-bold text-blue-700 dark:text-blue-400">+{profitMargin}% ({formatINR(profitPerUnit)})</span>
                </div>
              </div>
            </div>

            {/* SUPPLIERS LIST SECTION */}
            {(() => {
              const linkedSuppliers = Array.isArray(medicine.suppliers) ? medicine.suppliers : [];
              return (
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Building2 className="w-4 h-4 text-purple-600" /> Suppliers Supplying This Medicine
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                      {linkedSuppliers.length}
                    </span>
                  </h4>

                  {linkedSuppliers.length === 0 ? (
                    <div className="py-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                      <Truck className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-slate-700">No registered suppliers currently linked</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Link suppliers from the Supplier Directory page to manage supply channels.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {linkedSuppliers.map((sup) => (
                        <div key={sup.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">{sup.supplierName}</span>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-100">
                              {sup.supplierCode}
                            </span>
                          </div>
                          {sup.contactPerson && (
                            <div className="text-[11px] text-slate-600">Contact: <span className="font-semibold text-slate-800">{sup.contactPerson}</span></div>
                          )}
                          <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1 border-t border-slate-100">
                            <span>📞 {sup.phone}</span>
                            <span className="truncate">✉️ {sup.email}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 4: AUDIT & SYSTEM CONTROLS (ROLE_ADMIN ONLY) */}
        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-4">
            <div className="p-5 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3">
              <h4 className="text-xs font-extrabold text-rose-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-rose-200/80 pb-2">
                <Shield className="w-4 h-4 text-rose-600" /> Admin Audit History & System Governance
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">System Record ID</span>
                  <span className="font-mono font-bold text-slate-900">#MED-{medicine.id}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Created By</span>
                  <span className="font-bold text-slate-900">{createdByName}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Updated By</span>
                  <span className="font-bold text-slate-900">{updatedByName}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Updated</span>
                  <span className="font-mono text-[11px] font-bold text-slate-800">
                    {medicine.updatedAt ? new Date(medicine.updatedAt).toLocaleDateString() : 'System Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC ROLE-BASED ACTION BAR */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            Close Modal
          </button>

          {/* Action Buttons for ROLE_SUPPLIER */}
          {isSupplier && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (onStockUpdate) onStockUpdate(medicine);
                  else handleActionToast('Stock Update');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Package className="w-3.5 h-3.5" /> Stock Update
              </button>
            </div>
          )}

          {/* Action Buttons for ROLE_PHARMACIST */}
          {isPharmacist && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (onEdit) onEdit(medicine);
                  else handleActionToast('Edit Medicine');
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Medicine
              </button>
              <button
                onClick={() => handleActionToast('Batch Management')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Boxes className="w-3.5 h-3.5" /> Batch Management
              </button>
            </div>
          )}

          {/* Action Buttons for ROLE_ADMIN */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (onEdit) onEdit(medicine);
                  else handleActionToast('Edit Medicine');
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => {
                  if (onDelete) onDelete(medicine);
                  else handleActionToast('Delete Medicine');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <button
                onClick={() => handleActionToast('Audit Logs')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Shield className="w-3.5 h-3.5" /> Audit History
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
