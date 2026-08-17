import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  Eye, EyeOff, Lock, Mail, User, UserPlus,
  CheckCircle2, AlertCircle, Sparkles, ChevronRight
} from 'lucide-react'

const ROLES = [
  { value: 'ADMIN',             label: 'Admin',         desc: 'Full system access',          color: 'from-blue-500 to-indigo-600' },
  { value: 'PHARMACIST',        label: 'Pharmacist',    desc: 'Medicine dispensing & sales', color: 'from-emerald-500 to-teal-600' },
  { value: 'INVENTORY_MANAGER', label: 'Inv. Manager',  desc: 'Stock & procurement',         color: 'from-orange-500 to-amber-600' },
  { value: 'STAFF',             label: 'Staff',         desc: 'Read-only access',            color: 'from-slate-500 to-slate-600' },
  { value: 'SUPPLIER',          label: 'Supplier',      desc: 'Supplier profile & catalog',  color: 'from-purple-500 to-pink-600' },
]

const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', textColor: '' }

  if (pwd.length < 8) {
    return { score: 1, label: 'Too short', textColor: 'text-[#22D3EE] font-semibold' }
  }

  if (pwd.length >= 15) {
    return { score: 6, label: 'Excellent ✨', textColor: 'text-[#22D3EE] font-bold' }
  }

  let criteriaCount = 0
  if (/[A-Z]/.test(pwd)) criteriaCount++
  if (/[a-z]/.test(pwd)) criteriaCount++
  if (/[0-9]/.test(pwd)) criteriaCount++
  if (/[^A-Za-z0-9]/.test(pwd)) criteriaCount++

  if (pwd.length >= 13) {
    return { score: 5, label: 'Strong', textColor: 'text-[#22D3EE] font-bold' }
  }

  if (criteriaCount <= 1) {
    return { score: 2, label: 'Weak', textColor: 'text-[#22D3EE] font-semibold' }
  }
  if (criteriaCount === 2) {
    return { score: 3, label: 'Fair', textColor: 'text-[#22D3EE] font-semibold' }
  }
  if (criteriaCount === 3) {
    return { score: 4, label: 'Good', textColor: 'text-[#22D3EE] font-semibold' }
  }

  return { score: 5, label: 'Strong', textColor: 'text-[#22D3EE] font-bold' }
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', email: '', password: '', roleName: 'STAFF' })
  const [showPwd, setShowPwd] = useState(false)
  const [pwdFocused, setPwdFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})
  const [touched, setTouched] = useState({})

  const strength = getPasswordStrength(form.password)

  const validate = (fields = form) => {
    const e = {}
    if (!fields.username || fields.username.trim().length === 0) e.username = 'Username is required'
    else if (fields.username.trim().length < 3) e.username = 'Username must be at least 3 characters'
    if (!fields.email || fields.email.trim().length === 0) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) e.email = 'Enter a valid email address'
    if (!fields.password || fields.password.length === 0) e.password = 'Password is required'
    else if (fields.password.length < 6) e.password = 'Password must be at least 6 characters'
    return e
  }

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value }
    setForm(updated)
    if (touched[field]) {
      const e = validate(updated)
      setErrors(prev => ({ ...prev, [field]: e[field] }))
    }
  }

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const e = validate()
    setErrors(prev => ({ ...prev, [field]: e[field] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ username: true, email: true, password: true })
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      await register(form)
      toast.success('Account created successfully! Welcome to MediStock!', { duration: 4000 })
      navigate('/dashboard')
    } catch (err) {
      const status = err.response?.status
      const msg    = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed'
      const lower  = String(msg).toLowerCase()

      if (status === 409 || lower.includes('already') || lower.includes('exists') || lower.includes('taken')) {
        if (lower.includes('email')) {
          setErrors(prev => ({ ...prev, email: 'This email is already registered' }))
          toast.error('Email is already registered. Please sign in or use a different email.')
        } else if (lower.includes('username')) {
          setErrors(prev => ({ ...prev, username: 'This username is already taken' }))
          toast.error('Username is already taken. Please choose a different username.')
        } else {
          toast.error(msg || 'Account already exists. Try signing in instead.')
        }
      } else if (status === 400) {
        toast.error(msg || 'Invalid details. Please check your inputs.')
      } else {
        toast.error(msg || 'Registration failed. Please check your details and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const usernameValid = !errors.username && form.username.length >= 3 && touched.username
  const emailValid    = !errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && touched.email

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Create Account</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Join the MediStock Pro platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>

        {/* Username */}
        <div>
          <label className="form-label dark:text-slate-300" htmlFor="reg-username">Username</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="reg-username" type="text" placeholder="johndoe" autoComplete="username"
              className={`form-input pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 ${errors.username ? 'border-red-400 dark:border-red-500' : ''}`}
              value={form.username}
              onChange={e => handleChange('username', e.target.value)}
              onBlur={() => handleBlur('username')}
            />
            {usernameValid && <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />}
          </div>
          {errors.username && touched.username && (
            <p className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.username}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="form-label dark:text-slate-300" htmlFor="reg-email">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="reg-email" type="email" placeholder="you@example.com" autoComplete="email"
              className={`form-input pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 ${errors.email ? 'border-red-400 dark:border-red-500' : ''}`}
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
            />
            {emailValid && <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />}
          </div>
          {errors.email && touched.email && (
            <p className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="form-label dark:text-slate-300" htmlFor="reg-password">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="reg-password" type={showPwd ? 'text' : 'password'} placeholder="Min. 6 characters" autoComplete="new-password"
              className={`form-input pl-10 pr-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 ${errors.password ? 'border-red-400 dark:border-red-500' : ''}`}
              value={form.password}
              onChange={e => handleChange('password', e.target.value)}
              onFocus={() => setPwdFocused(true)}
              onBlur={() => { setPwdFocused(false); handleBlur('password') }}
            />
            <button type="button" onClick={() => setShowPwd(p => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && touched.password && (
            <p className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.password}
            </p>
          )}
          {form.password && pwdFocused && (
            <div className="mt-2 space-y-1 animate-fade-in">
              <div className="flex gap-1 h-1.5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      i <= strength.score ? 'bg-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'bg-slate-200 dark:bg-slate-700/80'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-400">
                Strength: <span className={strength.textColor}>{strength.label}</span>
              </p>
            </div>
          )}
        </div>

        {/* Role Cards */}
        <div>
          <label className="form-label dark:text-slate-300 mb-2 block">Select Role</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map(({ value, label, desc, color }) => (
              <button key={value} type="button" onClick={() => setForm(p => ({ ...p, roleName: value }))}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left border transition-all duration-200
                  ${form.roleName === value
                    ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
              >
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <span className="text-white text-[11px] font-bold">{label[0]}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-none">{label}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{desc}</p>
                </div>
                {form.roleName === value && <CheckCircle2 className="w-4 h-4 text-blue-500 ml-auto flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button type="submit" id="register-submit" disabled={loading}
          className="btn-primary w-full justify-center py-3 text-sm mt-2">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</>
          ) : (
            <><UserPlus className="w-4 h-4" /> Create Account <Sparkles className="w-3.5 h-3.5 ml-1 opacity-70" /></>
          )}
        </button>
      </form>

      <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold transition-colors">
          Sign in <ChevronRight className="inline w-3.5 h-3.5" />
        </Link>
      </p>
    </div>
  )
}

