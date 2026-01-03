import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export const ProtectedRoute = ({ children, requireAdmin, requireAdminOrHR }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user.role !== 'Admin') {
    return <Navigate to="/dashboard" />;
  }

  if (requireAdminOrHR && user.role !== 'Admin' && user.role !== 'HR') {
    return <Navigate to="/dashboard" />;
  }

  // Check if first login and redirect to change password
  if (user.isFirstLogin && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" />;
  }

  return children;
};
