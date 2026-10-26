import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';

export default function Forbidden() {
  const navigate = useNavigate();
  const { user, role, isBusinessOwner, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const rawRole = role || user?.role || 'User';
  const roleName = String(rawRole).replace(/_/g, ' ');

  const handleBackToDashboard = () => {
    if (isBusinessOwner) {
      navigate('/business/dashboard', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setIsLoggingOut(false);
      navigate('/', { replace: true });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-alert-backdrop"
      onClick={handleBackToDashboard}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-sm w-full mx-4 p-7 relative border border-gray-100 dark:border-zinc-800 animate-alert-popup overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-5 animate-alert-icon">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center shadow-2xs">
            <ShieldAlert size={28} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white text-center mb-2 tracking-tight">
          Access Restricted
        </h3>

        {/* Message */}
        <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 text-center mb-6 leading-relaxed">
          Your account role <span className="font-bold text-gray-900 dark:text-white capitalize">({roleName})</span> does not have authorized permission to view this section.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleBackToDashboard}
            disabled={isLoggingOut}
            className="flex-1 py-3 px-4 border border-gray-200 dark:border-zinc-700 bg-gray-50/60 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 font-bold rounded-2xl transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm text-center"
          >
            {isBusinessOwner ? 'My Dashboard' : 'Return Home'}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold rounded-2xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-xs"
          >
            {isLoggingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
