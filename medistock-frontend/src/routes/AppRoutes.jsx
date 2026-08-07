import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import { Login } from '../pages/auth/Login';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { PharmacistDashboard } from '../pages/pharmacist/PharmacistDashboard';
import { CategoryManagement } from '../pages/categories/CategoryManagement';
import { MedicineManagement } from '../pages/medicines/MedicineManagement';
import { SupplierManagement } from '../pages/suppliers/SupplierManagement';
import { PurchaseOrderManagement } from '../pages/orders/PurchaseOrderManagement';
import { UserManagement } from '../pages/users/UserManagement';
import { Unauthorized } from '../pages/Unauthorized';
import { NotFound } from '../pages/NotFound';

import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

const HomeRedirect = () => {
  const { isAuthenticated, roles, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles.includes('ROLE_ADMIN')) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (roles.includes('ROLE_PHARMACIST')) {
    return <Navigate to="/pharmacist/dashboard" replace />;
  }

  return <Navigate to="/unauthorized" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<HomeRedirect />} />

      {/* Admin Portal Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ROLE_ADMIN']}>
              <MainLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="medicines" element={<MedicineManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="suppliers" element={<SupplierManagement />} />

        <Route path="orders" element={<PurchaseOrderManagement />} />
        <Route path="users" element={<UserManagement />} />
      </Route>

      {/* Pharmacist Portal Protected Routes */}
      <Route
        path="/pharmacist"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ROLE_PHARMACIST']}>
              <MainLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<PharmacistDashboard />} />

        <Route path="medicines" element={<MedicineManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="orders" element={<PurchaseOrderManagement />} />
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
