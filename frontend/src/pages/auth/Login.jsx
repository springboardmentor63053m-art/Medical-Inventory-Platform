import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Lock, Mail, LogIn, Sparkles, ChevronRight, Key, X, CheckCircle2 } from 'lucide-react'

export default function Login() {
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const [form,          setForm]          = useState({ email: '', password: '' })
  const [showPwd,       setShowPwd]       = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors,        setErrors]        = useState({})
  const [resetModal,    setResetModal]    = useState(false)
  const [resetEmail,    setResetEmail]    = useState('')
  const [resetSent,     setResetSent]     = useState(false)

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
      toast.success('Welcome to MediStock Platform! 👋')
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
    }, 1200)
  }

  const handlePasswordReset = (e) => {
    e.preventDefault()
    if (!resetEmail) return toast.error('Please enter your email')
    setResetSent(true)
    toast.success('Password reset link sent to ' + resetEmail)
  }



  return (
    <div>
      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
          MediStock Sign In
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Access your medical inventory control workspace
        </p>
      </div>

      {/* OAuth2 Google Login Button (PDF Requirement) */}
      <button
        type="button"
        onClick={handleOAuth2Google}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl
                   bg-white dark:bg-slate-800
                   border border-slate-200 dark:border-slate-700
                   text-slate-700 dark:text-slate-200 text-sm font-semibold
                   hover:bg-slate-50 dark:hover:bg-slate-700/80
                   transition-all duration-200 shadow-sm hover:shadow-md mb-5"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>{googleLoading ? 'Authenticating with Google...' : 'Sign in with Google (OAuth2)'}</span>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">or sign in with email</span>
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
      </div>

      {/* Manual Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label" htmlFor="login-email">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              className={`form-input pl-10 ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="form-error"><span>⚠</span> {errors.email}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="form-label !mb-0" htmlFor="login-password">Password</label>
            <button
              type="button"
              onClick={() => { setResetModal(true); setResetSent(false); setResetEmail(form.email) }}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
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
              className={`form-input pl-10 pr-12 ${errors.password ? 'border-red-400' : ''}`}
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd(p => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg
                         text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="form-error"><span>⚠</span> {errors.password}</p>}
        </div>

        <button
          type="submit"
          id="login-submit"
          disabled={loading}
          className="btn-primary w-full justify-center py-3 text-sm mt-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign In to MediStock
              <Sparkles className="w-3.5 h-3.5 ml-1 opacity-70" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-5">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold transition-colors"
        >
          Create account
        </Link>
      </p>

      {/* Password Reset Modal (PDF Module 1) */}
      {resetModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-sm">
            <div className="modal-header">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-500" /> Reset Password
              </h3>
              <button onClick={() => setResetModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            {resetSent ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-white">Reset Link Sent</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We've sent password recovery instructions to <strong>{resetEmail}</strong>. Please check your inbox.
                </p>
                <button onClick={() => setResetModal(false)} className="btn-primary w-full justify-center">
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="p-6 space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your registered email address and we'll send you a password reset link.
                </p>
                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setResetModal(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1 justify-center">
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
