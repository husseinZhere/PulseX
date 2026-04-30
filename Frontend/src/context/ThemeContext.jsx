import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

const THEME_KEY = 'theme';
const userThemeKey = (userId) => `theme_user_${userId}`;

const safeGet = (key) => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const safeSet = (key, value) => {
  try { localStorage.setItem(key, value); } catch {}
};

export const ThemeProvider = ({ children }) => {
  const activeUserIdRef = useRef(null);

  const [isDark, setIsDark] = useState(() => safeGet(THEME_KEY) === 'dark');

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isDark) {
      root.classList.add('dark');
      body.classList.add('dark');
      root.style.colorScheme = 'dark';
      safeSet(THEME_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.style.colorScheme = 'light';
      safeSet(THEME_KEY, 'light');
    }
  }, [isDark]);

  // Toggle and auto-save to the active user's per-user key
  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      const userId = activeUserIdRef.current;
      if (userId) safeSet(userThemeKey(userId), next ? 'dark' : 'light');
      return next;
    });
  }, []);

  // Called after login — reads user's saved preference and applies it
  const loadThemeForUser = useCallback((userId) => {
    if (!userId) return;
    activeUserIdRef.current = userId;
    const saved = safeGet(userThemeKey(userId));
    // New users have no saved key → default to light
    setIsDark(saved === 'dark');
  }, []);

  // Called after logout and on the public home/landing page
  const resetToLight = useCallback(() => {
    activeUserIdRef.current = null;
    setIsDark(false);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setIsDark, loadThemeForUser, resetToLight }}>
      {children}
    </ThemeContext.Provider>
  );
};
