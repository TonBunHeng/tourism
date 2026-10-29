import { Link } from 'react-router-dom';
import { ShieldAlert, Home, Briefcase, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Forbidden() {
  const { user, isBusinessOwner, isAdmin } = useAuth();
  const localHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const defaultAdminUrl = localHost
    ? `${window.location.protocol}//${window.location.hostname}:5174`
    : `${window.location.origin}/admin`;
  const adminPortalUrl = import.meta.env.VITE_ADMIN_URL || defaultAdminUrl;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto mb-5">
          <ShieldAlert size={36} />
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          403 — Access Forbidden
        </h1>

        <p className="text-sm text-slate-600 dark:text-zinc-400 mb-6 leading-relaxed">
          You do not have the required permissions to view this portal or resource with your current account role (
          <span className="font-semibold text-slate-800 dark:text-zinc-200">{user?.role || 'Guest'}</span>
          ).
        </p>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 text-xs text-slate-600 dark:text-zinc-300 mb-6 text-left space-y-1">
          <div>• <strong>Tourists / Travelers:</strong> Access exploration, bookings, and AI assistant.</div>
          <div>• <strong>Business Owners:</strong> Access business management hub at <code>/business/dashboard</code>.</div>
          <div>• <strong>Ministry Admins / Editors:</strong> Sign in through the Ministry Admin Portal.</div>
        </div>

        <div className="flex flex-col gap-2.5">
          {isBusinessOwner || isAdmin ? (
            <Link
              to="/business/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-semibold transition"
            >
              <Briefcase size={16} />
              <span>Return to Business Hub</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-semibold transition"
            >
              <Home size={16} />
              <span>Return to Tourist Home</span>
            </Link>
          )}

          <a
            href={adminPortalUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
          >
            <span>Ministry Admin Portal</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
