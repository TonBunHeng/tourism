import { useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { normalizeRole } from '../services/authService';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProtectedRoute({ allowedRoles = ['user', 'business_owner'] }) {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  const isAuthenticated = Boolean(token && user);

  const isAllowed = useMemo(() => {
    if (!user?.role) return false;
    const userRole = normalizeRole(user.role);
    const targetRoles = (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles])
      .map(r => normalizeRole(r));
    return targetRoles.includes(userRole);
  }, [user?.role, allowedRoles]);

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <LoadingSpinner text="Checking session authorization..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAllowed) {
    return <Navigate to="/forbidden" state={{ requiredRoles: allowedRoles, currentRole: user?.role }} replace />;
  }

  return <Outlet />;
}
