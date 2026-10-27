import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-5">
          <Compass size={36} />
        </div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
          404 — Page Not Found
        </h1>

        <p className="text-sm text-slate-600 dark:text-zinc-400 mb-6 leading-relaxed">
          The destination or page you are looking for has been moved or does not exist.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-semibold shadow-sm transition"
        >
          <Home size={16} />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
}
