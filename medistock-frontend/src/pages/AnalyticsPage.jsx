import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import {
  BarChart3,
  TrendingUp,
  Boxes,
  Clock,
  Users,
  IndianRupee,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  PackageCheck,
  AlertTriangle
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [movementAnalytics, setMovementAnalytics] = useState(null);

  useEffect(() => {
    fetchDashboardAnalytics();
  }, []);

  const fetchDashboardAnalytics = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/analytics/dashboard');
      if (res.data?.data) {
        setAnalytics(res.data.data);
        setMovementAnalytics(res.data.data.stockMovement);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterSubmit = async (e) => {
    e.preventDefault();
    try {
      const params = {};
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;

      const res = await API.get('/api/analytics/stock-movement', { params });
      if (res.data?.data) {
        setMovementAnalytics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to filter stock movement analytics:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#0284c7', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Loading inventory analytics...
      </div>
    );
  }

  const inventoryData = analytics?.inventory;
  const expiryData = analytics?.expiry;
  const supplierData = analytics?.suppliers;
  const purchaseData = analytics?.purchases;

  const stockPieData = [
    { name: 'Available Stock', value: Number(inventoryData?.availableStock || 0), color: '#10b981' },
    { name: 'Low Stock', value: Number(inventoryData?.lowStock || 0), color: '#f59e0b' },
    { name: 'Out of Stock', value: Number(inventoryData?.outOfStock || 0), color: '#ef4444' },
  ].filter(d => d.value > 0);

  const expiryPieData = [
    { name: 'Active Batches', value: Number(expiryData?.activeMedicines || 0), color: '#10b981' },
    { name: 'Expiring Soon', value: Number(expiryData?.expiringSoon || 0), color: '#f59e0b' },
    { name: 'Expired', value: Number(expiryData?.expiredMedicines || 0), color: '#ef4444' },
  ].filter(d => d.value > 0);

  const movementBarData = [
    { name: 'Stock IN', count: Number(movementAnalytics?.stockIn || 0), color: '#10b981' },
    { name: 'Stock OUT', count: Number(movementAnalytics?.stockOut || 0), color: '#ef4444' },
    { name: 'Adjustments', count: Number(movementAnalytics?.adjustments || 0), color: '#f59e0b' },
    { name: 'Returns', count: Number(movementAnalytics?.returns || 0), color: '#38bdf8' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 color="#0284c7" /> Inventory & Stock Analytics
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Comprehensive reporting on stock valuation, turnover rates, supplier activity, and expiry trends
          </p>
        </div>
        <button onClick={fetchDashboardAnalytics} className="btn btn-secondary">
          <RefreshCw size={16} /> Refresh Analytics
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="card-grid">
        <div className="kpi-card">
          <div>
            <div className="kpi-title">Total Inventory Valuation</div>
            <div className="kpi-value" style={{ color: '#059669' }}>
              ₹{Number(inventoryData?.inventoryValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Calculated from unit purchase prices</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
            <IndianRupee size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-title">Total Stock Units</div>
            <div className="kpi-value">{(inventoryData?.totalStockQuantity || 0).toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Across {inventoryData?.totalMedicines || 0} catalogue items</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' }}>
            <Boxes size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-title">Active Suppliers</div>
            <div className="kpi-value" style={{ color: '#0d9488' }}>{supplierData?.totalSuppliers || 0}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Registered vendor partners</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(20, 184, 166, 0.12)', color: '#0d9488' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-title">Monthly Purchase Spending</div>
            <div className="kpi-value" style={{ color: '#7c3aed' }}>
              ₹{Number(purchaseData?.monthlyPurchaseSpending || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{purchaseData?.purchasesThisMonth || 0} orders this month</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#7c3aed' }}>
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Inventory Distribution Pie */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Boxes size={18} color="#0284c7" /> Stock Level Distribution
          </h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stockPieData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {stockPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expiry Analytics Pie */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#d97706" /> Expiry Status Distribution
          </h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expiryPieData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {expiryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stock Movement Bar Chart with Date Filter */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#059669" /> Stock Movement Volume
          </h3>

          <form onSubmit={handleDateFilterSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>From:</span>
            <input
              type="date"
              className="input-field"
              style={{ width: '150px', padding: '6px 10px' }}
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            />
            <span style={{ fontSize: '13px', color: '#64748b' }}>To:</span>
            <input
              type="date"
              className="input-field"
              style={{ width: '150px', padding: '6px 10px' }}
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            />
            <button type="submit" className="btn btn-sm btn-primary">
              Filter
            </button>
          </form>
        </div>

        <div style={{ height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={movementBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }} />
              <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supplier Breakdown Table */}
      <div className="table-container">
        <div className="table-header">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="#0d9488" /> Supplier Inventory Summary
          </h3>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Medicines Supplied</th>
              <th>Total Stock Quantity</th>
              <th>Activity Status</th>
            </tr>
          </thead>
          <tbody>
            {(supplierData?.supplierStats || []).length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No supplier data available</td></tr>
            ) : (
              supplierData.supplierStats.map((stat) => (
                <tr key={stat.supplierId}>
                  <td style={{ fontWeight: 700, color: '#1e293b' }}>{stat.supplierName}</td>
                  <td>{stat.medicineCount} medicines</td>
                  <td style={{ fontWeight: 700 }}>{stat.totalStock.toLocaleString()} units</td>
                  <td>
                    <span className="badge badge-success">ACTIVE PARTNER</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
