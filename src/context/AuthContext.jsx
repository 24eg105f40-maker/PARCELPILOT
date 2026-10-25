// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('parcelpilot_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('parcelpilot_token'));
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('parcelpilot_token');
    localStorage.removeItem('parcelpilot_user');
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('parcelpilot_token', res.token);
      localStorage.setItem('parcelpilot_user', JSON.stringify(res.user));
    }
    return res;
  };

  // Validate existing token with /api/auth/me on initial mount
  useEffect(() => {
    async function verifyToken() {
      const savedToken = localStorage.getItem('parcelpilot_token');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await authApi.getMe();
        if (response.success && response.user) {
          setUser(response.user);
          localStorage.setItem('parcelpilot_user', JSON.stringify(response.user));
        } else {
          logout();
        }
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    }

    verifyToken();

    const handleAuthExpired = () => {
      logout();
    };
    window.addEventListener('parcelpilot_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('parcelpilot_auth_expired', handleAuthExpired);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
