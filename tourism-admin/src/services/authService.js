import api, { clearApiCache } from './api';

export const normalizeRole = (role) => {
  if (!role) return 'user';
  const cleaned = String(role).toLowerCase().trim().replace(/[\s/-]+/g, '_');
  if (['super_admin', 'superadmin'].includes(cleaned)) return 'super_admin';
  if (['admin', 'administrator'].includes(cleaned)) return 'admin';
  if (['guide_editor', 'guide', 'editor', 'tourism_content_editor', 'content_editor'].includes(cleaned)) return 'guide_editor';
  if (['business_owner', 'business', 'owner'].includes(cleaned)) return 'business_owner';
  return cleaned;
};

export const isAdminRole = (role) => {
  const norm = normalizeRole(role);
  return ['super_admin', 'admin', 'guide_editor'].includes(norm);
};

export const isFullAdminRole = (role) => {
  const norm = normalizeRole(role);
  return ['super_admin', 'admin'].includes(norm);
};

export const isSuperAdminRole = (role) => {
  const norm = normalizeRole(role);
  return norm === 'super_admin';
};

export const authService = {
  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    if (res.success && res.data?.token) {
      const user = res.data.user;
      
      // Verify user has admin permissions
      if (user && !isAdminRole(user.role)) {
        this.clearSession();
        return {
          success: false,
          message: 'Access denied. Administrator privileges required.',
        };
      }

      localStorage.setItem('auth_token', res.data.token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('user-profile-updated'));
    }
    return res;
  },

  async register(data) {
    const res = await api.post('/auth/register', data);
    if (res.success && res.data?.token) {
      localStorage.setItem('auth_token', res.data.token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.dispatchEvent(new Event('user-profile-updated'));
    }
    return res;
  },

  async me() {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        localStorage.setItem('user', JSON.stringify(res.data));
        window.dispatchEvent(new Event('user-profile-updated'));
      }
      return res;
    } catch (error) {
      if (error?.status === 401 || error?.response?.status === 401) {
        this.clearSession();
      }
      throw error;
    }
  },

  async updateProfile(data) {
    const res = await api.put('/auth/profile', data);
    if (res.success && res.data) {
      localStorage.setItem('user', JSON.stringify(res.data));
      window.dispatchEvent(new Event('user-profile-updated'));
    }
    return res;
  },

  async updateAvatar(imageData) {
    let payload = imageData;
    if (typeof imageData === 'string' || imageData === null) {
      payload = { avatar: imageData, image: imageData };
    }
    const res = await api.post('/auth/avatar', payload);
    if (res.success && res.data) {
      localStorage.setItem('user', JSON.stringify(res.data));
      window.dispatchEvent(new Event('user-profile-updated'));
    }
    return res;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore API errors on logout
    } finally {
      this.clearSession();
    }
  },

  clearSession() {
    clearApiCache();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    window.dispatchEvent(new Event('user-profile-updated'));
  },

  getToken() {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
      return null;
    }
    return token;
  },

  isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return Boolean(token && user && this.hasAdminRole());
  },

  hasAdminRole() {
    const user = this.getCurrentUser();
    if (!user || !user.role) return false;
    return isAdminRole(user.role);
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  }
};

export default authService;
