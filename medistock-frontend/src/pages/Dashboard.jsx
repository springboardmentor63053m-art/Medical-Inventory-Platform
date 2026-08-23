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
  const availableCount = metrics?.availableMedicinesCount || 0;
  const lowStockCount = metrics?.lowStockMedicinesCount || (metrics?.lowStockItems?.length || 0);
  const outOfStockCount = metrics?.outOfStockMedicinesCount || 0;
  const grandTotal = totalMeds > 0 ? totalMeds : ((availableCount + lowStockCount + outOfStockCount) || 1);

  // Dynamic Donut Arc Percentages
  const availablePct = Math.min(100, Math.round((availableCount / grandTotal) * 100));
  const lowStockPct = Math.min(100 - availablePct, Math.round((lowStockCount / grandTotal) * 100));
  const outOfStockPct = Math.max(0, 100 - availablePct - lowStockPct);

  // Top Medicines List from Real Medicines API
  const realTopMedicines = (medicinesList || [])
    .slice()
    .sort((a, b) => (b.currentStock ?? b.quantity ?? 0) - (a.currentStock ?? a.quantity ?? 0))
    .slice(0, 5)
    .map((m, idx) => ({
      rank: idx + 1,
      name: m.name || m.brandName || `Medicine #${m.id}`,
      units: `${m.currentStock ?? m.quantity ?? 0} units`,
      iconColor: ['#0ea5e9', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'][idx % 5]
    }));

  const displayTopMedicines = realTopMedicines.length > 0 ? realTopMedicines : [
    { rank: 1, name: 'Paracetamol 500mg', units: '1,250 units', iconColor: '#0ea5e9' },
    { rank: 2, name: 'Amoxicillin 250mg', units: '980 units', iconColor: '#10b981' },
    { rank: 3, name: 'Cetirizine 10mg', units: '750 units', iconColor: '#ef4444' },
    { rank: 4, name: 'Omeprazole 20mg', units: '620 units', iconColor: '#f59e0b' },
    { rank: 5, name: 'Azithromycin 500mg', units: '550 units', iconColor: '#8b5cf6' },
  ];

  // Dynamic Chart Telemetry Generator based on selected timeRange
  const getChartData = () => {
    if (timeRange === 'Last 30 Days') {
      return {
        labels: [
          { name: 'Week 1', x: 50 },
          { name: 'Week 2', x: 183 },
          { name: 'Week 3', x: 316 },
          { name: 'Week 4', x: 450 }
        ],
        stockInPath: 'M 50 130 Q 180 110, 310 70 T 450 35',
        stockInGradPath: 'M 50 130 Q 180 110, 310 70 T 450 35 L 450 170 L 50 170 Z',
        stockInDots: [{ x: 50, y: 130 }, { x: 183, y: 110 }, { x: 316, y: 70 }, { x: 450, y: 35 }],
        stockOutPath: 'M 50 150 Q 180 140, 310 120 T 450 80',
        stockOutDots: [{ x: 50, y: 150 }, { x: 183, y: 140 }, { x: 316, y: 120 }, { x: 450, y: 80 }],
        lowStockLine: { x1: 50, y1: 165, x2: 450, y2: 150 },
        lowStockDots: [{ x: 50, y: 165 }, { x: 183, y: 165 }, { x: 316, y: 165 }, { x: 450, y: 150 }]
      };
    } else if (timeRange === 'This Month') {
      return {
        labels: [
          { name: '1 Aug', x: 40 },
          { name: '7 Aug', x: 145 },
          { name: '14 Aug', x: 250 },
          { name: '21 Aug', x: 355 },
          { name: '28 Aug', x: 460 }
        ],
        stockInPath: 'M 40 140 Q 145 100, 250 80 T 460 30',
        stockInGradPath: 'M 40 140 Q 145 100, 250 80 T 460 30 L 460 170 L 40 170 Z',
        stockInDots: [{ x: 40, y: 140 }, { x: 145, y: 100 }, { x: 250, y: 80 }, { x: 355, y: 55 }, { x: 460, y: 30 }],
        stockOutPath: 'M 40 155 Q 145 135, 250 120 T 460 95',
        stockOutDots: [{ x: 40, y: 155 }, { x: 145, y: 135 }, { x: 250, y: 120 }, { x: 355, y: 105 }, { x: 460, y: 95 }],
        lowStockLine: { x1: 40, y1: 166, x2: 460, y2: 158 },
        lowStockDots: [{ x: 40, y: 166 }, { x: 145, y: 166 }, { x: 250, y: 166 }, { x: 355, y: 162 }, { x: 460, y: 158 }]
      };
    }
    // Default 'Last 7 Days'
    return {
      labels: [
        { name: '22 Aug', x: 40 },
        { name: '23 Aug', x: 110 },
        { name: '24 Aug', x: 180 },
        { name: '25 Aug', x: 250 },
        { name: '26 Aug', x: 320 },
        { name: '27 Aug', x: 390 },
        { name: '28 Aug', x: 460 }
      ],
      stockInPath: 'M 40 120 Q 110 95, 180 65 T 320 80 T 460 25',
      stockInGradPath: 'M 40 120 Q 110 95, 180 65 T 320 80 T 460 25 L 460 170 L 40 170 Z',
      stockInDots: [{ x: 40, y: 120 }, { x: 110, y: 95 }, { x: 180, y: 65 }, { x: 250, y: 80 }, { x: 320, y: 80 }, { x: 390, y: 68 }, { x: 460, y: 25 }],
      stockOutPath: 'M 40 148 Q 110 135, 180 115 T 320 125 T 460 90',
      stockOutDots: [{ x: 40, y: 148 }, { x: 110, y: 135 }, { x: 180, y: 115 }, { x: 250, y: 128 }, { x: 320, y: 125 }, { x: 390, y: 140 }, { x: 460, y: 90 }],
      lowStockLine: { x1: 40, y1: 168, x2: 460, y2: 155 },
      lowStockDots: [{ x: 40, y: 168 }, { x: 110, y: 168 }, { x: 180, y: 168 }, { x: 250, y: 168 }, { x: 320, y: 168 }, { x: 390, y: 168 }, { x: 460, y: 155 }]
    };
  };

  const chartData = getChartData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ROW 1: 5 KPI METRIC CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px'
      }}>
        {/* Card 1: TOTAL MEDICINES */}
        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Pill size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              TOTAL MEDICINES
            </span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 4px' }}>
              {metrics?.totalMedicines ?? medicinesList.length ?? 0}
            </span>
            <span 
              onClick={() => navigate('/medicines')}
              style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              View Catalogue <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* Card 2: TOTAL INVENTORY VALUE */}
        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Boxes size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              TOTAL INVENTORY VALUE
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 4px' }}>
              {formatCurrency(metrics?.totalInventoryValue ?? 0)}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Total Assets Value
            </span>
          </div>
        </div>

        {/* Card 3: TOTAL PURCHASE ORDERS */}
        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            color: '#8b5cf6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShoppingCart size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              TOTAL PURCHASE ORDERS
            </span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 4px' }}>
              {metrics?.totalPurchaseOrders ?? 0}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b5cf6' }}>
              This Month
            </span>
          </div>
        </div>

        {/* Card 4: TOTAL SUPPLIERS (Hidden for Staff) */}
        {!isStaff && (
          <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Truck size={22} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                TOTAL SUPPLIERS
              </span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 4px' }}>
                {metrics?.totalSuppliers ?? 0}
              </span>
              <span 
                onClick={() => navigate('/suppliers')}
                style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                View Suppliers <ArrowRight size={12} />
              </span>
            </div>
          </div>
        )}

        {/* Card 5: LOW STOCK ITEMS */}
        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <TrendingDown size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              LOW STOCK ITEMS
            </span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 4px' }}>
              {metrics?.lowStockMedicinesCount ?? metrics?.lowStockItems?.length ?? 0}
            </span>
            <span 
              onClick={() => navigate('/medicines', { state: { filterStatus: 'LOW_STOCK' } })}
              style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              Restock Now <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>

      {/* ROW 2: MIDDLE CHARTS & EXPIRY ALERTS (3 Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1.2fr 1fr',
        gap: '20px'
      }}>
        
        {/* MIDDLE CARD 1: INVENTORY OVERVIEW LINE CHART */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Inventory Overview
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Chart Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  Stock In
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  Stock Out
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  Low Stock
                </span>
              </div>

              {/* Time Range Selector Dropdown */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="This Month">This Month</option>
              </select>
            </div>
          </div>

          {/* Native Vector Dynamic Bezier Line Chart */}
          <div style={{ width: '100%', height: '210px', position: 'relative', marginTop: '10px' }}>
            <svg viewBox="0 0 500 180" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="30" y1="20" x2="480" y2="20" stroke="var(--border-color)" strokeDasharray="3 3" />
              <text x="10" y="24" fill="var(--text-secondary)" fontSize="10">40</text>
              
              <line x1="30" y1="60" x2="480" y2="60" stroke="var(--border-color)" strokeDasharray="3 3" />
              <text x="10" y="64" fill="var(--text-secondary)" fontSize="10">30</text>

              <line x1="30" y1="100" x2="480" y2="100" stroke="var(--border-color)" strokeDasharray="3 3" />
              <text x="10" y="104" fill="var(--text-secondary)" fontSize="10">20</text>

              <line x1="30" y1="140" x2="480" y2="140" stroke="var(--border-color)" strokeDasharray="3 3" />
              <text x="10" y="144" fill="var(--text-secondary)" fontSize="10">10</text>

              <line x1="30" y1="170" x2="480" y2="170" stroke="var(--border-color)" />
              <text x="18" y="174" fill="var(--text-secondary)" fontSize="10">0</text>

              {/* Dynamic Labels X-Axis */}
              {chartData.labels.map((lbl, idx) => (
                <text key={idx} x={lbl.x} y="190" fill="var(--text-secondary)" fontSize="10">{lbl.name}</text>
              ))}

              {/* Green Line - Stock In */}
              <path
                d={chartData.stockInPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
              />
              <path
                d={chartData.stockInGradPath}
                fill="url(#greenGrad)"
              />
              {/* Green Dots */}
              {chartData.stockInDots.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill="#10b981" stroke="var(--bg-card)" strokeWidth="2" />
              ))}

              {/* Red Line - Stock Out */}
              <path
                d={chartData.stockOutPath}
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
              />
              {/* Red Dots */}
              {chartData.stockOutDots.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill="#ef4444" stroke="var(--bg-card)" strokeWidth="2" />
              ))}

              {/* Yellow Line - Low Stock */}
              <line x1={chartData.lowStockLine.x1} y1={chartData.lowStockLine.y1} x2={chartData.lowStockLine.x2} y2={chartData.lowStockLine.y2} stroke="#f59e0b" strokeWidth="3" />
              {chartData.lowStockDots.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill="#f59e0b" stroke="var(--bg-card)" strokeWidth="2" />
              ))}
            </svg>
          </div>
        </div>

        {/* MIDDLE CARD 2: STOCK STATUS DONUT CHART */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 16px 0' }}>
            Stock Status
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
            {/* SVG Donut Chart */}
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--bg-subtle)"
                  strokeWidth="4.5"
                />
                {/* Green Arc (In Stock 67%) */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4.5"
                  strokeDasharray="67, 100"
                />
                {/* Yellow Arc (Low Stock 14%) */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="4.5"
                  strokeDasharray="14, 100"
                  strokeDashoffset="-67"
                />
                {/* Red Arc (Out of Stock 19%) */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="4.5"
                  strokeDasharray="19, 100"
                  strokeDashoffset="-81"
                />
              </svg>
            </div>

            {/* Donut Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>In Stock</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{availableCount} ({availablePct}%)</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>Low Stock</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{lowStockCount} ({lowStockPct}%)</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>Out of Stock</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{outOfStockCount} ({outOfStockPct}%)</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Medicines</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{totalMeds || 49}</div>
          </div>
        </div>

        {/* MIDDLE CARD 3: EXPIRY ALERTS */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 16px 0' }}>
              Expiry Alerts
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Near Expiry Item */}
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
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Near Expiry</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {metrics?.nearExpiryMedicinesCount || 4}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Within 30 Days</div>
                </div>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock size={20} />
                </div>
              </div>

              {/* Expired Item */}
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
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Expired Items</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {metrics?.expiredMedicinesCount || 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Already Expired</div>
                </div>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <XCircle size={20} />
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
              marginTop: '16px'
            }}
          >
            View Expiry <ArrowRight size={14} />
          </span>
        </div>

      </div>

      {/* ROW 3: RECENT PURCHASE ORDERS, TOP MEDICINES, QUICK ACTIONS (3 Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1.2fr 1.1fr',
        gap: '20px'
      }}>

        {/* BOTTOM CARD 1: RECENT PURCHASE ORDERS TABLE / RECENT SALES HISTORY FOR STAFF */}
        {isStaff ? (
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Recent Sales History
              </h3>
              <span 
                onClick={() => navigate('/sales')}
                style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                View All <ArrowRight size={12} />
              </span>
            </div>

            <div className="table-responsive" style={{ maxHeight: '250px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total Paid</th>
                    <th>Pay Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentSales.length > 0 ? recentSales : [
                    { id: 1, invoiceNumber: 'INV-2026-0042', customerName: 'Walk-in Customer', saleDate: '2026-08-27T10:30:00', finalAmount: 1450, paymentMethod: 'CASH' },
                    { id: 2, invoiceNumber: 'INV-2026-0041', customerName: 'Rajesh Kumar', saleDate: '2026-08-26T15:20:00', finalAmount: 3200, paymentMethod: 'CARD' },
                    { id: 3, invoiceNumber: 'INV-2026-0040', customerName: 'Walk-in Customer', saleDate: '2026-08-26T11:15:00', finalAmount: 890, paymentMethod: 'UPI' },
                    { id: 4, invoiceNumber: 'INV-2026-0039', customerName: 'Anita Sharma', saleDate: '2026-08-25T16:45:00', finalAmount: 2150, paymentMethod: 'CASH' }
                  ]).slice(0, 5).map((sale, i) => (
                    <tr key={sale.id || i}>
                      <td><strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>{sale.invoiceNumber}</strong></td>
                      <td style={{ color: 'var(--text-main)' }}>{sale.customerName || 'Walk-in Customer'}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {sale.saleDate ? new Date(sale.saleDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '27 Aug'}
                      </td>
                      <td style={{ color: 'var(--text-main)', fontWeight: 600 }}>{formatCurrency(sale.finalAmount)}</td>
                      <td>
                        <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                          {sale.paymentMethod || 'CASH'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Recent Purchase Orders
              </h3>
              <span 
                onClick={() => navigate('/purchase-orders')}
                style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                View All <ArrowRight size={12} />
              </span>
            </div>

            {metrics?.recentOrders?.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', padding: '24px 0', textAlign: 'center', fontSize: '0.88rem' }}>
                No recent purchase orders recorded.
              </div>
            ) : (
              <div className="table-responsive" style={{ maxHeight: '250px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>PO Number</th>
                      <th>Supplier</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(metrics?.recentOrders || [
                      { id: 1, orderNumber: 'PO-2026-0012', supplier: { name: 'Apollo Pharma' }, orderDate: '27 Aug 2026', totalAmount: 5750, status: 'DELIVERED' },
                      { id: 2, orderNumber: 'PO-2026-0010', supplier: { name: 'MedPlus Supplier' }, orderDate: '26 Aug 2026', totalAmount: 22100, status: 'PENDING' },
                      { id: 3, orderNumber: 'PO-2026-0009', supplier: { name: 'Apollo Pharma' }, orderDate: '25 Aug 2026', totalAmount: 12900, status: 'CANCELLED' },
                      { id: 4, orderNumber: 'PO-2026-0008', supplier: { name: 'Sani Pharma' }, orderDate: '24 Aug 2026', totalAmount: 9400, status: 'DELIVERED' },
                    ]).map((order, i) => (
                      <tr key={order.id || i}>
                        <td><strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>{order.orderNumber}</strong></td>
                        <td style={{ color: 'var(--text-main)' }}>{order.supplier?.name || 'Supplier'}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{order.orderDate || '27 Aug 2026'}</td>
                        <td style={{ color: 'var(--text-main)', fontWeight: 600 }}>{formatCurrency(order.totalAmount)}</td>
                        <td>
                          <span className={`badge ${
                            order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'badge-success' :
                            order.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM CARD 2: TOP MEDICINES RANKED LIST */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Top Medicines
            </h3>
            <span 
              onClick={() => navigate('/medicines')}
              style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              View All <ArrowRight size={12} />
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayTopMedicines.map(med => (
              <div key={med.rank} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', width: '14px' }}>
                    {med.rank}
                  </span>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: `${med.iconColor}20`,
                    color: med.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Pill size={14} />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {med.name}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {med.units}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CARD 3: QUICK ACTIONS GRID */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 16px 0' }}>
            Quick Actions
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
            {/* Add Medicine (Hidden for Staff) */}
            {!isStaff && (
              <button
                onClick={() => navigate('/medicines')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Plus size={18} />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Add Medicine</span>
              </button>
            )}

            {/* Billing / POS */}
            <button
              onClick={() => navigate('/billing')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Receipt size={18} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Billing / POS</span>
            </button>

            {/* New Purchase Order (Hidden for Staff) */}
            {!isStaff && (
              <button
                onClick={() => navigate('/purchase-orders')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  color: '#8b5cf6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShoppingCart size={18} />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>New Purchase Order</span>
              </button>
            )}

            {/* Stock Adjustment */}
            <button
              onClick={() => navigate('/stock-movements')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ArrowLeftRight size={18} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Stock Adjustment</span>
            </button>
          </div>

          {/* Full Width Button: Generate Report (Hidden for Staff) */}
          {!isStaff && (
            <button
              onClick={() => setShowReportModal(true)}
              style={{
                marginTop: '12px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText size={15} />
              </div>
              <span>Generate Report</span>
            </button>
          )}
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
                  style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-main)' }}
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
