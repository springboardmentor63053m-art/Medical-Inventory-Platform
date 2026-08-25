import { useState, useEffect } from 'react'
import { doctorAPI } from '../../api/services'
import { Stethoscope, Plus, Search, Phone, Mail, Building, ShieldCheck, X, CheckCircle2, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Doctors() {
  const [doctors,    setDoctors]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [showModal,  setShowModal]  = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Doctor Form
  const [name,               setName]               = useState('')
  const [specialty,          setSpecialty]          = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [hospital,           setHospital]           = useState('')
  const [contactPhone,       setContactPhone]       = useState('')
  const [email,              setEmail]              = useState('')

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const res = await doctorAPI.getAll(search)
      setDoctors(res.data)
    } catch (err) {
      toast.error('Failed to load doctors directory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [search])

  const handleCreateDoctor = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Doctor name is required')

    setSubmitting(true)
    try {
      await doctorAPI.create({
        name, specialty, registrationNumber, hospital, contactPhone, email, isActive: true
      })
      toast.success('Doctor registered successfully!')
      setShowModal(false)
      setName(''); setSpecialty(''); setRegistrationNumber(''); setHospital(''); setContactPhone(''); setEmail('')
      fetchDoctors()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register doctor')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/25">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              Prescribing Physicians
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 ml-11">
            Authorized medical practitioner directory, specialties, medical council licenses & hospital affiliations
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary !text-xs !py-2 !px-4 flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Physician</span>
        </button>
      </div>

      {/* Directory Card */}
      <div className="card space-y-4 shadow-sm border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Doctor Directory</span>
            <span className="badge badge-blue">{doctors.length} Registered</span>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by doctor name, specialty, hospital..."
              className="input !text-xs !pl-9 w-full"
            />
          </div>
        </div>

        {/* Doctors Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="card h-40 skeleton rounded-2xl" />
            ))
          ) : doctors.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-slate-400">
              <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-sm">No doctors found</p>
            </div>
          ) : (
            doctors.map(doc => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm">
                      {doc.name?.replace('Dr. ', '')?.[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{doc.name}</h3>
                      <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold">{doc.specialty || 'General Practitioner'}</p>
                    </div>
                  </div>
                  <span className="badge badge-green text-[10px]">Verified</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-mono text-slate-700 dark:text-slate-200">{doc.registrationNumber || 'Reg Pending'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.hospital || 'Private Clinic'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-mono">{doc.contactPhone || '—'}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="card w-full max-w-lg my-6 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Register Prescribing Physician</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateDoctor} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Doctor Full Name *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="input text-xs w-full" placeholder="e.g. Dr. Rajesh Verma" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Specialty</label>
                  <input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} className="input text-xs w-full" placeholder="e.g. Cardiologist" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">License / Reg Number</label>
                  <input type="text" value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value)} className="input text-xs w-full" placeholder="MCI-DL-2015-1234" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hospital / Clinic Name</label>
                <input type="text" value={hospital} onChange={e => setHospital(e.target.value)} className="input text-xs w-full" placeholder="e.g. Max Healthcare, Delhi" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                  <input type="text" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="input text-xs w-full" placeholder="9811002233" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input text-xs w-full" placeholder="dr.verma@hospital.com" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary !text-xs !py-2 !px-4">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary !text-xs !py-2 !px-5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Save Physician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
