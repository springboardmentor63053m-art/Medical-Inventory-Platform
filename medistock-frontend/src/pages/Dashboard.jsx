import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { 
  Users, 
  Pill, 
  Truck, 
  ShoppingCart, 
  AlertTriangle, 
  IndianRupee,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Receipt,
  Plus,
  UserPlus,
  ArrowLeftRight,
  FileText,
  Boxes,
  ChevronDown,
  X,
  Printer,
  Download
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [medicinesList, setMedicinesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('Last 7 Days');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('INVENTORY_SUMMARY');

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isStaff = user?.roles?.includes('ROLE_STAFF');

  useEffect(() => {
    if (user?.roles?.includes('ROLE_SUPPLIER')) {
      navigate('/supplier/dashboard', { replace: true });
      return;
    }

    const fetchDashboard = async () => {
      try {
        const [dashRes, salesRes, medicinesRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/sales').catch(() => null),
          api.get('/medicines').catch(() => null)
        ]);

        if (dashRes.data.success) {
          setMetrics(dashRes.data.data);
        } else {
          setError(dashRes.data.message || 'Failed to retrieve metrics');
        }

        if (salesRes && salesRes.data.success) {
          setRecentSales(salesRes.data.data?.slice(0, 5) || []);
        }

        if (medicinesRes && medicinesRes.data) {
          const rawMeds = Array.isArray(medicinesRes.data) ? medicinesRes.data : medicinesRes.data.data;
          if (Array.isArray(rawMeds)) {
            setMedicinesList(rawMeds);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Error fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '₹0.00';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  const handleExportReport = () => {
    let headers = [];
    let rows = [];
    let filename = 'medistock_report.csv';

    if (reportType === 'INVENTORY_SUMMARY') {
      filename = 'medistock_inventory_summary.csv';
      headers = ['Metric', 'Value'];
      rows = [
        ['Total Medicines', metrics?.totalMedicines || 0],
        ['Total Inventory Valuation', metrics?.totalInventoryValue || 0],
        ['Available Medicines', metrics?.availableMedicinesCount || 0],
        ['Low Stock Count', metrics?.lowStockMedicinesCount || 0],
        ['Out of Stock Count', metrics?.outOfStockMedicinesCount || 0],
        ['Near Expiry Count', metrics?.nearExpiryMedicinesCount || 0],
        ['Expired Count', metrics?.expiredMedicinesCount || 0],
      ];
    } else if (reportType === 'LOW_STOCK') {
      filename = 'medistock_low_stock_audit.csv';
      headers = ['Medicine Code', 'Medicine Name', 'Quantity', 'Reorder Level', 'Rack Location'];
      rows = (metrics?.lowStockItems || []).map(i => [i.medicineCode, i.medicineName, i.quantity, i.reorderLevel, i.locationRack || 'N/A']);
    } else {
      filename = 'medistock_purchase_orders.csv';
      headers = ['Order Number', 'Supplier Name', 'Total Amount', 'Status'];
      rows = (metrics?.recentOrders || []).map(o => [o.orderNumber, o.supplier?.name || 'N/A', o.totalAmount, o.status]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowReportModal(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className="card" style={{ height: '110px' }}>
              <div style={{ width: '100%', height: '24px', background: 'var(--bg-subtle)', borderRadius: '6px' }} />
            </div>
          ))}
        </div>
        <div className="card" style={{ height: '320px' }} />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }
  // Real Database calculations
  const totalMeds = metrics?.totalMedicines || medicinesList.length || 0;
  const availableCount = Number(metrics?.availableMedicinesCount || 0);
  const lowStockCount = Number(metrics?.lowStockMedicinesCount || (metrics?.lowStockItems?.length || 0));
  const outOfStockCount = Number(metrics?.outOfStockMedicinesCount || 0);

  const grandTotal = availableCount + lowStockCount + outOfStockCount;

  let availablePct = 0;
  let lowStockPct = 0;
  let outOfStockPct = 0;

  if (grandTotal > 0) {
    availablePct = Math.round((availableCount / grandTotal) * 100);
    lowStockPct = Math.round((lowStockCount / grandTotal) * 100);
    outOfStockPct = Math.max(0, 100 - availablePct - lowStockPct);

    // Fine-tune rounding errors if sum is not 100
    const sum = availablePct + lowStockPct + outOfStockPct;
    if (sum !== 100) {
      const diff = 100 - sum;
      if (availablePct >= lowStockPct && availablePct >= outOfStockPct) {
        availablePct += diff;
      } else if (lowStockPct >= availablePct && lowStockPct >= outOfStockPct) {
        lowStockPct += diff;
      } else {
        outOfStockPct += diff;
      }
    }
  }

  // Top Medicines List from Real Medicines API
  const displayTopMedicines = (medicinesList || [])
    .slice()
    .sort((a, b) => (b.currentStock ?? 0) - (a.currentStock ?? 0))
    .slice(0, 3)
    .map((m, idx) => ({
      rank: idx + 1,
      name: m.name || `Medicine #${m.id}`,
      quantity: m.currentStock ?? 0,
      unit: 'units',
      iconColor: ['#0ea5e9', '#10b981', '#ef4444'][idx % 3]
    }));

  const kpiCards = [
    {
      title: 'Total Medicines',
      value: totalMeds,
      icon: <Pill size={22} />,
      color: '#3b82f6',
      bgGlow: 'rgba(59, 130, 246, 0.12)',
      linkText: 'View Catalogue',
      onLinkClick: () => navigate('/medicines')
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(metrics?.totalInventoryValue ?? 0),
      icon: <Boxes size={22} />,
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.12)',
      subLabel: 'Total Assets Value'
    },
    {
      title: 'Purchase Orders',
      value: metrics?.totalPurchaseOrders ?? 0,
      icon: <ShoppingCart size={22} />,
      color: '#8b5cf6',
      bgGlow: 'rgba(139, 92, 246, 0.12)',
      subLabel: 'This Month'
    },
    ...(!isStaff ? [{
      title: 'Suppliers',
      value: metrics?.totalSuppliers ?? 0,
      icon: <Users size={22} />,
      color: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.12)',
      linkText: 'View Suppliers',
      onLinkClick: () => navigate('/suppliers')
    }] : []),
    {
      title: 'Low Stock Items',
      value: lowStockCount,
      icon: <TrendingDown size={22} />,
      color: '#ef4444',
      bgGlow: 'rgba(239, 68, 68, 0.12)',
      linkText: 'Restock Now',
      onLinkClick: () => navigate('/medicines', { state: { filterStatus: 'LOW_STOCK' } })
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Dynamic styles injected for clean desktop rows and responsiveness */}
      <style>{`
        .dashboard-grid-row-1 {
          display: grid;
          grid-template-columns: repeat(${isStaff ? 4 : 5}, 1fr);
          gap: 16px;
          width: 100%;
        }
        .dashboard-grid-row-2 {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1.8fr;
          gap: 20px;
          width: 100%;
        }
        .dashboard-grid-row-3 {
          display: grid;
          grid-template-columns: 1.2fr 1.8fr;
          gap: 20px;
          width: 100%;
        }
        .quick-actions-row {
          display: grid;
          grid-template-columns: repeat(${isStaff ? 3 : 5}, 1fr);
          gap: 12px;
          width: 100%;
        }

        ${isStaff ? `
        @media (max-width: 768px) and (min-width: 481px) {
          .quick-actions-row > button:last-child {
            grid-column: span 2;
          }
        }
        ` : ''}


        @media (max-width: 1100px) {
          .dashboard-grid-row-2 {
            grid-template-columns: 1fr 1fr;
          }
          .dashboard-grid-row-3 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-grid-row-1 {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-grid-row-2 {
            grid-template-columns: 1fr;
          }
          .quick-actions-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 480px) {
          .dashboard-grid-row-1 {
            grid-template-columns: 1fr;
          }
          .quick-actions-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ROW 1: 5 KPI METRIC CARDS */}
      <div className="dashboard-grid-row-1">
        {kpiCards.map((card, i) => (
          <div key={i} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: card.bgGlow,
              color: card.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {card.icon}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flexGrow: 1 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {card.title}
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 4px', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {card.value}
              </span>
              {card.linkText ? (
                <span 
                  onClick={card.onLinkClick}
                  style={{ fontSize: '0.75rem', fontWeight: 600, color: card.color, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}
                >
                  {card.linkText} <ArrowRight size={12} />
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: card.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {card.subLabel}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ROW 2: STOCK STATUS, EXPIRY & RECENT ORDERS */}
      <div className="dashboard-grid-row-2">
        
        {/* STOCK STATUS */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Stock Status
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Overview of your stock status
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexGrow: 1 }}>
            {/* SVG Donut */}
            <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke="var(--bg-subtle)"
                  strokeWidth="4.2"
                />
                
                {/* Green Arc */}
                {availablePct > 0 && (
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4.2"
                    strokeDasharray={`${availablePct} 100`}
                    strokeDashoffset={0}
                  />
                )}
                
                {/* Yellow Arc */}
                {lowStockPct > 0 && (
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="4.2"
                    strokeDasharray={`${lowStockPct} 100`}
                    strokeDashoffset={-availablePct}
                  />
                )}
                
                {/* Red Arc */}
                {outOfStockPct > 0 && (
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="4.2"
                    strokeDasharray={`${outOfStockPct} 100`}
                    strokeDashoffset={-(availablePct + lowStockPct)}
                  />
                )}
              </svg>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0, flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', marginTop: '5px', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>In Stock</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{availableCount} ({availablePct}%)</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', marginTop: '5px', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>Low Stock</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{lowStockCount} ({lowStockPct}%)</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', marginTop: '5px', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>Out of Stock</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{outOfStockCount} ({outOfStockPct}%)</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
            <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Medicines</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{totalMeds}</div>
            </div>

            {/* Dynamic Status Alert Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: '1px solid',
              backgroundColor: outOfStockCount > 0 
                ? 'rgba(239, 68, 68, 0.08)' 
                : lowStockCount > 0 
                  ? 'rgba(245, 158, 11, 0.08)' 
                  : 'rgba(16, 185, 129, 0.08)',
              borderColor: outOfStockCount > 0 
                ? 'rgba(239, 68, 68, 0.15)' 
                : lowStockCount > 0 
                  ? 'rgba(245, 158, 11, 0.15)' 
                  : 'rgba(16, 185, 129, 0.15)',
              color: outOfStockCount > 0 
                ? '#ef4444' 
                : lowStockCount > 0 
                  ? '#f59e0b' 
                  : '#10b981',
            }}>
              {outOfStockCount > 0 ? (
                <>
                  <XCircle size={14} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {outOfStockCount} items out of stock. Restock needed!
                  </span>
                </>
              ) : lowStockCount > 0 ? (
                <>
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lowStockCount} items running low. Restock soon.
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle size={14} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    All medicines are in stock. Great job!
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* EXPIRING SOON */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Expiring Soon
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Medicines expiring in the next 30 days
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {/* Near Expiry */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '10px',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Near Expiry</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 0 0' }}>
                    {metrics?.nearExpiryMedicinesCount ?? 0}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Within 30 Days</div>
                </div>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  color: 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Clock size={18} />
                </div>
              </div>

              {/* Expired Items */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '10px',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Expired Items</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 0 0' }}>
                    {metrics?.expiredMedicinesCount ?? 0}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Already Expired</div>
                </div>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <XCircle size={18} />
                </div>
              </div>
            </div>
          </div>

          <span 
            onClick={() => navigate('/expiry')}
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--primary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: 'auto',
              width: 'fit-content'
            }}
          >
            View All Expiry <ArrowRight size={12} />
          </span>
        </div>

        {/* RECENT PURCHASE ORDERS (OR RECENT SALES FOR STAFF) */}
        {isStaff ? (
          /* Recent Sales History for Staff */
          <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Recent Sales History
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Latest transactions recorded
                </p>
              </div>
              <span 
                onClick={() => navigate('/sales')}
                style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                View All <ArrowRight size={12} />
              </span>
            </div>

            <div className="table-responsive" style={{ flexGrow: 1, overflowY: 'auto', minHeight: '180px' }}>
              {recentSales.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', padding: '32px 0', textAlign: 'center', fontSize: '0.88rem' }}>
                  No recent sales history recorded.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600 }}>Invoice No</th>
                      <th style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600 }}>Customer</th>
                      <th style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600 }}>Date</th>
                      <th style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600 }}>Amount</th>
                      <th style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600 }}>Pay Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.map((sale, i) => (
                      <tr key={sale.id || i} style={{ borderBottom: '1px solid var(--border-color)', height: '40px' }}>
                        <td style={{ padding: '8px 10px' }}><strong style={{ color: 'var(--primary)' }}>{sale.invoiceNumber}</strong></td>
                        <td style={{ padding: '8px 10px', color: 'var(--text-main)' }}>{sale.customerName || 'Walk-in Customer'}</td>
                        <td style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          {sale.saleDate ? new Date(sale.saleDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A'}
                        </td>
                        <td style={{ padding: '8px 10px', color: 'var(--text-main)', fontWeight: 600 }}>{formatCurrency(sale.finalAmount)}</td>
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: 'rgba(99, 102, 241, 0.12)',
                            color: '#6366f1',
                          }}>
                            {sale.paymentMethod || 'CASH'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          /* Recent Purchase Orders for Admins / Pharmacists */
          <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Recent Purchase Orders
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Latest orders from your suppliers
                </p>
              </div>
              <span 
                onClick={() => navigate('/purchase-orders')}
                style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                View All <ArrowRight size={12} />
              </span>
            </div>

            <div className="table-responsive" style={{ flexGrow: 1, overflowY: 'auto', minHeight: '180px' }}>
              {(!metrics?.recentOrders || metrics.recentOrders.length === 0) ? (
                <div style={{ color: 'var(--text-secondary)', padding: '32px 0', textAlign: 'center', fontSize: '0.88rem' }}>
                  No recent purchase orders recorded.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600 }}>PO Number</th>
                      <th style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600 }}>Supplier</th>
                      <th style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600 }}>Date</th>
                      <th style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600 }}>Amount</th>
                      <th style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.recentOrders.map((order, i) => {
                      const formattedDate = order.orderDate 
                        ? (isNaN(Date.parse(order.orderDate)) 
                          ? order.orderDate 
                          : new Date(order.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })) 
                        : 'N/A';
                      
                      const isReceived = order.status === 'RECEIVED' || order.status === 'COMPLETED' || order.status === 'DELIVERED';
                      const isCancelled = order.status === 'CANCELLED';
                      
                      return (
                        <tr key={order.id || i} style={{ borderBottom: '1px solid var(--border-color)', height: '40px' }}>
                          <td style={{ padding: '8px 10px' }}><strong style={{ color: 'var(--primary)' }}>{order.orderNumber}</strong></td>
                          <td style={{ padding: '8px 10px', color: 'var(--text-main)' }}>{order.supplier?.name || 'Supplier'}</td>
                          <td style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formattedDate}</td>
                          <td style={{ padding: '8px 10px', color: 'var(--text-main)', fontWeight: 600 }}>{formatCurrency(order.totalAmount)}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: isReceived 
                                ? 'rgba(16, 185, 129, 0.08)' 
                                : isCancelled 
                                  ? 'rgba(239, 68, 68, 0.08)' 
                                  : 'rgba(245, 158, 11, 0.08)',
                              color: isReceived 
                                ? '#10b981' 
                                : isCancelled 
                                  ? '#ef4444' 
                                  : '#f59e0b',
                              border: `1px solid ${isReceived ? 'rgba(16, 185, 129, 0.15)' : isCancelled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)'}`
                            }}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ROW 3: TOP MEDICINES & QUICK ACTIONS */}
      <div className="dashboard-grid-row-3">
        
        {/* TOP MEDICINES */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Top Medicines
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Most stocked medicines
              </p>
            </div>
            <span 
              onClick={() => navigate('/medicines')}
              style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              View All <ArrowRight size={12} />
            </span>
          </div>

          <div style={{ flexGrow: 1, overflowY: 'auto' }}>
            {displayTopMedicines.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', padding: '32px 0', textAlign: 'center', fontSize: '0.88rem' }}>
                No medicines available in inventory.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600, width: '40px' }}>#</th>
                    <th style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600 }}>Medicine</th>
                    <th style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Quantity</th>
                    <th style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center', width: '80px' }}>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {displayTopMedicines.map((med) => (
                    <tr key={med.rank} style={{ borderBottom: '1px solid var(--border-color)', height: '44px' }}>
                      <td style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 700 }}>{med.rank}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: `${med.iconColor}15`,
                            color: med.iconColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Pill size={14} />
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{med.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>
                        {med.quantity.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {med.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Quick Actions
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Perform common tasks quickly
            </p>
          </div>

          <div className="quick-actions-row" style={{ flexGrow: 1, display: 'grid', alignItems: 'center' }}>
            {/* Action 1: Add Medicine (Hidden for Staff) */}
            {!isStaff && (
              <button
                onClick={() => navigate('/medicines')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '16px 10px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Plus size={18} />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, textAlign: 'center' }}>Add Medicine</span>
              </button>
            )}

            {/* Action 2: Billing / POS */}
            <button
              onClick={() => navigate('/billing')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '16px 10px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--success)';
                e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Receipt size={18} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, textAlign: 'center' }}>Billing / POS</span>
            </button>

            {/* Action 3: New Purchase Order (Hidden for Staff) */}
            {!isStaff && (
              <button
                onClick={() => navigate('/purchase-orders')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '16px 10px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#8b5cf6';
                  e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(139, 92, 246, 0.12)',
                  color: '#8b5cf6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ShoppingCart size={18} />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, textAlign: 'center' }}>New Purchase Order</span>
              </button>
            )}

            {/* Action 4: Stock Adjustment */}
            <button
              onClick={() => navigate('/stock-movements')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '16px 10px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--warning)';
                e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ArrowLeftRight size={18} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, textAlign: 'center' }}>Stock Adjustment</span>
            </button>

            {/* Action 5: Generate Report */}
            <button
              onClick={() => setShowReportModal(true)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '16px 10px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--danger)';
                e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FileText size={18} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, textAlign: 'center' }}>Generate Report</span>
            </button>
          </div>
        </div>

      </div>

      {/* REPORT GENERATOR MODAL */}
      {showReportModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content card" style={{ padding: '28px', maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} style={{ color: 'var(--primary)' }} />
                Generate Inventory Telemetry Report
              </h3>
              <button 
                onClick={() => setShowReportModal(false)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Select Report Scope / Type</label>
                <select 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value)}
                  style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', width: '100%', outline: 'none' }}
                >
                  <option value="INVENTORY_SUMMARY">Full Inventory Summary Report</option>
                  <option value="LOW_STOCK">Low Stock Audit & Restock Report</option>
                  <option value="PURCHASE_ORDERS">Purchase Orders History Report</option>
                  <option value="EXPIRY_REPORT">Expiry & Risk Telemetry Report</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  onClick={handleExportReport}
                  className="btn btn-primary"
                  style={{ flex: 1, height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Download size={16} />
                  <span>Download CSV Report</span>
                </button>
                <button
                  onClick={() => { window.print(); setShowReportModal(false); }}
                  className="btn btn-secondary"
                  style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Printer size={16} />
                  <span>Print PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer style={{
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'var(--text-secondary)',
        fontSize: '0.78rem'
      }}>
        <span>© 2026 Medistock - Medical Inventory Platform. All rights reserved.</span>
        <span>Version 1.0.0</span>
      </footer>

    </div>
  );
};

export default Dashboard;
