import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import authService from '../../services/authService';
import { formatRoleLabel } from '../../utils/StatusUtils';

export default function Forbidden() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const currentUser = authService.getCurrentUser();
  const rawRole = currentUser?.role || 'Unknown Role';
  const roleName = formatRoleLabel(rawRole);

  const handleBackToDashboard = () => {
    if (authService.hasAdminRole()) {
      navigate('/dashboard', { replace: true });
    } else {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      authService.clearSession();
      setIsLoggingOut(false);
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleBackToDashboard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-alert-backdrop"
      onClick={handleBackToDashboard}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-[#18181b] rounded-md shadow-2xl max-w-sm w-full mx-4 p-6 relative border border-gray-200 dark:border-zinc-800 animate-alert-popup overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-5 animate-alert-icon">
          <div className="w-14 h-14 rounded-md bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center">
            <ShieldAlert size={24} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2 tracking-tight">
          Access Denied
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-500 dark:text-zinc-400 text-center mb-6 leading-relaxed">
          Your account role <span className="font-semibold text-gray-900 dark:text-white">({roleName})</span> does not have sufficient administrative privileges to access this area.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          {authService.hasAdminRole() && (
            <button
              type="button"
              onClick={handleBackToDashboard}
              disabled={isLoggingOut}
              className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-zinc-800 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800/80 text-gray-700 dark:text-zinc-300 font-medium rounded-md transition-colors cursor-pointer disabled:opacity-50 text-sm text-center"
            >
              Back to Dashboard
            </button>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm"
          >
            {isLoggingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
