import axios from 'axios';
import { clearPageCache } from '../utils/pageCache';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Patterns that identify sensitive internal errors (SQL, DB credentials, stack traces)
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

/**
 * Sanitize error messages to prevent leaking server architecture,
 * database details, file paths, or credentials to end users.
 */
function sanitizeErrorMessage(rawMessage, statusCode) {
  if (!rawMessage || typeof rawMessage !== 'string') {
    if (statusCode === 403) return 'You do not have permission to perform this action.';
    if (statusCode === 404) return 'The requested resource was not found.';
    if (statusCode >= 500) return 'A server error occurred. Please try again later.';
    return 'An unexpected error occurred.';
  }

  const isSensitive = SENSITIVE_ERROR_PATTERNS.some(pattern => pattern.test(rawMessage));
  if (isSensitive) {
    return 'A server error occurred. Please try again later.';
  }

  return rawMessage;
}

// Request interceptor to attach Bearer Auth token
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

// Response interceptor for authentication handling and error sanitization
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status;
    const responseData = error?.response?.data;

    // 401 Unauthorized: Session is expired or invalid
    if (status === 401) {
      clearApiCache();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      window.dispatchEvent(new Event('user-profile-updated'));

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      return Promise.reject({
        success: false,
        message: 'Your session has expired. Please sign in again.',
        status: 401,
      });
    }

    // 403 Forbidden: Authorized session, but insufficient privileges
    if (status === 403) {
      const sanitized = sanitizeErrorMessage(responseData?.message, 403);
      return Promise.reject({
        success: false,
        message: sanitized,
        status: 403,
      });
    }

    // Sanitize any generic or server error
    if (responseData) {
      const sanitizedMessage = sanitizeErrorMessage(responseData.message || responseData.error, status);
      return Promise.reject({
        ...responseData,
        message: sanitizedMessage,
      });
    }

    return Promise.reject({
      success: false,
      message: sanitizeErrorMessage(error?.message, status),
    });
  }
);

// Fast in-memory cache for GET requests to make page transitions instant
const apiGetCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export const clearApiCache = () => {
  apiGetCache.clear();
  clearPageCache();
};

const originalGet = api.get.bind(api);
const originalPost = api.post.bind(api);
const originalPut = api.put.bind(api);
const originalPatch = api.patch.bind(api);
const originalDelete = api.delete.bind(api);

api.get = function (url, config = {}) {
  // Option to explicitly bypass cache
  if (config.noCache || config.headers?.['Cache-Control'] === 'no-cache') {
    return originalGet(url, config);
  }

  const queryKey = config.params ? JSON.stringify(config.params) : '';
  const key = `${url}?${queryKey}`;
  const now = Date.now();

  const cached = apiGetCache.get(key);
  if (cached && now - cached.timestamp < CACHE_TTL_MS && cached.data !== undefined) {
    return Promise.resolve(cached.data);
  }

  // Deduplicate in-flight requests to the same endpoint
  if (cached?.inFlight) {
    return cached.inFlight;
  }

  const inFlightPromise = originalGet(url, config)
    .then((data) => {
      apiGetCache.set(key, { data, timestamp: Date.now() });
      return data;
    })
    .catch((err) => {
      apiGetCache.delete(key);
      throw err;
    });

  apiGetCache.set(key, { inFlight: inFlightPromise, timestamp: now });
  return inFlightPromise;
};

// Any mutation invalidates cache to ensure fresh data
api.post = function (...args) {
  clearApiCache();
  return originalPost(...args);
};

api.put = function (...args) {
  clearApiCache();
  return originalPut(...args);
};

api.patch = function (...args) {
  clearApiCache();
  return originalPatch(...args);
};

api.delete = function (...args) {
  clearApiCache();
  return originalDelete(...args);
};

export default api;

