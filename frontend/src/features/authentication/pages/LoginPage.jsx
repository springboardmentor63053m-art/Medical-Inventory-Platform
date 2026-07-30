import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Pill,
  Package,
  Truck,
  BarChart2
} from 'lucide-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMsg('Please enter your Employee ID or Email Address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // Determine type for logging / future routing readiness
    const isEmail = identifier.includes('@');
    const loginPayload = identifier.trim();

    try {
      await login(loginPayload, password);
      toast.success('Authentication successful! Welcome to MediStock.');
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid credentials. Please check your Employee ID or Email Address.';
      setErrorMsg(msg);
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    toast.info('Please contact your System Administrator to reset your password.');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* LEFT SIDE (40%) - Premium Enterprise Healthcare Panel */}
      <div className="lg:w-[40%] bg-[#0F172A] text-white p-8 lg:p-12 xl:p-16 flex flex-col justify-between relative overflow-hidden min-h-[360px] lg:min-h-screen">
        {/* Subtle low-opacity decorative SVG grid background */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none flex items-center justify-center overflow-hidden">
          <svg className="w-[120%] h-[120%] text-blue-400" viewBox="0 0 800 800" fill="none" stroke="currentColor" strokeWidth="1">
            <line x1="50" y1="200" x2="750" y2="200" strokeDasharray="6 6" />
            <line x1="50" y1="400" x2="750" y2="400" strokeDasharray="6 6" />
            <line x1="50" y1="600" x2="750" y2="600" strokeDasharray="6 6" />
            <line x1="250" y1="50" x2="250" y2="750" strokeDasharray="6 6" />
            <line x1="550" y1="50" x2="550" y2="750" strokeDasharray="6 6" />
          </svg>
        </div>

        {/* Ambient lighting accents */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo & Title Section */}
        <div className="z-10 my-auto lg:my-0">
          <div className="flex items-center gap-4 mb-6">
            {/* Premium Healthcare SVG Logo */}
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-2xl shadow-blue-500/30 border border-blue-400/40 text-white flex-shrink-0">
              <svg className="w-10 h-10 lg:w-12 lg:h-12" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="6" width="26" height="20" rx="4" stroke="white" strokeWidth="2.2" strokeLinejoin="round" fill="none" />
                <path d="M3 13H29" stroke="white" strokeWidth="1.8" strokeOpacity="0.5" />
                <path d="M16 10V22M10 16H22" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="23" cy="9" r="3.5" fill="#60A5FA" stroke="#0F172A" strokeWidth="1.5" />
              </svg>
            </div>

            <div>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-white leading-none">
                Medi<span className="text-blue-500">Stock</span>
              </h1>
              {/* Refined Subtitle */}
              <p className="text-xs lg:text-sm font-semibold tracking-wider text-slate-300 uppercase mt-1.5">
                Enterprise Medical Inventory Platform
              </p>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-xs lg:text-sm font-medium text-slate-200 leading-relaxed max-w-sm mb-8 hidden lg:block">
            Secure inventory management for hospitals and pharmacies.
          </p>

          {/* 4 Compact Feature Rows */}
          <div className="space-y-5 my-8 hidden lg:block">
            <div className="flex items-center gap-4 text-white">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/25 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Pill className="w-5.5 h-5.5" />
              </div>
              <span className="text-base font-bold tracking-wide">Medicine Catalog</span>
            </div>

            <div className="flex items-center gap-4 text-white">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/25 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Package className="w-5.5 h-5.5" />
              </div>
              <span className="text-base font-bold tracking-wide">Inventory Control</span>
            </div>

            <div className="flex items-center gap-4 text-white">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/25 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Truck className="w-5.5 h-5.5" />
              </div>
              <span className="text-base font-bold tracking-wide">Supplier Management</span>
            </div>

            <div className="flex items-center gap-4 text-white">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/25 flex items-center justify-center text-blue-400 flex-shrink-0">
                <BarChart2 className="w-5.5 h-5.5" />
              </div>
              <span className="text-base font-bold tracking-wide">Reports & Analytics</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="z-10 text-xs text-slate-400 font-medium flex items-center justify-between border-t border-slate-800/80 pt-5 mt-6 lg:mt-auto">
          <span>Version 1.0</span>
          <span>© 2026 MediStock</span>
        </div>
      </div>

      {/* RIGHT SIDE (60%) - Clean Enterprise Login Form */}
      <div className="lg:w-[60%] flex-1 bg-[#F8FAFC] p-6 lg:p-12 xl:p-16 flex flex-col justify-center items-center relative overflow-hidden">
        {/* Soft Radial Blue Glow Behind Login Card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] bg-[#2563EB]/[0.06] rounded-full blur-3xl pointer-events-none z-0" />

        {/* Ambient Secondary Glow Accent */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-[#E0F2FE]/40 rounded-full blur-3xl pointer-events-none z-0" />

        {/* Minimal Abstract Background Elements */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
          {/* Reduced Density Dot Grid Pattern */}
          <svg className="absolute inset-0 w-full h-full text-[#60A5FA]/[0.025]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dot-grid-sparse" width="48" height="48" patternUnits="userSpaceOnUse">
                <circle cx="3" cy="3" r="1.2" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-grid-sparse)" />
          </svg>

          {/* Minimal Abstract Elements */}
          <svg
            className="absolute inset-0 w-full h-full text-[#2563EB]/[0.04]"
            viewBox="0 0 1000 800"
            fill="none"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M-100 150 C 200 80, 450 220, 800 120" stroke="#60A5FA" strokeWidth="1" opacity="0.3" />
            <path d="M200 700 C 500 620, 750 780, 1100 650" stroke="#DBEAFE" strokeWidth="1" opacity="0.35" />

            <g strokeWidth="2" strokeLinecap="round">
              <path d="M120 180 V196 M112 188 H128" />
              <path d="M850 140 V156 M842 148 H860" />
              <path d="M160 620 V636 M152 628 H168" />
              <path d="M880 660 V676 M872 668 H888" />
              <path d="M780 320 V336 M772 328 H788" />
            </g>

            <polygon points="220,120 232,128 232,144 220,152 208,144 208,128" strokeWidth="1.2" />
            <polygon points="840,420 854,430 854,450 840,460 826,450 826,430" strokeWidth="1.2" />
            <polygon points="110,400 122,408 122,424 110,432 98,424 98,408" strokeWidth="1.2" />

            <rect x="740" y="200" width="40" height="18" rx="9" transform="rotate(-25 760 209)" strokeWidth="1.4" />
            <rect x="140" y="480" width="38" height="18" rx="9" transform="rotate(15 159 489)" strokeWidth="1.4" />
          </svg>
        </div>

        {/* Login Card Container */}
        <div className="w-full max-w-[580px] my-auto relative z-10">
          <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-2xl shadow-slate-900/10 border border-slate-200/90">
            <div className="mb-6">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0F172A] tracking-tight">Sign In</h2>
              <p className="text-xs lg:text-sm text-slate-500 mt-1">
                Sign in using your Employee ID or official email.
              </p>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
                <span className="font-bold text-rose-600">Error:</span> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Employee ID or Email Address Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Employee ID / Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g EMP001 or staff01@medistock.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs lg:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs lg:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs py-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#2563EB] rounded border-slate-300 focus:ring-[#2563EB]"
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#forgot-password"
                  onClick={handleForgotPassword}
                  className="font-semibold text-[#2563EB] hover:underline"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Large Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xs lg:text-sm rounded-xl shadow-md shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4 text-blue-100" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
