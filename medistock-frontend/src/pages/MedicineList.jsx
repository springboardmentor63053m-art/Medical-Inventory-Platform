import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { Pill, Plus, Search, Filter, Edit, Trash2, Eye, Download, Tag, Factory, DollarSign, Layers } from 'lucide-react';

export const MedicineList = () => {
  const { user } = useContext(AuthContext);
  const isStaff = user?.role === 'STAFF' || user?.role === 'VIEWER';

  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('medicineName');
  const [sortDir, setSortDir] = useState('ASC');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    medicineCode: '',
    medicineName: '',
    genericName: '',
    category: '',
    manufacturer: '',
    unitPrice: 0,
    sellingPrice: 0,
    batchNumber: '',
    description: '',
    supplierId: '',
    initialQuantity: 100,
    minimumStock: 10,
    maximumStock: 500,
    location: 'Main Pharmacy',
  });

  const toast = useContext(ToastContext);

  useEffect(() => {
    fetchMedicines();
    fetchCategories();
    fetchSuppliers();
  }, [search, categoryFilter, supplierFilter, stockStatusFilter, page, size, sortBy, sortDir]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const params = {
        search: search || undefined,
        category: categoryFilter || undefined,
        supplierId: supplierFilter || undefined,
        stockStatus: stockStatusFilter || undefined,
        page,
        size,
        sortBy,
        sortDir
      };

      const res = await API.get('/api/medicines', { params });
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
      setMedicines(list);
      setTotalPages(pages);
    } catch (err) {
      console.error('Fetch medicines error:', err);
      toast.error('Failed to load medicines list');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get('/api/medicines/categories');
      setCategories(res.data?.data || res.data || []);
    } catch (err) {}
  };

  const fetchSuppliers = async () => {
    try {
      let res;
      try {
        res = await API.get('/api/suppliers/active');
      } catch (e) {
        res = await API.get('/api/suppliers');
      }
      const data = res.data?.data;
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data?.content && Array.isArray(data.content)) {
        list = data.content;
      } else if (Array.isArray(res.data)) {
        list = res.data;
      }
      setSuppliers(list);
    } catch (err) {
      console.error('Fetch suppliers for dropdown error:', err);
    }
  };

  const handleOpenForm = (med = null) => {
    if (med) {
      setSelectedMedicine(med);
      setFormData({
        medicineCode: med.medicineCode || '',
        medicineName: med.medicineName || '',
        genericName: med.genericName || '',
        category: med.category || '',
        manufacturer: med.manufacturer || '',
        unitPrice: med.unitPrice || 0,
        sellingPrice: med.sellingPrice || 0,
        batchNumber: med.batchNumber || '',
        description: med.description || '',
        supplierId: med.supplierId || (suppliers[0]?.id || ''),
        initialQuantity: med.currentStock || 100,
        minimumStock: med.minimumStock || 10,
        maximumStock: med.maximumStock || 500,
        location: med.location || 'Main Pharmacy',
      });
    } else {
      setSelectedMedicine(null);
      setFormData({
        medicineCode: 'MED-' + Math.floor(1000 + Math.random() * 9000),
        medicineName: '',
        genericName: '',
        category: 'Antibiotics',
        manufacturer: 'Pfizer Global',
        unitPrice: 5.00,
        sellingPrice: 12.50,
        batchNumber: 'BATCH-' + Math.floor(10000 + Math.random() * 90000),
        description: '',
        supplierId: suppliers[0]?.id || '',
        initialQuantity: 100,
        minimumStock: 15,
        maximumStock: 500,
        location: 'Main Pharmacy Shelf A',
      });
    }
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.medicineName.trim()) {
      toast.error('Medicine Name is required');
      return;
    }
    if (formData.unitPrice < 0 || formData.sellingPrice < 0) {
      toast.error('Prices cannot be negative');
      return;
    }

    try {
      if (selectedMedicine) {
        await API.put(`/api/medicines/${selectedMedicine.id}`, formData);
        toast.success('Medicine updated successfully!');
      } else {
        await API.post('/api/medicines', formData);
        toast.success('Medicine created successfully!');
      }
      setIsFormModalOpen(false);
      fetchMedicines();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving medicine catalogue details');
    }
  };

  const handleDelete = async () => {
    if (!selectedMedicine) return;
    try {
      await API.delete(`/api/medicines/${selectedMedicine.id}`);
      toast.success('Medicine removed from catalogue');
      fetchMedicines();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete medicine');
    }
  };

  const exportCSV = () => {
    const headers = ['ID,Medicine Code,Name,Generic Name,Category,Manufacturer,Purchase Price,Selling Price,Batch #\n'];
    const rows = medicines.map(m => `"${m.id}","${m.medicineCode}","${m.medicineName}","${m.genericName}","${m.category}","${m.manufacturer}","${m.unitPrice}","${m.sellingPrice}","${m.batchNumber}"\n`);
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medistock-catalogue-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Medicine Inventory Catalogue</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            {isStaff ? 'View-only catalogue of pharmaceutical items and inventory status' : 'Pharmaceutical items, generic names, pricing, and stock status'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={exportCSV} className="btn btn-secondary">
            <Download size={16} /> Export CSV
          </button>
          {!isStaff && (
            <button onClick={() => handleOpenForm()} className="btn btn-primary">
              <Plus size={16} /> Add New Medicine
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Panel */}
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
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by name, code, generic, batch #..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="input-field"
            style={{ paddingLeft: '42px' }}
          />
        </div>
        <div style={{ width: '160px' }}>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
            className="input-field"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div style={{ width: '170px' }}>
          <select
            value={supplierFilter}
            onChange={(e) => { setSupplierFilter(e.target.value); setPage(0); }}
            className="input-field"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.supplierName}</option>
            ))}
          </select>
        </div>
        <div style={{ width: '160px' }}>
          <select
            value={stockStatusFilter}
            onChange={(e) => { setStockStatusFilter(e.target.value); setPage(0); }}
            className="input-field"
          >
            <option value="">All Stock Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
        {(search || categoryFilter || supplierFilter || stockStatusFilter) && (
          <button
            onClick={() => {
              setSearch('');
              setCategoryFilter('');
              setSupplierFilter('');
              setStockStatusFilter('');
              setPage(0);
            }}
            className="btn btn-secondary btn-sm"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Medicines Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Code & Name</th>
              <th>Category</th>
              <th>Manufacturer</th>
              <th>Batch #</th>
              <th>Pricing</th>
              <th>Supplier</th>
              <th>Stock Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Loading medicine catalogue...</td></tr>
            ) : medicines.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No medicines found matching criteria.</td></tr>
            ) : (
              medicines.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{m.medicineName}</div>
                      <div style={{ fontSize: '12px', color: '#0284c7', display: 'flex', gap: '8px', marginTop: '2px' }}>
                        <span>{m.medicineCode}</span>
                        {m.genericName && <span>• {m.genericName}</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">
                      <Tag size={12} /> {m.category || 'General'}
                    </span>
                  </td>
                  <td style={{ color: '#475569' }}>{m.manufacturer || '-'}</td>
                  <td style={{ color: '#64748b', fontSize: '13px' }}>{m.batchNumber || '-'}</td>
                  <td>
                    <div style={{ fontSize: '13px' }}>
                      <div style={{ color: '#059669', fontWeight: 700 }}>Buy: ₹{m.unitPrice}</div>
                      <div style={{ color: '#0284c7', fontWeight: 700 }}>Sell: ₹{m.sellingPrice}</div>
                    </div>
                  </td>
                  <td style={{ color: '#475569' }}>{m.supplierName || 'N/A'}</td>
                  <td>
                    {m.quantity !== undefined && m.quantity !== null ? (
                      <span className={`badge ${
                        m.quantity === 0 ? 'badge-danger' :
                        (m.minimumStock && m.quantity < m.minimumStock) ? 'badge-warning' : 'badge-success'
                      }`}>
                        {m.quantity === 0 ? 'Out of Stock' :
                         (m.minimumStock && m.quantity < m.minimumStock) ? `Low (${m.quantity})` : `In Stock (${m.quantity})`}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => { setSelectedMedicine(m); setIsDetailsModalOpen(true); }} className="btn btn-secondary btn-sm" title="View Details">
                        <Eye size={14} /> {isStaff && <span>View</span>}
                      </button>
                      {!isStaff && (
                        <>
                          <button onClick={() => handleOpenForm(m)} className="btn btn-secondary btn-sm" title="Edit">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => { setSelectedMedicine(m); setIsDeleteDialogOpen(true); }} className="btn btn-danger btn-sm" title="Delete">
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
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedMedicine ? 'Edit Medicine Catalogue' : 'Add New Medicine'}>
        <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Medicine Code *</label>
              <input
                type="text"
                required
                value={formData.medicineCode}
                onChange={(e) => setFormData({ ...formData, medicineCode: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Medicine Name *</label>
              <input
                type="text"
                required
                value={formData.medicineName}
                onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                className="input-field"
                placeholder="e.g. Amoxicillin Trihydrate"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Generic Name</label>
              <input
                type="text"
                value={formData.genericName}
                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                className="input-field"
                placeholder="e.g. Amoxicillin"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
                placeholder="e.g. Antibiotics"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Manufacturer</label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="input-field"
                placeholder="e.g. Pfizer Inc"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Supplier</label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="input-field"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.supplierName}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Purchase Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Selling Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Batch Number</label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {!selectedMedicine && (
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0284c7', marginBottom: '12px' }}>Initial Inventory Setup</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>Initial Stock Qty</label>
                  <input
                    type="number"
                    value={formData.initialQuantity}
                    onChange={(e) => setFormData({ ...formData, initialQuantity: parseInt(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>Minimum Threshold</label>
                  <input
                    type="number"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: parseInt(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Description / Medical Usage</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              placeholder="Dosage instructions, contraindications..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Medicine</button>
          </div>
        </form>
      </Modal>

      {/* Medicine Details View Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Medicine Specification Sheet">
        {selectedMedicine && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{selectedMedicine.medicineName}</h3>
                <span className="badge badge-info">{selectedMedicine.medicineCode}</span>
              </div>
              <p style={{ color: '#0284c7', fontSize: '13px', marginTop: '4px' }}>Generic: {selectedMedicine.genericName || 'N/A'}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
              <div><strong>Category:</strong> {selectedMedicine.category}</div>
              <div><strong>Manufacturer:</strong> {selectedMedicine.manufacturer}</div>
              <div><strong>Batch Number:</strong> {selectedMedicine.batchNumber}</div>
              <div><strong>Supplier:</strong> {selectedMedicine.supplierName}</div>
              <div><strong>Purchase Price:</strong> ₹{selectedMedicine.unitPrice}</div>
              <div><strong>Selling Price:</strong> ₹{selectedMedicine.sellingPrice}</div>
              {selectedMedicine.quantity !== undefined && (
                <div><strong>Current Stock:</strong> {selectedMedicine.quantity} units</div>
              )}
            </div>
            <div>
              <strong>Medical Description:</strong>
              <p style={{ color: '#475569', marginTop: '4px', fontSize: '14px', lineHeight: 1.5 }}>
                {selectedMedicine.description || 'No detailed instructions available.'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Medicine"
        message={`Are you sure you want to remove "${selectedMedicine?.medicineName}" (${selectedMedicine?.medicineCode}) from the catalogue?`}
      />
    </div>
  );
};
