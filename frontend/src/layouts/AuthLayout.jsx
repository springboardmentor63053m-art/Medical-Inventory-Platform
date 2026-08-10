import { Outlet } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { Activity, Shield, Zap, TrendingUp, Cpu, Server, Database } from 'lucide-react'

const features = [
  { icon: Shield,     label: 'JWT & OAuth2 Security',  desc: 'Spring Security with role-based access' },
  { icon: Zap,        label: 'Real-time Stock Alerts', desc: 'Low-stock & near-expiry notifications' },
  { icon: TrendingUp, label: 'Analytics & PDF Export',  desc: 'Automated reporting & data exports' },
]

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex transition-colors duration-500 bg-[#070d1e]">

      {/* Left panel (branding) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
           style={{ background: 'linear-gradient(145deg, #050b18 0%, #0d1e3d 40%, #092342 70%, #061830 100%)' }}>

        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03]"
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* Top Header Logo */}
        <div className="relative">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-teal-500 to-cyan-500 rounded-2xl
                              flex items-center justify-center shadow-2xl shadow-blue-500/30
                              ring-1 ring-white/20">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/40 to-teal-500/20 rounded-2xl blur-lg -z-10" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight font-display">MediStock</h1>
              <p className="text-blue-400 font-semibold text-xs tracking-wider uppercase">Medical Inventory Platform</p>
            </div>
          </div>
        </div>

        {/* Main Copy */}
        <div className="relative space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-4">
              <Cpu className="w-3.5 h-3.5" /> Full-Stack React.js + Spring Boot
            </div>
            <h2 className="text-4xl font-extrabold text-white leading-tight font-display">
              Healthcare & Pharmacy<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-cyan-400">
                Inventory Intelligence
              </span>
            </h2>
            <p className="text-slate-400 mt-4 leading-relaxed max-w-md text-sm">
              Manage medicine availability, track batch expiry dates, maintain supplier profiles,
              and run real-time inventory analytics seamlessly.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4 px-4 py-3 rounded-2xl
                                           bg-white/[0.04] border border-white/[0.08]
                                           backdrop-blur-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-teal-500/20 rounded-xl
                                flex items-center justify-center flex-shrink-0 border border-white/10">
                  <Icon className="w-4.5 h-4.5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{label}</p>
                  <p className="text-slate-400 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex items-center justify-between text-xs text-slate-500">
          <p>© 2026 MediStock · Production Architecture</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-400"><Server className="w-3.5 h-3.5" /> Spring Boot</span>
            <span className="flex items-center gap-1 text-slate-400"><Database className="w-3.5 h-3.5" /> PostgreSQL</span>
          </div>
        </div>
      </div>

      {/* Right panel (auth forms) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative
                      bg-slate-50 dark:bg-[#070d1e] transition-colors duration-500">

        {/* Theme Pill Toggle */}
        <div className="absolute top-5 right-5 z-20">
          <ThemeToggle variant="pill" />
        </div>

        {/* Mobile Header Branding */}
        <div className="lg:hidden mb-8 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl
                          flex items-center justify-center shadow-xl shadow-blue-500/30 mx-auto mb-3">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">MediStock</h1>
          <p className="text-blue-500 text-xs font-semibold tracking-wider uppercase mt-0.5">Medical Inventory Platform</p>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md animate-slide-up">
          <div className="
            bg-white dark:bg-slate-900
            rounded-3xl p-8
            shadow-[0_20px_80px_-20px_rgba(0,0,0,0.12)]
            dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)]
            border border-slate-100 dark:border-slate-800
          ">
            <Outlet />
          </div>

          <p className="text-center text-slate-400 dark:text-slate-600 text-[11px] mt-6">
            MediStock v2.5 · Medical Inventory Management Platform
          </p>
        </div>
      </div>
    </div>
  )
}
