import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth, getRoleDashboardPath } from '../../../contexts/AuthContext';
import { authService } from '../../../services/api/authService';
import { toast } from 'react-toastify';
import Modal from '../../../components/common/Modal';
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
  BarChart2,
  KeyRound,
  Mail,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Phone,
  UserPlus,
  LogIn
} from 'lucide-react';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // Login state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Register state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Password Reset Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const { login, loginWithToken, isAuthenticated, user, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // If already authenticated, redirect immediately to the appropriate role dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const targetPath = getDashboardPath();
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, getDashboardPath]);

  // Process OAuth2 callback redirect query tokens
  useEffect(() => {
    const oauthToken = searchParams.get('oauthToken');
    if (oauthToken) {
      setLoading(true);
      loginWithToken(oauthToken)
        .then((userData) => {
          toast.success('Signed in successfully with OAuth2!');
          const target = getRoleDashboardPath(userData);
          navigate(target, { replace: true });
        })
        .catch(() => {
          toast.error('OAuth2 authentication failed. Please try again.');
        })
        .finally(() => setLoading(false));
    }
  }, [searchParams]);

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMsg('Please enter your Employee ID or Email Address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const authData = await login(identifier.trim(), password);
      toast.success('Authentication successful! Welcome back to MediStock.');
      
      const targetDashboard = getRoleDashboardPath(authData);
      const destination = (location.state?.from?.pathname && location.state.from.pathname !== '/' && location.state.from.pathname !== '/dashboard')
        ? location.state.from.pathname
        : targetDashboard;

      navigate(destination, { replace: true });
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

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regFirstName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Please fill in all required fields (First Name, Email, Password).');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await authService.register({
        firstName: regFirstName.trim(),
        lastName: regLastName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phone: regPhone.trim(),
      });

      if (res.token) {
        const userData = await loginWithToken(res.token);
        toast.success(`Account created! Welcome to MediStock, ${regFirstName}.`);
        const target = userData ? getRoleDashboardPath(userData) : getDashboardPath();
        navigate(target, { replace: true });
      } else {
        toast.success('Account registered successfully! Please sign in.');
        setAuthMode('login');
        setIdentifier(regEmail);
      }
    } catch (err) {
      console.error('Register error:', err);
      const msg = err.response?.data?.message || 'Registration failed. User may already exist.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    toast.info(`Redirecting to ${provider} OAuth2 authentication...`);
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider.toLowerCase()}`;
  };

  // Password Reset Request Code
  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error('Please enter your registered email address.');
      return;
    }
    setResetLoading(true);
    try {
      const res = await authService.forgotPassword(resetEmail.trim());
      if (res.resetCode) {
        setResetCode(res.resetCode);
      }
      toast.success(res.message || 'Verification code sent to your email!');
      setResetStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset code. Verify your email.');
    } finally {
      setResetLoading(false);
    }
  };

  // Password Reset Confirmation
  const handleConfirmResetPassword = async (e) => {
    e.preventDefault();
    if (!resetCode.trim() || !newPassword || !confirmPassword) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }
    setResetLoading(true);
    try {
      await authService.resetPassword({
        token: resetCode.trim(),
        newPassword,
        confirmPassword,
      });
      toast.success('Password reset successfully! You can now sign in.');
      setResetModalOpen(false);
      setResetStep(1);
      setAuthMode('login');
      setIdentifier(resetEmail);
      setPassword(newPassword);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex flex-col lg:flex-row font-sans text-slate-100 selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* LEFT PANEL (45%) */}
      <div className="lg:w-[45%] bg-slate-900/60 backdrop-blur-xl border-r border-slate-800/80 p-8 lg:p-14 xl:p-16 flex flex-col justify-between relative overflow-hidden min-h-[400px] lg:min-h-screen z-10">
        <div className="space-y-8 my-auto lg:my-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-[1.5px] shadow-xl shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <svg className="w-8 h-8 lg:w-9 lg:h-9 text-blue-400" viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="6" width="24" height="20" rx="4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M4 13H28" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
                  <path d="M16 9V23M9 16H23" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white">
                  Medi<span className="text-blue-500">Stock</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                  Enterprise
                </span>
              </div>
              <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mt-1">
                Medical Inventory & Pharmacy Platform
              </p>
            </div>
          </div>

          <p className="text-sm font-normal text-slate-300 leading-relaxed max-w-md hidden lg:block">
            Streamlined real-time stock monitoring, supplier management, automated reorder thresholds, and role-based access control.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-4 hidden lg:grid">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-blue-500/40 transition duration-300 group">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
                <Pill className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-200 mt-3">Medicine Catalog</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Dosage, category & batch expiry tracking</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-indigo-500/40 transition duration-300 group">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-200 mt-3">Inventory Control</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Real-time alerts & stock level audit</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-emerald-500/40 transition duration-300 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-200 mt-3">Supplier Orders</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Purchase workflows & approvals</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-purple-500/40 transition duration-300 group">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-200 mt-3">Role Security</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Admin, Pharmacist, Supplier & User permissions</p>
            </div>
          </div>
        </div>

        <div className="z-10 text-xs text-slate-500 font-medium flex items-center justify-between border-t border-slate-800/80 pt-5 mt-6 lg:mt-auto">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> System Operational v1.0
          </span>
          <span>© 2026 MediStock Platform</span>
        </div>
      </div>

      {/* RIGHT PANEL (55%) - Glassmorphic Auth Form */}
      <div className="lg:w-[55%] flex-1 p-6 lg:p-12 xl:p-16 flex flex-col justify-center items-center relative z-10">
        <div className="w-full max-w-[500px] my-auto">
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-8 lg:p-10 shadow-2xl border border-slate-800/90 relative">
            
            {/* Mode Switcher Tabs (Sign In vs Sign Up) */}
            <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  authMode === 'login'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  authMode === 'register'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-4 h-4" /> Create Account (Sign Up)
              </button>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Google OAuth2 SSO Login Button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => handleOAuthLogin('Google')}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl text-xs font-semibold text-slate-200 transition-all hover:border-slate-600 active:scale-[0.98]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 10.5 0 12s.6 2.8 1.6 4.8l3.7-2.1z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
                </svg>
                Continue with Google SSO
              </button>
            </div>

            <div className="relative flex items-center justify-center my-5">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-widest absolute">
                {authMode === 'login' ? 'or sign in with email' : 'or sign up with email'}
              </span>
            </div>

            {/* FORM MODE: SIGN IN */}
            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Employee ID / Official Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. ADM001 or admin@medistock.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs lg:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs lg:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 font-medium select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded bg-slate-950 border-slate-700 focus:ring-blue-500"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetModalOpen(true);
                      setResetStep(1);
                    }}
                    className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-xs lg:text-sm rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In to MediStock <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* FORM MODE: SIGN UP / REGISTER */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      First Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder="Smith"
                      className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official Email Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="jane.smith@medistock.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 9999900000"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-xs lg:text-sm rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                    </>
                  ) : (
                    <>
                      Complete Sign Up <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 2-Step Interactive Password Reset Modal */}
      {resetModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setResetModalOpen(false)}
          title="Account Password Recovery"
          subtitle={resetStep === 1 ? 'Step 1 of 2: Enter registered email address' : 'Step 2 of 2: Enter reset code & new password'}
          icon={KeyRound}
          maxWidth="max-w-md"
        >
          {resetStep === 1 ? (
            <form onSubmit={handleRequestResetCode} className="space-y-4 py-2">
              <p className="text-xs text-slate-600">
                Enter your official email address. We will generate a 6-digit verification code to reset your account password.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="e.g. admin@medistock.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  {resetLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Send Verification Code
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleConfirmResetPassword} className="space-y-4 py-2">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Verification code sent to <strong>{resetEmail}</strong></span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full text-center tracking-widest font-mono text-base py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetStep(1)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  ← Back to Email
                </button>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  {resetLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm New Password
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
