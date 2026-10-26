import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import Forbidden from '../pages/error/Forbidden';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, token, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#003E83] dark:text-blue-400 animate-spin" />
          <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalize user role string
  const normRole = (role || user?.role || 'user').toLowerCase().trim().replace(/[\s/-]+/g, '_');

  if (allowedRoles && allowedRoles.length > 0) {
    const normAllowed = allowedRoles.map((r) => r.toLowerCase().trim().replace(/[\s/-]+/g, '_'));

    const isFullAdmin = ['super_admin', 'admin', 'superadmin', 'administrator'].includes(normRole);
    const hasPermission = normAllowed.includes(normRole) || isFullAdmin;

    if (!hasPermission) {
      return <Forbidden />;
    }
  }

  return <Outlet />;
}
