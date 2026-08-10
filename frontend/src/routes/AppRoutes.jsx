import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../contexts/AuthContext';

// Feature Pages
import LoginPage from '../features/authentication/pages/LoginPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import UserDashboardPage from '../features/dashboard/pages/UserDashboardPage';
import StaffDashboardPage from '../features/dashboard/pages/StaffDashboardPage';
import PharmacistDashboardPage from '../features/dashboard/pages/PharmacistDashboardPage';
import CategoryListPage from '../features/category/pages/CategoryListPage';
import UserCategoryPage from '../features/category/pages/UserCategoryPage';
import MedicineListPage from '../features/medicine/pages/MedicineListPage';
import UserMedicinePage from '../features/medicine/pages/UserMedicinePage';
import SupplierListPage from '../features/supplier/pages/SupplierListPage';
import InventoryListPage from '../features/inventory/pages/InventoryListPage';
import ExpiringMedicinesPage from '../features/inventory/pages/ExpiringMedicinesPage';
import PurchaseOrderPage from '../features/purchase/pages/PurchaseOrderPage';
import ReportsPage from '../features/reports/pages/ReportsPage';
import NotificationsPage from '../features/notifications/pages/NotificationsPage';
import ProfilePage from '../features/profile/pages/ProfilePage';
import UsersPage from '../features/users/pages/UsersPage';
import PrescriptionOrderPage from '../features/prescription/pages/PrescriptionOrderPage';
import PharmacistVerificationPage from '../features/prescription/pages/PharmacistVerificationPage';
import StoreCounterPurchasePage from '../features/prescription/pages/StoreCounterPurchasePage';

function RoleDashboardRedirect() {
  const { getDashboardPath } = useAuth();
  return <Navigate to={getDashboardPath()} replace />;
}

function MedicinesRouteSwitch() {
  const { isUser } = useAuth();
  return isUser ? <UserMedicinePage /> : <MedicineListPage />;
}

function CategoriesRouteSwitch() {
  const { isUser } = useAuth();
  return isUser ? <UserCategoryPage /> : <CategoryListPage />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Root & Generic Dashboard Redirects */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleDashboardRedirect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleDashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* Base Role Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Navigate to="/admin/dashboard" replace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pharmacist"
        element={
          <ProtectedRoute allowedRoles={['PHARMACIST']}>
            <Navigate to="/pharmacist/dashboard" replace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['STAFF']}>
            <Navigate to="/staff/dashboard" replace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <Navigate to="/user/dashboard" replace />
          </ProtectedRoute>
        }
      />

      {/* Role-Specific Dashboard Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/pharmacist/dashboard"
        element={
          <ProtectedRoute allowedRoles={['PHARMACIST']}>
            <MainLayout>
              <PharmacistDashboardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/dashboard"
        element={
          <ProtectedRoute allowedRoles={['STAFF']}>
            <MainLayout>
              <StaffDashboardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <MainLayout>
              <UserDashboardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Feature Routes with Role Guards */}
      <Route
        path="/categories"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'STAFF', 'USER']}>
            <MainLayout>
              <CategoriesRouteSwitch />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/medicines"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'STAFF', 'USER']}>
            <MainLayout>
              <MedicinesRouteSwitch />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/suppliers"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST']}>
            <MainLayout>
              <SupplierListPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'STAFF']}>
            <MainLayout>
              <InventoryListPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/expiring"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'STAFF']}>
            <MainLayout>
              <ExpiringMedicinesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/purchase-orders"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST']}>
            <MainLayout>
              <PurchaseOrderPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST']}>
            <MainLayout>
              <ReportsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'STAFF']}>
            <MainLayout>
              <NotificationsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'STAFF', 'USER']}>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Only Route */}
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout>
              <UsersPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/prescription-orders"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PrescriptionOrderPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/pharmacist/verify"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST']}>
            <MainLayout>
              <PharmacistVerificationPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/store-counter"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST']}>
            <MainLayout>
              <StoreCounterPurchasePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
