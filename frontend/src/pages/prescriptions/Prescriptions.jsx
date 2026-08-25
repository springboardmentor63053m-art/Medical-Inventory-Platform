import { useState, useEffect } from 'react'
import { prescriptionAPI } from '../../api/services'
import {
  FileText, Plus, UploadCloud, CheckCircle2, XCircle, Clock, AlertTriangle,
  Receipt, Stethoscope, User, Pill, ArrowRight, Eye, ShieldCheck, ChevronRight,
  Filter, Search, RefreshCw, Sparkles, Check, AlertCircle, ShoppingCart
} from 'lucide-react'
import toast from 'react-hot-toast'
import PrescriptionForm from './PrescriptionForm'
import OCRUpload from './OCRUpload'

const STATUS_TABS = [
  { key: 'ALL',          label: 'All Prescriptions' },
  { key: 'PENDING',      label: 'Pending Review' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'APPROVED',     label: 'Approved' },
  { key: 'DISPENSED',    label: 'Dispensed' },
  { key: 'REJECTED',     label: 'Rejected' },
]

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [stats,         setStats]         = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [activeTab,     setActiveTab]     = useState('ALL')
  const [search,        setSearch]        = useState('')

  // Modals & Drawers
  const [showFormModal, setShowFormModal] = useState(false)
  const [showOcrModal,  setShowOcrModal]  = useState(false)
  const [ocrDraftData,  setOcrDraftData]  = useState(null)
  const [selectedRx,    setSelectedRx]    = useState(null)
  const [availability,  setAvailability]  = useState([])
  const [checkingAvail, setCheckingAvail] = useState(false)
  const [rejectReason,  setRejectReason]  = useState('')
  const [showRejectBox, setShowRejectBox] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const statusParam = activeTab === 'ALL' ? null : activeTab
      const [listRes, statsRes] = await Promise.all([
        prescriptionAPI.getAll(statusParam),
        prescriptionAPI.getStats()
      ])
      setPrescriptions(listRes.data)
      setStats(statsRes.data)
    } catch (err) {
      toast.error('Failed to load prescriptions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeTab])

  // Open detail & check stock availability
  const handleOpenDetail = async (rx) => {
    setSelectedRx(rx)
    setShowRejectBox(false)
    setCheckingAvail(true)
    try {
      const res = await prescriptionAPI.checkAvailability(rx.id)
      setAvailability(res.data)
    } catch (err) {
      toast.error('Could not check medicine availability')
    } finally {
      setCheckingAvail(false)
    }
  }

  const handleApprove = async (id) => {
    setActionLoading(true)
    try {
      await prescriptionAPI.approve(id)
      toast.success('Prescription approved successfully!')
      fetchData()
      setSelectedRx(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve prescription')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (id) => {
    if (!rejectReason.trim()) return toast.error('Please specify a rejection reason')
    setActionLoading(true)
    try {
      await prescriptionAPI.reject(id, { reason: rejectReason })
      toast.success('Prescription rejected')
      fetchData()
      setSelectedRx(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject prescription')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDispense = async (id) => {
    setActionLoading(true)
    try {
      const res = await prescriptionAPI.dispense(id)
      toast.success(`Prescription Dispensed! Billed under invoice ${res.data.saleNumber}`)
      fetchData()
      setSelectedRx(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispense prescription')
    } finally {
      setActionLoading(false)
    }
  }

  const handleApplyOcrData = (extracted) => {
    setOcrDraftData(extracted)
    setShowFormModal(true)
  }

  const filtered = prescriptions.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.prescriptionNumber?.toLowerCase().includes(q) ||
      p.patient?.firstName?.toLowerCase().includes(q) ||
      p.patient?.lastName?.toLowerCase().includes(q) ||
      p.doctor?.name?.toLowerCase().includes(q) ||
      p.diagnosis?.toLowerCase().includes(q)
    )
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-yellow flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
      case 'UNDER_REVIEW':
        return <span className="badge badge-blue flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Under Review</span>
      case 'APPROVED':
        return <span className="badge badge-green flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>
      case 'DISPENSED':
        return <span className="badge badge-teal flex items-center gap-1"><Receipt className="w-3 h-3" /> Dispensed</span>
      case 'REJECTED':
        return <span className="badge badge-red flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>
      default:
        return <span className="badge badge-gray">{status}</span>
    }
  }

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-md shadow-rose-500/25">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              Prescription Management
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 ml-11">
            AI-assisted prescription verification, clinical intake, inventory linkage & dispensing workflow
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowOcrModal(true)}
            className="btn-secondary !text-xs !py-2 !px-3.5 flex items-center gap-1.5 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>AI OCR Scan</span>
          </button>

          <button
            onClick={() => { setOcrDraftData(null); setShowFormModal(true); }}
            className="btn-primary !text-xs !py-2 !px-4 flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Prescription</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card !p-4 border-l-4 border-l-blue-500">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats?.total ?? 0}</p>
          <span className="text-[10px] text-blue-500 font-semibold">Registered RXs</span>
        </div>

        <div className="card !p-4 border-l-4 border-l-amber-500">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Pending</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats?.pending ?? 0}</p>
          <span className="text-[10px] text-amber-500 font-semibold">Requires Action</span>
        </div>

        <div className="card !p-4 border-l-4 border-l-sky-500">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Under Review</span>
          <p className="text-2xl font-black text-sky-600 mt-1">{stats?.underReview ?? 0}</p>
          <span className="text-[10px] text-sky-500 font-semibold">Clinical Check</span>
        </div>

        <div className="card !p-4 border-l-4 border-l-emerald-500">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Approved</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats?.approved ?? 0}</p>
          <span className="text-[10px] text-emerald-500 font-semibold">Ready to Dispense</span>
        </div>

        <div className="card !p-4 border-l-4 border-l-teal-500">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Dispensed</span>
          <p className="text-2xl font-black text-teal-600 mt-1">{stats?.dispensed ?? 0}</p>
          <span className="text-[10px] text-teal-500 font-semibold">Billed to POS</span>
        </div>

        <div className="card !p-4 border-l-4 border-l-red-500">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Rejected</span>
          <p className="text-2xl font-black text-red-600 mt-1">{stats?.rejected ?? 0}</p>
          <span className="text-[10px] text-red-500 font-semibold">Declined / Void</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card space-y-4 shadow-sm border border-slate-200/80 dark:border-slate-800">
        {/* Controls: Tabs & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by RX#, patient, doctor..."
              className="input !text-xs !pl-9 w-full"
            />
          </div>
        </div>

        {/* Prescription Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="table w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80">
                <th className="whitespace-nowrap min-w-[130px]">RX Number</th>
                <th className="whitespace-nowrap min-w-[160px]">Patient Details</th>
                <th className="whitespace-nowrap min-w-[150px]">Prescribing Doctor</th>
                <th className="whitespace-nowrap min-w-[110px]">Prescription Date</th>
                <th className="whitespace-nowrap min-w-[90px]">Medicines</th>
                <th className="whitespace-nowrap min-w-[100px]">Status</th>
                <th className="whitespace-nowrap min-w-[90px]">OCR Score</th>
                <th className="whitespace-nowrap text-right pr-4 min-w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="py-4 px-4"><div className="h-6 skeleton rounded-lg w-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-sm">No prescriptions found</p>
                    <p className="text-xs">Create a new prescription or upload via AI OCR scan</p>
                  </td>
                </tr>
              ) : (
                filtered.map(rx => (
                  <tr key={rx.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors">
                    <td className="whitespace-nowrap">
                      <span className="inline-flex items-center font-mono font-bold text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-lg border border-rose-200/80 dark:border-rose-900/60 shadow-xs whitespace-nowrap">
                        {rx.prescriptionNumber}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">
                          {rx.patient?.firstName} {rx.patient?.lastName}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">{rx.patient?.patientId} · {rx.patient?.phone}</p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{rx.doctor?.name}</p>
                        <p className="text-[11px] text-slate-400">{rx.doctor?.specialty}</p>
                      </div>
                    </td>
                    <td className="text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                      {rx.prescriptionDate}
                    </td>
                    <td className="whitespace-nowrap">
                      <span className="badge badge-blue font-bold">
                        {rx.items?.length || 0} Meds
                      </span>
                    </td>
                    <td className="whitespace-nowrap">{getStatusBadge(rx.status)}</td>
                    <td className="whitespace-nowrap">
                      {rx.ocrConfidence ? (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {rx.ocrConfidence}% AI
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Manual</span>
                      )}
                    </td>
                    <td className="text-right pr-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(rx)}
                          className="btn-secondary !text-[11px] !py-1 !px-2.5 flex items-center gap-1 whitespace-nowrap"
                        >
                          <Eye className="w-3 h-3" /> View & Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prescription Detail & Verification Drawer */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="card w-full max-w-3xl my-6 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up max-h-[92vh] flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Prescription {selectedRx.prescriptionNumber}
                    </h2>
                    {getStatusBadge(selectedRx.status)}
                  </div>
                  <p className="text-xs text-slate-400">
                    Prescribed on {selectedRx.prescriptionDate} · Clinical Verification & Inventory Check
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedRx(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-xl">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
              {/* Patient & Doctor Banner Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-500" /> Patient Information
                  </span>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedRx.patient?.firstName} {selectedRx.patient?.lastName}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Age: {selectedRx.patient?.age} · Gender: {selectedRx.patient?.gender} · Blood: {selectedRx.patient?.bloodGroup || 'N/A'}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 font-mono">Phone: {selectedRx.patient?.phone}</p>
                  {selectedRx.patient?.allergies && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md">
                      Allergies: {selectedRx.patient?.allergies}
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-500" /> Physician Information
                  </span>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedRx.doctor?.name}</p>
                  <p className="text-slate-500 dark:text-slate-400">{selectedRx.doctor?.specialty}</p>
                  <p className="text-slate-500 dark:text-slate-400 font-mono">Reg#: {selectedRx.doctor?.registrationNumber}</p>
                  <p className="text-slate-500 dark:text-slate-400">{selectedRx.doctor?.hospital}</p>
                </div>
              </div>

              {/* Diagnosis */}
              {selectedRx.diagnosis && (
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs">
                  <span className="font-bold text-blue-900 dark:text-blue-300">Clinical Diagnosis: </span>
                  <span className="text-blue-800 dark:text-blue-200">{selectedRx.diagnosis}</span>
                </div>
              )}

              {/* Prescribed Items & Live Stock Availability (Step 6 of Plan) */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Prescribed Medications ({selectedRx.items?.length || 0})</span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Inventory Availability Synced
                  </span>
                </h3>

                <div className="space-y-2">
                  {selectedRx.items?.map((item, idx) => {
                    const check = availability.find(a => a.medicineId === item.medicine?.id)
                    const isSufficient = check ? check.sufficient : true
                    const availableQty = check ? check.available : '...'

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border transition-all text-xs ${
                          isSufficient
                            ? 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800'
                            : 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-800/60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 dark:text-white text-sm">
                                {item.medicine?.name}
                              </p>
                              <span className="badge badge-gray text-[10px]">{item.medicine?.unit}</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                              Dosage: <strong className="text-slate-700 dark:text-slate-200">{item.dosage}</strong> · Frequency: {item.frequency} · Duration: {item.duration}
                            </p>
                            {item.instructions && (
                              <p className="text-blue-600 dark:text-blue-400 text-[11px] mt-0.5 italic">
                                "{item.instructions}"
                              </p>
                            )}
                          </div>

                          {/* Availability Badge */}
                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Prescribed</p>
                              <p className="font-black text-slate-900 dark:text-white">{item.quantity} units</p>
                            </div>

                            <div className="text-right pl-3 border-l border-slate-200 dark:border-slate-700">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Stock Level</p>
                              <p className={`font-black ${isSufficient ? 'text-emerald-600' : 'text-red-600'}`}>
                                {availableQty} avail
                              </p>
                            </div>

                            <div className="ml-1">
                              {isSufficient ? (
                                <span className="badge badge-green flex items-center gap-1 text-[10px]">
                                  <Check className="w-3 h-3" /> Available
                                </span>
                              ) : (
                                <span className="badge badge-red flex items-center gap-1 text-[10px]">
                                  <AlertTriangle className="w-3 h-3" /> Shortage
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Rejection input box */}
              {showRejectBox && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 space-y-2 text-xs animate-fade-in">
                  <label className="block font-bold text-red-900 dark:text-red-300">
                    Reason for Rejection *
                  </label>
                  <textarea
                    rows={2}
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Provide specific medical or verification reason (e.g. illegible dosage, contraindicated drug interaction)..."
                    className="input text-xs w-full resize-none"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowRejectBox(false)}
                      className="btn-secondary !text-xs !py-1 !px-3"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(selectedRx.id)}
                      disabled={actionLoading}
                      className="btn-danger !text-xs !py-1 !px-3"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedRx(null)}
                className="btn-secondary !text-xs !py-2 !px-4"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {/* Pending / Under Review -> Can Approve or Reject */}
                {(selectedRx.status === 'PENDING' || selectedRx.status === 'UNDER_REVIEW') && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowRejectBox(true)}
                      disabled={actionLoading}
                      className="btn-secondary !text-xs !py-2 !px-3.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedRx.id)}
                      disabled={actionLoading}
                      className="btn-primary !text-xs !py-2 !px-4 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Prescription
                    </button>
                  </>
                )}

                {/* Approved -> Can Dispense & Bill via POS */}
                {selectedRx.status === 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => handleDispense(selectedRx.id)}
                    disabled={actionLoading}
                    className="btn-primary !text-xs !py-2 !px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2"
                  >
                    <Receipt className="w-4 h-4" />
                    Dispense & Generate POS Bill
                  </button>
                )}

                {/* Dispensed status indicator */}
                {selectedRx.status === 'DISPENSED' && (
                  <span className="text-xs font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800/60 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Dispensed & Stock Deducted
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <PrescriptionForm
        isOpen={showFormModal}
        onClose={() => { setShowFormModal(false); setOcrDraftData(null); }}
        onSuccess={fetchData}
        initialData={ocrDraftData}
      />

      {/* OCR Modal */}
      <OCRUpload
        isOpen={showOcrModal}
        onClose={() => setShowOcrModal(false)}
        onApplyExtracted={handleApplyOcrData}
      />
    </div>
  )
}
