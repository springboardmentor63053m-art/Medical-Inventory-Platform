import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    roles: ['ROLE_STAFF']
  });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    if (!formData.username || !formData.email || !formData.password) {
      setLocalError('Please fill in username, email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        ...formData,
        roles: [formData.roles[0]]
      });
      setSuccessMessage('Account created successfully. You can sign in now.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setLocalError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="card login-card">
        <div className="login-header">
          <UserPlus size={48} />
          <h2>Create Account</h2>
          <p>Register a new pharmacist or staff account</p>
        </div>

        {localError && <div className="alert alert-danger">{localError}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input name="username" id="username" value={formData.username} onChange={handleChange} placeholder="Enter username" required disabled={submitting} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} placeholder="Enter email" required disabled={submitting} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} placeholder="Create password" required disabled={submitting} />
          </div>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter full name" disabled={submitting} />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input name="phone" id="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone" disabled={submitting} />
          </div>
          <div className="form-group">
            <label htmlFor="role">Account Role</label>
            <select name="roles" id="role" value={formData.roles[0]} onChange={(e) => setFormData((prev) => ({ ...prev, roles: [e.target.value] }))} disabled={submitting}>
              <option value="ROLE_STAFF">Staff</option>
              <option value="ROLE_PHARMACIST">Pharmacist</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px' }} disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
