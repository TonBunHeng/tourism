import { Navigate, Outlet } from 'react-router-dom';
import authService from '../services/authService';

export default function PublicRoute() {
  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    // If already logged in with admin privileges, redirect away from login page to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
