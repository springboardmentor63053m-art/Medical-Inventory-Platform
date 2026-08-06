import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/api';
import { Search, Filter, RefreshCw, ArrowUpRight, ArrowDownLeft, Calendar, FileText, User } from 'lucide-react';

const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'IN', 'OUT'

  const fetchMovements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/stock-movements');
      if (response.data.success) {
        setMovements(response.data.data);
      } else {
        setError(response.data.message || 'Failed to retrieve stock tracking logs');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error loading stock movements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const filteredMovements = useMemo(() => {
    return movements.filter((move) => {
      const matchesType = filterType === 'ALL' || move.type === filterType;
      
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery = !query || (
        (move.medicineName && move.medicineName.toLowerCase().includes(query)) ||
        (move.medicineCode && move.medicineCode.toLowerCase().includes(query)) ||
        (move.batchNo && move.batchNo.toLowerCase().includes(query)) ||
        (move.username && move.username.toLowerCase().includes(query))
      );

      return matchesType && matchesQuery;
    });
  }, [movements, searchQuery, filterType]);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading stock tracking history...</div>;
  }

  return (
    <div>
      <div className="search-filter-bar">
        <div className="search-input-wrap">
          <Search />
          <input
            type="text"
            placeholder="Search movements by medicine name, code, batch number or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            style={{ width: '160px', height: '42px' }}
          >
            <option value="ALL">All Actions</option>
            <option value="IN">Stock IN (+)</option>
            <option value="OUT">Stock OUT (-)</option>
          </select>

          <button className="btn btn-secondary" onClick={fetchMovements} style={{ height: '42px', gap: '6px' }}>
            <RefreshCw size={16} />
            <span>Sync Logs</span>
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        {filteredMovements.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>
            No stock movements found matching your search.
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Medicine</th>
                  <th>Batch Number</th>
                  <th>Action Type</th>
                  <th>Quantity</th>
                  <th>Actioned By</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((move) => {
                  const isIN = move.type === 'IN';
                  return (
                    <tr key={move.id}>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={12} style={{ color: 'var(--primary)' }} />
                          {formatDateTime(move.date)}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-info" style={{ marginRight: '8px' }}>{move.medicineCode}</span>
                        <strong style={{ color: 'white' }}>{move.medicineName}</strong>
                      </td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                          <FileText size={12} style={{ color: 'var(--text-muted)' }} />
                          {move.batchNo}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isIN ? 'badge-success' : 'badge-danger'}`} style={{ gap: '4px' }}>
                          {isIN ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                          STOCK {move.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 'bold', fontSize: '1rem', color: isIN ? 'var(--success)' : 'var(--danger)' }}>
                        {isIN ? '+' : '-'}{move.quantity} units
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={12} style={{ color: 'var(--primary)' }} />
                          {move.username}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockMovements;
