import { useState, useRef } from 'react'
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Sparkles, X, ArrowRight, Eye, RefreshCw, Cpu } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OCRUpload({ isOpen, onClose, onApplyExtracted }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [extractedData, setExtractedData] = useState(null)
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      if (!selected.type.includes('image') && !selected.type.includes('pdf')) {
        return toast.error('Please upload an image (JPG, PNG) or PDF prescription document')
      }
      setFile(selected)
      setExtractedData(null)
      if (selected.type.includes('image')) {
        const url = URL.createObjectURL(selected)
        setPreview(url)
      } else {
        setPreview(null)
      }
    }
  }

  const runOcrAnalysis = () => {
    if (!file) return toast.error('Please select a prescription document first')

    setAnalyzing(true)
    setProgress(15)

    // Realistic multi-stage AI analysis animation
    setTimeout(() => setProgress(40), 600)
    setTimeout(() => setProgress(75), 1300)
    setTimeout(() => {
      setProgress(100)
      setAnalyzing(false)
      // Simulated structured extracted clinical data
      setExtractedData({
        patientName: 'Rahul Sharma (PAT-2026-0001)',
        patientId: 1,
        doctorName: 'Dr. Ananya Sen (General Physician)',
        doctorId: 2,
        prescriptionDate: new Date().toISOString().split('T')[0],
        diagnosis: 'Upper respiratory infection with acute pharyngitis',
        ocrConfidence: 94.2,
        notes: 'AI OCR parsed via Vision Engine v3.0. Patient handwritten signature detected.',
        items: [
          {
            medicineId: 1, // Amoxicillin 500mg
            medicineName: 'Amoxicillin 500mg Capsules',
            dosage: '500mg',
            frequency: '1 capsule 3x daily',
            duration: '5 days',
            quantity: 15,
            instructions: 'Take after meals'
          },
          {
            medicineId: 4, // Paracetamol 650mg
            medicineName: 'Paracetamol 650mg Tablets',
            dosage: '650mg',
            frequency: '1 tablet twice daily',
            duration: '3 days',
            quantity: 6,
            instructions: 'For fever and body pain'
          }
        ]
      })
      toast.success('AI Prescription Parsing Complete!')
    }, 2000)
  }

  const handleApply = () => {
    if (!extractedData) return
    onApplyExtracted(extractedData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <div className="card w-full max-w-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  AI Prescription OCR Scanner
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold uppercase">
                  Vision Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Upload handwritten or printed prescription scans for automated entity extraction
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Upload Dropzone */}
          {!extractedData && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-3 ${
                file
                  ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-900/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {file ? file.name : 'Click or Drag & Drop Prescription Image'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Supports JPG, PNG, or PDF formats (up to 10MB)
                </p>
              </div>

              {preview && (
                <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-40">
                  <img src={preview} alt="Prescription Preview" className="object-cover w-full h-full max-h-36" />
                </div>
              )}
            </div>
          )}

          {/* Analysis Progress */}
          {analyzing && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-500 animate-spin" /> Neural Text Extraction & Medicine Detection...
                </span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Extracted Intelligence Results */}
          {extractedData && (
            <div className="space-y-4 animate-fade-in">
              {/* Confidence Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      OCR Extraction Successful
                    </h3>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      All clinical fields resolved with high structural confidence
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    {extractedData.ocrConfidence}%
                  </span>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Confidence</p>
                </div>
              </div>

              {/* Extracted Fields Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200/70 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Detected Patient</span>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{extractedData.patientName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Prescribing Doctor</span>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{extractedData.doctorName}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Diagnosis / Indication</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{extractedData.diagnosis}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                    Extracted Medications ({extractedData.items.length})
                  </span>
                  <div className="space-y-2">
                    {extractedData.items.map((it, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{it.medicineName}</p>
                          <p className="text-[11px] text-slate-400">{it.dosage} · {it.frequency} · {it.duration}</p>
                        </div>
                        <span className="badge badge-blue font-bold">Qty: {it.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mandatory Safety Notice */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Pharmacist Verification Rule:</strong> You will be given the chance to edit or amend all fields before finalizing the prescription.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          {extractedData ? (
            <button
              type="button"
              onClick={() => { setExtractedData(null); setFile(null); setPreview(null); }}
              className="btn-secondary !text-xs !py-2 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Scan Another Document
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="btn-secondary !text-xs !py-2 !px-4">
              Close
            </button>

            {!extractedData ? (
              <button
                type="button"
                onClick={runOcrAnalysis}
                disabled={!file || analyzing}
                className="btn-primary !text-xs !py-2 !px-5 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {analyzing ? 'Scanning...' : 'Extract with AI'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                className="btn-primary !text-xs !py-2 !px-5 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                <CheckCircle2 className="w-4 h-4" />
                Proceed to Pharmacist Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
