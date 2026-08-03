import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect them immediately to home page
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
      await login(username, password);
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
          To create new user accounts, please contact system administrator.
        </div>
      </div>
    </div>
  );
};

export default Login;
