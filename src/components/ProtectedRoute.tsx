// src/components/ProtectedRoute.tsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../UserContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { userSettings } = useContext(UserContext);
  const isAuthenticated = userSettings?.access_token ? true : false;

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;