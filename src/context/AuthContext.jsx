import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('nexuscloud_auth');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('nexuscloud_auth');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const result = await api.login(email, password);
    const userData = { ...result.user, isAuthenticated: true };
    localStorage.setItem('nexuscloud_auth', JSON.stringify(userData));
    setUser(userData);
    return result;
  };

  const signup = async (data) => {
    const result = await api.signup(data);
    const userData = { ...result.user, isAuthenticated: true };
    localStorage.setItem('nexuscloud_auth', JSON.stringify(userData));
    setUser(userData);
    return result;
  };

  const logout = () => {
    localStorage.removeItem('nexuscloud_auth');
    setUser(null);
  };

  const isAuthenticated = !!user?.isAuthenticated;

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
