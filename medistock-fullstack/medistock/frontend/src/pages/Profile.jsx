import { useEffect, useState } from 'react'
import { userApi } from '../api/services'

export default function Profile() {
  const [profile, setProfile] = useState({ fullName: '', phone: '', email: '', role: '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [message, setMessage] = useState('')

  useEffect(() => { userApi.me().then(({ data }) => setProfile(data)) }, [])

  const saveProfile = async (e) => {
    e.preventDefault()
    await userApi.updateProfile({ fullName: profile.fullName, phone: profile.phone })
    setMessage('Profile updated')
  }

  const savePassword = async (e) => {
    e.preventDefault()
    try {
      await userApi.changePassword(passwords)
      setMessage('Password changed')
      setPasswords({ currentPassword: '', newPassword: '' })
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not change password')
    }
  }

  return (
    <div className="max-w-lg space-y-5">
      <h2 className="text-xl font-bold">My Profile</h2>
      {message && <p className="text-sm text-teal-600">{message}</p>}

      <form onSubmit={saveProfile} className="card space-y-3">
        <div><label className="label">Full name</label>
          <input className="input" value={profile.fullName || ''}
                 onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} /></div>
        <div><label className="label">Phone</label>
          <input className="input" value={profile.phone || ''}
                 onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
        <p className="text-xs text-slate-500">Email: {profile.email} - Role: {profile.role}</p>
        <button className="btn-primary">Save profile</button>
      </form>

      <form onSubmit={savePassword} className="card space-y-3">
        <h3 className="font-semibold">Change password</h3>
        <div><label className="label">Current password</label>
          <input className="input" type="password" value={passwords.currentPassword}
                 onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} /></div>
        <div><label className="label">New password</label>
          <input className="input" type="password" minLength={6} value={passwords.newPassword}
                 onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} /></div>
        <button className="btn-primary">Update password</button>
      </form>
    </div>
  )
}
