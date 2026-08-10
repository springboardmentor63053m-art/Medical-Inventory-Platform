import { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import ThemeToggle from '../../components/ThemeToggle'
import { Settings as SettingsIcon, Bell, Mail, Smartphone, Shield, CheckCircle2, Save, Cpu, Database, Server } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const [notif, setNotif] = useState({
    lowStockAlerts: true,
    expiryAlerts: true,
    purchaseReminders: true,
    emailNotifications: true,
    pushNotifications: false,
    dailySummary: true,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('MediStock Platform Settings updated successfully! ✓')
    }, 600)
  }

  const toggle = (key) => setNotif(p => ({ ...p, [key]: !p[key] }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="MediStock Platform Settings"
        subtitle="Notification preferences, system configuration, and theme selection"
      />

      {/* Theme Control */}
      <div className="card">
        <h2 className="text-base font-bold text-slate-800 dark:text-white mb-1">Appearance & Interface Theme</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Choose how MediStock Pro renders on your desktop or mobile screen</p>
        <ThemeToggle variant="segmented" />
      </div>

      {/* Notification & Reminder System (PDF Module 8 Specification) */}
      <div className="card space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              Notification & Reminder System
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure real-time stock, expiry, and automated email/push notifications (PDF Module 8)</p>
          </div>
          <span className="badge badge-green">Real-Time Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Low-Stock Warnings</p>
              <p className="text-xs text-slate-400">Trigger alerts when quantity &lt; reorder level</p>
            </div>
            <input
              type="checkbox"
              checked={notif.lowStockAlerts}
              onChange={() => toggle('lowStockAlerts')}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Expiry Notifications</p>
              <p className="text-xs text-slate-400">Alert 30, 60, and 90 days before batch expiry</p>
            </div>
            <input
              type="checkbox"
              checked={notif.expiryAlerts}
              onChange={() => toggle('expiryAlerts')}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-blue-500" /> Email Notifications
              </p>
              <p className="text-xs text-slate-400">Send automated daily inventory digests via JavaMailSender</p>
            </div>
            <input
              type="checkbox"
              checked={notif.emailNotifications}
              onChange={() => toggle('emailNotifications')}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-purple-500" /> Push Notifications
              </p>
              <p className="text-xs text-slate-400">Firebase Cloud Messaging (FCM) browser push alerts</p>
            </div>
            <input
              type="checkbox"
              checked={notif.pushNotifications}
              onChange={() => toggle('pushNotifications')}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving Preferences...' : <><Save className="w-4 h-4" /> Save Notification Settings</>}
          </button>
        </div>
      </div>

      {/* System Specifications Card */}
      <div className="card">
        <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-500" /> MediStock Platform Build Information
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <p className="text-slate-400">Frontend</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">React.js 18 + Tailwind</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <p className="text-slate-400">Backend API</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Spring Boot 3.2 (Java 17)</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <p className="text-slate-400">Security</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">JWT + OAuth2 Google Login</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <p className="text-slate-400">Database Engine</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">PostgreSQL / H2 Memory</p>
          </div>
        </div>
      </div>
    </div>
  )
}
