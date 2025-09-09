// client/src/contexts/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Simulate a default user for development
  const [user] = useState({
    id: 1,
    name: 'Developer User',
    email: 'developer@example.com',
    role: 'admin'
  });

  const value = {
    user,
    login: () => {},
    logout: () => {},
    loading: false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};