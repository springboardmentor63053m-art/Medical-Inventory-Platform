import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedLayout } from './components/ProtectedLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { SuppliersList } from './pages/SuppliersList';
import { MedicineList } from './pages/MedicineList';
import { InventoryList } from './pages/InventoryList';
import { StockManagement } from './pages/StockManagement';
import { StockHistory } from './pages/StockHistory';
import { LowStockAlerts } from './pages/LowStockAlerts';

import { ExpiryTrackingPage } from './pages/ExpiryTrackingPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { MessagesPage } from './pages/MessagesPage';
import { PrescriptionsPage } from './pages/PrescriptionsPage';
import { SalesPage } from './pages/SalesPage';
import { BillsPage } from './pages/BillsPage';
import { CustomersPage } from './pages/CustomersPage';
import { SupplierOrdersPage } from './pages/SupplierOrdersPage';
import { OutOfStockPage } from './pages/OutOfStockPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { SupplierCataloguePage } from './pages/SupplierCataloguePage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  if (loading) return <div style={{ color: '#fff', padding: '40px', textAlign: 'center' }}>Loading MediStock Portal...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ProtectedLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="suppliers" element={<SuppliersList />} />
              <Route path="medicines" element={<MedicineList />} />
              <Route path="inventory" element={<InventoryList />} />
              <Route path="expiry" element={<ExpiryTrackingPage />} />
              <Route path="stock-management" element={<StockManagement />} />
              <Route path="stock-operations" element={<StockManagement />} />
              <Route path="stock-history" element={<StockHistory />} />
              <Route path="low-stock" element={<LowStockAlerts />} />
              <Route path="out-of-stock" element={<OutOfStockPage />} />
              <Route path="user-management" element={<UserManagementPage />} />
              <Route path="supplier-catalogue" element={<SupplierCataloguePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="bills" element={<BillsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="prescriptions" element={<PrescriptionsPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="supplier-orders" element={<SupplierOrdersPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

