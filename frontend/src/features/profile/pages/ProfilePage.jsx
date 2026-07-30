import React, { useState, useEffect } from 'react';
import { profileService } from '../../../services/api/profileService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  User,
  ShieldCheck,
  KeyRound,
  Mail,
  Phone,
  Save,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUserProfileState, isAdmin, isPharmacist } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Change Password Form State
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await profileService.getProfile();
      setProfileData(data);
      setProfileForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
      });
    } catch (err) {
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.firstName.trim()) {
      toast.error('First name is required.');
      return;
    }

    setUpdatingProfile(true);
    try {
      const updated = await profileService.updateProfile(profileForm);
      toast.success('Profile updated successfully');
      setProfileData(updated);
      updateUserProfileState(updated);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passForm.currentPassword || !passForm.newPassword || !passForm.confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await profileService.changePassword(passForm);
      toast.success('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password.';
      toast.error(msg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
        <p className="text-sm font-medium">Loading user profile...</p>
      </div>
    );
  }

  const roleLabels = profileData?.roles
    ? Array.from(profileData.roles).map((r) => r.replace('ROLE_', ''))
    : ['STAFF'];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Profile Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-3xl shadow-lg shadow-blue-500/20">
          {profileData?.firstName ? profileData.firstName.charAt(0).toUpperCase() : 'U'}
        </div>

        <div className="text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              {profileData?.firstName} {profileData?.lastName}
            </h1>
            {roleLabels.map((role) => (
              <span
                key={role}
                className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-bold text-[10px] rounded-full border border-blue-200"
              >
                {role}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center justify-center md:justify-start gap-1">
            <Mail className="w-3.5 h-3.5" /> {profileData?.email}
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs">
          <span className="text-slate-400 block text-[10px]">Account Status</span>
          <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" /> Personal Information
          </h2>
          <p className="text-xs text-slate-500 mb-6">Update your account profile details</p>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+1 555-0199"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={profileData?.email || ''}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Email address cannot be changed</span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={updatingProfile}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {updatingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Profile Details
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-600" /> Security & Password
          </h2>
          <p className="text-xs text-slate-500 mb-6">Change your current account password</p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={passForm.currentPassword}
                  onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={passForm.confirmPassword}
                onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {updatingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Updating Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Change Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
