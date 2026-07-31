import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { User, Mail, Shield, Edit, Key, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import axiosInstance from '../../api/axiosInstance'

export default function Profile() {
  const { user } = useAuth()
  const [changePwd,  setChangePwd]  = useState(false)
  const [pwdForm,    setPwdForm]    = useState({ currentPassword:'', newPassword:'', confirmPassword:'' })
  const [loading,    setLoading]    = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwdForm.newPassword !== pwdForm.confirmPassword) return toast.error('Passwords do not match')
    if (pwdForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters')
    setLoading(true)
    try {
      await axiosInstance.put('/users/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword:     pwdForm.newPassword,
      })
      toast.success('Password changed successfully')
      setChangePwd(false)
      setPwdForm({ currentPassword:'', newPassword:'', confirmPassword:'' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const roleColors = {
    ADMIN:              'bg-purple-100 text-purple-700',
    PHARMACIST:         'bg-blue-100 text-blue-700',
    INVENTORY_MANAGER:  'bg-teal-100 text-teal-700',
    STAFF:              'bg-slate-100 text-slate-700',
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3"><User className="w-7 h-7 text-primary-600"/>My Profile</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>
      </div>

      {/* Profile card */}
      <div className="card">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-medical-teal
                          flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.username}</h2>
            <p className="text-slate-500">{user?.email}</p>
            <span className={`badge mt-2 ${roleColors[user?.role] || 'badge-gray'}`}>
              <Shield className="w-3 h-3 mr-1"/>{user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-5">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <User className="w-4 h-4 text-slate-400"/>
            <div>
              <p className="text-xs text-slate-400">Username</p>
              <p className="text-sm font-medium text-slate-700">{user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <Mail className="w-4 h-4 text-slate-400"/>
            <div>
              <p className="text-xs text-slate-400">Email Address</p>
              <p className="text-sm font-medium text-slate-700">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <Shield className="w-4 h-4 text-slate-400"/>
            <div>
              <p className="text-xs text-slate-400">Role & Permissions</p>
              <p className="text-sm font-medium text-slate-700">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Key className="w-4 h-4"/>Security</h3>
            <p className="text-sm text-slate-500 mt-0.5">Change your account password</p>
          </div>
          {!changePwd && (
            <button onClick={() => setChangePwd(true)} className="btn-secondary btn-sm"><Edit className="w-3.5 h-3.5"/>Change Password</button>
          )}
        </div>

        {changePwd && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" value={pwdForm.currentPassword}
                onChange={e => setPwdForm(p => ({...p, currentPassword: e.target.value}))} required/>
            </div>
            <div>
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={pwdForm.newPassword}
                onChange={e => setPwdForm(p => ({...p, newPassword: e.target.value}))} required placeholder="Min 8 characters"/>
            </div>
            <div>
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" value={pwdForm.confirmPassword}
                onChange={e => setPwdForm(p => ({...p, confirmPassword: e.target.value}))} required/>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setChangePwd(false)} className="btn-secondary flex-1">
                <X className="w-4 h-4"/>Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                <Save className="w-4 h-4"/>{loading ? 'Saving...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
