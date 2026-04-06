'use client';

import { useState, useEffect, useCallback } from 'react';

const SESSION_KEY = 'admin-session-token';
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const verifyToken = useCallback(async (t: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${t}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await fetch('/api/admin/auth', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Ignore errors
      }
    }
    sessionStorage.removeItem(SESSION_KEY);
    setToken(null);
    setIsAuthenticated(false);
  }, [token]);

  useEffect(() => {
    const storedToken = sessionStorage.getItem(SESSION_KEY);
    if (storedToken) {
      // Verify token is still valid with server
      verifyToken(storedToken).then(valid => {
        if (valid) {
          setToken(storedToken);
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem(SESSION_KEY);
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [verifyToken]);

  // Periodic token verification
  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const interval = setInterval(async () => {
      const valid = await verifyToken(token);
      if (!valid) {
        await logout();
      }
    }, TOKEN_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [token, isAuthenticated, verifyToken, logout]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        sessionStorage.setItem(SESSION_KEY, data.token);
        setToken(data.token);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Helper to check if API response indicates token expired
  const checkAuthError = async (response: Response): Promise<boolean> => {
    if (response.status === 401) {
      await logout();
      return true;
    }
    return false;
  };

  return { isAuthenticated, isLoading, login, logout, getAuthHeaders, checkAuthError, token };
}
