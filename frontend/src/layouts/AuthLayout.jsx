import { Outlet } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { Activity, Shield, Zap, Sparkles, Server, Database, Globe, Cpu } from 'lucide-react'

const features = [
  {
    icon: Shield,
    label: 'JWT & OAuth2 Security',
    desc: 'Spring Security with role-based access',
    highlight: false
  },
  {
    icon: Zap,
    label: 'Real-time Stock Alerts',
    desc: 'Low-stock & near-expiry notifications',
    highlight: false
  },
  {
    icon: Sparkles,
    label: 'AI Analytics & Prescription Intelligence',
    desc: 'AI-powered forecasting, OCR & prescription processing',
    highlight: true
  },
]

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-colors duration-500 bg-slate-50 dark:bg-[#070d1e]">

      {/* ── LEFT PANEL: BRANDING HERO (50% WIDTH) ── */}
      <div
        className="flex md:w-1/2 relative overflow-hidden flex-col justify-between p-8 sm:p-12 lg:p-16 select-none min-h-[480px] md:min-h-screen"
        style={{ background: 'linear-gradient(145deg, #050b18 0%, #0a1832 35%, #08203d 70%, #06142a 100%)' }}
      >
        {/* Glowing Ambient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />

        {/* Top Header Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-teal-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight font-display">MediStock</h1>
              <p className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider">MEDICAL INVENTORY PLATFORM</p>
            </div>
          </div>
        </div>

        {/* Center Main Pitch & Features */}
        <div className="relative z-10 space-y-6 max-w-lg my-8 md:my-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-4">
              <Globe className="w-3.5 h-3.5" /> Full-Stack React.js + Spring Boot
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight font-display">
              Healthcare & Pharmacy<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-cyan-400">
                Inventory Intelligence
              </span>
            </h2>
            <p className="text-slate-300/90 mt-4 leading-relaxed text-sm">
              Manage medicine availability, track batch expiry dates, maintain supplier profiles, and run real-time inventory analytics seamlessly.
            </p>
          </div>

          {/* Feature list cards */}
          <div className="space-y-3.5">
            {features.map(({ icon: Icon, label, desc, highlight }) => (
              <div
                key={label}
                className={`flex items-center gap-4 px-4.5 py-3.5 rounded-2xl backdrop-blur-sm transition-all ${
                  highlight
                    ? 'bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-transparent border border-teal-400/30 shadow-sm shadow-teal-500/10'
                    : 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  highlight
                    ? 'bg-gradient-to-br from-teal-500/30 to-blue-500/30 border-teal-400/30 text-teal-300 shadow-xs'
                    : 'bg-gradient-to-br from-blue-500/20 to-teal-500/20 border-white/10 text-cyan-300'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-semibold">{label}</p>
                    {highlight && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-400/20 text-teal-300 border border-teal-400/30 uppercase tracking-wider">
                        Core AI
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 font-medium pt-4 border-t border-white/[0.06]">
          <p>© 2026 MediStock · Production Architecture</p>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>Spring Boot</span>
            <span>·</span>
            <span>PostgreSQL</span>
            <span>·</span>
            <span className="text-cyan-400 font-bold">AI</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: AUTH CARD (50% WIDTH) ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-12 relative bg-[#f8fafc] dark:bg-[#070d1e] transition-colors duration-500 min-h-screen">
        {/* Theme Pill Toggle */}
        <div className="absolute top-5 right-5 z-20">
          <ThemeToggle variant="pill" />
        </div>

        {/* Auth Card Container - Enlarged by 6-8% with generous breathing room */}
        <div className="w-full max-w-[495px] animate-scale-up my-auto py-4">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-8 sm:p-10 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.07)] dark:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.6)] border border-slate-200/80 dark:border-slate-800">
            <Outlet />
          </div>

          <p className="text-center text-slate-400 dark:text-slate-500 text-[11px] font-medium mt-6">
            MediStock v2.5 · Intelligent Pharmacy Management Platform
          </p>
        </div>
      </div>
    </div>
  )
}
