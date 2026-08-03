import React from 'react';
import Modal from '../../../components/common/Modal';
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
  Tag,
  Boxes,
  Stethoscope,
  ChevronRight,
  ExternalLink,
  Ban
} from 'lucide-react';

export default function UserMedicineDetailsModal({
  isOpen,
  onClose,
  medicine,
  allMedicines = [],
  onSelectRelated
}) {
  if (!medicine) return null;

  const formatINR = (val) => {
    if (val === null || val === undefined) return 'Information not available';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const name = medicine.name || 'Information not available';
  const genericName = medicine.genericName || 'Information not available';
  const medicineCode = medicine.medicineCode || 'Information not available';
  const categoryName = medicine.category?.name || 'General Pharmaceutical';
  const dosage = medicine.dosage || 'Standard Dosage';
  const manufacturer = medicine.manufacturer || 'Standard Manufacturer';
  const unitPrice = medicine.unitPrice;
  const description = medicine.description || 'Standard pharmaceutical medicine formulation.';

  // Determine Availability Status without exposing raw inventory quantity
  const getAvailabilityBadge = (status) => {
    const s = (status || 'ACTIVE').toUpperCase();
    if (s === 'INACTIVE' || s === 'OUT_OF_STOCK') {
      return (
        <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-full inline-flex items-center gap-1.5">
          <Ban className="w-3.5 h-3.5" /> Out of Stock
        </span>
      );
    }
    if (s === 'LOW_STOCK') {
      return (
        <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-full inline-flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full inline-flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5" /> Available
      </span>
    );
  };

  // Helper for Category Educational Indications
  const getEducationalUses = (cat, medName) => {
    const lower = (cat + ' ' + medName).toLowerCase();
    if (lower.includes('antibiotic') || lower.includes('anti-infective')) {
      return [
        'Treatment of susceptible bacterial infections',
        'Upper & lower respiratory tract infections',
        'Ears, nose, throat & skin tissue infections',
        'Urinary tract and soft tissue infections'
      ];
    }
    if (lower.includes('analgesic') || lower.includes('pain') || lower.includes('nsaid')) {
      return [
        'Relief of mild to moderate pain (headache, body ache)',
        'Fever reduction and antipyretic care',
        'Management of joint pain and inflammatory conditions',
        'Post-procedural pain management'
      ];
    }
    if (lower.includes('cardio') || lower.includes('hypertens')) {
      return [
        'Blood pressure management and hypertension control',
        'Cardiovascular risk reduction and heart care',
        'Regulation of blood circulation and lipid levels'
      ];
    }
    if (lower.includes('diabet') || lower.includes('endocrine')) {
      return [
        'Blood glucose regulation in diabetic management',
        'Metabolic care and glycemic control',
        'Prevention of hyperglycemia complications'
      ];
    }
    if (lower.includes('respirat') || lower.includes('pulmon')) {
      return [
        'Relief of bronchospasm and airway obstruction',
        'Management of respiratory allergies and cough',
        'Improvement of pulmonary breathing capacity'
      ];
    }
    if (lower.includes('gastro') || lower.includes('gi care') || lower.includes('antacid')) {
      return [
        'Relief of acidity, heartburn, and GERD symptoms',
        'Gastric mucosa protection and ulcer care',
        'Digestive system discomfort management'
      ];
    }
    return [
      'Therapeutic management as prescribed by physician',
      'Symptomatic relief of target health condition',
      'Maintenance of general health and medical wellness'
    ];
  };

  const usesList = getEducationalUses(categoryName, name);

  // Filter Related Medicines in Same Category
  const relatedMedicines = allMedicines
    .filter((m) => m.category?.id === medicine.category?.id && m.id !== medicine.id)
    .slice(0, 3);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Drug Information: ${name}`}>
      <div className="space-y-6 text-xs text-slate-700 max-h-[80vh] overflow-y-auto pr-1">
        {/* Header Hero Box */}
        <div className="p-5 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl text-white shadow-md border border-slate-800">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="px-2.5 py-0.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 font-mono text-[10px] font-bold rounded-md uppercase">
                {medicineCode}
              </span>
              <h3 className="text-lg font-black text-white mt-1.5">{name}</h3>
              <p className="text-xs text-slate-300 italic font-medium">{genericName}</p>
            </div>
            <div>{getAvailabilityBadge(medicine.status)}</div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-300 font-medium">
              Category: <strong className="text-white">{categoryName}</strong>
            </span>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Unit Price</span>
              <span className="text-base font-black text-blue-400">{formatINR(unitPrice)}</span>
            </div>
          </div>
        </div>

        {/* Basic Specifications Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Brand / Name</span>
            <span className="font-bold text-slate-900 line-clamp-1">{name}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Dosage Form</span>
            <span className="font-bold text-slate-900">{dosage}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Manufacturer</span>
            <span className="font-bold text-slate-900 line-clamp-1">{manufacturer}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Pack Specification</span>
            <span className="font-bold text-slate-900">Standard Pack</span>
          </div>
        </div>

        {/* Description & Indications */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" /> Medicine Overview & Description
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">{description}</p>

          <div className="border-t border-slate-100 pt-3">
            <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-emerald-600" /> Therapeutic Uses & Indications
            </h5>
            <ul className="space-y-1.5 pl-1">
              {usesList.map((use, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{use}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* How to Take & Administration */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-600" /> How to Take & Administration Guidance
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
              <span className="font-bold text-purple-900 block text-xs">Meal Timing</span>
              <p className="text-[11px] text-purple-800 mt-0.5">
                Take after food or as specifically directed by your healthcare practitioner.
              </p>
            </div>
            <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
              <span className="font-bold text-purple-900 block text-xs">Administration Route</span>
              <p className="text-[11px] text-purple-800 mt-0.5">
                Oral administration with water. Swallowed whole without crushing unless specified.
              </p>
            </div>
          </div>
        </div>

        {/* Storage & Safety Warnings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Storage Instructions */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-blue-600" /> Storage Instructions
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 pl-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Store below 25°C in a cool, dry place.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Keep protected from direct sunlight & moisture.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Keep out of reach of children.
              </li>
            </ul>
          </div>

          {/* Precautions */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" /> Safety Warnings & Precautions
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 pl-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Prescription medicine: use under medical guidance.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Complete the full course as prescribed.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Do not self-medicate or alter prescribed dosage.
              </li>
            </ul>
          </div>
        </div>

        {/* Side Effects */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Potential Educational Side Effects
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-800 block text-xs mb-1">Common (Mild)</span>
              <p className="text-[11px] text-slate-600">
                Nausea, mild headache, temporary abdominal discomfort, or mild drowsiness.
              </p>
            </div>
            <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl">
              <span className="font-bold text-rose-900 block text-xs mb-1">Serious (Seek Emergency Care)</span>
              <p className="text-[11px] text-rose-800">
                Severe skin rash, facial swelling, or breathing difficulty. Stop use immediately and seek urgent medical aid.
              </p>
            </div>
          </div>
        </div>

        {/* Related Medicines in Category */}
        {relatedMedicines.length > 0 && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-blue-600" /> Related Medicines in {categoryName}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {relatedMedicines.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectRelated && onSelectRelated(rel)}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="font-mono text-[9px] text-slate-400 block font-bold">{rel.medicineCode}</span>
                    <h5 className="font-bold text-slate-900 text-xs mt-0.5 line-clamp-1">{rel.name}</h5>
                    <p className="text-[10px] text-slate-500 italic line-clamp-1">{rel.genericName || 'N/A'}</p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-blue-600">{formatINR(rel.unitPrice)}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Disclaimer Notice */}
        <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-950 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed font-medium">
            <strong>Medical Disclaimer:</strong> This information is for educational purposes only and should not replace advice from a qualified healthcare professional. Always consult your physician before taking any medication.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
          >
            Close Information
          </button>
        </div>
      </div>
    </Modal>
  );
}
