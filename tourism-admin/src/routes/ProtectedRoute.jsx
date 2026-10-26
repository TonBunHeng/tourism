import { useEffect, useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import authService, { normalizeRole } from '../services/authService';
import Forbidden from '../pages/error/Forbidden';

const DEFAULT_ALLOWED_ROLES = [
  'super_admin', 'admin', 'guide_editor',
  'Super Admin', 'Admin', 'Guide / Editor', 'Tourism Content Editor'
];

/**
 * Check if the given role matches any allowed role.
 * Super Admin always has full access to all admin routes.
 */
const checkRolePermission = (role, allowedRoles) => {
  if (!role) return false;
  const userNorm = normalizeRole(role);
  if (userNorm === 'super_admin') return true;

  const targetRoles = allowedRoles || DEFAULT_ALLOWED_ROLES;
  const normalizedAllowed = (Array.isArray(targetRoles) ? targetRoles : [targetRoles])
    .map(r => normalizeRole(r));
  return normalizedAllowed.includes(userNorm);
};

/**
 * ProtectedRoute Guard
 * 
 * Synchronously checks authentication and permissions from cached credentials
 * so navigation between routes happens instantly with ZERO artificial loading delays.
 * Background verification syncs authoritative state without blocking the user.
 */
export default function ProtectedRoute({ allowedRoles = DEFAULT_ALLOWED_ROLES }) {
  const location = useLocation();

  // Instant synchronous authentication state from localStorage
  const token = authService.getToken();
  const [user, setUser] = useState(() => authService.getCurrentUser());

  // Only show verifying loader if a token exists but user profile has never been loaded
  const [isVerifying, setIsVerifying] = useState(() => {
    return Boolean(token && !user?.role);
  });

  const isAuthenticated = Boolean(token && user);
  const isAllowedRole = useMemo(() => {
    if (!isAuthenticated) return false;
    return checkRolePermission(user?.role, allowedRoles);
  }, [isAuthenticated, user?.role, allowedRoles]);

  useEffect(() => {
    let isMounted = true;
    const currentToken = authService.getToken();
    if (!currentToken) {
      return;
    }

    // Authoritative session verification in the background (runs once on mount, non-blocking)
    authService.me()
      .then((res) => {
        if (!isMounted) return;
        const freshUser = res?.data?.user || res?.data;
        if (freshUser) {
          setUser(freshUser);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err?.status === 401 || err?.response?.status === 401) {
          authService.clearSession();
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsVerifying(false);
        }
      });

    const handleStorageChange = () => {
      const u = authService.getCurrentUser();
      setUser(u);
      if (!authService.getToken()) {
        setIsVerifying(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-profile-updated', handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-profile-updated', handleStorageChange);
    };
  }, []); // Run on mount only to prevent repeated network delays on route navigation

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only show full-screen loader if we have a token but NO cached user data at all
  if (isVerifying && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="w-7 h-7 text-[#003E83] dark:text-blue-500 animate-spin" />
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAllowedRole) {
    return <Forbidden />;
  }

  return <Outlet />;
}
