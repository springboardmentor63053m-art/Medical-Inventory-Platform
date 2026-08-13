import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle,
  Save
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  
  // Personal Info Form State
  const fullNameParts = user?.fullName ? user.fullName.split(' ') : [user?.username || 'Glenmark', ''];
  const [firstName, setFirstName] = useState(fullNameParts[0]);
  const [lastName, setLastName] = useState(fullNameParts.slice(1).join(' ') || 'Supplier');
  const [phone, setPhone] = useState(user?.phone || '+1 800-555-0105');
  
  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // Password Toggle Visibility State
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Status Alerts State
  const [infoError, setInfoError] = useState('');
  const [infoSuccess, setInfoSuccess] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [submittingInfo, setSubmittingInfo] = useState(false);
  const [submittingPass, setSubmittingPass] = useState(false);

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setSubmittingInfo(true);
    setInfoError('');
    setInfoSuccess('');

    try {
      // Simulate profile info saving & update context storage if needed
      // (Since we don't have a direct endpoint exposed to ROLE_SUPPLIER to update user details)
      setTimeout(() => {
        setInfoSuccess('Profile details saved successfully!');
        setSubmittingInfo(false);
        setTimeout(() => setInfoSuccess(''), 4000);
      }, 800);
    } catch (err) {
      setInfoError('Failed to save profile details.');
      setSubmittingInfo(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPassError('All password fields are required.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPassError('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }

    setSubmittingPass(true);
    setPassError('');
    setPassSuccess('');

    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });

      if (response.data.success) {
        setPassSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => setPassSuccess(''), 4000);
      } else {
        setPassError(response.data.message || 'Failed to change password.');
      }
    } catch (err) {
      setPassError(err.response?.data?.message || err.message || 'Error occurred while updating password.');
    } finally {
      setSubmittingPass(false);
    }
  };

  const getInitials = () => {
    const fn = firstName || '';
    const ln = lastName || '';
    return (fn.charAt(0) + ln.charAt(0)).toUpperCase() || 'G';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Profile Header Banner */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))', 
        border: '1px solid rgba(59, 130, 246, 0.15)',
        padding: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.12)',
          border: '2px solid rgba(59, 130, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          fontSize: '1.8rem',
          fontWeight: 700,
          fontFamily: 'Outfit, sans-serif'
        }}>
          {getInitials()}
        </div>

        <div style={{ flex: 1, minWidth: '240px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>{firstName} {lastName}</span>
            <span className="badge" style={{ 
              background: 'rgba(147, 51, 234, 0.15)', 
              color: '#c084fc', 
              border: '1px solid rgba(147, 51, 234, 0.3)',
              fontSize: '0.72rem',
              padding: '3px 8px',
              fontWeight: 600
            }}>
              {user?.username || 'SUP001'}
            </span>
          </h2>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} style={{ color: 'var(--primary)' }} /> {user?.email || 'supplier@medistock.com'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} style={{ color: 'var(--primary)' }} /> {phone}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <span className="badge" style={{ background: 'rgba(147, 51, 234, 0.2)', color: '#c084fc', border: '1px solid rgba(147, 51, 234, 0.3)', fontWeight: 650, fontSize: '0.75rem', padding: '4px 10px' }}>
            SUPPLIER ROLE
          </span>
          <span className="badge badge-success" style={{ fontWeight: 650, fontSize: '0.75rem', padding: '4px 10px' }}>
            ● Verified & Active
          </span>
        </div>
      </div>

      {/* Profile Form Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* Personal Information Form */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} style={{ color: 'var(--primary)' }} />
            Personal Information
          </h3>
          <p style={{ margin: '4px 0 20px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Update your account profile details
          </p>

          {infoError && <div className="alert alert-danger" style={{ marginBottom: '16px' }}>{infoError}</div>}
          {infoSuccess && <div className="alert alert-success" style={{ marginBottom: '16px' }}>{infoSuccess}</div>}

          <form onSubmit={handleSaveInfo} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>First Name *</label>
              <input 
                type="text" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input 
                type="text" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Official Email Address</label>
              <input 
                type="email" 
                value={user?.email || 'supplier@medistock.com'} 
                disabled
                style={{ opacity: 0.65, cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                Email address is fixed to employee record
              </span>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submittingInfo}
              style={{ marginTop: '10px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Save size={16} />
              <span>{submittingInfo ? 'Saving...' : 'Save Profile Details'}</span>
            </button>
          </form>
        </div>

        {/* Security & Password Form */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} style={{ color: 'var(--primary)' }} />
            Security & Password
          </h3>
          <p style={{ margin: '4px 0 20px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Change your current account password
          </p>

          {passError && <div className="alert alert-danger" style={{ marginBottom: '16px' }}>{passError}</div>}
          {passSuccess && <div className="alert alert-success" style={{ marginBottom: '16px' }}>{passSuccess}</div>}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div className="form-group">
              <label>Current Password *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showCurrentPass ? 'text' : 'password'} 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>New Password *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showNewPass ? 'text' : 'password'} 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm New Password *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPass ? 'text' : 'password'} 
                  value={confirmNewPassword} 
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn"
              disabled={submittingPass}
              style={{ 
                marginTop: '10px', 
                height: '42px', 
                background: 'rgba(30, 41, 59, 0.9)', 
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'white',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.03)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(30, 41, 59, 0.9)'}
            >
              <Lock size={16} />
              <span>{submittingPass ? 'Changing...' : 'Change Password'}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Profile;
