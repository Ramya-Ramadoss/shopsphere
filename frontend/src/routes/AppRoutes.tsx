import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Page Imports
import { Home } from '../pages/customer/Home';
import { ProductListing } from '../pages/customer/ProductListing';
import { ProductDetails } from '../pages/customer/ProductDetails';
import { Wishlist } from '../pages/wishlist/Wishlist';
import { Cart } from '../pages/cart/Cart';
import { Checkout } from '../pages/orders/Checkout';
import { Payment } from '../pages/orders/Payment';
import { OrderSuccess } from '../pages/orders/OrderSuccess';
import { OrderHistory } from '../pages/orders/OrderHistory';
import { Profile } from '../pages/profile/Profile';

import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ForgotPassword } from '../pages/auth/ForgotPassword';

import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminProducts } from '../pages/admin/AdminProducts';
import { AdminCategories } from '../pages/admin/AdminCategories';
import { AdminOrders } from '../pages/admin/AdminOrders';
import { AdminInventory } from '../pages/inventory/AdminInventory';
import { AdminReports } from '../pages/reports/AdminReports';

import { NotFound } from '../pages/customer/NotFound';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Customer / Public Routes */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<ProductListing />} />
        <Route path="products/:id" element={<ProductDetails />} />
        
        {/* Protected Customer Routes */}
        <Route
          path="wishlist"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="cart"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="payment"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="order-success"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* 404 Route within Customer Layout */}
        <Route path="404" element={<NotFound />} />
      </Route>

      {/* Auth / Public Account Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin Panel Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      {/* Wildcard redirects to custom 404 page */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};
