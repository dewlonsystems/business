// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  return token ? children || <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;