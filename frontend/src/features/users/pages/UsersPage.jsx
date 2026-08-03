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
  UserPlus,
  Clock,
  Calendar,
  AlertCircle,
  Shield,
  Stethoscope,
  Building2,
  Filter,
  CheckCircle2,
  UserX
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Create User modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'USER',
  });

  // Edit User modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    enabled: true,
    accountNonLocked: true,
    role: 'USER',
  });

  // Delete state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  // Handle Create User Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.firstName.trim() || !createForm.email.trim() || !createForm.password) {
      toast.error('Please fill in all required fields (First Name, Email, Password).');
      return;
    }

    setCreatingUser(true);
    try {
      await userService.createUser({
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        phone: createForm.phone.trim(),
        role: createForm.role,
      });
      toast.success(`New ${createForm.role} account created successfully!`);
      setCreateModalOpen(false);
      setCreateForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'STAFF',
      });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user account');
    } finally {
      setCreatingUser(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (u) => {
    setEditingUser(u);
    const rolesArr = u.roles ? (Array.isArray(u.roles) ? u.roles : Array.from(u.roles)) : [];
    const cleanRoles = rolesArr.map((r) => r.replace('ROLE_', '').toUpperCase());
    const primaryRole = cleanRoles.length > 0 ? cleanRoles[0] : 'STAFF';

    setEditForm({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      phone: u.phone || '',
      enabled: u.enabled ?? true,
      accountNonLocked: u.accountNonLocked ?? true,
      role: primaryRole,
    });
    setEditModalOpen(true);
  };

  // Save Edit User
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.firstName.trim()) {
      toast.error('First name is required.');
      return;
    }

    setSubmitting(true);
    const payload = {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      phone: editForm.phone,
      enabled: editForm.enabled,
      accountNonLocked: editForm.accountNonLocked,
      roles: [editForm.role],
    };

    try {
      await userService.updateUser(editingUser.id, payload);
      toast.success(`User permissions updated (${editForm.role} role assigned)`);
      setEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete User
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

  // Role Stats Calculations
  const adminCount = users.filter((u) => u.roles && Array.from(u.roles).some((r) => r.includes('ADMIN'))).length;
  const pharmacistCount = users.filter((u) => u.roles && Array.from(u.roles).some((r) => r.includes('PHARMACIST'))).length;
  const staffCount = users.filter((u) => u.roles && Array.from(u.roles).some((r) => r.includes('STAFF'))).length;
  const userCount = users.filter((u) => u.roles && Array.from(u.roles).some((r) => r.includes('USER'))).length;

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const empId = (u.employeeId || '').toLowerCase();
    const matchesSearch = fullName.includes(q) || email.includes(q) || empId.includes(q);

    if (roleFilter === 'ALL') return matchesSearch;
    const rolesArr = u.roles ? Array.from(u.roles).map((r) => r.replace('ROLE_', '').toUpperCase()) : [];
    return matchesSearch && rolesArr.includes(roleFilter);
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
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-3xl text-white shadow-xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-blue-400" /> Enterprise Role & User Management
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Manage system access tiers, role permissions (Admin, Pharmacist, Staff, User), and employee accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Create New Account
          </button>
          <button
            onClick={fetchUsers}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl border border-slate-700 transition"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Role Summary Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setRoleFilter(roleFilter === 'ADMIN' ? 'ALL' : 'ADMIN')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            roleFilter === 'ADMIN'
              ? 'bg-purple-900/20 border-purple-500 shadow-lg shadow-purple-500/10'
              : 'bg-white border-slate-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Admin Role</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{adminCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Full system governance & user management</p>
        </div>

        <div
          onClick={() => setRoleFilter(roleFilter === 'PHARMACIST' ? 'ALL' : 'PHARMACIST')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            roleFilter === 'PHARMACIST'
              ? 'bg-emerald-900/20 border-emerald-500 shadow-lg shadow-emerald-500/10'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Pharmacist Role</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{pharmacistCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Medicine catalog, batch stock & supplier orders</p>
        </div>

        <div
          onClick={() => setRoleFilter(roleFilter === 'STAFF' ? 'ALL' : 'STAFF')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            roleFilter === 'STAFF'
              ? 'bg-blue-900/20 border-blue-500 shadow-lg shadow-blue-500/10'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Staff Role</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{staffCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Standard inventory lookup & dispenses</p>
        </div>

        <div
          onClick={() => setRoleFilter(roleFilter === 'USER' ? 'ALL' : 'USER')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            roleFilter === 'USER'
              ? 'bg-slate-900/20 border-slate-500 shadow-lg shadow-slate-500/10'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">User Role</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{userCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Standard read-only catalog lookup</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
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

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Filter Role:</span>
          {['ALL', 'ADMIN', 'PHARMACIST', 'STAFF', 'USER'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                roleFilter === r
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">User / Employee ID</th>
                <th className="py-3.5 px-6">Official Email</th>
                <th className="py-3.5 px-6">Assigned Role</th>
                <th className="py-3.5 px-6">Last Active</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Loading user accounts...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No user accounts found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const rolesArr = u.roles ? Array.from(u.roles).map((r) => r.replace('ROLE_', '').toUpperCase()) : [];
                  const primaryRole = rolesArr.length > 0 ? rolesArr[0] : 'STAFF';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center text-white ${
                            primaryRole === 'ADMIN' ? 'bg-purple-600' : primaryRole === 'PHARMACIST' ? 'bg-emerald-600' : 'bg-blue-600'
                          }`}>
                            {u.firstName ? u.firstName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {u.firstName} {u.lastName}
                            </div>
                            <span className="inline-block px-1.5 py-0.2 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-600 mt-0.5">
                              {u.employeeId || `EMP${String(u.id).padStart(3, '0')}`}
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

                      <td className="py-4 px-6">
                        <StatusBadge status={u.enabled ? 'ACTIVE' : 'DISABLED'} />
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit User Role"
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

      {/* CREATE NEW USER MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Employee Account"
        subtitle="Add a new system user and assign their access tier (Admin, Pharmacist, Staff)"
        icon={UserPlus}
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First Name" required>
              <input
                type="text"
                required
                value={createForm.firstName}
                onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                placeholder="John"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </FormField>

            <FormField label="Last Name">
              <input
                type="text"
                value={createForm.lastName}
                onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                placeholder="Doe"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </FormField>
          </div>

          <FormField label="Official Email Address" required>
            <input
              type="email"
              required
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              placeholder="employee@medistock.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Initial Password" required>
              <input
                type="password"
                required
                minLength={6}
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </FormField>

            <FormField label="Phone Number">
              <input
                type="text"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                placeholder="+91 9999900000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </FormField>
          </div>

          <FormField label="Assigned System Role" required>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { id: 'ADMIN', label: 'Admin', desc: 'Full Control' },
                { id: 'PHARMACIST', label: 'Pharmacist', desc: 'Catalog & Stock' },
                { id: 'STAFF', label: 'Staff', desc: 'Stock Ops' },
                { id: 'USER', label: 'User', desc: 'Read-Only' },
              ].map((r) => (
                <label
                  key={r.id}
                  className={`p-3 rounded-xl border cursor-pointer text-center transition ${
                    createForm.role === r.id
                      ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="newRole"
                    value={r.id}
                    checked={createForm.role === r.id}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="sr-only"
                  />
                  <div className="text-xs">{r.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{r.desc}</div>
                </label>
              ))}
            </div>
          </FormField>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingUser}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
            >
              {creatingUser && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Account
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER ROLE MODAL */}
      {editModalOpen && editingUser && (
        <Modal
          isOpen={true}
          onClose={() => setEditModalOpen(false)}
          title="Edit User Role & Permissions"
          subtitle={`Updating permissions for ${editingUser.firstName} ${editingUser.lastName}`}
          icon={ShieldCheck}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3 font-mono text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee ID</span>
                <span className="font-bold text-slate-900">{editingUser.employeeId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                <span className="font-bold text-slate-900">{editingUser.email}</span>
              </div>
            </div>

            <FormField label="Assigned Role" required>
              <div className="grid grid-cols-4 gap-2 pt-1">
                {['ADMIN', 'PHARMACIST', 'STAFF', 'USER'].map((r) => (
                  <label
                    key={r}
                    className={`p-3 rounded-xl border cursor-pointer text-center transition ${
                      editForm.role === r
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="editRole"
                      value={r}
                      checked={editForm.role === r}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="sr-only"
                    />
                    <div className="text-xs font-bold">{r}</div>
                  </label>
                ))}
              </div>
            </FormField>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={editForm.enabled}
                  onChange={(e) => setEditForm({ ...editForm, enabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Account Active & Enabled</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteId && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteId(null)}
          title="Delete Account?"
          subtitle="Confirm user deletion"
          icon={AlertCircle}
          maxWidth="max-w-sm"
        >
          <div className="py-2 text-center">
            <p className="text-xs text-slate-600">
              Are you sure you want to delete user account #{deleteId}?
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-1"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
