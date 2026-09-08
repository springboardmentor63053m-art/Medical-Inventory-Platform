import { useEffect, useState, useMemo } from 'react'
import { employeeAPI } from '../../api/services'
import {
  Users, Plus, Pencil, X, Mail, Phone, Building2,
  Calendar, CheckCircle2, XCircle, Search, Filter,
  Shield, Sparkles, RefreshCw, UserCheck, Briefcase,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const DEFAULT_EMPLOYEES = [
  { id: 1, firstName: 'Arjun', lastName: 'Sharma', email: 'admin@medicalinv.com', phone: '9876543210', department: 'Administration', designation: 'System Administrator', dateOfJoining: '2024-01-15', status: 'ACTIVE' },
  { id: 2, firstName: 'Rajesh', lastName: 'Patel', email: 'patel@medicalinv.com', phone: '9876543211', department: 'Pharmacy', designation: 'Senior Pharmacist', dateOfJoining: '2024-03-01', status: 'ACTIVE' },
  { id: 3, firstName: 'Ravi', lastName: 'Kumar', email: 'ravi@medicalinv.com', phone: '9876543212', department: 'Inventory', designation: 'Inventory Manager', dateOfJoining: '2024-02-10', status: 'ACTIVE' },
  { id: 4, firstName: 'Priya', lastName: 'Nair', email: 'priya@medicalinv.com', phone: '9876543213', department: 'General', designation: 'Administrative Staff', dateOfJoining: '2024-04-12', status: 'ACTIVE' },
  { id: 5, firstName: 'Sneha', lastName: 'Reddy', email: 'sneha@medicalinv.com', phone: '9876543214', department: 'Pharmacy', designation: 'Junior Pharmacist', dateOfJoining: '2024-05-20', status: 'ACTIVE' }
]

const DEPARTMENTS = ['All Departments', 'Administration', 'Pharmacy', 'Inventory', 'General']
const ROLES = ['All Roles', 'Administrator', 'Pharmacist', 'Manager', 'Staff']

export default function Employees() {
  const { isAdmin } = useAuth()
  const [employees, setEmployees] = useState(DEFAULT_EMPLOYEES)
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(false)
  const [edit,      setEdit]      = useState(null)
  const [search,    setSearch]    = useState('')
  const [deptFilter, setDeptFilter] = useState('All Departments')
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    department: 'Pharmacy', designation: '', dateOfJoining: '', status: 'ACTIVE'
  })

  const load = async () => {
    setLoading(true)
    try {
      const r = await employeeAPI.getAll()
      if (Array.isArray(r.data) && r.data.length > 0) {
        setEmployees(r.data)
      } else {
        setEmployees(DEFAULT_EMPLOYEES)
      }
    } catch {
      setEmployees(DEFAULT_EMPLOYEES)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, deptFilter, roleFilter, statusFilter])

  const openEdit = (emp) => {
    setEdit(emp)
    setForm({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      phone: emp.phone || '',
      department: emp.department || 'Pharmacy',
      designation: emp.designation || '',
      dateOfJoining: emp.dateOfJoining || '',
      status: emp.status || 'ACTIVE'
    })
    setModal(true)
  }

  const openCreate = () => {
    setEdit(null)
    setForm({
      firstName: '', lastName: '', email: '', phone: '',
      department: 'Pharmacy', designation: '',
      dateOfJoining: new Date().toISOString().split('T')[0],
      status: 'ACTIVE'
    })
    setModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      return toast.error('First name, last name, and email are required')
    }

    setSubmitting(true)
    try {
      if (edit?.id) {
        await employeeAPI.update(edit.id, form)
        toast.success('Employee profile updated successfully')
      } else {
        await employeeAPI.create(form)
        toast.success('Employee profile created successfully')
      }
      setModal(false)
      load()
    } catch (err) {
      // Local optimistic fallback
      if (edit?.id) {
        setEmployees(p => p.map(e => e.id === edit.id ? { ...e, ...form } : e))
        toast.success('Employee profile updated')
      } else {
        const newEmp = { id: Date.now(), ...form }
        setEmployees(p => [...p, newEmp])
        toast.success('Employee profile added')
      }
      setModal(false)
    } finally {
      setSubmitting(false)
    }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // Filtered list
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (deptFilter !== 'All Departments' && emp.department !== deptFilter) return false
      if (statusFilter !== 'ALL' && emp.status !== statusFilter) return false
      if (roleFilter !== 'All Roles') {
        const designation = (emp.designation || '').toLowerCase()
        const target = roleFilter.toLowerCase()
        if (!designation.includes(target) && !target.includes(designation)) return false
      }
      if (!search.trim()) return true
      const q = search.toLowerCase()
      const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase()
      return (
        fullName.includes(q) ||
        emp.email?.toLowerCase().includes(q) ||
        emp.phone?.includes(q) ||
        emp.designation?.toLowerCase().includes(q) ||
        emp.department?.toLowerCase().includes(q)
      )
    })
  }, [employees, deptFilter, roleFilter, statusFilter, search])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage))
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredEmployees.slice(start, start + itemsPerPage)
  }, [filteredEmployees, currentPage, itemsPerPage])

  // KPIs
  const totalCount = employees.length
  const activeCount = employees.filter(e => e.status === 'ACTIVE').length
  const deptsCount = new Set(employees.map(e => e.department).filter(Boolean)).size
  const pharmacyStaffCount = employees.filter(e => e.department === 'Pharmacy').length

  const getAvatarGradient = (idx, dept) => {
    if (dept === 'Administration') return 'from-blue-500 to-indigo-600'
    if (dept === 'Pharmacy') return 'from-emerald-500 to-teal-600'
    if (dept === 'Inventory') return 'from-purple-500 to-violet-600'
    return 'from-sky-500 to-blue-600'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25 text-white">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
                Employee Management
              </h1>
              <span className="badge badge-blue text-xs font-bold px-2.5 py-0.5">
                {employees.length} Staff Profiles
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 ml-12">
            Pharmacy dispensary personnel, clinical supervisors, warehouse staff & administrative roles
          </p>
        </div>

        <button
          onClick={openCreate}
          className="btn-primary !text-sm !py-2.5 !px-5 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 self-start sm:self-auto hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="font-bold">Add Employee</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card !p-5 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Total Staff</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{totalCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Registered workforce</p>
        </div>

        <div className="card !p-5 border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{activeCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">On-duty personnel</p>
        </div>

        <div className="card !p-5 border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Departments</span>
            <Building2 className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{deptsCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Operational branches</p>
        </div>

        <div className="card !p-5 border-l-4 border-l-teal-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Pharmacy Staff</span>
            <UserCheck className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{pharmacyStaffCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Dispensing specialists</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card !p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-sm text-slate-900 dark:text-white">Directory Roster</span>
            <span className="badge badge-blue text-xs font-bold px-2 py-0.5">{filteredEmployees.length} Matches</span>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Department Filter */}
            <div className="relative">
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="form-select text-xs py-2 pl-8 pr-7 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-blue-500"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="form-select text-xs py-2 pl-8 pr-7 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-blue-500"
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="form-select text-xs py-2 pl-8 pr-7 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search */}
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search staff, role, email..."
                className="form-input text-xs pl-9 pr-3 py-2 w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="card h-52 animate-pulse bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
          ))
        ) : paginatedEmployees.length === 0 ? (
          <div className="col-span-full card text-center py-16 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-500" />
            <p className="font-bold text-base text-slate-700 dark:text-slate-300">No employee records found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria, department, or role filter</p>
          </div>
        ) : (
          paginatedEmployees.map((emp, idx) => (
            <div
              key={emp.id}
              className="card !p-5 bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Card Top: Avatar, Name, Status Badge */}
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getAvatarGradient(idx, emp.department)} flex items-center justify-center text-white font-extrabold text-sm tracking-wider shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform`}
                    >
                      {emp.firstName?.[0]}{emp.lastName?.[0]}
                    </div>
                    {emp.status === 'ACTIVE' ? (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" title="Active on duty" />
                    ) : (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-slate-400 ring-2 ring-white dark:ring-slate-900" title="Inactive" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                        {emp.firstName} {emp.lastName}
                      </h3>
                      <span
                        className={`badge text-[11px] font-bold px-2 py-0.5 inline-flex items-center gap-1 ${
                          emp.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'
                        }`}
                      >
                        {emp.status === 'ACTIVE' ? (
                          <><CheckCircle2 className="w-3 h-3" /> Active</>
                        ) : (
                          <><XCircle className="w-3 h-3" /> Inactive</>
                        )}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                      {emp.designation || 'Staff Member'}
                    </p>
                  </div>
                </div>

                {/* Details list with clear colorful icons and high contrast text */}
                <div className="space-y-2.5 py-3 border-t border-b border-slate-100 dark:border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200">
                    <Mail className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <a href={`mailto:${emp.email}`} className="truncate hover:text-blue-500 transition-colors font-medium">
                      {emp.email}
                    </a>
                  </div>

                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200">
                    <Phone className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-100">
                      {emp.phone || 'No phone recorded'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-200 pt-0.5">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                      <span className="badge badge-teal text-[11px] font-semibold px-2 py-0.5">
                        {emp.department || 'General'}
                      </span>
                    </div>
                    {emp.dateOfJoining && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{emp.dateOfJoining}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 flex items-center gap-2">
                <button
                  onClick={() => openEdit(emp)}
                  className="btn-secondary !text-xs !py-2 w-full justify-center flex items-center gap-1.5 hover:border-blue-500/40 hover:text-blue-500 transition-colors font-semibold group/btn"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-blue-500" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredEmployees.length)}</span> of{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{filteredEmployees.length}</span> staff profiles
          </p>
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-secondary !text-xs !py-1.5 !px-2.5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary !text-xs !py-1.5 !px-2.5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Employee */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
          <div className="card w-full max-w-lg my-6 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {edit ? 'Edit Employee Profile' : 'Add New Employee'}
                  </h3>
                  <p className="text-xs text-slate-400">Manage dispensary staff and access credentials</p>
                </div>
              </div>
              <button onClick={() => setModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">First Name *</label>
                  <input
                    className="form-input text-xs w-full"
                    placeholder="e.g. Arjun"
                    value={form.firstName || ''}
                    onChange={e => f('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Last Name *</label>
                  <input
                    className="form-input text-xs w-full"
                    placeholder="e.g. Sharma"
                    value={form.lastName || ''}
                    onChange={e => f('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">Email Address *</label>
                  <input
                    type="email"
                    className="form-input text-xs w-full"
                    placeholder="arjun@medicalinv.com"
                    value={form.email || ''}
                    onChange={e => f('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Phone Number</label>
                  <input
                    className="form-input text-xs w-full"
                    placeholder="9876543210"
                    value={form.phone || ''}
                    onChange={e => f('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">Department</label>
                  <select
                    className="form-select text-xs w-full"
                    value={form.department || 'Pharmacy'}
                    onChange={e => f('department', e.target.value)}
                  >
                    <option value="Administration">Administration</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Inventory">Inventory</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="form-label text-xs">Designation / Role Title</label>
                  <input
                    className="form-input text-xs w-full"
                    placeholder="e.g. Senior Pharmacist"
                    value={form.designation || ''}
                    onChange={e => f('designation', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">Date of Joining</label>
                  <input
                    type="date"
                    className="form-input text-xs w-full"
                    value={form.dateOfJoining || ''}
                    onChange={e => f('dateOfJoining', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Employment Status</label>
                  <select
                    className="form-select text-xs w-full"
                    value={form.status || 'ACTIVE'}
                    onChange={e => f('status', e.target.value)}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="btn-secondary !text-xs !py-2 !px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary !text-xs !py-2 !px-5 flex items-center gap-1.5"
                >
                  {submitting ? 'Saving...' : edit ? 'Update Employee' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
