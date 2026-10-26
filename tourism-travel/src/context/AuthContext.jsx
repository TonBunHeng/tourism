/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user') || localStorage.getItem('travel_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authService.me();
          if (res?.data) {
            const userObj = res.data.user || res.data;
            setUser(userObj);
          }
        } catch (err) {
          if (err?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const token = res?.data?.token || res?.token || res?.access_token || localStorage.getItem('auth_token');
    const userObj = res?.data?.user || res?.user || (res?.data && typeof res.data === 'object' && !res.data.token ? res.data : null) || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

    if (token && userObj) {
      setToken(token);
      setUser(userObj);
      closeAuthModal();
      return userObj;
    }
    throw new Error(res?.message || 'Login failed. Please check your credentials.');
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    const token = res?.data?.token || res?.token || res?.access_token || localStorage.getItem('auth_token');
    const userObj = res?.data?.user || res?.user || (res?.data && typeof res.data === 'object' && !res.data.token ? res.data : null) || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

    if (token && userObj) {
      setToken(token);
      setUser(userObj);
      closeAuthModal();
      return userObj;
    }
    throw new Error(res?.message || 'Registration failed. Please check registration details.');
  };

  const googleLogin = async (data) => {
    const res = await authService.googleLogin(data);
    const token = res?.data?.token || res?.token || res?.access_token || localStorage.getItem('auth_token');
    const userObj = res?.data?.user || res?.user || (res?.data && typeof res.data === 'object' && !res.data.token ? res.data : null) || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

    if (token && userObj) {
      setToken(token);
      setUser(userObj);
      closeAuthModal();
      return userObj;
    }
    throw new Error(res?.message || 'Google login failed');
  };


  const updateProfile = async (data) => {
    const res = await authService.updateProfile(data);
    if (res?.data) {
      const userObj = res.data.user || res.data;
      setUser(userObj);
      return userObj;
    }
    throw new Error(res?.message || 'Profile update failed');
  };

  const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await authService.uploadAvatar(formData);
    if (res?.data) {
      const userObj = res.data.user || res.data;
      setUser(userObj);
      return userObj;
    }
    throw new Error(res?.message || 'Avatar upload failed');
  };

  const deleteAvatar = async () => {
    const res = await authService.deleteAvatar();
    if (res?.data) {
      const userObj = res.data.user || res.data;
      setUser(userObj);
      return userObj;
    }
    throw new Error(res?.message || 'Avatar deletion failed');
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
  };

  const rawRole = user?.role || 'user';
  const normRole = String(rawRole).toLowerCase().trim().replace(/[\s/-]+/g, '_');

  const isSuperAdmin = normRole === 'super_admin' || normRole === 'superadmin';
  const isAdmin = normRole === 'admin' || normRole === 'super_admin' || normRole === 'superadmin' || normRole === 'administrator';
  const isBusinessOwner = normRole === 'business_owner' || normRole === 'business' || isAdmin;
  const isGuideEditor = ['tour_guide', 'guide_editor', 'content_editor', 'guide'].includes(normRole) || isAdmin;
  const isTourist = normRole === 'user' || normRole === 'tourist' || normRole === 'member';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: rawRole,
        isSuperAdmin,
        isAdmin,
        isBusinessOwner,
        isGuideEditor,
        isTourist,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        googleLogin,
        logout,
        updateProfile,
        uploadAvatar,
        deleteAvatar,
        authModal,
        openAuthModal,
        closeAuthModal,
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
