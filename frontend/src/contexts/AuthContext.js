import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'sangeet_token';
const USER_KEY = 'sangeet_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Migration logic for old keys
    const oldAdminToken = localStorage.getItem('adminToken');
    const oldKitchenToken = localStorage.getItem('kitchenToken');
    const oldToken = localStorage.getItem('token');
    
    // Pick the most privileged token or the first available
    const existingToken = localStorage.getItem(TOKEN_KEY) || oldAdminToken || oldKitchenToken || oldToken;
    const existingUser = localStorage.getItem(USER_KEY);

    if (existingToken && !localStorage.getItem(TOKEN_KEY)) {
      // Perform migration
      localStorage.setItem(TOKEN_KEY, existingToken);
      
      if (!existingUser) {
        // We'll need to fetch the user or create a basic one based on which token we found
        let role = 'user';
        if (oldAdminToken) role = 'admin';
        else if (oldKitchenToken) role = 'kitchen';
        
        const basicUser = { role, migrated: true };
        localStorage.setItem(USER_KEY, JSON.stringify(basicUser));
        
        // Remove old keys
        localStorage.removeItem('adminToken');
        localStorage.removeItem('kitchenToken');
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('kitchenUser');
        
        return basicUser;
      }
    }

    if (existingToken && existingUser) {
      try {
        return JSON.parse(existingUser);
      } catch (e) {
        console.error('Failed to parse user from local storage:', e);
        return null;
      }
    }
    
    return null;
  });

  const login = (token, userData) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  return (
    <AuthContext.Provider value={{ user, login, logout, getToken, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
