import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Layout
import Layout from './components/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import UserFormPage from './pages/UserFormPage';
import RegionsPage from './pages/RegionsPage';
import RegionFormPage from './pages/RegionFormPage';
import SuppliesPage from './pages/SuppliesPage';
import SupplyFormPage from './pages/SupplyFormPage';
import TransactionsPage from './pages/TransactionsPage';
import TransactionFormPage from './pages/TransactionFormPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import AssetsPage from './pages/AssetsPage';
import PermissionsPage from './pages/PermissionsPage';
import PermissionFormPage from './pages/PermissionsFormPage';

// Component for role-based protection
type RoleProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
};


const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, hasAnyRole, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If no specific roles are required or user has admin role, allow access
  if (allowedRoles.length === 0 || hasRole('ADMIN') || hasRole('MASTER')) {
    return <>{children}</>;
  }

  // Check if user has any of the allowed roles
  if (hasAnyRole(allowedRoles)) {
    return <>{children}</>;
  }

  // If user doesn't have required roles, redirect to dashboard
  return <Navigate to="/" />;
};

function App() {
  return (
      <AuthProvider>
        {/* Import Bootstrap JS */}

        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected routes inside Layout */}
          <Route
            path="/"
            element={
              <RoleProtectedRoute>
                <Layout />
              </RoleProtectedRoute>
            }
          >
            {/* Dashboard - accessible by all authenticated users */}
            <Route index element={<DashboardPage />} />

            {/* Users management - only ADMIN and SUPERVISOR */}
            <Route
              path="users"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'MASTER']}>
                  <UsersPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="users/new"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'MASTER']}>
                  <UserFormPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="users/edit/:userId"
              element={
                <RoleProtectedRoute>
                  <UserFormPage />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="permissions"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'MASTER']}>
                  <PermissionsPage />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="permissions/new"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'MASTER']}>
                  <PermissionFormPage />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="permissions/edit/:id"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'MASTER']}>
                  <PermissionFormPage />
                </RoleProtectedRoute>
              }
            />

            {/* Regions management - only ADMIN and SUPERVISOR */}
            <Route
              path="regions"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'MASTER']}>
                  <RegionsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="regions/new"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'MASTER']}>
                  <RegionFormPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="regions/edit/:regionCode"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'MASTER']}>
                  <RegionFormPage />
                </RoleProtectedRoute>
              }
            />

            {/* Supplies management - all authenticated except GUEST */}
            <Route
              path="supplies"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'MASTER', 'USER']}>
                  <SuppliesPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="supplies/new"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'MASTER']}>
                  <SupplyFormPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="supplies/edit/:id"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'MASTER']}>
                  <SupplyFormPage />
                </RoleProtectedRoute>
              }
            />

            {/* Transactions - accessible by all authenticated users */}
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="transactions/new" element={<TransactionFormPage />} />

            {/* 404 page */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>

        {/* Global toast container - will be used by pages that don't use Layout */}
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
  );
}

export default App;

