import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, 
  PanelLeftClose, 
  Search, 
  X, 
  MessageSquare, 
  Pencil, 
  Trash2, 
  Check, 
  Settings 
} from 'lucide-react';

export default function ChatSidebar({
  isOpen = true,
  sessions = [],
  currentSessionId = null,
  language = 'en',
  userProfile = { name: 'Traveler' },
  isMobile = false,
  onToggle,
  onClose,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onOpenSettings,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [renameTitle, setRenameTitle] = useState('');
  const renameInputRef = useRef(null);

  const isKm = language === 'km';
  const travelerName = (userProfile?.name || 'Traveler').trim();
  const initialLetter = travelerName.charAt(0).toUpperCase() || 'T';

  const filteredSessions = useMemo(() => {
    if (!sessions || !Array.isArray(sessions)) return [];
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase().trim();
    return sessions.filter((s) => s.title && s.title.toLowerCase().includes(q));
  }, [sessions, searchQuery]);

  const handleStartRename = (e, session) => {
    e.stopPropagation();
    setEditingSessionId(session.session_id);
    setRenameTitle(session.title || '');
    setTimeout(() => {
      renameInputRef.current?.focus();
    }, 50);
  };

  const handleSaveRename = (sessionId) => {
    if (renameTitle.trim() && onRenameSession) {
      onRenameSession({ sessionId, newTitle: renameTitle.trim() });
    }
    setEditingSessionId(null);
    setRenameTitle('');
  };

  const handleCancelRename = () => {
    setEditingSessionId(null);
    setRenameTitle('');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        onNewChat && onNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNewChat]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && isMobile && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden cursor-pointer"
          aria-label="Close sidebar backdrop"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`flex flex-col h-full bg-[#fbfbfb] dark:bg-[#18181b] border-zinc-200 dark:border-zinc-800/80 select-none shrink-0 transition-all duration-300 ease-in-out fixed top-14 bottom-0 left-0 z-40 w-[280px] max-w-[85vw] border-r shadow-2xl md:relative md:top-0 md:bottom-auto md:left-auto md:z-10 md:max-w-none md:shadow-none md:pointer-events-auto md:translate-x-0 ${
          isOpen ? 'translate-x-0 md:w-[280px] md:border-r' : '-translate-x-full pointer-events-none md:w-0 md:border-r-0 md:overflow-hidden'
        }`}
      >
        {/* Top Actions: New Chat & Close Sidebar */}
        <div className="p-3 border-b border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onNewChat && onNewChat();
                if (isMobile) onClose && onClose();
              }}
              className="flex-1 flex items-center justify-between px-3 h-9 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs sm:text-[13px] font-semibold transition-all duration-150 shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer group"
              title={isKm ? 'កិច្ចសន្ទនាថ្មី' : 'New Chat'}
            >
              <div className="flex items-center gap-2">
                <Plus size={15} className="text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                <span>{isKm ? 'កិច្ចសន្ទនាថ្មី' : 'New Chat'}</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">⌘N</span>
            </button>

            <button
              type="button"
              onClick={onToggle}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              title={isKm ? 'បិទរបារចំហៀង' : 'Close Sidebar'}
            >
              <PanelLeftClose size={16} />
            </button>
          </div>

          {/* Search Conversations Input */}
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-2.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isKm ? 'ស្វែងរកកិច្ចសន្ទនា...' : 'Search chats...'}
              className="w-full h-8 pl-8 pr-7 rounded-lg bg-zinc-100/90 dark:bg-zinc-900 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-black text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-xs">
              <MessageSquare size={20} className="mx-auto mb-2 opacity-40" />
              <span>{isKm ? 'មិនមានប្រវត្តិសន្ទនាទេ' : 'No chats found'}</span>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isSelected = currentSessionId === session.session_id;
              const isRenaming = editingSessionId === session.session_id;

              return (
                <div
                  key={session.session_id}
                  onClick={() => {
                    onSelectSession && onSelectSession(session.session_id);
                    if (isMobile) onClose && onClose();
                  }}
                  className={`group relative flex items-center justify-between w-full h-9 px-2.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate min-w-0 flex-1 pr-1">
                    <MessageSquare size={13} className="shrink-0 opacity-70 group-hover:opacity-100" />
                    
                    {isRenaming ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSaveRename(session.session_id);
                        }}
                        className="flex-1 flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          ref={renameInputRef}
                          type="text"
                          value={renameTitle}
                          onChange={(e) => setRenameTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') handleCancelRename();
                          }}
                          className="w-full h-6 px-1.5 rounded bg-white dark:bg-zinc-900 border border-zinc-400 dark:border-zinc-600 text-xs text-zinc-900 dark:text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="text-emerald-500 hover:text-emerald-600 p-0.5 cursor-pointer"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelRename}
                          className="text-zinc-400 hover:text-zinc-600 p-0.5 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </form>
                    ) : (
                      <span className="truncate">{session.title || (isKm ? 'កិច្ចសន្ទនាថ្មី' : 'New Chat')}</span>
                    )}
                  </div>

                  {!isRenaming && (
                    <div
                      className="items-center space-x-0.5 hidden group-hover:flex shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => handleStartRename(e, session)}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        title={isKm ? 'ប្តូរឈ្មោះ' : 'Rename'}
                      >
                        <Pencil size={11} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(isKm ? 'តើអ្នកប្រាកដជាចង់លុបកិច្ចសន្ទនានេះមែនទេ?' : 'Delete this chat?')) {
                            onDeleteSession && onDeleteSession(session.session_id);
                          }
                        }}
                        className="p-1 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        title={isKm ? 'លុបកិច្ចសន្ទនា' : 'Delete'}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer: User Profile & Settings */}
        <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#002D62] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {initialLetter}
              </div>
              <div className="truncate">
                <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 block truncate leading-tight">
                  {travelerName}
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block truncate">
                  AngkorVers AI Assistant
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenSettings}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-700/60 transition-colors cursor-pointer shrink-0"
              title={isKm ? 'ការកំណត់' : 'Settings'}
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

