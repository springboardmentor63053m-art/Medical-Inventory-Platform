import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axiosConfig';
import { ToastContext } from '../context/ToastContext';
import { Pagination } from '../components/Pagination';
import { History, Search, Filter, Download, ArrowUpRight, ArrowDownRight, RefreshCw, Calendar, User } from 'lucide-react';

export const StockHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionTypeFilter, setActionTypeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const toast = useContext(ToastContext);

  useEffect(() => {
    fetchStockLogs();
  }, [actionTypeFilter, page, size]);

  const fetchStockLogs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/stocklogs', {
        params: { actionType: actionTypeFilter || undefined, page, size, sortBy: 'createdAt', sortDir: 'DESC' }
      });
      const data = res.data.data;
      setLogs(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load stock audit logs');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Log ID,Medicine Code,Medicine Name,Action Type,Quantity,Previous Qty,New Qty,Performed By,Date Time,Remarks\n'];
    const rows = logs.map(l => `"${l.id}","${l.medicineCode}","${l.medicineName}","${l.actionType}","${l.quantity}","${l.previousQuantity || ''}","${l.newQuantity || ''}","${l.performedBy}","${l.createdAt}","${l.remarks || ''}"\n`);
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medistock-audit-history-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Stock Audit Logs & History</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Immutable audit trail tracking all inventory stock movements, user actions, and balance adjustments</p>
        </div>
        <div>
          <button onClick={exportCSV} className="btn btn-secondary">
            <Download size={16} /> Export Audit Log CSV
          </button>
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
        <div style={{ width: '220px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Filter by Action Type</label>
          <select
            value={actionTypeFilter}
            onChange={(e) => { setActionTypeFilter(e.target.value); setPage(0); }}
            className="input-field"
          >
            <option value="">All Action Types</option>
            <option value="IN">STOCK IN (Increase)</option>
            <option value="OUT">STOCK OUT (Decrease)</option>
            <option value="ADJUSTMENT">ADJUSTMENT (Reset)</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Medicine Name</th>
              <th>Action Type</th>
              <th>Qty Change</th>
              <th>Stock Before → After</th>
              <th>Performed By</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Loading stock logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No audit log records found.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} color="#0284c7" />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{log.medicineName || `Medicine #${log.medicineId}`}</div>
                    <div style={{ fontSize: '12px', color: '#0284c7' }}>{log.medicineCode}</div>
                  </td>
                  <td>
                    <span className={`badge ${
                      log.actionType === 'IN' || log.actionType === 'STOCK_IN' ? 'badge-success' :
                      log.actionType === 'OUT' || log.actionType === 'STOCK_OUT' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {log.actionType === 'IN' || log.actionType === 'STOCK_IN' ? <ArrowUpRight size={14} /> : (log.actionType === 'OUT' || log.actionType === 'STOCK_OUT' ? <ArrowDownRight size={14} /> : <RefreshCw size={14} />)}
                      {log.actionType}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, color: log.actionType === 'IN' ? '#059669' : (log.actionType === 'OUT' ? '#dc2626' : '#d97706') }}>
                    {log.actionType === 'IN' ? `+${log.quantity}` : (log.actionType === 'OUT' ? `-${log.quantity}` : `${log.quantity}`)} units
                  </td>
                  <td style={{ fontSize: '13px', color: '#475569' }}>
                    {log.previousQuantity !== undefined && log.newQuantity !== undefined ? (
                      <span>{log.previousQuantity} → <strong>{log.newQuantity}</strong></span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
                      <User size={13} color="#14b8a6" /> {log.performedBy || 'System'}
                    </div>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '13px' }}>{log.remarks || '-'}</td>
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
    </div>
  );
};
