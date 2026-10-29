import { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';

export const GoogleIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export default function GoogleButton({
  text = 'Continue with Google',
  role = 'user',
  onClick,
  isLoading = false,
  disabled = false,
  variant = 'default',
  size = 'md',
  className = '',
}) {
  const { redirectToGoogle } = useAuth();
  const { showError } = useAlert();
  const [internalLoading, setInternalLoading] = useState(false);
  const isNavigatingRef = useRef(false);

  const loading = isLoading || internalLoading;

  const handleClick = async (e) => {
    if (loading || disabled || isNavigatingRef.current) return;

    if (onClick) {
      onClick(e);
      return;
    }

    // Default: Redirect to Google OAuth endpoint
    try {
      isNavigatingRef.current = true;
      setInternalLoading(true);
      redirectToGoogle(role);
    } catch (err) {
      isNavigatingRef.current = false;
      setInternalLoading(false);
      showError(err.message || 'Could not initiate Google authentication.');
    }
  };

  const sizeClasses = {
    sm: 'py-2 px-3 text-xs gap-2',
    md: 'py-2.5 px-4 text-xs sm:text-sm gap-3',
    lg: 'py-3.5 px-6 text-sm sm:text-base gap-3.5',
  }[size] || 'py-2.5 px-4 text-xs sm:text-sm gap-3';

  const variantClasses = {
    default: 'bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 shadow-xs hover:border-slate-400 dark:hover:border-zinc-600',
    outline: 'bg-transparent hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700',
    connected: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800',
  }[variant] || 'bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 shadow-xs';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || disabled}
      className={`w-full rounded-2xl font-bold transition-all duration-200 flex items-center justify-center cursor-pointer select-none active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin text-slate-500 dark:text-zinc-400" />
      ) : (
        <GoogleIcon className="w-5 h-5 shrink-0" />
      )}
      <span className="truncate">{loading ? 'Connecting to Google...' : text}</span>
    </button>
  );
}
