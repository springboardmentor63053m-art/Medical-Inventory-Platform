import React, { useState, useEffect } from 'react';
import { userService } from '../../../services/api/userService';
import { toast } from 'react-toastify';
import Modal from '../../../components/common/Modal';
import StatusBadge from '../../../components/common/StatusBadge';
import FormField from '../../../components/common/FormField';
import {
  Users,
  Search,
  Edit3,
  Trash2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  User,
  Clock,
  Calendar,
  AlertCircle,
  Shield,
  Info
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit User modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    enabled: true,
    accountNonLocked: true,
    role: 'STAFF',
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to fetch user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenEditModal = (u) => {
    setEditingUser(u);
    const rolesArr = u.roles ? (Array.isArray(u.roles) ? u.roles : Array.from(u.roles)) : [];
    const cleanRoles = rolesArr.map((r) => r.replace('ROLE_', ''));
    const primaryRole = cleanRoles.length > 0 ? cleanRoles[0] : 'STAFF';

    setFormData({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      phone: u.phone || '',
      enabled: u.enabled ?? true,
      accountNonLocked: u.accountNonLocked ?? true,
      role: primaryRole,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim()) {
      toast.error('First name is required.');
      return;
    }

    setSubmitting(true);
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      enabled: formData.enabled,
      accountNonLocked: formData.accountNonLocked,
      roles: [formData.role],
    };

    try {
      await userService.updateUser(editingUser.id, payload);
      toast.success(`User permissions updated (${formData.role} role assigned)`);
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update user';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await userService.deleteUser(deleteId);
      toast.success('User account deleted');
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const empId = (u.employeeId || '').toLowerCase();
    return fullName.includes(q) || email.includes(q) || empId.includes(q);
  });

  const formatDate = (dt) => {
    if (!dt) return 'Never';
    return new Date(dt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Enterprise User Access Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage employee access, single-role hierarchy assignments, last login activity, and security lockouts
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition self-start sm:self-auto"
          title="Refresh user accounts"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Employee ID, name, or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs font-medium text-slate-500">
          Showing <span className="font-bold text-slate-800">{filteredUsers.length}</span> system accounts
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Employee ID / User</th>
                <th className="py-3.5 px-6">Official Email</th>
                <th className="py-3.5 px-6">Assigned Role</th>
                <th className="py-3.5 px-6">Last Login</th>
                <th className="py-3.5 px-6">Created Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Loading user accounts...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No user accounts found matching filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const rolesArr = u.roles
                    ? Array.from(u.roles).map((r) => r.replace('ROLE_', ''))
                    : [];
                  const primaryRole = rolesArr.length > 0 ? rolesArr[0] : 'STAFF';
                  const empId = u.employeeId || `EMP${String(u.id).padStart(3, '0')}`;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {u.firstName ? u.firstName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {u.firstName} {u.lastName}
                            </div>
                            <span className="inline-block px-1.5 py-0.2 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-600 mt-0.5">
                              {empId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-medium text-slate-800">{u.email}</td>

                      <td className="py-4 px-6">
                        <StatusBadge status={primaryRole} />
                      </td>

                      <td className="py-4 px-6 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(u.lastLogin)}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(u.createdAt)}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={u.enabled ? 'ACTIVE' : 'DISABLED'} />
                          {!u.accountNonLocked && <StatusBadge status="LOCKED" label="LOCKED" />}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Permissions"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(u.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal using Reusable Modal Component */}
      <Modal
        isOpen={modalOpen && editingUser !== null}
        onClose={() => setModalOpen(false)}
        title="Edit User Account & Role Permissions"
        subtitle="Manage employee access level, read-only official email, and security settings"
        icon={ShieldCheck}
        footerActions={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Permissions
            </button>
          </>
        }
      >
        {editingUser && (
          <form onSubmit={handleSave} className="space-y-5">
            {/* Account Info Card */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee ID</span>
                <span className="font-mono font-bold text-slate-900">{editingUser.employeeId || `EMP${String(editingUser.id).padStart(3, '0')}`}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Created Date</span>
                <span className="font-medium text-slate-800">{formatDate(editingUser.createdAt)}</span>
              </div>
            </div>

            {/* Read-Only Official Email Field */}
            <FormField label="Official Email Address" readOnly helperText="Email address is fixed to employee account credentials">
              <input
                type="email"
                disabled
                readOnly
                value={editingUser.email}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 cursor-not-allowed"
              />
            </FormField>

            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <FormField label="First Name" required>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </FormField>
              <FormField label="Last Name">
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </FormField>
            </div>

            {/* Enterprise Role Selector */}
            <FormField label="Assigned Enterprise Role" required helperText="Select single primary role for access control">
              <div className="grid grid-cols-1 gap-2 pt-1">
                {[
                  { id: 'SUPER_ADMIN', name: 'Super Admin', desc: 'Full root control across enterprise, organization settings & security logs' },
                  { id: 'SYSTEM_ADMINISTRATOR', name: 'System Administrator', desc: 'System management, user creation, permissions & analytics' },
                  { id: 'INVENTORY_ADMINISTRATOR', name: 'Inventory Administrator', desc: 'Batch control, reorder thresholds & warehouse management' },
                  { id: 'PHARMACY_ADMINISTRATOR', name: 'Pharmacy Administrator', desc: 'Medicine catalog, dosage rules & supplier governance' },
                  { id: 'PHARMACIST', name: 'Staff Pharmacist', desc: 'Medicine dispensing, stock updates & inventory review' },
                  { id: 'STAFF', name: 'Medical Staff', desc: 'Standard stock queries & order creation' },
                ].map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      formData.role === r.id
                        ? 'bg-blue-50 border-blue-500 text-blue-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="userEnterpriseRole"
                      value={r.id}
                      checked={formData.role === r.id}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold text-xs flex items-center gap-2">
                        {r.name}
                        {r.id.includes('ADMIN') && (
                          <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold uppercase">
                            Admin Role
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </FormField>

            {/* Account Status Toggles */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800 select-none">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span>Account Active & Enabled (Can log in to MediStock)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800 select-none">
                <input
                  type="checkbox"
                  checked={formData.accountNonLocked}
                  onChange={(e) => setFormData({ ...formData, accountNonLocked: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span>Account Unlocked</span>
              </label>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete User Confirmation */}
      {deleteId && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteId(null)}
          title="Delete User Account?"
          subtitle="Permanent account deletion"
          icon={AlertCircle}
          maxWidth="max-w-md"
          footerActions={
            <>
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Delete
              </button>
            </>
          }
        >
          <div className="text-center py-3">
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete user account #{deleteId}?
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
