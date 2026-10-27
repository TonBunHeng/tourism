/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService, { normalizeRole } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => authService.getToken());
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const currentToken = authService.getToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      const res = await authService.me();
      const freshUser = res?.data?.user || res?.data;
      if (freshUser) {
        setUser(freshUser);
        return freshUser;
      }
    } catch (err) {
      if (err?.status === 401) {
        authService.clearSession();
        setUser(null);
        setToken(null);
      }
    } finally {
      setIsLoading(false);
    }
    return null;
  }, []);

  useEffect(() => {
    refreshUser();

    const handleStorageChange = () => {
      setToken(authService.getToken());
      setUser(authService.getCurrentUser());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-profile-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-profile-updated', handleStorageChange);
    };
  }, [refreshUser]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res?.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    if (res?.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  const currentRole = normalizeRole(user?.role);
  const isAuthenticated = Boolean(token && user);
  const isBusinessOwner = currentRole === 'business_owner';
  const isTourist = currentRole === 'user';
  const isAdmin = ['super_admin', 'admin', 'guide_editor'].includes(currentRole);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role: currentRole,
        isLoading,
        isAuthenticated,
        isTourist,
        isBusinessOwner,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
        setUser,
      }}
    >
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

export default AuthContext;
