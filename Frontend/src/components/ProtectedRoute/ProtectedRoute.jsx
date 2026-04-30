import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const roleHomePath = (role) => {
  switch (role) {
    case 'Admin':
      return '/admin/dashboard';
    case 'Doctor':
      return '/doctor/dashboard';
    case 'Patient':
      return '/patient/dashboard';
    default:
      return '/login';
  }
};

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
export { roleHomePath };
