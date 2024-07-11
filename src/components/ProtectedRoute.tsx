// src/components/ProtectedRoute.tsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { userSettings } = useContext(UserContext);
  const isAuthenticated = userSettings?.token;

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;