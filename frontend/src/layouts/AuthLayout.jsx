import { Outlet } from 'react-router-dom'

/**
 * AuthLayout — minimal centered layout for Login and Register pages.
 * Features a full-page gradient background with glassmorphism card.
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      {/* Decorative circles */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm
                          rounded-2xl mb-4 shadow-glass">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">MedInventory Pro</h1>
          <p className="text-blue-200 text-sm mt-1">Medical Inventory Management Platform</p>
        </div>

        {/* Auth card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8">
          <Outlet />
        </div>

        <p className="text-center text-blue-200/70 text-xs mt-6">
          © 2024 MedInventory Pro · B.Tech Final Year Project
        </p>
      </div>
    </div>
  )
}
