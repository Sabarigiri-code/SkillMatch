import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    // If not authenticated, redirect to the landing page instead of login
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the child routes (e.g., DashboardLayout)
  return <Outlet />;
};

export default ProtectedRoute;
