import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-[#003E83] dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-200/60 dark:border-blue-900/40 shadow-sm">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#003E83] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full">
            404 • Destination Not Found
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Off the Beaten Path
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
            The page or destination you are seeking seems to have wandered away into the Angkorian jungle. Let us guide you back safely.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#003E83] hover:bg-[#002e62] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
