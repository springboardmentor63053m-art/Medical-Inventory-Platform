import { useState, useEffect } from 'react'
import {
  Settings as SettingsIcon, Bell, Mail, Smartphone, Shield,
  CheckCircle2, Save, Cpu, Database, Server, Building2,
  Lock, KeyRound, Download, UploadCloud, RefreshCw, Sun,
  Moon, Monitor, FileText, Printer, Volume2, Barcode,
  Globe, Clock, DollarSign, Receipt, AlertCircle, ShieldCheck,
  Zap, HardDrive, Check, MessageSquare, RotateCcw
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'

const STORAGE_KEY = 'medistock_platform_settings'

const DEFAULT_SETTINGS = {
  // Pharmacy Profile
  pharmacyName: 'MediStock Central Dispensary',
  licenseNo: 'DL-2024-MH-98241A',
  taxId: '27AABCU9603R1ZM',
  currency: 'INR (₹)',
  invoicePrefix: 'MED-2026-',
  timezone: 'Asia/Kolkata (IST)',
  lowStockBuffer: '30',

  // Notifications
  lowStockAlerts: true,
  expiryAlerts: true,
  emailNotifications: true,
  pushNotifications: false,
  dailySummary: true,
  smsUrgentAlerts: false,

  // Hardware & POS
  audioCheckout: true,
  autoPrintReceipt: true,
  rapidBarcodeMode: true,
  defaultTaxRate: '12',

  // Security & Data
  twoFactorAuth: false,
  sessionTimeout: '30',
  autoBackup: 'daily',
  auditLogging: true
}

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSavedSuccess(false)
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      } catch (err) {
        console.error(err)
      }
      setSaving(false)
      setSavedSuccess(true)
      toast.success('MediStock Platform Settings saved successfully! ✓')
    }, 500)
  }

  const handleResetDefaults = () => {
    if (window.confirm('Reset all settings to initial system defaults?')) {
      setSettings(DEFAULT_SETTINGS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS))
      toast.success('Settings reset to default values')
    }
  }

  const handleExportData = () => {
    try {
      const exportPayload = {
        metadata: {
          system: 'MediStock AI Pharmacy Platform',
          exportedAt: new Date().toISOString(),
          version: '3.2.0-PRO'
        },
        settings,
        theme
      }
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', dataStr)
      downloadAnchor.setAttribute('download', `medistock_backup_${new Date().toISOString().split('T')[0]}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
      toast.success('System configuration & data ledger exported successfully!')
    } catch {
      toast.error('Failed to export system data')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25 text-white">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
                MediStock Platform Settings
              </h1>
              <span className="badge badge-blue text-xs font-bold px-2.5 py-0.5">
                v3.2.0 Pro
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 ml-12">
            Dispensary operations profile, notification triggers, hardware POS rules & security governance
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleResetDefaults}
            className="btn-secondary !text-xs !py-2.5 !px-3 font-semibold flex items-center gap-1.5"
            title="Reset to factory defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary !text-xs !py-2.5 !px-5 font-bold flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. Visual Theme Selector */}
      <div className="card !p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500 dark:hidden" />
              <Moon className="w-4 h-4 text-blue-400 hidden dark:inline" />
              Appearance & Interface Theme
            </h2>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
              Choose the visual display mode tailored for clinic lighting and terminal displays
            </p>
          </div>
          <span className="badge badge-teal text-[11px] font-bold self-start sm:self-auto">
            Live Preview Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Light Theme Card */}
          <div
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group ${
              theme === 'light'
                ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/30">
                <Sun className="w-5 h-5" />
              </div>
              {theme === 'light' && (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Light Mode</p>
              <p className="text-xs font-medium text-slate-600 mt-0.5">High-contrast daytime clinic clarity</p>
            </div>
          </div>

          {/* Dark Theme Card */}
          <div
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-950/20 shadow-md ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-500/30">
                <Moon className="w-5 h-5" />
              </div>
              {theme === 'dark' && (
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode (Recommended)</p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                Deep navy OLED palette with low eye strain
              </p>
            </div>
          </div>

          {/* System Theme Card */}
          <div
            onClick={() => setTheme('system')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group ${
              theme === 'system'
                ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-slate-700 text-white flex items-center justify-center shadow-sm">
                <Monitor className="w-5 h-5" />
              </div>
              {theme === 'system' && (
                <div className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">System Synchronized</p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                Automatically matches your OS preference
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Pharmacy Configuration & Dispensary Profile */}
      <div className="card !p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/80">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-500" />
              Pharmacy & Dispensary Profile
            </h2>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
              Legal entity details, license credentials, currency formatting & invoice branding
            </p>
          </div>
          <span className="badge badge-green text-xs font-bold px-2.5 py-0.5">
            Verified License
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="form-label text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Pharmacy / Dispensary Name
            </label>
            <input
              type="text"
              value={settings.pharmacyName}
              onChange={e => updateSetting('pharmacyName', e.target.value)}
              className="form-input text-xs w-full bg-slate-50/60 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="form-label text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Drug License Number
            </label>
            <input
              type="text"
              value={settings.licenseNo}
              onChange={e => updateSetting('licenseNo', e.target.value)}
              className="form-input text-xs w-full bg-slate-50/60 dark:bg-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="form-label text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              GSTIN / Tax Identification
            </label>
            <input
              type="text"
              value={settings.taxId}
              onChange={e => updateSetting('taxId', e.target.value)}
              className="form-input text-xs w-full bg-slate-50/60 dark:bg-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="form-label text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Default Currency & Symbol
            </label>
            <select
              value={settings.currency}
              onChange={e => updateSetting('currency', e.target.value)}
              className="form-select text-xs w-full bg-slate-50/60 dark:bg-slate-800"
            >
              <option value="INR (₹)">Indian Rupee (₹ INR)</option>
              <option value="USD ($)">US Dollar ($ USD)</option>
              <option value="EUR (€)">Euro (€ EUR)</option>
              <option value="GBP (£)">British Pound (£ GBP)</option>
            </select>
          </div>

          <div>
            <label className="form-label text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Invoice Prefix Code
            </label>
            <input
              type="text"
              value={settings.invoicePrefix}
              onChange={e => updateSetting('invoicePrefix', e.target.value)}
              className="form-input text-xs w-full bg-slate-50/60 dark:bg-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="form-label text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Dispensary Operating Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={e => updateSetting('timezone', e.target.value)}
              className="form-select text-xs w-full bg-slate-50/60 dark:bg-slate-800"
            >
              <option value="Asia/Kolkata (IST)">Asia/Kolkata (UTC +05:30)</option>
              <option value="UTC">Coordinated Universal Time (UTC +00:00)</option>
              <option value="America/New_York (EST)">America/New_York (UTC -05:00)</option>
              <option value="Europe/London (BST)">Europe/London (UTC +01:00)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Notification & Reminder System with iOS Style Toggle Switches */}
      <div className="card !p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/80">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              Notification & Reminder System (PDF Module 8)
            </h2>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
              Real-time shortage triggers, batch expiry alarms, automated daily digest & push alerts
            </p>
          </div>
          <span className="badge badge-blue text-xs font-bold px-2.5 py-0.5">
            Active Listeners
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Low Stock */}
          <div
            onClick={() => updateSetting('lowStockAlerts', !settings.lowStockAlerts)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
              settings.lowStockAlerts
                ? 'bg-rose-500/[0.04] dark:bg-rose-950/20 border-rose-500/40 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                settings.lowStockAlerts ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Low-Stock Warnings</p>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                  Instant alarms when drug quantity &lt; reorder threshold level
                </p>
              </div>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative p-0.5 ${
              settings.lowStockAlerts ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.lowStockAlerts ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
          </div>

          {/* Expiry */}
          <div
            onClick={() => updateSetting('expiryAlerts', !settings.expiryAlerts)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
              settings.expiryAlerts
                ? 'bg-amber-500/[0.04] dark:bg-amber-950/20 border-amber-500/40 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                settings.expiryAlerts ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Expiry Warning Cascade</p>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                  Automated alert cascade at 30, 60, and 90 days before expiration
                </p>
              </div>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative p-0.5 ${
              settings.expiryAlerts ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.expiryAlerts ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
          </div>

          {/* Email Notifications */}
          <div
            onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
              settings.emailNotifications
                ? 'bg-blue-500/[0.04] dark:bg-blue-950/20 border-blue-500/40 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                settings.emailNotifications ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Email Digest Delivery</p>
                  <span className="badge badge-blue text-[10px] font-bold px-1.5">JavaMail</span>
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                  Send nightly stock status summaries to administrator inbox
                </p>
              </div>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative p-0.5 ${
              settings.emailNotifications ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
          </div>

          {/* Push Notifications */}
          <div
            onClick={() => updateSetting('pushNotifications', !settings.pushNotifications)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
              settings.pushNotifications
                ? 'bg-purple-500/[0.04] dark:bg-purple-950/20 border-purple-500/40 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                settings.pushNotifications ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Browser Push Alerts</p>
                  <span className="badge badge-purple text-[10px] font-bold px-1.5">FCM</span>
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                  Firebase Cloud Messaging browser notifications for urgent dispense events
                </p>
              </div>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative p-0.5 ${
              settings.pushNotifications ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.pushNotifications ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. POS & Hardware Operations Preferences */}
      <div className="card !p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/80">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-500" />
              POS & Hardware Operations
            </h2>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
              Barcode scanner behavior, audio cues, receipt printing & default GST rates
            </p>
          </div>
          <span className="badge badge-indigo text-xs font-bold px-2.5 py-0.5">
            Checkout Station
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => updateSetting('audioCheckout', !settings.audioCheckout)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
              settings.audioCheckout
                ? 'bg-indigo-500/[0.04] dark:bg-indigo-950/20 border-indigo-500/40 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                settings.audioCheckout ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
              }`}>
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Audio Chime on Checkout</p>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                  Play confirmation sound upon successful POS prescription dispensing
                </p>
              </div>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative p-0.5 ${
              settings.audioCheckout ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.audioCheckout ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
          </div>

          <div
            onClick={() => updateSetting('autoPrintReceipt', !settings.autoPrintReceipt)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
              settings.autoPrintReceipt
                ? 'bg-indigo-500/[0.04] dark:bg-indigo-950/20 border-indigo-500/40 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                settings.autoPrintReceipt ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
              }`}>
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Auto-Trigger Receipt Print</p>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                  Automatically open the browser print dialog once payment is finalized
                </p>
              </div>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative p-0.5 ${
              settings.autoPrintReceipt ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.autoPrintReceipt ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Security & Data Governance Card */}
      <div className="card !p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/80">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Security Governance & Cloud Backup
            </h2>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
              Access control, session timeouts, snapshot frequency & emergency export ledger
            </p>
          </div>
          <button
            onClick={handleExportData}
            className="btn-secondary !text-xs !py-1.5 !px-3 font-semibold flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:border-blue-500"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Configuration</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="form-label text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Automated Snapshot Frequency
            </label>
            <select
              value={settings.autoBackup}
              onChange={e => updateSetting('autoBackup', e.target.value)}
              className="form-select text-xs w-full bg-slate-50/60 dark:bg-slate-800"
            >
              <option value="daily">Daily Midnight Snapshot (Encrypted)</option>
              <option value="weekly">Weekly Archival Snapshot</option>
              <option value="manual">Manual Backup Only</option>
            </select>
          </div>

          <div>
            <label className="form-label text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Session Inactivity Auto-Lock
            </label>
            <select
              value={settings.sessionTimeout}
              onChange={e => updateSetting('sessionTimeout', e.target.value)}
              className="form-select text-xs w-full bg-slate-50/60 dark:bg-slate-800"
            >
              <option value="15">15 Minutes of Inactivity</option>
              <option value="30">30 Minutes (Recommended)</option>
              <option value="60">60 Minutes</option>
              <option value="never">Never (Terminal Mode)</option>
            </select>
          </div>

          <div>
            <label className="form-label text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Default GST / Sales Tax Rate
            </label>
            <select
              value={settings.defaultTaxRate}
              onChange={e => updateSetting('defaultTaxRate', e.target.value)}
              className="form-select text-xs w-full bg-slate-50/60 dark:bg-slate-800"
            >
              <option value="0">0% (Exempt Pharmaceuticals)</option>
              <option value="5">5% Concessional GST</option>
              <option value="12">12% Standard Medicines GST</option>
              <option value="18">18% Healthcare Cosmetics / Devices</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. System Specifications Card */}
      <div className="card !p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/80">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-500" /> MediStock Platform Build Information
          </h2>
          <span className="badge badge-green text-xs font-semibold px-2 py-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Operational • 24ms
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/40">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Frontend Framework</p>
            <p className="font-bold text-slate-900 dark:text-slate-100 mt-1">React.js 18 + TailwindCSS</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/40">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Backend REST Service</p>
            <p className="font-bold text-slate-900 dark:text-slate-100 mt-1">Spring Boot 3.2 (Java 17)</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/40">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Auth & Encryption</p>
            <p className="font-bold text-slate-900 dark:text-slate-100 mt-1">JWT + Spring Security 6</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/40">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Database Persistence</p>
            <p className="font-bold text-slate-900 dark:text-slate-100 mt-1">PostgreSQL 16 / JPA</p>
          </div>
        </div>
      </div>
    </div>
  )
}

