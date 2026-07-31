import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@medistock.com')
  const [password, setPassword] = useState('Admin@123')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.message || err?.response?.data?.message || err?.response?.data?.error || 'Invalid email or password')
    } finally {
      setBusy(false)
    }
  }

  // Google OAuth2 login handled by Spring Security
  const googleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#0f766e,_#0f172a_70%)] px-4 py-8">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-black/30 backdrop-blur"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/15 text-2xl font-semibold text-teal-400">
            M
          </div>
          <h1 className="text-2xl font-semibold text-white">MediStock</h1>
          <p className="mt-2 text-sm text-slate-400">Manage inventory with confidence</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button className="mt-6 flex w-full items-center justify-center rounded-xl bg-teal-500 px-4 py-2.5 font-medium text-white transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-70" disabled={busy}>
          {busy ? 'Signing in...' : 'Sign in'}
        </button>

        <button
          type="button"
          onClick={googleLogin}
          className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-2.5 font-medium text-slate-200 transition hover:bg-slate-700"
        >
          Continue with Google
        </button>

        <div className="mt-5 flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="text-teal-400 transition hover:text-teal-300">
            Forgot password?
          </Link>
          <span className="text-slate-500">Demo mode</span>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-500">
          Demo credentials: admin@medistock.com / Admin@123
        </p>
      </motion.form>
    </div>
  )
}
