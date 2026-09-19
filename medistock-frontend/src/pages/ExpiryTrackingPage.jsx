import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import {
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Package
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';

export const ExpiryTrackingPage = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicines, setMedicines] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    medicineId: '',
    batchNumber: '',
    expiryDate: '',
    quantity: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchExpiryRecords();
    fetchExpirySummary();
    fetchMedicinesList();
  }, [page, statusFilter]);

  const fetchExpiryRecords = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 10,
        sortBy: 'expiryDate',
        sortDir: 'ASC'
      };
      if (statusFilter) params.status = statusFilter;

      const res = await API.get('/api/expiry', { params });
      if (res.data?.data) {
        setRecords(res.data.data.content || []);
        setTotalPages(res.data.data.totalPages || 0);
        setTotalElements(res.data.data.totalElements || 0);
      }
    } catch (err) {
      console.error('Failed to fetch expiry records:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpirySummary = async () => {
    try {
      const res = await API.get('/api/expiry/summary');
      if (res.data?.data) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch expiry summary:', err);
    }
  };

  const fetchMedicinesList = async () => {
    try {
      const res = await API.get('/api/medicines', { params: { size: 100 } });
      setMedicines(res.data?.data?.content || []);
    } catch (err) {
      console.error('Failed to fetch medicines:', err);
    }
  };

  const handleTriggerCheck = async () => {
    try {
      await API.post('/api/expiry/trigger-check');
      setFeedback({ type: 'success', message: 'Manual expiry status check triggered successfully!' });
      fetchExpiryRecords();
      fetchExpirySummary();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to trigger expiry check.' });
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/api/expiry', {
        medicineId: Number(formData.medicineId),
        batchNumber: formData.batchNumber,
        expiryDate: formData.expiryDate,
        quantity: Number(formData.quantity)
      });
      setFeedback({ type: 'success', message: 'Expiry batch record added successfully!' });
      setIsModalOpen(false);
      setFormData({ medicineId: '', batchNumber: '', expiryDate: '', quantity: '' });
      fetchExpiryRecords();
      fetchExpirySummary();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to add expiry record.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRecords = records.filter(r =>
    !searchQuery ||
    r.medicineName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.medicineCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'EXPIRED':
        return <span className="badge badge-danger"><XCircle size={14} /> EXPIRED</span>;
      case 'EXPIRING_SOON':
        return <span className="badge badge-warning"><Clock size={14} /> EXPIRING SOON</span>;
      case 'ACTIVE':
      default:
        return <span className="badge badge-success"><CheckCircle size={14} /> ACTIVE</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Medicine Expiry Tracking</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Monitor batch expiry dates, status warnings, and safe inventory retention
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleTriggerCheck} className="btn btn-secondary">
            <RefreshCw size={16} /> Trigger Expiry Check
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={16} /> Add Expiry Record
          </button>
        </div>
      </div>

      {feedback && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          color: feedback.type === 'success' ? '#059669' : '#dc2626',
          border: `1px solid ${feedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`
        }}>
          {feedback.message}
        </div>
      )}

      {/* KPI Cards */}
      <div className="card-grid">
        <div className="kpi-card">
          <div>
            <div className="kpi-title">Total Records</div>
            <div className="kpi-value">{summary?.totalRecords || totalElements}</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' }}>
            <Calendar size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-title">Expiring Soon (≤30 Days)</div>
            <div className="kpi-value" style={{ color: '#d97706' }}>{summary?.expiringSoonCount || 0}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Qty: {summary?.expiringSoonQuantity || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#d97706' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-title">Expired Medicines</div>
            <div className="kpi-value" style={{ color: '#dc2626' }}>{summary?.expiredCount || 0}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Qty: {summary?.expiredQuantity || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626' }}>
            <XCircle size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-title">Active / Safe Batches</div>
            <div className="kpi-value" style={{ color: '#059669' }}>{summary?.activeCount || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <div className="table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search medicine or batch..."
                className="input-field"
                style={{ paddingLeft: '36px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {['', 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED'].map((st) => (
                <button
                  key={st}
                  onClick={() => { setStatusFilter(st); setPage(0); }}
                  className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {st === '' ? 'ALL' : st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Batch Number</th>
              <th>Quantity</th>
              <th>Expiry Date</th>
              <th>Days Remaining</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Loading expiry tracking data...</td></tr>
            ) : filteredRecords.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No expiry records found.</td></tr>
            ) : (
              filteredRecords.map((item) => {
                const days = item.daysRemaining != null ? item.daysRemaining :
                  item.expiryDate ? Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : 'N/A';

                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.medicineName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Code: {item.medicineCode}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#475569' }}>{item.batchNumber || 'N/A'}</td>
                    <td style={{ fontWeight: 700 }}>{item.quantity} units</td>
                    <td style={{ color: item.status === 'EXPIRED' ? '#dc2626' : '#1e293b' }}>
                      {item.expiryDate || 'N/A'}
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: days < 0 ? '#dc2626' : days <= 30 ? '#d97706' : '#059669'
                      }}>
                        {days < 0 ? `Expired (${Math.abs(days)}d ago)` : `${days} days`}
                      </span>
                    </td>
                    <td>{getStatusBadge(item.status)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ padding: '16px 24px' }}>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Expiry Batch Record">
        <form onSubmit={handleAddSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Select Medicine *
              </label>
              <select
                required
                className="input-field"
                value={formData.medicineId}
                onChange={(e) => setFormData({ ...formData, medicineId: e.target.value })}
              >
                <option value="">-- Choose Medicine --</option>
                {medicines.map(m => (
                  <option key={m.id} value={m.id}>{m.medicineName} ({m.medicineCode})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Batch Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BATCH-2026-X01"
                className="input-field"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Expiry Date *
              </label>
              <input
                type="date"
                required
                className="input-field"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                placeholder="Batch Quantity"
                className="input-field"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : 'Save Expiry Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
