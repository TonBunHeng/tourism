import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import authService from '../../services/authService';

export default function LogoutAlert({ isOpen, onClose, onLogout }) {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      if (onLogout) {
        onLogout();
      }
      setIsLoggingOut(false);
      onClose();
      navigate('/login', { replace: true });
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      <div 
        className="bg-white dark:bg-[#18181b] rounded-md shadow-2xl max-w-sm w-full mx-4 p-6 relative border border-gray-200 dark:border-zinc-800 animate-alert-popup overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-5 animate-alert-icon">
          <div className="w-14 h-14 rounded-md bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center">
            <LogOut size={24} />
          </div>
        </div>

        {/* Title */}
        <h3 id="logout-modal-title" className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2 tracking-tight">
          Logout Confirmation
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-500 dark:text-zinc-400 text-center mb-6 leading-relaxed">
          Are you sure you want to log out of your account?
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-zinc-800 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800/80 text-gray-700 dark:text-zinc-300 font-medium rounded-md transition-colors cursor-pointer disabled:opacity-50 text-sm"
          >
            Cancel
          </button>
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
