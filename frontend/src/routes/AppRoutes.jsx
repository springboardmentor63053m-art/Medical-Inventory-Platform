import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';

// Feature Pages
import LoginPage from '../features/authentication/pages/LoginPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import CategoryListPage from '../features/category/pages/CategoryListPage';
import MedicineListPage from '../features/medicine/pages/MedicineListPage';
import SupplierListPage from '../features/supplier/pages/SupplierListPage';
import InventoryListPage from '../features/inventory/pages/InventoryListPage';
import ExpiringMedicinesPage from '../features/inventory/pages/ExpiringMedicinesPage';
import PurchaseOrderPage from '../features/purchase/pages/PurchaseOrderPage';
import ReportsPage from '../features/reports/pages/ReportsPage';
import NotificationsPage from '../features/notifications/pages/NotificationsPage';
import ProfilePage from '../features/profile/pages/ProfilePage';
import UsersPage from '../features/users/pages/UsersPage';

// Prescription & Store POS Feature Pages
import PrescriptionOrderPage from '../features/prescription/pages/PrescriptionOrderPage';
import PharmacistVerificationPage from '../features/prescription/pages/PharmacistVerificationPage';
import StoreCounterPurchasePage from '../features/prescription/pages/StoreCounterPurchasePage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes wrapped with MainLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Navigate to="/dashboard" replace />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CategoryListPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/medicines"
        element={
          <ProtectedRoute>
            <MainLayout>
              <MedicineListPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/suppliers"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SupplierListPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <MainLayout>
              <InventoryListPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/expiring"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ExpiringMedicinesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/purchase-orders"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PurchaseOrderPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ReportsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <MainLayout>
              <NotificationsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
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
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
