import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, 
  MoreHorizontal, 
  Maximize2, 
  RotateCcw, 
  Copy, 
  Check, 
  CloudSun,
  DollarSign,
  Sparkles,
  RefreshCw,
  Plus,
  ArrowUp,
  Square,
  Pencil,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Search,
  MapPin
} from 'lucide-react';
import GenieAvatar from './GenieAvatar';
import MarkdownMessage from './MarkdownMessage';
import aiChatService from '../../services/aiChatService';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { 
  generateSessionId, 
  createChatMessage,
  formatSuggestedTopic,
  getLocalDynamicSuggestions,
  CAMBODIA_PROVINCES
} from '../../utils/chatUtils';

export default function AngkorGenieFloatingWidget() {
  useAuth();
  const { showSuccess } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(generateSessionId);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showToolsModal, setShowToolsModal] = useState(false);
  const [initialSuggestions, setInitialSuggestions] = useState(() => getLocalDynamicSuggestions().suggestions);
  const [isRefreshingInitial, setIsRefreshingInitial] = useState(false);
  const [refreshingMsgIndex, setRefreshingMsgIndex] = useState(null);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [lastUserPrompt, setLastUserPrompt] = useState('');

  // Weather & Currency quick state
  const [weatherCity, setWeatherCity] = useState('Siem Reap');
  const [weatherSearchQuery, setWeatherSearchQuery] = useState('Siem Reap');
  const [showWeatherSuggestions, setShowWeatherSuggestions] = useState(false);
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [usdVal, setUsdVal] = useState(20);
  const [khrVal, setKhrVal] = useState(82000);

  const filteredProvinces = useMemo(() => {
    const q = weatherSearchQuery.trim().toLowerCase();
    if (!q) return CAMBODIA_PROVINCES;
    return CAMBODIA_PROVINCES.filter((p) => p.toLowerCase().includes(q));
  }, [weatherSearchQuery]);

  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const chatScrollContainerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const inputRef = useRef(null);

  // Hide the floating widget if user is already on the dedicated /ai-chat page
  const isAIChatPage = location.pathname === '/ai-chat';

  // Scroll to bottom only when there are conversation messages or loading
  useEffect(() => {
    if (isOpen && (messages.length > 0 || isLoading)) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Keep scroll at top on initial open with empty messages so header is never cut off
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (chatScrollContainerRef.current) {
        chatScrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, messages.length]);

  // Close options menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Fetch dynamic initial suggested topics
  const fetchInitialSuggestions = async (refresh = false) => {
    setIsRefreshingInitial(true);
    try {
      const currentTexts = initialSuggestions.map((s) => s.text);
      const res = await aiChatService.getSuggestions({
        refresh,
        currentSuggestions: currentTexts,
        language: 'en',
      });
      if (res?.suggestions?.length > 0) {
        setInitialSuggestions(res.suggestions.map(formatSuggestedTopic).filter(Boolean));
      }
    } catch {
      // Fallback already provided by getLocalDynamicSuggestions
    } finally {
      setIsRefreshingInitial(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInitialSuggestions(false);
    }
  }, [isOpen]);

  const handleRefreshInitialTopics = () => {
    fetchInitialSuggestions(true);
  };

  // Refresh dynamic suggestions for a specific assistant message
  const handleRefreshMessageSuggestions = async (msgIndex, msg) => {
    if (refreshingMsgIndex !== null) return;
    setRefreshingMsgIndex(msgIndex);

    try {
      let userPrompt = lastUserPrompt;
      for (let i = msgIndex - 1; i >= 0; i--) {
        if (messages[i]?.role === 'user') {
          userPrompt = messages[i].content;
          break;
        }
      }

      const currentTexts = (msg.suggestions || []).map((s) => (typeof s === 'string' ? s : s.text || s.query || ''));
      const res = await aiChatService.getSuggestions({
        message: userPrompt,
        answer: msg.content,
        sessionId,
        refresh: true,
        currentSuggestions: currentTexts,
        language: 'en',
      });

      if (res?.suggestions?.length > 0) {
        const formatted = res.suggestions.map(formatSuggestedTopic).filter(Boolean);
        setMessages((prev) =>
          prev.map((m, idx) => (idx === msgIndex ? { ...m, suggestions: formatted } : m))
        );
      }
    } catch {
      // ignore
    } finally {
      setRefreshingMsgIndex(null);
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (textToSend = null) => {
    const prompt = (textToSend || inputValue).trim();
    if (!prompt || isLoading) return;

    setLastUserPrompt(prompt);

    const userMsg = createChatMessage({
      role: 'user',
      content: prompt,
    });

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await aiChatService.sendMessage({
        message: prompt,
        sessionId,
        language: 'en',
      });

      const replyContent = res?.reply || res?.response || res?.message || res?.data?.response || res?.data?.message || 'Thank you for asking! Cambodia offers breathtaking heritage, especially in Siem Reap and Phnom Penh.';

      // Format dynamic suggestions from AI chatbot response, or derive contextual dynamic suggestions
      const rawSuggestions = res?.suggestions || [];
      const formattedSuggestions = rawSuggestions.length > 0
        ? rawSuggestions.map(formatSuggestedTopic).filter(Boolean)
        : getLocalDynamicSuggestions({ message: prompt, answer: replyContent }).suggestions;

      const botMsg = createChatMessage({
        role: 'assistant',
        content: replyContent,
        suggestions: formattedSuggestions,
        sources: res?.sources || [],
      });

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      if (err.name === 'AbortError') return;
      const errorMsg = createChatMessage({
        role: 'assistant',
        isError: true,
        content: err.message || 'I am currently unable to reach the travel intelligence service. Please check your connection or retry in a moment.',
      });
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleResetSession = () => {
    setSessionId(generateSessionId());
    setMessages([]);
    setIsMenuOpen(false);
    setFeedbackMap({});
    fetchInitialSuggestions(true);
  };

  const handleCopyText = (text, index) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      showSuccess('Response copied to clipboard!');
    }
  };

  const handleRegenerate = (botMsgIndex) => {
    if (isLoading) return;
    let promptToResend = lastUserPrompt;
    for (let i = botMsgIndex - 1; i >= 0; i--) {
      if (messages[i]?.role === 'user') {
        promptToResend = messages[i].content;
        break;
      }
    }
    if (promptToResend) {
      handleSendMessage(promptToResend);
    }
  };

  const handleRetry = () => {
    if (lastUserPrompt && !isLoading) {
      handleSendMessage(lastUserPrompt);
    }
  };

  const handleFeedback = (idx, type) => {
    setFeedbackMap((prev) => ({
      ...prev,
      [idx]: prev[idx] === type ? null : type,
    }));
    showSuccess(type === 'up' ? 'Feedback saved: Helpful response!' : 'Feedback saved: Thank you for helping us improve.');
  };

  const fetchWeather = async (city) => {
    setWeatherCity(city);
    try {
      const res = await aiChatService.getWeather(city);
      const raw = res?.data || res;
      const current = raw?.current || {};
      const tempNum = current.temperature_c ?? raw?.temperature_c ?? current.temp_c ?? raw?.temp;
      const humNum = current.humidity_percent ?? raw?.humidity_pct ?? current.humidity ?? raw?.humidity_percent;

      setWeatherInfo({
        province: raw?.province || city,
        temperature: raw?.temperature || (tempNum !== undefined ? `${tempNum}°C` : '31°C'),
        condition: raw?.condition || current.condition || 'Partly Sunny',
        humidity: raw?.humidity || (humNum !== undefined ? `${humNum}%` : '70%'),
      });
    } catch {
      setWeatherInfo({
        province: city,
        temperature: '31°C',
        condition: 'Partly Sunny',
        humidity: '70%',
      });
    }
  };

  const handleConvertCurrency = async (val) => {
    setUsdVal(val);
    try {
      const res = await aiChatService.convertCurrency(val, 'USD', 'KHR');
      if (res?.success && res.data?.converted_amount) {
        setKhrVal(res.data.converted_amount);
      } else {
        setKhrVal(Math.round(val * 4100));
      }
    } catch {
      setKhrVal(Math.round(val * 4100));
    }
  };

  if (isAIChatPage) {
    return null; // Don't show floating widget when on /ai-chat page
  }

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open AngkorGenie AI Assistant"
            className="group relative flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-none"
          >
            {/* Glowing pulse halo */}
            <span className="absolute -inset-1.5 rounded-full bg-blue-500/30 animate-pulse blur-xs" />
            <span className="absolute -inset-3 rounded-full bg-blue-600/15 animate-ping pointer-events-none" />

            {/* Genie circular avatar with GENIE badge */}
            <GenieAvatar size={66} showBadge={true} className="drop-shadow-[0_12px_24px_rgba(29,78,216,0.45)]" />

            {/* Hover Tooltip */}
            <span className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg backdrop-blur-xs">
              Chat with AngkorGenie
            </span>
          </button>
        </div>
      )}

      {/* Floating Drawer / Card Widget */}
      {isOpen && (
        <div 
          className="fixed bottom-5 right-5 z-50 w-[94vw] sm:w-[460px] md:w-[480px] h-[640px] max-h-[88vh] bg-[#f8fafc] dark:bg-[#18181b] rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans text-zinc-900 dark:text-zinc-100"
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 shrink-0">
            <div className="flex items-center gap-2.5">
              <GenieAvatar size={34} showBadge={false} />
              <div>
                <div className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 leading-none">
                  <span>AngkorGenie</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 mt-0.5">
                  Travel Assistant
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Expand to Full Page */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/ai-chat', { state: { sessionId, messages } });
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Full Screen"
              >
                <Maximize2 size={16} />
              </button>

              {/* More options menu */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  title="More Options"
                >
                  <MoreHorizontal size={18} />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-xl py-1.5 z-20 text-xs">
                    <button
                      type="button"
                      onClick={handleResetSession}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-700/60 flex items-center gap-2 text-slate-700 dark:text-zinc-200 font-semibold cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      <span>Start New Chat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowToolsModal(true);
                        setIsMenuOpen(false);
                        if (!weatherInfo) fetchWeather('Siem Reap');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-700/60 flex items-center gap-2 text-slate-700 dark:text-zinc-200 font-semibold cursor-pointer"
                    >
                      <CloudSun size={14} />
                      <span>Weather & Currency</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/ai-chat', { state: { sessionId, messages } });
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-700/60 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold cursor-pointer"
                    >
                      <Maximize2 size={14} />
                      <span>Open Full Screen</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer ml-0.5"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Body & Scroll Area */}
          <div ref={chatScrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 flex flex-col">
            {/* If no chat messages yet, show the full screen style hero */}
            {messages.length === 0 ? (
              <div className="my-auto space-y-5 text-center animate-in fade-in duration-300">
                {/* 1. Country Flag + Assistant Capsule Pill Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mx-auto">
                  <span className="text-sm">🇰🇭</span>
                  <span>AngkorVers AI Assistant</span>
                </div>

                {/* 2. Primary Headline */}
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
                  What can I help you explore or solve today?
                </h1>

                {/* 3. Subtitle Description */}
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal max-w-sm mx-auto">
                  General intelligence, programming, math, translation, and deep Cambodia expertise.
                </p>

                {/* 4. Center Input Composer Box */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus-within:border-zinc-400 dark:focus-within:border-zinc-500 focus-within:shadow-md bg-white dark:bg-zinc-900 shadow-sm px-3.5 py-2 flex items-center gap-2.5 transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowToolsModal(true);
                      if (!weatherInfo) fetchWeather('Siem Reap');
                    }}
                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer shrink-0"
                    title="Explore Travel Tools & Resources"
                  >
                    <Plus size={18} />
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Message AngkorVers AI..."
                    className="flex-1 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 bg-transparent focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    aria-label="Send Message"
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      inputValue.trim() && !isLoading
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-zinc-200 shadow-xs'
                        : 'bg-zinc-300 dark:bg-zinc-700 text-white dark:text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUp size={15} />
                  </button>
                </form>

                {/* 5. Suggested Topics Section Header */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between text-xs px-1">
                    <div className="flex items-center gap-1.5 font-bold tracking-wider text-amber-500 uppercase text-[10px]">
                      <Sparkles size={13} className="fill-amber-500" />
                      <span>SUGGESTED TOPICS</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRefreshInitialTopics}
                      disabled={isRefreshingInitial}
                      className="flex items-center gap-1.5 font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer text-xs"
                    >
                      <RefreshCw size={11} className={isRefreshingInitial ? 'animate-spin' : ''} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {/* 6. Suggestion Cards 2x2 Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                    {initialSuggestions.map((item, idx) => {
                      const IconComponent = item.icon || Sparkles;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(item.query || item.text)}
                          className="w-full p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs flex items-center gap-2.5 transition-all cursor-pointer group"
                        >
                          <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-white transition shrink-0">
                            <IconComponent size={15} />
                          </div>
                          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition line-clamp-1">
                            {item.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Message Thread (Matching Full Screen conversation layout) */
              <div className="space-y-5 max-w-full pb-2">
                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  return isUser ? (
                    /* User Message: Right-Aligned Dark Bubble with action icons beneath */
                    <div key={msg.id} className="flex flex-col items-end space-y-1">
                      <div className="bg-[#1e232a] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs sm:text-sm font-normal leading-relaxed shadow-xs max-w-[85%] whitespace-pre-wrap">
                        {msg.content}
                      </div>
                      {/* Copy & Edit icons */}
                      <div className="flex items-center gap-2 pr-1 text-zinc-400">
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.content, idx)}
                          className="p-1 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
                          title="Copy prompt"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputValue(msg.content);
                            inputRef.current?.focus();
                          }}
                          className="p-1 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
                          title="Edit prompt"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Assistant Message: Clean natural canvas flow with embedded topics & toolbar */
                    <div key={msg.id} className="w-full space-y-3 text-xs sm:text-sm">
                      {msg.isError ? (
                        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 space-y-2">
                          <div className="flex items-start gap-2">
                            <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                            <span className="leading-relaxed">{msg.content}</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRetry}
                            className="px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 hover:bg-rose-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <RotateCcw size={11} />
                            <span>Retry Question</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Rich Markdown Response */}
                          <MarkdownMessage content={msg.content} />

                          {/* Embedded Suggested Topics Card Container */}
                          {(() => {
                            const messageTopics = (msg.suggestions && msg.suggestions.length > 0)
                              ? msg.suggestions.map(formatSuggestedTopic).filter(Boolean)
                              : initialSuggestions;

                            if (!messageTopics || messageTopics.length === 0) return null;
                            const isThisRefreshing = refreshingMsgIndex === idx;

                            return (
                              <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 p-3 mt-3 space-y-2.5">
                                <div className="flex items-center justify-between text-xs px-0.5">
                                  <div className="flex items-center gap-1 font-bold tracking-wider text-amber-500 uppercase text-[10px]">
                                    <Sparkles size={12} className="fill-amber-500" />
                                    <span>SUGGESTED TOPICS</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRefreshMessageSuggestions(idx, msg)}
                                    disabled={isThisRefreshing}
                                    className="flex items-center gap-1 font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer text-[11px]"
                                  >
                                    <RefreshCw size={11} className={isThisRefreshing ? 'animate-spin' : ''} />
                                    <span>Refresh</span>
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {messageTopics.map((item, tIdx) => {
                                    const IconComponent = item.icon || Sparkles;
                                    return (
                                      <button
                                        key={tIdx}
                                        type="button"
                                        onClick={() => handleSendMessage(item.query || item.text)}
                                        className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs flex items-center gap-2 transition-all cursor-pointer text-left group"
                                      >
                                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-white transition shrink-0">
                                          <IconComponent size={14} />
                                        </div>
                                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition line-clamp-1">
                                          {item.text}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Toolbar below: Copy, Retry, Thumbs Up, Thumbs Down */}
                          <div className="flex items-center gap-2 pt-0.5 text-zinc-400 text-xs">
                            <button
                              type="button"
                              onClick={() => handleCopyText(msg.content, idx)}
                              className="p-1 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
                              title="Copy response"
                            >
                              {copiedIndex === idx ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRegenerate(idx)}
                              className="p-1 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
                              title="Regenerate"
                            >
                              <RotateCcw size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFeedback(idx, 'up')}
                              className={`p-1 rounded-md transition cursor-pointer ${
                                feedbackMap[idx] === 'up' ? 'text-blue-600' : 'hover:text-zinc-700 dark:hover:text-zinc-200'
                              }`}
                              title="Good response"
                            >
                              <ThumbsUp size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFeedback(idx, 'down')}
                              className={`p-1 rounded-md transition cursor-pointer ${
                                feedbackMap[idx] === 'down' ? 'text-rose-600' : 'hover:text-zinc-700 dark:hover:text-zinc-200'
                              }`}
                              title="Bad response"
                            >
                              <ThumbsDown size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Thinking / Generating State Pill */}
                {isLoading && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
                    <span>AngkorVers AI is thinking...</span>
                    <span className="flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-zinc-400 animate-pulse" />
                      <span className="w-1 h-1 rounded-full bg-zinc-400 animate-pulse" style={{ animationDelay: '200ms' }} />
                      <span className="w-1 h-1 rounded-full bg-zinc-400 animate-pulse" style={{ animationDelay: '400ms' }} />
                    </span>
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Message Composer (Only visible once conversation is active) */}
          {messages.length > 0 && (
            <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus-within:border-zinc-400 dark:focus-within:border-zinc-500 focus-within:shadow-md bg-white dark:bg-zinc-900 shadow-sm px-3.5 py-2 flex items-center gap-2.5 transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowToolsModal(true);
                    if (!weatherInfo) fetchWeather('Siem Reap');
                  }}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer shrink-0"
                  title="Explore Travel Tools & Resources"
                >
                  <Plus size={18} />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Message AngkorVers AI..."
                  className="flex-1 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 bg-transparent focus:outline-none"
                />

                {isLoading ? (
                  <button
                    type="button"
                    onClick={handleStopGenerating}
                    aria-label="Stop Generating"
                    className="w-7 h-7 rounded-full bg-zinc-900 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                    title="Stop generating"
                  >
                    <Square size={10} className="fill-white" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    aria-label="Send Message"
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      inputValue.trim()
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-zinc-200 shadow-xs'
                        : 'bg-zinc-300 dark:bg-zinc-700 text-white dark:text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUp size={15} />
                  </button>
                )}
              </form>
              <div className="text-center text-[10px] text-zinc-400 dark:text-zinc-500 mt-1.5">
                AngkorVers AI can make mistakes. Verify important facts.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weather & Currency Tools Modal */}
      {showToolsModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CloudSun size={18} className="text-amber-500" />
                <span>Travel Tools: Weather & Currency</span>
              </div>
              <button
                type="button"
                onClick={() => setShowToolsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* City Weather Search */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Search Cambodia Province Weather
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (weatherSearchQuery.trim()) {
                    fetchWeather(weatherSearchQuery.trim());
                    setShowWeatherSuggestions(false);
                  }
                }}
                className="relative flex items-center gap-1.5"
              >
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={weatherSearchQuery}
                    onChange={(e) => {
                      setWeatherSearchQuery(e.target.value);
                      setShowWeatherSuggestions(true);
                    }}
                    onFocus={() => setShowWeatherSuggestions(true)}
                    placeholder="Search province or city..."
                    className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  {weatherSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setWeatherSearchQuery('');
                        setShowWeatherSuggestions(false);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shrink-0"
                >
                  <Search size={13} />
                </button>
              </form>

              {/* Autocomplete dropdown for widget */}
              {showWeatherSuggestions && filteredProvinces.length > 0 && weatherSearchQuery.trim() && (
                <div className="relative z-20">
                  <div className="absolute top-0.5 left-0 right-0 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-lg max-h-36 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-700">
                    {filteredProvinces.map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => {
                          setWeatherSearchQuery(prov);
                          fetchWeather(prov);
                          setShowWeatherSuggestions(false);
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs text-slate-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-1.5 cursor-pointer"
                      >
                        <MapPin size={11} className="text-slate-400" />
                        <span>{prov}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick chips */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-xs">
                {['Siem Reap', 'Phnom Penh', 'Sihanoukville', 'Battambang', 'Kampot'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setWeatherSearchQuery(city);
                      fetchWeather(city);
                      setShowWeatherSuggestions(false);
                    }}
                    className={`py-1 px-2.5 rounded-full border text-[11px] font-medium whitespace-nowrap transition cursor-pointer ${
                      weatherCity.toLowerCase() === city.toLowerCase()
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                        : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
              {weatherInfo && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{weatherInfo.province}</span>
                    <span className="block text-slate-500 dark:text-zinc-400">{weatherInfo.condition}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-amber-500">{weatherInfo.temperature}</span>
                    <span className="block text-[10px] text-slate-400">Humidity {weatherInfo.humidity}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Currency Converter */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                <DollarSign size={13} className="text-emerald-500" />
                <span>USD to Cambodian Riel (KHR)</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    value={usdVal}
                    onChange={(e) => handleConvertCurrency(Number(e.target.value) || 0)}
                    className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <span className="text-xs font-bold text-slate-400">=</span>
                <div className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-right text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {khrVal.toLocaleString()} ៛
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
