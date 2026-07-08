"use client";
import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface User {
  role: 'admin' | 'kitchen' | 'reception' | 'waiter' | 'user';
  migrated?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  getToken: () => string | null;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'sangeet_token';
const USER_KEY = 'sangeet_user';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const oldAdminToken = localStorage.getItem('adminToken');
    const oldKitchenToken = localStorage.getItem('kitchenToken');
    const oldToken = localStorage.getItem('token');
    
    // Pick the most privileged token or the first available
    const existingToken = localStorage.getItem(TOKEN_KEY) || oldAdminToken || oldKitchenToken || oldToken;
    const existingUser = localStorage.getItem(USER_KEY);

    const isTokenExpired = (token: string): boolean => {
      try {
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) return true;
        const decodedJson = atob(payloadBase64);
        const decoded = JSON.parse(decodedJson);
        if (!decoded.exp) return false;
        return (decoded.exp * 1000) < Date.now();
      } catch (e) {
        return true;
      }
    };

    if (existingToken && isTokenExpired(existingToken)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('kitchenToken');
      localStorage.removeItem('token');
      return null;
    }

    if (existingToken && !localStorage.getItem(TOKEN_KEY)) {
      // Perform migration
      localStorage.setItem(TOKEN_KEY, existingToken);
      
      if (!existingUser) {
        // We'll need to fetch the user or create a basic one based on which token we found
        let role: User['role'] = 'user';
        if (oldAdminToken) role = 'admin';
        else if (oldKitchenToken) role = 'kitchen';
        
        const basicUser: User = { role, migrated: true };
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
        return JSON.parse(existingUser) as User;
      } catch (e) {
        console.error('Failed to parse user from local storage:', e);
        return null;
      }
    }
    
    return null;
  });

  const login = (token: string, userData: User) => {
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
