import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  FileText, 
  Download, 
  Printer, 
  BarChart3, 
  AlertTriangle, 
  Clock, 
  ShoppingCart, 
  Pill, 
  Boxes,
  CheckCircle,
  Filter
} from 'lucide-react';

const Reports = () => {
  const [metrics, setMetrics] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('INVENTORY_SUMMARY');

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const [dashRes, medRes] = await Promise.all([
          api.get('/dashboard').catch(() => null),
          api.get('/medicines').catch(() => null)
        ]);

        if (dashRes && dashRes.data && dashRes.data.success) {
          setMetrics(dashRes.data.data);
        }

        if (medRes && medRes.data) {
          const list = Array.isArray(medRes.data) ? medRes.data : (medRes.data.data || []);
          setMedicines(list);
        }
      } catch (err) {
        console.error('Error fetching report metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const handleExportCSV = (type) => {
    const reportTypeToUse = type || selectedReport;
    let headers = [];
    let rows = [];
    let filename = 'medistock_report.csv';

    if (reportTypeToUse === 'INVENTORY_SUMMARY') {
      filename = 'medistock_inventory_summary.csv';
      headers = ['Metric', 'Value'];
      rows = [
        ['Total Medicines Count', metrics?.totalMedicines || medicines.length || 0],
        ['Total Inventory Valuation', metrics?.totalInventoryValue || 0],
        ['Available Medicines', metrics?.availableMedicinesCount || 0],
        ['Low Stock Medicines Count', metrics?.lowStockMedicinesCount || 0],
        ['Out of Stock Count', metrics?.outOfStockMedicinesCount || 0],
        ['Near Expiry Count (<30d)', metrics?.nearExpiryMedicinesCount || 0],
        ['Expired Medicines Count', metrics?.expiredMedicinesCount || 0],
        ['Total Purchase Orders', metrics?.totalPurchaseOrders || 0],
        ['Total Suppliers', metrics?.totalSuppliers || 0],
      ];
    } else if (reportTypeToUse === 'LOW_STOCK') {
      filename = 'medistock_low_stock_audit.csv';
      headers = ['Code', 'Medicine Name', 'Current Stock', 'Reorder Level', 'Rack Location'];
      const lowStockItems = metrics?.lowStockItems || medicines.filter(m => (m.currentStock ?? m.quantity ?? 0) <= (m.reorderLevel ?? 10));
      rows = lowStockItems.map(i => [i.code || i.medicineCode, i.name || i.medicineName, i.currentStock ?? i.quantity, i.reorderLevel || 'N/A', i.locationRack || 'N/A']);
    } else if (reportTypeToUse === 'EXPIRY_REPORT') {
      filename = 'medistock_expiry_audit.csv';
      headers = ['Code', 'Medicine Name', 'Batch Number', 'Expiry Date', 'Days Remaining', 'Stock'];
      rows = medicines.map(m => {
        const exp = m.expiryDate ? new Date(m.expiryDate) : null;
        const days = exp ? Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24)) : 'N/A';
        return [m.code || `ID-${m.id}`, m.name, m.batchNumber || 'N/A', m.expiryDate || 'N/A', days, m.currentStock ?? m.quantity ?? 0];
      });
    } else {
      filename = 'medistock_purchase_orders.csv';
      headers = ['PO Number', 'Supplier', 'Date', 'Total Amount', 'Status'];
      rows = (metrics?.recentOrders || []).map(o => [o.orderNumber, o.supplier?.name || 'Supplier', o.orderDate || 'N/A', o.totalAmount, o.status]);
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
  };

  const reportsList = [
    {
      id: 'INVENTORY_SUMMARY',
      title: 'Full Inventory Telemetry & Asset Report',
      description: 'Comprehensive audit of total medicines, catalogue valuation, available stock, and supplier counts.',
      icon: <Boxes size={22} style={{ color: 'var(--primary)' }} />,
      badge: 'Core Audit'
    },
    {
      id: 'LOW_STOCK',
      title: 'Low Stock & Restock Priority Audit',
      description: 'Detailed watchlist of items reaching or falling below safety reorder levels.',
      icon: <AlertTriangle size={22} style={{ color: 'var(--warning)' }} />,
      badge: 'Action Required'
    },
    {
      id: 'EXPIRY_REPORT',
      title: 'Expiry Risk & Shelf-Life Telemetry Report',
      description: 'Complete breakdown of medicines expiring within 30, 60, 90 days, or already expired.',
      icon: <Clock size={22} style={{ color: 'var(--danger)' }} />,
      badge: 'Risk Audit'
    },
    {
      id: 'PURCHASE_ORDERS',
      title: 'Purchase Orders & Supplier History Report',
      description: 'Detailed transaction logs of all purchase orders placed with suppliers and delivery statuses.',
      icon: <ShoppingCart size={22} style={{ color: '#8b5cf6' }} />,
      badge: 'Procurement'
    }
  ];

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading report metrics...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={22} style={{ color: 'var(--primary)' }} />
            Reports & Analytical Export Center
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Generate, download CSV, and print PDF inventory compliance reports.
          </p>
        </div>
      </div>

      {/* Available Reports Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {reportsList.map(rep => {
          const isSelected = selectedReport === rep.id;

          return (
            <div
              key={rep.id}
              onClick={() => setSelectedReport(rep.id)}
              className="card"
              style={{
                padding: '20px',
                borderLeft: isSelected ? '4px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: isSelected ? 'var(--bg-subtle)' : 'var(--bg-card)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {rep.icon}
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                    {rep.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                  {rep.title}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {rep.description}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleExportCSV(rep.id); }}
                  className="btn btn-primary"
                  style={{ flex: 1, height: '36px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Download size={14} />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); window.print(); }}
                  className="btn btn-secondary"
                  style={{ height: '36px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Printer size={14} />
                  <span>Print PDF</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Reports;
