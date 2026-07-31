import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api/services'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await authApi.forgotPassword(email)
      setMessage(data.message)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-4 text-lg font-bold">Forgot password</h2>
        <label className="label">Your email</label>
        <input className="input mb-4" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button className="btn-primary w-full justify-center">Send reset link</button>
        {message && <p className="mt-3 break-all text-xs text-slate-600">{message}</p>}
        <Link to="/login" className="mt-4 block text-center text-xs text-teal-600">Back to login</Link>
      </form>
    </div>
  )
}
