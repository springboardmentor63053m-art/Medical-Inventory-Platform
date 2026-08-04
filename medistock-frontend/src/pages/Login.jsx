import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, User, Lock, Shield, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('ROLE_STAFF');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setLocalError('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    setLocalError('');

    try {
      // Forward-compatible selectedRole parameter
      await login(username, password, selectedRole);
      navigate('/', { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="card login-card">
        <div className="login-header">
          <Activity size={48} />
          <h2>MediStock Portal</h2>
          <p>Sign in to manage medical inventory systems</p>
        </div>

        {localError && (
          <div className="alert alert-danger">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-with-icon">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={submitting}
              />
              <User className="input-icon" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={submitting}
              />
              <Lock className="input-icon" />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={submitting}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">Select Role</label>
            <div className="input-with-icon">
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={submitting}
              >
                <option value="ROLE_ADMIN">Admin</option>
                <option value="ROLE_PHARMACIST">Pharmacist</option>
                <option value="ROLE_STAFF">Staff</option>
              </select>
              <Shield className="input-icon" />
            </div>
          </div>



          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '6px', height: '44px' }}
            disabled={submitting}

          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="login-divider">OR</div>

        <div className="register-section">
          Need a Staff or Pharmacist account?
          <br />
          <Link to="/register" className="register-link">
            Create one here →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
