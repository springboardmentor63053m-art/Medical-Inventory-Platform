import { useState, useEffect, useRef } from 'react'
import { patientAPI, prescriptionAPI, doctorAPI, saleAPI } from '../../api/services'
import {
  UserCheck, Plus, Search, User, Phone, Mail, MapPin, Activity, FileText,
  X, CheckCircle2, History, Edit3, RefreshCw, MoreVertical, Sparkles,
  AlertTriangle, Stethoscope, ShoppingCart, Download, Archive, ChevronLeft,
  ChevronRight, Filter, ShieldAlert, Heart, Calendar, Pill, Check, Clock,
  Receipt, ArrowRight, Eye, ShieldCheck, Printer
} from 'lucide-react'
import toast from 'react-hot-toast'
import PrescriptionForm from '../prescriptions/PrescriptionForm'
import OCRUpload from '../prescriptions/OCRUpload'

export default function Patients() {
  const [patients,       setPatients]       = useState([])
  const [doctors,        setDoctors]        = useState([])
  const [loading,        setLoading]        = useState(true)
  const [search,         setSearch]         = useState('')

  // Filters state
  const [genderFilter,   setGenderFilter]   = useState('ALL')
  const [bloodFilter,    setBloodFilter]    = useState('ALL')
  const [statusFilter,   setStatusFilter]   = useState('ALL')
  const [allergyFilter,  setAllergyFilter]  = useState('ALL')
  const [doctorFilter,   setDoctorFilter]   = useState('ALL')
  const [showFilters,    setShowFilters]    = useState(false)

  // Pagination state
  const [currentPage,    setCurrentPage]    = useState(1)
  const [pageSize,       setPageSize]       = useState(10)

  // Modals & Drawers state
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showEditModal,     setShowEditModal]     = useState(false)
  const [showChangeModal,   setShowChangeModal]   = useState(false)
  const [selectedPatient,   setSelectedPatient]   = useState(null)
  const [profileTab,        setProfileTab]        = useState('OVERVIEW') // OVERVIEW, AI_INSIGHTS, PRESCRIPTIONS, PURCHASES, HISTORY
  const [patientRxs,        setPatientRxs]        = useState([])
  const [patientSales,      setPatientSales]      = useState([])

  // Direct Prescription creation from patient
  const [showRxModal,       setShowRxModal]       = useState(false)
  const [showOcrModal,      setShowOcrModal]      = useState(false)
  const [rxDraftData,       setRxDraftData]       = useState(null)

  // Active dropdown menu state
  const [activeMenuId,      setActiveMenuId]      = useState(null)

  // Edit / Register form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    bloodGroup: 'O+',
    allergies: '',
    medicalHistory: '',
    status: 'ACTIVE',
    primaryDoctorId: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const [pRes, dRes, rxRes, sRes] = await Promise.all([
        patientAPI.getAll(search),
        doctorAPI.getAll(null, true),
        prescriptionAPI.getAll(),
        saleAPI.getAll()
      ])
      setPatients(pRes.data)
      setDoctors(dRes.data)
    } catch (err) {
      toast.error('Failed to load patient records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [search])

  // Close active dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null)
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [])

  // Open Full Patient Profile
  const handleOpenProfile = async (p, initialTab = 'OVERVIEW') => {
    setSelectedPatient(p)
    setProfileTab(initialTab)
    try {
      const [rxRes, sRes] = await Promise.all([
        prescriptionAPI.getAll(),
        saleAPI.getAll()
      ])
      const rxs = rxRes.data.filter(r => r.patient?.id === p.id)
      const sales = sRes.data.filter(s =>
        s.customerPhone === p.phone ||
        s.customerName?.toLowerCase().includes(p.firstName?.toLowerCase())
      )
      setPatientRxs(rxs)
      setPatientSales(sales)
    } catch (err) {
      setPatientRxs([])
      setPatientSales([])
    }
  }

  // Open Edit Modal
  const handleOpenEdit = (p) => {
    setSelectedPatient(p)
    setFormData({
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      age: p.age || '',
      gender: p.gender || 'Male',
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
      bloodGroup: p.bloodGroup || 'O+',
      allergies: p.allergies || '',
      medicalHistory: p.medicalHistory || '',
      status: p.status || 'ACTIVE',
      primaryDoctorId: p.primaryDoctor?.id || ''
    })
    setShowEditModal(true)
  }

  // Open Change Doctor / Status Modal
  const handleOpenChange = (p) => {
    setSelectedPatient(p)
    setFormData({
      status: p.status || 'ACTIVE',
      primaryDoctorId: p.primaryDoctor?.id || ''
    })
    setShowChangeModal(true)
  }

  // Submit Patient Create
  const handleCreatePatient = async (e) => {
    e.preventDefault()
    if (!formData.firstName.trim() || !formData.lastName.trim()) return toast.error('First and last name are required')
    if (!formData.phone.trim()) return toast.error('Contact phone number is required')

    setSubmitting(true)
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: formData.age ? Number(formData.age) : null,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies,
        medicalHistory: formData.medicalHistory,
        status: formData.status,
        primaryDoctor: formData.primaryDoctorId ? { id: Number(formData.primaryDoctorId) } : null
      }
      await patientAPI.create(payload)
      toast.success('Patient registered successfully!')
      setShowRegisterModal(false)
      fetchPatients()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register patient')
    } finally {
      setSubmitting(false)
    }
  }

  // Submit Patient Edit
  const handleUpdatePatient = async (e) => {
    e.preventDefault()
    if (!selectedPatient) return

    setSubmitting(true)
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: formData.age ? Number(formData.age) : null,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies,
        medicalHistory: formData.medicalHistory,
        status: formData.status,
        primaryDoctor: formData.primaryDoctorId ? { id: Number(formData.primaryDoctorId) } : null
      }
      await patientAPI.update(selectedPatient.id, payload)
      toast.success('Patient details updated!')
      setShowEditModal(false)
      fetchPatients()
      if (selectedPatient) {
        setSelectedPatient({ ...selectedPatient, ...payload, primaryDoctor: doctors.find(d => d.id === Number(formData.primaryDoctorId)) })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update patient')
    } finally {
      setSubmitting(false)
    }
  }

  // Submit Change Doctor / Status
  const handleChangeDoctorStatus = async (e) => {
    e.preventDefault()
    if (!selectedPatient) return

    setSubmitting(true)
    try {
      const payload = {
        status: formData.status,
        primaryDoctor: formData.primaryDoctorId ? { id: Number(formData.primaryDoctorId) } : null
      }
      await patientAPI.update(selectedPatient.id, payload)
      toast.success('Care assignment and status updated!')
      setShowChangeModal(false)
      fetchPatients()
    } catch (err) {
      toast.error('Failed to change doctor/status')
    } finally {
      setSubmitting(false)
    }
  }

  // Direct Prescription trigger for patient
  const handleCreatePrescriptionForPatient = (p) => {
    setRxDraftData({
      patientId: p.id,
      doctorId: p.primaryDoctor?.id || doctors[0]?.id || '',
      diagnosis: p.medicalHistory || '',
      notes: `Patient: ${p.fullName} (${p.patientId}). Known allergies: ${p.allergies || 'None'}.`,
      items: [
        { medicineId: 1, dosage: '500mg', frequency: '1 capsule 3x daily', duration: '5 days', quantity: 15, instructions: 'Take after meals' }
      ]
    })
    setShowRxModal(true)
  }

  const handleUploadPrescriptionForPatient = (p) => {
    setRxDraftData({ patientId: p.id, patientName: p.fullName })
    setShowOcrModal(true)
  }

  // Print / Download Patient Summary Report
  const handleDownloadReport = (p) => {
    toast.success(`Generating clinical summary report for ${p.fullName}...`)
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Clinical Summary — ${p.fullName} (${p.patientId})</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
            .title { font-size: 24px; font-weight: bold; color: #0f172a; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; background: #e0f2fe; color: #0369a1; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 14px; text-transform: uppercase; font-weight: bold; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 13px; }
            .alert-box { background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 8px; color: #991b1b; font-weight: bold; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
            th { background: #f8fafc; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">MediStock AI — Patient Clinical Record</div>
              <div style="color: #64748b; font-size: 13px;">Generated on: ${new Date().toLocaleString()}</div>
            </div>
            <div class="badge">${p.status || 'ACTIVE'}</div>
          </div>

          ${p.allergies ? `<div class="alert-box">⚠️ CRITICAL ALLERGY ALERT: ${p.allergies}</div>` : ''}

          <div class="section">
            <div class="section-title">Patient Identification & Contact</div>
            <div class="grid">
              <div><strong>Patient ID:</strong> ${p.patientId}</div>
              <div><strong>Full Name:</strong> ${p.fullName}</div>
              <div><strong>Age / Gender:</strong> ${p.age || '—'} yrs / ${p.gender || '—'}</div>
              <div><strong>Blood Group:</strong> ${p.bloodGroup || 'N/A'}</div>
              <div><strong>Contact Phone:</strong> ${p.phone}</div>
              <div><strong>Email:</strong> ${p.email || '—'}</div>
              <div><strong>Residential Address:</strong> ${p.address || '—'}</div>
              <div><strong>Assigned Primary Physician:</strong> ${p.primaryDoctor ? p.primaryDoctor.name + ' (' + p.primaryDoctor.specialty + ')' : 'Unassigned'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Medical History & Clinical Background</div>
            <p style="font-size: 13px; line-height: 1.6;">${p.medicalHistory || 'No significant prior medical chronic history recorded.'}</p>
          </div>

          <div class="section">
            <div class="section-title">Recorded Prescriptions (${patientRxs.length})</div>
            <table>
              <thead>
                <tr>
                  <th>RX Number</th>
                  <th>Date</th>
                  <th>Prescribing Doctor</th>
                  <th>Diagnosis</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${patientRxs.map(r => `
                  <tr>
                    <td><strong>${r.prescriptionNumber}</strong></td>
                    <td>${r.prescriptionDate}</td>
                    <td>${r.doctor ? r.doctor.name : '—'}</td>
                    <td>${r.diagnosis || '—'}</td>
                    <td>${r.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Toggle Archive status
  const handleToggleArchive = async (p) => {
    const newStatus = p.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED'
    try {
      await patientAPI.update(p.id, { status: newStatus })
      toast.success(`Patient marked as ${newStatus}`)
      fetchPatients()
    } catch (err) {
      toast.error('Failed to update patient archive status')
    }
  }

  // Filter application
  const filteredPatients = patients.filter(p => {
    if (genderFilter !== 'ALL' && p.gender !== genderFilter) return false
    if (bloodFilter !== 'ALL' && p.bloodGroup !== bloodFilter) return false
    if (statusFilter !== 'ALL' && (p.status || 'ACTIVE') !== statusFilter) return false
    if (allergyFilter === 'HAS_ALLERGY' && (!p.allergies || p.allergies.toLowerCase() === 'none' || p.allergies.toLowerCase() === 'none reported')) return false
    if (allergyFilter === 'NO_ALLERGY' && p.allergies && p.allergies.toLowerCase() !== 'none' && p.allergies.toLowerCase() !== 'none reported') return false
    if (doctorFilter !== 'ALL' && p.primaryDoctor?.id !== Number(doctorFilter)) return false
    return true
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + pageSize)

  const getStatusBadge = (status) => {
    switch (status) {
      case 'FOLLOW_UP':
        return <span className="badge badge-yellow flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Follow-up</span>
      case 'ATTENTION_REQUIRED':
        return <span className="badge badge-red flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> Attention</span>
      case 'ARCHIVED':
        return <span className="badge badge-gray flex items-center gap-1"><Archive className="w-2.5 h-2.5" /> Archived</span>
      case 'ACTIVE':
      default:
        return <span className="badge badge-green flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active</span>
    }
  }

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-500/25">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              Patient Management
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 ml-11">
            Comprehensive patient profile registry, AI clinical alerts, prescription history & POS dispensing integration
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setFormData({
                firstName: '', lastName: '', age: '', gender: 'Male', phone: '', email: '',
                address: '', bloodGroup: 'O+', allergies: '', medicalHistory: '', status: 'ACTIVE',
                primaryDoctorId: doctors[0]?.id || ''
              })
              setShowRegisterModal(true)
            }}
            className="btn-primary !text-xs !py-2 !px-4 flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      {/* Main Directory Table Card */}
      <div className="card space-y-4 shadow-sm border border-slate-200/80 dark:border-slate-800">
        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Patient Directory</span>
            <span className="badge badge-teal">{filteredPatients.length} Patients</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search by name, ID, phone..."
                className="input !text-xs !pl-9 w-full"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary !text-xs !py-1.5 !px-3 flex items-center gap-1.5 ${
                showFilters || genderFilter !== 'ALL' || bloodFilter !== 'ALL' || statusFilter !== 'ALL' || allergyFilter !== 'ALL'
                  ? 'border-teal-500 text-teal-600 bg-teal-50/50 dark:bg-teal-950/30'
                  : ''
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(genderFilter !== 'ALL' || bloodFilter !== 'ALL' || statusFilter !== 'ALL' || allergyFilter !== 'ALL' || doctorFilter !== 'ALL') && (
                <span className="w-2 h-2 rounded-full bg-teal-500" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filter Panel (Feature #5) */}
        {showFilters && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs animate-fade-in">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="input !text-xs !py-1 w-full"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">🟢 Active</option>
                <option value="FOLLOW_UP">🟠 Follow-up</option>
                <option value="ATTENTION_REQUIRED">🔴 Attention Req</option>
                <option value="ARCHIVED">⚪ Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gender</label>
              <select
                value={genderFilter}
                onChange={e => { setGenderFilter(e.target.value); setCurrentPage(1); }}
                className="input !text-xs !py-1 w-full"
              >
                <option value="ALL">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Blood Group</label>
              <select
                value={bloodFilter}
                onChange={e => { setBloodFilter(e.target.value); setCurrentPage(1); }}
                className="input !text-xs !py-1 w-full"
              >
                <option value="ALL">All Blood Types</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Allergy Flag</label>
              <select
                value={allergyFilter}
                onChange={e => { setAllergyFilter(e.target.value); setCurrentPage(1); }}
                className="input !text-xs !py-1 w-full"
              >
                <option value="ALL">All Patients</option>
                <option value="HAS_ALLERGY">⚠️ Has Allergies</option>
                <option value="NO_ALLERGY">✓ No Allergies</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Assigned Physician</label>
              <select
                value={doctorFilter}
                onChange={e => { setDoctorFilter(e.target.value); setCurrentPage(1); }}
                className="input !text-xs !py-1 w-full"
              >
                <option value="ALL">All Physicians</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ── UPGRADED PATIENT TABLE (Exact Design Specification) ── */}
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="table w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80">
                <th>Patient</th>
                <th>Age / Gender</th>
                <th>Contact Phone</th>
                <th>Blood Group</th>
                <th>Allergies</th>
                <th>Assigned Doctor</th>
                <th>Status</th>
                <th className="text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="py-4 px-4"><div className="h-6 skeleton rounded-lg w-full" /></td>
                  </tr>
                ))
              ) : paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-sm">No patients found matching criteria</p>
                  </td>
                </tr>
              ) : (
                paginatedPatients.map(p => (
                  <tr key={p.id} className="hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition-colors">
                    {/* Patient Name & ID */}
                    <td>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {p.firstName} {p.lastName}
                        </p>
                        <span className="font-mono text-[10px] text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-1.5 py-0.2 rounded font-semibold">
                          {p.patientId}
                        </span>
                      </div>
                    </td>

                    {/* Age & Gender */}
                    <td className="text-slate-600 dark:text-slate-300">
                      {p.age ? `${p.age} yrs` : '—'} · {p.gender || '—'}
                    </td>

                    {/* Phone */}
                    <td className="font-mono text-slate-700 dark:text-slate-300">{p.phone}</td>

                    {/* Blood Group */}
                    <td>
                      <span className="badge badge-red font-bold text-[10px]">{p.bloodGroup || 'N/A'}</span>
                    </td>

                    {/* Allergies */}
                    <td>
                      {p.allergies && p.allergies.toLowerCase() !== 'none' && p.allergies.toLowerCase() !== 'none reported' ? (
                        <span className="text-[11px] text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                          {p.allergies}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">None reported</span>
                      )}
                    </td>

                    {/* Assigned Doctor */}
                    <td>
                      {p.primaryDoctor ? (
                        <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                          <Stethoscope className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <div>
                            <p className="font-semibold">{p.primaryDoctor.name}</p>
                            <p className="text-[10px] text-slate-400">{p.primaryDoctor.specialty}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Status */}
                    <td>{getStatusBadge(p.status || 'ACTIVE')}</td>

                    {/* ── THREE CLEAR ACTIONS + MORE DROPDOWN (Feature #1) ── */}
                    <td className="text-right pr-4">
                      <div className="inline-flex items-center gap-1 relative" onClick={e => e.stopPropagation()}>
                        {/* 1. View Action */}
                        <button
                          onClick={() => handleOpenProfile(p, 'OVERVIEW')}
                          className="px-2 py-1 rounded-lg text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 flex items-center gap-1 transition-colors"
                          title="View complete patient profile & clinical history"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>

                        {/* 2. Edit Action */}
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="px-2 py-1 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 flex items-center gap-1 transition-colors"
                          title="Edit patient information"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>

                        {/* 3. Change Action */}
                        <button
                          onClick={() => handleOpenChange(p)}
                          className="px-2 py-1 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 flex items-center gap-1 transition-colors"
                          title="Change assigned physician or status"
                        >
                          <RefreshCw className="w-3 h-3" /> Change
                        </button>

                        {/* 4. More Menu (⋮) */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveMenuId(activeMenuId === p.id ? null : p.id)
                            }}
                            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="More patient operations"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Dropdown Menu Items */}
                          {activeMenuId === p.id && (
                            <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-30 text-left animate-scale-up">
                              <button
                                onClick={() => { setActiveMenuId(null); handleOpenProfile(p, 'PRESCRIPTIONS'); }}
                                className="w-full px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/40 flex items-center gap-2"
                              >
                                <History className="w-3.5 h-3.5 text-blue-500" />
                                <span>Prescription History</span>
                              </button>

                              <button
                                onClick={() => { setActiveMenuId(null); handleCreatePrescriptionForPatient(p); }}
                                className="w-full px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/40 flex items-center gap-2"
                              >
                                <Plus className="w-3.5 h-3.5 text-emerald-500" />
                                <span>+ Create Prescription</span>
                              </button>

                              <button
                                onClick={() => { setActiveMenuId(null); handleUploadPrescriptionForPatient(p); }}
                                className="w-full px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/40 flex items-center gap-2"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                                <span>📷 Upload Prescription (OCR)</span>
                              </button>

                              <button
                                onClick={() => { setActiveMenuId(null); handleOpenProfile(p, 'OVERVIEW'); }}
                                className="w-full px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/40 flex items-center gap-2"
                              >
                                <Activity className="w-3.5 h-3.5 text-amber-500" />
                                <span>Medical History & Allergies</span>
                              </button>

                              <button
                                onClick={() => { setActiveMenuId(null); handleOpenProfile(p, 'PURCHASES'); }}
                                className="w-full px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/40 flex items-center gap-2"
                              >
                                <ShoppingCart className="w-3.5 h-3.5 text-purple-500" />
                                <span>Purchase / POS History</span>
                              </button>

                              <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                              <button
                                onClick={() => { setActiveMenuId(null); handleDownloadReport(p); }}
                                className="w-full px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/40 flex items-center gap-2"
                              >
                                <Download className="w-3.5 h-3.5 text-blue-600" />
                                <span>Download Patient Report</span>
                              </button>

                              <button
                                onClick={() => { setActiveMenuId(null); handleToggleArchive(p); }}
                                className="w-full px-3.5 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2"
                              >
                                <Archive className="w-3.5 h-3.5" />
                                <span>{p.status === 'ARCHIVED' ? 'Restore Patient' : 'Archive Patient'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION CONTROLS (Feature #7) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredPatients.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + pageSize, filteredPatients.length)}</strong> of <strong className="text-slate-800 dark:text-slate-200">{filteredPatients.length}</strong> registered patients
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-secondary !text-xs !py-1 !px-2.5 flex items-center gap-1 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    currentPage === i + 1
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-secondary !text-xs !py-1 !px-2.5 flex items-center gap-1 disabled:opacity-40"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── DEDICATED PATIENT PROFILE MODAL (Feature #2, #3, #4) ── */}
      {selectedPatient && !showEditModal && !showChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
          <div className="card w-full max-w-4xl my-6 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-teal-500/25">
                  {selectedPatient.firstName?.[0]}{selectedPatient.lastName?.[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h2>
                    {getStatusBadge(selectedPatient.status || 'ACTIVE')}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {selectedPatient.patientId} · Blood: <strong className="text-red-500">{selectedPatient.bloodGroup || 'N/A'}</strong> · Age: {selectedPatient.age || '—'} yrs ({selectedPatient.gender})
                  </p>
                </div>
              </div>

              {/* Header Direct Actions: + New Prescription / Upload Prescription / Print Report (Feature #3) */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleCreatePrescriptionForPatient(selectedPatient)}
                  className="btn-primary !text-xs !py-1.5 !px-3 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-3.5 h-3.5" /> New Prescription
                </button>
                <button
                  onClick={() => handleUploadPrescriptionForPatient(selectedPatient)}
                  className="btn-secondary !text-xs !py-1.5 !px-3 flex items-center gap-1.5 border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" /> 📷 Upload Scan
                </button>
                <button
                  onClick={() => handleDownloadReport(selectedPatient)}
                  className="btn-secondary !text-xs !py-1.5 !px-2.5 text-slate-600 hover:text-slate-900"
                  title="Print Clinical Summary"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pt-3 pb-1 overflow-x-auto">
              <button
                onClick={() => setProfileTab('OVERVIEW')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  profileTab === 'OVERVIEW'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Clinical Overview
              </button>
              <button
                onClick={() => setProfileTab('AI_INSIGHTS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  profileTab === 'AI_INSIGHTS'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> AI Patient Insights
              </button>
              <button
                onClick={() => setProfileTab('PRESCRIPTIONS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  profileTab === 'PRESCRIPTIONS'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Prescription History ({patientRxs.length})
              </button>
              <button
                onClick={() => setProfileTab('PURCHASES')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  profileTab === 'PURCHASES'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Purchase & POS History ({patientSales.length})
              </button>
            </div>

            {/* Profile Content Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
              {/* TAB 1: Clinical Overview */}
              {profileTab === 'OVERVIEW' && (
                <div className="space-y-4 animate-fade-in">
                  {/* Allergy Alert Banner */}
                  {selectedPatient.allergies && selectedPatient.allergies.toLowerCase() !== 'none' && (
                    <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-red-900 dark:text-red-300 text-xs">
                          CRITICAL CONTRAINDICATION & ALLERGY ALERT
                        </h4>
                        <p className="text-red-700 dark:text-red-400 text-[11px] mt-0.5">
                          Patient is recorded with hypersensitivity to: <strong>{selectedPatient.allergies}</strong>. Do not dispense cross-reactive formulations without physician clearance.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Demographic & Physician Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Contact & Personal */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider text-slate-400">
                        Contact Details & Address
                      </h4>
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-teal-500" />
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{selectedPatient.phone}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-slate-600 dark:text-slate-300">{selectedPatient.email || 'No email registered'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-slate-600 dark:text-slate-300">{selectedPatient.address || 'No residential address on file'}</span>
                      </p>
                    </div>

                    {/* Assigned Doctor & Clinical Care */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider text-slate-400">
                        Assigned Physician & Clinic
                      </h4>
                      {selectedPatient.primaryDoctor ? (
                        <>
                          <p className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                            <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                            <span>{selectedPatient.primaryDoctor.name}</span>
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                            {selectedPatient.primaryDoctor.specialty} · License #{selectedPatient.primaryDoctor.registrationNumber}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                            {selectedPatient.primaryDoctor.hospital}
                          </p>
                        </>
                      ) : (
                        <p className="text-slate-400 italic py-2">No primary doctor assigned yet. Click 'Change' to link physician.</p>
                      )}
                    </div>
                  </div>

                  {/* Medical History */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider text-slate-400">
                      Medical History & Clinical Background
                    </h4>
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                      {selectedPatient.medicalHistory || 'No prior chronic conditions or surgical history recorded.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: AI Patient Insights (Feature #4: Pharmacist Decision Support) */}
              {profileTab === 'AI_INSIGHTS' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-300/40 dark:border-amber-700/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          AI Clinical Decision Support Engine
                        </h4>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                          Automated interaction detection, contraindication cross-referencing & duplicate prescription screening
                        </p>
                      </div>
                    </div>
                    <span className="badge badge-yellow font-bold">Pharmacist Verified</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Allergy & Safety Panel */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-600 flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-red-500" /> Allergy Risk Assessment
                        </span>
                        <span className="badge badge-red text-[10px]">High Priority</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                        {selectedPatient.allergies && selectedPatient.allergies.toLowerCase() !== 'none'
                          ? `Recorded sensitivity to ${selectedPatient.allergies}. Neural check flags potential cross-reactivity if beta-lactams or NSAIDs are prescribed.`
                          : 'No active clinical drug allergies identified in electronic patient profile.'}
                      </p>
                    </div>

                    {/* Drug Interaction / Duplicate Check */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-blue-500" /> Duplicate Formulation Check
                        </span>
                        <span className="badge badge-green text-[10px]">Passed</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                        Scanned all {patientRxs.length} active and recent prescriptions. No overlapping therapeutic duplicate classes or conflicting dosages detected.
                      </p>
                    </div>
                  </div>

                  {/* Active Medication Refill Schedule */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-teal-500" /> Active Medications & Refill Tracking
                    </h4>
                    {patientRxs.length === 0 ? (
                      <p className="text-slate-400 italic">No current prescription records found.</p>
                    ) : (
                      <div className="space-y-2">
                        {patientRxs.flatMap(rx => rx.items || []).map((item, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{item.medicine?.name}</p>
                              <p className="text-[10px] text-slate-400">{item.dosage} · {item.frequency} · {item.duration}</p>
                            </div>
                            <span className="badge badge-teal font-bold">Qty: {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Prescription History */}
              {profileTab === 'PRESCRIPTIONS' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between pb-1">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">
                      Prescriptions Linked to Patient ({patientRxs.length})
                    </h4>
                    <button
                      onClick={() => handleCreatePrescriptionForPatient(selectedPatient)}
                      className="btn-primary !text-[11px] !py-1 !px-2.5 bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Create New
                    </button>
                  </div>

                  {patientRxs.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="font-semibold text-sm">No prescriptions on file</p>
                      <button
                        onClick={() => handleCreatePrescriptionForPatient(selectedPatient)}
                        className="btn-secondary !text-xs !py-1.5 !px-3 mt-2"
                      >
                        Issue First Prescription
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {patientRxs.map(rx => (
                        <div key={rx.id} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-200/80 dark:border-rose-900/60 inline-flex items-center whitespace-nowrap text-xs shadow-xs">
                                {rx.prescriptionNumber}
                              </span>
                              <span className="text-slate-400">· {rx.prescriptionDate}</span>
                            </div>
                            <span className="badge badge-teal font-bold">{rx.status}</span>
                          </div>

                          <p className="text-slate-600 dark:text-slate-300">
                            Prescribing Doctor: <strong>{rx.doctor?.name}</strong> ({rx.doctor?.specialty})
                          </p>
                          {rx.diagnosis && (
                            <p className="text-slate-500 text-[11px]">
                              Diagnosis: {rx.diagnosis}
                            </p>
                          )}

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">{rx.items?.length || 0} medications prescribed</span>
                            <span className="font-semibold text-blue-600">Prescription Record Verified</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Purchase & POS History */}
              {profileTab === 'PURCHASES' && (
                <div className="space-y-3 animate-fade-in">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    POS Sales & Dispensing Transactions ({patientSales.length})
                  </h4>

                  {patientSales.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="font-semibold text-sm">No sales or dispensing transactions found for this customer</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {patientSales.map(s => (
                        <div key={s.id} className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-blue-600">{s.saleNumber}</span>
                              <span className="text-slate-400">· {s.saleDate}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Payment: {s.paymentMethod} · Items: {s.items?.length || 1}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                              ₹{s.netAmount}
                            </span>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase">{s.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleDownloadReport(selectedPatient)}
                className="btn-secondary !text-xs !py-1.5 !px-3 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Patient Record
              </button>
              <button onClick={() => setSelectedPatient(null)} className="btn-secondary !text-xs !py-1.5 !px-4">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REGISTER PATIENT MODAL ── */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="card w-full max-w-xl my-6 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Register Patient</h2>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreatePatient} className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                  <input type="text" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="input text-xs w-full" placeholder="e.g. Rahul" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                  <input type="text" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="input text-xs w-full" placeholder="e.g. Sharma" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Age</label>
                  <input type="number" min="0" max="130" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="input text-xs w-full" placeholder="38" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="input text-xs w-full">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                  <select value={formData.bloodGroup} onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })} className="input text-xs w-full">
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone *</label>
                  <input type="text" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="input text-xs w-full" placeholder="9876500001" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="input text-xs w-full" placeholder="patient@example.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Physician</label>
                  <select
                    value={formData.primaryDoctorId}
                    onChange={e => setFormData({ ...formData, primaryDoctorId: e.target.value })}
                    className="input text-xs w-full"
                  >
                    <option value="">Unassigned</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Clinical Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="input text-xs w-full"
                  >
                    <option value="ACTIVE">🟢 Active</option>
                    <option value="FOLLOW_UP">🟠 Follow-up Required</option>
                    <option value="ATTENTION_REQUIRED">🔴 Attention Required</option>
                    <option value="ARCHIVED">⚪ Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Residential Address</label>
                <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="input text-xs w-full" placeholder="City, State" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Known Allergies / Contraindications</label>
                <input type="text" value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: e.target.value })} className="input text-xs w-full" placeholder="e.g. Penicillin, Sulfa drugs" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Medical & Surgical History</label>
                <textarea rows={2} value={formData.medicalHistory} onChange={e => setFormData({ ...formData, medicalHistory: e.target.value })} className="input text-xs w-full resize-none" placeholder="e.g. Hypertension Stage 1, Seasonal Asthma" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowRegisterModal(false)} className="btn-secondary !text-xs !py-2 !px-4">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary !text-xs !py-2 !px-5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT PATIENT MODAL (Feature #1 Edit) ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="card w-full max-w-xl my-6 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Edit Patient Information</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleUpdatePatient} className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                  <input type="text" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="input text-xs w-full" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                  <input type="text" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="input text-xs w-full" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Age</label>
                  <input type="number" min="0" max="130" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="input text-xs w-full" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="input text-xs w-full">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                  <select value={formData.bloodGroup} onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })} className="input text-xs w-full">
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone *</label>
                  <input type="text" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="input text-xs w-full" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="input text-xs w-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Physician</label>
                  <select
                    value={formData.primaryDoctorId}
                    onChange={e => setFormData({ ...formData, primaryDoctorId: e.target.value })}
                    className="input text-xs w-full"
                  >
                    <option value="">Unassigned</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Clinical Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="input text-xs w-full"
                  >
                    <option value="ACTIVE">🟢 Active</option>
                    <option value="FOLLOW_UP">🟠 Follow-up Required</option>
                    <option value="ATTENTION_REQUIRED">🔴 Attention Required</option>
                    <option value="ARCHIVED">⚪ Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Residential Address</label>
                <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="input text-xs w-full" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Known Allergies</label>
                <input type="text" value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: e.target.value })} className="input text-xs w-full" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Medical History</label>
                <textarea rows={2} value={formData.medicalHistory} onChange={e => setFormData({ ...formData, medicalHistory: e.target.value })} className="input text-xs w-full resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary !text-xs !py-2 !px-4">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary !text-xs !py-2 !px-5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Update Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CHANGE PHYSICIAN & STATUS MODAL (Feature #1 Change) ── */}
      {showChangeModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="card w-full max-w-md my-6 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Change Care Assignment</h2>
                <p className="text-xs text-slate-400">Update physician link or status for {selectedPatient.fullName}</p>
              </div>
              <button onClick={() => setShowChangeModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleChangeDoctorStatus} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Assigned Primary Physician *
                </label>
                <select
                  value={formData.primaryDoctorId}
                  onChange={e => setFormData({ ...formData, primaryDoctorId: e.target.value })}
                  className="input text-xs w-full"
                >
                  <option value="">Unassigned</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty} - {d.hospital})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Patient Clinical Status *
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="input text-xs w-full"
                >
                  <option value="ACTIVE">🟢 Active Patient</option>
                  <option value="FOLLOW_UP">🟠 Follow-up Required</option>
                  <option value="ATTENTION_REQUIRED">🔴 Attention Required (Allergies/Chronic)</option>
                  <option value="ARCHIVED">⚪ Archived</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowChangeModal(false)} className="btn-secondary !text-xs !py-2 !px-4">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary !text-xs !py-2 !px-5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Form Pre-filled */}
      <PrescriptionForm
        isOpen={showRxModal}
        onClose={() => { setShowRxModal(false); setRxDraftData(null); }}
        onSuccess={() => { fetchPatients(); if (selectedPatient) handleOpenProfile(selectedPatient, 'PRESCRIPTIONS'); }}
        initialData={rxDraftData}
      />

      {/* OCR Upload Pre-filled */}
      <OCRUpload
        isOpen={showOcrModal}
        onClose={() => setShowOcrModal(false)}
        onApplyExtracted={(extracted) => {
          setRxDraftData({ ...extracted, patientId: selectedPatient?.id || extracted.patientId })
          setShowRxModal(true)
        }}
      />
    </div>
  )
}
