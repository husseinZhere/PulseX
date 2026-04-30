import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { clearSession, getStoredUser, getToken, setSession } from '../utils/api';
import { stopChatConnection } from '../services/chatRealtimeService';
import { useTheme } from './ThemeContext';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const normalizeUser = (payload) => {
  if (!payload) return null;

  const rawRole = String(payload.role ?? payload.Role ?? '').trim();
  const normalizedRole = rawRole
    ? `${rawRole.charAt(0).toUpperCase()}${rawRole.slice(1).toLowerCase()}`
    : '';

  return {
    userId: payload.user_id ?? payload.userId ?? null,
    email: payload.email ?? '',
    firstName: payload.first_name ?? payload.firstName ?? '',
    lastName: payload.last_name ?? payload.lastName ?? '',
    fullName:
      payload.full_name ??
      payload.fullName ??
      `${payload.first_name ?? ''} ${payload.last_name ?? ''}`.trim(),
    role: normalizedRole,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getToken());
  const [loading, setLoading] = useState(false);

  const { loadThemeForUser, resetToLight } = useTheme();

  // Restore theme for users who already have an active session (same tab, page refresh)
  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      loadThemeForUser(storedUser.userId);
    }
  }, [loadThemeForUser]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/Auth/login', { email, password });
      const normalized = normalizeUser(data);
      setSession(data.token, normalized);
      setToken(data.token);
      setUser(normalized);
      loadThemeForUser(normalized.userId);
      return normalized;
    } finally {
      setLoading(false);
    }
  }, [loadThemeForUser]);

  const registerPatient = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/Auth/register/patient', payload);
      const normalized = normalizeUser(data);
      if (data?.token) {
        setSession(data.token, normalized);
        setToken(data.token);
        setUser(normalized);
        loadThemeForUser(normalized.userId); // new user → no saved pref → defaults to light
      }
      return data;
    } finally {
      setLoading(false);
    }
  }, [loadThemeForUser]);

  const logout = useCallback(() => {
    stopChatConnection().catch(() => { });
    clearSession();
    setToken(null);
    setUser(null);
    resetToLight();
  }, [resetToLight]);

  const isAuthenticated = Boolean(token && user);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    registerPatient,
    setUser: (u) => {
      const normalized = normalizeUser(u);
      setUser(normalized);
      if (normalized && token) {
        setSession(token, normalized);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
