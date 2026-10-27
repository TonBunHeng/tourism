import api, { GOOGLE_REDIRECT_URL } from './api';

export const normalizeRole = (role) => {
  if (!role) return 'user';
  const cleaned = String(role).toLowerCase().trim().replace(/[\s/-]+/g, '_');
  if (['super_admin', 'superadmin'].includes(cleaned)) return 'super_admin';
  if (['admin', 'administrator'].includes(cleaned)) return 'admin';
  if (['guide_editor', 'guide', 'editor', 'tourism_content_editor', 'content_editor'].includes(cleaned)) return 'guide_editor';
  if (['business_owner', 'business', 'owner'].includes(cleaned)) return 'business_owner';
  return 'user';
};

export const isBusinessOwner = (role) => {
  return normalizeRole(role) === 'business_owner';
};

export const isTourist = (role) => {
  return normalizeRole(role) === 'user';
};

export const isAdminRole = (role) => {
  return ['super_admin', 'admin', 'guide_editor'].includes(normalizeRole(role));
};

export const authService = {
  getToken() {
    return localStorage.getItem('auth_token') || localStorage.getItem('token') || null;
  },

  getCurrentUser() {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  clearSession() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('user-profile-updated'));
  },

  setSession(user, token) {
    if (token) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('token', token);
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    window.dispatchEvent(new Event('user-profile-updated'));
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    if (res.success && res.data?.token) {
      const user = res.data.user;
      this.setSession(user, res.data.token);
    }
    return res;
  },

  async register(data) {
    const res = await api.post('/auth/register', data);
    if (res.success && res.data?.token) {
      const user = res.data.user;
      this.setSession(user, res.data.token);
    }
    return res;
  },

  redirectToGoogle(desiredRole = null) {
    if (desiredRole) {
      localStorage.setItem('pending_oauth_role', desiredRole);
    }
    window.location.href = GOOGLE_REDIRECT_URL;
  },

  async googleLogin(payload) {
    const res = await api.post('/auth/google', payload);
    if (res.success && res.data?.token) {
      const user = res.data.user;
      this.setSession(user, res.data.token);
    }
    return res;
  },

  async disconnectGoogle() {
    const res = await api.put('/auth/profile', {
      provider: null,
      provider_id: null,
      provider_email: null,
    });
    if (res.success && res.data) {
      const user = res.data.user || res.data;
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('user-profile-updated'));
    }
    return res;
  },

  async me() {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        const user = res.data.user || res.data;
        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new Event('user-profile-updated'));
      }
      return res;
    } catch (error) {
      if (error?.status === 401) {
        this.clearSession();
      }
      throw error;
    }
  },

  async updateProfile(data) {
    const res = await api.put('/auth/profile', data);
    if (res.success && res.data) {
      const user = res.data.user || res.data;
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('user-profile-updated'));
    }
    return res;
  },

  async updatePassword(data) {
    return await api.put('/auth/password', data);
  },

  async uploadAvatar(formData) {
    const res = await api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (res.success && res.data) {
      const user = res.data.user || res.data;
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('user-profile-updated'));
    }
    return res;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Backend logout encountered error or expired token', e);
    } finally {
      this.clearSession();
    }
  },
};

export default authService;
