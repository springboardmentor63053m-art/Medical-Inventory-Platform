import { useEffect, useState } from 'react'
import { supplierApi } from '../api/services'
import { useAuth } from '../context/AuthContext'

const empty = { name: '', contactNumber: '', email: '', address: '', rating: 5 }

export default function Suppliers() {
  const { hasRole } = useAuth()
  const canEdit = hasRole('ADMIN', 'PHARMACIST')
  const [suppliers, setSuppliers] = useState([])
  const [keyword, setKeyword] = useState('')
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [supplied, setSupplied] = useState({})

  const load = () => supplierApi.list(keyword).then(({ data }) => setSuppliers(data))
  useEffect(() => { load() }, [keyword])

  const save = async (e) => {
    e.preventDefault()
    if (editingId) await supplierApi.update(editingId, form)
    else await supplierApi.create(form)
    setForm(empty); setEditingId(null); load()
  }

  const showMedicines = async (id) => {
    const { data } = await supplierApi.medicines(id)
    setSupplied({ ...supplied, [id]: data })
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Suppliers</h2>

      <input className="input max-w-sm" placeholder="Search supplier"
             value={keyword} onChange={(e) => setKeyword(e.target.value)} />

      {canEdit && (
        <form onSubmit={save} className="card grid gap-3 md:grid-cols-5">
          <div><label className="label">Name</label>
            <input className="input" required value={form.name}
                   onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Contact number</label>
            <input className="input" value={form.contactNumber}
                   onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} /></div>
          <div><label className="label">Email</label>
            <input className="input" type="email" value={form.email}
                   onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Address</label>
            <input className="input" value={form.address}
                   onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div className="flex items-end"><button className="btn-primary">{editingId ? 'Update' : 'Add supplier'}</button></div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-500">
            <tr><th className="py-2">Name</th><th>Contact</th><th>Email</th><th>Address</th><th>Rating</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="border-t align-top">
                <td className="py-2 font-medium">{s.name}
                  {supplied[s.id] && (
                    <ul className="mt-1 text-xs text-slate-500">
                      {supplied[s.id].map((m) => <li key={m.id}>- {m.name} ({m.quantity})</li>)}
                    </ul>
                  )}
                </td>
                <td>{s.contactNumber}</td><td>{s.email}</td><td>{s.address}</td><td>{s.rating}/5</td>
                <td className="space-x-1 whitespace-nowrap">
                  <button className="btn-outline !px-2 !py-1" onClick={() => showMedicines(s.id)}>Medicines</button>
                  {canEdit && <button className="btn-outline !px-2 !py-1"
                    onClick={() => { setEditingId(s.id); setForm(s) }}>Edit</button>}
                  {hasRole('ADMIN') && <button className="btn-danger !px-2 !py-1"
                    onClick={() => supplierApi.remove(s.id).then(load)}>Del</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
