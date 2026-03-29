import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Define logout first so it can be used inside useEffect
  const logout = useCallback(() => {
    localStorage.removeItem('campushub_token');
    localStorage.removeItem('campushub_user');
    setUser(null);
  }, []);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('campushub_token');
    const saved = localStorage.getItem('campushub_user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch {}
      authAPI.getMe()
        .then(res => { setUser(res.data.user); localStorage.setItem('campushub_user', JSON.stringify(res.data.user)); })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [logout]);

  const login = useCallback(async (identifier, password) => {
    const res = await authAPI.login({ identifier, password });
    localStorage.setItem('campushub_token', res.data.token);
    localStorage.setItem('campushub_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    localStorage.setItem('campushub_token', res.data.token);
    localStorage.setItem('campushub_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
