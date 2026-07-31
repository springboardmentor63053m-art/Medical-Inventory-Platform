import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Lock, Mail, User, Shield, UserPlus } from 'lucide-react'

const ROLES = ['ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF']

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '', email: '', password: '', roleName: 'STAFF'
  })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})

  const validate = () => {
    const e = {}
    if (!form.username || form.username.length < 3) e.username = 'Username must be at least 3 characters'
    if (!form.email)    e.email    = 'Valid email is required'
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/.test(form.password)) e.password = 'Password must contain uppercase, lowercase, and number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created successfully! 🎉')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Create Account</h2>
      <p className="text-slate-500 text-sm mb-7">Join the MedInventory Pro platform</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Username</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="johndoe" className={`form-input pl-10 ${errors.username ? 'border-red-400' : ''}`}
              value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
          </div>
          {errors.username && <p className="form-error">{errors.username}</p>}
        </div>

        <div>
          <label className="form-label">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="email" placeholder="you@example.com" className={`form-input pl-10 ${errors.email ? 'border-red-400' : ''}`}
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          {errors.email && <p className="form-error">{errors.email}</p>}
        </div>

        <div>
          <label className="form-label">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type={showPwd ? 'text' : 'password'} placeholder="Min 8 chars, uppercase & number"
              className={`form-input pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            <button type="button" onClick={() => setShowPwd(p => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="form-error">{errors.password}</p>}
        </div>

        <div>
          <label className="form-label">Role</label>
          <div className="relative">
            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select className="form-select pl-10"
              value={form.roleName} onChange={e => setForm(p => ({ ...p, roleName: e.target.value }))}>
              {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" id="register-submit" disabled={loading}
          className="btn-primary w-full justify-center py-2.5 text-base mt-2">
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
            : <><UserPlus className="w-4 h-4" /> Create Account</>
          }
        </button>
      </form>

      <p className="text-center text-slate-500 text-sm mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Sign in</Link>
      </p>
    </div>
  )
}
