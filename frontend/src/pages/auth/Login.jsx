import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  Eye, EyeOff, Lock, Mail, LogIn, Key, X,
  CheckCircle2, Shield, Pill, Package, Users, Truck, ArrowRight
} from 'lucide-react'

const ROLES = [
  {
    id: 'ADMIN',
    name: 'Admin',
    buttonName: 'Admin',
    selectedLabel: 'Admin Selected',
    desc: 'Full system access',
    email: 'admin@medicalinv.com',
    password: 'Admin@123',
    icon: Shield,
    iconBg: 'bg-blue-600',
    iconColor: 'text-white'
  },
  {
    id: 'PHARMACIST',
    name: 'Pharmacist',
    buttonName: 'Pharmacist',
    selectedLabel: 'Pharmacist Selected',
    desc: 'Prescription & dispensing',
    email: 'sneha_pharmacist@medicalinv.com',
    password: 'Admin@123',
    icon: Pill,
    iconBg: 'bg-emerald-500',
    iconColor: 'text-white'
  },
  {
    id: 'INVENTORY_MANAGER',
    name: 'Inventory Manager',
    buttonName: 'Inventory Manager',
    selectedLabel: 'Inv. Manager Selected',
    desc: 'Stock & procurement',
    email: 'ravi_inventory@medicalinv.com',
    password: 'Admin@123',
    icon: Package,
    iconBg: 'bg-orange-500',
    iconColor: 'text-white'
  },
  {
    id: 'STAFF',
    name: 'Staff',
    buttonName: 'Staff',
    selectedLabel: 'Staff Selected',
    desc: 'Operational access',
    email: 'patel@medicalinv.com',
    password: 'Admin@123',
    icon: Users,
    iconBg: 'bg-slate-700',
    iconColor: 'text-white'
  },
  {
    id: 'SUPPLIER',
    name: 'Supplier',
    buttonName: 'Supplier',
    selectedLabel: 'Supplier Selected',
    desc: 'Supplier profile & catalog',
    email: 'contact@cipla.com',
    password: 'Admin@123',
    icon: Truck,
    iconBg: 'bg-purple-600',
    iconColor: 'text-white'
  }
]

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [selectedRole,  setSelectedRole]  = useState('ADMIN')
  const [form,          setForm]          = useState({
    email: 'admin@medicalinv.com',
    password: 'Admin@123'
  })
  const [showPwd,       setShowPwd]       = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors,        setErrors]        = useState({})
  const [resetModal,    setResetModal]    = useState(false)
  const [resetEmail,    setResetEmail]    = useState('')
  const [resetSent,     setResetSent]     = useState(false)

  const activeRole = ROLES.find(r => r.id === selectedRole) || ROLES[0]

  const handleRoleSelect = (role) => {
    setSelectedRole(role.id)
    setForm({
      email: role.email,
      password: role.password
    })
    setErrors({})
  }

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success(`Welcome to MediStock! Authenticated as ${activeRole.name} 👋`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth2Google = async () => {
    setGoogleLoading(true)
    toast.loading('Connecting to Google OAuth2 Service...', { id: 'oauth' })
    setTimeout(async () => {
      try {
        await login('admin@medicalinv.com', 'Admin@123')
        toast.success('Google OAuth2 Authentication successful! Welcome 👋', { id: 'oauth' })
        navigate('/dashboard')
      } catch {
        toast.error('OAuth2 authentication failed', { id: 'oauth' })
      } finally {
        setGoogleLoading(false)
      }
    }, 1000)
  }

  const handlePasswordReset = (e) => {
    e.preventDefault()
    if (!resetEmail) return toast.error('Please enter your email')
    setResetSent(true)
    toast.success('Password reset link sent to ' + resetEmail)
  }

  return (
    <div className="space-y-5 select-none">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
          MediStock Sign In
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
          Select your role or enter credentials to access your workspace
        </p>
      </div>

      {/* Role Selection Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            SELECT ROLE
          </span>
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
            {activeRole.selectedLabel}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Row 1 & 2: 4 Main Roles */}
          {ROLES.slice(0, 4).map((role) => {
            const Icon = role.icon
            const isSelected = selectedRole === role.id

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleSelect(role)}
                className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-2 border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 shadow-2xs'
                    : 'border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg ${role.iconBg} ${role.iconColor} flex items-center justify-center shrink-0 shadow-2xs`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate leading-tight">{role.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate leading-tight mt-0.5">{role.desc}</p>
                  </div>
                </div>

                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-1" />
                )}
              </button>
            )
          })}

          {/* Row 3: Supplier spanning 2 columns for balanced layout */}
          {(() => {
            const role = ROLES[4]
            const Icon = role.icon
            const isSelected = selectedRole === role.id

            return (
              <button
                type="button"
                onClick={() => handleRoleSelect(role)}
                className={`col-span-2 p-2.5 rounded-xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-2 border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 shadow-2xs'
                    : 'border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg ${role.iconBg} ${role.iconColor} flex items-center justify-center shrink-0 shadow-2xs`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate leading-tight">{role.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate leading-tight mt-0.5">{role.desc}</p>
                  </div>
                </div>

                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-1" />
                )}
              </button>
            )
          })()}
        </div>
      </div>

      {/* Manual Email & Password Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1" htmlFor="login-email">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="login-email"
              type="email"
              placeholder="admin@medistock.com"
              className={`form-input !text-xs !pl-10 !py-2.5 w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl ${
                errors.email ? 'border-red-400 focus:ring-red-400' : ''
              }`}
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="text-red-500 text-[11px] mt-1">⚠ {errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200" htmlFor="login-password">
              Password
            </label>
            <button
              type="button"
              onClick={() => { setResetModal(true); setResetSent(false); setResetEmail(form.email) }}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="login-password"
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              className={`form-input !text-xs !pl-10 !pr-10 !py-2.5 w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl font-mono ${
                errors.password ? 'border-red-400' : ''
              }`}
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd(p => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-[11px] mt-1">⚠ {errors.password}</p>}
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          id="login-submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer mt-1"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In as {activeRole.buttonName}</span>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">OR</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Google OAuth2 Button */}
      <button
        type="button"
        onClick={handleOAuth2Google}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl
                   bg-white dark:bg-slate-800
                   border border-slate-200 dark:border-slate-700
                   text-slate-700 dark:text-slate-200 text-xs font-bold
                   hover:bg-slate-50 dark:hover:bg-slate-700/80
                   transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>{googleLoading ? 'Connecting to Google...' : 'Sign in with Google (OAuth2)'}</span>
      </button>

      {/* Create Account Link */}
      <p className="text-center text-slate-500 dark:text-slate-400 text-xs">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
        >
          Create account
        </Link>
      </p>

      {/* Password Reset Modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-500" /> Reset Password
              </h3>
              <button onClick={() => setResetModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSent ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Reset Link Sent</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Password recovery instructions sent to <strong>{resetEmail}</strong>.
                </p>
                <button onClick={() => setResetModal(false)} className="btn-primary w-full justify-center !text-xs !py-2">
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="py-4 space-y-3.5">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your registered email address to receive password recovery instructions.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    className="form-input text-xs w-full"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="admin@medicalinv.com"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setResetModal(false)} className="btn-secondary flex-1 !text-xs !py-2">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1 justify-center !text-xs !py-2">
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
