import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Calendar, 
  Filter, 
  ArrowRight,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Expiry = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await api.get('/medicines');
        if (res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
          setMedicines(list);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Error fetching expiry telemetry');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  const calculateDaysRemaining = (expiryDateStr) => {
    if (!expiryDateStr) return null;
    const expDate = new Date(expiryDateStr);
    const today = new Date();
    const diffTime = expDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (days) => {
    if (days === null) return { label: 'NO EXPIRY DATE', badgeClass: 'badge-info', color: '#6b7280' };
    if (days < 0) return { label: 'EXPIRED', badgeClass: 'badge-danger', color: '#ef4444' };
    if (days <= 30) return { label: 'CRITICAL (< 30 Days)', badgeClass: 'badge-warning', color: '#f59e0b' };
    if (days <= 60) return { label: 'WARNING (< 60 Days)', badgeClass: 'badge-warning', color: '#eab308' };
    if (days <= 90) return { label: 'ATTENTION (< 90 Days)', badgeClass: 'badge-info', color: '#3b82f6' };
    return { label: 'SATISFACTORY (> 90 Days)', badgeClass: 'badge-success', color: '#10b981' };
  };

  const processedMedicines = medicines.map(med => {
    const days = calculateDaysRemaining(med.expiryDate);
    const statusInfo = getExpiryStatus(days);
    return {
      ...med,
      daysRemaining: days,
      statusInfo
    };
  });

  const filteredMedicines = processedMedicines.filter(med => {
    const matchesSearch = med.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          med.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          med.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const days = med.daysRemaining;
    if (!matchesSearch) return false;

    if (selectedFilter === 'EXPIRED') return days !== null && days < 0;
    if (selectedFilter === '30_DAYS') return days !== null && days >= 0 && days <= 30;
    if (selectedFilter === '60_DAYS') return days !== null && days >= 0 && days <= 60;
    if (selectedFilter === '90_DAYS') return days !== null && days >= 0 && days <= 90;
    if (selectedFilter === 'ALL_RISKS') return days !== null && days <= 90;

    return true;
  });

  // KPI Summary Counts
  const expiredCount = processedMedicines.filter(m => m.daysRemaining !== null && m.daysRemaining < 0).length;
  const under30Count = processedMedicines.filter(m => m.daysRemaining !== null && m.daysRemaining >= 0 && m.daysRemaining <= 30).length;
  const under60Count = processedMedicines.filter(m => m.daysRemaining !== null && m.daysRemaining >= 0 && m.daysRemaining <= 60).length;
  const under90Count = processedMedicines.filter(m => m.daysRemaining !== null && m.daysRemaining >= 0 && m.daysRemaining <= 90).length;

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading expiry telemetry...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={22} style={{ color: 'var(--warning)' }} />
            Expiry Risk & Shelf-Life Telemetry
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Monitor medicines reaching expiration within 30, 60, and 90 days or already expired.
          </p>
        </div>

        <button 
          onClick={() => navigate('/reports')}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FileText size={16} />
          <span>Export Expiry Audit</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div 
          onClick={() => setSelectedFilter('EXPIRED')}
          className="card stat-card rose" 
          style={{ borderLeft: '4px solid var(--danger)', cursor: 'pointer' }}
        >
          <div className="stat-info">
            <span className="stat-label">Already Expired</span>
            <span className="stat-value" style={{ color: 'var(--danger)' }}>{expiredCount}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dispose Immediately</span>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>
            <XCircle size={22} />
          </div>
        </div>

        <div 
          onClick={() => setSelectedFilter('30_DAYS')}
          className="card stat-card amber" 
          style={{ borderLeft: '4px solid var(--warning)', cursor: 'pointer' }}
        >
          <div className="stat-info">
            <span className="stat-label">Near Expiry (&lt; 30 Days)</span>
            <span className="stat-value" style={{ color: 'var(--warning)' }}>{under30Count}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Critical Expiry Risk</span>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
            <Clock size={22} />
          </div>
        </div>

        <div 
          onClick={() => setSelectedFilter('60_DAYS')}
          className="card stat-card amber" 
          style={{ borderLeft: '4px solid #eab308', cursor: 'pointer' }}
        >
          <div className="stat-info">
            <span className="stat-label">&lt; 60 Days Expiry</span>
            <span className="stat-value" style={{ color: '#eab308' }}>{under60Count}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Warning Threshold</span>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
            <AlertTriangle size={22} />
          </div>
        </div>

        <div 
          onClick={() => setSelectedFilter('90_DAYS')}
          className="card stat-card blue" 
          style={{ borderLeft: '4px solid var(--primary)', cursor: 'pointer' }}
        >
          <div className="stat-info">
            <span className="stat-label">&lt; 90 Days Expiry</span>
            <span className="stat-value" style={{ color: 'var(--primary)' }}>{under90Count}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Attention Horizon</span>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)' }}>
            <Calendar size={22} />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          
          {/* Expiry Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Catalog' },
              { id: 'ALL_RISKS', label: 'All Expiry Risks (< 90d)' },
              { id: '30_DAYS', label: '< 30 Days (Near Expiry)' },
              { id: '60_DAYS', label: '< 60 Days' },
              { id: '90_DAYS', label: '< 90 Days' },
              { id: 'EXPIRED', label: 'Already Expired' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: selectedFilter === tab.id ? 'var(--primary)' : 'var(--bg-subtle)',
                  color: selectedFilter === tab.id ? '#ffffff' : 'var(--text-main)',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="search-input-wrap" style={{ width: '280px', margin: 0 }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search medicine, code, or batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* Expiry Data Table */}
      <div className="card">
        {filteredMedicines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
            No medicines match the selected expiry filter.
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Batch Number</th>
                  <th>Expiration Date</th>
                  <th>Days Remaining</th>
                  <th>Current Stock</th>
                  <th>Rack Location</th>
                  <th>Expiry Status Risk</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map(item => (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ color: 'var(--text-main)' }}>{item.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.code || `ID: ${item.id}`}</div>
                    </td>
                    <td><span className="badge badge-info">{item.batchNumber || 'BN-2026-X'}</span></td>
                    <td style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                      {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td>
                      {item.daysRemaining !== null ? (
                        <span style={{
                          fontWeight: 700,
                          color: item.daysRemaining < 0 ? 'var(--danger)' :
                                 item.daysRemaining <= 30 ? 'var(--warning)' : 'var(--text-main)'
                        }}>
                          {item.daysRemaining < 0 ? `${Math.abs(item.daysRemaining)} days ago` : `${item.daysRemaining} days`}
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {item.currentStock ?? item.quantity ?? 0} units
                    </td>
                    <td>{item.locationRack || 'Rack A-1'}</td>
                    <td>
                      <span className={`badge ${item.statusInfo.badgeClass}`}>
                        {item.statusInfo.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Expiry;
