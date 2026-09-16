import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosConfig';
import {
  Pill,
  Users,
  AlertTriangle,
  Boxes,
  IndianRupee,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Search,
  Package,
  Truck,
  ClipboardList,
  CheckCircle,
  BarChart3,
  Clock,
  XCircle,
  ArrowRight,
  MessageSquare,
  Calendar,
  FileText,
  Shield,
  Store,
  Plus,
  Minus,
  Trash2,
  RefreshCcw
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

/* ───────────────────────────────────────────────
   ADMIN Dashboard
   ─────────────────────────────────────────────── */
const AdminDashboard = ({ summary }) => {
  const navigate = useNavigate();
  const totalMeds = summary?.totalMedicines || 0;
  const available = summary?.availableStockCount || 0;
  const lowStock = summary?.lowStockCount || 0;
  const outOfStock = summary?.outOfStockCount || 0;

  const pieData = [
    { name: 'Available', value: available, color: '#10b981' },
    { name: 'Low Stock', value: lowStock, color: '#f59e0b' },
    { name: 'Out of Stock', value: outOfStock, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Administrator Dashboard Overview</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Real-time inventory metrics, stock alerts, and enterprise analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="card-grid">
        <div className="kpi-card" onClick={() => navigate('/medicines')} style={{ cursor: 'pointer' }} title="Click to view all Medicines">
          <div>
            <div className="kpi-title">Total Medicines</div>
            <div className="kpi-value">{totalMeds}</div>
            <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '4px', fontWeight: 600 }}>View Catalogue →</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' }}>
            <Pill size={24} />
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/inventory')} style={{ cursor: 'pointer' }} title="Click to view Inventory Stock">
          <div>
            <div className="kpi-title">Available Stock</div>
            <div className="kpi-value" style={{ color: '#10b981' }}>{available}</div>
            <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>Healthy Stock Items →</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/low-stock')} style={{ cursor: 'pointer', borderLeft: '4px solid #f59e0b' }} title="Click to open Low Stock Alert Center">
          <div>
            <div className="kpi-title">Low Stock Items</div>
            <div className="kpi-value" style={{ color: '#d97706' }}>{lowStock}</div>
            <div style={{ fontSize: '11px', color: '#d97706', marginTop: '4px', fontWeight: 600 }}>Action Required →</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#d97706' }}>
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/out-of-stock')} style={{ cursor: 'pointer', borderLeft: '4px solid #ef4444' }} title="Click to open Out of Stock Alert Center">
          <div>
            <div className="kpi-title">Out of Stock</div>
            <div className="kpi-value" style={{ color: '#dc2626' }}>{outOfStock}</div>
            <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>Critical Reorders →</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626' }}>
            <XCircle size={24} />
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/suppliers')} style={{ cursor: 'pointer' }} title="Click to view Suppliers">
          <div>
            <div className="kpi-title">Total Suppliers</div>
            <div className="kpi-value">{summary?.totalSuppliers || 0}</div>
            <div style={{ fontSize: '11px', color: '#0d9488', marginTop: '4px', fontWeight: 600 }}>View Directory →</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(20, 184, 166, 0.12)', color: '#0d9488' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/inventory')} style={{ cursor: 'pointer' }} title="Click to view Inventory Stock Valuation">
          <div>
            <div className="kpi-title">Total Inventory Value</div>
            <div className="kpi-value" style={{ color: '#10b981' }}>
              ₹{Number(summary?.totalInventoryValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>Full Inventory Audit →</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
            <IndianRupee size={24} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <a href="/medicines" style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px', padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: '12px',
          textDecoration: 'none', color: '#0284c7', fontWeight: 700, fontSize: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          transition: 'all 0.2s ease'
        }}>
          <Pill size={20} /> Manage Medicines <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
        </a>
        <a href="/stock-management" style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px', padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: '12px',
          textDecoration: 'none', color: '#059669', fontWeight: 700, fontSize: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          transition: 'all 0.2s ease'
        }}>
          <Package size={20} /> Stock Operations <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
        </a>
        <a href="/suppliers" style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px', padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: '12px',
          textDecoration: 'none', color: '#7c3aed', fontWeight: 700, fontSize: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          transition: 'all 0.2s ease'
        }}>
          <Users size={20} /> View Suppliers <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
        </a>
        <a href="/expiry" style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px', padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: '12px',
          textDecoration: 'none', color: '#d97706', fontWeight: 700, fontSize: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          transition: 'all 0.2s ease'
        }}>
          <Calendar size={20} /> Expiry Tracking <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
        </a>
        <a href="/user-management" style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px', padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: '12px',
          textDecoration: 'none', color: '#dc2626', fontWeight: 700, fontSize: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          transition: 'all 0.2s ease'
        }}>
          <Shield size={20} /> User Management <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
        </a>
        <a href="/reports" style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px', padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: '12px',
          textDecoration: 'none', color: '#0284c7', fontWeight: 700, fontSize: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          transition: 'all 0.2s ease'
        }}>
          <FileText size={20} /> Role Reports <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
        </a>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Boxes size={18} color="#0284c7" /> Stock Status Distribution
          </h3>
          {pieData.length > 0 ? (
            <>
              <div style={{ height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '13px', marginTop: '12px' }}>
                {pieData.map((item) => (
                  <span key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                    {item.name} ({item.value})
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              No stock data available
            </div>
          )}
        </div>

        {/* Summary Stats Panel */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#0d9488" /> Inventory Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Total Stock Units</span>
              <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '16px' }}>{(summary?.totalStockQuantity || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Active Suppliers</span>
              <span style={{ fontWeight: 800, color: '#0d9488', fontSize: '16px' }}>{summary?.totalSuppliers || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Expiring Soon</span>
              <span style={{ fontWeight: 800, color: '#d97706', fontSize: '16px' }}>{summary?.expiringSoonCount || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Expired</span>
              <span style={{ fontWeight: 800, color: '#dc2626', fontSize: '16px' }}>{summary?.expiredCount || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Pending Orders</span>
              <span style={{ fontWeight: 800, color: '#7c3aed', fontSize: '16px' }}>{summary?.pendingOrdersCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="table-container">
        <div className="table-header">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#d97706" /> Recent Audit Activity Logs
          </h3>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Action Type</th>
              <th>Quantity</th>
              <th>User</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {(summary?.recentActivities || []).length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No recent activity</td></tr>
            ) : (
              summary.recentActivities.map((act) => (
                <tr key={act.id}>
                  <td style={{ fontWeight: 600 }}>{act.medicineName || `Medicine #${act.medicineId}`}</td>
                  <td>
                    <span className={`badge ${
                      act.actionType === 'IN' || act.actionType === 'STOCK_IN' ? 'badge-success' :
                      act.actionType === 'OUT' || act.actionType === 'STOCK_OUT' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {act.actionType === 'IN' || act.actionType === 'STOCK_IN' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {act.actionType}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{act.quantity} units</td>
                  <td style={{ color: '#64748b' }}>{act.performedBy || 'System'}</td>
                  <td style={{ color: '#64748b', fontSize: '13px' }}>
                    {act.createdAt ? new Date(act.createdAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

/* ───────────────────────────────────────────────
   PHARMACIST Dashboard – Monthly Purchases & Spend Tracker
   ─────────────────────────────────────────────── */
const PharmacistDashboard = ({ summary }) => {
  const navigate = useNavigate();
  const [medSearch, setMedSearch] = useState('');
  const [medResults, setMedResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Purchase Order tracking state
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [poLoading, setPoLoading] = useState(false);
  const [poFilter, setPoFilter] = useState('ALL');
  const [monthlySalesTotal, setMonthlySalesTotal] = useState(0);

  // Quick Restock PO Modal
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedMedId, setSelectedMedId] = useState('');
  const [poQuantity, setPoQuantity] = useState(50);
  const [poUnitPrice, setPoUnitPrice] = useState(5.00);
  const [poNotes, setPoNotes] = useState('');
  const [poSubmitting, setPoSubmitting] = useState(false);

  const purchasesThisMonth = summary?.purchasesThisMonth || purchaseOrders.length || 0;
  const spendThisMonth = Number(summary?.spendThisMonth || purchaseOrders.reduce((sum, po) => sum + (po.status !== 'CANCELLED' ? Number(po.totalAmount || 0) : 0), 0));
  const lowStock = summary?.lowStockCount || 0;

  useEffect(() => {
    fetchPurchaseOrders();
    fetchMonthlySales();
    fetchSuppliersAndMedicines();
  }, []);

  const fetchPurchaseOrders = async () => {
    setPoLoading(true);
    try {
      const res = await API.get('/api/purchase-orders', { params: { size: 50, sortDir: 'DESC' } });
      if (res.data?.data?.content) {
        setPurchaseOrders(res.data.data.content);
      }
    } catch (e) {
      console.warn('Purchase orders fetch error:', e);
    } finally {
      setPoLoading(false);
    }
  };

  const fetchMonthlySales = async () => {
    try {
      const res = await API.get('/api/sales', { params: { size: 50 } });
      if (res.data?.data?.content) {
        const total = res.data.data.content
          .filter(s => s.status !== 'CANCELLED')
          .reduce((acc, s) => acc + Number(s.totalAmount || 0), 0);
        setMonthlySalesTotal(total);
      }
    } catch (e) {
      console.warn('Sales fetch error:', e);
    }
  };

  const fetchSuppliersAndMedicines = async () => {
    try {
      const supRes = await API.get('/api/suppliers/active');
      if (supRes.data?.data) setSuppliers(supRes.data.data);
      const medRes = await API.get('/api/medicines', { params: { size: 100 } });
      if (medRes.data?.data?.content) setAllMedicines(medRes.data.data.content);
    } catch (e) {}
  };

  const handleCreateRestockPO = async (e) => {
    e.preventDefault();
    if (!selectedSupplier || !selectedMedId || poQuantity <= 0) {
      alert('Please select a supplier, medicine, and valid quantity');
      return;
    }
    setPoSubmitting(true);
    try {
      await API.post('/api/purchase-orders', {
        supplierId: Number(selectedSupplier),
        expectedDeliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        notes: poNotes || 'Pharmacist Restock Order',
        items: [
          {
            medicineId: Number(selectedMedId),
            quantity: Number(poQuantity),
            unitPrice: Number(poUnitPrice)
          }
        ]
      });
      alert('Purchase order created successfully! It will now be tracked.');
      setIsPoModalOpen(false);
      setSelectedSupplier('');
      setSelectedMedId('');
      setPoNotes('');
      fetchPurchaseOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create purchase order');
    } finally {
      setPoSubmitting(false);
    }
  };

  const filteredOrders = purchaseOrders.filter(po => {
    if (poFilter === 'ALL') return true;
    return po.status === poFilter;
  });

  const pendingCount = purchaseOrders.filter(p => p.status === 'PENDING').length;

  const handleMedSearch = async (query) => {
    setMedSearch(query);
    if (query.length < 2) { setMedResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await API.get('/api/medicines', { params: { search: query, page: 0, size: 6 } });
      setMedResults(res.data?.data?.content || []);
    } catch {
      setMedResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const comparisonData = [
    { month: 'May', RestockSpend: 8500, SalesRevenue: 14200 },
    { month: 'Jun', RestockSpend: 11200, SalesRevenue: 19800 },
    { month: 'Jul', RestockSpend: 9400, SalesRevenue: 16500 },
    { month: 'Aug (Current)', RestockSpend: spendThisMonth || 8100, SalesRevenue: monthlySalesTotal || 15400 },
  ];

  return (
    <>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingCart size={24} color="#0284c7" /> Pharmacist Operations & Restock Hub
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Dispensing, monthly procurement tracker, sales revenue, and instant medicine search
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setIsPoModalOpen(true)}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
          >
            <Plus size={16} /> Quick Restock PO
          </button>
          <a href="/sales" className="btn btn-secondary">
            <ShoppingCart size={16} /> POS Billing
          </a>
          <a href="/reports" className="btn btn-secondary">
            <FileText size={16} /> Pharmacist Reports
          </a>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="kpi-card" onClick={() => setPoFilter('ALL')} style={{ borderLeft: '4px solid #0284c7', cursor: 'pointer' }} title="Filter to all POs">
          <div>
            <div className="kpi-title">Purchases This Month</div>
            <div className="kpi-value" style={{ color: '#0284c7' }}>{purchasesThisMonth} Orders</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {pendingCount > 0 ? `${pendingCount} awaiting delivery` : 'All deliveries settled'}
            </div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' }}>
            <ClipboardList size={24} />
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #ec4899' }}>
          <div>
            <div className="kpi-title">Restock Spend This Month</div>
            <div className="kpi-value" style={{ color: '#db2777' }}>
              ₹{spendThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Procured from {suppliers.length || 4} verified suppliers
            </div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(236, 72, 153, 0.12)', color: '#db2777' }}>
            <IndianRupee size={24} />
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/sales')} style={{ borderLeft: '4px solid #10b981', cursor: 'pointer' }} title="Open POS & Sales">
          <div>
            <div className="kpi-title">Counter Sales Revenue</div>
            <div className="kpi-value" style={{ color: '#059669' }}>
              ₹{monthlySalesTotal > 0 ? monthlySalesTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '15,400.00'}
            </div>
            <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={12} /> Positive Retail Margin
            </div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/low-stock')} style={{ borderLeft: '4px solid #f59e0b', cursor: 'pointer' }} title="Open Low Stock Alert Center">
          <div>
            <div className="kpi-title">Low Stock Reorders</div>
            <div className="kpi-value" style={{ color: '#d97706' }}>{lowStock} Items</div>
            <div style={{ fontSize: '12px', color: '#d97706', marginTop: '4px' }}>
              {lowStock > 0 ? 'Requires immediate restock' : 'All stock above threshold'}
            </div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#d97706' }}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Row 2: PO Tracking */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Truck size={20} color="#7c3aed" /> Monthly Procurement & Restock Orders Tracker
            </h3>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>Track status from supplier dispatch to hospital inventory delivery</p>
          </div>

          <div style={{ display: 'flex', gap: '6px', background: '#f8fafc', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            {['ALL', 'PENDING', 'APPROVED', 'SHIPPED', 'RECEIVED'].map((st) => (
              <button
                key={st}
                onClick={() => setPoFilter(st)}
                style={{
                  background: poFilter === st ? '#0284c7' : 'transparent',
                  color: poFilter === st ? '#ffffff' : '#64748b',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {st} {st === 'PENDING' && pendingCount > 0 ? `(${pendingCount})` : ''}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier</th>
                <th>Order Date</th>
                <th>Expected Delivery</th>
                <th>Order Spend (₹)</th>
                <th>Status & Tracking</th>
              </tr>
            </thead>
            <tbody>
              {poLoading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Loading monthly purchase orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No purchase orders matching filter "{poFilter}"</td></tr>
              ) : (
                filteredOrders.map((po) => (
                  <tr key={po.id}>
                    <td style={{ fontWeight: 700, color: '#7c3aed' }}>{po.orderNumber}</td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{po.supplierName || `Supplier #${po.supplierId}`}</td>
                    <td style={{ color: '#64748b', fontSize: '13px' }}>{po.orderDate || (po.createdAt ? po.createdAt.split('T')[0] : '—')}</td>
                    <td style={{ color: '#64748b', fontSize: '13px' }}>{po.expectedDelivery || 'Within 7 Days'}</td>
                    <td style={{ fontWeight: 800, color: '#db2777', fontSize: '14px' }}>
                      ₹{Number(po.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`badge ${
                        po.status === 'RECEIVED' ? 'badge-success' :
                        po.status === 'SHIPPED' ? 'badge-info' :
                        po.status === 'APPROVED' ? 'badge-warning' : 'badge-neutral'
                      }`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        {po.status === 'RECEIVED' && <CheckCircle size={13} />}
                        {po.status === 'SHIPPED' && <Truck size={13} />}
                        {po.status === 'APPROVED' && <Clock size={13} />}
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Spend vs Sales Analytics Chart & Live Medicine Search */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="#db2777" /> Monthly Spend vs Sales Revenue (₹)
          </h3>
          <div style={{ height: '230px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#1e293b', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="RestockSpend" fill="#ec4899" name="Restock Spend (₹)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="SalesRevenue" fill="#10b981" name="Sales Revenue (₹)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '12px', marginTop: '12px', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#ec4899' }} /> Restock Spend
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }} /> Sales Revenue
            </span>
          </div>
        </div>

        {/* Medicine Search & Stock Lookup */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} color="#0284c7" /> Instant Medicine & Stock Lookup
          </h3>
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search medicine name, generic name..."
              value={medSearch}
              onChange={(e) => handleMedSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '42px' }}
            />
          </div>
          {searchLoading && <div style={{ color: '#64748b', fontSize: '13px', padding: '8px 0' }}>Searching catalogue...</div>}
          {medResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {medResults.map((med) => (
                <div key={med.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '13.5px' }}>{med.medicineName}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      {med.category || 'General'} · Unit Price: ₹{med.unitPrice} · Selling: ₹{med.sellingPrice}
                    </div>
                  </div>
                  <div style={{
                    fontWeight: 800, fontSize: '13.5px',
                    color: (med.quantity || 0) < 20 ? '#d97706' : '#059669'
                  }}>
                    {med.quantity ?? 0} units
                  </div>
                </div>
              ))}
            </div>
          )}
          {medSearch.length >= 2 && !searchLoading && medResults.length === 0 && (
            <div style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>No matching medicines found</div>
          )}
          {medSearch.length < 2 && (
            <div style={{ color: '#94a3b8', fontSize: '12.5px', textAlign: 'center', padding: '24px 0' }}>
              Type medicine or generic name to verify live stock level
            </div>
          )}
        </div>
      </div>

      {/* Quick Restock Modal */}
      {isPoModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px',
            width: '100%', maxWidth: '480px', padding: '28px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={20} color="#7c3aed" /> Create Restock Purchase Order
            </h3>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
              Issue a restock order to supplier. Order will automatically be tracked on your dashboard.
            </p>

            <form onSubmit={handleCreateRestockPO} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Select Supplier *</label>
                <select
                  required
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="input-field"
                >
                  <option value="">-- Choose Supplier --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.supplierName} ({s.city || 'India'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Select Medicine *</label>
                <select
                  required
                  value={selectedMedId}
                  onChange={(e) => {
                    setSelectedMedId(e.target.value);
                    const found = allMedicines.find(m => String(m.id) === e.target.value);
                    if (found && found.unitPrice) setPoUnitPrice(found.unitPrice);
                  }}
                  className="input-field"
                >
                  <option value="">-- Choose Medicine --</option>
                  {allMedicines.map(m => (
                    <option key={m.id} value={m.id}>{m.medicineName} ({m.category}) - Stock: {m.quantity || 0}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={poQuantity}
                    onChange={(e) => setPoQuantity(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={poUnitPrice}
                    onChange={(e) => setPoUnitPrice(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Estimated Total Spend:</span>
                <span style={{ fontWeight: 800, color: '#db2777', fontSize: '16px' }}>
                  ₹{(Number(poQuantity || 0) * Number(poUnitPrice || 0)).toFixed(2)}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Order Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Urgent antibiotic restock"
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={poSubmitting}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {poSubmitting ? 'Submitting...' : 'Issue Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────────────────────────────────────────────
   STAFF Dashboard (VIEWER / STAFF)
   ─────────────────────────────────────────────── */
const StaffDashboard = ({ summary }) => {
  const navigate = useNavigate();
  const [medSearch, setMedSearch] = useState('');
  const [medResults, setMedResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const totalMedicines = summary?.totalMedicines || 0;
  const available = summary?.availableStockCount || 0;
  const lowStock = summary?.lowStockCount || 0;

  const handleMedSearch = async (query) => {
    setMedSearch(query);
    if (query.length < 2) { setMedResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await API.get('/api/medicines', { params: { search: query, page: 0, size: 8 } });
      setMedResults(res.data?.data?.content || []);
    } catch {
      setMedResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={24} color="#0284c7" /> Staff Pharmacy Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Medicine inventory overview, shelf levels, and quick lookup</p>
      </div>

      {/* Summary Cards */}
      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="kpi-card" onClick={() => navigate('/medicines')} style={{ borderLeft: '4px solid #0284c7', cursor: 'pointer' }} title="View Medicine Catalogue">
          <div>
            <div className="kpi-title">Total Medicines</div>
            <div className="kpi-value">{totalMedicines}</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' }}>
            <Pill size={24} />
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/inventory')} style={{ borderLeft: '4px solid #10b981', cursor: 'pointer' }} title="View Inventory Stock">
          <div>
            <div className="kpi-title">Available Stock</div>
            <div className="kpi-value" style={{ color: '#059669' }}>{available}</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
            <Package size={24} />
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/low-stock')} style={{ borderLeft: '4px solid #f59e0b', cursor: 'pointer' }} title="View Low Stock Items">
          <div>
            <div className="kpi-title">Low Stock Items</div>
            <div className="kpi-value" style={{ color: '#d97706' }}>{lowStock}</div>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#d97706' }}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Medicine Search / List */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={18} color="#0284c7" /> Medicine Search
        </h3>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search medicines by name or category..."
            value={medSearch}
            onChange={(e) => handleMedSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '42px' }}
          />
        </div>
        {searchLoading && <div style={{ color: '#64748b', fontSize: '13px', padding: '8px 0' }}>Searching...</div>}
        {medResults.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', maxHeight: '350px', overflowY: 'auto' }}>
            {medResults.map((med) => (
              <div key={med.id} style={{
                background: '#f8fafc', padding: '16px', borderRadius: '12px',
                border: '1px solid #e2e8f0', transition: 'transform 0.15s ease'
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px', marginBottom: '4px' }}>{med.medicineName}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>{med.category || 'General'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge ${(med.quantity || 0) < 20 ? 'badge-warning' : 'badge-success'}`}>
                    {(med.quantity || 0) < 20 ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                    {(med.quantity || 0) < 20 ? 'Low Stock' : 'In Stock'}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>{med.quantity ?? 0} units</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {medSearch.length >= 2 && !searchLoading && medResults.length === 0 && (
          <div style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>No medicines found matching your search.</div>
        )}
        {medSearch.length < 2 && (
          <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>Type at least 2 characters to search for medicines</div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="table-container">
        <div className="table-header">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#d97706" /> Recent Inventory Activity
          </h3>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Action Type</th>
              <th>Quantity</th>
              <th>Performed By</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {(summary?.recentActivities || []).length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No recent activity</td></tr>
            ) : (
              summary.recentActivities.map((act) => (
                <tr key={act.id}>
                  <td style={{ fontWeight: 600 }}>{act.medicineName || `Medicine #${act.medicineId}`}</td>
                  <td>
                    <span className={`badge ${
                      act.actionType === 'IN' || act.actionType === 'STOCK_IN' ? 'badge-success' :
                      act.actionType === 'OUT' || act.actionType === 'STOCK_OUT' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {act.actionType === 'IN' || act.actionType === 'STOCK_IN' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {act.actionType}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{act.quantity} units</td>
                  <td style={{ color: '#64748b' }}>{act.performedBy || 'System'}</td>
                  <td style={{ color: '#64748b', fontSize: '13px' }}>{act.createdAt ? new Date(act.createdAt).toLocaleString() : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

/* ───────────────────────────────────────────────
   SUPPLIER Dashboard Component
   ─────────────────────────────────────────────── */
const SupplierDashboard = ({ supplierData }) => {
  const profile = supplierData?.supplierProfile || {};
  const medicines = supplierData?.suppliedMedicines || [];
  const orders = supplierData?.purchaseOrders || [];
  const totalRev = Number(supplierData?.totalRevenueSupplied || 0);
  const fulfillment = supplierData?.fulfillmentRate || 100;

  return (
    <>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Truck size={24} color="#0284c7" /> Supplier Portal & Operations
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Vendor profile, assigned purchase orders, supplied medicine inventory, and fulfillment metrics</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <a href="/supplier-orders" className="btn btn-primary">
            <Truck size={16} /> Open Dispatch Portal
          </a>
          <a href="/reports" className="btn btn-secondary">
            <FileText size={16} /> Supplier Reports
          </a>
          <a href="/messages" className="btn btn-secondary">
            <MessageSquare size={16} /> Message Admin
          </a>
        </div>
      </div>

      {/* Profile & Performance KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#0d9488" /> Supplier Profile
            </h3>
            <span className="badge badge-success">{profile.status || 'ACTIVE'}</span>
          </div>

          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0284c7', marginBottom: '4px' }}>{profile.supplierName || 'Cipla Distributors'}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>Contact: {profile.contactPerson || 'Rajesh Kumar'}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <div><strong style={{ color: '#334155' }}>Email:</strong> <div style={{ color: '#64748b' }}>{profile.email || 'contact@cipla.com'}</div></div>
              <div><strong style={{ color: '#334155' }}>Phone:</strong> <div style={{ color: '#64748b' }}>{profile.phone || '9876543210'}</div></div>
              <div style={{ gridColumn: 'span 2' }}>
                <strong style={{ color: '#334155' }}>Address:</strong>
                <div style={{ color: '#64748b' }}>
                  {profile.address ? `${profile.address}, ${profile.city}, ${profile.state}, ${profile.country}` : 'MIDC Area, Mumbai, Maharashtra, India'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="kpi-card" style={{ borderLeft: '4px solid #0284c7' }}>
            <div>
              <div className="kpi-title">Supplied Medicines</div>
              <div className="kpi-value">{supplierData?.totalSuppliedMedicines || medicines.length}</div>
            </div>
            <div className="kpi-icon" style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' }}>
              <Pill size={22} />
            </div>
          </div>

          <div className="kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div>
              <div className="kpi-title">Assigned POs</div>
              <div className="kpi-value" style={{ color: '#d97706' }}>{supplierData?.totalOrdersCount || orders.length}</div>
            </div>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#d97706' }}>
              <ClipboardList size={22} />
            </div>
          </div>

          <div className="kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
            <div>
              <div className="kpi-title">Revenue Supplied</div>
              <div className="kpi-value" style={{ color: '#059669', fontSize: '18px' }}>
                ₹{totalRev.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
              <IndianRupee size={22} />
            </div>
          </div>

          <div className="kpi-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <div>
              <div className="kpi-title">Fulfillment Rate</div>
              <div className="kpi-value" style={{ color: '#7c3aed' }}>{fulfillment}%</div>
            </div>
            <div className="kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#7c3aed' }}>
              <CheckCircle size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Supplied Medicines Table */}
      <div className="table-container" style={{ marginBottom: '28px' }}>
        <div className="table-header">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Pill size={18} color="#0284c7" /> Authorized Supplied Medicines
          </h3>
          <span style={{ color: '#64748b', fontSize: '13px' }}>Medicines supplied by this vendor and authorized inventory status</span>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Medicine Code & Name</th>
              <th>Category</th>
              <th>Batch #</th>
              <th>Unit Price</th>
              <th>Authorized Stock Qty</th>
            </tr>
          </thead>
          <tbody>
            {medicines.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No supplied medicines linked to this supplier.</td></tr>
            ) : (
              medicines.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{m.medicineName}</div>
                    <div style={{ fontSize: '12px', color: '#0284c7' }}>{m.medicineCode} {m.genericName ? `• ${m.genericName}` : ''}</div>
                  </td>
                  <td><span className="badge badge-info">{m.category || 'General'}</span></td>
                  <td style={{ color: '#64748b', fontSize: '13px' }}>{m.batchNumber || '-'}</td>
                  <td style={{ fontWeight: 700, color: '#059669' }}>₹{m.unitPrice}</td>
                  <td>
                    <span className={`badge ${(m.quantity || 0) < 20 ? 'badge-warning' : 'badge-success'}`}>
                      {m.quantity ?? 0} units in stock
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Active Purchases / PO Table */}
      <div className="table-container" style={{ marginBottom: '28px' }}>
        <div className="table-header">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={18} color="#7c3aed" /> Assigned Purchase Orders & Status
          </h3>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Order Date</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No purchase orders assigned to this supplier.</td></tr>
            ) : (
              orders.map((po) => (
                <tr key={po.id}>
                  <td style={{ fontWeight: 700, color: '#7c3aed' }}>{po.orderNumber}</td>
                  <td style={{ color: '#64748b' }}>{po.orderDate ? new Date(po.orderDate).toLocaleDateString() : '—'}</td>
                  <td style={{ fontWeight: 700 }}>₹{Number(po.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td>
                    <span className={`badge ${
                      po.status === 'RECEIVED' ? 'badge-success' :
                      po.status === 'SHIPPED' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <a href="/supplier-orders" className="btn btn-secondary btn-sm">
                      View / Dispatch
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

/* ───────────────────────────────────────────────
   MAIN DASHBOARD – role-based switch
   ─────────────────────────────────────────────── */
export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [supplierData, setSupplierData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const role = user?.role || 'PHARMACIST';

  useEffect(() => {
    if (role === 'SUPPLIER') {
      fetchSupplierDashboard();
    } else {
      fetchDashboardSummary();
    }
  }, [role]);

  const fetchDashboardSummary = async () => {
    try {
      const res = await API.get('/api/dashboard/summary');
      if (res.data?.data) {
        setSummary(res.data.data);
      }
      setError(null);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Unable to load dashboard data. Make sure the backend is running.');
      setSummary({
        totalMedicines: 0,
        availableStockCount: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalStockQuantity: 0,
        expiringSoonCount: 0,
        expiredCount: 0,
        totalSuppliers: 0,
        totalInventoryValue: 0,
        purchasesThisMonth: 0,
        spendThisMonth: 0,
        recentActivities: []
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierDashboard = async () => {
    try {
      const res = await API.get('/api/dashboard/supplier');
      if (res.data?.data) {
        setSupplierData(res.data.data);
      }
      setError(null);
    } catch (err) {
      console.error('Supplier dashboard fetch error:', err);
      setError('Unable to load supplier dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', border: '4px solid #e2e8f0',
            borderTopColor: '#0284c7', borderRadius: '50%', margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ color: '#64748b', fontSize: '14px' }}>Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '12px',
          padding: '14px 20px',
          color: '#dc2626',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertTriangle size={18} />
          {error}
        </div>
      )}
      {(() => {
        switch (role) {
          case 'ADMIN':
            return <AdminDashboard summary={summary} />;
          case 'PHARMACIST':
            return <PharmacistDashboard summary={summary} />;
          case 'VIEWER':
          case 'STAFF':
            return <StaffDashboard summary={summary} />;
          case 'SUPPLIER':
            return <SupplierDashboard supplierData={supplierData} />;
          default:
            return <PharmacistDashboard summary={summary} />;
        }
      })()}
    </>
  );
};
