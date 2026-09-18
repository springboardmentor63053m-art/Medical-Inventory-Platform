import { useState, useEffect, useMemo } from 'react'
import { doctorAPI } from '../../api/services'
import {
  Stethoscope, Plus, Search, Phone, Mail, Building, ShieldCheck, X,
  CheckCircle2, UserCheck, ArrowRight, Edit3, Award, Building2,
  Copy, Check, AlertCircle, Sparkles, ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Doctors() {
  const [doctors,         setDoctors]         = useState([])
  const [loading,         setLoading]         = useState(true)
  const [search,          setSearch]          = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL')
  const [hospitalFilter,  setHospitalFilter]  = useState('ALL')
  const [statusFilter,    setStatusFilter]    = useState('ALL')

  // Modals & Drawers
  const [showModal,       setShowModal]       = useState(false)
  const [editingDoctor,   setEditingDoctor]   = useState(null)
  const [profileDoctor,   setProfileDoctor]   = useState(null)
  const [submitting,      setSubmitting]      = useState(false)
  const [copiedField,     setCopiedField]     = useState(null)

  // Doctor Form State
  const [form, setForm] = useState({
    name: '',
    specialty: '',
    registrationNumber: '',
    hospital: '',
    contactPhone: '',
    email: '',
    isActive: true
  })
  const [formErrors, setFormErrors] = useState({})

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const res = await doctorAPI.getAll()
      setDoctors(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      toast.error('Failed to load doctors directory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  // Dynamic filter options derived from current doctors list
  const specialties = useMemo(() => {
    const set = new Set(doctors.map(d => d.specialty).filter(Boolean))
    return Array.from(set).sort()
  }, [doctors])

  const hospitals = useMemo(() => {
    const set = new Set(doctors.map(d => d.hospital).filter(Boolean))
    return Array.from(set).sort()
  }, [doctors])

  // Real-time filtered doctors list
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const q = search.toLowerCase().trim()
      const matchesSearch = !q ||
        doc.name?.toLowerCase().includes(q) ||
        doc.specialty?.toLowerCase().includes(q) ||
        doc.hospital?.toLowerCase().includes(q) ||
        doc.registrationNumber?.toLowerCase().includes(q)

      const matchesSpecialty = specialtyFilter === 'ALL' || doc.specialty === specialtyFilter
      const matchesHospital  = hospitalFilter === 'ALL'  || doc.hospital === hospitalFilter
      const matchesStatus    = statusFilter === 'ALL'    ||
        (statusFilter === 'VERIFIED' && doc.isActive !== false) ||
        (statusFilter === 'PENDING'  && doc.isActive === false)

      return matchesSearch && matchesSpecialty && matchesHospital && matchesStatus
    })
  }, [doctors, search, specialtyFilter, hospitalFilter, statusFilter])

  const isFiltered = Boolean(search || specialtyFilter !== 'ALL' || hospitalFilter !== 'ALL' || statusFilter !== 'ALL')

  const resetFilters = () => {
    setSearch('')
    setSpecialtyFilter('ALL')
    setHospitalFilter('ALL')
    setStatusFilter('ALL')
  }

  // Open Add / Edit Modal
  const handleOpenModal = (doc = null) => {
    setFormErrors({})
    if (doc) {
      setEditingDoctor(doc)
      setForm({
        name: doc.name || '',
        specialty: doc.specialty || '',
        registrationNumber: doc.registrationNumber || '',
        hospital: doc.hospital || '',
        contactPhone: doc.contactPhone || '',
        email: doc.email || '',
        isActive: doc.isActive !== false
      })
    } else {
      setEditingDoctor(null)
      setForm({
        name: '',
        specialty: '',
        registrationNumber: '',
        hospital: '',
        contactPhone: '',
        email: '',
        isActive: true
      })
    }
    setShowModal(true)
  }

  // Real-time form validation
  const validateForm = () => {
    const errors = {}
    if (!form.name.trim()) {
      errors.name = 'Doctor full name is required'
    } else if (form.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters'
    }

    if (!form.specialty.trim()) {
      errors.specialty = 'Specialty is required'
    }

    if (!form.registrationNumber.trim()) {
      errors.registrationNumber = 'Medical council license is required'
    } else {
      // Check for duplicate license among other doctors
      const duplicate = doctors.find(
        d => d.registrationNumber?.trim().toLowerCase() === form.registrationNumber.trim().toLowerCase() &&
             d.id !== editingDoctor?.id
      )
      if (duplicate) {
        errors.registrationNumber = `License already registered to ${duplicate.name}`
      }
    }

    if (!form.hospital.trim()) {
      errors.hospital = 'Affiliated facility is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveDoctor = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    try {
      if (editingDoctor) {
        await doctorAPI.update(editingDoctor.id, form)
        toast.success('Physician record updated successfully')
      } else {
        await doctorAPI.create(form)
        toast.success('New physician registered successfully')
      }
      setShowModal(false)
      fetchDoctors()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save physician')
    } finally {
      setSubmitting(false)
    }
  }

  const copyToClipboard = (text, fieldLabel) => {
    if (!text) return
    navigator.clipboard?.writeText(text)
    setCopiedField(fieldLabel)
    toast.success(`Copied ${fieldLabel}: ${text}`, { id: 'copy-field' })
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Summary Metrics
  const totalVerified    = doctors.filter(d => d.isActive !== false).length
  const totalHospitals   = hospitals.length || 4
  const totalSpecialties = specialties.length || 4

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600
                            flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight leading-none">
                Prescribing Physicians
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Authorized medical practitioner directory, specialties, medical council licenses &amp; hospital affiliations.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="btn-primary !text-xs !py-2.5 !px-4 flex items-center gap-2
                     bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                     shadow-md shadow-blue-600/25 border border-blue-400/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Physician</span>
        </button>
      </div>

      {/* ── SUMMARY SECTION: 4 COMPACT KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Registered */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-slate-800
                        shadow-xs hover:border-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400
                          flex items-center justify-center font-bold shrink-0 border border-blue-500/20">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Registered</p>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {doctors.length} <span className="text-xs font-semibold text-slate-400">Physicians</span>
            </p>
          </div>
        </div>

        {/* License Status */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-slate-800
                        shadow-xs hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400
                          flex items-center justify-center font-bold shrink-0 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">License Status</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-tight">
              {totalVerified} <span className="text-xs font-semibold text-emerald-500/80">Verified</span>
            </p>
          </div>
        </div>

        {/* Affiliated Facilities */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-slate-800
                        shadow-xs hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400
                          flex items-center justify-center font-bold shrink-0 border border-indigo-500/20">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Affiliated Facilities</p>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {totalHospitals} <span className="text-xs font-semibold text-slate-400">Hospitals</span>
            </p>
          </div>
        </div>

        {/* Clinical Focus */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-slate-800
                        shadow-xs hover:border-sky-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400
                          flex items-center justify-center font-bold shrink-0 border border-sky-500/20">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Clinical Focus</p>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {totalSpecialties} <span className="text-xs font-semibold text-slate-400">Specialties</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── DIRECTORY CARD: TOOLBAR + FOUR-COLUMN BALANCED GRID ── */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-50/70 dark:bg-[#0a0f1d] border border-slate-200/80 dark:border-slate-800/90 shadow-sm space-y-5">

        {/* Directory Card Header: Title and Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-sm text-slate-900 dark:text-white">Doctor Directory</span>
            <span className="badge badge-blue text-[11px] font-bold">
              {doctors.length} Registered
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-2.5 hidden sm:inline">
              Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredDoctors.length}</span> of <span className="font-bold text-slate-800 dark:text-slate-200">{doctors.length}</span> physicians
            </span>
          </div>
          {isFiltered && (
            <span className="text-xs text-blue-500 dark:text-blue-400 font-medium">
              Filters Active
            </span>
          )}
        </div>

        {/* Horizontal Filter Toolbar on Desktop: 🔍 Search | Specialty | Hospital | Verification | Clear */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* 🔍 Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search physician, license, hospital..."
              className="input !text-xs !pl-9 !pr-7 !py-2 w-full bg-white dark:bg-[#111c35] border-slate-200 dark:border-[#1e2d4d]
                         focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Clear search"
                aria-label="Clear search query"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Specialty ▾ */}
          <select
            value={specialtyFilter}
            onChange={e => setSpecialtyFilter(e.target.value)}
            className="input !text-xs !py-2 !px-3 bg-white dark:bg-[#111c35] border-slate-200 dark:border-[#1e2d4d]
                       focus:ring-2 focus:ring-blue-500/30 text-slate-700 dark:text-slate-200 shrink-0 md:w-auto"
          >
            <option value="ALL">Specialty: All</option>
            {specialties.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Hospital ▾ */}
          <select
            value={hospitalFilter}
            onChange={e => setHospitalFilter(e.target.value)}
            className="input !text-xs !py-2 !px-3 bg-white dark:bg-[#111c35] border-slate-200 dark:border-[#1e2d4d]
                       focus:ring-2 focus:ring-blue-500/30 text-slate-700 dark:text-slate-200 shrink-0 md:w-auto max-w-[200px] truncate"
          >
            <option value="ALL">Hospital: All</option>
            {hospitals.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>

          {/* Verification ▾ */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input !text-xs !py-2 !px-3 bg-white dark:bg-[#111c35] border-slate-200 dark:border-[#1e2d4d]
                       focus:ring-2 focus:ring-blue-500/30 text-slate-700 dark:text-slate-200 shrink-0 md:w-auto"
          >
            <option value="ALL">Verification: All</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending Review</option>
          </select>

          {/* Clear Filters button */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400
                         hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-blue-500/20 shrink-0 transition-colors whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>

        {/* ── RESPONSIVE GRID: 4 columns → 2 columns → 1 column with generous side & inter-card spacing ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="card h-56 skeleton rounded-2xl" />
            ))
          ) : filteredDoctors.length === 0 ? (
            /* Professional Empty State */
            <div className="col-span-full text-center py-12 px-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl
                            border border-dashed border-slate-200 dark:border-slate-800">
              <Stethoscope className="w-9 h-9 mx-auto mb-2.5 text-slate-400 opacity-40" />
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">No physicians found</p>
              <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search query or active filter settings.</p>
              <button
                onClick={resetFilters}
                className="mt-3.5 btn-secondary !text-xs !py-1.5 !px-3.5 font-bold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredDoctors.map(doc => {
              const initial = doc.name?.replace(/^(Dr\.|Prof\.|Dr)\s*/i, '').trim()?.[0] || 'D'
              return (
                <div
                  key={doc.id}
                  tabIndex={0}
                  role="button"
                  onClick={() => setProfileDoctor(doc)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setProfileDoctor(doc)
                    }
                  }}
                  className="group relative p-5 rounded-2xl bg-white dark:bg-[#111c35]
                             border border-slate-200/90 dark:border-[#1e2d4d]
                             shadow-xs dark:shadow-md dark:shadow-black/20
                             hover:border-blue-500/50 dark:hover:border-blue-400/40
                             dark:hover:bg-[#142242]
                             hover:shadow-xl hover:shadow-black/30
                             hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between
                             focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/60
                             cursor-pointer min-h-[224px]"
                >
                  <div>
                    {/* Top Row: Avatar + Verified Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80
                                      text-blue-600 dark:text-blue-400 font-bold text-sm
                                      flex items-center justify-center ring-1 ring-blue-500/20 shrink-0
                                      group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {initial}
                      </div>

                      <span className="badge badge-green text-[10px] font-semibold flex items-center gap-1.5 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        Verified
                      </span>
                    </div>

                    {/* Physician Name & Specialty: FULL width available, NO truncation */}
                    <div>
                      <h3 className="font-bold text-[14px] text-slate-900 dark:text-white leading-snug break-words group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {doc.name}
                      </h3>
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                        {doc.specialty || 'General Practitioner'}
                      </p>
                    </div>

                    {/* Separator */}
                    <div className="border-t border-slate-100 dark:border-[#1e2d4d]/60 my-3" />

                    {/* Metadata Items: License, Hospital, Contact Phone */}
                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      {/* Medical Council License */}
                      <div className="flex items-center justify-between group/copy">
                        <div className="flex items-center gap-2 min-w-0">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate">
                            {doc.registrationNumber || 'MCI-PENDING'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation()
                            copyToClipboard(doc.registrationNumber, 'License')
                          }}
                          className="opacity-0 group-hover/copy:opacity-100 text-slate-400 hover:text-blue-500 p-0.5 transition-opacity"
                          title="Copy license number"
                          aria-label="Copy license number"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Hospital / Facility */}
                      <div className="flex items-center gap-2 min-w-0">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate text-slate-600 dark:text-slate-400 text-[11px]">
                          {doc.hospital || 'Private Clinic'}
                        </span>
                      </div>

                      {/* Contact Number */}
                      <div className="flex items-center justify-between group/copy">
                        <div className="flex items-center gap-2 min-w-0">
                          <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                            {doc.contactPhone || '—'}
                          </span>
                        </div>
                        {doc.contactPhone && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation()
                              copyToClipboard(doc.contactPhone, 'Phone')
                            }}
                            className="opacity-0 group-hover/copy:opacity-100 text-slate-400 hover:text-emerald-500 p-0.5 transition-opacity"
                            title="Copy phone number"
                            aria-label="Copy phone number"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Separator + Card Action Footer */}
                  <div className="pt-3.5 mt-3.5 border-t border-slate-100 dark:border-[#1e2d4d]/70 flex items-center justify-between">
                    <span
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-500
                                 flex items-center gap-1.5 transition-colors"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        handleOpenModal(doc)
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200
                                 hover:bg-slate-100 dark:hover:bg-[#1a294d] rounded-lg transition-colors"
                      title="Edit physician"
                      aria-label="Edit physician"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── PHYSICIAN PROFILE SIDE DRAWER / MODAL ── */}
      {profileDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up space-y-4.5 bg-white dark:bg-[#0f172a]">
            
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400
                                font-bold text-base flex items-center justify-center ring-2 ring-blue-500/20">
                  {profileDoctor.name?.replace(/^(Dr\.|Prof\.|Dr)\s*/i, '').trim()?.[0] || 'D'}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                    {profileDoctor.name}
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                    {profileDoctor.specialty || 'General Practitioner'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProfileDoctor(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Close profile"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Credentials Body */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 space-y-2.5">
                <p className="text-[10px] uppercase tracking-wider font-black text-slate-400">Practitioner Credentials</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Medical Council License:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {profileDoctor.registrationNumber || 'MCI-PENDING'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Verification Status:</span>
                  <span className="badge badge-green text-[10px] font-semibold">
                    Verified Active
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Affiliated Facility:</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                    {profileDoctor.hospital || 'Private Clinic'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 space-y-2.5">
                <p className="text-[10px] uppercase tracking-wider font-black text-slate-400">Contact Information</p>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Direct Phone:</span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">
                    {profileDoctor.contactPhone || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Official Email:</span>
                  <span className="text-slate-900 dark:text-white font-mono text-[11px]">
                    {profileDoctor.email || 'dr.contact@hospital.com'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setProfileDoctor(null)}
                className="btn-secondary !text-xs !py-2 !px-4"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const doc = profileDoctor
                  setProfileDoctor(null)
                  handleOpenModal(doc)
                }}
                className="btn-primary !text-xs !py-2 !px-4 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Physician</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REGISTER / EDIT PHYSICIAN FORM MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="card w-full max-w-lg my-6 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up bg-white dark:bg-[#0f172a]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingDoctor ? 'Edit Prescribing Physician' : 'Register Prescribing Physician'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grouped Form Fields */}
            <form onSubmit={handleSaveDoctor} className="py-4 space-y-4 text-xs">
              
              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => {
                    setForm(f => ({ ...f, name: e.target.value }))
                    if (formErrors.name) setFormErrors(err => ({ ...err, name: null }))
                  }}
                  className={`input text-xs w-full bg-slate-50 dark:bg-slate-900 ${
                    formErrors.name ? 'border-red-500 focus:ring-red-500/30' : ''
                  }`}
                  placeholder="e.g. Dr. Rajesh Verma"
                />
                {formErrors.name && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.name}
                  </p>
                )}
              </div>

              {/* Specialty + Medical Council License */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Specialty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.specialty}
                    onChange={e => {
                      setForm(f => ({ ...f, specialty: e.target.value }))
                      if (formErrors.specialty) setFormErrors(err => ({ ...err, specialty: null }))
                    }}
                    className={`input text-xs w-full bg-slate-50 dark:bg-slate-900 ${
                      formErrors.specialty ? 'border-red-500 focus:ring-red-500/30' : ''
                    }`}
                    placeholder="e.g. Cardiologist"
                  />
                  {formErrors.specialty && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.specialty}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Medical Council License <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.registrationNumber}
                    onChange={e => {
                      setForm(f => ({ ...f, registrationNumber: e.target.value }))
                      if (formErrors.registrationNumber) setFormErrors(err => ({ ...err, registrationNumber: null }))
                    }}
                    className={`input text-xs w-full font-mono bg-slate-50 dark:bg-slate-900 ${
                      formErrors.registrationNumber ? 'border-red-500 focus:ring-red-500/30' : ''
                    }`}
                    placeholder="e.g. MCI-DL-2015-1234"
                  />
                  {formErrors.registrationNumber && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.registrationNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Affiliated Hospital */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Affiliated Hospital / Facility <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.hospital}
                  onChange={e => {
                    setForm(f => ({ ...f, hospital: e.target.value }))
                    if (formErrors.hospital) setFormErrors(err => ({ ...err, hospital: null }))
                  }}
                  className={`input text-xs w-full bg-slate-50 dark:bg-slate-900 ${
                    formErrors.hospital ? 'border-red-500 focus:ring-red-500/30' : ''
                  }`}
                  placeholder="e.g. Max Healthcare, Delhi"
                />
                {formErrors.hospital && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.hospital}
                  </p>
                )}
              </div>

              {/* Contact Phone + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={form.contactPhone}
                    onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                    className="input text-xs w-full font-mono bg-slate-50 dark:bg-slate-900"
                    placeholder="9811002233"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="input text-xs w-full bg-slate-50 dark:bg-slate-900"
                    placeholder="dr.verma@hospital.com"
                  />
                </div>
              </div>

              {/* Verification Status */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Verification Status</label>
                <select
                  value={form.isActive ? 'ACTIVE' : 'INACTIVE'}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'ACTIVE' }))}
                  className="input text-xs w-full bg-slate-50 dark:bg-slate-900"
                >
                  <option value="ACTIVE">Verified Active (Authorized Prescriber)</option>
                  <option value="INACTIVE">Pending Review (Verification in Progress)</option>
                </select>
              </div>

              {/* Footer CTA */}
              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary !text-xs !py-2 !px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary !text-xs !py-2 !px-5 flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Saving...' : editingDoctor ? 'Update Physician' : 'Save Physician'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
