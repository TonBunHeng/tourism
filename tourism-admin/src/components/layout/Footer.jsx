export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="h-14 w-full bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between shrink-0 transition-colors duration-200">
      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
        <span>© {currentYear} AngkorVerses</span>
        <span className="bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold text-gray-700 dark:text-zinc-300">
          v1.5
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
        <span className="w-2 h-2 rounded-md bg-emerald-500 animate-pulse" />
        <span>System Online</span>
      </div>
    </footer>
  );
}