import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Activity,
  ArrowRight,
  ArrowLeft,
  Mail,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Edit3,
  Check,
  AlertCircle
} from 'lucide-react';

export const Login = () => {
  // viewMode: 'login' | 'register' | 'forgot-email' | 'forgot-otp' | 'forgot-newpass' | 'forgot-success'
  const [viewMode, setViewMode] = useState('login');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Registration form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState('Staff');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot Password flow state
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const otpInputsRef = useRef([]);

  const {
    login,
    register,
    requestPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPasswordWithOtp
  } = useContext(AuthContext);
  const toast = useContext(ToastContext);
  const navigate = useNavigate();

  // Countdown timer for OTP
  useEffect(() => {
    let interval = null;
    if (isTimerActive && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setIsTimerActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, otpTimer]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Switch to forgot password flow
  const handleInitiateForgotPassword = () => {
    if (username.trim() && username.includes('@')) {
      setForgotEmail(username.trim());
    }
    setViewMode('forgot-email');
  };

  // Step 1: Send OTP to Email
  const handleSendOtpSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    const result = await requestPasswordResetOtp(forgotEmail);
    setLoading(false);

    if (result.success) {
      toast.success('Verification OTP code sent to your email!');
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(300); // 5 minutes
      setIsTimerActive(true);
      setViewMode('forgot-otp');
      setTimeout(() => {
        if (otpInputsRef.current[0]) {
          otpInputsRef.current[0].focus();
        }
      }, 100);
    } else {
      toast.error(result.message || 'Failed to send OTP. Please check the email.');
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (otpTimer > 240) {
      toast.info('Please wait a moment before requesting a new code');
      return;
    }
    setResendingOtp(true);
    const result = await requestPasswordResetOtp(forgotEmail);
    setResendingOtp(false);

    if (result.success) {
      toast.success('A fresh OTP code has been sent to your email!');
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(300);
      setIsTimerActive(true);
      if (otpInputsRef.current[0]) {
        otpInputsRef.current[0].focus();
      }
    } else {
      toast.error(result.message || 'Failed to resend OTP.');
    }
  };

  // OTP Input handlers
  const handleOtpChange = (index, value) => {
    // Only accept numeric characters
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal && value !== '') return;

    const newOtp = [...otpDigits];
    newOtp[index] = cleanVal ? cleanVal[cleanVal.length - 1] : '';
    setOtpDigits(newOtp);

    // Auto-advance to next input
    if (cleanVal && index < 5 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    setOtpDigits(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    if (otpInputsRef.current[nextIndex]) {
      otpInputsRef.current[nextIndex].focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      toast.error('Please enter the full 6-digit OTP code');
      return;
    }

    setLoading(true);
    const result = await verifyPasswordResetOtp(forgotEmail, fullOtp);
    setLoading(false);

    if (result.success) {
      toast.success('OTP verified! Now choose your new password.');
      setViewMode('forgot-newpass');
    } else {
      toast.error(result.message || 'Invalid or expired OTP code.');
    }
  };

  // Step 3: Reset Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match. Please verify.');
      return;
    }

    const fullOtp = otpDigits.join('');
    setLoading(true);
    const result = await resetPasswordWithOtp(forgotEmail, fullOtp, newPassword);
    setLoading(false);

    if (result.success) {
      toast.success('Password updated successfully!');
      setViewMode('forgot-success');
    } else {
      toast.error(result.message || 'Failed to update password.');
    }
  };

  // Standard Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password');
      return;
    }
    setLoading(true);
    const result = await login(username, password, role);
    setLoading(false);

    if (result.success) {
      toast.success(`Welcome back! Signed in as ${role}`);
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Login failed. Please check your credentials.');
    }
  };

  // Standard Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regFirstName.trim() || !regLastName.trim() || !regEmail.trim() || !regPassword.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    const result = await register({
      firstName: regFirstName,
      lastName: regLastName,
      email: regEmail,
      password: regPassword,
      phone: regPhone,
      role: regRole
    });
    setLoading(false);

    if (result.success) {
      toast.success(result.message || 'Account registered! Logging in...');
      const loginRes = await login(regEmail, regPassword, regRole);
      if (loginRes.success) {
        navigate('/dashboard');
      } else {
        setViewMode('login');
        setUsername(regEmail);
      }
    } else {
      toast.error(result.message || 'Registration failed.');
    }
  };

  // Password strength checker helper
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '#cbd5e1' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: '#ef4444' };
    if (score === 2 || score === 3) return { score: 2, label: 'Medium', color: '#f59e0b' };
    return { score: 3, label: 'Strong', color: '#10b981' };
  };

  const passStrength = getPasswordStrength(newPassword);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, #e0f2fe 0%, #f0fdf4 40%, #f8fafc 100%)',
      padding: '24px 16px',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '24px',
        width: '100%',
        maxWidth: viewMode === 'register' ? '520px' : '440px',
        padding: '36px 32px',
        boxShadow: '0 20px 45px -10px rgba(2, 132, 199, 0.12), 0 4px 12px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.3s ease'
      }}>

        {/* ================= HEADER SECTION ================= */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: viewMode === 'forgot-success'
              ? 'rgba(16, 185, 129, 0.12)'
              : viewMode.startsWith('forgot')
              ? 'rgba(2, 132, 199, 0.12)'
              : 'rgba(2, 132, 199, 0.1)',
            border: viewMode === 'forgot-success'
              ? '1px solid rgba(16, 185, 129, 0.4)'
              : '1px solid rgba(56, 189, 248, 0.4)',
            color: viewMode === 'forgot-success' ? '#10b981' : '#0284c7',
            marginBottom: '14px',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)'
          }}>
            {viewMode === 'login' && <Activity size={28} strokeWidth={2.5} />}
            {viewMode === 'register' && <User size={28} strokeWidth={2.5} />}
            {viewMode === 'forgot-email' && <KeyRound size={28} strokeWidth={2.5} />}
            {viewMode === 'forgot-otp' && <Shield size={28} strokeWidth={2.5} />}
            {viewMode === 'forgot-newpass' && <Lock size={28} strokeWidth={2.5} />}
            {viewMode === 'forgot-success' && <CheckCircle2 size={30} strokeWidth={2.5} />}
          </div>

          <h1 style={{
            fontSize: '25px',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.5px',
            margin: '0 0 6px 0'
          }}>
            {viewMode === 'login' && 'MediStock Portal'}
            {viewMode === 'register' && 'Create Account'}
            {viewMode === 'forgot-email' && 'Forgot Password?'}
            {viewMode === 'forgot-otp' && 'Verify Email OTP'}
            {viewMode === 'forgot-newpass' && 'Set New Password'}
            {viewMode === 'forgot-success' && 'Password Reset!'}
          </h1>

          <p style={{ color: '#64748b', fontSize: '13.5px', margin: 0, lineHeight: 1.5 }}>
            {viewMode === 'login' && 'Sign in to manage medical inventory systems'}
            {viewMode === 'register' && 'Register to access hospital stock & inventory'}
            {viewMode === 'forgot-email' && 'Enter your registered email to receive a 6-digit OTP code.'}
            {viewMode === 'forgot-otp' && `Enter the 6-digit verification code sent to ${forgotEmail}`}
            {viewMode === 'forgot-newpass' && 'Create a strong, secure new password for your account.'}
            {viewMode === 'forgot-success' && 'Your password has been changed successfully. You can now log in.'}
          </p>
        </div>

        {/* ================= 1. LOGIN FORM ================= */}
        {viewMode === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Username / Email */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Email / Username
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    color: '#0f172a',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0284c7';
                    e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
                    e.target.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = '#f8fafc';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleInitiateForgotPassword}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#0369a1'}
                  onMouseLeave={(e) => e.target.style.color = '#0284c7'}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 42px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    color: '#0f172a',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0284c7';
                    e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
                    e.target.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = '#f8fafc';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Select Role */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Select Role
              </label>
              <div style={{ position: 'relative' }}>
                <Shield size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    color: '#0f172a',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="Supplier">Supplier</option>
                </select>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.2s ease',
                marginTop: '4px'
              }}
              onMouseEnter={(e) => e.target.style.filter = 'brightness(1.08)'}
              onMouseLeave={(e) => e.target.style.filter = 'none'}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        )}

        {/* ================= 2. REGISTRATION FORM ================= */}
        {viewMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="John"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    color: '#0f172a',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Doe"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    color: '#0f172a',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Email Address *</label>
              <input
                type="email"
                required
                placeholder="name@medistock.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  color: '#0f172a',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 chars"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 36px 10px 12px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      color: '#0f172a',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Role</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    color: '#0f172a',
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Staff">Staff</option>
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Contact Phone</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  color: '#0f172a',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)',
                transition: 'all 0.2s ease',
                marginTop: '4px'
              }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        )}

        {/* ================= 3. FORGOT PASSWORD - STEP 1: EMAIL ================= */}
        {viewMode === 'forgot-email' && (
          <form onSubmit={handleSendOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Registered Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="email"
                  required
                  autoFocus
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. admin@medistock.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    color: '#0f172a',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0284c7';
                    e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
                    e.target.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = '#f8fafc';
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.2s ease',
                marginTop: '4px'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Sending Verification Code...
                </>
              ) : (
                <>
                  Send OTP Code
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setViewMode('login')}
              style={{
                width: '100%',
                padding: '10px',
                background: 'transparent',
                color: '#64748b',
                border: 'none',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => e.target.style.color = '#0f172a'}
              onMouseLeave={(e) => e.target.style.color = '#64748b'}
            >
              <ArrowLeft size={16} /> Back to Sign In
            </button>
          </form>
        )}

        {/* ================= 4. FORGOT PASSWORD - STEP 2: OTP VERIFICATION ================= */}
        {viewMode === 'forgot-otp' && (
          <form onSubmit={handleVerifyOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#0369a1'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <Mail size={16} style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {forgotEmail}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('forgot-email')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0
                }}
              >
                <Edit3 size={13} /> Change
              </button>
            </div>

            {/* 6-box OTP inputs */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '10px', textAlign: 'center' }}>
                Enter 6-Digit Verification Code
              </label>
              <div
                onPaste={handleOtpPaste}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    style={{
                      width: '46px',
                      height: '52px',
                      textAlign: 'center',
                      fontSize: '22px',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      color: '#0f172a',
                      background: '#f8fafc',
                      border: digit ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                      boxShadow: digit ? '0 0 0 3px rgba(2, 132, 199, 0.12)' : 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0284c7';
                      e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.2)';
                      e.target.style.background = '#ffffff';
                    }}
                    onBlur={(e) => {
                      if (!e.target.value) {
                        e.target.style.borderColor = '#cbd5e1';
                        e.target.style.boxShadow = 'none';
                        e.target.style.background = '#f8fafc';
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Countdown & Resend */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
              <span style={{ color: otpTimer < 60 ? '#ef4444' : '#64748b', fontWeight: 500 }}>
                {otpTimer > 0 ? (
                  <>Expires in: <strong>{formatTimer(otpTimer)}</strong></>
                ) : (
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>Code expired</span>
                )}
              </span>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendingOtp || otpTimer > 240}
                style={{
                  background: 'none',
                  border: 'none',
                  color: (resendingOtp || otpTimer > 240) ? '#94a3b8' : '#0284c7',
                  fontWeight: 700,
                  cursor: (resendingOtp || otpTimer > 240) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0
                }}
              >
                <RefreshCw size={13} className={resendingOtp ? 'animate-spin' : ''} />
                {resendingOtp ? 'Sending...' : 'Resend Code'}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || otpDigits.join('').length !== 6}
              style={{
                width: '100%',
                padding: '13px',
                background: otpDigits.join('').length === 6
                  ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                  : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: otpDigits.join('').length === 6 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: otpDigits.join('').length === 6 ? '0 4px 15px rgba(2, 132, 199, 0.25)' : 'none',
                transition: 'all 0.2s ease',
                marginTop: '4px'
              }}
            >
              {loading ? 'Verifying...' : 'Verify Code & Proceed'}
              {!loading && <ArrowRight size={18} />}
            </button>

            <button
              type="button"
              onClick={() => setViewMode('login')}
              style={{
                width: '100%',
                padding: '8px',
                background: 'transparent',
                color: '#64748b',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={15} /> Cancel & Back to Sign In
            </button>
          </form>
        )}

        {/* ================= 5. FORGOT PASSWORD - STEP 3: NEW PASSWORD ================= */}
        {viewMode === 'forgot-newpass' && (
          <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* New Password */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 42px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    color: '#0f172a',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0284c7';
                    e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
                    e.target.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = '#f8fafc';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Strength:</span>
                    <span style={{ fontWeight: 700, color: passStrength.color }}>{passStrength.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
                    <div style={{ flex: 1, borderRadius: '2px', background: passStrength.score >= 1 ? passStrength.color : '#e2e8f0' }} />
                    <div style={{ flex: 1, borderRadius: '2px', background: passStrength.score >= 2 ? passStrength.color : '#e2e8f0' }} />
                    <div style={{ flex: 1, borderRadius: '2px', background: passStrength.score >= 3 ? passStrength.color : '#e2e8f0' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 42px',
                    background: '#f8fafc',
                    border: confirmNewPassword && newPassword === confirmNewPassword
                      ? '1px solid #10b981'
                      : confirmNewPassword && newPassword !== confirmNewPassword
                      ? '1px solid #ef4444'
                      : '1px solid #cbd5e1',
                    borderRadius: '12px',
                    color: '#0f172a',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0284c7';
                    e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
                    e.target.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = '#f8fafc';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {confirmNewPassword && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '6px',
                  fontSize: '12px',
                  color: newPassword === confirmNewPassword ? '#10b981' : '#ef4444',
                  fontWeight: 600
                }}>
                  {newPassword === confirmNewPassword ? (
                    <>
                      <Check size={14} /> Passwords match
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} /> Passwords do not match
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !newPassword || newPassword !== confirmNewPassword || newPassword.length < 6}
              style={{
                width: '100%',
                padding: '13px',
                background: (newPassword && newPassword === confirmNewPassword && newPassword.length >= 6)
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: (newPassword && newPassword === confirmNewPassword && newPassword.length >= 6) ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: (newPassword && newPassword === confirmNewPassword && newPassword.length >= 6)
                  ? '0 4px 15px rgba(16, 185, 129, 0.25)'
                  : 'none',
                transition: 'all 0.2s ease',
                marginTop: '4px'
              }}
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
              {!loading && <Check size={18} />}
            </button>
          </form>
        )}

        {/* ================= 6. FORGOT PASSWORD - STEP 4: SUCCESS ================= */}
        {viewMode === 'forgot-success' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'center' }}>
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '16px',
              padding: '18px',
              fontSize: '13.5px',
              color: '#166534',
              lineHeight: 1.6
            }}>
              Your MediStock account password has been updated securely. You can now use your new password to sign into the portal.
            </div>

            <button
              type="button"
              onClick={() => {
                setUsername(forgotEmail);
                setPassword('');
                setViewMode('login');
              }}
              style={{
                width: '100%',
                padding: '13px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              Back to Sign In
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ================= BOTTOM TOGGLE / FOOTER ================= */}
        {(viewMode === 'login' || viewMode === 'register') && (
          <div style={{ textAlign: 'center', fontSize: '13.5px', color: '#64748b', marginTop: '20px' }}>
            {viewMode === 'login' ? (
              <div>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setViewMode('register')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '13.5px',
                    textDecoration: 'underline'
                  }}
                >
                  Create an account
                </button>
              </div>
            ) : (
              <div>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '13.5px',
                    textDecoration: 'underline'
                  }}
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
