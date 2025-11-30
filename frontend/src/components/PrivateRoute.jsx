// src/components/PrivateRoute.jsx
import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { startSessionMonitor } from '../utils/sessionManager';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  useEffect(() => {
    let cleanup;
    if (token) {
      // Only start monitor when authenticated
      cleanup = startSessionMonitor();
    }

    // Cleanup on unmount or when token is removed
    return () => {
      if (cleanup) cleanup();
    };
  }, [token]); // Re-run if token changes (e.g., login/logout)

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children || <Outlet />;
};

export default PrivateRoute;