import { 
  PanelLeft, 
  PanelLeftClose, 
  X, 
  WifiOff 
} from 'lucide-react';
import logoImg from '../../assets/images/tourism_logo.png';

export default function ChatHeader({
  sidebarOpen = true,
  language = 'en',
  isOnline = true,
  onToggleSidebar,
  onExit,
}) {
  const isKm = language === 'km';

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between shrink-0 z-30 transition-colors duration-200">
      {/* Left: Sidebar Toggle, Logo & Brand Title */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          title={
            sidebarOpen
              ? isKm ? 'បិទរបារចំហៀង' : 'Close Sidebar'
              : isKm ? 'បើករបារចំហៀង' : 'Open Sidebar'
          }
        >
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
        </button>

        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
            <img
              src={logoImg}
              alt="AngkorVers AI"
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div className="flex items-center space-x-2 min-w-0">
            <span className="font-bold text-sm sm:text-base tracking-tight text-zinc-900 dark:text-white truncate">
              AngkorVers AI
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 shrink-0">
              AngkorVers AI
            </span>
          </div>
        </div>
      </div>

      {/* Right: Status Pill, Language Toggle, Theme Toggle, Settings & Exit */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
        {/* Desktop Online Status Pill */}
        <div className="hidden sm:flex items-center">
          {isOnline ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Online</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs shrink-0">
              <WifiOff size={12} />
              <span>Disconnected</span>
            </div>
          )}
        </div>

        {/* Mobile Online Status Icon */}
        <div
          className="flex sm:hidden items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0"
          title={isOnline ? 'Online' : 'Disconnected'}
        >
          {isOnline ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          ) : (
            <WifiOff size={13} className="text-amber-500 dark:text-amber-400" />
          )}
        </div>

        {/* Exit / Return to Portal */}
        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            title={isKm ? 'ត្រឡប់ទៅគេហទំព័រដើម' : 'Back to Portal'}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </header>
  );
}

