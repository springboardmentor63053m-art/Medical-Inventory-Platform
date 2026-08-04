import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('ROLE_STAFF');
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Select Role</label>
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
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '10px', height: '44px' }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          New staff or pharmacist accounts can be created from the registration page.
          <br />
          <Link to="/register" style={{ color: 'var(--primary)', marginTop: '6px', display: 'inline-block' }}>Create account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
