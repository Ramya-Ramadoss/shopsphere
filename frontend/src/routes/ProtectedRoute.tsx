import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-semibold text-sm">Verifying session credentials...</p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    // Redirect to login page and preserve attempt path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role authorization checks
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If Admin attempts customer view, redirect to admin dashboard, and vice-versa
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};
