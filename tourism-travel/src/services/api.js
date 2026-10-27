import axios from 'axios';

// Base API URL configuration
const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/travel';
export const ROOT_API_URL = RAW_API_URL.replace(/\/travel\/?$/, ''); // e.g. http://127.0.0.1:8000/api
export const TRAVEL_API_URL = `${ROOT_API_URL}/travel`;
export const BUSINESS_API_URL = `${ROOT_API_URL}/business`;
export const AI_CHAT_SERVICE_URL = import.meta.env.VITE_AI_CHAT_URL || 'http://127.0.0.1:8001';

const api = axios.create({
  baseURL: TRAVEL_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Patterns identifying sensitive database / server errors
const SENSITIVE_ERROR_PATTERNS = [
  /SQLSTATE/i,
  /QueryException/i,
  /PDOException/i,
  /Connection refused/i,
  /Database.*failed/i,
  /vendor\/laravel/i,
  /Stack trace:/i,
  /\.php:\d+/i,
  /Undefined variable/i,
  /Integrity constraint violation/i,
];

export function sanitizeErrorMessage(rawMessage, statusCode) {
  if (!rawMessage || typeof rawMessage !== 'string') {
    if (statusCode === 403) return 'You do not have permission to perform this action.';
    if (statusCode === 404) return 'The requested resource was not found.';
    if (statusCode >= 500) return 'A server error occurred. Please try again later.';
    return 'An unexpected error occurred.';
  }

  const isSensitive = SENSITIVE_ERROR_PATTERNS.some((pattern) => pattern.test(rawMessage));
  if (isSensitive) {
    return 'A server error occurred. Please try again later.';
  }

  return rawMessage;
}

// Attach Sanctum Bearer token to all outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status;
    const responseData = error?.response?.data;

    if (status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('user-profile-updated'));

      return Promise.reject({
        success: false,
        message: 'Your session has expired. Please sign in again.',
        status: 401,
      });
    }

    if (status === 403) {
      const sanitized = sanitizeErrorMessage(responseData?.message, 403);
      return Promise.reject({
        success: false,
        message: sanitized,
        status: 403,
      });
    }

    if (responseData) {
      const sanitizedMessage = sanitizeErrorMessage(
        responseData.message || responseData.error || responseData.errors,
        status
      );
      return Promise.reject({
        success: false,
        message: sanitizedMessage,
        errors: responseData.errors || null,
        status,
        data: responseData,
      });
    }

    return Promise.reject({
      success: false,
      message: error.message || 'Network error connecting to API server.',
      status: 0,
    });
  }
);

export default api;
