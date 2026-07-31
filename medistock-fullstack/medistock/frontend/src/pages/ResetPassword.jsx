import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/services'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [token, setToken] = useState(params.get('token') || '')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    try {
      await authApi.resetPassword({ token, newPassword })
      navigate('/login')
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not reset password')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-4 text-lg font-bold">Set a new password</h2>
        <label className="label">Reset token</label>
        <input className="input mb-3" value={token} onChange={(e) => setToken(e.target.value)} required />
        <label className="label">New password</label>
        <input className="input mb-4" type="password" value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)} required />
        <button className="btn-primary w-full justify-center">Update password</button>
        {message && <p className="mt-3 text-xs text-rose-600">{message}</p>}
      </form>
    </div>
  )
}
