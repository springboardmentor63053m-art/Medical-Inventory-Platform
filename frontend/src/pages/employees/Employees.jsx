import { useEffect, useState } from 'react'
import { employeeAPI } from '../../api/services'
import { Users, Plus, Pencil, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function Employees() {
  const { isAdmin } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(false)
  const [edit,      setEdit]      = useState(null)
  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', phone:'',
    department:'', designation:'', status:'ACTIVE'
  })

  const load = async () => {
    setLoading(true)
    try { const r = await employeeAPI.getAll(); setEmployees(r.data) }
    catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openEdit = (emp) => { setEdit(emp); setForm(emp); setModal(true) }
  const openCreate = () => { setEdit(null); setForm({ firstName:'', lastName:'', email:'', phone:'', department:'', designation:'', status:'ACTIVE' }); setModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (edit?.id) { await employeeAPI.update(edit.id, form); toast.success('Employee updated') }
      else { await employeeAPI.create(form); toast.success('Employee created') }
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3"><Users className="w-7 h-7 text-primary-600"/>Employee Management</h1>
          <p className="page-subtitle">{employees.length} employee profiles</p>
        </div>
        {isAdmin && <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4"/>Add Employee</button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? [...Array(5)].map((_, i) => <div key={i} className="card h-40 animate-pulse bg-slate-100"/>)
        : employees.map(emp => (
          <div key={emp.id} className="card-hover">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-medical-teal
                              flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {emp.firstName?.[0]}{emp.lastName?.[0]}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{emp.firstName} {emp.lastName}</p>
                <p className="text-xs text-slate-500">{emp.designation}</p>
              </div>
              <span className={`ml-auto badge ${emp.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`}>{emp.status}</span>
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <p>📧 {emp.email}</p>
              {emp.phone && <p>📞 {emp.phone}</p>}
              {emp.department && <p>🏢 {emp.department}</p>}
            </div>
            {isAdmin && (
              <button onClick={() => openEdit(emp)} className="mt-3 btn-secondary btn-sm w-full justify-center">
                <Pencil className="w-3.5 h-3.5"/>Edit Profile
              </button>
            )}
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-semibold">{edit ? 'Edit Employee' : 'Add Employee'}</h3>
              <button onClick={() => setModal(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-4 h-4"/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body grid grid-cols-2 gap-4">
                <div><label className="form-label">First Name *</label><input className="form-input" value={form.firstName||''} onChange={e => f('firstName', e.target.value)} required/></div>
                <div><label className="form-label">Last Name *</label><input className="form-input" value={form.lastName||''} onChange={e => f('lastName', e.target.value)} required/></div>
                <div><label className="form-label">Email *</label><input type="email" className="form-input" value={form.email||''} onChange={e => f('email', e.target.value)} required/></div>
                <div><label className="form-label">Phone</label><input className="form-input" value={form.phone||''} onChange={e => f('phone', e.target.value)}/></div>
                <div><label className="form-label">Department</label><input className="form-input" value={form.department||''} onChange={e => f('department', e.target.value)}/></div>
                <div><label className="form-label">Designation</label><input className="form-input" value={form.designation||''} onChange={e => f('designation', e.target.value)}/></div>
                <div><label className="form-label">Date of Joining</label><input type="date" className="form-input" value={form.dateOfJoining||''} onChange={e => f('dateOfJoining', e.target.value)}/></div>
                <div><label className="form-label">Status</label>
                  <select className="form-select" value={form.status||'ACTIVE'} onChange={e => f('status', e.target.value)}>
                    <option>ACTIVE</option><option>INACTIVE</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{edit ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
