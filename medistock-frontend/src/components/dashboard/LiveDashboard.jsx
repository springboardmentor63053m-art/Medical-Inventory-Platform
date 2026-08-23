import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import { categoryApi } from '../../api/categoryApi';
import { medicineApi } from '../../api/medicineApi';
import { inventoryApi } from '../../api/inventoryApi';
import { Loader } from '../common/Loader';
import { 
  Pill, 
  Layers, 
  Truck, 
  Boxes, 
  ShoppingCart, 
  AlertTriangle, 
  Calendar, 
  IndianRupee, 
  RefreshCw,
  TrendingDown,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';

export const LiveDashboard = ({ roleTitle = 'Administrator' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [metrics, setMetrics] = useState({
    totalMedicines: 0,
    totalCategories: 0,
    totalSuppliers: 0,
    totalInventory: 0,
    totalOrders: 0,
    lowStockCount: 0,
    expiringCount: 0,
    totalInventoryValue: 0
  });

  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiringMedicines, setExpiringMedicines] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, categoryRes, medicineRes, inventoryRes] = await Promise.all([
        dashboardApi.getSummary().catch(err => {
          console.error('Summary API failed', err);
          return null;
        }),
        categoryApi.getAll().catch(err => {
          console.error('Category API failed', err);
          return null;
        }),
        medicineApi.getAll().catch(err => {
          console.error('Medicine API failed', err);
          return null;
        }),
        inventoryApi.getAll().catch(err => {
          console.error('Inventory API failed', err);
          return null;
        })
      ]);

      const summary = summaryRes?.data || {};
      const categories = categoryRes?.data || [];
      const medicines = medicineRes?.data || [];
      const inventory = inventoryRes?.data || [];

      // Expiring medicines calculation (expired or expiring within 180 days)
      const now = new Date();
      const next180Days = new Date();
      next180Days.setDate(now.getDate() + 180);

      const expiringList = medicines.filter(m => {
        if (!m.expiryDate) return false;
        const exp = new Date(m.expiryDate);
        return exp <= next180Days;
      });

      setMetrics({
        totalMedicines: summary.totalMedicines ?? medicines.length ?? 0,
        totalCategories: categories.length ?? 0,
        totalSuppliers: summary.totalSuppliers ?? 0,
        totalInventory: inventory.reduce((sum, item) => sum + (item.quantity || 0), 0) || inventory.length || 0,
        totalOrders: summary.totalPurchaseOrders ?? 0,
        lowStockCount: summary.lowStockCount ?? (summary.lowStockItems ? summary.lowStockItems.length : 0),
        expiringCount: expiringList.length,
        totalInventoryValue: summary.totalInventoryValue ?? 0
      });

      setLowStockItems(summary.lowStockItems || []);
      setRecentOrders(summary.recentOrders || []);
      setExpiringMedicines(expiringList);

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load live dashboard data. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader fullScreen={false} message="Loading live metrics from Spring Boot backend..." />;
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: 'var(--color-danger-light)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#fca5a5',
        padding: '20px',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={24} />
          <span>{error}</span>
        </div>
        <button
          onClick={fetchDashboardData}
          style={{
            backgroundColor: 'var(--color-danger)',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Medicines', value: metrics.totalMedicines, icon: Pill, color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.15)' },
    { title: 'Total Categories', value: metrics.totalCategories, icon: Layers, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
    { title: 'Total Suppliers', value: metrics.totalSuppliers, icon: Truck, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
    { title: 'Total Inventory Stock', value: `${metrics.totalInventory} Units`, icon: Boxes, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
    { title: 'Purchase Orders', value: metrics.totalOrders, icon: ShoppingCart, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' },
    { title: 'Low Stock Alerts', value: metrics.lowStockCount, icon: TrendingDown, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    { title: 'Expiring Medicines', value: metrics.expiringCount, icon: Calendar, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
    { title: 'Inventory Total Value', value: `₹${Number(metrics.totalInventoryValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: IndianRupee, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800 }}>
            {roleTitle} Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Live metrics & telemetry synchronized with Spring Boot backend APIs
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'var(--transition-fast)'
          }}
        >
          <RefreshCw size={16} />
          Sync Live Data
        </button>
      </div>

      {/* Grid of 8 Live Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px'
      }}>
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--card-shadow)',
              transition: 'all 0.2s ease'
            }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {card.title}
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px', color: 'var(--text-main)' }}>
                  {card.value}
                </div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--border-radius-md)',
                backgroundColor: card.bg,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Section: Low Stock Items & Expiring Medicines */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
        gap: '24px'
      }}>
        {/* Low Stock Items Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <TrendingDown size={20} style={{ color: 'var(--warning)' }} />
              Low Stock Inventory
            </h3>
            <span className="badge badge-warning">
              {lowStockItems.length} Items
            </span>
          </div>

          {lowStockItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <PackageCheck size={36} style={{ margin: '0 auto 8px', color: 'var(--primary)' }} />
              All inventory levels are above reorder thresholds.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lowStockItems.map((item, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--border-radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft: '4px solid var(--warning)'
                }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{item.medicineName || `Medicine #${item.medicineId}`}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Rack: {item.locationRack || 'N/A'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '0.95rem' }}>
                      {item.quantity} units remaining
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Reorder level: {item.reorderLevel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiring Medicines Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Calendar size={20} style={{ color: 'var(--danger)' }} />
              Expiring Medicines Tracking
            </h3>
            <span className="badge badge-danger">
              {expiringMedicines.length} Expiring
            </span>
          </div>

          {expiringMedicines.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <ShieldCheck size={36} style={{ margin: '0 auto 8px', color: 'var(--success)' }} />
              No medicines expiring within 180 days.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {expiringMedicines.map((med, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--border-radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft: '4px solid var(--danger)'
                }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{med.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Batch: {med.batchNumber || 'N/A'} | Code: {med.code}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '0.9rem' }}>
                      Exp: {med.expiryDate}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Stock: {med.currentStock ?? 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
