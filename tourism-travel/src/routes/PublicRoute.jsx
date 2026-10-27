import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { normalizeRole } from '../services/authService';

export default function PublicRoute() {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (token && user) {
    const role = normalizeRole(user.role);
    if (role === 'business_owner') {
      return <Navigate to="/business/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
