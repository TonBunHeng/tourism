import { useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { normalizeRole } from '../../services/authService';

export default function OAuthCallbackHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { handleOAuthCallback } = useAuth();
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    const token = searchParams.get('token');
    const rawUser = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      showError(decodeURIComponent(error));
      // Clean query params
      window.history.replaceState({}, document.title, location.pathname);
      return;
    }

    if (token) {
      let userObj = null;
      if (rawUser) {
        try {
          userObj = JSON.parse(decodeURIComponent(rawUser));
        } catch {
          try {
            userObj = JSON.parse(rawUser);
          } catch {
            userObj = null;
          }
        }
      }

      const pendingRole = localStorage.getItem('pending_oauth_role');
      if (pendingRole) {
        localStorage.removeItem('pending_oauth_role');
        if (userObj && (!userObj.role || userObj.role === 'User' || userObj.role === 'user')) {
          userObj.role = pendingRole === 'business_owner' ? 'Business Owner' : 'User';
        }
      }

      handleOAuthCallback(token, userObj);

      // Clean query string from browser bar immediately
      window.history.replaceState({}, document.title, location.pathname);

      showSuccess(`Welcome, ${userObj?.name || 'Traveler'}! You are now signed in with Google.`, 'Google Connected');

      const role = normalizeRole(userObj?.role || pendingRole);
      if (role === 'business_owner') {
        navigate('/business/dashboard', { replace: true });
      } else if (
        location.pathname === '/login' ||
        location.pathname === '/register' ||
        location.pathname === '/auth/google/callback' ||
        location.pathname === '/auth/callback'
      ) {
        navigate('/', { replace: true });
      }
    }
  }, [searchParams, location.pathname, handleOAuthCallback, navigate, showSuccess, showError]);

  return null;
}
