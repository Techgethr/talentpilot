// client/src/components/ProtectedRoute.js
import React from 'react';

// Temporary component that allows access without authentication
const ProtectedRoute = ({ children }) => {
  // Always allow access
  return children;
};

export default ProtectedRoute;