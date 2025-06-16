import React from 'react';
import { useAuth } from '../context/authContext';
import { Navigate, Outlet } from 'react-router-dom';

export function AdminProtectedRoute() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <h1>Loading...</h1>; // Or a more sophisticated loading spinner
  }

  if (!loading && (!isAuthenticated || user?.role !== 'administrador')) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
