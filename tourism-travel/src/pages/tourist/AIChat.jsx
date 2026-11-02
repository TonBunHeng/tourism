import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import ChatHeader from '../../components/chat/ChatHeader';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatInput from '../../components/chat/ChatInput';
import ChatMessageItem from '../../components/chat/ChatMessageItem';
import TypingIndicator from '../../components/chat/TypingIndicator';
import SettingsModal from '../../components/chat/SettingsModal';
import aiChatService from '../../services/aiChatService';
import { 
  generateSessionId, 
  createChatMessage, 
  getTopicsForLanguage,
  DEFAULT_USER_PROFILE 
} from '../../utils/chatUtils';

export default function AIChat() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Language state: 'en' | 'km'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('aichat_language') || 'en';
  });

  // Dark/Light theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return document.documentElement.classList.contains('dark') || 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // User Profile
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('aichat_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_USER_PROFILE;
  });

  // Sidebar & Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    return (
      location.state?.sessionId ||
      localStorage.getItem('aichat_last_active_session_id') ||
      generateSessionId()
    );
  });

  // Active messages
  const [messages, setMessages] = useState(() => {
    if (location.state?.messages && location.state.messages.length > 0) {
      return location.state.messages;
    }
    const initialSession =
      location.state?.sessionId ||
      localStorage.getItem('aichat_last_active_session_id');
    if (initialSession) {
      const stored = aiChatService.getChatMessages(initialSession);
      if (stored && stored.length > 0) return stored;
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorWarning, setErrorWarning] = useState(null);

  // Suggested topics rotation index for welcome screen
  const [topicsRotationIndex, setTopicsRotationIndex] = useState(0);
  const [isRefreshingTopics, setIsRefreshingTopics] = useState(false);

  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const isKm = language === 'km';
  const currentSuggestedTopics = getTopicsForLanguage(language, topicsRotationIndex);

  // Auto-scroll to bottom of messages
  const scrollToBottom = (behavior = 'smooth') => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    });
  };

  // Sync dark theme with document root
  const handleToggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', nextDark);
  };

  // Sync language
  const handleToggleLanguage = () => {
    const nextLang = language === 'en' ? 'km' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('aichat_language', nextLang);
  };

  const handleUpdateLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('aichat_language', newLang);
  };

  const handleUpdateProfile = (newProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('aichat_user_profile', JSON.stringify(newProfile));
  };

  // Load Sessions List
  const loadSessions = useCallback(async () => {
    const list = await aiChatService.getChatSessions();
    setSessions(list);
  }, []);

  // Initialize responsive layout & session loading
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    loadSessions();

    // Check Online Health
    aiChatService.getStatus().then((status) => {
      setIsOnline(status?.success !== false);
    });

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [loadSessions]);

  // Persist messages whenever they change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      aiChatService.saveChatMessages(currentSessionId, messages);
    }
  }, [currentSessionId, messages]);

  // Switch to an existing session
  const handleSelectSession = (sessionId) => {
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setCurrentSessionId(sessionId);
    localStorage.setItem('aichat_last_active_session_id', sessionId);
    const stored = aiChatService.getChatMessages(sessionId);
    setMessages(stored || []);
    setErrorWarning(null);
    scrollToBottom('auto');
  };

  // Start a new chat session
  const handleNewChat = () => {
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const newId = generateSessionId();
    setCurrentSessionId(newId);
    setMessages([]);
    setErrorWarning(null);
    localStorage.setItem('aichat_last_active_session_id', newId);
    if (isMobile) setSidebarOpen(false);
  };

  // Rename a session
  const handleRenameSession = async ({ sessionId, newTitle }) => {
    await aiChatService.renameChatSession(sessionId, newTitle);
    await loadSessions();
  };

  // Delete a session
  const handleDeleteSession = async (sessionId) => {
    await aiChatService.deleteChatSession(sessionId);
    await loadSessions();
    if (currentSessionId === sessionId) {
      handleNewChat();
    }
  };

  // Stop current streaming generation
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  // Refresh suggested topics on welcome screen
  const handleRefreshTopics = (e) => {
    e.stopPropagation();
    setIsRefreshingTopics(true);
    setTopicsRotationIndex((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshingTopics(false);
    }, 400);
  };

  // Send a message (Streaming SSE with full fallback)
  const handleSendMessage = async (textToSend, attachments = []) => {
    const trimmed = (textToSend || '').trim();
    if ((!trimmed && attachments.length === 0) || isLoading) return;

    setErrorWarning(null);

    // 1. Create and append User Message
    const userMsg = createChatMessage({
      role: 'user',
      content: trimmed,
      attachments,
    });

    const isFirstMessage = messages.length === 0;
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    scrollToBottom();

    // 2. Prepare Assistant Message Placeholder
    const assistantMsgId = `msg_${Date.now()}_assistant`;
    const initialAssistantMsg = createChatMessage({
      role: 'assistant',
      content: '',
      weather: null,
      itinerary: null,
      recommendations: null,
      currency: null,
      sources: [],
      suggestions: [],
    });
    initialAssistantMsg.id = assistantMsgId;

    setMessages([...updatedMessages, initialAssistantMsg]);
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedTokens = '';

    try {
      await aiChatService.streamMessage(
        {
          message: trimmed,
          session_id: currentSessionId,
          language,
          attachments,
          history: updatedMessages.map((m) => ({
            role: m.role || m.sender,
            content: m.content || m.message,
          })),
        },
        {
          signal: controller.signal,
          onChunk: (chunk) => {
            accumulatedTokens += chunk;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.id === assistantMsgId) {
                return [
                  ...prev.slice(0, -1),
                  {
                    ...last,
                    content: accumulatedTokens,
                    message: accumulatedTokens,
                  },
                ];
              }
              return prev;
            });
            scrollToBottom();
          },
          onSuggestions: (suggestions, topic) => {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.id === assistantMsgId) {
                return [
                  ...prev.slice(0, -1),
                  {
                    ...last,
                    suggestions: suggestions || [],
                    topic: topic || (isKm ? 'ប្រធានបទណែនាំបន្ត' : 'Suggested Topics'),
                  },
                ];
              }
              return prev;
            });
          },
          onDone: (result) => {
            setIsLoading(false);
            if (result) {
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.id === assistantMsgId) {
                  return [
                    ...prev.slice(0, -1),
                    {
                      ...last,
                      content: accumulatedTokens || result.reply || result.message || last.content,
                      message: accumulatedTokens || result.reply || result.message || last.content,
                      weather: result.weather || last.weather,
                      itinerary: result.itinerary || last.itinerary,
                      recommendations: result.recommendations || last.recommendations,
                      currency: result.currency || last.currency,
                      sources: result.sources || last.sources,
                      suggestions: result.suggestions || last.suggestions,
                    },
                  ];
                }
                return prev;
              });
            }

            // Save session title if this is the first interaction
            if (isFirstMessage) {
              aiChatService.saveSessionMetadata({
                sessionId: currentSessionId,
                title: trimmed.slice(0, 48),
                firstMessage: trimmed,
              });
              loadSessions();
            }
            scrollToBottom();
          },
          onError: (err) => {
            setIsLoading(false);
            console.warn('Stream failed or was interrupted:', err);
            setErrorWarning(
              isKm
                ? 'មិនអាចភ្ជាប់ទៅសេវាកម្ម AI AngkorVers បានទេ សូមពិនិត្យមើលការតភ្ជាប់អ៊ីនធឺណិត។'
                : 'Unable to reach AngkorVers Online AI service. Please check your internet connection and try again.'
            );
          },
        }
      );
    } catch (err) {
      if (!controller.signal.aborted) {
        setIsLoading(false);
        setErrorWarning(
          isKm
            ? 'មានបញ្ហាក្នុងការតភ្ជាប់សេវាកម្ម AI AngkorVers'
            : 'Connection Warning: Unable to reach AngkorVers AI service.'
        );
      }
    }
  };

  // Handle URL prompt parameters (e.g. ?prompt=... or ?province=...)
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    const provinceParam = searchParams.get('province');

    if (promptParam && messages.length === 0 && !isLoading) {
      const query = provinceParam 
        ? `${promptParam} (${provinceParam})` 
        : promptParam;
      handleSendMessage(query);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Regenerate last response
  const handleRegenerate = () => {
    if (isLoading || messages.length === 0) return;
    const lastUserIdx = messages.findLastIndex((m) => m.role === 'user' || m.sender === 'user');
    if (lastUserIdx >= 0) {
      const userText = messages[lastUserIdx].content || messages[lastUserIdx].message;
      const userAttachments = messages[lastUserIdx].attachments || [];
      // Truncate messages to before this interaction
      setMessages(messages.slice(0, lastUserIdx));
      handleSendMessage(userText, userAttachments);
    }
  };

  // Edit user message in place and resend from that point
  const handleEditMessage = ({ id, newText, message }) => {
    if (!newText || !newText.trim() || isLoading) return;
    const idx = messages.findIndex((m) => m.id === id);
    if (idx === -1) return;
    const currentAttachments = message?.attachments || messages[idx]?.attachments || [];
    setMessages(messages.slice(0, idx));
    handleSendMessage(newText.trim(), currentAttachments);
  };

  return (
    <div 
      lang={language}
      data-lang={language}
      className={`h-screen w-screen flex flex-col overflow-hidden bg-[#f8fafc] dark:bg-[#18181b] font-sans selection:bg-[#2563eb] selection:text-white antialiased ${
        isKm ? 'font-khmer' : ''
      }`}
    >
      
      {/* 1. Global Application Header */}
      <ChatHeader
        sidebarOpen={sidebarOpen}
        language={language}
        isOnline={isOnline}
        isDarkMode={isDarkMode}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onToggleLanguage={handleToggleLanguage}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExit={() => navigate('/')}
      />

      {/* 2. Main Workspace Body: Sidebar + Chat Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Session Sidebar */}
        <ChatSidebar
          isOpen={sidebarOpen}
          sessions={sessions}
          currentSessionId={currentSessionId}
          language={language}
          userProfile={userProfile}
          isMobile={isMobile}
          onToggle={() => setSidebarOpen((prev) => !prev)}
          onClose={() => setSidebarOpen(false)}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Central Chat View */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#fbfbfb] dark:bg-[#18181b] transition-colors duration-200">
          
          {/* Welcome Screen (when messages array is empty) */}
          {messages.length === 0 ? (
            <div className="flex-1 overflow-y-auto px-4 py-8 sm:py-12 flex flex-col justify-center items-center">
              <div className="max-w-2xl mx-auto w-full space-y-6 text-center animate-in fade-in duration-300 my-auto">
                
                {/* Country Flag + Pill Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <span className="text-sm">🇰🇭</span>
                  <span>{isKm ? 'ជំនួយការឆ្លាតវៃ AngkorVers AI' : 'AngkorVers AI Assistant'}</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
                  {isKm
                    ? 'តើខ្ញុំអាចជួយដោះស្រាយ ឬស្វែងយល់អ្វីជូនអ្នកនៅថ្ងៃនេះ?'
                    : 'What can I help you explore or solve today?'}
                </h1>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm md:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto font-normal leading-relaxed">
                  {isKm
                    ? 'ជំនួយការទេសចរណ៍ វប្បធម៌ បេតិកភណ្ឌប្រវត្តិសាស្ត្រ និងការរៀបចំគម្រោងធ្វើដំណើរទូទាំងប្រទេសកម្ពុជា'
                    : 'Dedicated travel planning, cultural heritage, historic temples, and local insights across Cambodia.'}
                </p>

                {/* Centered Composer Box */}
                <div className="pt-2">
                  <ChatInput
                    isLoading={isLoading}
                    language={language}
                    isCentered={true}
                    onSendMessage={handleSendMessage}
                    onStopGenerating={handleStopGenerating}
                  />
                </div>

                {/* Suggested Topics Section */}
                <div className="pt-4 max-w-2xl mx-auto text-left w-full space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-300">
                      <Sparkles size={12} className="text-amber-500" />
                      <span>{isKm ? 'ប្រធានបទណែនាំ' : 'Suggested Topics'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={handleRefreshTopics}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-2 py-0.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer group active:scale-95"
                      title={isKm ? 'ប្តូរសំណួរថ្មី' : 'Refresh topics'}
                    >
                      <RefreshCw
                        size={11}
                        className={`transition-transform duration-500 ${
                          isRefreshingTopics ? '-rotate-180 text-zinc-900 dark:text-white' : 'group-hover:-rotate-90'
                        }`}
                      />
                      <span>{isKm ? 'ប្តូរសំណួរ' : 'Refresh'}</span>
                    </button>
                  </div>

                  {/* 4 Topic Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentSuggestedTopics.map((item, idx) => {
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={item.id || idx}
                          type="button"
                          onClick={() => handleSendMessage(item.prompt || item.title)}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#212121] border border-zinc-200/90 dark:border-zinc-800 text-xs sm:text-[13px] text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white shadow-2xs hover:shadow-xs transition-all duration-200 active:scale-95 cursor-pointer text-left group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                            <IconComponent size={14} className="group-hover:scale-110 transition-transform duration-200" />
                          </div>
                          <span className="font-medium line-clamp-2 leading-snug">
                            {item.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* Active Messages Conversation View */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-8 bg-[#fbfbfb] dark:bg-[#18181b] transition-colors duration-200"
              >
                <div className="max-w-3xl mx-auto w-full">
                  {messages.map((msg, index) => (
                    <ChatMessageItem
                      key={msg.id || index}
                      message={msg}
                      language={language}
                      isLatest={index === messages.length - 1 && !isLoading}
                      onRegenerate={handleRegenerate}
                      onSelectSuggestion={handleSendMessage}
                      onEditMessage={handleEditMessage}
                    />
                  ))}

                  {/* Typing Indicator */}
                  {isLoading && (
                    <TypingIndicator language={language} />
                  )}

                  {/* Error Notification Banner */}
                  {errorWarning && (
                    <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
                      <AlertCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">{isKm ? 'មានបញ្ហាក្នុងការតភ្ជាប់' : 'Connection Warning'}</p>
                        <p className="text-[11px] opacity-90">{errorWarning}</p>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Bottom Sticky Input */}
              <ChatInput
                isLoading={isLoading}
                language={language}
                isCentered={false}
                onSendMessage={handleSendMessage}
                onStopGenerating={handleStopGenerating}
              />
            </div>
          )}

        </main>
      </div>

      {/* 3. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        language={language}
        userProfile={userProfile}
        isDarkMode={isDarkMode}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateLanguage={handleUpdateLanguage}
        onUpdateProfile={handleUpdateProfile}
        onToggleTheme={handleToggleTheme}
      />
    </div>
  );
}
