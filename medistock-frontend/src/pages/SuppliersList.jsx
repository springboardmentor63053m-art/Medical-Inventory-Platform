import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { Users, Plus, Search, Filter, Edit, Trash2, Eye, Download, Mail, Phone, MapPin, MessageSquare, Shield } from 'lucide-react';

export const SuppliersList = () => {
  const { user } = useContext(AuthContext);
  const isStaff = user?.role === 'STAFF' || user?.role === 'VIEWER';

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    supplierName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'USA',
    status: 'ACTIVE',
  });

  const toast = useContext(ToastContext);

  useEffect(() => {
    fetchSuppliers();
  }, [search, statusFilter, page, size]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/suppliers', {
        params: { search, status: statusFilter, page, size, sortBy: 'supplierName', sortDir: 'ASC' }
      });
      const data = res.data?.data;
      let list = [];
      let pages = 1;
      if (Array.isArray(data)) {
        list = data;
      } else if (data?.content && Array.isArray(data.content)) {
        list = data.content;
        pages = data.totalPages || 1;
      } else if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data?.content && Array.isArray(res.data.content)) {
        list = res.data.content;
        pages = res.data.totalPages || 1;
      }
      setSuppliers(list);
      setTotalPages(pages);
    } catch (err) {
      console.error('Fetch suppliers error:', err);
      toast.error('Failed to load suppliers list');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (supplier = null) => {
    if (supplier) {
      setSelectedSupplier(supplier);
      setFormData({
        supplierName: supplier.supplierName || '',
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        city: supplier.city || '',
        state: supplier.state || '',
        country: supplier.country || 'USA',
        status: supplier.status || 'ACTIVE',
      });
    } else {
      setSelectedSupplier(null);
      setFormData({
        supplierName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: 'USA',
        status: 'ACTIVE',
      });
    }
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.supplierName.trim()) {
      toast.error('Supplier Name is required');
      return;
    }

    try {
      if (selectedSupplier) {
        await API.put(`/api/suppliers/${selectedSupplier.id}`, formData);
        toast.success('Supplier updated successfully!');
      } else {
        await API.post('/api/suppliers', formData);
        toast.success('Supplier created successfully!');
      }
      setIsFormModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving supplier details');
    }
  };

  const handleDelete = async () => {
    if (!selectedSupplier) return;
    try {
      await API.delete(`/api/suppliers/${selectedSupplier.id}`);
      toast.success('Supplier deleted successfully');
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete supplier having associated medicines');
    }
  };

  const exportCSV = () => {
    const headers = ['ID,Supplier Name,Contact Person,Email,Phone,City,Status\n'];
    const rows = suppliers.map(s => `"${s.id}","${s.supplierName}","${s.contactPerson}","${s.email}","${s.phone}","${s.city}","${s.status}"\n`);
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medistock-suppliers-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Supplier Management</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            {isStaff ? 'View-only directory of verified pharmaceutical suppliers and contact info' : 'Manage pharmaceutical vendors, contact info, and status'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={exportCSV} className="btn btn-secondary">
            <Download size={16} /> Export CSV
          </button>
          {!isStaff && (
            <button onClick={() => handleOpenForm()} className="btn btn-primary">
              <Plus size={16} /> Add New Supplier
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by supplier name, email, or city..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="input-field"
            style={{ paddingLeft: '42px' }}
          />
        </div>
        <div style={{ width: '180px' }}>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="input-field"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Contact Person</th>
              <th>Contact Details</th>
              <th>Location</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Loading suppliers...</td></tr>
            ) : suppliers.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No suppliers found.</td></tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700, color: '#1e293b' }}>{s.supplierName}</td>
                  <td style={{ color: '#475569' }}>{s.contactPerson || '-'}</td>
                  <td>
                    <div style={{ fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                        <Mail size={13} color="#0284c7" /> {s.email}
                      </div>
                      {s.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginTop: '2px' }}>
                          <Phone size={13} color="#0d9488" /> {s.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
                      <MapPin size={13} /> {s.city ? `${s.city}, ${s.state || ''}` : '-'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${s.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => { setSelectedSupplier(s); setIsDetailsModalOpen(true); }} className="btn btn-secondary btn-sm" title="View Details">
                        <Eye size={14} /> {isStaff && <span>View</span>}
                      </button>
                      {!isStaff && (
                        <>
                          <button onClick={() => handleOpenForm(s)} className="btn btn-secondary btn-sm" title="Edit">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => window.location.href = '/messages'} className="btn btn-secondary btn-sm" title="Direct Communication">
                            <MessageSquare size={14} color="#0284c7" />
                          </button>
                          <button onClick={() => { setSelectedSupplier(s); setIsDeleteDialogOpen(true); }} className="btn btn-danger btn-sm" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          pageSize={size}
          onPageSizeChange={(s) => { setSize(s); setPage(0); }}
        />
      </div>

      {/* Form Modal */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedSupplier ? 'Edit Supplier' : 'Add New Supplier'}>
        <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Supplier Name *
            </label>
            <input
              type="text"
              required
              value={formData.supplierName}
              onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
              className="input-field"
              placeholder="e.g. Pfizer Pharma Distributors"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Contact Person
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="input-field"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="supplier@pharma.com"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="+1 (555) 019-2834"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field"
              placeholder="123 Health Ave, Suite 400"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="input-field"
                placeholder="New York"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="input-field"
                placeholder="NY"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="input-field"
                placeholder="USA"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Supplier</button>
          </div>
        </form>
      </Modal>

      {/* Details View Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Supplier Information Details">
        {selectedSupplier && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0284c7' }}>{selectedSupplier.supplierName}</h3>
              <p style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>Contact Person: {selectedSupplier.contactPerson || 'N/A'}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
              <div><strong>Email:</strong> {selectedSupplier.email || 'N/A'}</div>
              <div><strong>Phone:</strong> {selectedSupplier.phone || 'N/A'}</div>
              <div><strong>City:</strong> {selectedSupplier.city || 'N/A'}</div>
              <div><strong>State:</strong> {selectedSupplier.state || 'N/A'}</div>
              <div><strong>Country:</strong> {selectedSupplier.country || 'N/A'}</div>
              <div><strong>Status:</strong> <span className={`badge ${selectedSupplier.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>{selectedSupplier.status}</span></div>
            </div>
            <div>
              <strong>Address:</strong>
              <p style={{ color: '#475569', marginTop: '4px', fontSize: '14px' }}>{selectedSupplier.address || 'No street address specified.'}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Supplier"
        message={`Are you sure you want to delete supplier "${selectedSupplier?.supplierName}"? This operation will fail if the supplier has active medicines assigned.`}
      />
    </div>
  );
};
