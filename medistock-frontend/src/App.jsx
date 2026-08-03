import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import Inventory from './pages/Inventory';
import PurchaseOrders from './pages/PurchaseOrders';
import Users from './pages/Users';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Authenticated routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Dashboard accessible by all roles */}
              <Route path="/" element={<Dashboard />} />
              
              {/* Medicines catalog accessible by all roles */}
              <Route path="/medicines" element={<Medicines />} />

              {/* Categories accessible by Admin, Pharmacist, and Staff */}
              <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF']} />}>
                <Route path="/categories" element={<Categories />} />
              </Route>

              {/* Suppliers accessible by Admin, Staff */}
              <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF']} />}>
                <Route path="/suppliers" element={<Suppliers />} />
              </Route>

              {/* Inventory accessible by Admin, Pharmacist, Doctor, User, and Staff */}
              <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_DOCTOR', 'ROLE_USER', 'ROLE_STAFF']} />}>
                <Route path="/inventory" element={<Inventory />} />
              </Route>

              {/* Purchase Orders accessible by Admin, Pharmacist, Supplier, and Staff */}
              <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_SUPPLIER', 'ROLE_STAFF']} />}>
                <Route path="/purchase-orders" element={<PurchaseOrders />} />
              </Route>

              {/* Users Control only accessible by Admin */}
              <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
                <Route path="/users" element={<Users />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
