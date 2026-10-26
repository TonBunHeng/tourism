import { LogOut, Compass, CalendarCheck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfileHeader({ onLogout }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200/80 dark:border-zinc-800">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-400 text-xs font-bold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Traveler Profile</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          My Account & Travel Identity
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Manage your personal details, travel preferences, and account security
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <Link
          to="/trips"
          className="px-4 py-2 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 text-xs font-bold transition-all flex items-center gap-2 shadow-2xs"
        >
          <Compass className="w-3.5 h-3.5 text-[#003E83] dark:text-blue-400" />
          <span>My Trips</span>
        </Link>
        <Link
          to="/bookings"
          className="px-4 py-2 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 text-xs font-bold transition-all flex items-center gap-2 shadow-2xs"
        >
          <CalendarCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Bookings</span>
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-all cursor-pointer shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
