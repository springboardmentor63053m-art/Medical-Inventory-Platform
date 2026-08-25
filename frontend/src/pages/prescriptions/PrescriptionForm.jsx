import { useState, useEffect } from 'react'
import { patientAPI, doctorAPI, medicineAPI, prescriptionAPI } from '../../api/services'
import { X, Plus, Trash2, CheckCircle2, AlertTriangle, Pill, UserCheck, Stethoscope } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PrescriptionForm({ isOpen, onClose, onSuccess, initialData = null }) {
  const [patients,  setPatients]  = useState([])
  const [doctors,   setDoctors]   = useState([])
  const [medicines, setMedicines] = useState([])
  const [loading,   setLoading]   = useState(false)

  // Form state
  const [patientId, setPatientId] = useState('')
  const [doctorId,  setDoctorId]  = useState('')
  const [prescriptionDate, setPrescriptionDate] = useState(new Date().toISOString().split('T')[0])
  const [diagnosis, setDiagnosis] = useState('')
  const [notes,     setNotes]     = useState('')
  const [ocrConfidence, setOcrConfidence] = useState(null)

  const [items, setItems] = useState([
    { medicineId: '', dosage: '500mg', frequency: '1 tablet 3x daily', duration: '5 days', quantity: 15, instructions: 'Take after meals' }
  ])

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        patientAPI.getAll(),
        doctorAPI.getAll(null, true),
        medicineAPI.getAll()
      ]).then(([pRes, dRes, mRes]) => {
        setPatients(pRes.data)
        setDoctors(dRes.data)
        setMedicines(mRes.data)

        if (initialData) {
          // Pre-fill from OCR or draft
          if (initialData.patientId) setPatientId(initialData.patientId)
          if (initialData.doctorId) setDoctorId(initialData.doctorId)
          if (initialData.diagnosis) setDiagnosis(initialData.diagnosis)
          if (initialData.notes) setNotes(initialData.notes)
          if (initialData.ocrConfidence) setOcrConfidence(initialData.ocrConfidence)
          if (initialData.items && initialData.items.length > 0) {
            setItems(initialData.items)
          }
        } else {
          // Defaults
          if (pRes.data.length > 0) setPatientId(pRes.data[0].id)
          if (dRes.data.length > 0) setDoctorId(dRes.data[0].id)
        }
      }).catch(err => {
        toast.error('Failed to load form lookup data')
      })
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleAddItem = () => {
    setItems([
      ...items,
      { medicineId: medicines[0]?.id || '', dosage: '500mg', frequency: '1 tablet 2x daily', duration: '5 days', quantity: 10, instructions: 'Take with water' }
    ])
  }

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      toast.error('Prescription must contain at least one medicine')
      return
    }
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index, field, value) => {
    const updated = [...items]
    updated[index][field] = value
    setItems(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!patientId) return toast.error('Please select a patient')
    if (!doctorId)  return toast.error('Please select a doctor')

    for (let i = 0; i < items.length; i++) {
      if (!items[i].medicineId) {
        return toast.error(`Please select a medicine for item #${i + 1}`)
      }
      if (!items[i].quantity || items[i].quantity <= 0) {
        return toast.error(`Please specify a valid quantity for item #${i + 1}`)
      }
    }

    setLoading(true)
    try {
      const payload = {
        patient: { id: Number(patientId) },
        doctor:  { id: Number(doctorId) },
        prescriptionDate,
        diagnosis,
        notes,
        ocrConfidence,
        items: items.map(item => ({
          medicine: { id: Number(item.medicineId) },
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          quantity: Number(item.quantity),
          instructions: item.instructions
        }))
      }

      await prescriptionAPI.create(payload)
      toast.success('Prescription created successfully!')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create prescription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="card w-full max-w-3xl my-8 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {ocrConfidence ? 'Verify & Save AI Extracted Prescription' : 'New Medical Prescription'}
              </h2>
              <p className="text-xs text-slate-400">
                {ocrConfidence ? `AI Confidence Score: ${ocrConfidence}% — Review before saving` : 'Enter clinical prescription and medication details'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {ocrConfidence && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span><strong>AI Safety Note:</strong> Pharmacist verification is required. Check medication names, dosages, and quantities against the physical prescription before authorizing.</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Patient & Doctor Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-500" /> Patient Name *
              </label>
              <select
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                className="input text-xs w-full"
                required
              >
                <option value="">Select Patient</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.patientId}) - {p.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-500" /> Prescribing Doctor *
              </label>
              <select
                value={doctorId}
                onChange={e => setDoctorId(e.target.value)}
                className="input text-xs w-full"
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialty} - {d.registrationNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Diagnosis */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Prescription Date *
              </label>
              <input
                type="date"
                value={prescriptionDate}
                onChange={e => setPrescriptionDate(e.target.value)}
                className="input text-xs w-full"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Diagnosis / Chief Complaints
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute Bronchitis / Hypertension follow-up"
                className="input text-xs w-full"
              />
            </div>
          </div>

          {/* Medicine Items Dynamic Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-rose-500" /> Prescribed Medications ({items.length})
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Medicine
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                      Item #{idx + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Medicine *</label>
                      <select
                        value={item.medicineId}
                        onChange={e => handleItemChange(idx, 'medicineId', e.target.value)}
                        className="input text-xs w-full"
                        required
                      >
                        <option value="">Select Formulation</option>
                        {medicines.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.genericName || 'Rx'}) - ₹{m.mrp}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Dosage</label>
                      <input
                        type="text"
                        value={item.dosage}
                        onChange={e => handleItemChange(idx, 'dosage', e.target.value)}
                        placeholder="e.g. 500mg / 1 tab"
                        className="input text-xs w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                        className="input text-xs w-full"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Frequency</label>
                      <input
                        type="text"
                        value={item.frequency}
                        onChange={e => handleItemChange(idx, 'frequency', e.target.value)}
                        placeholder="e.g. 1 cap 3x daily"
                        className="input text-xs w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Duration</label>
                      <input
                        type="text"
                        value={item.duration}
                        onChange={e => handleItemChange(idx, 'duration', e.target.value)}
                        placeholder="e.g. 5 days"
                        className="input text-xs w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Instructions</label>
                      <input
                        type="text"
                        value={item.instructions}
                        onChange={e => handleItemChange(idx, 'instructions', e.target.value)}
                        placeholder="e.g. Take after meals"
                        className="input text-xs w-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Clinical & Verification Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional pharmacist or doctor notes..."
              className="input text-xs w-full resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary !text-xs !py-2 !px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary !text-xs !py-2 !px-5 flex items-center gap-2"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Prescription
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
